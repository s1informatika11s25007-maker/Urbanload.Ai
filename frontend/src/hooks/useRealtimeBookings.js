import { useEffect, useState } from 'react';
import { createClient } from '../lib/supabase/client.js';

const LOCAL_STORAGE_KEY = 'urbanload_bookings_cache_v1';

let globalBookingsCache = null;
let globalBookingsListeners = new Set();
let isRealtimeSubscribed = false;

try {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) {
    globalBookingsCache = JSON.parse(stored);
  }
} catch (e) {}

function updateGlobalBookings(newBookings) {
  globalBookingsCache = newBookings;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newBookings));
  } catch (e) {}

  globalBookingsListeners.forEach((listener) => listener(newBookings));
}

async function silentSyncBookings() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('bookings')
      .select('id, vehicle_plate, status, time_window_start, created_at, zone_id, zones(name)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      updateGlobalBookings(data);
    }
  } catch (e) {
    console.warn('Silent bookings sync warning:', e);
  }
}

function initBookingsRealtimeChannel() {
  if (isRealtimeSubscribed) return;
  isRealtimeSubscribed = true;

  const supabase = createClient();
  supabase
    .channel('global_bookings_realtime_channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
      silentSyncBookings();
    })
    .subscribe();
}

export function useRealtimeBookings() {
  const [bookings, setBookings] = useState(globalBookingsCache || []);
  const [loading, setLoading] = useState(!globalBookingsCache || globalBookingsCache.length === 0);

  useEffect(() => {
    const listener = (newBookings) => {
      setBookings(newBookings);
      setLoading(false);
    };
    globalBookingsListeners.add(listener);

    if (globalBookingsCache && globalBookingsCache.length > 0) {
      setBookings(globalBookingsCache);
      setLoading(false);
    }

    silentSyncBookings().then(() => {
      setLoading(false);
    });

    initBookingsRealtimeChannel();

    return () => {
      globalBookingsListeners.delete(listener);
    };
  }, []);

  return { bookings, loading };
}
