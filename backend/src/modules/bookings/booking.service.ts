import { queryDb } from '../../config/db';
import { sanitizeString, sanitizePlateNumber } from '../../utils/security';

export async function getAllBookings() {
  return queryDb(`
    SELECT b.id, b.user_id, b.zone_id, b.vehicle_plate, b.cargo_type, b.truck_dimension, b.time_window_start, b.time_window_end, b.status, b.notes, b.created_at, z.name as zone_name, p.full_name as driver_name
    FROM public.bookings b
    LEFT JOIN public.zones z ON b.zone_id = z.id
    LEFT JOIN public.profiles p ON b.user_id = p.id
    ORDER BY b.created_at DESC
  `);
}

export async function createBooking(data: {
  userId?: string;
  zoneId: string;
  vehiclePlate?: string;
  cargoType?: string;
  truckDimension?: any;
  timeWindowStart: string;
  timeWindowEnd: string;
  notes?: string;
}) {
  const cleanZoneId = sanitizeString(data.zoneId, 50);
  const cleanPlate = sanitizePlateNumber(data.vehiclePlate) || 'B-9000-UL';
  const cleanCargo = sanitizeString(data.cargoType, 150) || 'Bahan Pokok Logistik';
  const cleanNotes = sanitizeString(data.notes, 500);

  if (!cleanZoneId) {
    throw new Error('Zone ID (zoneId) wajib diisi.');
  }

  let activeUserId = data.userId ? sanitizeString(data.userId, 50) : null;
  if (!activeUserId) {
    const activeProfiles = await queryDb('SELECT id FROM public.profiles ORDER BY created_at DESC LIMIT 1');
    if (activeProfiles.length > 0) {
      activeUserId = activeProfiles[0].id;
    } else {
      const newProf = await queryDb(
        `INSERT INTO public.profiles (id, phone_number, full_name, role)
         VALUES (gen_random_uuid(), '081234567890', 'Rider UrbanLoad', 'rider')
         RETURNING id`
      );
      activeUserId = newProf[0].id;
    }
  }

  const defaultDim = data.truckDimension || { lengthCm: 800, widthCm: 220, heightCm: 320, weightKg: 8000 };

  const rows = await queryDb(
    `INSERT INTO public.bookings (user_id, zone_id, vehicle_plate, cargo_type, truck_dimension, time_window_start, time_window_end, notes, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'confirmed')
     RETURNING id, user_id, zone_id, vehicle_plate, cargo_type, time_window_start, time_window_end, status, created_at`,
    [
      activeUserId,
      cleanZoneId,
      cleanPlate,
      cleanCargo,
      JSON.stringify(defaultDim),
      data.timeWindowStart,
      data.timeWindowEnd,
      cleanNotes,
    ]
  );

  return rows[0];
}

export async function deleteBooking(id: string) {
  const cleanId = sanitizeString(id, 50);
  if (!cleanId) throw new Error('ID booking wajib diisi.');

  const rows = await queryDb(
    `DELETE FROM public.bookings WHERE id = $1 RETURNING id, vehicle_plate`,
    [cleanId]
  );
  if (rows.length === 0) {
    throw new Error(`Booking dengan ID ${cleanId} tidak ditemukan.`);
  }
  return rows[0];
}
