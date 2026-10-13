import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../../_lib/cors';
import { sendError, sendSuccess } from '../../_lib/response';
import { queryDb } from '../../_lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return sendError(res, 'Method not allowed', 405);

  const { lat, lng, zoneId } = req.body;
  if (!lat || !lng) return sendError(res, 'Koordinat lat dan lng wajib diisi', 400);

  try {
    let distanceMeter = 50;
    let zoneName = 'Zona Logistik';

    if (zoneId) {
      const rows = await queryDb(
        `SELECT id, name, ST_Distance(
          boundary_polygon,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
        ) as dist_meters FROM public.zones WHERE id = $3`,
        [Number(lng), Number(lat), zoneId]
      );
      if (rows && rows.length > 0) {
        distanceMeter = Math.round(Number(rows[0].dist_meters) || 0);
        zoneName = rows[0].name;
      }
    } else {
      const rows = await queryDb(
        `SELECT id, name, ST_Distance(
          boundary_polygon,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
        ) as dist_meters FROM public.zones ORDER BY dist_meters ASC LIMIT 1`,
        [Number(lng), Number(lat)]
      );
      if (rows && rows.length > 0) {
        distanceMeter = Math.round(Number(rows[0].dist_meters) || 0);
        zoneName = rows[0].name;
      }
    }

    const estimatedMinutes = Math.max(1, Math.ceil(distanceMeter / 500));
    const inBufferZone = distanceMeter <= 200;

    return sendSuccess(res, {
      zoneId,
      zoneName,
      distanceMeter,
      estimatedMinutes,
      inBufferZone,
    });
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
}
