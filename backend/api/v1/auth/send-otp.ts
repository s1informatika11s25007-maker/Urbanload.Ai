import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../../_lib/cors';
import { sendError, sendSuccess } from '../../_lib/response';

/**
 * [KILL LIST #5] Manual OTP Authentication - DEPRECATED
 * Manual OTP SMS/WhatsApp telah digantikan dengan Cryptographic Device-Bound Passkey.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  return sendSuccess(res, {
    deprecated: true,
    authMethod: 'PASSKEY_DEVICE_BOUND',
    message: 'Pengiriman OTP manual telah dinonaktifkan. Sistem menggunakan Otentikasi Terenkripsi Passkey Perangkat.'
  });
}
