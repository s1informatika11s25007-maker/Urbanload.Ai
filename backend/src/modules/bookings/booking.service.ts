import { queryDb } from '../../config/db';

export async function getAllBookings() {
  return queryDb(`
    SELECT b.id, b.user_id, b.zone_id, b.truck_dimension, b.time_window_start, b.time_window_end, b.status, b.notes, b.created_at, z.name as zone_name
    FROM public.bookings b
    LEFT JOIN public.zones z ON b.zone_id = z.id
    ORDER BY b.created_at DESC
  `);
}

export async function createBooking(data: {
  userId?: string;
  zoneId: string;
  truckDimension?: any;
  timeWindowStart: string;
  timeWindowEnd: string;
  notes?: string;
}) {
  const defaultUser = data.userId || '00000000-0000-0000-0000-000000000000';
  const defaultDim = data.truckDimension || { lengthCm: 800, widthCm: 220, heightCm: 320, weightKg: 8000 };

  const rows = await queryDb(
    `INSERT INTO public.bookings (user_id, zone_id, truck_dimension, time_window_start, time_window_end, notes, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'confirmed')
     RETURNING id, user_id, zone_id, time_window_start, time_window_end, status, created_at`,
    [defaultUser, data.zoneId, JSON.stringify(defaultDim), data.timeWindowStart, data.timeWindowEnd, data.notes || '']
  );
  return rows[0];
}
