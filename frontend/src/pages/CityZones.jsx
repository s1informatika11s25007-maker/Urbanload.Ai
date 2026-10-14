import React, { useState, lazy, Suspense } from 'react';
import { Download, Plus, Loader2, X, MapPin, Building2, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button.jsx';
import { Card } from '../components/ui/card.jsx';
import { createClient } from '../lib/supabase/client.js';
import { useToast } from '../components/ui/ToastNotification.jsx';

const ZoneDrawMap = lazy(() => import('../components/zones/ZoneDrawMap.jsx').then((mod) => ({ default: mod.ZoneDrawMap })));
const ZoneListTable = lazy(() => import('../components/zones/ZoneListTable.jsx').then((mod) => ({ default: mod.ZoneListTable })));
const GeofenceValidator = lazy(() => import('../components/zones/GeofenceValidator.jsx').then((mod) => ({ default: mod.GeofenceValidator })));

const CITY_CORRIDOR_PRESETS = [
  {
    name: 'Zona E - Kawasan Logistik Kebon Jeruk',
    maxCapacity: 15,
    zoneType: 'logistics',
    priorityLevel: 'normal',
    wkt: 'POLYGON((106.7680 -6.1820, 106.7850 -6.1820, 106.7850 -6.1960, 106.7680 -6.1960, 106.7680 -6.1820))'
  },
  {
    name: 'Zona F - Koridor Sudirman-Thamrin',
    maxCapacity: 8,
    zoneType: 'mixed',
    priorityLevel: 'priority_pass',
    wkt: 'POLYGON((106.8180 -6.1980, 106.8280 -6.1980, 106.8280 -6.2150, 106.8180 -6.2150, 106.8180 -6.1980))'
  },
  {
    name: 'Zona G - Terminal Kontainer Tanjung Priok 2',
    maxCapacity: 30,
    zoneType: 'port',
    priorityLevel: 'priority_pass',
    wkt: 'POLYGON((106.8800 -6.1000, 106.9100 -6.1000, 106.9100 -6.1180, 106.8800 -6.1180, 106.8800 -6.1000))'
  }
];

export default function CityZones() {
  const { showToast } = useToast();
  const [showAddModal, setShowShowAddModal] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState(false);

  // New Zone Form
  const [newZoneName, setNewZoneName] = useState('');
  const [maxCapacity, setMaxCapacity] = useState(15);
  const [zoneType, setZoneType] = useState('logistics');
  const [priorityLevel, setPriorityLevel] = useState('normal');
  const [selectedWKT, setSelectedWKT] = useState('POLYGON((106.820 -6.180, 106.830 -6.180, 106.830 -6.190, 106.820 -6.190, 106.820 -6.180))');

  const handleApplyPreset = (preset) => {
    setNewZoneName(preset.name);
    setMaxCapacity(preset.maxCapacity);
    setZoneType(preset.zoneType);
    setPriorityLevel(preset.priorityLevel);
    setSelectedWKT(preset.wkt);
    showToast({ title: 'Preset Koridor Diterapkan', message: preset.name, type: 'info' });
  };

  const handleCreateZone = async (e) => {
    e.preventDefault();
    if (!newZoneName) return;

    setLoadingAdd(true);
    try {
      const supabase = createClient();

      const { error } = await supabase.from('zones').insert({
        name: newZoneName,
        max_truck_capacity: Number(maxCapacity),
        zone_type: zoneType,
        priority_level: priorityLevel,
        boundary_polygon: selectedWKT,
        operating_hours_start: '06:00',
        operating_hours_end: '22:00',
      });

      if (!error) {
        showToast({
          title: 'Zona Baru Berhasil Ditambahkan',
          message: `${newZoneName} telah disimpan langsung ke database Supabase.`,
          type: 'success',
        });
        setNewZoneName('');
        setShowShowAddModal(false);
      } else {
        showToast({
          title: 'Gagal Menambah Zona',
          message: error.message,
          type: 'error',
        });
      }
    } catch (err) {
      console.error('Error creating zone:', err);
    } finally {
      setLoadingAdd(false);
    }
  };

  const handleExportGeoJSON = async () => {
    try {
      const supabase = createClient();
      const { data: zones } = await supabase.from('zones').select('*');

      if (!zones || zones.length === 0) {
        showToast({ title: 'Tidak Ada Data Zona', message: 'Database zona masih kosong.', type: 'warning' });
        return;
      }

      const geojson = {
        type: 'FeatureCollection',
        features: zones.map((z) => ({
          type: 'Feature',
          properties: {
            id: z.id,
            name: z.name,
            maxCapacity: z.max_truck_capacity,
            type: z.zone_type,
            priority: z.priority_level,
          },
          geometry: {
            type: 'Polygon',
            coordinates: [[[106.82, -6.18], [106.83, -6.18], [106.83, -6.19], [106.82, -6.19], [106.82, -6.18]]],
          },
        })),
      };

      const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `urbanload-zones-${Date.now()}.geojson`;
      a.click();
      URL.revokeObjectURL(url);

      showToast({ title: 'Ekspor GeoJSON Berhasil', message: 'File GeoJSON telah diunduh.', type: 'success' });
    } catch (err) {
      console.error('Error exporting GeoJSON:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      {/* Banner Khusus Modul Admin Kota */}
      <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 flex items-center justify-between text-xs shadow-sm">
        <div className="flex items-center gap-2 font-bold">
          <Building2 className="h-4 w-4 text-teal-600 shrink-0" />
          <span>Modul Khusus Admin Kota — Editor Geofence Poligon PostGIS, Kapasitas Bay & Jam Operasional</span>
        </div>
        <span className="bg-white px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-teal-300 text-teal-800">
          Admin Kota Access
        </span>
      </div>

      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-2">
        <div>
          <div className="text-xs text-slate-500 mb-1">Beranda / Manajemen Zona</div>
          <h1 className="text-2xl font-black text-slate-900">Manajemen Batas Zona Logistik Real Database</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => setShowShowAddModal(true)} className="text-xs flex items-center gap-1 font-bold bg-teal-600 hover:bg-teal-700 text-white">
            <Plus className="h-3.5 w-3.5" /> Tambah Zona Baru Real
          </Button>
          <Button onClick={handleExportGeoJSON} variant="outline" className="text-xs flex items-center gap-1 font-bold">
            <Download className="h-3.5 w-3.5" /> Ekspor GeoJSON
          </Button>
        </div>
      </div>

      {/* Section 1: Peta Interaktif Drawing Tool */}
      <Suspense fallback={
        <div className="w-full h-[500px] rounded-2xl bg-slate-900 border border-slate-700 flex flex-col items-center justify-center text-teal-400 text-xs font-bold gap-3 animate-pulse shadow-md">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
          <span>Memuat MapLibre Drawing Editor...</span>
        </div>
      }>
        <ZoneDrawMap />
      </Suspense>

      {/* Section 2: Tabel Daftar Zona */}
      <Suspense fallback={<div className="h-20 animate-pulse bg-white rounded-xl" />}>
        <ZoneListTable />
      </Suspense>

      {/* Section 3: Panel Validasi Lokasi (PostGIS) */}
      <Suspense fallback={<div className="h-20 animate-pulse bg-white rounded-xl" />}>
        <GeofenceValidator />
      </Suspense>

      {/* Modal Tambah Zona Baru Real */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md p-6 bg-white rounded-3xl border border-teal-200 shadow-2xl space-y-4 relative">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-teal-600" /> Tambah Zona Logistik Baru
              </h3>
              <button onClick={() => setShowShowAddModal(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Presets Shortcut Chips */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-teal-50/80 border border-teal-200">
              <span className="text-[10px] font-bold text-teal-900 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-teal-600" /> Gunakan Preset Koridor Logistik Cepat:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {CITY_CORRIDOR_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="text-[10px] font-bold bg-white text-teal-800 border border-teal-300 hover:bg-teal-600 hover:text-white px-2 py-1 rounded-lg transition"
                  >
                    + {p.name.split(' - ')[1] || p.name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreateZone} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Zona Logistik</label>
                <input
                  type="text"
                  required
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  placeholder="Contoh: Zona E - Kawasan Industri Kebon Jeruk"
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-900 focus:border-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kapasitas Maks Truk</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={maxCapacity}
                    onChange={(e) => setMaxCapacity(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-mono font-bold text-slate-900 focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Prioritas Zona</label>
                  <select
                    value={priorityLevel}
                    onChange={(e) => setPriorityLevel(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-900 focus:border-teal-600"
                  >
                    <option value="normal">Normal</option>
                    <option value="priority_pass">Priority Pass</option>
                    <option value="restricted">Restricted</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tipe Zona</label>
                <select
                  value={zoneType}
                  onChange={(e) => setZoneType(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-900 focus:border-teal-600"
                >
                  <option value="logistics">Logistics Only</option>
                  <option value="mixed">Mixed Commercial</option>
                  <option value="port">Port / Harbour Terminal</option>
                </select>
              </div>

              <Button
                type="submit"
                disabled={loadingAdd || !newZoneName}
                className="w-full py-3 text-xs font-bold shadow-md bg-teal-600 hover:bg-teal-700 text-white mt-2"
              >
                {loadingAdd ? 'Menyimpan Ke Database Real...' : 'Simpan Zona Ke Database Real'}
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* Footer Info Teknis */}
      <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-500 border border-slate-200 font-mono">
        Info teknis: Sistem koordinat WGS84 / EPSG:4326. Penyimpanan: PostGIS GEOGRAPHY(POLYGON).
      </div>
    </div>
  );
}
