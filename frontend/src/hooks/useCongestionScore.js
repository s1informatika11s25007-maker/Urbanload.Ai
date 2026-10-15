import { useEffect, useState } from 'react';
import { fetchCongestionScores } from '../lib/api/congestion.js';

const LOCAL_STORAGE_KEY = 'urbanload_congestion_cache_v1';
let globalScoresCache = null;
let globalScoresListeners = new Set();

try {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) globalScoresCache = JSON.parse(stored);
} catch (e) {}

async function silentSyncCongestion() {
  try {
    const res = await fetchCongestionScores();
    if (res && res.success && res.data) {
      globalScoresCache = res.data;
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(res.data));
      } catch (e) {}
      globalScoresListeners.forEach((fn) => fn(res.data));
    }
  } catch (e) {
    console.warn('Silent congestion sync warning:', e);
  }
}

export function useCongestionScore() {
  const [scores, setScores] = useState(globalScoresCache || []);

  useEffect(() => {
    const listener = (data) => setScores(data);
    globalScoresListeners.add(listener);

    if (globalScoresCache) {
      setScores(globalScoresCache);
    }

    silentSyncCongestion();

    return () => globalScoresListeners.delete(listener);
  }, []);

  return scores;
}
