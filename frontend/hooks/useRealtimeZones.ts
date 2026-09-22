import { useEffect, useState } from 'react';
import { createClient } from '../lib/supabase/client';

export function useRealtimeZones() {
  const [zones, setZones] = useState<any[]>([]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('zones_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'zones' }, (payload) => {
        setZones((prev) => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return zones;
}
