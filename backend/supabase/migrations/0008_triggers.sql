-- 0008_triggers.sql: handle_new_user and timestamp triggers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_phone TEXT;
  user_fullname TEXT;
  user_role_val public.user_role;
BEGIN
  user_phone := COALESCE(
    NEW.raw_user_meta_data->>'phone_number',
    NEW.phone,
    '08' || lpad(floor(random() * 1000000000)::text, 10, '0')
  );

  user_fullname := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    'User UrbanLoad'
  );

  BEGIN
    user_role_val := COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'rider'::public.user_role);
  EXCEPTION WHEN OTHERS THEN
    user_role_val := 'rider'::public.user_role;
  END;

  INSERT INTO public.profiles (id, phone_number, email, full_name, avatar_url, role, phone_verified)
  VALUES (
    NEW.id,
    user_phone,
    NEW.email,
    user_fullname,
    NEW.raw_user_meta_data->>'avatar_url',
    user_role_val,
    TRUE
  )
  ON CONFLICT (id) DO UPDATE SET
    phone_number = EXCLUDED.phone_number,
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
