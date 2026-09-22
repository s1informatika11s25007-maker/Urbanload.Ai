-- 0005_congestion.sql: congestion_scores
CREATE TABLE public.congestion_scores (
  zone_id UUID REFERENCES public.zones(id) ON DELETE CASCADE NOT NULL,
  hour_bucket TIMESTAMPTZ NOT NULL,
  active_bookings INT NOT NULL DEFAULT 0,
  capacity_per_hour INT NOT NULL DEFAULT 10,
  score NUMERIC(4,2) NOT NULL DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  PRIMARY KEY (zone_id, hour_bucket)
);
