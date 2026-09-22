import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../../_lib/cors';
import { sendSuccess } from '../../_lib/response';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const trendData = [
    { hour: '06:00', zonaA: 2, zonaB: 1, zonaC: 1 },
    { hour: '08:00', zonaA: 5, zonaB: 3, zonaC: 2 },
    { hour: '10:00', zonaA: 9, zonaB: 4, zonaC: 2 },
    { hour: '12:00', zonaA: 10, zonaB: 5, zonaC: 3 },
    { hour: '14:00', zonaA: 8, zonaB: 4, zonaC: 2 },
    { hour: '16:00', zonaA: 6, zonaB: 3, zonaC: 1 },
    { hour: '18:00', zonaA: 4, zonaB: 2, zonaC: 1 },
  ];

  return sendSuccess(res, trendData);
}
