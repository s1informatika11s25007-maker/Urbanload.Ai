export function calculateCongestionScore(activeBookings: number, maxCapacityPerHour: number): number {
  if (maxCapacityPerHour <= 0) return 1;
  const ratio = activeBookings / maxCapacityPerHour;
  const score = Math.ceil(ratio * 10);
  return Math.min(Math.max(score, 1), 10);
}
