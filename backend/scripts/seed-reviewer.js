const { Pool } = require("pg");

const pool = new Pool({
  connectionString: "postgres://postgres.gzxoodmqqrweknwghnzz:Esvk5103z8pyD4Zp@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres",
  ssl: { rejectUnauthorized: false }
});

async function clearData() {
  console.log("=== CLEARING ALL DATA FROM SUPABASE TABLES ===");

  try {
    await pool.query(`
      TRUNCATE TABLE public.qr_tokens, public.bookings, public.zones, public.profiles CASCADE;
    `);
    console.log("SUCCESSFULLY CLEARED ALL DATA FROM PUBLIC TABLES!");
  } catch (err) {
    console.error("Clear Error:", err);
  } finally {
    await pool.end();
  }
}

clearData();
