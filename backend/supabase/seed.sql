-- Seed data zona logistik Jakarta
INSERT INTO public.zones (id, name, boundary_polygon, max_truck_capacity, operating_hours_start, operating_hours_end, zone_type, priority_level)
VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'Zona A - Pasar Tanah Abang',
  ST_GeomFromText('POLYGON((106.810 -6.180, 106.820 -6.180, 106.820 -6.190, 106.810 -6.190, 106.810 -6.180))', 4326)::geography,
  12,
  '06:00',
  '20:00',
  'logistics',
  'priority_pass'
),
(
  '22222222-2222-2222-2222-222222222222',
  'Zona B - Kawasan Monas & Gambir',
  ST_GeomFromText('POLYGON((106.820 -6.170, 106.830 -6.170, 106.830 -6.180, 106.820 -6.180, 106.820 -6.170))', 4326)::geography,
  15,
  '08:00',
  '22:00',
  'mixed',
  'normal'
),
(
  '33333333-3333-3333-3333-333333333333',
  'Zona C - Tanjung Priok Port Terminal',
  ST_GeomFromText('POLYGON((106.870 -6.100, 106.890 -6.100, 106.890 -6.120, 106.870 -6.120, 106.870 -6.100))', 4326)::geography,
  30,
  '00:00',
  '23:59',
  'logistics',
  'priority_pass'
)
ON CONFLICT (id) DO NOTHING;
