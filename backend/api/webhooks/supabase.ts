import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Supabase Webhook Handler
  return res.status(200).json({ received: true });
}
