import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../../../_lib/cors';
import { sendError, sendSuccess } from '../../../_lib/response';
import { supabaseAdmin } from '../../../_lib/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;
  if (!id) return sendError(res, 'Zone ID wajib diisi');

  try {
    const { data: zone, error } = await supabaseAdmin.from('zones').select('*').eq('id', id).single();
    if (error || !zone) return sendError(res, 'Zona tidak ditemukan', 404);

    const { data: bookings } = await supabaseAdmin
      .from('bookings')
      .select('time_window_start, time_window_end')
      .eq('zone_id', id)
      .in('status', ['pending', 'confirmed']);

    const maxCap = zone.max_truck_capacity || 10;
    const activeCount = bookings ? bookings.length : 0;
    const remaining = Math.max(maxCap - activeCount, 0);

    const slots = [
      { time: '08:00 - 09:00', remainingCapacity: remaining, maxDimension: '12m x 2.5m x 3.8m', status: remaining > 2 ? 'available' : remaining > 0 ? 'almost_full' : 'full' },
      { time: '09:00 - 10:00', remainingCapacity: Math.max(remaining - 1, 0), maxDimension: '12m x 2.5m x 3.8m', status: remaining - 1 > 0 ? 'available' : 'full' },
      { time: '10:00 - 11:00', remainingCapacity: remaining, maxDimension: '12m x 2.5m x 3.8m', status: remaining > 0 ? 'available' : 'full' },
      { time: '11:00 - 12:00', remainingCapacity: remaining, maxDimension: '12m x 2.5m x 3.8m', status: remaining > 0 ? 'available' : 'full' },
      { time: '14:00 - 15:00', remainingCapacity: remaining, maxDimension: '12m x 2.5m x 3.8m', status: remaining > 0 ? 'available' : 'full' },
    ];

    return sendSuccess(res, { zoneId: id, zoneName: zone.name, maxCapacity: maxCap, slots });
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
}
