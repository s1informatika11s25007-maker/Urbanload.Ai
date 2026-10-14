import { queryDb } from '../../config/db';

export interface CitizenReportInput {
  violationType: string;
  vehiclePlate?: string | null;
  locationName: string;
  description?: string | null;
  photoUrl?: string | null;
}

export async function getAllReports() {
  return queryDb(`
    SELECT id, violation_type, vehicle_plate, location_name, description, photo_url, status, created_at, updated_at
    FROM public.citizen_reports
    ORDER BY created_at DESC
    LIMIT 50
  `);
}

export async function createReport(data: CitizenReportInput) {
  if (!data.violationType) {
    throw new Error('Kategori pelanggaran (violationType) wajib diisi.');
  }
  if (!data.locationName) {
    throw new Error('Lokasi kejadian (locationName) wajib diisi.');
  }

  const rows = await queryDb(
    `INSERT INTO public.citizen_reports (violation_type, vehicle_plate, location_name, description, photo_url, status)
     VALUES ($1, $2, $3, $4, $5, 'pending')
     RETURNING id, violation_type, vehicle_plate, location_name, description, photo_url, status, created_at, updated_at`,
    [
      data.violationType,
      data.vehiclePlate ? data.vehiclePlate.toUpperCase() : null,
      data.locationName,
      data.description || null,
      data.photoUrl || null,
    ]
  );

  return rows[0];
}

export async function updateReportStatus(id: string, status: string) {
  if (!id) {
    throw new Error('ID laporan wajib diisi.');
  }
  if (!status) {
    throw new Error('Status laporan wajib diisi.');
  }

  const rows = await queryDb(
    `UPDATE public.citizen_reports
     SET status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, violation_type, vehicle_plate, location_name, description, photo_url, status, created_at, updated_at`,
    [status, id]
  );

  if (rows.length === 0) {
    throw new Error(`Laporan dengan ID ${id} tidak ditemukan.`);
  }

  return rows[0];
}
