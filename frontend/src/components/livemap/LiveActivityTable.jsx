import React, { useEffect, useState } from 'react';
import { Card } from '../ui/card.jsx';
import { createClient } from '../../lib/supabase/client.js';

export function LiveActivityTable() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('bookings').select('*').limit(10);
      if (data) setActivities(data);
    };
    load();
  }, []);

  return (
    <Card className="p-4 h-60 overflow-y-auto">
      <h4 className="text-xs font-black uppercase mb-3">Aktivitas Terkini</h4>
      <div className="space-y-2">
        {activities.map(a => (
          <div key={a.id} className="p-2 bg-slate-50 rounded-lg text-[11px]">
            <span className="font-bold">Booking: {a.id.slice(0,8)}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
