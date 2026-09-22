import React from 'react';
import { Card } from '../ui/card.jsx';
import { useRealtimeZones } from '../../hooks/useRealtimeZones.js';
import { RefreshCw, Radio } from 'lucide-react';

export function ZoneListTable() {
  const { zones, loading } = useRealtimeZones();

  return (
    <Card className="p-6 border-slate-200 bg-white shadow-sm rounded-2xl space-y-4">
      <div className="flex justify-between items-center border-b pb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-black text-slate-900">Daftar Zona Logistik Perkotaan Real</h3>
          <span className="flex items-center gap-1 text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-0.5 rounded-full">
            <Radio className="h-3 w-3 text-teal-600 animate-pulse" /> Realtime DB ({zones.length} Zona)
          </span>
        </div>
        {loading && <RefreshCw className="h-4 w-4 animate-spin text-teal-600" />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {zones.length === 0 ? (
          <div className="col-span-2 p-6 text-center text-xs text-slate-400">
            {loading ? 'Memuat data zona dari database...' : 'Belum ada zona logistik di database.'}
          </div>
        ) : (
          zones.map((z) => (
            <div key={z.id} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-900 block">{z.name}</span>
                <span className="text-[10px] text-slate-500 font-mono">Tipe: {z.zone_type || 'logistics'} | Prioritas: {z.priority_level || 'normal'}</span>
              </div>
              <span className="text-xs font-black text-teal-700 bg-teal-100/60 px-2.5 py-1 rounded-lg border border-teal-200">
                Maks {z.max_truck_capacity || 10} Truk
              </span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
