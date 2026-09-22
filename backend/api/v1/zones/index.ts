import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../../_lib/cors';
import { sendError, sendSuccess } from '../../_lib/response';
import { queryDb } from '../../_lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    try {
      const rows = await queryDb('SELECT id, name, max_truck_capacity, operating_hours_start, operating_hours_end, status, zone_type, priority_level, created_at FROM public.zones ORDER BY created_at DESC');
      return sendSuccess(res, rows);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  if (req.method === 'POST') {
    const { name, maxTruckCapacity, operatingHoursStart, operatingHoursEnd, zoneType, priorityLevel, wktPolygon } = req.body;

    try {
      const defaultWkt = wktPolygon || 'POLYGON((106.810 -6.180, 106.820 -6.180, 106.820 -6.190, 106.810 -6.190, 106.810 -6.180))';
      const rows = await queryDb(
        `INSERT INTO public.zones (name, boundary_polygon, max_truck_capacity, operating_hours_start, operating_hours_end, zone_type, priority_level)
         VALUES ($1, ST_GeomFromText($2, 4326)::geography, $3, $4, $5, $6, $7)
         RETURNING id, name, max_truck_capacity, status, zone_type, created_at`,
        [name, defaultWkt, maxTruckCapacity || 10, operatingHoursStart || '06:00', operatingHoursEnd || '22:00', zoneType || 'logistics', priorityLevel || 'normal']
      );
      return sendSuccess(res, rows[0], 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  return sendError(res, 'Method not allowed', 405);
}
