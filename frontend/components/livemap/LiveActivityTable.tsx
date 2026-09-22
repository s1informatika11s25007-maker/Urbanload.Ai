'use client';

import { useEffect, useState } from 'react';
import { Card } from '../ui/card';
import { fetchBookings } from '@/lib/api/bookings';
import { createClient } from '@/lib/supabase/client';

export function LiveActivityTable() {
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    fetchBookings().then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        const mapped = res.data.map((b: any, idx: number) => ({
          id: b.id,
          text: `Booking Logistik: ${b.zone_name || 'Zona A'} · Status: ${b.status || 'confirmed'}`,
          time: `${idx * 2 + 1}m lalu`,
        }));
        setActivities(mapped);
      }
    });

    const supabase = createClient();
    const channel = supabase
      .channel('activities_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, (payload) => {
        const newRow = payload.new as any;
        if (newRow && newRow.id) {
          setActivities((prev) => [
            {
              id: newRow.id,
              text: `Booking Real-time Baru: ${newRow.status || 'confirmed'} · ID: ${String(newRow.id).slice(0, 8)}`,
              time: 'baru saja',
            },
            ...prev,
          ]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Card className="p-4 h-60 overflow-y-auto border-slate-200 bg-white shadow-sm">
      <h4 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">
        Aktivitas Terkini (Supabase Realtime Feed)
      </h4>
      <div className="space-y-2 text-xs">
        {activities.length === 0 ? (
          <div className="p-4 text-center text-slate-400 text-xs">Menunggu transaksi baru...</div>
        ) : (
          activities.map((a) => (
            <div key={a.id} className="flex justify-between items-center p-2 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-800 font-semibold">{a.text}</span>
              <span className="text-teal-600 font-mono text-[10px] font-bold">{a.time}</span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
