import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../../_lib/cors';
import { sendError, sendSuccess } from '../../_lib/response';
import { queryDb } from '../../_lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const rows = await queryDb(`
      SELECT b.id, b.truck_dimension, b.status, z.name as zone_name
      FROM public.bookings b
      LEFT JOIN public.zones z ON b.zone_id = z.id
      WHERE b.status IN ('confirmed', 'pending')
    `);

    const trucks = rows.map((b, idx) => {
      let dim = b.truck_dimension;
      if (typeof dim === 'string') {
        try { dim = JSON.parse(dim); } catch (e) { dim = {}; }
      }
      const plate = dim?.licensePlate || `B ${1000 + idx * 111} XYZ`;

      return {
        id: b.id,
        licensePlate: plate,
        zoneName: b.zone_name || 'Zona A - Pasar Tanah Abang',
        status: idx % 2 === 0 ? 'loading' : 'in_transit',
        speedKmh: idx % 2 === 0 ? 0 : 28 + ((idx * 7) % 25),
        lat: -6.182 + (idx * 0.012),
        lng: 106.812 + (idx * 0.015),
      };
    });

    return sendSuccess(res, trucks);
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
}
