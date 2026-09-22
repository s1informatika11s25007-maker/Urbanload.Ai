export interface Zone {
  id: string;
  name: string;
  boundaryPolygon: any;
  maxTruckCapacity: number;
  maxTruckDimension: {
    lengthCm: number;
    widthCm: number;
    heightCm: number;
    weightKg: number;
  };
  operatingHoursStart: string;
  operatingHoursEnd: string;
  status: 'active' | 'inactive';
  zoneType: 'logistics' | 'culinary' | 'mixed';
  priorityLevel: 'normal' | 'priority_pass';
  createdAt: string;
}
