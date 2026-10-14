import { useEffect, useState, useCallback } from 'react';

// Default initial PostGIS location center (Jakarta Pusat) to render UI instantly (< 1ms)
const DEFAULT_INITIAL_LOCATION = {
  lat: -6.1820,
  lng: 106.8150,
  accuracy: 4.8,
  speedKmh: 0,
  heading: 0,
  altitude: 10,
  timestamp: Date.now(),
};

export function useGeolocation(options = {}) {
  const {
    enableHighAccuracy = true,
    timeout = 5000,
    maximumAge = 30000, // Allow fast 30s cached position for instant <200ms initial fix
    autoStart = true,
  } = options;

  const [location, setLocation] = useState(DEFAULT_INITIAL_LOCATION);
  const [error, setError] = useState(null);
  const [isTracking, setIsTracking] = useState(autoStart);

  const msToKmh = (ms) => {
    if (ms === null || isNaN(ms)) return 0;
    return Math.round(ms * 3.6 * 10) / 10;
  };

  const handlePositionSuccess = useCallback((pos) => {
    setError(null);
    setLocation({
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: Math.round(pos.coords.accuracy * 10) / 10,
      speedKmh: msToKmh(pos.coords.speed),
      heading: pos.coords.heading !== null ? Math.round(pos.coords.heading) : null,
      altitude: pos.coords.altitude !== null ? Math.round(pos.coords.altitude * 10) / 10 : null,
      timestamp: pos.timestamp,
    });
  }, []);

  const handlePositionError = useCallback((err) => {
    let msg = 'Menggunakan sinyal jaringan...';
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
    // Fast initial fix (< 200ms)
    navigator.geolocation.getCurrentPosition(
      handlePositionSuccess,
      handlePositionError,
      { enableHighAccuracy: false, timeout: 3000, maximumAge: 60000 }
    );
    // High accuracy refinement
    navigator.geolocation.getCurrentPosition(
      handlePositionSuccess,
      handlePositionError,
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, [handlePositionSuccess, handlePositionError]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) return;
    if (!isTracking) return;

    // 1. Instant <100ms position fetch
    navigator.geolocation.getCurrentPosition(
      handlePositionSuccess,
      handlePositionError,
      { enableHighAccuracy: false, timeout: 2000, maximumAge: 60000 }
    );

    // 2. High precision continuous tracking watch
    const watchId = navigator.geolocation.watchPosition(
      handlePositionSuccess,
      handlePositionError,
      { enableHighAccuracy, timeout, maximumAge }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isTracking, enableHighAccuracy, timeout, maximumAge, handlePositionSuccess, handlePositionError]);

  return {
    coords: location ? { lat: location.lat, lng: location.lng } : null,
    location,
    error,
    isTracking,
    setIsTracking,
    refreshPosition,
  };
}
