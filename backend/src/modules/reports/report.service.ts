import { queryDb } from '../../config/db';
import { sanitizeString, sanitizePlateNumber } from '../../utils/security';

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
  const violationType = sanitizeString(data.violationType, 100);
  const locationName = sanitizeString(data.locationName, 250);
  const description = sanitizeString(data.description, 1000);
  const vehiclePlate = sanitizePlateNumber(data.vehiclePlate);

  if (!violationType) {
    throw new Error('Kategori pelanggaran (violationType) wajib diisi.');
  }
  if (!locationName) {
    throw new Error('Lokasi kejadian (locationName) wajib diisi.');
  }

  const rows = await queryDb(
    `INSERT INTO public.citizen_reports (violation_type, vehicle_plate, location_name, description, photo_url, status)
     VALUES ($1, $2, $3, $4, $5, 'pending')
     RETURNING id, violation_type, vehicle_plate, location_name, description, photo_url, status, created_at, updated_at`,
    [
      violationType,
      vehiclePlate || null,
      locationName,
      description || null,
      data.photoUrl || null,
    ]
  );

  return rows[0];
}

export async function updateReportStatus(id: string, status: string) {
  const cleanId = sanitizeString(id, 50);
  const cleanStatus = sanitizeString(status, 30).toLowerCase();

  if (!cleanId) {
    throw new Error('ID laporan wajib diisi.');
  }
  if (!cleanStatus) {
    throw new Error('Status laporan wajib diisi.');
  }

  const allowedStatuses = ['pending', 'investigating', 'resolved', 'dismissed'];
  if (!allowedStatuses.includes(cleanStatus)) {
    throw new Error(`Status ${cleanStatus} tidak valid.`);
  }

  const rows = await queryDb(
    `UPDATE public.citizen_reports
     SET status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, violation_type, vehicle_plate, location_name, description, photo_url, status, created_at, updated_at`,
    [cleanStatus, cleanId]
  );

  if (rows.length === 0) {
    throw new Error(`Laporan dengan ID ${cleanId} tidak ditemukan.`);
  }

  return rows[0];
}
