import React, { useEffect, useState } from 'react';
import { Card } from '../ui/card.jsx';
import { createClient } from '../../lib/supabase/client.js';

export function StatsSidebar() {
  const [stats, setStats] = useState({ total: 0, most: './A.jsx' });

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('bookings').select('id');
      setStats({ total: data?.length || 0, most: 'Zona A' });
    };
    load();
  }, []);

  return (
    <div className="grid grid-cols-2 gap-3">
      <Card className="p-4 bg-white">
        <span className="text-[10px] text-slate-500 uppercase font-black">Total Booking</span>
        <div className="text-2xl font-black">{stats.total}</div>
      </Card>
      <Card className="p-4 bg-white">
        <span className="text-[10px] text-slate-500 uppercase font-black">Paling Padat</span>
        <div className="text-sm font-black text-rose-600">{stats.most}</div>
      </Card>
    </div>
  );
}
