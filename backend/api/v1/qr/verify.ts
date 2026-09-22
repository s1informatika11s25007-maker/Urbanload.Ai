import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../../_lib/cors';
import { verifyQRSignature } from '../../_lib/qr-signature';
import { sendError, sendSuccess } from '../../_lib/response';
import { queryDb } from '../../_lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return sendError(res, 'Method not allowed', 405);

  const { bookingId, timestamp, signature } = req.body;

  if (!bookingId || !signature) {
    return sendError(res, 'Payload verifikasi QR tidak lengkap');
  }

  try {
    const isValidSignature = verifyQRSignature(bookingId, Number(timestamp || Date.now()), signature);
    const scanResult = isValidSignature ? 'valid' : 'invalid';

    if (bookingId && bookingId.length === 36) {
      await queryDb(
        `INSERT INTO public.qr_tokens (booking_id, signature, expires_at, scanned_at, scan_result)
         VALUES ($1, $2, now() + interval '1 hour', now(), $3)`,
        [bookingId, signature, scanResult]
      );
    }

    if (!isValidSignature) {
      return sendSuccess(res, { valid: false, scanResult: 'invalid', reason: 'Invalid signature HMAC-SHA256' });
    }

    return sendSuccess(res, {
      valid: true,
      scanResult: 'valid',
      bookingId,
      scannedAt: new Date().toISOString(),
      locationValid: true,
    });
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
}
