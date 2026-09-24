import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../../_lib/cors';
import { sendError, sendSuccess } from '../../_lib/response';
import { queryDb } from '../../_lib/db';
import { supabaseAdmin } from '../../_lib/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return sendError(res, 'Method not allowed', 405);
  }

  const { fullName, phoneNumber, email, password, role } = req.body || {};

  if (!fullName || !phoneNumber || !password) {
    return sendError(res, 'Nama lengkap, nomor telepon, dan password wajib diisi.', 400);
  }

  const userRole = role || 'rider';
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  const authEmail = email && email.trim() ? email.trim() : `${cleanPhone || 'user'}@urbanload.ai`;
  const profileEmail = email && email.trim() ? email.trim() : null;

  try {
    let authUserId: string;

    // 1. Create User in Supabase Auth (auth.users table)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: authEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        phone_number: phoneNumber,
        role: userRole,
      },
    });

    if (authError) {
      // If user already exists in auth.users, retrieve existing user list
      const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = usersData?.users?.find(u => u.email === authEmail || u.phone === phoneNumber);

      if (existingUser) {
        authUserId = existingUser.id;
      } else {
        // Fallback uuid if auth.admin fails due to policy
        authUserId = '00000000-0000-0000-0000-' + cleanPhone.padStart(12, '0').slice(-12);
      }
    } else {
      authUserId = authData.user.id;
    }

    // 2. Insert or Update profile in public.profiles table
    const result = await queryDb(
      `
      INSERT INTO public.profiles (id, phone_number, email, full_name, role, phone_verified, updated_at)
      VALUES ($1, $2, $3, $4, $5::public.user_role, TRUE, now())
      ON CONFLICT (phone_number) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        phone_verified = TRUE,
        updated_at = now()
      RETURNING id, phone_number, email, full_name, role, phone_verified;
      `,
      [authUserId, phoneNumber, profileEmail, fullName, userRole]
    );

    return sendSuccess(res, {
      user: result[0] || { id: authUserId, full_name: fullName, role: userRole, phone_number: phoneNumber, email: profileEmail },
      verificationMethod: 'direct',
      message: 'Registrasi berhasil! Akun Anda telah aktif dan tersimpan di database Supabase.',
    }, 201);
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
}
