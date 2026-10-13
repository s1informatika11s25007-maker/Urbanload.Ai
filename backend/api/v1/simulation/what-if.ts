import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../../_lib/cors';
import { sendSuccess, sendError } from '../../_lib/response';
import { getConfigValue } from '../../../src/engine/config';
import { runABSimulation } from '../../../src/engine/simulator';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return sendError(res, 'Metode HTTP tidak diizinkan. Gunakan POST.', 405);
  }

  try {
    const {
      seed = 42,
      totalVehicles = 25,
      policyName = 'Skenario Kebijakan Tambah Bay & Perpanjang Jam Operasional',
      additionalBays = 2,
      extendedHoursHours = 4,
      kerbCapacityMeters = 30.0
    } = req.body || {};

    if (additionalBays < 0 || additionalBays > 10) {
      return sendError(res, 'Jumlah bay tambahan harus antara 0 dan 10.', 400);
    }

    const idleFuelRateLHr = await getConfigValue('idle_fuel_rate_l_hr', 2.5);
    const co2EmissionFactorKgL = await getConfigValue('co2_emission_factor_kg_l', 2.68);
    const noShowRate = await getConfigValue('no_show_rate_default', 0.10);

    const baselineSim = runABSimulation({
      seed,
      totalVehicles,
      kerbCapacityMeters,
      stagingCapacityMeters: 50.0,
      idleFuelRateLHr,
      co2EmissionFactorKgL,
      noShowRate,
      truckLengthMeanM: 8.0,
      safetyGapM: 2.0
    });

    const policyKerbCapacity = kerbCapacityMeters + additionalBays * 12.0;
    const policySim = runABSimulation({
      seed,
      totalVehicles,
      kerbCapacityMeters: policyKerbCapacity,
      stagingCapacityMeters: 80.0,
      idleFuelRateLHr,
      co2EmissionFactorKgL,
      noShowRate,
      truckLengthMeanM: 8.0,
      safetyGapM: 2.0
    });

    const spilloverDeltaAbs = baselineSim.controlled.spilloverMeterMinutes - policySim.controlled.spilloverMeterMinutes;
    const spilloverDeltaPct = baselineSim.controlled.spilloverMeterMinutes > 0
      ? (spilloverDeltaAbs / baselineSim.controlled.spilloverMeterMinutes) * 100
      : 0;

    const waitDeltaAbs = baselineSim.controlled.totalWaitMinutes - policySim.controlled.totalWaitMinutes;
    const waitDeltaPct = baselineSim.controlled.totalWaitMinutes > 0
      ? (waitDeltaAbs / baselineSim.controlled.totalWaitMinutes) * 100
      : 0;

    return sendSuccess(res, {
      isSimulated: true,
      badge: 'SIMULASI',
      seed,
      policyName,
      policyParams: {
        additionalBays,
        extendedHoursHours,
        policyKerbCapacityMeters: policyKerbCapacity
      },
      baselineScenario: {
        spilloverMeterMinutes: baselineSim.controlled.spilloverMeterMinutes,
        totalWaitMinutes: baselineSim.controlled.totalWaitMinutes,
        maxQueueMeters: baselineSim.controlled.maxQueueMeters
      },
      policyScenario: {
        spilloverMeterMinutes: policySim.controlled.spilloverMeterMinutes,
        totalWaitMinutes: policySim.controlled.totalWaitMinutes,
        maxQueueMeters: policySim.controlled.maxQueueMeters
      },
      deltaImpact: {
        spilloverReductionAbsoluteMeterMin: Math.round(spilloverDeltaAbs * 10) / 10,
        spilloverReductionPercent: Math.round(spilloverDeltaPct * 10) / 10,
        waitTimeReductionAbsoluteMinutes: Math.round(waitDeltaAbs * 10) / 10,
        waitTimeReductionPercent: Math.round(waitDeltaPct * 10) / 10,
        extraIdleFuelSavedLiters: Math.round((Math.max(0, waitDeltaAbs) / 60) * idleFuelRateLHr * 100) / 100,
        extraCo2ReducedKg: Math.round(((Math.max(0, waitDeltaAbs) / 60) * idleFuelRateLHr * co2EmissionFactorKgL) * 100) / 100
      }
    });

  } catch (err: any) {
    return sendError(res, `Gagal memproses analisis What-If: ${err.message}`, 500);
  }
}
