import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/card.jsx';
import { Button } from '../ui/button.jsx';
import { createClient } from '../../lib/supabase/client.js';
import { RefreshCw, Radio } from 'lucide-react';

export function BookingHistoryTable({ isDemo = false }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, profiles(full_name), zones(name)')
        .order('created_at', { ascending});

      if (data) setHistory(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const supabase = createClient();
    const channel = supabase
      .channel('booking_history_table_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadData]);

  return (
    <Card className="p-6 border-slate-200 bg-white shadow-sm rounded-2xl space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">Riwayat Booking Slot Logistik</h3>
            <span className="flex items-center gap-1 text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-full">
              <Radio className="h-3 w-3 text-teal-600 animate-pulse" /> Realtime WebSocket
            </span>
          </div>
        </div>

        <Button onClick={loadData} variant="outline" className="text-xs h-8">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
              <th className="p-3 font-semibold">ID</th>
              <th className="p-3 font-semibold">Zona</th>
              <th className="p-3 font-semibold">Waktu</th>
              <th className="p-3 font-semibold">Status</th>
              <th className="p-3 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {history.map((h) => (
              <tr key={h.id} className="hover:bg-slate-50 transition">
                <td className="p-3 font-mono">{h.id.slice(0, 8)}...</td>
                <td className="p-3 font-semibold">{h.zones?.name || 'Zona Logistik'}</td>
                <td className="p-3 text-slate-500">{new Date(h.created_at).toLocaleString('id-ID')}</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase font-black text-[10px]">
                    {h.status}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <Link to={`/rider/bookings/${h.id}/qr`}>
                    <Button variant="outline" className="text-[10px] py-1 h-7">QR Live</Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
