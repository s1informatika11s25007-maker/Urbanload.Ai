import React, { Suspense, useEffect, useState, lazy } from 'react';
import { Radio } from 'lucide-react';
import { QRScanner } from '../components/qr/QRScanner.jsx';
import { createClient } from '../lib/supabase/client.js';

const CitizenReportsFeed = lazy(() =>
  import('../components/enforcement/CitizenReportsFeed.jsx').then((m) => ({ default: m.CitizenReportsFeed }))
);

export default function DishubReportsPage() {
  const [userRole, setUserRole] = useState('rider');

  useEffect(() => {
    async function checkRole() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

          if (profile?.role) {
            setUserRole(profile.role);
          }
        }
      } catch (err) {
        console.warn('Role check error:', err);
      }
    }
    checkRole();
  }, []);

  // EXCLUSIVE DISHUB OFFICER ACCESS: QR Scanner is strictly for Petugas Dishub (NOT Admin / City Admin)
  const isDishubOfficer = userRole === 'dishub_officer' || userRole === 'dishub';

  return (
    <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto p-2.5 sm:p-4">
      {/* Header Halaman - Synchronized with Sidebar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 sm:pb-4 gap-2">
        <div>
          <div className="text-[11px] sm:text-xs text-slate-500 mb-0.5">Beranda / Penindakan & Verifikasi Dishub</div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            {isDishubOfficer ? 'Pusat Laporan Pelanggaran & Pemindai QR' : 'Pusat Laporan Pelanggaran'}
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Pengawasan laporan parkir liar warga & pemindaian tiket pas digital QuickPass QR petugas Dishub.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
          <Radio className="h-3.5 w-3.5 animate-pulse text-red-600" /> Live Feed Realtime
        </div>
      </div>

      {/* SECTION 1: QR QUICKPASS SCANNER (KHUSUS EKSKLUSIF PETUGAS DISHUB OFFICER) */}
      {isDishubOfficer && <QRScanner />}

      {/* SECTION 2: CITIZEN REPORT FEED */}
      <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Memuat Feed Laporan Dishub...</div>}>
        <CitizenReportsFeed readOnly={!isDishubOfficer} />
      </Suspense>
    </div>
  );
}
