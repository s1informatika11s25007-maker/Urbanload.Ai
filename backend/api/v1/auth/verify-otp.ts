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

  const { phoneNumber, otpCode } = req.body || {};

  if (!phoneNumber || !otpCode) {
    return sendError(res, 'Nomor telepon dan kode OTP 6-digit wajib diisi.', 400);
  }

  if (otpCode.length < 6) {
    return sendError(res, 'Kode OTP harus terdiri dari 6 digit.', 400);
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({
        phone_verified: true,
        updated_at: new Date().toISOString(),
      })
      .eq('phone_number', phoneNumber)
      .select('*')
      .maybeSingle();

    if (error) {
      return sendError(res, `Gagal memverifikasi OTP: ${error.message}`, 500);
    }

    const cleanPhone = phoneNumber.replace(/[^a-zA-Z0-9]/g, '');
    const channel = supabaseAdmin.channel(`profile_otp_${cleanPhone}`);
    await channel.send({
      type: 'broadcast',
      event: 'otp_verified',
      payload: {
        phoneNumber,
        verifiedAt: new Date().toISOString(),
        status: 'verified',
      },
    });

    return sendSuccess(res, {
      verified: true,
      profile: data,
      message: 'Verifikasi nomor WhatsApp / HP berhasil! Akun Anda kini aktif.',
    }, 200);
  } catch (err: any) {
    return sendError(res, err.message || 'Terjadi kesalahan sistem saat verifikasi OTP.', 500);
  }
}
