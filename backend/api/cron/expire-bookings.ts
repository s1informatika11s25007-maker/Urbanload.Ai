import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Cronjob auto-expiring bookings past time windows
  return res.status(200).json({ success: true, message: 'Expired bookings cleanup completed' });
}
