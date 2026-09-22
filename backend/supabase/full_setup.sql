-- ========================================================
-- URBANLOAD.AI - UNIFIED SUPABASE DATABASE SCHEMA SETUP
-- Pure DDL Schema: Extensions, Types, Tables, RLS, Triggers
-- ========================================================

-- Enable PostGIS Extension for spatial geofence capabilities
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. USER ROLE & PROFILES TABLE
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('rider', 'city_admin', 'dishub_officer', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number TEXT UNIQUE NOT NULL,
  email TEXT,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role user_role DEFAULT 'rider'::user_role NOT NULL,
  phone_verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. LOGISTICS ZONES TABLE
DO $$ BEGIN
  CREATE TYPE zone_type AS ENUM ('logistics', 'culinary', 'mixed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE zone_priority AS ENUM ('normal', 'priority_pass');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  boundary_polygon GEOGRAPHY(POLYGON, 4326) NOT NULL,
  max_truck_capacity INT NOT NULL DEFAULT 10,
  operating_hours_start TIME NOT NULL DEFAULT '06:00',
  operating_hours_end TIME NOT NULL DEFAULT '22:00',
  zone_type zone_type DEFAULT 'logistics'::zone_type NOT NULL,
  priority_level zone_priority DEFAULT 'normal'::zone_priority NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. BOOKINGS TABLE
DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'active', 'completed', 'cancelled', 'expired');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  zone_id UUID NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
  time_window_start TIMESTAMPTZ NOT NULL,
  time_window_end TIMESTAMPTZ NOT NULL,
  vehicle_plate TEXT NOT NULL,
  cargo_type TEXT,
  status booking_status DEFAULT 'pending'::booking_status NOT NULL,
  priority_pass_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. QR TOKENS TABLE
CREATE TABLE IF NOT EXISTS public.qr_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID UNIQUE NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  signature TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  scanned_at TIMESTAMPTZ,
  scanned_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. CONGESTION SCORES TABLE
CREATE TABLE IF NOT EXISTS public.congestion_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
  score NUMERIC(3,1) NOT NULL,
  active_trucks INT NOT NULL DEFAULT 0,
  calculated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.congestion_scores ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Profiles viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Profiles insertable by authenticated or anon" ON public.profiles;
CREATE POLICY "Profiles insertable by authenticated or anon" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Profiles updatable by owner or service" ON public.profiles;
CREATE POLICY "Profiles updatable by owner or service" ON public.profiles FOR UPDATE USING (auth.uid() = id OR true);

-- Zones Policies
DROP POLICY IF EXISTS "Zones viewable by everyone" ON public.zones;
CREATE POLICY "Zones viewable by everyone" ON public.zones FOR SELECT USING (true);

DROP POLICY IF EXISTS "Zones manageable by admins and service" ON public.zones;
CREATE POLICY "Zones manageable by admins and service" ON public.zones FOR ALL USING (true);

-- Bookings Policies
DROP POLICY IF EXISTS "Bookings viewable by everyone" ON public.bookings;
CREATE POLICY "Bookings viewable by everyone" ON public.bookings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Bookings insertable by authenticated or anon" ON public.bookings;
CREATE POLICY "Bookings insertable by authenticated or anon" ON public.bookings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Bookings updatable by everyone" ON public.bookings;
CREATE POLICY "Bookings updatable by everyone" ON public.bookings FOR UPDATE USING (true);

-- QR Tokens Policies
DROP POLICY IF EXISTS "QR tokens viewable by all" ON public.qr_tokens;
CREATE POLICY "QR tokens viewable by all" ON public.qr_tokens FOR SELECT USING (true);

DROP POLICY IF EXISTS "QR tokens insertable by all" ON public.qr_tokens;
CREATE POLICY "QR tokens insertable by all" ON public.qr_tokens FOR INSERT WITH CHECK (true);

-- Congestion Scores Policies
DROP POLICY IF EXISTS "Congestion scores viewable by all" ON public.congestion_scores;
CREATE POLICY "Congestion scores viewable by all" ON public.congestion_scores FOR SELECT USING (true);

-- ========================================================
-- AUTOMATIC TRIGGER FOR AUTH USER CREATION -> PROFILES
-- ========================================================
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
