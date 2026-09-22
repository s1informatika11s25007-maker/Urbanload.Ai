import React, { useEffect, useState } from 'react';
import { Card } from '../ui/card.jsx';
import { createClient } from '../../lib/supabase/client.js';
import { Radio, Truck, Activity } from 'lucide-react';

export function LiveActivityTable() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadActivities = async () => {
    setLoading(true);
    const supabase = createClient();
    try {
      const { data } = await supabase
        .from('bookings')
        .select('*, zones(name), profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) setActivities(data);
    } catch (e) {
      console.error('Error fetching live activity:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();

    const supabase = createClient();
    const channel = supabase
      .channel('live_activity_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        loadActivities();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Card className="p-4 border-slate-200 bg-white shadow-sm rounded-2xl space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
          <Activity className="h-4 w-4 text-teal-600" /> Feed Aktivitas Realtime
        </h4>
        <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full flex items-center gap-1">
          <Radio className="h-3 w-3 text-teal-600 animate-pulse" /> Live DB
        </span>
      </div>

      <div className="space-y-2 max-h-56 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="p-4 text-center text-slate-400 text-xs">
            {loading ? 'Memuat aktivitas real...' : 'Belum ada transaksi booking.'}
          </div>
        ) : (
          activities.map((a) => (
            <div key={a.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px] flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-mono font-black text-slate-900 flex items-center gap-1">
                  <Truck className="h-3 w-3 text-teal-600" /> {a.vehicle_plate || 'Truk Real'}
                </div>
                <div className="text-[10px] text-slate-500 font-semibold truncate max-w-[150px]">
                  {a.zones?.name || 'Zona Logistik'}
                </div>
              </div>

              <div className="text-right">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                  a.status === 'confirmed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-blue-50 text-blue-800 border-blue-200'
                }`}>
                  {a.status}
                </span>
                <span className="block text-[9px] text-slate-400 font-mono mt-0.5">
                  {new Date(a.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
