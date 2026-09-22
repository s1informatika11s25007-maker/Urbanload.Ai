export const CONGESTION_LEVELS = {
  LOW: { min: 1, max: 3, label: 'Rendah', color: '#22c55e', badgeBg: 'bg-green-100 text-green-800' },
  MEDIUM: { min: 4, max: 6, label: 'Sedang', color: '#eab308', badgeBg: 'bg-yellow-100 text-yellow-800' },
  HIGH: { min: 7, max: 8, label: 'Tinggi', color: '#f97316', badgeBg: 'bg-orange-100 text-orange-800' },
  CRITICAL: { min: 9, max: 10, label: 'Kritis', color: '#ef4444', badgeBg: 'bg-red-100 text-red-800' },
} as const;

export const APP_CONFIG = {
  NAME: 'UrbanLoad.AI',
  VERSION: '1.0.0',
  COPYRIGHT_YEAR: '2025',
  HEADER_HEIGHT: '64px',
  FOOTER_HEIGHT: '56px',
} as const;
