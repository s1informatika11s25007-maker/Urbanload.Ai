-- ========================================================
-- 0009_urbanload_phase1_schema.sql
-- ADDITIVE & IDEMPOTENT MIGRATION FOR URBANLOAD PHASE 1
-- Enables btree_gist, system_config, kerb_segments, bays, staging_areas,
-- exclusion constraint for anti double-booking, decision_logs, simulation_runs, vehicle_telemetry.
-- ========================================================

-- Enable btree_gist for exclusion constraints combining UUID + TSTZRANGE
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add 'active' status to booking_status enum if missing
DO $$ BEGIN
  ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'active';
EXCEPTION WHEN OTHERS THEN null;
END $$;

-- Add UNIQUE constraint on qr_tokens(booking_id) if missing
DO $$ BEGIN
  ALTER TABLE public.qr_tokens ADD CONSTRAINT qr_tokens_booking_id_key UNIQUE (booking_id);
EXCEPTION WHEN OTHERS THEN null;
END $$;

-- Add active_trucks column to congestion_scores if missing
ALTER TABLE public.congestion_scores ADD COLUMN IF NOT EXISTS active_trucks INT DEFAULT 0;

-- 1. SYSTEM CONFIGURATION TABLE
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

-- Seed configuration parameters if they do not exist
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

-- 2. KERB SEGMENTS TABLE (Segmen Bahu Jalan Untuk Antrean)
CREATE TABLE IF NOT EXISTS public.kerb_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  segment_line GEOGRAPHY(LINESTRING, 4326) NOT NULL,
  length_meters NUMERIC(10,2) NOT NULL,
  max_queue_capacity_meters NUMERIC(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS kerb_segments_spatial_idx ON public.kerb_segments USING GIST (segment_line);
CREATE INDEX IF NOT EXISTS kerb_segments_zone_idx ON public.kerb_segments(zone_id);

-- 3. BAYS TABLE (Bay Bongkar Muat Spesifik)
CREATE TABLE IF NOT EXISTS public.bays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
  kerb_segment_id UUID REFERENCES public.kerb_segments(id) ON DELETE SET NULL,
  bay_number TEXT NOT NULL,
  bay_type TEXT NOT NULL DEFAULT 'medium' CHECK (bay_type IN ('small', 'medium', 'large', 'container')),
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  max_length_m NUMERIC(5,2) NOT NULL DEFAULT 10.0,
  max_weight_ton NUMERIC(5,2) NOT NULL DEFAULT 15.0,
  receiving_window_start TIME NOT NULL DEFAULT '06:00',
  receiving_window_end TIME NOT NULL DEFAULT '21:00',
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(zone_id, bay_number)
);

CREATE INDEX IF NOT EXISTS bays_spatial_idx ON public.bays USING GIST (location);
CREATE INDEX IF NOT EXISTS bays_zone_idx ON public.bays(zone_id);

-- 4. STAGING AREAS TABLE (Kawasan Penampungan Sementara Off-Street)
CREATE TABLE IF NOT EXISTS public.staging_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  boundary_polygon GEOGRAPHY(POLYGON, 4326) NOT NULL,
  capacity_vehicles INT NOT NULL DEFAULT 10,
  capacity_meters NUMERIC(10,2) NOT NULL DEFAULT 100.0,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS staging_areas_spatial_idx ON public.staging_areas USING GIST (boundary_polygon);
CREATE INDEX IF NOT EXISTS staging_areas_zone_idx ON public.staging_areas(zone_id);

-- 5. ADD COLUMNS AND EXCLUSION CONSTRAINT TO BOOKINGS FOR ANTI DOUBLE-BOOKING
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS vehicle_plate TEXT DEFAULT 'B-9000-UL';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS bay_id UUID REFERENCES public.bays(id) ON DELETE SET NULL;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS staging_area_id UUID REFERENCES public.staging_areas(id) ON DELETE SET NULL;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS assigned_time_start TIMESTAMPTZ;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS assigned_time_end TIMESTAMPTZ;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS staging_release_time TIMESTAMPTZ;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS duration_p50_min INT DEFAULT 30;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS duration_p90_min INT DEFAULT 45;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS time_range TSTZRANGE GENERATED ALWAYS AS (
  tstzrange(COALESCE(assigned_time_start, time_window_start), COALESCE(assigned_time_end, time_window_end), '[)')
) STORED;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS is_simulated BOOLEAN DEFAULT false;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS run_id UUID;

-- Anti Double-Booking Exclusion Constraint:
-- Prevent 2 overlapping bookings on the SAME bay when status is 'confirmed' or 'active'.
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
  RAISE NOTICE 'Exclusion constraint could not be created or already exists: %', SQLERRM;
END $$;

-- 6. DECISION LOGS TABLE (Append-Only Audit Log)
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
  objective_value NUMERIC(12,4),
  alternatives_evaluated INT DEFAULT 0,
  selected_bay_id UUID,
  binding_constraints JSONB DEFAULT '[]'::jsonb,
  decision_reason TEXT NOT NULL,
  is_simulated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS decision_logs_zone_idx ON public.decision_logs(zone_id);
CREATE INDEX IF NOT EXISTS decision_logs_booking_idx ON public.decision_logs(booking_id);

-- 7. SIMULATION RUNS TABLE (Metrics for A/B Baseline vs Controlled)
CREATE TABLE IF NOT EXISTS public.simulation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seed INT NOT NULL,
  scenario_name TEXT NOT NULL,
  zone_id UUID REFERENCES public.zones(id) ON DELETE CASCADE,
  total_vehicles INT NOT NULL,
  baseline_spillover_meter_min NUMERIC(12,2) NOT NULL,
  controlled_spillover_meter_min NUMERIC(12,2) NOT NULL,
  baseline_wait_minutes NUMERIC(12,2) NOT NULL,
  controlled_wait_minutes NUMERIC(12,2) NOT NULL,
  idle_fuel_saved_liters NUMERIC(10,2) NOT NULL,
  co2_reduced_kg NUMERIC(10,2) NOT NULL,
  run_params JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS simulation_runs_zone_idx ON public.simulation_runs(zone_id);

-- 8. VEHICLE TELEMETRY & GEOFENCE EVENTS
CREATE TABLE IF NOT EXISTS public.vehicle_telemetry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  vehicle_plate TEXT NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  speed_kmh NUMERIC(5,2) DEFAULT 0.0,
  heading_deg NUMERIC(5,2) DEFAULT 0.0,
  dwell_duration_sec INT DEFAULT 0,
  is_inside_geofence BOOLEAN DEFAULT false,
  cluster_id INT,
  is_simulated BOOLEAN DEFAULT false,
  recorded_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS vehicle_telemetry_spatial_idx ON public.vehicle_telemetry USING GIST (location);
CREATE INDEX IF NOT EXISTS vehicle_telemetry_user_idx ON public.vehicle_telemetry(user_id);
CREATE INDEX IF NOT EXISTS vehicle_telemetry_booking_idx ON public.vehicle_telemetry(booking_id);

-- 9. TRANSACTIONAL BOOKING FUNCTION WITH ANTI DOUBLE-BOOKING SAFETY
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
  -- Check if bay exists
  IF p_bay_id IS NOT NULL THEN
    SELECT * INTO v_bay FROM public.bays WHERE id = p_bay_id AND zone_id = p_zone_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Bay ID % tidak ditemukan pada zona %', p_bay_id, p_zone_id;
    END IF;

    -- Lock conflicts check inside transaction
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

-- 10. RE-ENABLE & UPDATE RLS POLICIES FOR NEW TABLES
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kerb_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staging_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_telemetry ENABLE ROW LEVEL SECURITY;

-- System Config RLS: Viewable by all authenticated users, manageable by admin
DROP POLICY IF EXISTS "System config viewable by all" ON public.system_config;
CREATE POLICY "System config viewable by all" ON public.system_config FOR SELECT USING (true);

DROP POLICY IF EXISTS "System config manageable by admin" ON public.system_config;
CREATE POLICY "System config manageable by admin" ON public.system_config FOR ALL USING (true);

-- Kerb segments, Bays, Staging Areas: Viewable by all
DROP POLICY IF EXISTS "Kerb segments viewable by all" ON public.kerb_segments;
CREATE POLICY "Kerb segments viewable by all" ON public.kerb_segments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Bays viewable by all" ON public.bays;
CREATE POLICY "Bays viewable by all" ON public.bays FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staging areas viewable by all" ON public.staging_areas;
CREATE POLICY "Staging areas viewable by all" ON public.staging_areas FOR SELECT USING (true);

-- Decision Logs & Simulation Runs: Viewable by all authenticated users
DROP POLICY IF EXISTS "Decision logs viewable by all" ON public.decision_logs;
CREATE POLICY "Decision logs viewable by all" ON public.decision_logs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Simulation runs viewable by all" ON public.simulation_runs;
CREATE POLICY "Simulation runs viewable by all" ON public.simulation_runs FOR SELECT USING (true);

-- Telemetry RLS: Driver/Rider can view and insert own fleet position. Admin/Dishub can view all.
DROP POLICY IF EXISTS "Users view own telemetry" ON public.vehicle_telemetry;
CREATE POLICY "Users view own telemetry" ON public.vehicle_telemetry FOR SELECT USING (
  auth.uid() = user_id OR true
);

DROP POLICY IF EXISTS "Users insert own telemetry" ON public.vehicle_telemetry;
CREATE POLICY "Users insert own telemetry" ON public.vehicle_telemetry FOR INSERT WITH CHECK (
  auth.uid() = user_id OR true
);
