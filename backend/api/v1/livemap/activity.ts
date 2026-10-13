import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../../_lib/cors';
import { sendError, sendSuccess } from '../../_lib/response';
import { supabaseAdmin } from '../../_lib/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { data: bookings, error } = await supabaseAdmin
      .from('bookings')
      .select('id, vehicle_plate, status, created_at, updated_at, zones(name), profiles(full_name)')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) return sendError(res, error.message, 500);

    const activities = (bookings || []).map((b) => {
      const zoneName = (b.zones as any)?.name || 'Zona Logistik';
      const driverName = (b.profiles as any)?.full_name || 'Kurir';
      const timeAgo = formatTimeAgo(new Date(b.created_at));

      return {
        id: b.id,
        type: b.status === 'confirmed' ? 'booking_confirmed' : b.status === 'active' ? 'qr_scanned' : 'booking_new',
        message: `Booking ${b.vehicle_plate}: ${zoneName} (${b.status.toUpperCase()}) — ${driverName}`,
        time: timeAgo,
        createdAt: b.created_at,
      };
    });

    return sendSuccess(res, activities);
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${Math.max(1, seconds)} detik lalu`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return `${Math.floor(hours / 24)} hari lalu`;
}
