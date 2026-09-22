export interface CongestionScoreData {
  zoneId: string;
  zoneName: string;
  activeBookings: number;
  capacityPerHour: number;
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  updatedAt?: string;
}
