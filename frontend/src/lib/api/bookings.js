import { createClient } from '../supabase/client.js';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

/**
 * Fetch Bookings with automatic failover (Supabase Direct -> REST API)
 */
export async function fetchBookings() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('bookings')
      .select('*, zones(name), profiles(full_name)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      return { success: true, data };
    }
  } catch (err) {
    console.warn('Supabase fetch bookings notice:', err.message);
  }

  const res = await fetch(`${API_BASE}/bookings`);
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(json.error || 'Gagal mengambil data booking.');
  }
  return { success: true, data: json.data || [] };
}

/**
 * Create SmartSlot Booking with automatic failover & profile ID resolution
 */
export async function createBooking(payload) {
  const {
    zoneId,
    vehiclePlate,
    cargoType,
    truckDimension,
    timeWindowStart,
    timeWindowEnd,
    notes,
  } = payload;

  // 1. Attempt Direct Insert via Supabase Client
  try {
    const supabase = createClient();
    let activeUserId = payload.userId;

    if (!activeUserId) {
      const { data: userSession } = await supabase.auth.getUser();
      if (userSession?.user?.id) {
        activeUserId = userSession.user.id;
      }
    }

    if (!activeUserId) {
      const { data: latestProfile } = await supabase
        .from('profiles')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestProfile?.id) {
        activeUserId = latestProfile.id;
      }
    }

    if (activeUserId) {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          user_id: activeUserId,
          zone_id: zoneId,
          vehicle_plate: (vehiclePlate || 'B-9000-UL').toUpperCase(),
          cargo_type: cargoType || 'Bahan Pokok Logistik',
          time_window_start: timeWindowStart,
          time_window_end: timeWindowEnd,
          status: 'confirmed',
          notes: notes || '',
        })
        .select('*, zones(name)')
        .single();

      if (!error && data) {
        return { success: true, data };
      }
      console.warn('Supabase booking insert issue, trying REST API fallback:', error?.message);
    }
  } catch (err) {
    console.warn('Supabase booking client error, trying REST API fallback:', err.message);
  }

  // 2. Fallback to Backend REST API Endpoint
  const res = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      zoneId,
      vehiclePlate,
      cargoType,
      truckDimension,
      timeWindowStart,
      timeWindowEnd,
      notes,
    }),
  });

  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(json.error || json.message || 'Gagal menyimpan booking ke database.');
  }

  return { success: true, data: json.data };
}

/**
 * Delete Booking with automatic failover
 */
export async function deleteBooking(bookingId) {
  try {
    const supabase = createClient();
    const { error } = await supabase.from('bookings').delete().eq('id', bookingId);
    if (!error) return { success: true, id: bookingId };
  } catch (err) {
    console.warn('Supabase delete notice:', err.message);
  }

  const res = await fetch(`${API_BASE}/bookings?id=${bookingId}`, {
    method: 'DELETE',
  });
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(json.error || 'Gagal menghapus booking dari database.');
  }
  return { success: true, data: json.data };
}

export async function allocateSlotWithSolver(payload) {
  const res = await fetch(`${API_BASE}/solver/allocate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function fetchDecisionLogs(zoneId) {
  const url = zoneId ? `${API_BASE}/decision-logs?zoneId=${zoneId}` : `${API_BASE}/decision-logs`;
  const res = await fetch(url);
  return res.json();
}

export async function runSimulation(seed = 42, totalVehicles = 20) {
  const res = await fetch(`${API_BASE}/simulation/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seed, totalVehicles }),
  });
  return res.json();
}

export async function runWhatIfAnalysis(payload) {
  const res = await fetch(`${API_BASE}/simulation/what-if`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function fetchSystemConfigs() {
  const res = await fetch(`${API_BASE}/config`);
  return res.json();
}

export async function fetchIllegalDwellClusters() {
  const res = await fetch(`${API_BASE}/geofence/cluster-dwell`);
  return res.json();
}

export async function sendLLMMessage(message, zoneId) {
  const res = await fetch(`${API_BASE}/llm/assistant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, zoneId }),
  });
  return res.json();
}
