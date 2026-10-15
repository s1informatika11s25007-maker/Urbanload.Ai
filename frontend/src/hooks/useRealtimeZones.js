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

export function updateGlobalZones(newZones) {
  globalZonesCache = newZones;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newZones));
  } catch (e) {}

  // Notify all active page components seamlessly
  globalZonesListeners.forEach((listener) => listener(newZones));
}

export async function silentSyncZones() {
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

export const triggerZonesRefresh = silentSyncZones;

function initZonesRealtimeChannel() {
  if (isRealtimeSubscribed) return;
  isRealtimeSubscribed = true;

  const supabase = createClient();
  supabase
    .channel('global_zones_realtime_channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'zones' }, (payload) => {
      // Immediate realtime WebSocket update
      if (payload.eventType === 'INSERT' && payload.new) {
        if (globalZonesCache) {
          updateGlobalZones([payload.new, ...globalZonesCache.filter(z => z.id !== payload.new.id)]);
        }
      } else if (payload.eventType === 'UPDATE' && payload.new) {
        if (globalZonesCache) {
          updateGlobalZones(globalZonesCache.map(z => z.id === payload.new.id ? payload.new : z));
        }
      } else if (payload.eventType === 'DELETE' && payload.old) {
        if (globalZonesCache) {
          updateGlobalZones(globalZonesCache.filter(z => z.id !== payload.old.id));
        }
      }
      silentSyncZones();
    })
    .subscribe();
}

export function useRealtimeZones() {
  const [zones, setZones] = useState(globalZonesCache || []);
  const [loading, setLoading] = useState(!globalZonesCache || globalZonesCache.length === 0);

  useEffect(() => {
    const listener = (newZones) => {
      setZones(newZones);
      setLoading(false);
    };
    globalZonesListeners.add(listener);

    if (globalZonesCache && globalZonesCache.length > 0) {
      setZones(globalZonesCache);
      setLoading(false);
    }

    silentSyncZones().then(() => {
      setLoading(false);
    });

    initZonesRealtimeChannel();

    return () => {
      globalZonesListeners.delete(listener);
    };
  }, []);

  return { zones, loading };
}
