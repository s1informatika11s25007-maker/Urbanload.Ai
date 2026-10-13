import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../../_lib/cors';
import { sendSuccess, sendError } from '../../_lib/response';
import { loadSystemConfig } from '../../../src/engine/config';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const configMap = await loadSystemConfig();
    const configArray = Array.from(configMap.values());
    return sendSuccess(res, {
      count: configArray.length,
      configs: configArray
    });
  } catch (err: any) {
    return sendError(res, `Gagal memuat sistem konfigurasi: ${err.message}`, 500);
  }
}
