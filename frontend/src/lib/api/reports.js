import { createClient } from '../supabase/client.js';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

/**
 * Utility: Compress Image File using HTML Canvas
 * Reduces large smartphone photos (5MB+) to optimized JPEG DataURL (<200KB)
 */
export async function compressImage(file, maxWidth = 1024, maxHeight = 1024, quality = 0.75) {
  if (!file) return null;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

/**
 * Submit Citizen Report to Database
 * Uses Supabase Direct Insert with automatic failover to Backend REST API (/api/v1/reports)
 */
export async function createCitizenReport(reportData) {
  const { violationType, vehiclePlate, locationName, description, photoUrl } = reportData;

  const payload = {
    violation_type: violationType,
    vehicle_plate: vehiclePlate ? vehiclePlate.toUpperCase() : null,
    location_name: locationName || 'Bahu Jalan Perkotaan',
    description: description || null,
    photo_url: photoUrl || null,
    status: 'pending',
  };

  // 1. Try Supabase Client Direct Insert
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('citizen_reports')
      .insert(payload)
      .select()
      .single();

    if (!error && data) {
      return { success: true, data };
    }
    console.warn('Supabase direct insert issue, falling back to REST API:', error?.message);
  } catch (err) {
    console.warn('Supabase client error, falling back to REST API:', err.message);
  }

  // 2. Fallback to Backend REST API Endpoint
  const res = await fetch(`${API_BASE}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      violationType,
      vehiclePlate,
      locationName,
      description,
      photoUrl,
    }),
  });

  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(json.error || json.message || 'Gagal menyimpan laporan ke database.');
  }

  return { success: true, data: json.data };
}

/**
 * Fetch Citizen Reports Feed
 * Uses Supabase Select with automatic failover to Backend REST API (/api/v1/reports)
 */
export async function fetchCitizenReports() {
  // 1. Try Supabase Client Select
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('citizen_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      return data;
    }
    console.warn('Supabase fetch issue, trying REST API fallback:', error?.message);
  } catch (err) {
    console.warn('Supabase fetch issue, trying REST API fallback:', err.message);
  }

  // 2. Fallback to Backend REST API Endpoint
  const res = await fetch(`${API_BASE}/reports`);
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(json.error || 'Gagal mengambil data laporan dari database.');
  }

  return json.data || [];
}

/**
 * Update Citizen Report Status
 * Uses Supabase Update with automatic failover to Backend REST API (/api/v1/reports)
 */
export async function updateCitizenReportStatus(id, status) {
  // 1. Try Supabase Client Update
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('citizen_reports')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (!error) {
      return { success: true, data };
    }
    console.warn('Supabase update issue, trying REST API fallback:', error?.message);
  } catch (err) {
    console.warn('Supabase update issue, trying REST API fallback:', err.message);
  }

  // 2. Fallback to Backend REST API Endpoint
  const res = await fetch(`${API_BASE}/reports`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, status }),
  });

  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(json.error || 'Gagal memperbarui status laporan.');
  }

  return { success: true, data: json.data };
}
