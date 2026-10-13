const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gzxoodmqqrweknwghnzz.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6eG9vZG1xcXJ3ZWtud2dobnp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDAyODQzNSwiZXhwIjoyMTA1NjA0NDM1fQ.8KNJGZWLobuOJeLErahZwep4m17H7QRZ1lfUPdIJaDU';

const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const connectionString = 'postgres://postgres.gzxoodmqqrweknwghnzz:Esvk5103z8pyD4Zp@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres';

async function cleanExtraAccounts() {
  console.log('=====================================================');
  console.log('AUDITING & CLEANING EXTRA ACCOUNTS IN LIVE SUPABASE DB');
  console.log('=====================================================\n');

  const pgClient = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await pgClient.connect();

  try {
    // Standard 1 account per role target mapping
    const targetPrimaryEmails = {
      rider: 'testrider@urbanload.ai',
      city_admin: 'admin.kota@urbanload.ai',
      dishub_officer: 'dishub@urbanload.ai',
      admin: 'admin@urbanload.ai'
    };

    console.log('--- Current Accounts in public.profiles ---');
    const profilesRes = await pgClient.query('SELECT id, email, full_name, role FROM public.profiles ORDER BY role');
    console.table(profilesRes.rows);

    for (const p of profilesRes.rows) {
      const primaryEmailForRole = targetPrimaryEmails[p.role];
      if (primaryEmailForRole && p.email !== primaryEmailForRole) {
        console.log(`\nDeleting extra account for role '${p.role}': ${p.email} (ID: ${p.id})...`);

        // Reassign any bookings/telemetry/tokens referencing this user to primary account if needed
        const primaryRes = await pgClient.query('SELECT id FROM public.profiles WHERE email = $1', [primaryEmailForRole]);
        const primaryId = primaryRes.rows[0]?.id;

        if (primaryId) {
          await pgClient.query('UPDATE public.bookings SET user_id = $1 WHERE user_id = $2', [primaryId, p.id]);
          await pgClient.query('UPDATE public.vehicle_telemetry SET user_id = $1 WHERE user_id = $2', [primaryId, p.id]);
        }

        // Delete from public.profiles
        await pgClient.query('DELETE FROM public.profiles WHERE id = $1', [p.id]);

        // Delete from auth.users via Supabase Admin API & PG
        try {
          await supabaseAdmin.auth.admin.deleteUser(p.id);
        } catch (e) {
          console.warn('Supabase Admin delete notice:', e.message);
        }
        await pgClient.query('DELETE FROM auth.users WHERE id = $1', [p.id]);

        console.log(`[DELETED] Account ${p.email} removed successfully.`);
      }
    }

    console.log('\n=== FINAL ACCOUNTS IN LIVE DB (EXACTLY 1 PER ROLE) ===');
    const finalUsers = await pgClient.query('SELECT u.id, u.email, p.full_name, p.role, p.phone_number FROM auth.users u JOIN public.profiles p ON u.id = p.id ORDER BY p.role');
    console.table(finalUsers.rows);

  } catch (err) {
    console.error('Error cleaning extra accounts:', err);
  } finally {
    await pgClient.end();
  }
}

cleanExtraAccounts();
