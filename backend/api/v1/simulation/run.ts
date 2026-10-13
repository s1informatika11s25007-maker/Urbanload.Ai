import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../../_lib/cors';
import { sendSuccess, sendError } from '../../_lib/response';
import { queryDb } from '../../../src/config/db';
import { getConfigValue } from '../../../src/engine/config';
import { runABSimulation, SimulationParams } from '../../../src/engine/simulator';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const seed = Number(req.body?.seed || req.query?.seed) || 42;
    const totalVehicles = Number(req.body?.totalVehicles || req.query?.totalVehicles) || 20;
    const zoneId = req.body?.zoneId || req.query?.zoneId;

    const idleFuelRateLHr = await getConfigValue('idle_fuel_rate_l_hr', 2.5);
    const co2EmissionFactorKgL = await getConfigValue('co2_emission_factor_kg_l', 2.68);
    const noShowRate = await getConfigValue('no_show_rate_default', 0.10);
    const truckLengthMeanM = await getConfigValue('truck_length_default_m', 8.0);
    const safetyGapM = await getConfigValue('truck_safety_gap_m', 2.0);

    const simParams: SimulationParams = {
      seed,
      totalVehicles,
      kerbCapacityMeters: 30.0,
      stagingCapacityMeters: 50.0,
      idleFuelRateLHr,
      co2EmissionFactorKgL,
      noShowRate,
      truckLengthMeanM,
      safetyGapM
    };

    const simResult = runABSimulation(simParams);

    await queryDb(
      `INSERT INTO public.simulation_runs (
        seed, scenario_name, zone_id, total_vehicles,
        baseline_spillover_meter_min, controlled_spillover_meter_min,
        baseline_wait_minutes, controlled_wait_minutes,
        idle_fuel_saved_liters, co2_reduced_kg, run_params
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        seed,
        'Simulasi A/B Peak Morning UrbanLoad',
        zoneId || null,
        totalVehicles,
        simResult.baseline.spilloverMeterMinutes,
        simResult.controlled.spilloverMeterMinutes,
        simResult.baseline.totalWaitMinutes,
        simResult.controlled.totalWaitMinutes,
        simResult.impact.idleFuelSavedLiters,
        simResult.impact.co2ReducedKg,
        JSON.stringify(simParams)
      ]
    );

    return sendSuccess(res, {
      isSimulated: true,
      simulation: simResult
    });
  } catch (err: any) {
    return sendError(res, `Gagal menjalankan simulasi: ${err.message}`, 500);
  }
}
