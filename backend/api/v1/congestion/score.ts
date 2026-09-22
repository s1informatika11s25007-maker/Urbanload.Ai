import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../../_lib/cors';
import { sendError, sendSuccess } from '../../_lib/response';
import { supabaseAdmin } from '../../_lib/supabaseAdmin';
import { calculateCongestionScore } from '../../_lib/congestion';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { data: zones, error: zoneError } = await supabaseAdmin.from('zones').select('id, name, max_truck_capacity');
    if (zoneError) return sendError(res, zoneError.message, 500);

    const { data: bookings } = await supabaseAdmin.from('bookings').select('zone_id, status');

    const result = (zones || []).map((zone) => {
      const activeBookings = (bookings || []).filter(
        (b) => b.zone_id === zone.id && (b.status === 'confirmed' || b.status === 'pending')
      ).length;

      const score = calculateCongestionScore(activeBookings, zone.max_truck_capacity);
      let level: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (score >= 4 && score <= 6) level = 'medium';
      if (score >= 7 && score <= 8) level = 'high';
      if (score >= 9) level = 'critical';

      return {
        zoneId: zone.id,
        zoneName: zone.name,
        activeBookings,
        capacityPerHour: zone.max_truck_capacity,
        score,
        level,
        updatedAt: new Date().toISOString(),
      };
    });

    return sendSuccess(res, result);
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
}
