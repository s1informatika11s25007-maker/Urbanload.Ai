import React, { Suspense, useEffect, useState, lazy } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Maximize2, Radio, Loader2, Eye, Shield, Building2, Truck, Cpu } from 'lucide-react';
import { createClient } from '../lib/supabase/client.js';

const LiveMapHero = lazy(() => import('../components/livemap/LiveMapHero.jsx').then(m => ({ default: m.LiveMapHero })));
const StatsSidebar = lazy(() => import('../components/livemap/StatsSidebar.jsx').then(m => ({ default: m.StatsSidebar })));
const LiveActivityTable = lazy(() => import('../components/livemap/LiveActivityTable.jsx').then(m => ({ default: m.LiveActivityTable })));
const CitizenReportsFeed = lazy(() => import('../components/enforcement/CitizenReportsFeed.jsx').then(m => ({ default: m.CitizenReportsFeed })));

function LiveMapMainContent() {
  const [searchParams] = useSearchParams();
  const isPublicPreview = searchParams.get('preview') === 'public';
  const [userRole, setUserRole] = useState('rider');

  useEffect(() => {
    async function fetchUserRole() {
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
    }
    fetchUserRole();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      {/* Banner Role Dynamic Status */}
      {!isPublicPreview && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-teal-50 to-indigo-50 border border-teal-200 text-teal-950 flex items-center justify-between text-xs shadow-sm">
          <div className="flex items-center gap-2 font-bold">
            {userRole === 'dishub_officer' ? (
              <>
                <Shield className="h-4 w-4 text-indigo-600 shrink-0" />
                <span>Modul Petugas Dishub (`dishub_officer`) — Pemantauan Telemetri Truk, Verifikasi Pas QR Ed25519 & Deteksi Kluster Henti Liar (`ST_ClusterDBSCAN`)</span>
              </>
            ) : userRole === 'city_admin' ? (
              <>
                <Building2 className="h-4 w-4 text-teal-600 shrink-0" />
                <span>Modul Admin Kota (`city_admin`) — Pemantauan Spasial Kota & Manajemen Zona Logistik</span>
              </>
            ) : userRole === 'admin' ? (
              <>
                <Cpu className="h-4 w-4 text-purple-600 shrink-0" />
                <span>Modul System Administrator (`admin`) — Pengawasan Ekosistem Platform, Audit Logs & Konfigurasi System Parameter</span>
              </>
            ) : (
              <>
                <Truck className="h-4 w-4 text-teal-600 shrink-0" />
                <span>Modul Kurir (`rider`) — Pemantauan Lokasi Bay Spasial & Posisi Armada Realtime</span>
              </>
            )}
          </div>
          <span className="bg-white px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-teal-300 text-teal-800">
            {userRole === 'dishub_officer' ? 'Petugas Dishub' : userRole === 'city_admin' ? 'Admin Kota' : userRole === 'admin' ? 'System Admin' : 'Kurir'} Access
          </span>
        </div>
      )}

      {/* Banner Public Preview Status */}
      {isPublicPreview && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs shadow-sm">
          <div className="flex items-center gap-2 font-bold">
            <Eye className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Mode Live Map Publik — Tampilan Read-Only Kepadatan & Telemetri Teragregasi Kota</span>
          </div>
          <span className="bg-white px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-emerald-200 text-emerald-800">
            Akses Publik (Read-Only)
          </span>
        </div>
      )}

      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-2">
        <div>
          <div className="text-xs text-slate-500 mb-1">Beranda / LiveMap</div>
          <h1 className="text-2xl font-black text-slate-900">Dashboard Pemantauan Perkotaan — UrbanLoad.AI</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            <Radio className="h-3.5 w-3.5 animate-pulse text-emerald-600" /> Realtime Live Feed: Connected
          </div>
          <button className="p-2 border rounded-lg text-slate-600 hover:bg-slate-100" title="Fullscreen">
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Section 1: Peta Utama */}
        <div className="lg:col-span-8">
          <Suspense fallback={
            <div className="w-full h-[calc(100vh-120px)] rounded-2xl bg-slate-900 border border-slate-700 flex flex-col items-center justify-center text-teal-400 text-xs font-bold gap-3 animate-pulse shadow-md">
              <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
              <span>Memuat MapLibre GL JS WebGL Engine...</span>
            </div>
          }>
            <LiveMapHero />
          </Suspense>
        </div>

        {/* Section 2: Panel Statistik Ringkas */}
        <div className="lg:col-span-4 space-y-6">
          <Suspense fallback={<div className="p-4 text-xs text-slate-400">Memuat Statistik...</div>}>
            <StatsSidebar />
            <LiveActivityTable />
          </Suspense>
        </div>
      </div>

      {/* Section 3: CitizenReport Live Feed for Dishub Officers & City Admins */}
      <Suspense fallback={<div className="p-4 text-xs text-slate-400">Memuat Feed Laporan Masyarakat...</div>}>
        <CitizenReportsFeed />
      </Suspense>
    </div>
  );
}

export default function LiveMap() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Memuat LiveMap Spatial Dashboard...</div>}>
      <LiveMapMainContent />
    </Suspense>
  );
}
