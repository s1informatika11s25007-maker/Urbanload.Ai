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
        id,
        name,
        max_truck_capacity,
        zone_type,
        priority_level,
        ST_AsGeoJSON(boundary_polygon::geometry) as boundary_geojson
      FROM public.zones
      ORDER BY created_at DESC
    `);

    const features = rows.map((z, idx) => {
      let geom: any = null;
      if (z.boundary_geojson) {
        try { geom = JSON.parse(z.boundary_geojson); } catch (e) { geom = null; }
      }

      if (!geom || !geom.coordinates) {
        const baseLng = 106.812 + (idx % 4) * 0.03;
        const baseLat = -6.185 - Math.floor(idx / 4) * 0.03;
        geom = {
          type: 'Polygon',
          coordinates: [[
            [baseLng, baseLat],
            [baseLng + 0.02, baseLat],
            [baseLng + 0.02, baseLat - 0.015],
            [baseLng, baseLat - 0.015],
            [baseLng, baseLat]
          ]],
        };
      }

      return {
        type: 'Feature',
        id: z.id,
        properties: {
          id: z.id,
          name: z.name,
          capacity: z.max_truck_capacity,
          zoneType: z.zone_type,
          priority: z.priority_level,
        },
        geometry: geom,
      };
    });

    return sendSuccess(res, {
      type: 'FeatureCollection',
      features,
    });
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
}
