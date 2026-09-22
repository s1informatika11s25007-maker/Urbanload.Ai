const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export async function fetchZones() {
  const res = await fetch(`${API_BASE}/zones`);
  return res.json();
}

export async function fetchAvailableSlots(zoneId) {
  const res = await fetch(`${API_BASE}/zones/${zoneId}/available-slots`);
  return res.json();
}
