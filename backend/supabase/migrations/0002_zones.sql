-- 0002_zones.sql: zones + PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE public.zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  boundary_polygon GEOGRAPHY(POLYGON, 4326) NOT NULL,
  max_truck_capacity INT NOT NULL,
  max_truck_dimension JSONB NOT NULL DEFAULT '{"lengthCm": 1000, "widthCm": 250, "heightCm": 350, "weightKg": 15000}'::jsonb,
  operating_hours_start TIME NOT NULL DEFAULT '06:00',
  operating_hours_end TIME NOT NULL DEFAULT '22:00',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  zone_type TEXT DEFAULT 'logistics' CHECK (zone_type IN ('logistics', 'culinary', 'mixed')),
  priority_level TEXT DEFAULT 'normal' CHECK (priority_level IN ('normal', 'priority_pass')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX zones_polygon_idx ON public.zones USING GIST (boundary_polygon);
