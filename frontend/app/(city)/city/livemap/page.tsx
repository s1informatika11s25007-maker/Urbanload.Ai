'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { StatsSidebar } from '@/components/livemap/StatsSidebar';
import { LiveActivityTable } from '@/components/livemap/LiveActivityTable';
import { Maximize2, Radio, Loader2, Eye } from 'lucide-react';

const LiveMapHero = dynamic(
  () => import('@/components/livemap/LiveMapHero').then((mod) => mod.LiveMapHero),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[calc(100vh-120px)] rounded-2xl bg-slate-900 border border-slate-700 flex flex-col items-center justify-center text-teal-400 text-xs font-bold gap-3 animate-pulse shadow-md">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        <span>Memuat MapLibre GL JS WebGL Engine...</span>
      </div>
    ),
  }
);

function LiveMapMainContent() {
  const searchParams = useSearchParams();
  const isPublicPreview = searchParams.get('preview') === 'public';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Banner Public Preview Status (Without Requiring Account Login) */}
      {isPublicPreview && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs shadow-sm">
          <div className="flex items-center gap-2 font-bold">
            <Eye className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Mode Live Preview Publik — Tampilan Read-Only Kepadatan & Telemetri Kota untuk Pengunjung</span>
          </div>
          <span className="bg-white px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-emerald-200 text-emerald-800">
            Tanpa Akun (Read-Only Spectator)
          </span>
        </div>
      )}

      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-2">
        <div>
          <div className="text-xs text-slate-500 mb-1">Beranda / LiveMap</div>
          <h1 className="text-2xl font-black text-slate-900">Dashboard Pemantauan Kota — Real-Time</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            <Radio className="h-3.5 w-3.5 animate-pulse" /> Supabase Realtime: Connected
          </div>
          <button className="p-2 border rounded-lg text-slate-600 hover:bg-slate-100" title="Fullscreen">
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Section 1: Peta Utama */}
        <div className="lg:col-span-8">
          <LiveMapHero />
        </div>

        {/* Section 2: Panel Statistik Ringkas */}
        <div className="lg:col-span-4 space-y-6">
          <StatsSidebar />
          <LiveActivityTable />
        </div>
      </div>
    </div>
  );
}

export default function LiveMapSpatialPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Memuat LiveMap Spatial Dashboard...</div>}>
      <LiveMapMainContent />
    </Suspense>
  );
}
