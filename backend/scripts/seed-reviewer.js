const { Pool } = require("pg");

const pool = new Pool({
  connectionString: "postgres://postgres.gzxoodmqqrweknwghnzz:Esvk5103z8pyD4Zp@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres",
  ssl: { rejectUnauthorized: false }
});

async function setupReviewerAndSeed() {
  console.log("=== SETTING UP GUEST REVIEWER ACCOUNT & ISOLATED SEED DATA ===");

  const reviewerId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";

  try {
    // 1. Create auth.users entry for reviewer@urbanload.ai
    await pool.query(`
      INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
      VALUES ($1, $1, $2, $3, now(), $4, $5, now(), now(), $6, $6)
      ON CONFLICT (id) DO NOTHING;
    `, [
      reviewerId,
      "reviewer@urbanload.ai",
      "$2a$10$abcdefghijklmnopqrstuu",
      JSON.stringify({ provider: "email", providers: ["email"] }),
      JSON.stringify({ full_name: "Juri / Guest Reviewer", role: "rider" }),
      "authenticated"
    ]);

    // 2. Create public.profiles entry for reviewer@urbanload.ai
    await pool.query(`
      INSERT INTO public.profiles (id, email, full_name, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO NOTHING;
    `, [reviewerId, "reviewer@urbanload.ai", "Juri / Guest Reviewer", "rider"]);

    // 3. Ensure zones exist
    await pool.query(`
      INSERT INTO public.zones (id, name, boundary_polygon, max_truck_capacity, operating_hours_start, operating_hours_end, zone_type, priority_level)
      VALUES
      (
        '11111111-1111-1111-1111-111111111111',
        'Zona A - Pasar Tanah Abang',
        ST_GeomFromText('POLYGON((106.810 -6.180, 106.820 -6.180, 106.820 -6.190, 106.810 -6.190, 106.810 -6.180))', 4326)::geography,
        12, '06:00', '20:00', 'logistics', 'priority_pass'
      ),
      (
        '22222222-2222-2222-2222-222222222222',
        'Zona B - Kawasan Monas & Gambir',
        ST_GeomFromText('POLYGON((106.820 -6.170, 106.830 -6.170, 106.830 -6.180, 106.820 -6.180, 106.820 -6.170))', 4326)::geography,
        15, '08:00', '22:00', 'mixed', 'normal'
      ),
      (
        '33333333-3333-3333-3333-333333333333',
        'Zona C - Tanjung Priok Port Terminal',
        ST_GeomFromText('POLYGON((106.870 -6.100, 106.890 -6.100, 106.890 -6.120, 106.870 -6.120, 106.870 -6.100))', 4326)::geography,
        30, '00:00', '23:59', 'logistics', 'priority_pass'
      )
      ON CONFLICT (id) DO NOTHING;
    `);

    // 4. Seed sample bookings isolated to reviewerId ONLY
    await pool.query(`
      INSERT INTO public.bookings (id, user_id, zone_id, truck_dimension, time_window_start, time_window_end, notes, status)
      VALUES
      (
        'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa',
        $1,
        '11111111-1111-1111-1111-111111111111',
        '{"lengthCm": 800, "widthCm": 220, "heightCm": 320, "weightKg": 8000, "licensePlate": "B 1234 XYZ"}',
        now(),
        now() + interval '1 hour',
        '[Data Contoh Evaluasi] Slot Bongkar Muat Tekstil Tanah Abang',
        'confirmed'
      ),
      (
        'aaaaaaaa-2222-2222-2222-aaaaaaaaaaaa',
        $1,
        '22222222-2222-2222-2222-222222222222',
        '{"lengthCm": 1000, "widthCm": 250, "heightCm": 350, "weightKg": 12000, "licensePlate": "B 9876 ABC"}',
        now() - interval '1 day',
        now() - interval '23 hours',
        '[Data Contoh Evaluasi] Slot Logistik Monas Selesai',
        'completed'
      )
      ON CONFLICT (id) DO NOTHING;
    `, [reviewerId]);

    console.log("SUCCESSFULLY CREATED REVIEWER ACCOUNT & ISOLATED SEED DATA!");
  } catch (err) {
    console.error("Seed Error:", err);
  } finally {
    await pool.end();
  }
}

setupReviewerAndSeed();
