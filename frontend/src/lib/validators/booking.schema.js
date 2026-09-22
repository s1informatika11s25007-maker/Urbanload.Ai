import { z } from 'zod';

export const bookingSchema = z.object({
  zoneId: z.string().min(1, 'Pilih zona logistik'),
  licensePlate: z.string().min(3, 'Nomor polisi tidak valid'),
  lengthCm: z.number().min(100, 'Panjang minimal 100 cm'),
  widthCm: z.number().min(50, 'Lebar minimal 50 cm'),
  heightCm: z.number().min(50, 'Tinggi minimal 50 cm'),
  weightKg: z.number().min(100, 'Tonase minimal 100 kg'),
  bookingDate: z.string().min(1, 'Tanggal booking wajib dipilih'),
  timeStart: z.string().min(1, 'Jam mulai wajib'),
  timeEnd: z.string().min(1, 'Jam selesai wajib'),
  notes: z.string().max(200, 'Maksimal 200 karakter').optional(),
});

export type BookingSchemaType = z.infer<typeof bookingSchema>;
