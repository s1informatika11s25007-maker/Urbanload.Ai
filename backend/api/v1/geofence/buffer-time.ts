import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../../_lib/cors';
import { sendError, sendSuccess } from '../../_lib/response';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return sendError(res, 'Method not allowed', 405);

  const { lat, lng, zoneId } = req.body;
  return sendSuccess(res, {
    zoneId,
    distanceMeter: 45,
    estimatedMinutes: 2,
    inBufferZone: true,
  });
}
