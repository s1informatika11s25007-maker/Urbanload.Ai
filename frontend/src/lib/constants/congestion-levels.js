export const CONGESTION_LEVELS = {
  LOW: { min: 1, max: 3, label: 'Rendah', color: '#22c55e', bg: 'bg-emerald-500' },
  MEDIUM: { min: 4, max: 6, label: 'Sedang', color: '#eab308', bg: 'bg-amber-500' },
  HIGH: { min: 7, max: 8, label: 'Tinggi', color: '#f97316', bg: 'bg-orange-500' },
  CRITICAL: { min: 9, max: 10, label: 'Kritis', color: '#ef4444', bg: 'bg-rose-500' },
} as const;
