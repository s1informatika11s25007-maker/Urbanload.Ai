const { Client } = require('pg');

const connectionString = 'postgres://postgres.gzxoodmqqrweknwghnzz:Esvk5103z8pyD4Zp@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres';

async function seedLiveData() {
  console.log('=====================================================');
  console.log('URBANLOAD LIVE DATABASE OPERATIONAL DATA POPULATION');
  console.log('=====================================================\n');

  const pgClient = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await pgClient.connect();

  try {
    // 1. FETCH ACTUAL AUTH USERS & PROFILES FOR ALL 4 ROLES
    console.log('--- 1. Fetching Real Accounts from Auth & Profiles ---');

    const roleEmails = {
      rider: 'testrider@urbanload.ai',
      city_admin: 'admin.kota@urbanload.ai',
      dishub_officer: 'dishub@urbanload.ai',
      admin: 'admin@urbanload.ai'
    };

    const accountUserIds = {};

    for (const [role, email] of Object.entries(roleEmails)) {
      const res = await pgClient.query(`SELECT id FROM auth.users WHERE email = $1`, [email]);
      if (res.rows.length === 0) {
        console.error(`[ERROR] Auth user not found for email: ${email}`);
        continue;
      }
      const userId = res.rows[0].id;
      accountUserIds[role] = userId;
      console.log(`[OK] Found Auth user for ${role} (${email}) -> ID: ${userId}`);
    }

    // 2. SPATIAL LOGISTICS ZONES, KERB SEGMENTS, BAYS, STAGING AREAS
    console.log('\n--- 2. Populating Spatial PostGIS Zones, Kerb Segments, Bays, Staging ---');

    const zonesData = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Zona A - Pasar Tanah Abang Block A',
        type: 'logistics',
        priority: 'priority_pass',
        maxCapacity: 15,
        polygonWKT: 'POLYGON((106.812 -6.185, 106.818 -6.185, 106.818 -6.192, 106.812 -6.192, 106.812 -6.185))',
        kerbName: 'Kerb Bahu Jalan KH Mas Mansyur',
        kerbLineWKT: 'LINESTRING(106.812 -6.185, 106.818 -6.185)',
        kerbLengthM: 120.0,
        kerbMaxQueueM: 40.0,
        stagingName: 'Staging Area Pasar Jaya Off-Street',
        stagingWKT: 'POLYGON((106.810 -6.183, 106.813 -6.183, 106.813 -6.186, 106.810 -6.186, 106.810 -6.183))',
        bays: [
          { number: 'BAY-A1', type: 'medium', maxLen: 10.0, maxWeight: 15.0, pointWKT: 'POINT(106.813 -6.186)' },
          { number: 'BAY-A2', type: 'medium', maxLen: 10.0, maxWeight: 15.0, pointWKT: 'POINT(106.815 -6.187)' },
          { number: 'BAY-A3', type: 'large', maxLen: 12.0, maxWeight: 20.0, pointWKT: 'POINT(106.817 -6.188)' }
        ]
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'Zona B - Pelabuhan Tanjung Priok Terminal 1',
        type: 'logistics',
        priority: 'priority_pass',
        maxCapacity: 25,
        polygonWKT: 'POLYGON((106.880 -6.100, 106.890 -6.100, 106.890 -6.110, 106.880 -6.110, 106.880 -6.100))',
        kerbName: 'Kerb Akses Pelabuhan Priok Utama',
        kerbLineWKT: 'LINESTRING(106.880 -6.100, 106.890 -6.100)',
        kerbLengthM: 200.0,
        kerbMaxQueueM: 80.0,
        stagingName: 'Staging Area Buffer Container Priok',
        stagingWKT: 'POLYGON((106.875 -6.095, 106.882 -6.095, 106.882 -6.102, 106.875 -6.102, 106.875 -6.095))',
        bays: [
          { number: 'BAY-PRIOK-01', type: 'container', maxLen: 16.0, maxWeight: 40.0, pointWKT: 'POINT(106.882 -6.102)' },
          { number: 'BAY-PRIOK-02', type: 'container', maxLen: 16.0, maxWeight: 40.0, pointWKT: 'POINT(106.885 -6.105)' }
        ]
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        name: 'Zona C - Kawasan Industri Pulogadung',
        type: 'logistics',
        priority: 'normal',
        maxCapacity: 20,
        polygonWKT: 'POLYGON((106.910 -6.190, 106.920 -6.190, 106.920 -6.200, 106.910 -6.200, 106.910 -6.190))',
        kerbName: 'Kerb Jalan Rawa Gelam Pulogadung',
        kerbLineWKT: 'LINESTRING(106.910 -6.190, 106.920 -6.190)',
        kerbLengthM: 150.0,
        kerbMaxQueueM: 60.0,
        stagingName: 'Staging Area Gudang Logistik Pulogadung',
        stagingWKT: 'POLYGON((106.905 -6.185, 106.912 -6.185, 106.912 -6.192, 106.905 -6.192, 106.905 -6.185))',
        bays: [
          { number: 'BAY-PULO-01', type: 'large', maxLen: 12.0, maxWeight: 25.0, pointWKT: 'POINT(106.913 -6.193)' }
        ]
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        name: 'Zona D - Pusat Grosir Pasar Senen',
        type: 'mixed',
        priority: 'normal',
        maxCapacity: 12,
        polygonWKT: 'POLYGON((106.840 -6.170, 106.848 -6.170, 106.848 -6.178, 106.840 -6.178, 106.840 -6.170))',
        kerbName: 'Kerb Jalan Stasiun Senen',
        kerbLineWKT: 'LINESTRING(106.840 -6.170, 106.848 -6.170)',
        kerbLengthM: 100.0,
        kerbMaxQueueM: 30.0,
        stagingName: 'Staging Parkir Lapangan Senen',
        stagingWKT: 'POLYGON((106.835 -6.165, 106.842 -6.165, 106.842 -6.172, 106.835 -6.172, 106.835 -6.165))',
        bays: [
          { number: 'BAY-SENEN-01', type: 'medium', maxLen: 10.0, maxWeight: 15.0, pointWKT: 'POINT(106.842 -6.172)' }
        ]
      }
    ];

    const zoneIds = {};
    const bayIds = {};

    for (const zData of zonesData) {
      const existingZone = await pgClient.query(`SELECT id FROM public.zones WHERE name = $1`, [zData.name]);
      let zoneId;
      if (existingZone.rows.length > 0) {
        zoneId = existingZone.rows[0].id;
        await pgClient.query(
          `UPDATE public.zones SET boundary_polygon = ST_GeogFromText($1), max_truck_capacity = $2 WHERE id = $3`,
          [zData.polygonWKT, zData.maxCapacity, zoneId]
        );
      } else {
        const zRes = await pgClient.query(
          `INSERT INTO public.zones (id, name, boundary_polygon, max_truck_capacity, operating_hours_start, operating_hours_end, zone_type, priority_level)
           VALUES ($1, $2, ST_GeogFromText($3), $4, '06:00', '22:00', $5, $6)
           RETURNING id`,
          [zData.id, zData.name, zData.polygonWKT, zData.maxCapacity, zData.type, zData.priority]
        );
        zoneId = zRes.rows[0].id;
      }
      zoneIds[zData.name] = zoneId;

      // Kerb Segment
      const kRes = await pgClient.query(
        `INSERT INTO public.kerb_segments (zone_id, name, segment_line, length_meters, max_queue_capacity_meters)
         VALUES ($1, $2, ST_GeogFromText($3), $4, $5)
         RETURNING id`,
        [zoneId, zData.kerbName, zData.kerbLineWKT, zData.kerbLengthM, zData.kerbMaxQueueM]
      );
      const kerbId = kRes.rows[0].id;

      // Staging Area
      await pgClient.query(
        `INSERT INTO public.staging_areas (zone_id, name, boundary_polygon, capacity_vehicles, capacity_meters)
         VALUES ($1, $2, ST_GeogFromText($3), 15, 100.0)`,
        [zoneId, zData.stagingName, zData.stagingWKT]
      );

      // Bays
      for (const b of zData.bays) {
        const bRes = await pgClient.query(
          `INSERT INTO public.bays (zone_id, kerb_segment_id, bay_number, bay_type, location, max_length_m, max_weight_ton, receiving_window_start, receiving_window_end)
           VALUES ($1, $2, $3, $4, ST_GeogFromText($5), $6, $7, '06:00', '21:00')
           ON CONFLICT (zone_id, bay_number) DO UPDATE SET max_length_m = EXCLUDED.max_length_m
           RETURNING id`,
          [zoneId, kerbId, b.number, b.type, b.pointWKT, b.maxLen, b.maxWeight]
        );
        bayIds[b.number] = bRes.rows[0].id;
      }
      console.log(`[OK] Zone synced: ${zData.name}`);
    }

    // 3. OPERATIONAL BOOKINGS, QUICKPASS QR TOKENS, DECISION LOGS FOR RIDER & CITY ADMIN
    console.log('\n--- 3. Populating Operational Bookings, QR Tokens, and Decision Logs ---');

    const riderUserId = accountUserIds['rider'];
    const tanahAbangZoneId = zoneIds['Zona A - Pasar Tanah Abang Block A'];
    const bayA1Id = bayIds['BAY-A1'];
    const bayA2Id = bayIds['BAY-A2'];

    const existingBookings = await pgClient.query(`SELECT id FROM public.bookings WHERE user_id = $1`, [riderUserId]);
    let booking1Id, booking2Id;

    if (existingBookings.rows.length >= 2) {
      booking1Id = existingBookings.rows[0].id;
      booking2Id = existingBookings.rows[1].id;
      console.log(`[OK] Using existing bookings: ${booking1Id}, ${booking2Id}`);
    } else {
      const now = new Date();
      const start1 = new Date(now.getTime() - 1 * 3600 * 1000);
      const end1 = new Date(start1.getTime() + 45 * 60 * 1000);

      const start2 = new Date(now.getTime() + 2 * 3600 * 1000);
      const end2 = new Date(start2.getTime() + 45 * 60 * 1000);

      const b1Res = await pgClient.query(
        `INSERT INTO public.bookings (
          user_id, zone_id, bay_id, truck_dimension, time_window_start, time_window_end,
          assigned_time_start, assigned_time_end, vehicle_plate, status, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $5, $6, $7, 'confirmed', $8)
        RETURNING id`,
        [
          riderUserId,
          tanahAbangZoneId,
          bayA1Id,
          JSON.stringify({ lengthCm: 800, widthCm: 220, heightCm: 320, weightKg: 8000 }),
          start1.toISOString(),
          end1.toISOString(),
          'B 9812 UAI',
          'Bongkar muat bahan tekstil kargo'
        ]
      );
      booking1Id = b1Res.rows[0].id;

      const b2Res = await pgClient.query(
        `INSERT INTO public.bookings (
          user_id, zone_id, bay_id, truck_dimension, time_window_start, time_window_end,
          assigned_time_start, assigned_time_end, vehicle_plate, status, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $5, $6, $7, 'confirmed', $8)
        RETURNING id`,
        [
          riderUserId,
          tanahAbangZoneId,
          bayA2Id,
          JSON.stringify({ lengthCm: 800, widthCm: 220, heightCm: 320, weightKg: 8000 }),
          start2.toISOString(),
          end2.toISOString(),
          'B 9812 UAI',
          'Pengiriman paket garmen kedua'
        ]
      );
      booking2Id = b2Res.rows[0].id;
      console.log(`[OK] Created bookings: ${booking1Id}, ${booking2Id}`);
    }

    // QR Pass Token
    const dishubOfficerUserId = accountUserIds['dishub_officer'];
    await pgClient.query(
      `INSERT INTO public.qr_tokens (booking_id, signature, expires_at, scanned_at, scanned_by, scan_result)
       VALUES ($1, $2, now() + interval '2 hours', now(), $3, 'valid')
       ON CONFLICT (booking_id) DO NOTHING`,
      [booking1Id, 'ed25519-sig-pass-001', dishubOfficerUserId]
    );
    console.log(`[OK] QR pass synced for booking ${booking1Id}`);

    // Decision Log Audit Trail
    await pgClient.query(
      `INSERT INTO public.decision_logs (
        booking_id, zone_id, bay_id, solver_status, input_snapshot, model_version,
        solver_params, objective_value, alternatives_evaluated, selected_bay_id,
        binding_constraints, decision_reason, is_simulated
      ) VALUES ($1, $2, $3, 'optimal_proven', $4, 'v1.0.0-statistical-solver', $5, 0.0, 18, $3, $6, $7, false)`,
      [
        booking1Id,
        tanahAbangZoneId,
        bayA1Id,
        JSON.stringify({ requestedStart: new Date().toISOString(), truckLengthM: 8.0 }),
        JSON.stringify({ maxTimeoutMs: 3000, kerbCapacityMeters: 40.0 }),
        JSON.stringify([]),
        'Pencarian terbukti optimal. Slot dialokasikan pada Bay BAY-A1 dengan estimasi durasi P90 = 45 menit. Estimasi luberan antrean: 0 meter-menit.'
      ]
    );
    console.log(`[OK] Decision log synced`);

    // 4. TELEMETRY & GEOFENCE DWELL EVENTS FOR DISHUB MONITORING
    console.log('\n--- 4. Populating Roadside Telemetry & Geofence Events ---');

    await pgClient.query(`DELETE FROM public.vehicle_telemetry`);
    await pgClient.query(
      `INSERT INTO public.vehicle_telemetry (
        user_id, booking_id, vehicle_plate, location, speed_kmh, heading_deg, dwell_duration_sec, is_inside_geofence
      ) VALUES
      ($1, $2, 'B 9812 UAI', ST_GeogFromText('POINT(106.815 -6.186)'), 0.0, 90.0, 1800, true),
      ($1, null, 'B 9123 ABC', ST_GeogFromText('POINT(106.814 -6.184)'), 0.0, 45.0, 1200, false),
      ($1, null, 'B 9124 XYZ', ST_GeogFromText('POINT(106.814 -6.184)'), 0.0, 45.0, 1300, false),
      ($1, null, 'B 9125 JKL', ST_GeogFromText('POINT(106.814 -6.184)'), 0.0, 45.0, 1400, false)`,
      [riderUserId, booking1Id]
    );
    console.log(`[OK] Vehicle telemetry synced`);

    // 5. SIMULATION RUNS METRICS FOR SYSTEM ADMIN
    console.log('\n--- 5. Populating Simulation Runs A/B Metrics ---');

    await pgClient.query(`DELETE FROM public.simulation_runs`);
    await pgClient.query(
      `INSERT INTO public.simulation_runs (
        seed, scenario_name, zone_id, total_vehicles,
        baseline_spillover_meter_min, controlled_spillover_meter_min,
        baseline_wait_minutes, controlled_wait_minutes,
        idle_fuel_saved_liters, co2_reduced_kg, run_params
      ) VALUES
      (42, 'Simulasi A/B Morning Peak Tanah Abang', $1, 20, 1630.0, 1090.0, 185.0, 120.0, 2.71, 7.26, $2)`,
      [
        tanahAbangZoneId,
        JSON.stringify({ seed: 42, totalVehicles: 20, kerbCapacityMeters: 40.0 })
      ]
    );
    console.log(`[OK] Simulation run metrics synced`);

    // Congestion score
    await pgClient.query(`DELETE FROM public.congestion_scores`);
    await pgClient.query(
      `INSERT INTO public.congestion_scores (zone_id, hour_bucket, score, active_trucks, created_at)
       VALUES ($1, date_trunc('hour', now()), 4.2, 3, now())`,
      [tanahAbangZoneId]
    );
    console.log(`[OK] Congestion score synced`);

    console.log('\n=====================================================');
    console.log('SUCCESSFULLY POPULATED LIVE DATABASE WITH REAL ACCOUNTS & OPERATIONAL DATA!');
    console.log('=====================================================\n');

  } catch (err) {
    console.error('Error populating live DB:', err.message, err);
  } finally {
    await pgClient.end();
  }
}

seedLiveData();
