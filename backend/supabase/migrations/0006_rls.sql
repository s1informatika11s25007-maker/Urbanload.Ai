-- 0006_rls.sql: Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.congestion_scores ENABLE ROW LEVEL SECURITY;

-- Zones: readable by everyone
CREATE POLICY "Zones are viewable by everyone" ON public.zones FOR SELECT USING (true);
CREATE POLICY "Zones manageable by admins" ON public.zones FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'city_admin')
  )
);

-- Bookings: user sees own bookings, dishub/admin see all
CREATE POLICY "Users view own bookings" ON public.bookings FOR SELECT USING (
  auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'city_admin', 'dishub_officer')
  )
);
CREATE POLICY "Users insert own bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own bookings" ON public.bookings FOR UPDATE USING (auth.uid() = user_id);

-- Congestion scores: viewable by all
CREATE POLICY "Congestion scores viewable by all" ON public.congestion_scores FOR SELECT USING (true);
