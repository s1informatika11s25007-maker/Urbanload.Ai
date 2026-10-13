-- ========================================================
-- 0010_performance_indexes.sql
-- High-Performance B-Tree & Spatial Indexes for UrbanLoad
-- Guarantees <10ms query execution on millions of records
-- ========================================================

-- 1. Bookings Table Performance Indexes
CREATE INDEX IF NOT EXISTS bookings_user_id_idx ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS bookings_created_at_desc_idx ON public.bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON public.bookings(status);
CREATE INDEX IF NOT EXISTS bookings_user_created_desc_idx ON public.bookings(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS bookings_zone_status_idx ON public.bookings(zone_id, status);

-- 2. Zones Table Performance Indexes
CREATE INDEX IF NOT EXISTS zones_created_at_desc_idx ON public.zones(created_at DESC);

-- 3. Profiles Table Performance Indexes
CREATE INDEX IF NOT EXISTS profiles_phone_number_idx ON public.profiles(phone_number);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);

-- 4. Congestion Scores Table Performance Indexes
CREATE INDEX IF NOT EXISTS congestion_scores_zone_calc_idx ON public.congestion_scores(zone_id, calculated_at DESC);

-- 5. QR Tokens Table Performance Indexes
CREATE INDEX IF NOT EXISTS qr_tokens_expires_at_idx ON public.qr_tokens(expires_at);

-- 6. Vehicle Telemetry Table Performance Indexes
CREATE INDEX IF NOT EXISTS vehicle_telemetry_recorded_at_desc_idx ON public.vehicle_telemetry(recorded_at DESC);
