import React, { Suspense, useEffect, useState, lazy } from 'react';
import { ShieldAlert, Radio } from 'lucide-react';
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

  const isDishubOfficer = userRole === 'dishub_officer' || userRole === 'dishub' || userRole === 'admin';

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      {/* Banner Role Status */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-50 to-indigo-50 border border-red-200 text-red-950 flex items-center justify-between text-xs shadow-sm">
        <div className="flex items-center gap-2 font-bold">
          <ShieldAlert className="h-4 w-4 text-red-600 shrink-0" />
          <span>Modul Petugas Dishub (`dishub_officer`) — Pemindaian QR QuickPass, Konfirmasi Kedatangan & Penindakan Parkir Liar</span>
        </div>
        <span className="bg-white px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-red-300 text-red-800">
          {isDishubOfficer ? 'Petugas Dishub Access' : 'Akses Terbatas'}
        </span>
      </div>

      {/* Header Halaman - Synchronized with Sidebar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-2">
        <div>
          <div className="text-xs text-slate-500 mb-1">Beranda / Penindakan & Verifikasi Dishub</div>
          <h1 className="text-2xl font-black text-slate-900">Pusat Laporan Pelanggaran</h1>
          <p className="text-xs text-slate-500 mt-1">
            Pengawasan laporan parkir liar warga & pemindaian tiket pas digital QuickPass QR.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
          <Radio className="h-3.5 w-3.5 animate-pulse text-red-600" /> Live Feed Realtime
        </div>
      </div>

      {/* SECTION 1: QR QUICKPASS SCANNER (KHUSUS ROLE DISHUB OFFICER) */}
      {isDishubOfficer && <QRScanner />}

      {/* SECTION 2: CITIZEN REPORT FEED */}
      <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Memuat Feed Laporan Dishub...</div>}>
        <CitizenReportsFeed readOnly={!isDishubOfficer} />
      </Suspense>
    </div>
  );
}
