-- 0007_functions.sql: RPC functions (PostGIS & Congestion)

-- Validasi geofence (check_geofence)
CREATE OR REPLACE FUNCTION check_geofence(lat FLOAT, lng FLOAT)
RETURNS TABLE(zone_id UUID, name TEXT, distance_m FLOAT) AS $$
  SELECT id AS zone_id,
         name,
         ST_Distance(boundary_polygon::geography, ST_SetSRID(ST_Point(lng, lat), 4326)::geography) AS distance_m
  FROM public.zones
  WHERE ST_Contains(boundary_polygon::geometry, ST_SetSRID(ST_Point(lng, lat), 4326)::geometry);
$$ LANGUAGE sql STABLE;

-- CongestionScore rule-based function
CREATE OR REPLACE FUNCTION congestion_score(p_zone_id UUID, p_hour TIMESTAMPTZ)
RETURNS NUMERIC AS $$
  WITH active AS (
    SELECT COUNT(*)::numeric AS n
    FROM public.bookings
    WHERE zone_id = p_zone_id
      AND status IN ('pending','confirmed')
      AND p_hour BETWEEN time_window_start AND time_window_end
  ),
  cap AS (
    SELECT max_truck_capacity::numeric AS c FROM public.zones WHERE id = p_zone_id
  )
  SELECT LEAST(10, CEIL((active.n / NULLIF(cap.c, 0)) * 10))
  FROM active, cap;
$$ LANGUAGE sql STABLE;
