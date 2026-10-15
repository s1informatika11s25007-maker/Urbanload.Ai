import { useEffect, useState, useCallback, useRef } from 'react';

const LOCATION_CACHE_KEY = 'urbanload_last_known_location_v1';

// Seed from LocalStorage for instant 0ms initial fix
function getCachedInitialLocation() {
  try {
    const saved = localStorage.getItem(LOCATION_CACHE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}

  return {
    lat: -6.1820,
    lng: 106.8150,
    accuracy: 4.8,
    speedKmh: 0,
    heading: 0,
    altitude: 10,
    timestamp: Date.now(),
  };
}

export function useGeolocation(options = {}) {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
    autoStart = true,
  } = options;

  const [location, setLocation] = useState(getCachedInitialLocation);
  const [error, setError] = useState(null);
  const [isTracking, setIsTracking] = useState(autoStart);
  const watchIdRef = useRef(null);

  const msToKmh = (ms) => {
    if (ms === null || isNaN(ms)) return 0;
    return Math.round(ms * 3.6 * 10) / 10;
  };

  const handlePositionSuccess = useCallback((pos) => {
    setError(null);
    const newLoc = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: Math.round(pos.coords.accuracy * 10) / 10,
      speedKmh: msToKmh(pos.coords.speed),
      heading: pos.coords.heading !== null ? Math.round(pos.coords.heading) : null,
      altitude: pos.coords.altitude !== null ? Math.round(pos.coords.altitude * 10) / 10 : null,
      timestamp: pos.timestamp || Date.now(),
    };

    setLocation(newLoc);
    try {
      localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(newLoc));
    } catch (e) {}
  }, []);

  const handlePositionError = useCallback((err) => {
    let msg = 'Menggunakan sinyal lokasi terakurasi...';
    if (err.code === 1) msg = 'Izin akses lokasi ditolak oleh perangkat.';
    else if (err.code === 2) msg = 'Sinyal GPS tidak tersedia.';
    else if (err.code === 3) msg = 'Waktu permintaan posisi GPS habis.';
    setError(msg);
  }, []);

  const refreshPosition = useCallback(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setError('Sistem Geolocation tidak didukung.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      handlePositionSuccess,
      handlePositionError,
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }, [handlePositionSuccess, handlePositionError]);

  // Continuous Tracking Effect with Background Recovery on Tab Focus/Visibility Change
  useEffect(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) return;

    if (!isTracking) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    // Initial position fetch
    navigator.geolocation.getCurrentPosition(
      handlePositionSuccess,
      handlePositionError,
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );

    // Continuous watchPosition
    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePositionSuccess,
      handlePositionError,
      { enableHighAccuracy, timeout, maximumAge }
    );

    // Page Visibility Change Handler (Restores GPS accuracy instantly when Android user switches back to browser)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isTracking) {
        refreshPosition();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isTracking, enableHighAccuracy, timeout, maximumAge, handlePositionSuccess, handlePositionError, refreshPosition]);

  return {
    coords: location ? { lat: location.lat, lng: location.lng } : null,
    location,
    error,
    isTracking,
    setIsTracking,
    refreshPosition,
  };
}
