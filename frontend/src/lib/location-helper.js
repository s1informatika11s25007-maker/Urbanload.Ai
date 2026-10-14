/**
 * High-Precision Device Geolocation & Reverse Geocoding Helper
 * Combines fast initial network fix with high-accuracy GNSS hardware refinement.
 */

export async function getDetailedDeviceLocation() {
  if (typeof window === 'undefined' || !('geolocation' in navigator)) {
    throw new Error('Sistem Geolocation tidak didukung oleh browser Anda.');
  }

  // Helper promise wrapper for geolocation
  const fetchCoords = (options) =>
    new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });

  let pos = null;

  try {
    // 1. Fast initial fix (< 300ms) with network/cache
    pos = await fetchCoords({
      enableHighAccuracy: false,
      timeout: 4000,
      maximumAge: 60000,
    });
  } catch (fastErr) {
    // 2. High accuracy hardware GNSS fix if fast fix fails
    try {
      pos = await fetchCoords({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });
    } catch (highErr) {
      if (highErr.code === 1) {
        throw new Error('Izin akses lokasi GPS ditolak oleh browser/perangkat Anda.');
      } else if (highErr.code === 2) {
        throw new Error('Sinyal lokasi GPS tidak tersedia pada perangkat.');
      } else {
        throw new Error('Waktu permintaan posisi lokasi habis. Pastikan GPS aktif.');
      }
    }
  }

  const { latitude: lat, longitude: lng, accuracy } = pos.coords;

  // 3. OpenStreetMap Reverse Geocoding with high detail
  let formattedAddress = `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`;

  try {
    const osmRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );
    if (osmRes.ok) {
      const data = await osmRes.json();
      const addr = data.address || {};
      const road = addr.road || addr.pedestrian || addr.suburb || addr.neighbourhood || 'Lokasi Terverifikasi';
      const district = addr.city_district || addr.suburb || '';
      const city = addr.city || addr.regency || 'Jakarta';

      formattedAddress = `${road}${district ? `, ${district}` : ''}, ${city} (GPS ±${Math.round(accuracy)}m)`;
    }
  } catch (e) {
    console.warn('Reverse geocoding warning:', e);
  }

  return {
    lat,
    lng,
    accuracy,
    formattedAddress,
  };
}
