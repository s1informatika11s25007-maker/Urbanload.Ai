const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const connectionStrings = [
  'postgres://postgres.gzxoodmqqrweknwghnzz:Esvk5103z8pyD4Zp@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres',
  'postgres://postgres.gzxoodmqqrweknwghnzz:Esvk5103z8pyD4Zp@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres',
  'postgres://postgres:Esvk5103z8pyD4Zp@db.gzxoodmqqrweknwghnzz.supabase.co:5432/postgres',
];

async function run() {
  const sqlFilePath = path.join(__dirname, '../supabase/full_setup.sql');
  const sql = fs.readFileSync(sqlFilePath, 'utf8');

  let connected = false;

  for (const connStr of connectionStrings) {
    console.log(`Trying connection: ${connStr.replace(/:[^:@]+@/, ':****@')}`);
    const client = new Client({
      connectionString: connStr,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    });

    try {
      await client.connect();
      console.log('Connected successfully to Supabase PostgreSQL!');

      await client.query(sql);
      console.log('SQL full_setup.sql executed successfully!');

      // Check tables in public schema
      const res = await client.query(`
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public'
      `);
      console.log('Tables in public schema:', res.rows.map(r => r.table_name));

      await client.end();
      connected = true;
      break;
    } catch (err) {
      console.error(`Connection failed: ${err.message}`);
      try { await client.end(); } catch (e) {}
    }
  }

  if (!connected) {
    console.error('Could not connect to any database endpoint.');
    process.exit(1);
  }
}

run();
