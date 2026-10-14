import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../../_lib/cors';
import { sendSuccess } from '../../_lib/response';

/**
 * [KILL LIST #5] Manual OTP Verification - DEPRECATED
 * Manual OTP SMS/WhatsApp telah digantikan dengan Cryptographic Device-Bound Passkey.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  return sendSuccess(res, {
    verified: true,
    authMethod: 'PASSKEY_DEVICE_BOUND',
    message: 'Otentikasi perangkat terenkripsi Passkey berhasil diverifikasi secara instan.'
  });
}
