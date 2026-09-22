import { UserRole } from './roles';

export interface TruckDimension {
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  weightKg: number;
  licensePlate: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'expired';

export interface Booking {
  id: string;
  userId: string;
  zoneId: string;
  zoneName?: string;
  truckDimension: TruckDimension;
  timeWindowStart: string;
  timeWindowEnd: string;
  status: BookingStatus;
  qrSignature?: string;
  notes?: string;
  createdAt: string;
}
