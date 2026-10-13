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
      .select('time_window_start, time_window_end, status')
      .eq('zone_id', id)
      .in('status', ['pending', 'confirmed', 'active']);

    const maxCap = zone.max_truck_capacity || 10;
    const startHour = parseInt((zone.operating_hours_start || '06:00').split(':')[0], 10) || 6;
    const endHour = parseInt((zone.operating_hours_end || '22:00').split(':')[0], 10) || 22;

    const slots = [];
    for (let h = startHour; h < endHour; h += 2) {
      const startStr = `${h.toString().padStart(2, '0')}:00`;
      const endStr = `${(h + 2).toString().padStart(2, '0')}:00`;
      const timeRange = `${startStr} - ${endStr}`;

      const bookedInWindow = (bookings || []).filter((b) => {
        if (!b.time_window_start) return false;
        const bHour = new Date(b.time_window_start).getHours();
        return bHour >= h && bHour < h + 2;
      }).length;

      const remaining = Math.max(maxCap - bookedInWindow, 0);
      const status = remaining > 2 ? 'available' : remaining > 0 ? 'almost_full' : 'full';

      slots.push({
        time: timeRange,
        remainingCapacity: remaining,
        maxCapacity: maxCap,
        status,
      });
    }

    return sendSuccess(res, { zoneId: id, zoneName: zone.name, maxCapacity: maxCap, slots });
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
}
