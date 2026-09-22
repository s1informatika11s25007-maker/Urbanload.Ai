const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export async function fetchBookings() {
  const res = await fetch(`${API_BASE}/bookings`);
  return res.json();
}

export async function createBooking(payload) {
  const res = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}
