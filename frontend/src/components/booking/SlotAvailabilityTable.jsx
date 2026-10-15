import React, { useEffect, useState } from 'react';
import { Card } from '../ui/card.jsx';
import { Button } from '../ui/button.jsx';
import { RefreshCw, MapPin } from 'lucide-react';
import { createClient } from '../../lib/supabase/client.js';

export function SlotAvailabilityTable({ selectedZoneId, onSelectSlot }) {
  const [zones, setZones] = useState([]);
  const [activeZoneId, setActiveZoneId] = useState(selectedZoneId || '');
  const [slotsData, setSlotsData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load real zones first
  useEffect(() => {
    async function loadZones() {
      const supabase = createClient();
      const { data } = await supabase.from('zones').select('id, name, max_truck_capacity').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        setZones(data);
        if (!activeZoneId) {
          setActiveZoneId(data[0].id);
        }
      }
    }
    loadZones();
  }, [selectedZoneId]);

  useEffect(() => {
    if (selectedZoneId) {
      setActiveZoneId(selectedZoneId);
    }
  }, [selectedZoneId]);

  const loadSlots = async (zId) => {
    const targetId = zId || activeZoneId;
    if (!targetId) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/v1/zones/${targetId}/available-slots`);
      const data = await res.json();
      if (data.success && data.data) {
        setSlotsData(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeZoneId) {
      loadSlots(activeZoneId);
    }
  }, [activeZoneId]);

  return (
    <Card className="p-4 sm:p-6 border-slate-200 bg-white shadow-sm rounded-2xl space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-teal-600" />
          <div>
            <h3 className="text-base font-black text-slate-900">Ketersediaan Slot Jam Realtime</h3>
            <p className="text-xs text-slate-500">{slotsData?.zoneName || 'Pilih zona untuk melihat ketersediaan slot'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={activeZoneId}
            onChange={(e) => setActiveZoneId(e.target.value)}
            className="text-xs border border-slate-300 rounded-xl p-2 font-bold text-slate-800 bg-slate-50 focus:border-teal-600"
          >
            {zones.map((z) => (
              <option key={z.id} value={z.id}>{z.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b text-slate-700 font-bold">
              <th className="p-3">Jendela Waktu</th>
              <th className="p-3">Sisa Kapasitas Slot</th>
              <th className="p-3">Status Kepadatan</th>
              <th className="p-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y text-slate-800">
            {!slotsData?.slots || slotsData.slots.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-slate-400 font-semibold">
                  {loading ? 'Memuat ketersediaan slot real...' : 'Pilih zona untuk melihat slot.'}
                </td>
              </tr>
            ) : (
              slotsData.slots.map((s, i) => (
                <tr key={i} className="hover:bg-slate-50 font-medium">
                  <td className="p-3 font-mono font-bold text-slate-900">{s.time} WIB</td>
                  <td className="p-3 font-mono font-bold text-teal-700">{s.remainingCapacity} / {slotsData.maxCapacity} Truk</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                      s.status === 'available' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                      s.status === 'almost_full' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                      'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                      {s.status === 'available' ? 'Lancar' : s.status === 'almost_full' ? 'Hampir Penuh' : 'Penuh'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <Button
                      onClick={() => onSelectSlot && onSelectSlot(s)}
                      disabled={s.status === 'full'}
                      className="h-7 text-[10px] py-0 px-3 bg-teal-600 hover:bg-teal-700 font-bold shadow-sm"
                    >
                      Pilih Slot
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
