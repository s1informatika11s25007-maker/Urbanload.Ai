import { calculateSpilloverMeterMinutes, QueuedVehicle } from '../src/engine/spillover';
import { predictUnloadingDuration } from '../src/engine/predictor';
import { validateBookingConstraints, buildDecisionExplanation } from '../src/engine/validator';
import { solveArrivalSlot, SolverInput } from '../src/engine/solver';
import { runABSimulation } from '../src/engine/simulator';
import { createQuickPassQR, verifyQuickPassQR } from '../src/engine/qr';
import { queryDb } from '../src/config/db';

async function runTests() {
  console.log('=====================================================');
  console.log('URBANLOAD DECISION ENGINE & INTEGRATION VERIFICATION');
  console.log('=====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      if (detail) console.log(`       -> ${detail}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      if (detail) console.error(`       -> ${detail}`);
      failed++;
    }
  }

  // 1. SPILLOVER METER-MINUTES CALCULATOR (MANUAL EXAMPLE STEP-BY-STEP DERIVATION TEST)
  console.log('--- 1. Testing Meter-Menit Luberan (Spillover Math) ---');
  // Kerb capacity = 20.0m. Effective truck length = 10.0m.
  // Vehicles timeline:
  // t=0 to 10: 2 trucks (queue=20m, excess=0m) -> 0 meter-min
  // t=10 to 25 (15 min): 3 trucks (queue=30m, excess=10m) -> 10m * 15m = 150 meter-min
  // t=25 to 40 (15 min): 4 trucks (queue=40m, excess=20m) -> 20m * 15m = 300 meter-min
  // t=40 to 50 (10 min): 2 trucks (queue=20m, excess=0m) -> 0 meter-min
  // Total expected = 0 + 150 + 300 + 0 = 450 meter-minutes.
  const testVehicles: QueuedVehicle[] = [
    { id: 'v1', vehiclePlate: 'B-1', lengthMeters: 8.0, arrivalTimeMin: 0, departureTimeMin: 50 },  // 8+2=10m
    { id: 'v2', vehiclePlate: 'B-2', lengthMeters: 8.0, arrivalTimeMin: 0, departureTimeMin: 50 },  // 8+2=10m
    { id: 'v3', vehiclePlate: 'B-3', lengthMeters: 8.0, arrivalTimeMin: 10, departureTimeMin: 40 }, // 8+2=10m
    { id: 'v4', vehiclePlate: 'B-4', lengthMeters: 8.0, arrivalTimeMin: 25, departureTimeMin: 40 }, // 8+2=10m
  ];

  const spilloverRes = calculateSpilloverMeterMinutes(testVehicles, 20.0, 60, 2.0);
  assert(
    spilloverRes.totalSpilloverMeterMinutes === 450,
    'Meter-Menit Luberan Manual Derivation Match',
    `Expected 450 meter-minutes, got: ${spilloverRes.totalSpilloverMeterMinutes} meter-minutes`
  );

  // 2. STATISTICAL PREDICTOR (P50 / P90)
  console.log('\n--- 2. Testing Duration & Delay Predictor ---');
  const predTextile = predictUnloadingDuration('medium', 'textile', [], 1.35);
  assert(
    predTextile.p50Minutes > 0 && predTextile.p90Minutes > predTextile.p50Minutes,
    'Predictor P50 & P90 Estimator',
    `Medium Textile Truck P50=${predTextile.p50Minutes}m, P90=${predTextile.p90Minutes}m (Buffer=1.35)`
  );

  // 3. CONSTRAINT VALIDATOR & EXPLANATION GENERATOR
  console.log('\n--- 3. Testing Constraint Validator ---');
  const now = new Date();
  const valRes = validateBookingConstraints(
    { lengthCm: 1200, widthCm: 250, heightCm: 350, weightKg: 20000 },
    now,
    new Date(now.getTime() + 60 * 60 * 1000),
    {
      id: 'bay-1',
      bayNumber: 'BAY-01',
      bayType: 'medium',
      maxLengthM: 8.0, // 8m max < 12m truck -> expect invalid
      maxWeightTon: 15.0,
      receivingWindowStart: '06:00',
      receivingWindowEnd: '21:00',
      isActive: true
    }
  );
  assert(!valRes.isValid, 'Validator Rejects Overlength Truck', `Violations: ${valRes.violations.join('; ')}`);

  const explanation = buildDecisionExplanation('optimal_proven', 'BAY-02', 45, 0, []);
  assert(
    explanation.includes('Bay BAY-02') && explanation.includes('P90 = 45 menit'),
    'Explanation Generator Dynamic Sentence Assembly',
    `Generated: "${explanation}"`
  );

  // 4. CONSTRAINED SOLVER (BRANCH AND BOUND + FALLBACK)
  console.log('\n--- 4. Testing Arrival Slot Solver ---');
  const reqStart = new Date('2026-10-01T08:00:00Z');
  const reqEnd = new Date('2026-10-01T08:45:00Z');

  const solverInput: SolverInput = {
    zoneId: '00000000-0000-0000-0000-000000000001',
    requestedStart: reqStart,
    requestedEnd: reqEnd,
    truckDimension: { lengthCm: 700, widthCm: 220, heightCm: 300, weightKg: 7000 },
    vehicleCategory: 'medium',
    p50DurationMin: 30,
    p90DurationMin: 45,
    availableBays: [
      { id: 'b1', bayNumber: 'BAY-A1', bayType: 'medium', maxLengthM: 10.0, maxWeightTon: 15.0, receivingWindowStart: '06:00', receivingWindowEnd: '22:00', isActive: true },
      { id: 'b2', bayNumber: 'BAY-A2', bayType: 'medium', maxLengthM: 10.0, maxWeightTon: 15.0, receivingWindowStart: '06:00', receivingWindowEnd: '22:00', isActive: true }
    ],
    existingBookings: [
      {
        id: 'ex1',
        bayId: 'b1',
        start: new Date('2026-10-01T08:00:00Z'),
        end: new Date('2026-10-01T08:45:00Z'),
        vehiclePlate: 'B-8888-EX',
        truckLengthM: 8.0
      }
    ],
    kerbCapacityMeters: 30.0,
    stagingCapacityMeters: 50.0,
    maxTimeoutMs: 1000
  };

  const solverRes = solveArrivalSlot(solverInput);
  assert(
    solverRes.selectedSlot !== null && solverRes.selectedSlot.bayId === 'b2',
    'Solver Allocates Non-Conflicting Bay BAY-A2',
    `Status=${solverRes.status}, Selected Bay=${solverRes.selectedSlot?.bayNumber}, Evaluated=${solverRes.alternativesEvaluated}`
  );

  // 5. A/B SIMULATOR (SEED DETERMINISM & IMPACT METRICS)
  console.log('\n--- 5. Testing Seeded A/B Simulator ---');
  const sim1 = runABSimulation({ seed: 42, totalVehicles: 15, kerbCapacityMeters: 20.0, stagingCapacityMeters: 50.0, idleFuelRateLHr: 2.5, co2EmissionFactorKgL: 2.68, noShowRate: 0.10, truckLengthMeanM: 8.0, safetyGapM: 2.0 });
  const sim2 = runABSimulation({ seed: 42, totalVehicles: 15, kerbCapacityMeters: 20.0, stagingCapacityMeters: 50.0, idleFuelRateLHr: 2.5, co2EmissionFactorKgL: 2.68, noShowRate: 0.10, truckLengthMeanM: 8.0, safetyGapM: 2.0 });

  assert(
    sim1.baseline.spilloverMeterMinutes === sim2.baseline.spilloverMeterMinutes,
    'Simulator Seed Reproducibility',
    `Seed 42 Baseline Spillover = ${sim1.baseline.spilloverMeterMinutes} meter-minutes`
  );

  assert(
    sim1.controlled.spilloverMeterMinutes <= sim1.baseline.spilloverMeterMinutes,
    'Simulator Controlled UrbanLoad Reduces/Eliminates Spillover',
    `Baseline=${sim1.baseline.spilloverMeterMinutes} m-min -> Controlled=${sim1.controlled.spilloverMeterMinutes} m-min (Reduction=${sim1.impact.spilloverReductionPercent}%, Fuel Saved=${sim1.impact.idleFuelSavedLiters}L)`
  );

  // 6. ED25519 QUICKPASS QR GENERATION AND VERIFICATION
  console.log('\n--- 6. Testing Ed25519 Single-Use QuickPass QR ---');
  const qrGen = createQuickPassQR('booking-123', 'B-1234-XYZ', 'BAY-01', new Date(), new Date(Date.now() + 3600 * 1000));
  const qrVerify = verifyQuickPassQR(qrGen.qrDataString);

  assert(
    qrVerify.isValid === true && qrVerify.payload?.bookingId === 'booking-123',
    'Ed25519 QR Signature Generation & Verification',
    `Signature Verified Successfully! Key ID: ${qrVerify.payload?.kid}`
  );

  // 7. DATABASE TRANSACTION & EXCLUSION CONSTRAINT ANTI DOUBLE-BOOKING TEST
  console.log('\n--- 7. Testing Database Transactional Booking & Exclusion Constraint ---');
  try {
    // 7a. Ensure a test zone and test bay exist in DB
    const zoneRows = await queryDb(`
      INSERT INTO public.zones (name, boundary_polygon, max_truck_capacity)
      VALUES (
        'Zona Uji Anti Double-Booking',
        ST_GeogFromText('POLYGON((106.81 0.11, 106.82 0.11, 106.82 0.12, 106.81 0.12, 106.81 0.11))'),
        10
      ) RETURNING id
    `);
    const testZoneId = zoneRows[0].id;

    const bayRows = await queryDb(`
      INSERT INTO public.bays (zone_id, bay_number, bay_type, location, max_length_m, max_weight_ton)
      VALUES (
        $1,
        'BAY-TEST-01',
        'medium',
        ST_GeogFromText('POINT(106.815 0.115)'),
        10.0,
        15.0
      ) RETURNING id
    `, [testZoneId]);
    const testBayId = bayRows[0].id;

    // Get an existing rider profile from public.profiles
    const profileRows = await queryDb(`SELECT id FROM public.profiles WHERE role = 'rider' LIMIT 1`);
    if (profileRows.length === 0) {
      throw new Error('No rider profile found in database for test.');
    }
    const testUserId = profileRows[0].id;

    const start1 = new Date().toISOString();
    const end1 = new Date(Date.now() + 3600 * 1000).toISOString();

    // First booking via transactional function
    const b1 = await queryDb(`
      SELECT * FROM public.create_booking_transactional($1, $2, $3, $4, $5, $6, $7)
    `, [
      testUserId,
      testZoneId,
      testBayId,
      JSON.stringify({ lengthCm: 800, widthCm: 220, heightCm: 300, weightKg: 8000 }),
      start1,
      end1,
      'B-1111-TEST'
    ]);

    assert(b1.length > 0, 'First Booking Created Successfully', `Booking ID: ${b1[0].id}`);

    // Second conflicting booking on SAME bay and SAME time range -> expect rejection!
    let doubleBookingRejected = false;
    let errorMessage = '';
    try {
      await queryDb(`
        SELECT * FROM public.create_booking_transactional($1, $2, $3, $4, $5, $6, $7)
      `, [
        testUserId,
        testZoneId,
        testBayId,
        JSON.stringify({ lengthCm: 800, widthCm: 220, heightCm: 300, weightKg: 8000 }),
        start1,
        end1,
        'B-2222-CONFLICT'
      ]);
    } catch (dbErr: any) {
      doubleBookingRejected = true;
      errorMessage = dbErr.message;
    }

    assert(
      doubleBookingRejected === true,
      'Anti Double-Booking Protection Enforced in DB',
      `Blocked conflicting booking with error: "${errorMessage}"`
    );

    // Clean up test data
    await queryDb(`DELETE FROM public.bookings WHERE zone_id = $1`, [testZoneId]);
    await queryDb(`DELETE FROM public.bays WHERE zone_id = $1`, [testZoneId]);
    await queryDb(`DELETE FROM public.zones WHERE id = $1`, [testZoneId]);

  } catch (err: any) {
    assert(false, 'Database Anti Double-Booking Integration Test Exception', err.message);
  }

  console.log('\n=====================================================');
  console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('=====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
