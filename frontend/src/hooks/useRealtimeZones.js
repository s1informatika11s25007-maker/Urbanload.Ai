import { useEffect, useState } from 'react';
import { createClient } from '../lib/supabase/client.js';

export function useRealtimeZones() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const fetchInitialZones = async () => {
      const { data, error } = await supabase.from('zones').select('*').order('created_at', { ascending: false });
      if (!error && data) setZones(data);
      setLoading(false);
    };
    fetchInitialZones();

    const channel = supabase.channel('zones_realtime_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'zones' }, (payload) => {
        if (payload.eventType === 'INSERT') setZones((prev) => [payload.new, ...prev]);
        else if (payload.eventType === 'UPDATE') setZones((prev) => prev.map((z) => (z.id === payload.new.id ? payload.new : z)));
        else if (payload.eventType === 'DELETE') setZones((prev) => prev.filter((z) => z.id !== payload.old.id));
      }).subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  return { zones, loading };
}
