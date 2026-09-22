import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../../_lib/cors';
import { sendError, sendSuccess } from '../../_lib/response';
import { queryDb } from '../../_lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const rows = await queryDb(`
      SELECT
        b.id,
        b.truck_dimension,
        b.status,
        b.time_window_start,
        b.time_window_end,
        z.name as zone_name,
        p.full_name as driver_name,
        ST_X(ST_Centroid(z.boundary_polygon::geometry)) as lng,
        ST_Y(ST_Centroid(z.boundary_polygon::geometry)) as lat
      FROM public.bookings b
      LEFT JOIN public.zones z ON b.zone_id = z.id
      LEFT JOIN public.profiles p ON b.user_id = p.id
      WHERE b.status IN ('confirmed', 'pending')
      ORDER BY b.created_at DESC
    `);

    const trucks = rows.map((b) => {
      let dim = b.truck_dimension;
      if (typeof dim === 'string') {
        try { dim = JSON.parse(dim); } catch (e) { dim = {}; }
      }
      const plate = dim?.licensePlate || 'B 1000 UNL';

      return {
        id: b.id,
        licensePlate: plate,
        driverName: b.driver_name || 'Kurir Logistik',
        zoneName: b.zone_name || 'Zona Logistik Active',
        status: b.status === 'confirmed' ? 'in_transit' : 'loading',
        speedKmh: b.status === 'confirmed' ? 24 : 0,
        lat: Number(b.lat) || -6.1820,
        lng: Number(b.lng) || 106.8150,
      };
    });

    return sendSuccess(res, trucks);
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
}
