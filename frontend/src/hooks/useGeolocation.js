import { useEffect, useState, useCallback } from 'react';

export function useGeolocation(options = {}) {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
    autoStart = true,
  } = options;

  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isTracking, setIsTracking] = useState(autoStart);

  const msToKmh = (ms) => {
    if (ms === null || isNaN(ms)) return null;
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
    let msg = 'Gagal mendapatkan lokasi GPS.';
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
    navigator.geolocation.getCurrentPosition(handlePositionSuccess, handlePositionError, { enableHighAccuracy, timeout, maximumAge });
  }, [enableHighAccuracy, timeout, maximumAge, handlePositionSuccess, handlePositionError]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) return;
    if (!isTracking) return;
    const watchId = navigator.geolocation.watchPosition(handlePositionSuccess, handlePositionError, { enableHighAccuracy, timeout, maximumAge });
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
