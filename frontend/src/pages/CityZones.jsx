import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Download, Settings, Loader2, X, MapPin, Sparkles, Trash2, Edit3, Plus } from 'lucide-react';
import { Button } from '../components/ui/button.jsx';
import { Card } from '../components/ui/card.jsx';
import { createClient } from '../lib/supabase/client.js';
import { useToast } from '../components/ui/ToastNotification.jsx';
import { triggerZonesRefresh, useRealtimeZones } from '../hooks/useRealtimeZones.js';

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
  const { zones: dbZones } = useRealtimeZones();

  const [showManageModal, setShowManageModal] = useState(false);
  const [manageTab, setManageTab] = useState('add');
  const [loading, setLoading] = useState(false);

  // Elegant Delete Confirmation Card Modal State
  const [deleteConfirmZone, setDeleteConfirmZone] = useState(null);

  // Form States for Add / Edit
  const [selectedZoneId, setSelectedZoneId] = useState('');
  const [zoneName, setZoneName] = useState('');
  const [maxCapacity, setMaxCapacity] = useState(15);
  const [zoneType, setZoneType] = useState('logistics');
  const [priorityLevel, setPriorityLevel] = useState('normal');
  const [selectedWKT, setSelectedWKT] = useState('POLYGON((106.820 -6.180, 106.830 -6.180, 106.830 -6.190, 106.820 -6.190, 106.820 -6.180))');

  // Handle Edit Zone Selection
  const handleSelectZoneForEdit = (zoneId) => {
    setSelectedZoneId(zoneId);
    const z = dbZones.find((item) => item.id === zoneId);
    if (z) {
      setZoneName(z.name || '');
      setMaxCapacity(z.max_truck_capacity || 15);
      setZoneType(z.zone_type || 'logistics');
      setPriorityLevel(z.priority_level || 'normal');
      setSelectedWKT(z.boundary_polygon || '');
    }
  };

  // Receive Polygon WKT from Interactive Map Editor Pins
  const handleSelectNewZoneWKT = (wktString) => {
    setSelectedWKT(wktString);
    showToast({
      title: 'Poligon Peta Terdaftar!',
      message: 'Koordinat batas zona dari pin/radius berhasil dimasukkan ke form.',
      type: 'success'
    });
  };

  const handleApplyPreset = (preset) => {
    setZoneName(preset.name);
    setMaxCapacity(preset.maxCapacity);
    setZoneType(preset.zoneType);
    setPriorityLevel(preset.priorityLevel);
    setSelectedWKT(preset.wkt);
    showToast({ title: 'Preset Koridor Diterapkan', message: preset.name, type: 'info' });
  };

  // Create New Zone with Instant Realtime Broadcast
  const handleCreateZone = async (e) => {
    e.preventDefault();
    if (!zoneName) return;

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('zones').insert({
        name: zoneName,
        max_truck_capacity: Number(maxCapacity),
        zone_type: zoneType,
        priority_level: priorityLevel,
        boundary_polygon: selectedWKT,
        operating_hours_start: '06:00',
        operating_hours_end: '22:00',
      }).select().single();

      if (!error) {
        showToast({
          title: 'Zona Baru Ditambahkan!',
          message: `${zoneName} disimpan ke database dan peta otomatis ter-refresh.`,
          type: 'success',
        });
        setZoneName('');
        setShowManageModal(false);
        triggerZonesRefresh();
      } else {
        showToast({ title: 'Gagal Menambah Zona', message: error.message, type: 'error' });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Update Existing Zone with Instant Realtime Broadcast
  const handleUpdateZone = async (e) => {
    e.preventDefault();
    if (!selectedZoneId || !zoneName) return;

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('zones')
        .update({
          name: zoneName,
          max_truck_capacity: Number(maxCapacity),
          zone_type: zoneType,
          priority_level: priorityLevel,
          boundary_polygon: selectedWKT,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedZoneId);

      if (!error) {
        showToast({
          title: 'Zona Berhasil Diperbarui!',
          message: `${zoneName} di-update di database dan peta otomatis ter-refresh.`,
          type: 'success',
        });
        setShowManageModal(false);
        triggerZonesRefresh();
      } else {
        showToast({ title: 'Gagal Memperbarui Zona', message: error.message, type: 'error' });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Open Elegant Delete Confirmation Card Modal
  const handleRequestDeleteZone = (e) => {
    e.preventDefault();
    if (!selectedZoneId) return;
    const matched = dbZones.find((z) => z.id === selectedZoneId);
    if (matched) {
      setDeleteConfirmZone(matched);
    }
  };

  // Execute Permanent Delete from Supabase with Instant Realtime Broadcast
  const executeDeleteZone = async () => {
    if (!deleteConfirmZone) return;

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('zones').delete().eq('id', deleteConfirmZone.id);

      if (!error) {
        showToast({
          title: 'Zona Berhasil Dihapus!',
          message: `Zona ${deleteConfirmZone.name} telah dihapus dan peta otomatis ter-refresh.`,
          type: 'success',
        });
        setSelectedZoneId('');
        setDeleteConfirmZone(null);
        setShowManageModal(false);
        triggerZonesRefresh();
      } else {
        showToast({ title: 'Gagal Menghapus Zona', message: error.message, type: 'error' });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
    <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto p-2.5 sm:p-4">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 sm:pb-4 gap-2">
        <div>
          <div className="text-[11px] sm:text-xs text-slate-500 mb-0.5">Beranda / Manajemen Zona</div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Editor Zona PostGIS</h1>
          <p className="text-[11px] sm:text-xs text-slate-500">
            Pemantauan geofence poligon PostGIS WGS84, penandaan pin/radius & kelola zona logistik.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Button
            onClick={() => { setManageTab('add'); setShowManageModal(true); }}
            className="text-xs flex items-center gap-1 font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
          >
            <Settings className="h-3.5 w-3.5" /> Manage Zona
          </Button>
          <Button onClick={handleExportGeoJSON} variant="outline" className="text-xs flex items-center gap-1 font-bold">
            <Download className="h-3.5 w-3.5" /> Ekspor GeoJSON
          </Button>
        </div>
      </div>

      {/* READ-ONLY VIEW MAPS AT INITIAL INGESTION */}
      <Suspense fallback={
        <div className="w-full h-[380px] sm:h-[500px] rounded-2xl bg-slate-900 border border-slate-700 flex flex-col items-center justify-center text-teal-400 text-xs font-bold gap-3 animate-pulse shadow-md">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
          <span>Memuat View Peta PostGIS...</span>
        </div>
      }>
        <ZoneDrawMap readOnly={true} />
      </Suspense>

      {/* Section 2: Tabel Daftar Zona */}
      <Suspense fallback={<div className="h-20 animate-pulse bg-white rounded-xl" />}>
        <ZoneListTable />
      </Suspense>

      {/* Section 3: Panel Validasi Lokasi (PostGIS) */}
      <Suspense fallback={<div className="h-20 animate-pulse bg-white rounded-xl" />}>
        <GeofenceValidator />
      </Suspense>

      {/* MANAGE ZONA FULL SUITE MODAL */}
      {showManageModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 bg-white rounded-3xl border border-teal-200 shadow-2xl space-y-4 relative">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-teal-600" />
                <h3 className="text-base font-black text-slate-900">Kelola Zona Logistik PostGIS (Manage Zona)</h3>
              </div>
              <button onClick={() => setShowManageModal(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* TAB SELECTION */}
            <div className="flex gap-1.5 bg-slate-100 p-1 rounded-2xl border text-xs font-bold text-slate-700">
              <button
                type="button"
                onClick={() => setManageTab('add')}
                className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition ${
                  manageTab === 'add' ? 'bg-teal-600 text-white shadow-sm' : 'hover:bg-slate-200'
                }`}
              >
                <Plus className="h-4 w-4" /> Tambah Zona Baru
              </button>
              <button
                type="button"
                onClick={() => setManageTab('edit')}
                className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition ${
                  manageTab === 'edit' ? 'bg-amber-600 text-white shadow-sm' : 'hover:bg-slate-200'
                }`}
              >
                <Edit3 className="h-4 w-4" /> Edit Zona Existing
              </button>
              <button
                type="button"
                onClick={() => setManageTab('delete')}
                className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition ${
                  manageTab === 'delete' ? 'bg-rose-600 text-white shadow-sm' : 'hover:bg-slate-200'
                }`}
              >
                <Trash2 className="h-4 w-4" /> Hapus Zona
              </button>
            </div>

            {/* INTERACTIVE DRAWING MAP CANVAS INSIDE MODAL */}
            {(manageTab === 'add' || manageTab === 'edit') && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-600 font-bold">
                  <span>📍 Kanvas Penandaan Pin Merah & Radius Poligon:</span>
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-mono">
                    Klik Peta / Slider Radius untuk Membentuk Poligon
                  </span>
                </div>
                <Suspense fallback={<div className="h-[280px] bg-slate-900 rounded-2xl animate-pulse" />}>
                  <ZoneDrawMap readOnly={false} onSelectNewZoneWKT={handleSelectNewZoneWKT} />
                </Suspense>
              </div>
            )}

            {/* TAB 1: FORM TAMBAH ZONA */}
            {manageTab === 'add' && (
              <form onSubmit={handleCreateZone} className="space-y-3 text-xs pt-1">
                <div className="space-y-1.5 p-3 rounded-2xl bg-teal-50/80 border border-teal-200">
                  <span className="text-[10px] font-bold text-teal-900 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-teal-600" /> Preset Koridor Cepat:
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

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Zona Logistik</label>
                  <input
                    type="text"
                    required
                    value={zoneName}
                    onChange={(e) => setZoneName(e.target.value)}
                    placeholder="Contoh: Zona H - Kawasan Industri Cengkareng"
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold focus:border-teal-600"
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
                      className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-mono font-bold focus:border-teal-600"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Prioritas Zona</label>
                    <select
                      value={priorityLevel}
                      onChange={(e) => setPriorityLevel(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold focus:border-teal-600"
                    >
                      <option value="normal">Normal</option>
                      <option value="priority_pass">Priority Pass</option>
                      <option value="restricted">Restricted</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Tipe Zona</label>
                    <select
                      value={zoneType}
                      onChange={(e) => setZoneType(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold focus:border-teal-600"
                    >
                      <option value="logistics">Logistics Only</option>
                      <option value="mixed">Mixed Commercial</option>
                      <option value="port">Port / Terminal</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Poligon Batas PostGIS (WKT)</label>
                    <input
                      type="text"
                      required
                      value={selectedWKT}
                      onChange={(e) => setSelectedWKT(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-2.5 text-[10px] font-mono text-slate-700 bg-slate-50 focus:border-teal-600"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading || !zoneName}
                  className="w-full py-3 text-xs font-bold shadow-md bg-teal-600 hover:bg-teal-700 text-white mt-2"
                >
                  {loading ? 'Menyimpan Zona Baru...' : 'Simpan Zona Baru Ke Database'}
                </Button>
              </form>
            )}

            {/* TAB 2: FORM EDIT ZONA EXISTING */}
            {manageTab === 'edit' && (
              <form onSubmit={handleUpdateZone} className="space-y-3 text-xs pt-1">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pilih Zona yang Ingin Di-Edit:</label>
                  <select
                    value={selectedZoneId}
                    onChange={(e) => handleSelectZoneForEdit(e.target.value)}
                    className="w-full border border-amber-300 bg-amber-50/50 rounded-xl p-2.5 text-xs font-bold focus:border-amber-600 text-amber-900"
                    required
                  >
                    <option value="">-- Pilih Zona Existing --</option>
                    {(dbZones || []).map((z) => (
                      <option key={z.id} value={z.id}>{z.name} (Cap: {z.max_truck_capacity})</option>
                    ))}
                  </select>
                </div>

                {selectedZoneId && (
                  <>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Nama Zona Baru</label>
                      <input
                        type="text"
                        required
                        value={zoneName}
                        onChange={(e) => setZoneName(e.target.value)}
                        className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold focus:border-amber-600"
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
                          className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-mono font-bold focus:border-amber-600"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Prioritas Zona</label>
                        <select
                          value={priorityLevel}
                          onChange={(e) => setPriorityLevel(e.target.value)}
                          className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold focus:border-amber-600"
                        >
                          <option value="normal">Normal</option>
                          <option value="priority_pass">Priority Pass</option>
                          <option value="restricted">Restricted</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Poligon Batas PostGIS (WKT)</label>
                      <input
                        type="text"
                        required
                        value={selectedWKT}
                        onChange={(e) => setSelectedWKT(e.target.value)}
                        className="w-full border border-slate-300 rounded-xl p-2.5 text-[10px] font-mono text-slate-700 bg-slate-50 focus:border-amber-600"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading || !selectedZoneId}
                      className="w-full py-3 text-xs font-bold shadow-md bg-amber-600 hover:bg-amber-700 text-white mt-2"
                    >
                      {loading ? 'Memperbarui Zona...' : 'Update Permintaan Zona Ke Database'}
                    </Button>
                  </>
                )}
              </form>
            )}

            {/* TAB 3: HAPUS ZONA */}
            {manageTab === 'delete' && (
              <form onSubmit={handleRequestDeleteZone} className="space-y-4 text-xs pt-1">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pilih Zona yang Ingin Dihapus:</label>
                  <select
                    value={selectedZoneId}
                    onChange={(e) => setSelectedZoneId(e.target.value)}
                    className="w-full border border-rose-300 bg-rose-50/50 rounded-xl p-2.5 text-xs font-bold focus:border-rose-600 text-rose-900"
                    required
                  >
                    <option value="">-- Pilih Zona untuk Dihapus --</option>
                    {(dbZones || []).map((z) => (
                      <option key={z.id} value={z.id}>{z.name} (ID: {z.id.slice(0, 8)}...)</option>
                    ))}
                  </select>
                </div>

                {selectedZoneId && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 space-y-2">
                    <span className="font-extrabold block text-rose-800">⚠️ Peringatan Hapus Zona:</span>
                    <p className="text-[11px] leading-relaxed">
                      Zona yang dihapus tidak dapat dikembalikan.
                    </p>

                    <Button
                      type="submit"
                      disabled={loading || !selectedZoneId}
                      className="w-full py-2.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md mt-2 flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="h-4 w-4" />
                      Proses Hapus Zona
                    </Button>
                  </div>
                )}
              </form>
            )}
          </Card>
        </div>
      )}

      {/* ELEGANT DELETE CONFIRMATION CARD MODAL */}
      {deleteConfirmZone && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
          <Card className="w-full max-w-sm p-6 bg-white rounded-3xl border border-rose-200 shadow-2xl space-y-4 text-center">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-inner">
              <Trash2 className="h-6 w-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-black text-slate-900">Hapus Zona Logistik Permanen</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin menghapus zona <strong className="text-rose-600 font-extrabold">{deleteConfirmZone.name}</strong>?
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteConfirmZone(null)}
                className="flex-1 py-2 text-xs font-bold"
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={executeDeleteZone}
                disabled={loading}
                className="flex-1 py-2 text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md"
              >
                {loading ? 'Menghapus...' : 'Ya, Hapus Permanen'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
