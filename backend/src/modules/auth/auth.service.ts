import { queryDb } from '../../config/db';

export async function registerUserProfile(data: {
  fullName: string;
  phoneNumber: string;
  email?: string | null;
  role?: string;
}) {
  const userRole = data.role || 'rider';
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
    [data.phoneNumber, data.email || null, data.fullName, userRole]
  );
  return result[0];
}
