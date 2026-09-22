import crypto from 'crypto';

const HMAC_SECRET = process.env.HMAC_SECRET_KEY || 'default-secret-key-urbanload-2025';

export function generateQRSignature(bookingId: string, timestamp: number): string {
  const data = `${bookingId}:${timestamp}`;
  return crypto.createHmac('sha256', HMAC_SECRET).update(data).digest('hex');
}

export function verifyQRSignature(bookingId: string, timestamp: number, signature: string): boolean {
  const expected = generateQRSignature(bookingId, timestamp);
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
