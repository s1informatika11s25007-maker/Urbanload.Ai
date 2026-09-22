import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../../_lib/cors';
import { sendError, sendSuccess } from '../../_lib/response';
import { supabaseAdmin } from '../../_lib/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;

  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin.from('zones').select('*').eq('id', id).single();
    if (error) return sendError(res, error.message, 404);
    return sendSuccess(res, data);
  }

  if (req.method === 'PATCH') {
    const { data, error } = await supabaseAdmin.from('zones').update(req.body).eq('id', id).select().single();
    if (error) return sendError(res, error.message, 400);
    return sendSuccess(res, data);
  }

  return sendError(res, 'Method not allowed', 405);
}
