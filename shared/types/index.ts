export type UserRole = 'rider' | 'city_admin' | 'dishub_officer' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phoneNumber?: string;
  avatarUrl?: string;
  createdAt: string;
}

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
  createdAt: string;
}

export interface Zone {
  id: string;
  name: string;
  boundaryPolygon: any; // GeoJSON Polygon
  maxTruckCapacity: number;
  maxTruckDimension: {
    lengthCm: number;
    widthCm: number;
    heightCm: number;
    weightKg: number;
  };
  operatingHoursStart: string; // HH:mm
  operatingHoursEnd: string;   // HH:mm
  status: 'active' | 'inactive';
  zoneType: 'logistics' | 'culinary' | 'mixed';
  priorityLevel: 'normal' | 'priority_pass';
  createdAt: string;
}

export interface CongestionScoreData {
  zoneId: string;
  zoneName: string;
  activeBookings: number;
  capacityPerHour: number;
  score: number; // 1 - 10
  level: 'low' | 'medium' | 'high' | 'critical';
  updatedAt: string;
}
