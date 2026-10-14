import { createClient } from './supabase/client.js';

/**
 * Project-Specific Clean Logout Helper
 * Clears all UrbanLoad.AI project keys from localStorage, sessionStorage, and browser caches,
 * ensuring no stale data or token bloat remains upon logout.
 */
export async function performCleanLogout(navigate) {
  try {
    const supabase = createClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('Supabase signOut warning:', err);
  }

  // 1. Clear project-specific localStorage keys
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (
      key &&
      (key.startsWith('sb-') ||
        key.startsWith('urbanload') ||
        key.startsWith('driver_') ||
        key.startsWith('telemetry_') ||
        key.startsWith('groq_') ||
        key.includes('supabase'))
    ) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));

  // 2. Clear project-specific sessionStorage keys
  const sessionKeysToRemove = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (
      key &&
      (key.startsWith('sb-') ||
        key.startsWith('urbanload') ||
        key.startsWith('driver_') ||
        key.startsWith('telemetry_') ||
        key.startsWith('groq_') ||
        key.includes('supabase'))
    ) {
      sessionKeysToRemove.push(key);
    }
  }
  sessionKeysToRemove.forEach((k) => sessionStorage.removeItem(k));

  // 3. Clear browser cache for UrbanLoad.AI
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name.includes('urbanload'))
          .map((name) => caches.delete(name))
      );
    } catch (e) {
      console.warn('Cache clearing warning:', e);
    }
  }

  // 4. Redirect to login
  if (navigate) {
    navigate('/login');
  } else {
    window.location.href = '/login';
  }
}
