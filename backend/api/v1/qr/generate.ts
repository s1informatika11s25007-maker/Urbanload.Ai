import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../../_lib/cors';
import { generateQRSignature } from '../../_lib/qr-signature';
import { sendError, sendSuccess } from '../../_lib/response';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return sendError(res, 'Method not allowed', 405);

  const { bookingId } = req.body;
  if (!bookingId) return sendError(res, 'bookingId wajib diisi');

  const timestamp = Date.now();
  const signature = generateQRSignature(bookingId, timestamp);

  return sendSuccess(res, {
    bookingId,
    timestamp,
    signature,
    qrPayload: JSON.stringify({ bookingId, timestamp, signature }),
  });
}
