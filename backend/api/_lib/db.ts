import { Pool } from 'pg';

const connectionString =
  process.env.DATABASE_URL ||
  'postgres://postgres.gzxoodmqqrweknwghnzz:Esvk5103z8pyD4Zp@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

export const dbPool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

export async function queryDb(sql: string, params: any[] = []) {
  const client = await dbPool.connect();
  try {
    const res = await client.query(sql, params);
    return res.rows;
  } finally {
    client.release();
  }
}
