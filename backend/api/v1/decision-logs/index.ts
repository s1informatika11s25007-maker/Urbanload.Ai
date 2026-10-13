import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../../_lib/cors';
import { sendSuccess, sendError } from '../../_lib/response';
import { queryDb } from '../../../src/config/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const limit = Math.min(100, Number(req.query.limit) || 20);
    const zoneId = req.query.zoneId;

    let query = `
      SELECT d.id, d.booking_id, d.zone_id, d.bay_id, d.solver_status, d.input_snapshot,
             d.model_version, d.solver_params, d.objective_value, d.alternatives_evaluated,
             d.binding_constraints, d.decision_reason, d.is_simulated, d.created_at,
             z.name as zone_name, b.bay_number
      FROM public.decision_logs d
      LEFT JOIN public.zones z ON d.zone_id = z.id
      LEFT JOIN public.bays b ON d.bay_id = b.id
    `;
    const params: any[] = [];

    if (zoneId) {
      query += ` WHERE d.zone_id = $1`;
      params.push(zoneId);
    }

    query += ` ORDER BY d.created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const rows = await queryDb(query, params);

    return sendSuccess(res, {
      count: rows.length,
      logs: rows
    });
  } catch (err: any) {
    return sendError(res, `Gagal mengambil decision log: ${err.message}`, 500);
  }
}
