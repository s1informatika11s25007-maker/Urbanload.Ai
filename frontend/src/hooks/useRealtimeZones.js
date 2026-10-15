import { useEffect, useState } from 'react';
import { createClient } from '../lib/supabase/client.js';

const LOCAL_STORAGE_KEY = 'urbanload_zones_cache_v1';

// Global In-Memory Shared Cache across components & page navigations
let globalZonesCache = null;
let globalZonesListeners = new Set();
let isRealtimeSubscribed = false;

// Seed from LocalStorage for instant 0ms load across browser sessions
try {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) {
    globalZonesCache = JSON.parse(stored);
  }
} catch (e) {
  // Ignore storage errors
}

function updateGlobalZones(newZones) {
  globalZonesCache = newZones;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newZones));
  } catch (e) {}

  // Notify all active page components seamlessly
  globalZonesListeners.forEach((listener) => listener(newZones));
}

async function silentSyncZones() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('zones')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      updateGlobalZones(data);
    }
  } catch (e) {
    console.warn('Silent zones sync warning:', e);
  }
}

function initZonesRealtimeChannel() {
  if (isRealtimeSubscribed) return;
  isRealtimeSubscribed = true;

  const supabase = createClient();
  supabase
    .channel('global_zones_realtime_channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'zones' }, () => {
      // Background silent sync when DB changes occur
      silentSyncZones();
    })
    .subscribe();
}

export function useRealtimeZones() {
  const [zones, setZones] = useState(globalZonesCache || []);
  const [loading, setLoading] = useState(!globalZonesCache || globalZonesCache.length === 0);

  useEffect(() => {
    // 1. Register component listener for global cache updates
    const listener = (newZones) => {
      setZones(newZones);
      setLoading(false);
    };
    globalZonesListeners.add(listener);

    // 2. If global cache is present, instantly supply it (0ms load - NO SPINNER)
    if (globalZonesCache && globalZonesCache.length > 0) {
      setZones(globalZonesCache);
      setLoading(false);
    }

    // 3. Trigger silent background revalidation without blocking UI
    silentSyncZones().then(() => {
      setLoading(false);
    });

    // 4. Ensure single shared realtime channel
    initZonesRealtimeChannel();

    return () => {
      globalZonesListeners.delete(listener);
    };
  }, []);

  return { zones, loading };
}
