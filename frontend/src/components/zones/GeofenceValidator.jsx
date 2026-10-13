import React, { useState } from 'react';
import { Card } from '../ui/card.jsx';
import { Button } from '../ui/button.jsx';
import { CheckCircle2, AlertTriangle, Navigation, MapPin, Loader2 } from 'lucide-react';

export function GeofenceValidator() {
  const [lat, setLat] = useState('-6.1850');
  const [lng, setLng] = useState('106.8150');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleTestPostGIS = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/v1/geofence/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: Number(lat), lng: Number(lng) }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setResult(data.data);
      } else {
        setResult({ insideZone: false, matchingZones: [] });
      }
    } catch (err) {
      console.error('Error testing PostGIS geofence:', err);
      setResult({ insideZone: false, matchingZones: [] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4 sm:p-6 border-slate-200 bg-white shadow-sm rounded-2xl space-y-4">
      <div className="flex items-center justify-between border-b pb-3">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
          <Navigation className="h-5 w-5 text-teal-600" /> Uji Validasi Geofence Spasial (PostGIS RPC check_geofence)
        </h3>
        <span className="text-[10px] font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-0.5 rounded-full">
          ST_Contains(boundary_polygon, point)
        </span>
      </div>

      <form onSubmit={handleTestPostGIS} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Latitude WGS84</label>
            <input
              type="text"
              required
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-mono font-bold text-slate-900 focus:border-teal-600"
              placeholder="contoh: -6.1850"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Longitude WGS84</label>
            <input
              type="text"
              required
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-mono font-bold text-slate-900 focus:border-teal-600"
              placeholder="contoh: 106.8150"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading || !lat || !lng}
          className="w-full py-2.5 text-xs font-bold shadow-md bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Memproses Query PostGIS Spatial...</span>
            </>
          ) : (
            <>
              <MapPin className="h-4 w-4" />
              <span>Uji Validasi Geofence PostGIS Real</span>
            </>
          )}
        </Button>
      </form>

      {result && (
        <div className={`p-4 rounded-2xl border text-xs space-y-1.5 font-mono animate-in fade-in ${
          result.insideZone ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          <div className="font-bold text-sm flex items-center gap-2">
            {result.insideZone ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            )}
            <span>{result.insideZone ? 'Titik Berada Di Dalam Geofence Valid' : 'Titik Berada Di Luar Seluruh Geofence Zona'}</span>
          </div>

          {result.matchingZones && result.matchingZones.length > 0 && (
            <div className="pt-1 text-[11px] font-sans">
              <strong>Zona Terdeteksi:</strong> {result.matchingZones.map((z) => z.name || z.id).join(', ')}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
