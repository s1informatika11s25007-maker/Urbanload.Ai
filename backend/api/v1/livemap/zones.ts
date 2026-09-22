import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../../_lib/cors';
import { sendError, sendSuccess } from '../../_lib/response';
import { supabaseAdmin } from '../../_lib/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { data: zones, error } = await supabaseAdmin.from('zones').select('id, name, max_truck_capacity, status');
    if (error) return sendError(res, error.message, 500);

    const features = (zones || []).map((z, idx) => ({
      type: 'Feature',
      id: z.id,
      properties: { name: z.name, capacity: z.max_truck_capacity, status: z.status },
      geometry: {
        type: 'Polygon',
        coordinates: [
          idx === 0
            ? [[106.810, -6.180], [106.820, -6.180], [106.820, -6.190], [106.810, -6.190], [106.810, -6.180]]
            : idx === 1
            ? [[106.820, -6.170], [106.830, -6.170], [106.830, -6.180], [106.820, -6.180], [106.820, -6.170]]
            : [[106.870, -6.100], [106.890, -6.100], [106.890, -6.120], [106.870, -6.120], [106.870, -6.100]],
        ],
      },
    }));

    return sendSuccess(res, {
      type: 'FeatureCollection',
      features,
    });
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
}
