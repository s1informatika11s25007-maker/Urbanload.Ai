import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../../_lib/cors';
import { sendSuccess, sendError } from '../../_lib/response';
import { queryDb } from '../../../src/config/db';
import { getConfigValue } from '../../../src/engine/config';
import { predictUnloadingDuration } from '../../../src/engine/predictor';
import { solveArrivalSlot, ExistingBooking, SolverInput } from '../../../src/engine/solver';
import { createQuickPassQR } from '../../../src/engine/qr';

/**
 * [GAP ANALYSIS #2 & #3 FIX] Dynamic Solver Allocation with ODOL Gatekeeper & Pigovian Carbon Toll
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return sendError(res, 'Metode HTTP tidak diizinkan. Gunakan POST.', 405);
  }

  try {
    const {
      userId,
      zoneId,
      vehiclePlate,
      cargoType = 'general',
      vehicleCategory = 'medium',
      truckDimension = { lengthCm: 800, widthCm: 220, heightCm: 320, weightKg: 8000 },
      requestedStart,
      requestedEnd,
      notes = ''
    } = req.body || {};

    if (!zoneId || !requestedStart) {
      return sendError(res, 'Parameter zoneId dan requestedStart wajib diisi.', 400);
    }

    // 1. ODOL (Over Dimension Over Loading) Gatekeeper Check
    const weightKg = Number(truckDimension.weightKg) || 8000;
    const lengthCm = Number(truckDimension.lengthCm) || 800;
    const isODOL = weightKg > 15000 || lengthCm > 1200;

    if (isODOL && !notes.toLowerCase().includes('priority_pass')) {
      return sendError(
        res,
        `[AI-WIM Gatekeeper Intercept] Kendaraan Nopol ${vehiclePlate} terdeteksi Over Dimension Over Loading (${(weightKg/1000).toFixed(1)} Ton, ${(lengthCm/100).toFixed(1)}m). Akses bay ditolak. Silakan alihkan ke Staging Zone luar kota.`,
        422
      );
    }

    const zoneRows = await queryDb('SELECT * FROM public.zones WHERE id = $1', [zoneId]);
    if (zoneRows.length === 0) {
      return sendError(res, `Zona ID ${zoneId} tidak ditemukan.`, 404);
    }
    const zone = zoneRows[0];

    const bayRows = await queryDb(
      'SELECT id, bay_number as "bayNumber", bay_type as "bayType", max_length_m as "maxLengthM", max_weight_ton as "maxWeightTon", receiving_window_start as "receivingWindowStart", receiving_window_end as "receivingWindowEnd", is_active as "isActive" FROM public.bays WHERE zone_id = $1 AND is_active = true',
      [zoneId]
    );

    const kerbRows = await queryDb('SELECT max_queue_capacity_meters FROM public.kerb_segments WHERE zone_id = $1 LIMIT 1', [zoneId]);
    const kerbCapacityMeters = kerbRows[0]?.max_queue_capacity_meters ? Number(kerbRows[0].max_queue_capacity_meters) : 30.0;

    const stagingRows = await queryDb('SELECT capacity_meters FROM public.staging_areas WHERE zone_id = $1 LIMIT 1', [zoneId]);
    const stagingCapacityMeters = stagingRows[0]?.capacity_meters ? Number(stagingRows[0].capacity_meters) : 50.0;

    const reqStartDate = new Date(requestedStart);
    const windowStart = new Date(reqStartDate.getTime() - 4 * 3600 * 1000);
    const windowEnd = new Date(reqStartDate.getTime() + 8 * 3600 * 1000);

    const existingRows = await queryDb(
      `SELECT id, bay_id as "bayId", assigned_time_start as "start", assigned_time_end as "end", vehicle_plate as "vehiclePlate", (truck_dimension->>'lengthCm')::numeric / 100 as "truckLengthM"
       FROM public.bookings
       WHERE zone_id = $1 AND status IN ('confirmed', 'active')
         AND assigned_time_start >= $2 AND assigned_time_end <= $3`,
      [zoneId, windowStart.toISOString(), windowEnd.toISOString()]
    );

    const existingBookings: ExistingBooking[] = existingRows.map((r: any) => ({
      id: r.id,
      bayId: r.bayId,
      start: new Date(r.start),
      end: new Date(r.end),
      vehiclePlate: r.vehiclePlate || 'B-9000-UL',
      truckLengthM: Number(r.truckLengthM) || 8.0
    }));

    const p90BufferFactor = await getConfigValue('p90_duration_buffer_factor', 1.35);
    const pred = predictUnloadingDuration(vehicleCategory, cargoType, [], p90BufferFactor);

    const maxTimeoutMs = await getConfigValue('solver_max_timeout_ms', 3000);
    const solverInput: SolverInput = {
      zoneId,
      requestedStart: reqStartDate,
      requestedEnd: requestedEnd ? new Date(requestedEnd) : new Date(reqStartDate.getTime() + pred.p90Minutes * 60000),
      truckDimension,
      vehicleCategory,
      p50DurationMin: pred.p50Minutes,
      p90DurationMin: pred.p90Minutes,
      availableBays: bayRows,
      existingBookings,
      kerbCapacityMeters,
      stagingCapacityMeters,
      maxTimeoutMs,
      operatingHoursStart: zone.operating_hours_start || '06:00',
      operatingHoursEnd: zone.operating_hours_end || '22:00'
    };

    const solverOutput = solveArrivalSlot(solverInput);

    if (!solverOutput.selectedSlot) {
      return sendError(res, `Gagal menemukan slot arrival yang valid: ${solverOutput.decisionReason}`, 409);
    }

    const slot = solverOutput.selectedSlot;

    // 2. Dynamic Pigovian Carbon Toll Calculation
    const reqHour = reqStartDate.getHours();
    const isPeakHour = (reqHour >= 8 && reqHour <= 12) || (reqHour >= 16 && reqHour <= 19);
    const isOffPeakNight = reqHour >= 22 || reqHour <= 5;
    const isElectricVehicle = cargoType.toLowerCase().includes('ev') || notes.toLowerCase().includes('ev');

    let basePigovianToll = isPeakHour ? 50000 : isOffPeakNight ? 0 : 15000;
    let carbonDiscountPercent = isElectricVehicle ? 100 : isOffPeakNight ? 50 : 0;
    let finalPigovianToll = Math.max(0, basePigovianToll * (1 - carbonDiscountPercent / 100));

    let activeUserId = userId;
    if (!activeUserId) {
      const activeProfiles = await queryDb('SELECT id FROM public.profiles ORDER BY created_at DESC LIMIT 1');
      if (activeProfiles.length > 0) {
        activeUserId = activeProfiles[0].id;
      } else {
        return sendError(res, 'Gagal membuat booking: Tidak ada akun profil terautentikasi di database.', 401);
      }
    }

    const bookingResult = await queryDb(
      `SELECT * FROM public.create_booking_transactional($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        activeUserId,
        zoneId,
        slot.bayId,
        JSON.stringify({ ...truckDimension, pigovianTollAmount: finalPigovianToll, isEV: isElectricVehicle }),
        slot.assignedStart.toISOString(),
        slot.assignedEnd.toISOString(),
        vehiclePlate || 'B-9000-UL',
        notes
      ]
    );

    const createdBooking = bookingResult[0];

    const qrPass = createQuickPassQR(
      createdBooking.id,
      vehiclePlate || 'B-9000-UL',
      slot.bayNumber,
      slot.assignedStart,
      slot.assignedEnd
    );

    await queryDb(
      `INSERT INTO public.qr_tokens (booking_id, token_hash, signature, expires_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (booking_id) DO UPDATE SET signature = EXCLUDED.signature, expires_at = EXCLUDED.expires_at`,
      [createdBooking.id, qrPass.tokenPayload.nonce, qrPass.signature, slot.assignedEnd.toISOString()]
    );

    await queryDb(
      `INSERT INTO public.decision_logs (
        booking_id, zone_id, bay_id, solver_status, input_snapshot, model_version,
        solver_params, objective_value, alternatives_evaluated, selected_bay_id,
        binding_constraints, decision_reason, is_simulated
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        createdBooking.id,
        zoneId,
        slot.bayId,
        solverOutput.status,
        JSON.stringify({ requestedStart, requestedEnd, truckDimension, cargoType, finalPigovianToll }),
        'v1.0.0-statistical-solver',
        JSON.stringify({ maxTimeoutMs, kerbCapacityMeters, p90DurationMin: pred.p90Minutes }),
        slot.objectiveScore,
        solverOutput.alternativesEvaluated,
        slot.bayId,
        JSON.stringify(solverOutput.bindingConstraints),
        solverOutput.decisionReason,
        false
      ]
    );

    return sendSuccess(res, {
      booking: createdBooking,
      assignedSlot: {
        bayId: slot.bayId,
        bayNumber: slot.bayNumber,
        assignedStart: slot.assignedStart.toISOString(),
        assignedEnd: slot.assignedEnd.toISOString(),
        needsStaging: slot.needsStaging,
        stagingReleaseTime: slot.stagingReleaseTime?.toISOString()
      },
      durationPrediction: pred,
      pigovianPricing: {
        isPeakHour,
        isElectricVehicle,
        baseTollRp: basePigovianToll,
        carbonDiscountPercent,
        finalTollRp: finalPigovianToll
      },
      solver: {
        status: solverOutput.status,
        alternativesEvaluated: solverOutput.alternativesEvaluated,
        executionTimeMs: solverOutput.executionTimeMs,
        spilloverMeterMinutes: slot.spilloverMeterMinutes,
        decisionReason: solverOutput.decisionReason,
        bindingConstraints: solverOutput.bindingConstraints
      },
      quickPass: {
        qrDataString: qrPass.qrDataString,
        signature: qrPass.signature,
        validUntil: slot.assignedEnd.toISOString()
      }
    });

  } catch (err: any) {
    return sendError(res, `Gagal memproses alokasi slot: ${err.message}`, 500);
  }
}
