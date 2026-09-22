import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../../_lib/cors';
import { sendError, sendSuccess } from '../../_lib/response';
import { queryDb } from '../../_lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return sendError(res, 'Method not allowed', 405);
  }

  const { fullName, phoneNumber, email, password, role } = req.body || {};

  if (!fullName || !phoneNumber || !password) {
    return sendError(res, 'Nama lengkap, nomor telepon (primary identifier), dan password wajib diisi.', 400);
  }

  if ((role === 'city_admin' || role === 'dishub_officer') && !email) {
    return sendError(res, 'Email resmi institusi wajib diisi untuk peran Admin Kota & Dishub.', 400);
  }

  try {
    const userRole = role || 'rider';

    // Insert or update profile directly in public.profiles table
    const result = await queryDb(
      `
      INSERT INTO public.profiles (id, phone_number, email, full_name, role, phone_verified)
      VALUES (gen_random_uuid(), $1, $2, $3, $4::public.user_role, FALSE)
      ON CONFLICT (phone_number) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        updated_at = now()
      RETURNING id, phone_number, email, full_name, role, phone_verified;
      `,
      [phoneNumber, email || null, fullName, userRole]
    );

    return sendSuccess(res, {
      user: result[0],
      verificationMethod: userRole === 'rider' ? 'whatsapp_otp' : 'email_link',
      message: userRole === 'rider'
        ? 'Registrasi berhasil. Silakan masukan kode OTP yang dikirim ke nomor WhatsApp Anda.'
        : 'Registrasi berhasil. Silakan verifikasi email resmi institusi Anda.',
    }, 201);
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
}
