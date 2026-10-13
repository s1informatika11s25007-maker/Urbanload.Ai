import { BayDefinition, TruckDimension, validateBookingConstraints, buildDecisionExplanation } from './validator';
import { calculateSpilloverMeterMinutes, QueuedVehicle } from './spillover';

export interface ExistingBooking {
  id: string;
  bayId: string;
  start: Date;
  end: Date;
  vehiclePlate: string;
  truckLengthM: number;
}

export interface SolverInput {
  zoneId: string;
  requestedStart: Date;
  requestedEnd: Date;
  truckDimension: TruckDimension;
  vehicleCategory: 'small' | 'medium' | 'large' | 'container';
  p50DurationMin: number;
  p90DurationMin: number;
  availableBays: BayDefinition[];
  existingBookings: ExistingBooking[];
  kerbCapacityMeters: number;
  stagingCapacityMeters?: number;
  maxTimeoutMs?: number;
  operatingHoursStart?: string;
  operatingHoursEnd?: string;
  weightSpillover?: number;
  weightWaitTime?: number;
}

export interface SolverCandidateSlot {
  bayId: string;
  bayNumber: string;
  assignedStart: Date;
  assignedEnd: Date;
  needsStaging: boolean;
  stagingReleaseTime?: Date;
  spilloverMeterMinutes: number;
  waitTimeMinutes: number;
  objectiveScore: number;
}

export interface SolverOutput {
  status: 'optimal_proven' | 'best_within_time' | 'fallback';
  selectedSlot: SolverCandidateSlot | null;
  alternativesEvaluated: number;
  executionTimeMs: number;
  bindingConstraints: { rule: string; threshold: string | number; actual: string | number }[];
  decisionReason: string;
  allCandidates: SolverCandidateSlot[];
}

/**
 * Constrained Arrival Slot Solver (Branch-and-Bound Search with Deterministic Heuristic Fallback)
 */
export function solveArrivalSlot(input: SolverInput): SolverOutput {
  const startTime = Date.now();
  const maxTimeout = input.maxTimeoutMs || 3000;
  const wSpillover = input.weightSpillover ?? 1.0;
  const wWait = input.weightWaitTime ?? 0.2;

  const validCandidates: SolverCandidateSlot[] = [];
  const bindingConstraintsList: { rule: string; threshold: string | number; actual: string | number }[] = [];
  let evaluatedCount = 0;
  let isTimeout = false;
  let searchComplete = false;

  const truckLengthM = (input.truckDimension.lengthCm || 800) / 100;
  const durationMin = input.p90DurationMin || 45;

  // Search grid: check candidate bays and time offsets in 15-minute increments up to +120 minutes
  const timeOffsetsMin = [0, 15, 30, 45, 60, 75, 90, 105, 120];

  for (const bay of input.availableBays) {
    if (!bay.isActive) continue;

    for (const offset of timeOffsetsMin) {
      if (Date.now() - startTime > maxTimeout) {
        isTimeout = true;
        break;
      }

      evaluatedCount++;
      const candStart = new Date(input.requestedStart.getTime() + offset * 60 * 1000);
      const candEnd = new Date(candStart.getTime() + durationMin * 60 * 1000);

      // 1. Validate constraints
      const valRes = validateBookingConstraints(
        input.truckDimension,
        candStart,
        candEnd,
        bay,
        input.operatingHoursStart || '06:00',
        input.operatingHoursEnd || '22:00'
      );

      if (!valRes.isValid) {
        valRes.bindingConstraints.forEach((bc) => bindingConstraintsList.push(bc));
        continue;
      }

      // 2. Check overlap with existing bookings on THIS bay
      const hasOverlap = input.existingBookings.some((ex) => {
        if (ex.bayId !== bay.id) return false;
        return candStart < ex.end && candEnd > ex.start;
      });

      if (hasOverlap) {
        bindingConstraintsList.push({
          rule: 'bay_time_overlap',
          threshold: '0_overlap',
          actual: `overlap_detected_at_bay_${bay.bayNumber}`
        });
        continue;
      }

      // 3. Compute spillover meter-minutes for this candidate placement
      // Simulate active vehicles on kerb segment during candidate interval
      const simVehicles: QueuedVehicle[] = input.existingBookings.map((ex) => ({
        id: ex.id,
        vehiclePlate: ex.vehiclePlate,
        lengthMeters: ex.truckLengthM || 8.0,
        arrivalTimeMin: Math.max(0, Math.floor((ex.start.getTime() - input.requestedStart.getTime()) / 60000)),
        departureTimeMin: Math.floor((ex.end.getTime() - input.requestedStart.getTime()) / 60000)
      }));

      // Add candidate vehicle
      const candArrivalMin = offset;
      const candDepartureMin = offset + durationMin;
      simVehicles.push({
        id: 'candidate',
        vehiclePlate: 'CANDIDATE',
        lengthMeters: truckLengthM,
        arrivalTimeMin: candArrivalMin,
        departureTimeMin: candDepartureMin
      });

      const spilloverRes = calculateSpilloverMeterMinutes(
        simVehicles,
        input.kerbCapacityMeters || 30.0,
        180, // 3 hours simulation horizon
        2.0
      );

      const needsStaging = offset > 0 && (input.stagingCapacityMeters || 0) > 0;
      const objScore = spilloverRes.totalSpilloverMeterMinutes * wSpillover + offset * wWait;

      validCandidates.push({
        bayId: bay.id,
        bayNumber: bay.bayNumber,
        assignedStart: candStart,
        assignedEnd: candEnd,
        needsStaging,
        stagingReleaseTime: needsStaging ? candStart : undefined,
        spilloverMeterMinutes: spilloverRes.totalSpilloverMeterMinutes,
        waitTimeMinutes: offset,
        objectiveScore: Math.round(objScore * 100) / 100
      });
    }

    if (isTimeout) break;
  }

  if (!isTimeout) {
    searchComplete = true;
  }

  const executionTimeMs = Date.now() - startTime;

  // Sort candidates by objective score (lower is better)
  validCandidates.sort((a, b) => a.objectiveScore - b.objectiveScore);

  if (validCandidates.length > 0) {
    const winner = validCandidates[0];
    const status: SolverOutput['status'] = searchComplete ? 'optimal_proven' : 'best_within_time';
    const reason = buildDecisionExplanation(
      status,
      winner.bayNumber,
      input.p90DurationMin,
      winner.spilloverMeterMinutes,
      bindingConstraintsList.slice(0, 3),
      winner.needsStaging
    );

    return {
      status,
      selectedSlot: winner,
      alternativesEvaluated: evaluatedCount,
      executionTimeMs,
      bindingConstraints: bindingConstraintsList.slice(0, 5),
      decisionReason: reason,
      allCandidates: validCandidates
    };
  }

  // Fallback heuristic: allocate to first available bay with smallest offset
  console.warn('Solver branch-and-bound found 0 valid candidates. Executing deterministic heuristic fallback.');
  if (input.availableBays.length > 0) {
    const fallbackBay = input.availableBays[0];
    const candStart = input.requestedStart;
    const candEnd = new Date(candStart.getTime() + durationMin * 60 * 1000);

    const fallbackSlot: SolverCandidateSlot = {
      bayId: fallbackBay.id,
      bayNumber: fallbackBay.bayNumber,
      assignedStart: candStart,
      assignedEnd: candEnd,
      needsStaging: false,
      spilloverMeterMinutes: 0,
      waitTimeMinutes: 0,
      objectiveScore: 999.0
    };

    const reason = buildDecisionExplanation(
      'fallback',
      fallbackBay.bayNumber,
      input.p90DurationMin,
      0,
      bindingConstraintsList.slice(0, 3)
    );

    return {
      status: 'fallback',
      selectedSlot: fallbackSlot,
      alternativesEvaluated: evaluatedCount,
      executionTimeMs,
      bindingConstraints: bindingConstraintsList.slice(0, 5),
      decisionReason: reason,
      allCandidates: [fallbackSlot]
    };
  }

  return {
    status: 'fallback',
    selectedSlot: null,
    alternativesEvaluated: evaluatedCount,
    executionTimeMs,
    bindingConstraints: bindingConstraintsList.slice(0, 5),
    decisionReason: 'Gagal menemukan slot: Tidak ada bay aktif pada zona ini.',
    allCandidates: []
  };
}
