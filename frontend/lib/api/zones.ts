const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';

export async function fetchZones() {
  const res = await fetch(`${API_BASE}/zones`);
  return res.json();
}

export async function fetchAvailableSlots(zoneId: string) {
  const res = await fetch(`${API_BASE}/zones/${zoneId}/available-slots`);
  return res.json();
}
