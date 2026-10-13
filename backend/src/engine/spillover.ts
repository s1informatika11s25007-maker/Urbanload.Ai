export interface QueuedVehicle {
  id: string;
  vehiclePlate: string;
  lengthMeters: number;
  arrivalTimeMin: number; // minute relative to simulation start
  departureTimeMin: number; // minute relative to simulation start
}

export interface SpilloverCalculationResult {
  totalSpilloverMeterMinutes: number;
  maxExcessMeters: number;
  totalWaitMinutes: number;
  timeline: {
    timeMin: number;
    queueLengthMeters: number;
    capacityMeters: number;
    excessMeters: number;
  }[];
}

/**
 * Calculates meter-minutes spillover (luberan) on a kerb or staging segment.
 *
 * Formula:
 * For time interval delta_t, Excess(t) = max(0, TotalQueueLength(t) - KerbCapacity)
 * Spillover = sum( Excess(t_i) * delta_t_i )
 */
export function calculateSpilloverMeterMinutes(
  vehicles: QueuedVehicle[],
  kerbCapacityMeters: number,
  simulationDurationMin: number = 120,
  safetyGapMeters: number = 2.0
): SpilloverCalculationResult {
  if (!vehicles || vehicles.length === 0) {
    return {
      totalSpilloverMeterMinutes: 0,
      maxExcessMeters: 0,
      totalWaitMinutes: 0,
      timeline: []
    };
  }

  // Collect discrete time checkpoints (arrival and departure times)
  const timePointsSet = new Set<number>();
  timePointsSet.add(0);
  timePointsSet.add(simulationDurationMin);

  for (const v of vehicles) {
    if (v.arrivalTimeMin >= 0 && v.arrivalTimeMin <= simulationDurationMin) {
      timePointsSet.add(v.arrivalTimeMin);
    }
    if (v.departureTimeMin >= 0 && v.departureTimeMin <= simulationDurationMin) {
      timePointsSet.add(v.departureTimeMin);
    }
  }

  const sortedTimes = Array.from(timePointsSet).sort((a, b) => a - b);
  let totalSpillover = 0;
  let maxExcess = 0;
  let totalWaitMin = 0;
  const timeline: SpilloverCalculationResult['timeline'] = [];

  for (let i = 0; i < sortedTimes.length - 1; i++) {
    const tCurrent = sortedTimes[i];
    const tNext = sortedTimes[i + 1];
    const duration = tNext - tCurrent;

    if (duration <= 0) continue;

    // Find vehicles active at interval [tCurrent, tNext)
    const activeVehicles = vehicles.filter(
      (v) => v.arrivalTimeMin <= tCurrent && v.departureTimeMin > tCurrent
    );

    // Calculate total physical queue length including safety gaps
    const totalQueueLength = activeVehicles.reduce(
      (sum, v) => sum + v.lengthMeters + safetyGapMeters,
      0
    );

    const excess = Math.max(0, totalQueueLength - kerbCapacityMeters);
    totalSpillover += excess * duration;
    if (excess > maxExcess) maxExcess = excess;

    // Wait minutes calculation (vehicles waiting because capacity is exceeded)
    if (excess > 0) {
      // Approximate number of delayed trucks
      const delayedTrucks = Math.ceil(excess / 10.0);
      totalWaitMin += delayedTrucks * duration;
    }

    timeline.push({
      timeMin: tCurrent,
      queueLengthMeters: totalQueueLength,
      capacityMeters: kerbCapacityMeters,
      excessMeters: excess
    });
  }

  return {
    totalSpilloverMeterMinutes: Math.round(totalSpillover * 100) / 100,
    maxExcessMeters: Math.round(maxExcess * 100) / 100,
    totalWaitMinutes: Math.round(totalWaitMin * 100) / 100,
    timeline
  };
}
