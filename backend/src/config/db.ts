import { Client } from 'pg';

const connectionString =
  process.env.DATABASE_URL ||
  'postgres://postgres.gzxoodmqqrweknwghnzz:Esvk5103z8pyD4Zp@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

export async function queryDb<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  let attempts = 0;
  while (attempts < 3) {
    attempts++;
    const client = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    });
    try {
      await client.connect();
      try {
        const res = await client.query(sql, params);
        return res.rows;
      } finally {
        await client.end();
      }
    } catch (err: any) {
      if (attempts >= 3) throw err;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  throw new Error('Query failed after retries.');
}
