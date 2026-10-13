const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');

const supabaseUrl = 'https://gzxoodmqqrweknwghnzz.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6eG9vZG1xcXJ3ZWtud2dobnp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDAyODQzNSwiZXhwIjoyMTA1NjA0NDM1fQ.8KNJGZWLobuOJeLErahZwep4m17H7QRZ1lfUPdIJaDU';

const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const connectionString = 'postgres://postgres.gzxoodmqqrweknwghnzz:Esvk5103z8pyD4Zp@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres';

async function syncAllAuthUsers() {
  console.log('=====================================================');
  console.log('SYNCING SUPABASE AUTH USERS FOR ALL 4 ROLES via GoTrue Admin API');
  console.log('=====================================================\n');

  const pgClient = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await pgClient.connect();

  const accounts = [
    {
      email: 'testrider@urbanload.ai',
      phone: '080365201158',
      fullName: 'Test Rider',
      role: 'rider',
      password: 'password123'
    },
    {
      email: 'admin.kota@urbanload.ai',
      phone: '081100000001',
      fullName: 'Admin Kota UrbanLoad',
      role: 'city_admin',
      password: 'password123'
    },
    {
      email: 'dishub@urbanload.ai',
      phone: '081100000002',
      fullName: 'Petugas Dishub UrbanLoad',
      role: 'dishub_officer',
      password: 'password123'
    },
    {
      email: 'admin@urbanload.ai',
      phone: '081100000003',
      fullName: 'System Administrator UrbanLoad',
      role: 'admin',
      password: 'password123'
    }
  ];

  try {
    for (const acc of accounts) {
      // Delete any previous auth user with this email to get a clean GoTrue Auth record
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existing = existingUsers?.users?.find(u => u.email === acc.email);
      if (existing) {
        await supabaseAdmin.auth.admin.deleteUser(existing.id);
        console.log(`[DELETED OLD] ${acc.email}`);
      }

      // Delete from auth.users via pg directly to prevent constraint conflicts
      await pgClient.query(`DELETE FROM auth.users WHERE email = $1`, [acc.email]);

      // Create new GoTrue Auth user
      const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email: acc.email,
        password: acc.password,
        email_confirm: true,
        user_metadata: {
          full_name: acc.fullName,
          phone_number: acc.phone,
          role: acc.role
        }
      });

      if (createErr) {
        console.error(`[ERROR] Failed creating ${acc.email}:`, createErr.message);
        continue;
      }

      const authId = newUser.user.id;
      console.log(`[CREATED GoTrue Auth] ${acc.fullName} (${acc.role}) -> ID: ${authId}`);

      // Upsert into public.profiles
      await pgClient.query(
        `INSERT INTO public.profiles (id, phone_number, email, full_name, role, phone_verified, updated_at)
         VALUES ($1, $2, $3, $4, $5::public.user_role, TRUE, now())
         ON CONFLICT (id) DO UPDATE SET
           phone_number = EXCLUDED.phone_number,
           email = EXCLUDED.email,
           full_name = EXCLUDED.full_name,
           role = EXCLUDED.role,
           phone_verified = TRUE,
           updated_at = now()`,
        [authId, acc.phone, acc.email, acc.fullName, acc.role]
      );
      console.log(`[SYNCED PROFILE] ${acc.fullName} [${acc.role}]`);
    }

    console.log('\n=====================================================');
    console.log('ALL 4 ROLES SYNCED IN SUPABASE AUTH & PROFILES SUCCESSFULLY!');
    console.log('=====================================================\n');

  } catch (err) {
    console.error('Error syncing auth users:', err);
  } finally {
    await pgClient.end();
  }
}

syncAllAuthUsers();
