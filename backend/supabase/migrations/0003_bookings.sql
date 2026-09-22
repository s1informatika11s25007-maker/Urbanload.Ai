-- 0003_bookings.sql: bookings
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'expired');

CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  zone_id UUID REFERENCES public.zones(id) ON DELETE CASCADE NOT NULL,
  truck_dimension JSONB NOT NULL,
  time_window_start TIMESTAMPTZ NOT NULL,
  time_window_end TIMESTAMPTZ NOT NULL,
  status booking_status DEFAULT 'pending'::booking_status NOT NULL,
  qr_signature TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX bookings_zone_time_idx ON public.bookings(zone_id, time_window_start, time_window_end);
