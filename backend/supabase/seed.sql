-- SEED REAL LOGISTICS ZONES IN JAKARTA
INSERT INTO public.zones (id, name, boundary_polygon, max_truck_capacity, operating_hours_start, operating_hours_end, zone_type, priority_level)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Zona A - Pasar Tanah Abang', ST_GeogFromText('SRID=4326;POLYGON((106.812 -6.185, 106.822 -6.185, 106.822 -6.195, 106.812 -6.195, 106.812 -6.185))'), 15, '06:00', '22:00', 'logistics', 'normal'),
  ('22222222-2222-2222-2222-222222222222', 'Zona B - Pelabuhan Tanjung Priok', ST_GeogFromText('SRID=4326;POLYGON((106.870 -6.105, 106.892 -6.105, 106.892 -6.125, 106.870 -6.125, 106.870 -6.105))'), 35, '00:00', '23:59', 'logistics', 'priority_pass'),
  ('33333333-3333-3333-3333-333333333333', 'Zona C - Koridor Sudirman-Thamrin', ST_GeogFromText('SRID=4326;POLYGON((106.818 -6.200, 106.828 -6.200, 106.823 -6.230, 106.813 -6.230, 106.818 -6.200))'), 20, '08:00', '20:00', 'mixed', 'normal'),
  ('44444444-4444-4444-4444-444444444444', 'Zona D - Kelapa Gading Trade Center', ST_GeogFromText('SRID=4326;POLYGON((106.895 -6.150, 106.915 -6.150, 106.915 -6.170, 106.895 -6.170, 106.895 -6.150))'), 18, '07:00', '21:00', 'mixed', 'normal'),
  ('55555555-5555-5555-5555-555555555555', 'Zona E - Kawasan Industri Pulogadung', ST_GeogFromText('SRID=4326;POLYGON((106.910 -6.185, 106.932 -6.185, 106.932 -6.205, 106.910 -6.205, 106.910 -6.185))'), 40, '00:00', '23:59', 'logistics', 'priority_pass'),
  ('66666666-6666-6666-6666-666666666666', 'Zona F - Glodok & Mangga Dua', ST_GeogFromText('SRID=4326;POLYGON((106.810 -6.138, 106.830 -6.138, 106.830 -6.155, 106.810 -6.155, 106.810 -6.138))'), 15, '08:00', '20:00', 'culinary', 'normal')
ON CONFLICT (id) DO NOTHING;
