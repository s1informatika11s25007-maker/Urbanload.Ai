const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export async function generateQRToken(bookingId) {
  const res = await fetch(`${API_BASE}/qr/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookingId }),
  });
  return res.json();
}

export async function verifyQRToken(payload) {
  const res = await fetch(`${API_BASE}/qr/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}
