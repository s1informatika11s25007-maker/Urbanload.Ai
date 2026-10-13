import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../../_lib/cors';
import { sendSuccess, sendError } from '../../_lib/response';
import { queryDb } from '../../../src/config/db';
import { getConfigValue } from '../../../src/engine/config';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const dwellThresholdMin = await getConfigValue('illegal_dwell_threshold_min', 15);
    const epsMeters = await getConfigValue('dbscan_eps_meters', 30);
    const minSamples = await getConfigValue('dbscan_min_samples', 3);

    const dwellThresholdSec = dwellThresholdMin * 60;

    const query = `
      WITH illegal_points AS (
        SELECT id, vehicle_plate, user_id, location, dwell_duration_sec, recorded_at,
               ST_X(location::geometry) as lng, ST_Y(location::geometry) as lat
        FROM public.vehicle_telemetry
        WHERE dwell_duration_sec >= $1 AND is_inside_geofence = false
      ),
      clustered AS (
        SELECT id, vehicle_plate, lng, lat, dwell_duration_sec, recorded_at,
               ST_ClusterDBSCAN(
                 ST_Transform(location::geometry, 3857),
                 eps := $2,
                 minpoints := $3
               ) OVER () as cluster_id
        FROM illegal_points
      )
      SELECT cluster_id,
             COUNT(*) as vehicle_count,
             AVG(lng) as centroid_lng,
             AVG(lat) as centroid_lat,
             AVG(dwell_duration_sec) / 60.0 as avg_dwell_min,
             json_agg(json_build_object('plate', vehicle_plate, 'dwellSec', dwell_duration_sec, 'recordedAt', recorded_at)) as vehicles
      FROM clustered
      WHERE cluster_id IS NOT NULL
      GROUP BY cluster_id
      ORDER BY vehicle_count DESC;
    `;

    const clusterRows = await queryDb(query, [dwellThresholdSec, epsMeters, minSamples]);

    return sendSuccess(res, {
      thresholds: {
        dwellThresholdMin,
        epsMeters,
        minSamples
      },
      totalClustersFound: clusterRows.length,
      clusters: clusterRows.map((r: any) => ({
        clusterId: r.cluster_id,
        vehicleCount: Number(r.vehicle_count),
        centroid: {
          lat: Number(r.centroid_lat),
          lng: Number(r.centroid_lng)
        },
        avgDwellMin: Math.round(Number(r.avg_dwell_min) * 10) / 10,
        vehicles: r.vehicles
      }))
    });

  } catch (err: any) {
    return sendError(res, `Gagal memproses kluster henti liar: ${err.message}`, 500);
  }
}
