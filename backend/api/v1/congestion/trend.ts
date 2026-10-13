import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../../_lib/cors';
import { sendError, sendSuccess } from '../../_lib/response';
import { supabaseAdmin } from '../../_lib/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { data: zones, error: zError } = await supabaseAdmin.from('zones').select('id, name, max_truck_capacity').order('created_at', { ascending: true }).limit(3);
    if (zError) return sendError(res, zError.message, 500);

    const { data: bookings } = await supabaseAdmin.from('bookings').select('zone_id, created_at, status');
    const { data: scores } = await supabaseAdmin.from('congestion_scores').select('*').order('calculated_at', { ascending: true });

    const hours = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
    const activeZones = zones || [];

    const trendData = hours.map((hour, idx) => {
      const item: Record<string, any> = { hour };
      activeZones.forEach((z, zIdx) => {
        const key = zIdx === 0 ? 'zonaA' : zIdx === 1 ? 'zonaB' : 'zonaC';
        const zoneBookings = (bookings || []).filter((b) => b.zone_id === z.id).length;
        const maxCap = z.max_truck_capacity || 10;
        const scoreEntry = (scores || []).find((s) => s.zone_id === z.id);

        let calcScore = scoreEntry ? Number(scoreEntry.score) : Math.min(10, Math.max(1, (zoneBookings / maxCap) * 10));
        if (isNaN(calcScore) || calcScore === 0) calcScore = 1.0;

        item[key] = Number(calcScore.toFixed(1));
        item[`${key}Name`] = z.name;
      });
      return item;
    });

    return sendSuccess(res, trendData);
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
}
