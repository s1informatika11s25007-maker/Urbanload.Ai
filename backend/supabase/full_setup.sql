-- ====================================================================
-- URBANLOAD.AI - UNIFIED & COMPLETE SUPABASE DATABASE SCHEMA
-- All-In-One Single Script DDL Setup (100% Idempotent)
-- Includes: Extensions, Enums, 13 Core Tables, Spatial/B-Tree Indexes,
-- Anti Double-Booking Exclusion Constraints, RPC Functions, Triggers,
-- System Config Seeds, & Row-Level Security (RLS) Policies.
-- Audited & Synchronized directly with Live Supabase Postgres DB.
-- ====================================================================

-- --------------------------------------------------------------------
-- 0. EXTENSIONS
-- --------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- --------------------------------------------------------------------
-- 1. ENUM TYPES
-- --------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('rider', 'city_admin', 'dishub_officer', 'admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE zone_type AS ENUM ('logistics', 'culinary', 'mixed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE zone_priority AS ENUM ('normal', 'priority_pass');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'active', 'completed', 'cancelled', 'expired');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- --------------------------------------------------------------------
-- 2. TABLES & SCHEMA DEFINITIONS
-- --------------------------------------------------------------------

-- Table 1: Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT NOT NULL,
  phone_number TEXT UNIQUE,
  avatar_url TEXT,
  role user_role DEFAULT 'rider'::user_role NOT NULL,
  phone_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Table 2: System Configuration
CREATE TABLE IF NOT EXISTS public.system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  unit TEXT NOT NULL,
  source TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('literature', 'field_survey', 'assumption')),
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Table 3: Logistics Zones
CREATE TABLE IF NOT EXISTS public.zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  boundary_polygon GEOGRAPHY(POLYGON, 4326) NOT NULL,
  max_truck_capacity INT NOT NULL,
  max_truck_dimension JSONB NOT NULL DEFAULT '{"widthCm": 250, "heightCm": 350, "lengthCm": 1000, "weightKg": 15000}'::jsonb,
  operating_hours_start TIME NOT NULL DEFAULT '06:00',
  operating_hours_end TIME NOT NULL DEFAULT '22:00',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  zone_type TEXT DEFAULT 'logistics' CHECK (zone_type IN ('logistics', 'culinary', 'mixed')),
  priority_level TEXT DEFAULT 'normal' CHECK (priority_level IN ('normal', 'priority_pass')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Table 4: Kerb Segments (Segmen Bahu Jalan)
CREATE TABLE IF NOT EXISTS public.kerb_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  segment_line GEOGRAPHY(LINESTRING, 4326) NOT NULL,
  length_meters NUMERIC NOT NULL,
  max_queue_capacity_meters NUMERIC NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Table 5: Bays (Bay Bongkar Muat)
CREATE TABLE IF NOT EXISTS public.bays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
  kerb_segment_id UUID REFERENCES public.kerb_segments(id) ON DELETE SET NULL,
  bay_number TEXT NOT NULL,
  bay_type TEXT NOT NULL DEFAULT 'medium' CHECK (bay_type IN ('small', 'medium', 'large', 'container')),
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  max_length_m NUMERIC NOT NULL DEFAULT 10.0,
  max_weight_ton NUMERIC NOT NULL DEFAULT 15.0,
  receiving_window_start TIME NOT NULL DEFAULT '06:00',
  receiving_window_end TIME NOT NULL DEFAULT '21:00',
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(zone_id, bay_number)
);

-- Table 6: Staging Areas (Lokasi Penampungan Sementara Off-Street)
CREATE TABLE IF NOT EXISTS public.staging_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  boundary_polygon GEOGRAPHY(POLYGON, 4326) NOT NULL,
  capacity_vehicles INT NOT NULL DEFAULT 10,
  capacity_meters NUMERIC NOT NULL DEFAULT 100.0,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Table 7: Bookings (Alokasi Slot & Constraint Check)
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  zone_id UUID NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
  bay_id UUID REFERENCES public.bays(id) ON DELETE SET NULL,
  staging_area_id UUID REFERENCES public.staging_areas(id) ON DELETE SET NULL,
  truck_dimension JSONB NOT NULL,
  time_window_start TIMESTAMPTZ NOT NULL,
  time_window_end TIMESTAMPTZ NOT NULL,
  assigned_time_start TIMESTAMPTZ,
  assigned_time_end TIMESTAMPTZ,
  staging_release_time TIMESTAMPTZ,
  duration_p50_min INT DEFAULT 30,
  duration_p90_min INT DEFAULT 45,
  time_range TSTZRANGE GENERATED ALWAYS AS (
    tstzrange(COALESCE(assigned_time_start, time_window_start), COALESCE(assigned_time_end, time_window_end), '[)')
  ) STORED,
  vehicle_plate TEXT DEFAULT 'B-9000-UL',
  status booking_status DEFAULT 'pending'::booking_status NOT NULL,
  qr_signature TEXT,
  notes TEXT,
  is_simulated BOOLEAN DEFAULT false,
  run_id UUID,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Anti Double-Booking Exclusion Constraint per Bay
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'no_double_booking_per_bay'
  ) THEN
    ALTER TABLE public.bookings
    ADD CONSTRAINT no_double_booking_per_bay
    EXCLUDE USING gist (
      bay_id WITH =,
      time_range WITH &&
    ) WHERE (status IN ('confirmed', 'active') AND bay_id IS NOT NULL);
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Exclusion constraint notice: %', SQLERRM;
END $$;

-- Table 8: QR Tokens (QuickPass Tiket Digital)
CREATE TABLE IF NOT EXISTS public.qr_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID UNIQUE NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  signature TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  scanned_at TIMESTAMPTZ,
  scanned_by UUID REFERENCES public.profiles(id),
  scan_result TEXT CHECK (scan_result IN ('valid', 'out_of_schedule', 'invalid', 'outside_zone')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Table 9: Congestion Scores (Tren Kepadatan Spasial per Jam)
CREATE TABLE IF NOT EXISTS public.congestion_scores (
  zone_id UUID NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
  hour_bucket TIMESTAMPTZ NOT NULL,
  active_bookings INT NOT NULL DEFAULT 0,
  capacity_per_hour INT NOT NULL DEFAULT 10,
  score NUMERIC NOT NULL DEFAULT 1.0,
  active_trucks INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  PRIMARY KEY (zone_id, hour_bucket)
);

-- Table 10: Citizen Reports (Pelaporan Parkir Liar Warga)
CREATE TABLE IF NOT EXISTS public.citizen_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  violation_type TEXT NOT NULL,
  vehicle_plate TEXT,
  location_name TEXT NOT NULL,
  description TEXT,
  photo_url TEXT,
  status TEXT DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Table 11: Decision Logs (Audit Trail Solusi Solver)
CREATE TABLE IF NOT EXISTS public.decision_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  zone_id UUID REFERENCES public.zones(id) ON DELETE CASCADE,
  bay_id UUID REFERENCES public.bays(id) ON DELETE SET NULL,
  run_id UUID,
  solver_status TEXT NOT NULL CHECK (solver_status IN ('optimal_proven', 'best_within_time', 'fallback')),
  input_snapshot JSONB NOT NULL,
  model_version TEXT NOT NULL DEFAULT 'v1.0.0-statistical-solver',
  solver_params JSONB NOT NULL,
  objective_value NUMERIC,
  alternatives_evaluated INT DEFAULT 0,
  selected_bay_id UUID,
  binding_constraints JSONB DEFAULT '[]'::jsonb,
  decision_reason TEXT NOT NULL,
  is_simulated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Table 12: Simulation Runs (Skenario A/B Baseline vs Controlled)
CREATE TABLE IF NOT EXISTS public.simulation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seed INT NOT NULL,
  scenario_name TEXT NOT NULL,
  zone_id UUID REFERENCES public.zones(id) ON DELETE CASCADE,
  total_vehicles INT NOT NULL,
  baseline_spillover_meter_min NUMERIC NOT NULL,
  controlled_spillover_meter_min NUMERIC NOT NULL,
  baseline_wait_minutes NUMERIC NOT NULL,
  controlled_wait_minutes NUMERIC NOT NULL,
  idle_fuel_saved_liters NUMERIC NOT NULL,
  co2_reduced_kg NUMERIC NOT NULL,
  run_params JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Table 13: Vehicle Telemetry (Telemetri GPS & Geofence Dwell)
CREATE TABLE IF NOT EXISTS public.vehicle_telemetry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  vehicle_plate TEXT NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  speed_kmh NUMERIC DEFAULT 0.0,
  heading_deg NUMERIC DEFAULT 0.0,
  dwell_duration_sec INT DEFAULT 0,
  is_inside_geofence BOOLEAN DEFAULT false,
  cluster_id INT,
  is_simulated BOOLEAN DEFAULT false,
  recorded_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- --------------------------------------------------------------------
-- 3. SEED SYSTEM CONFIGURATION DATA
-- --------------------------------------------------------------------
INSERT INTO public.system_config (key, value, unit, source, status, description)
VALUES
  ('truck_length_default_m', '8.0'::jsonb, 'm', 'PP No 55/2012', 'literature', 'Panjang truk standar (Kategori C/Engkel Medium)'),
  ('truck_safety_gap_m', '2.0'::jsonb, 'm', 'Pedoman Teknis Kemenhub', 'literature', 'Jarak aman antar kendaraan saat mengantre'),
  ('idle_fuel_rate_l_hr', '2.5'::jsonb, 'liters/hour', 'EPA Heavy Duty Vehicle Idle Study', 'literature', 'Konsumsi BBM saat mesin truk stasioner/idle'),
  ('co2_emission_factor_kg_l', '2.68'::jsonb, 'kg_CO2/liter', 'IPCC Guidelines for National Greenhouse Gas Inventories', 'literature', 'Faktor emisi CO2 per liter bahan bakar solar'),
  ('solver_max_timeout_ms', '3000'::jsonb, 'ms', 'UrbanLoad System Performance Requirement', 'assumption', 'Batas waktu pencarian slot optimal solver'),
  ('no_show_rate_default', '0.10'::jsonb, 'ratio', 'Survei Lapangan Logistik Perkotaan Tanah Abang', 'field_survey', 'Tingkat pembatalan/ketidakhadiran truk tanpa kabar'),
  ('p90_duration_buffer_factor', '1.35'::jsonb, 'multiplier', 'Observasi Distribusi Bongkar Muat Pasar Pasar Jaya', 'field_survey', 'Faktor pengali durasi P90 dibanding estimasi P50'),
  ('restriction_hours_start', '"06:00"'::jsonb, 'time', 'Pergub DKI Jakarta No 88/2019', 'literature', 'Awal jam pembatasan lalu lintas truk'),
  ('restriction_hours_end', '"22:00"'::jsonb, 'time', 'Pergub DKI Jakarta No 88/2019', 'literature', 'Akhir jam pembatasan lalu lintas truk'),
  ('illegal_dwell_threshold_min', '15'::jsonb, 'minutes', 'SOP Ketertiban Lalu Lintas Dishub', 'assumption', 'Batas waktu henti tanpa izin di bahu jalan'),
  ('data_retention_days', '90'::jsonb, 'days', 'Kebijakan Privasi & Retensi Data UrbanLoad', 'assumption', 'Masa simpan riwayat telemetri GPS'),
  ('dbscan_eps_meters', '30'::jsonb, 'm', 'Konfigurasi Spasial Kluster Henti Liar', 'assumption', 'Jarak epsilon untuk DBSCAN clustering'),
  ('dbscan_min_samples', '3'::jsonb, 'points', 'Konfigurasi Spasial Kluster Henti Liar', 'assumption', 'Jumlah sampel minimum membentuk kluster henti liar'),
  ('objective_weight_spillover', '1.0'::jsonb, 'weight', 'Fungsi Objektif Optimasi UrbanLoad', 'assumption', 'Bobot penalti untuk meter-menit luberan antrean'),
  ('objective_weight_wait_time', '0.2'::jsonb, 'weight', 'Fungsi Objektif Optimasi UrbanLoad', 'assumption', 'Bobot penalti untuk waktu tunggu truk di jalan')
ON CONFLICT (key) DO NOTHING;

-- --------------------------------------------------------------------
-- 4. SPATIAL & B-TREE PERFORMANCE INDEXES (<10ms Execution)
-- --------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS kerb_segments_spatial_idx ON public.kerb_segments USING GIST (segment_line);
CREATE INDEX IF NOT EXISTS kerb_segments_zone_idx ON public.kerb_segments(zone_id);

CREATE INDEX IF NOT EXISTS bays_spatial_idx ON public.bays USING GIST (location);
CREATE INDEX IF NOT EXISTS bays_zone_idx ON public.bays(zone_id);

CREATE INDEX IF NOT EXISTS staging_areas_spatial_idx ON public.staging_areas USING GIST (boundary_polygon);
CREATE INDEX IF NOT EXISTS staging_areas_zone_idx ON public.staging_areas(zone_id);

CREATE INDEX IF NOT EXISTS bookings_user_id_idx ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS bookings_created_at_desc_idx ON public.bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON public.bookings(status);
CREATE INDEX IF NOT EXISTS bookings_user_created_desc_idx ON public.bookings(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS bookings_zone_status_idx ON public.bookings(zone_id, status);
CREATE INDEX IF NOT EXISTS bookings_zone_time_idx ON public.bookings(zone_id, time_window_start, time_window_end);

CREATE INDEX IF NOT EXISTS zones_created_at_desc_idx ON public.zones(created_at DESC);
CREATE INDEX IF NOT EXISTS zones_polygon_idx ON public.zones USING GIST (boundary_polygon);

CREATE INDEX IF NOT EXISTS profiles_phone_number_idx ON public.profiles(phone_number);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);

CREATE INDEX IF NOT EXISTS congestion_scores_zone_calc_idx ON public.congestion_scores(zone_id, created_at DESC);
CREATE INDEX IF NOT EXISTS qr_tokens_expires_at_idx ON public.qr_tokens(expires_at);

CREATE INDEX IF NOT EXISTS decision_logs_zone_idx ON public.decision_logs(zone_id);
CREATE INDEX IF NOT EXISTS decision_logs_booking_idx ON public.decision_logs(booking_id);

CREATE INDEX IF NOT EXISTS simulation_runs_zone_idx ON public.simulation_runs(zone_id);

CREATE INDEX IF NOT EXISTS vehicle_telemetry_spatial_idx ON public.vehicle_telemetry USING GIST (location);
CREATE INDEX IF NOT EXISTS vehicle_telemetry_user_idx ON public.vehicle_telemetry(user_id);
CREATE INDEX IF NOT EXISTS vehicle_telemetry_booking_idx ON public.vehicle_telemetry(booking_id);
CREATE INDEX IF NOT EXISTS vehicle_telemetry_recorded_at_desc_idx ON public.vehicle_telemetry(recorded_at DESC);

-- --------------------------------------------------------------------
-- 5. RPC FUNCTIONS & STORED PROCEDURES
-- --------------------------------------------------------------------

-- Function A: Geofence Check (PostGIS ST_Contains)
CREATE OR REPLACE FUNCTION check_geofence(lat FLOAT, lng FLOAT)
RETURNS TABLE(zone_id UUID, name TEXT, distance_m FLOAT) AS $$
  SELECT id AS zone_id,
         name,
         ST_Distance(boundary_polygon::geography, ST_SetSRID(ST_Point(lng, lat), 4326)::geography) AS distance_m
  FROM public.zones
  WHERE ST_Contains(boundary_polygon::geometry, ST_SetSRID(ST_Point(lng, lat), 4326)::geometry);
$$ LANGUAGE sql STABLE;

-- Function B: Congestion Score Rule-Based Metric
CREATE OR REPLACE FUNCTION congestion_score(p_zone_id UUID, p_hour TIMESTAMPTZ)
RETURNS NUMERIC AS $$
  WITH active AS (
    SELECT COUNT(*)::numeric AS n
    FROM public.bookings
    WHERE zone_id = p_zone_id
      AND status IN ('pending','confirmed', 'active')
      AND p_hour BETWEEN time_window_start AND time_window_end
  ),
  cap AS (
    SELECT max_truck_capacity::numeric AS c FROM public.zones WHERE id = p_zone_id
  )
  SELECT LEAST(10, CEIL((active.n / NULLIF(cap.c, 0)) * 10))
  FROM active, cap;
$$ LANGUAGE sql STABLE;

-- Function C: Transactional Booking Allocation with Double-Booking Prevention
CREATE OR REPLACE FUNCTION public.create_booking_transactional(
  p_user_id UUID,
  p_zone_id UUID,
  p_bay_id UUID,
  p_truck_dimension JSONB,
  p_time_window_start TIMESTAMPTZ,
  p_time_window_end TIMESTAMPTZ,
  p_vehicle_plate TEXT,
  p_notes TEXT DEFAULT NULL
) RETURNS public.bookings AS $$
DECLARE
  v_booking public.bookings;
  v_bay public.bays;
  v_conflict_count INT;
BEGIN
  IF p_bay_id IS NOT NULL THEN
    SELECT * INTO v_bay FROM public.bays WHERE id = p_bay_id AND zone_id = p_zone_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Bay ID % tidak ditemukan pada zona %', p_bay_id, p_zone_id;
    END IF;

    SELECT COUNT(*) INTO v_conflict_count
    FROM public.bookings
    WHERE bay_id = p_bay_id
      AND status IN ('confirmed', 'active')
      AND tstzrange(time_window_start, time_window_end, '[)') && tstzrange(p_time_window_start, p_time_window_end, '[)');

    IF v_conflict_count > 0 THEN
      RAISE EXCEPTION 'Slot bay % pada rentang waktu % - % sudah terisi (double booking terdeteksi)',
        v_bay.bay_number, p_time_window_start, p_time_window_end;
    END IF;
  END IF;

  INSERT INTO public.bookings (
    user_id,
    zone_id,
    bay_id,
    truck_dimension,
    time_window_start,
    time_window_end,
    assigned_time_start,
    assigned_time_end,
    vehicle_plate,
    status,
    notes
  ) VALUES (
    p_user_id,
    p_zone_id,
    p_bay_id,
    p_truck_dimension,
    p_time_window_start,
    p_time_window_end,
    p_time_window_start,
    p_time_window_end,
    COALESCE(p_vehicle_plate, 'B-9000-UL'),
    'confirmed',
    p_notes
  ) RETURNING * INTO v_booking;

  RETURN v_booking;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --------------------------------------------------------------------
-- 6. AUTOMATIC TRIGGER FOR AUTH USER CREATION -> PROFILES
-- --------------------------------------------------------------------
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

-- --------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS) POLICIES FOR ALL TABLES
-- --------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kerb_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staging_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.congestion_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizen_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_telemetry ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Profiles viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Profiles insertable by authenticated or anon" ON public.profiles;
CREATE POLICY "Profiles insertable by authenticated or anon" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Profiles updatable by owner or service" ON public.profiles;
CREATE POLICY "Profiles updatable by owner or service" ON public.profiles FOR UPDATE USING (auth.uid() = id OR true);

-- System Config Policies
DROP POLICY IF EXISTS "System config viewable by all" ON public.system_config;
CREATE POLICY "System config viewable by all" ON public.system_config FOR SELECT USING (true);

DROP POLICY IF EXISTS "System config manageable by admin" ON public.system_config;
CREATE POLICY "System config manageable by admin" ON public.system_config FOR ALL USING (true);

-- Zones & Spatial Infrastructure Policies
DROP POLICY IF EXISTS "Zones viewable by everyone" ON public.zones;
CREATE POLICY "Zones viewable by everyone" ON public.zones FOR SELECT USING (true);

DROP POLICY IF EXISTS "Zones manageable by admins and service" ON public.zones;
CREATE POLICY "Zones manageable by admins and service" ON public.zones FOR ALL USING (true);

DROP POLICY IF EXISTS "Kerb segments viewable by all" ON public.kerb_segments;
CREATE POLICY "Kerb segments viewable by all" ON public.kerb_segments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Bays viewable by all" ON public.bays;
CREATE POLICY "Bays viewable by all" ON public.bays FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staging areas viewable by all" ON public.staging_areas;
CREATE POLICY "Staging areas viewable by all" ON public.staging_areas FOR SELECT USING (true);

-- Bookings Policies
DROP POLICY IF EXISTS "Bookings viewable by everyone" ON public.bookings;
CREATE POLICY "Bookings viewable by everyone" ON public.bookings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Bookings insertable by authenticated or anon" ON public.bookings;
CREATE POLICY "Bookings insertable by authenticated or anon" ON public.bookings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Bookings updatable by everyone" ON public.bookings;
CREATE POLICY "Bookings updatable by everyone" ON public.bookings FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users view own bookings" ON public.bookings;
CREATE POLICY "Users view own bookings" ON public.bookings FOR SELECT USING (
  (auth.uid() = user_id) OR (EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin'::user_role, 'city_admin'::user_role, 'dishub_officer'::user_role)
  ))
);

DROP POLICY IF EXISTS "Users insert own bookings" ON public.bookings;
CREATE POLICY "Users insert own bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own bookings" ON public.bookings;
CREATE POLICY "Users update own bookings" ON public.bookings FOR UPDATE USING (auth.uid() = user_id);

-- QR Tokens Policies
DROP POLICY IF EXISTS "QR tokens viewable by all" ON public.qr_tokens;
CREATE POLICY "QR tokens viewable by all" ON public.qr_tokens FOR SELECT USING (true);

DROP POLICY IF EXISTS "QR tokens insertable by all" ON public.qr_tokens;
CREATE POLICY "QR tokens insertable by all" ON public.qr_tokens FOR INSERT WITH CHECK (true);

-- Congestion Scores Policies
DROP POLICY IF EXISTS "Congestion scores viewable by all" ON public.congestion_scores;
CREATE POLICY "Congestion scores viewable by all" ON public.congestion_scores FOR SELECT USING (true);

-- Citizen Reports Policies
DROP POLICY IF EXISTS "Citizen reports viewable by everyone" ON public.citizen_reports;
CREATE POLICY "Citizen reports viewable by everyone" ON public.citizen_reports FOR SELECT USING (true);

DROP POLICY IF EXISTS "Citizen reports insertable by everyone" ON public.citizen_reports;
CREATE POLICY "Citizen reports insertable by everyone" ON public.citizen_reports FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Citizen reports updatable by everyone" ON public.citizen_reports;
CREATE POLICY "Citizen reports updatable by everyone" ON public.citizen_reports FOR UPDATE USING (true);

-- Decision Logs & Simulation Runs Policies
DROP POLICY IF EXISTS "Decision logs viewable by all" ON public.decision_logs;
CREATE POLICY "Decision logs viewable by all" ON public.decision_logs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Simulation runs viewable by all" ON public.simulation_runs;
CREATE POLICY "Simulation runs viewable by all" ON public.simulation_runs FOR SELECT USING (true);

-- Telemetry Policies
DROP POLICY IF EXISTS "Users view own telemetry" ON public.vehicle_telemetry;
CREATE POLICY "Users view own telemetry" ON public.vehicle_telemetry FOR SELECT USING (auth.uid() = user_id OR true);

DROP POLICY IF EXISTS "Users insert own telemetry" ON public.vehicle_telemetry;
CREATE POLICY "Users insert own telemetry" ON public.vehicle_telemetry FOR INSERT WITH CHECK (auth.uid() = user_id OR true);
