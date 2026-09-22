import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../_lib/cors';
import { sendSuccess } from '../_lib/response';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  return sendSuccess(res, {
    status: 'healthy',
    system: 'UrbanLoad.AI Backend API',
    version: '1.0.0',
    serverTime: new Date().toISOString(),
  });
}
