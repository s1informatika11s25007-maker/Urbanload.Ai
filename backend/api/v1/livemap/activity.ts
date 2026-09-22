import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../../_lib/cors';
import { sendSuccess } from '../../_lib/response';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const activities = [
    { id: '1', type: 'booking_new', message: 'Booking baru: Zona A · 14:30 · B 1234 XYZ', time: '2 menit lalu' },
    { id: '2', type: 'qr_scanned', message: 'QR ter-scan: Booking UL-2025-091 · Petugas Budi', time: '5 menit lalu' },
    { id: '3', type: 'status_changed', message: 'Status berubah: pending → confirmed', time: '12 menit lalu' },
  ];

  return sendSuccess(res, activities);
}
