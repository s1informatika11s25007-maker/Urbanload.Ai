import crypto from 'crypto';
import { env } from '../../config/env';

export function generateQRSignature(bookingId: string, timestamp: number): string {
  const data = `${bookingId}:${timestamp}`;
  return crypto.createHmac('sha256', env.HMAC_SECRET_KEY).update(data).digest('hex');
}

export function verifyQRSignature(bookingId: string, timestamp: number, signature: string): boolean {
  const expected = generateQRSignature(bookingId, timestamp);
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
