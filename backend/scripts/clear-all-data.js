const { Client } = require('pg');

const connectionStrings = [
  'postgres://postgres.gzxoodmqqrweknwghnzz:Esvk5103z8pyD4Zp@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres',
  'postgres://postgres.gzxoodmqqrweknwghnzz:Esvk5103z8pyD4Zp@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres',
  'postgres://postgres:Esvk5103z8pyD4Zp@db.gzxoodmqqrweknwghnzz.supabase.co:5432/postgres',
];

async function wipeDatabase() {
  console.log('=== WIPING ALL DATA FROM SUPABASE DATABASE ===');

  let connected = false;

  for (const connStr of connectionStrings) {
    console.log(`Connecting to: ${connStr.replace(/:[^:@]+@/, ':****@')}`);
    const client = new Client({
      connectionString: connStr,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    });

    try {
      await client.connect();
      console.log('Connected to Supabase PostgreSQL!');

      // Truncate all public tables
      await client.query(`
        TRUNCATE TABLE public.qr_tokens, public.bookings, public.congestion_scores, public.zones, public.profiles CASCADE;
      `);
      console.log('Successfully truncated all public tables!');

      // Delete all auth users
      await client.query(`
        DELETE FROM auth.users;
      `);
      console.log('Successfully deleted all auth users!');

      await client.end();
      connected = true;
      break;
    } catch (err) {
      console.error(`Error with connection: ${err.message}`);
      try { await client.end(); } catch (e) {}
    }
  }

  if (!connected) {
    console.error('Could not connect to database endpoints.');
  }
}

wipeDatabase();
