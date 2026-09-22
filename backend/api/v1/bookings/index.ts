import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../../_lib/cors';
import { sendError, sendSuccess } from '../../_lib/response';
import { queryDb } from '../../_lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    try {
      const rows = await queryDb(`
        SELECT b.id, b.user_id, b.zone_id, b.truck_dimension, b.time_window_start, b.time_window_end, b.status, b.notes, b.created_at, z.name as zone_name
        FROM public.bookings b
        LEFT JOIN public.zones z ON b.zone_id = z.id
        ORDER BY b.created_at DESC
      `);
      return sendSuccess(res, rows);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  if (req.method === 'POST') {
    const { userId, zoneId, truckDimension, timeWindowStart, timeWindowEnd, notes } = req.body;

    if (!zoneId || !timeWindowStart || !timeWindowEnd) {
      return sendError(res, 'Field zoneId, timeWindowStart, dan timeWindowEnd wajib diisi');
    }

    try {
      const defaultUser = userId || '00000000-0000-0000-0000-000000000000';
      const defaultDim = truckDimension || { lengthCm: 800, widthCm: 220, heightCm: 320, weightKg: 8000 };

      const rows = await queryDb(
        `INSERT INTO public.bookings (user_id, zone_id, truck_dimension, time_window_start, time_window_end, notes, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'confirmed')
         RETURNING id, user_id, zone_id, time_window_start, time_window_end, status, created_at`,
        [defaultUser, zoneId, JSON.stringify(defaultDim), timeWindowStart, timeWindowEnd, notes || '']
      );

      return sendSuccess(res, rows[0], 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  return sendError(res, 'Method not allowed', 405);
}
