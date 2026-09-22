import { useEffect, useState } from 'react';
import { createClient } from '../lib/supabase/client';

export function useRealtimeBookings() {
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('bookings_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, (payload) => {
        setBookings((prev) => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return bookings;
}
