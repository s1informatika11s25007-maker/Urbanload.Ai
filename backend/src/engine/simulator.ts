import { calculateSpilloverMeterMinutes, QueuedVehicle } from './spillover';

/**
 * Deterministic PRNG (Mulberry32)
 */
export function createPRNG(seed: number) {
  let s = seed >>> 0;
  return function () {
    let t = (s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface SimulationParams {
  seed: number;
  totalVehicles: number;
  kerbCapacityMeters: number;
  stagingCapacityMeters: number;
  idleFuelRateLHr: number;       // default 2.5 L/hr
  co2EmissionFactorKgL: number; // default 2.68 kg/L
  noShowRate: number;            // default 0.10
  truckLengthMeanM: number;      // default 8.0 m
  safetyGapM: number;            // default 2.0 m
}

export interface SimulationRunResult {
  seed: number;
  totalVehiclesGenerated: number;
  actualArrivals: number;
  noShows: number;
  baseline: {
    spilloverMeterMinutes: number;
    totalWaitMinutes: number;
    maxQueueMeters: number;
  };
  controlled: {
    spilloverMeterMinutes: number;
    totalWaitMinutes: number;
    maxQueueMeters: number;
  };
  impact: {
    spilloverReductionPercent: number;
    waitMinutesSaved: number;
    idleFuelSavedLiters: number;
    co2ReducedKg: number;
  };
}

/**
 * Event-based A/B Simulation comparing Uncontrolled Baseline vs Controlled UrbanLoad
 */
export function runABSimulation(params: SimulationParams): SimulationRunResult {
  const rand = createPRNG(params.seed);

  const idleFuelRate = params.idleFuelRateLHr || 2.5;
  const co2Factor = params.co2EmissionFactorKgL || 2.68;
  const noShowRate = params.noShowRate || 0.10;
  const truckLen = params.truckLengthMeanM || 8.0;
  const safetyGap = params.safetyGapM || 2.0;

  const baselineVehicles: QueuedVehicle[] = [];
  const controlledVehicles: QueuedVehicle[] = [];

  let actualArrivals = 0;
  let noShows = 0;

  // Generate synthetic vehicle arrival events
  for (let i = 0; i < params.totalVehicles; i++) {
    // Check no-show
    if (rand() < noShowRate) {
      noShows++;
      continue;
    }
    actualArrivals++;

    // Morning peak profile arrival time (between 0 and 180 min, clustered around min 60-120)
    const peakOffset = (rand() + rand() + rand()) / 3; // Triangular / Gaussian approximation
    const arrivalTimeMin = Math.floor(peakOffset * 180);

    // Unloading duration (Log-normal style)
    const durationMin = Math.floor(20 + rand() * 40); // 20 - 60 minutes

    // 1. Uncontrolled Baseline: Trucks arrive at peak without offset, causing queue stacking
    const baselineArrival = arrivalTimeMin;
    const baselineDeparture = baselineArrival + durationMin;

    baselineVehicles.push({
      id: `truck_${i}`,
      vehiclePlate: `B-${1000 + i}-SIM`,
      lengthMeters: truckLen,
      arrivalTimeMin: baselineArrival,
      departureTimeMin: baselineDeparture
    });

    // 2. Controlled UrbanLoad: Arrival slot smoothing spreads peak arrivals into staging/scheduled slots
    // Stagger arrival time by assigning non-overlapping 15-minute slot offsets
    const slotIndex = Math.floor(i / 2); // 2 bays
    const controlledArrival = arrivalTimeMin + slotIndex * 15;
    const controlledDeparture = controlledArrival + durationMin;

    controlledVehicles.push({
      id: `truck_${i}`,
      vehiclePlate: `B-${1000 + i}-SIM`,
      lengthMeters: truckLen,
      arrivalTimeMin: controlledArrival,
      departureTimeMin: controlledDeparture
    });
  }

  // Compute Spillover & Wait Metrics
  const baseRes = calculateSpilloverMeterMinutes(
    baselineVehicles,
    params.kerbCapacityMeters || 30.0,
    240,
    safetyGap
  );

  const ctrlRes = calculateSpilloverMeterMinutes(
    controlledVehicles,
    params.kerbCapacityMeters || 30.0,
    240,
    safetyGap
  );

  const baseSpillover = baseRes.totalSpilloverMeterMinutes;
  const ctrlSpillover = ctrlRes.totalSpilloverMeterMinutes;

  const spilloverDiff = baseSpillover - ctrlSpillover;
  const spilloverPct = baseSpillover > 0 ? (spilloverDiff / baseSpillover) * 100 : 0;

  const waitSavedMin = Math.max(0, baseRes.totalWaitMinutes - ctrlRes.totalWaitMinutes);
  const idleFuelSavedLiters = Math.round((waitSavedMin / 60) * idleFuelRate * 100) / 100;
  const co2ReducedKg = Math.round(idleFuelSavedLiters * co2Factor * 100) / 100;

  return {
    seed: params.seed,
    totalVehiclesGenerated: params.totalVehicles,
    actualArrivals,
    noShows,
    baseline: {
      spilloverMeterMinutes: baseSpillover,
      totalWaitMinutes: baseRes.totalWaitMinutes,
      maxQueueMeters: baseRes.maxExcessMeters + (params.kerbCapacityMeters || 30)
    },
    controlled: {
      spilloverMeterMinutes: ctrlSpillover,
      totalWaitMinutes: ctrlRes.totalWaitMinutes,
      maxQueueMeters: ctrlRes.maxExcessMeters + (params.kerbCapacityMeters || 30)
    },
    impact: {
      spilloverReductionPercent: Math.round(spilloverPct * 10) / 10,
      waitMinutesSaved: Math.round(waitSavedMin * 10) / 10,
      idleFuelSavedLiters,
      co2ReducedKg
    }
  };
}
