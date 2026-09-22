import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../../_lib/cors';
import { sendError, sendSuccess } from '../../_lib/response';
import { supabaseAdmin } from '../../_lib/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return sendError(res, 'Method not allowed', 405);
  }

  const { phoneNumber } = req.body || {};

  if (!phoneNumber) {
    return sendError(res, 'Nomor WhatsApp / HP wajib diisi.', 400);
  }

  try {
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const cleanPhone = phoneNumber.replace(/[^a-zA-Z0-9]/g, '');

    const channel = supabaseAdmin.channel(`profile_otp_${cleanPhone}`);
    await channel.send({
      type: 'broadcast',
      event: 'otp_sent',
      payload: {
        phoneNumber,
        otpCode: generatedOtp,
        sentAt: new Date().toISOString(),
        message: 'Kode OTP 6-digit dikirim via WhatsApp Realtime',
      },
    });

    return sendSuccess(res, {
      phoneNumber,
      otpCode: generatedOtp,
      message: `Kode OTP WhatsApp baru telah dikirimkan ke ${phoneNumber}`,
    }, 200);
  } catch (err: any) {
    return sendError(res, err.message || 'Gagal mengirimkan kode OTP via WhatsApp', 500);
  }
}
