import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../../_lib/cors';
import { sendError } from '../../_lib/response';

/**
 * [KILL LIST #1] Hardcoded Simulation Trigger - DEPRECATED & REMOVED
 * Endpoint simulasi artifisial ini telah dinonaktifkan untuk mendukung
 * lingkungan produksi deterministik dan mencegah pemborosan resource serverless.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  return sendError(
    res,
    'Endpoint simulasi demo artifisial telah dihapus. Sistem beroperasi 100% pada data fisik dan solver deterministik real-time.',
    410
  );
}
