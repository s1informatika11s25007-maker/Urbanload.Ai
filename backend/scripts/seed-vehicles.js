const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabaseUrl = process.env.SUPABASE_URL || 'https://gzxoodmqqrweknwghnzz.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6eG9vZG1xcXJ3ZWtud2dobnp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDAyODQzNSwiZXhwIjoyMTA1NjA0NDM1fQ.8KNJGZWLobuOJeLErahZwep4m17H7QRZ1lfUPdIJaDU';
const hmacSecret = process.env.HMAC_SECRET_KEY || 'urbanload-secret-key-2025-hmac-sha256';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function seedVehiclesAndBookings() {
  console.log("=================================================");
  console.log("🚗 URBANLOAD.AI SUPABASE API TERMINAL SEEDER 🚗");
  console.log("=================================================");

  try {
    // 1. Fetch registered profiles
    const { data: profiles, error: pErr } = await supabase.from('profiles').select('*');
    if (pErr) {
      console.error("[ERROR] Failed to fetch profiles:", pErr);
      return;
    }

    console.log(`[INFO] Found ${profiles ? profiles.length : 0} registered profiles in database:`);
    profiles.forEach(u => console.log(`  - ${u.full_name} (${u.role}) <${u.email || u.phone_number}> ID: ${u.id}`));

    const riderUser = profiles.find(u => u.role === 'rider') || profiles[0];
    const riderId = riderUser ? riderUser.id : '21f1f8a0-0180-4015-b0aa-b8f2de642e00';

    // 2. Ensure Zones exist in public.zones
    console.log("\n[1/4] Seeding/Verifying Logistics Zones...");
    const zonesData = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Zona A - Pasar Tanah Abang (Pusat Grosir)',
        max_truck_capacity: 15,
        zone_type: 'mixed',
        priority_level: 'priority_pass',
        boundary_polygon: 'POLYGON((106.815 -6.185, 106.825 -6.185, 106.825 -6.195, 106.815 -6.195, 106.815 -6.185))',
        operating_hours_start: '06:00',
        operating_hours_end: '22:00'
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'Zona B - Pelabuhan Tanjung Priok (Terminal Kontainer)',
        max_truck_capacity: 25,
        zone_type: 'port',
        priority_level: 'restricted',
        boundary_polygon: 'POLYGON((106.875 -6.100, 106.895 -6.100, 106.895 -6.120, 106.875 -6.120, 106.875 -6.100))',
        operating_hours_start: '06:00',
        operating_hours_end: '22:00'
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        name: 'Zona C - Kawasan Industri Pulogadung',
        max_truck_capacity: 20,
        zone_type: 'logistics',
        priority_level: 'normal',
        boundary_polygon: 'POLYGON((106.900 -6.190, 106.920 -6.190, 106.920 -6.210, 106.900 -6.210, 106.900 -6.190))',
        operating_hours_start: '06:00',
        operating_hours_end: '22:00'
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        name: 'Zona D - Terminal Logistik Marunda',
        max_truck_capacity: 18,
        zone_type: 'logistics',
        priority_level: 'normal',
        boundary_polygon: 'POLYGON((106.950 -6.110, 106.970 -6.110, 106.970 -6.130, 106.950 -6.130, 106.950 -6.110))',
        operating_hours_start: '06:00',
        operating_hours_end: '22:00'
      }
    ];

    const { error: zErr } = await supabase.from('zones').upsert(zonesData);
    if (zErr) console.warn("Zone upsert warning:", zErr.message);
    else console.log("✅ 4 Zones verified in database.");

    // 3. Seed Vehicles & Bookings directly into public.bookings
    console.log("\n[2/4] Adding Real Trucks/Vehicles and SmartSlot Bookings...");

    const vehiclesToSeed = [
      { plate: 'B 9123 TXT', zoneId: '11111111-1111-1111-1111-111111111111', status: 'confirmed', p50: 30, p90: 45, type: 'Engkel Box Medium (Kategori C)', offsetHours: 0 },
      { plate: 'B 9552 SQR', zoneId: '11111111-1111-1111-1111-111111111111', status: 'active', p50: 40, p90: 55, type: 'Fuso Heavy Duty (15 Ton)', offsetHours: 1 },
      { plate: 'B 9081 CDE', zoneId: '22222222-2222-2222-2222-222222222222', status: 'confirmed', p50: 60, p90: 80, type: 'Wingbox 10 Roda (20 Ton)', offsetHours: 2 },
      { plate: 'B 9722 KJN', zoneId: '22222222-2222-2222-2222-222222222222', status: 'completed', p50: 35, p90: 50, type: 'CDD Long Chassis (8 Ton)', offsetHours: -2 },
      { plate: 'B 9301 WXY', zoneId: '33333333-3333-3333-3333-333333333333', status: 'confirmed', p50: 25, p90: 35, type: 'Blind Van Express (2 Ton)', offsetHours: 3 },
      { plate: 'B 9488 TRK', zoneId: '33333333-3333-3333-3333-333333333333', status: 'confirmed', p50: 50, p90: 70, type: 'Tronton Double Axle (18 Ton)', offsetHours: 4 },
      { plate: 'B 9210 PKU', zoneId: '44444444-4444-4444-4444-444444444444', status: 'confirmed', p50: 75, p90: 95, type: 'Container Trailer 40ft (30 Ton)', offsetHours: 5 },
      { plate: 'B 9877 MKL', zoneId: '11111111-1111-1111-1111-111111111111', status: 'active', p50: 30, p90: 40, type: 'Cold Storage Reefer (10 Ton)', offsetHours: 0 }
    ];

    let insertedBookings = [];

    for (const v of vehiclesToSeed) {
      const now = new Date();
      const start = new Date(now.getTime() + v.offsetHours * 3600 * 1000);
      const end = new Date(start.getTime() + v.p50 * 60 * 1000);

      const { data: bData, error: bErr } = await supabase.from('bookings').insert({
        user_id: riderId,
        zone_id: v.zoneId,
        vehicle_plate: v.plate,
        status: v.status,
        time_window_start: start.toISOString(),
        time_window_end: end.toISOString(),
        duration_p50_min: v.p50,
        duration_p90_min: v.p90,
        assigned_time_start: start.toISOString(),
        assigned_time_end: end.toISOString()
      }).select('id, vehicle_plate, zone_id, status').single();

      if (bErr) {
        console.warn(`  ⚠️ Skip/Insert Warning for ${v.plate}:`, bErr.message);
      } else if (bData) {
        insertedBookings.push(bData);
        console.log(`  ➕ Added Truck: ${v.plate} [${v.type}] -> Status: ${v.status} (ID: ${bData.id.slice(0, 8)})`);
      }
    }

    // 4. Generate QuickPass HMAC QR Tokens
    console.log("\n[3/4] Generating QuickPass QR Tokens (HMAC-SHA256) for Field Dishub Verification...");

    for (const b of insertedBookings) {
      const expiresAt = new Date(Date.now() + 24 * 3600 * 1000);
      const payloadString = `URBANLOAD:${b.id}:${b.vehicle_plate}:${expiresAt.toISOString()}`;
      const hmacSignature = crypto.createHmac('sha256', hmacSecret).update(payloadString).digest('hex');

      await supabase.from('qr_tokens').upsert({
        booking_id: b.id,
        token: payloadString,
        hmac_signature: hmacSignature,
        status: 'active',
        expires_at: expiresAt.toISOString()
      }, { onConflict: 'booking_id' });
    }
    console.log("✅ QuickPass QR tokens generated for all trucks.");

    // 5. Seed Congestion Scores & Decision Audit Logs
    console.log("\n[4/4] Generating Congestion Scores & Solver Decision Audit Logs...");

    const scores = [
      { zone_id: '11111111-1111-1111-1111-111111111111', score: 8.2, active_trucks: 12, confidence_level: 'high', recommendation: 'Alokasi slot terkontrol untuk mencegah meter-menit luberan antrean' },
      { zone_id: '22222222-2222-2222-2222-222222222222', score: 9.1, active_trucks: 21, confidence_level: 'high', recommendation: 'Luberan tinggi di Priok, aktifkan Staging Area' },
      { zone_id: '33333333-3333-3333-3333-333333333333', score: 4.5, active_trucks: 8, confidence_level: 'high', recommendation: 'Kapasitas bay aman' },
      { zone_id: '44444444-4444-4444-4444-444444444444', score: 3.8, active_trucks: 5, confidence_level: 'high', recommendation: 'Lalu lintas lancar' }
    ];

    await supabase.from('congestion_scores').insert(scores);

    await supabase.from('decision_logs').insert({
      seed: 42,
      num_vehicles: insertedBookings.length,
      objective_value: 142.50,
      total_spillover_meter_min: 33.10,
      wait_time_min: 12.50,
      execution_time_ms: 85
    });

    console.log("\n=================================================");
    console.log("🎉 ALL TRUCK VEHICLES & SMARTPASS DATA SEEDED SUCCESSFULLY!");
    console.log("=================================================");
  } catch (err) {
    console.error("❌ Seeding Error:", err);
  }
}

seedVehiclesAndBookings();
