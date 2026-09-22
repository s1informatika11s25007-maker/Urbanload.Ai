import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../../_lib/cors';
import { sendError, sendSuccess } from '../../_lib/response';
import { queryDb } from '../../_lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return sendError(res, 'Method not allowed', 405);

  const { lat, lng } = req.body;
  if (!lat || !lng) return sendError(res, 'Koordinat lat dan lng wajib diisi');

  try {
    const rows = await queryDb('SELECT * FROM check_geofence($1, $2)', [Number(lat), Number(lng)]);
    const insideZone = rows.length > 0;
    return sendSuccess(res, {
      insideZone,
      matchingZones: rows,
    });
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
}
