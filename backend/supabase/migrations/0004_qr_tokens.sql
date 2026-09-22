-- 0004_qr_tokens.sql: qr_tokens
CREATE TABLE public.qr_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  signature TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  scanned_at TIMESTAMPTZ,
  scanned_by UUID REFERENCES public.profiles(id),
  scan_result TEXT CHECK (scan_result IN ('valid', 'out_of_schedule', 'invalid', 'outside_zone')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
