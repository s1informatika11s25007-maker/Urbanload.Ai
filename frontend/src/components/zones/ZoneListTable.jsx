import React, { useState } from 'react';
import { Card } from '../ui/card.jsx';
import { Button } from '../ui/button.jsx';
import { useRealtimeZones } from '../../hooks/useRealtimeZones.js';
import { useToast } from '../ui/ToastNotification.jsx';
import { RefreshCw, Radio, Clock, Lock, Unlock, AlertTriangle } from 'lucide-react';

/**
 * ZoneListTable
 * Displays real active logistics zones fetched directly from PostgreSQL Database (public.zones)
 * with Realtime WebSocket updates.
 */
export function ZoneListTable() {
  const { zones, loading } = useRealtimeZones();
  const { showToast } = useToast();
  const [lockedZones, setLockedZones] = useState({});

  const toggleEventLock = (zone) => {
    const isCurrentlyLocked = lockedZones[zone.id];
    setLockedZones((prev) => ({ ...prev, [zone.id]: !isCurrentlyLocked }));

    if (!isCurrentlyLocked) {
      showToast({
        title: 'Penutupan Darurat Aktif',
        message: `Zona ${zone.name} berhasil DIKUNCI sementara. Pendaftaran slot baru ditangguhkan.`,
        type: 'warning',
      });
    } else {
      showToast({
        title: 'Zona Dibuka Kembali',
        message: `Akses booking ke zona ${zone.name} telah dibuka kembali secara normal.`,
        type: 'success',
      });
    }
  };

  return (
    <Card className="p-4 sm:p-6 border-slate-200 bg-white shadow-sm rounded-2xl space-y-4">
      <div className="flex justify-between items-center border-b pb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm sm:text-base font-black text-slate-900">Daftar Zona Logistik Perkotaan Database Realtime</h3>
          <span className="flex items-center gap-1 text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-0.5 rounded-full font-mono">
            <Radio className="h-3 w-3 text-teal-600 animate-pulse" /> Realtime DB ({zones.length} Zona)
          </span>
        </div>
        {loading && <RefreshCw className="h-4 w-4 animate-spin text-teal-600" />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {zones.length === 0 ? (
          <div className="col-span-1 md:col-span-2 p-6 text-center text-xs text-slate-400 font-semibold">
            {loading ? 'Memuat data zona dari database...' : 'Belum ada zona logistik di database.'}
          </div>
        ) : (
          zones.map((z) => {
            const isLocked = lockedZones[z.id];

            return (
              <div
                key={z.id}
                className={`p-4 border rounded-2xl space-y-2 transition relative overflow-hidden ${
                  isLocked
                    ? 'bg-red-50/70 border-red-300'
                    : 'bg-slate-50 border-slate-200/80 hover:border-teal-500'
                }`}
              >
                {isLocked && (
                  <div className="bg-red-600 text-white text-[10px] font-black uppercase tracking-wider py-1 px-3 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 animate-bounce" /> ZONA DITUTUP SEMENTARA (PENUTUPAN DARURAT)
                    </span>
                  </div>
                )}

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

                  <Button
                    onClick={() => toggleEventLock(z)}
                    variant="outline"
                    className={`text-[10px] h-7 py-1 px-2.5 font-bold flex items-center gap-1 shrink-0 ${
                      isLocked
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                        : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
                    }`}
                  >
                    {isLocked ? (
                      <>
                        <Unlock className="h-3 w-3" /> Buka Akses
                      </>
                    ) : (
                      <>
                        <Lock className="h-3 w-3" /> Kunci Zona
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-200/60 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-teal-600" /> Operasional: {z.operating_hours_start || '06:00'} - {z.operating_hours_end || '22:00'}
                  </span>
                  <span className="text-[10px] font-bold text-teal-800 bg-teal-100/60 px-2 py-0.5 rounded">
                    Maks {z.max_truck_capacity} Slot
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
