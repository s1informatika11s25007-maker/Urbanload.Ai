import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '@/middleware/cors';
import { sendError, sendSuccess } from '@/utils/response';
import { getAllZones, createZone } from '@/modules/zones';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    try {
      const rows = await getAllZones();
      return sendSuccess(res, rows);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  if (req.method === 'POST') {
    const { name, maxTruckCapacity, operatingHoursStart, operatingHoursEnd, zoneType, priorityLevel, wktPolygon } = req.body || {};

    try {
      const newZone = await createZone({
        name,
        maxTruckCapacity,
        operatingHoursStart,
        operatingHoursEnd,
        zoneType,
        priorityLevel,
        wktPolygon,
      });
      return sendSuccess(res, newZone, 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  return sendError(res, 'Method not allowed', 405);
}
