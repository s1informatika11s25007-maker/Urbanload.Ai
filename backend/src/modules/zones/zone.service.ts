import { queryDb } from '../../config/db';

export async function getAllZones() {
  return queryDb('SELECT id, name, max_truck_capacity, operating_hours_start, operating_hours_end, status, zone_type, priority_level, created_at FROM public.zones ORDER BY created_at DESC');
}

export async function createZone(data: {
  name: string;
  maxTruckCapacity?: number;
  operatingHoursStart?: string;
  operatingHoursEnd?: string;
  zoneType?: string;
  priorityLevel?: string;
  wktPolygon?: string;
}) {
  const defaultWkt = data.wktPolygon || 'POLYGON((106.810 -6.180, 106.820 -6.180, 106.820 -6.190, 106.810 -6.190, 106.810 -6.180))';
  const rows = await queryDb(
    `INSERT INTO public.zones (name, boundary_polygon, max_truck_capacity, operating_hours_start, operating_hours_end, zone_type, priority_level)
     VALUES ($1, ST_GeomFromText($2, 4326)::geography, $3, $4, $5, $6, $7)
     RETURNING id, name, max_truck_capacity, status, zone_type, created_at`,
    [data.name, defaultWkt, data.maxTruckCapacity || 10, data.operatingHoursStart || '06:00', data.operatingHoursEnd || '22:00', data.zoneType || 'logistics', data.priorityLevel || 'normal']
  );
  return rows[0];
}
