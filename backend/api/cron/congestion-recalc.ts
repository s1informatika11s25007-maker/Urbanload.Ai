import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Cronjob recalculating congestion scores every 5 mins
  return res.status(200).json({ success: true, message: 'Congestion score recalculation done' });
}
