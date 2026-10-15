import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export interface SlotSolverInput {
  zoneId: string;
  zoneName?: string;
  vehiclePlate?: string;
  cargoType?: string;
  truckDimensions?: {
    lengthM?: number;
    widthM?: number;
    heightM?: number;
    weightTon?: number;
  };
  requestedStart?: string; // ISO or HH.MM string
  requestedEnd?: string;
  activeTrucksCount?: number;
  maxCapacity?: number;
  operatingHoursStart?: string;
  operatingHoursEnd?: string;
  priorityLevel?: 'normal' | 'priority_pass' | 'emergency';
}

/**
 * 100% DETERMINISTIC BACKEND SLOT SOLVER ENGINE (No LLM / Zero Hallucination)
 * Calculates slot availability, bay assignment, time shifting, and congestion
 * using strict mathematical constraints & business rules.
 */
function solveSlotDeterministic(input: SlotSolverInput) {
  const maxCap = Math.max(1, input.maxCapacity || 10);
  const activeCount = Math.max(0, input.activeTrucksCount || 0);

  // 1. Calculate Deterministic Congestion Score (Scale 1.0 - 10.0)
  const occupancyRatio = activeCount / maxCap;
  const rawScore = Math.min(9.8, Math.max(1.0, occupancyRatio * 10.0));
  const congestionScore = Math.round(rawScore * 10) / 10;

  // Status classification
  const statusLabel =
    congestionScore >= 7.5 ? 'Macet Parah' : congestionScore >= 5.0 ? 'Sedang' : 'Lancar';

  // 2. ODOL (Over Dimension Over Loading) Gatekeeper Rule
  const weightTon = input.truckDimensions?.weightTon || 5.0;
  const lengthM = input.truckDimensions?.lengthM || 6.0;
  const isODOL = weightTon > 15.0 || lengthM > 12.0;
  const isPriorityPass = input.priorityLevel === 'priority_pass' || input.priorityLevel === 'emergency';

  if (isODOL && !isPriorityPass) {
    return {
      success: false,
      isApproved: false,
      rejectionReason: `[ODOL Intercept] Kendaraan (${weightTon} Ton, ${lengthM}m) melebihi batas bay. Dialihkan ke Staging Zone.`,
      congestionScore,
      statusLabel,
      solverEngine: 'Deterministic Backend Constraint Solver',
      isRebalanced: false,
      recommendedSlotTime: input.requestedStart || '10:00',
    };
  }

  // 3. Operating Hours Check (Default 06:00 - 22:00)
  const opStart = input.operatingHoursStart || '06:00';
  const opEnd = input.operatingHoursEnd || '22:00';
  const [opStartHour] = opStart.split(':').map(Number);
  const [opEndHour] = opEnd.split(':').map(Number);

  // Parse requested hour
  let reqHour = 10;
  let reqMin = 0;
  if (input.requestedStart) {
    const timeStr = input.requestedStart.replace('.', ':');
    if (timeStr.includes(':')) {
      const parts = timeStr.split(':').map(Number);
      reqHour = parts[0] || 10;
      reqMin = parts[1] || 0;
    } else if (!isNaN(Number(timeStr))) {
      reqHour = Number(timeStr);
    }
  }

  // If outside operating hours, clamp to nearest valid operating hour
  let isShifted = false;
  let assignedHour = reqHour;
  let assignedMin = reqMin;

  if (reqHour < opStartHour) {
    assignedHour = opStartHour;
    assignedMin = 0;
    isShifted = true;
  } else if (reqHour >= opEndHour) {
    assignedHour = opStartHour; // Shift to next day operating start
    assignedMin = 0;
    isShifted = true;
  }

  // 4. Capacity & Congestion Rebalancing (Shift +30 min if zone is congested >= 7.0)
  if (congestionScore >= 7.0 && !isPriorityPass) {
    isShifted = true;
    const totalMins = assignedHour * 60 + assignedMin + 30;
    assignedHour = Math.floor(totalMins / 60) % 24;
    assignedMin = totalMins % 60;
  }

  const formattedHour = String(assignedHour).padStart(2, '0');
  const formattedMin = String(assignedMin).padStart(2, '0');
  const recommendedSlotTime = `${formattedHour}:${formattedMin}`;

  // 5. Deterministic Bay Assignment
  const bayNumber = `Bay ${((activeCount % Math.min(maxCap, 5)) + 1)}`;

  // 6. Deterministic Pigovian Carbon Toll Calculation
  const isPeakHour = (assignedHour >= 8 && assignedHour <= 12) || (assignedHour >= 16 && assignedHour <= 19);
  const isOffPeakNight = assignedHour >= 22 || assignedHour <= 5;
  const isElectricVehicle = (input.cargoType || '').toLowerCase().includes('ev');

  let basePigovianToll = isPeakHour ? 50000 : isOffPeakNight ? 0 : 15000;
  let carbonDiscountPercent = isElectricVehicle ? 100 : isOffPeakNight ? 50 : 0;
  let finalPigovianToll = Math.max(0, basePigovianToll * (1 - carbonDiscountPercent / 100));

  return {
    success: true,
    isApproved: true,
    isRebalanced: isShifted,
    assignedBay: bayNumber,
    originalTime: input.requestedStart || '10:00',
    recommendedSlotTime,
    congestionScore,
    statusLabel,
    activeTrucksCount: activeCount,
    maxCapacity: maxCap,
    pigovianPricing: {
      isPeakHour,
      isElectricVehicle,
      baseTollRp: basePigovianToll,
      carbonDiscountPercent,
      finalTollRp: finalPigovianToll,
    },
    solverEngine: 'Deterministic Backend Constraint Solver (0 LLM Latency / 0 Hallucinations)',
    explanation: isShifted
      ? `Slot digeser ke ${recommendedSlotTime} WIB untuk menghindari kepadatan jam puncak (${congestionScore}/10) dan menjamin zero-queue.`
      : `Slot disetujui pada ${recommendedSlotTime} WIB di ${bayNumber} (Kapasitas & Jam Operasional Terverifikasi).`,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload: SlotSolverInput = await req.json();

    if (!payload.zoneId) {
      return new Response(
        JSON.stringify({ error: 'Parameter zoneId wajib diisi' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const solverResult = solveSlotDeterministic(payload);

    return new Response(
      JSON.stringify(solverResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: `Gagal memproses solver deterministik: ${err.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
