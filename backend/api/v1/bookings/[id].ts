import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../../_lib/cors';
import { sendError, sendSuccess } from '../../_lib/response';
import { supabaseAdmin } from '../../_lib/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;

  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select('*, zones(*)')
      .eq('id', id)
      .single();

    if (error) return sendError(res, error.message, 404);
    return sendSuccess(res, data);
  }

  if (req.method === 'PATCH') {
    const { status, timeWindowStart, timeWindowEnd } = req.body;
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .update({
        ...(status && { status }),
        ...(timeWindowStart && { time_window_start: timeWindowStart }),
        ...(timeWindowEnd && { time_window_end: timeWindowEnd }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return sendError(res, error.message, 400);
    return sendSuccess(res, data);
  }

  return sendError(res, 'Method not allowed', 405);
}
