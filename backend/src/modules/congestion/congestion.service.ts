/**
 * [KILL LIST #4 FIX] Dynamic Kerbside Spatial Physics Congestion Scorer
 * Menggantikan formula linier CEIL((booking/kapasitas)*10) dengan model non-linier
 * yang memperhitungkan okupansi bahu jalan, dwell time nyata, queueing delay, dan spillover.
 */

export interface CongestionParams {
  activeBookings: number;
  maxCapacityPerHour: number;
  avgDwellMinutes?: number;
  kerbLengthMeters?: number;
  spilloverMeters?: number;
  peakHourFactor?: number;
}

export function calculateCongestionScore(
  activeBookings: number,
  maxCapacityPerHour: number,
  params?: Partial<CongestionParams>
): number {
  if (maxCapacityPerHour <= 0) return 1.0;

  // 1. Kerb Occupancy Ratio
  const baseRatio = activeBookings / maxCapacityPerHour;

  // 2. Non-linear queuing delay multiplier
  const queueFactor = baseRatio >= 0.95 ? 2.2 : 1 / Math.max(1 - baseRatio, 0.15);

  // 3. Dwell time & Spillover factor
  const avgDwell = params?.avgDwellMinutes || 35;
  const dwellWeight = avgDwell / 30;
  const spilloverPenalty = (params?.spilloverMeters || 0) > 0 ? 1.5 : 0.0;

  // 4. Dynamic Multi-Variable Score Calculation (1.0 to 10.0)
  const rawScore = (baseRatio * 4.5) + (queueFactor * 1.2) + (dwellWeight * 1.3) + spilloverPenalty;

  const score = Math.min(Math.max(Number(rawScore.toFixed(1)), 1.0), 10.0);
  return score;
}
