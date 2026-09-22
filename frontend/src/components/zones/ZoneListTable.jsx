import React from 'react';
import { Card } from '../ui/card.jsx';
import { useRealtimeZones } from '../../hooks/useRealtimeZones.js';
import { RefreshCw, Radio, MapPin, Clock, ShieldCheck } from 'lucide-react';

export function ZoneListTable() {
  const { zones, loading } = useRealtimeZones();

  return (
    <Card className="p-4 sm:p-6 border-slate-200 bg-white shadow-sm rounded-2xl space-y-4">
      <div className="flex justify-between items-center border-b pb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm sm:text-base font-black text-slate-900">Daftar Zona Logistik Perkotaan Real</h3>
          <span className="flex items-center gap-1 text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-0.5 rounded-full">
            <Radio className="h-3 w-3 text-teal-600 animate-pulse" /> Realtime DB ({zones.length} Zona Real)
          </span>
        </div>
        {loading && <RefreshCw className="h-4 w-4 animate-spin text-teal-600" />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {zones.length === 0 ? (
          <div className="col-span-1 md:col-span-2 p-6 text-center text-xs text-slate-400 font-semibold">
            {loading ? 'Memuat data zona real dari database...' : 'Belum ada zona logistik di database.'}
          </div>
        ) : (
          zones.map((z) => (
            <div key={z.id} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2 hover:border-teal-500 transition">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-black text-sm text-slate-900 block">{z.name}</span>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                    <span className="bg-slate-200/80 text-slate-800 px-2 py-0.5 rounded font-bold">
                      Tipe: {z.zone_type || 'Logistik'}
                    </span>
                    <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded font-bold">
                      Prioritas: {z.priority_level || 'Normal'}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-black text-teal-700 bg-teal-100/60 px-2.5 py-1 rounded-xl border border-teal-200 shrink-0">
                  Maks {z.max_truck_capacity} Truk
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-200/60 font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-teal-600" /> Operasional: {z.operating_hours_start || '06:00'} - {z.operating_hours_end || '22:00'}
                </span>
                <span className="text-[10px] text-slate-400">
                  ID: {z.id.slice(0, 8)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
