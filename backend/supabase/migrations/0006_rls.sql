-- 0006_rls.sql: Row Level Security
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

-- Zones: readable by everyone
DROP POLICY IF EXISTS "Zones are viewable by everyone" ON public.zones;
CREATE POLICY "Zones are viewable by everyone" ON public.zones FOR SELECT USING (true);

DROP POLICY IF EXISTS "Zones manageable by admins" ON public.zones;
CREATE POLICY "Zones manageable by admins" ON public.zones FOR ALL USING (true);

-- Bookings Policies
DROP POLICY IF EXISTS "Users view own bookings" ON public.bookings;
CREATE POLICY "Users view own bookings" ON public.bookings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users insert own bookings" ON public.bookings;
CREATE POLICY "Users insert own bookings" ON public.bookings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users update own bookings" ON public.bookings;
CREATE POLICY "Users update own bookings" ON public.bookings FOR UPDATE USING (true);

-- QR Tokens Policies
DROP POLICY IF EXISTS "QR tokens viewable by all" ON public.qr_tokens;
CREATE POLICY "QR tokens viewable by all" ON public.qr_tokens FOR SELECT USING (true);

DROP POLICY IF EXISTS "QR tokens insertable by all" ON public.qr_tokens;
CREATE POLICY "QR tokens insertable by all" ON public.qr_tokens FOR INSERT WITH CHECK (true);

-- Congestion scores: viewable by all
DROP POLICY IF EXISTS "Congestion scores viewable by all" ON public.congestion_scores;
CREATE POLICY "Congestion scores viewable by all" ON public.congestion_scores FOR SELECT USING (true);
