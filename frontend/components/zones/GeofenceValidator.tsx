'use client';

import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { CheckCircle2, Terminal } from 'lucide-react';

export function GeofenceValidator() {
  const [lat, setLat] = useState('-6.185');
  const [lng, setLng] = useState('106.815');
  const [result, setResult] = useState<any>(null);

  const handleTest = () => {
    setResult({
      zoneName: 'Zona A - Pasar Tanah Abang',
      inside: true,
      distanceMeter: 0,
      postgisFunction: 'ST_Contains(boundary_polygon, ST_Point(lng, lat, 4326))',
    });
  };

  return (
    <Card className="p-6 bg-white border-slate-200">
      <h3 className="text-base font-bold text-slate-800 mb-2">Section 3 — Panel Validasi Lokasi (Uji PostGIS)</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-3">
        <div>
          <label className="text-xs font-semibold text-slate-600">Latitude</label>
          <input
            type="text"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            className="w-full border rounded-xl p-2 text-xs mt-1 font-mono"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600">Longitude</label>
          <input
            type="text"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            className="w-full border rounded-xl p-2 text-xs mt-1 font-mono"
          />
        </div>
        <div className="flex items-end">
          <Button onClick={handleTest} className="w-full text-xs">
            Cek Validasi RPC PostGIS
          </Button>
        </div>
      </div>

      {result && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-mono space-y-1.5 mt-3">
          <div className="flex items-center gap-2 font-bold text-emerald-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Status: Berada dalam poligon {result.zoneName}</span>
          </div>
          <div>📍 Distance: {result.distanceMeter}m ke centroid</div>
          <div className="flex items-center gap-1.5 text-slate-700 bg-white p-2 rounded-lg border border-emerald-100">
            <Terminal className="h-3.5 w-3.5 text-slate-500 shrink-0" />
            <code>SELECT name FROM zones WHERE {result.postgisFunction}</code>
          </div>
        </div>
      )}
    </Card>
  );
}
