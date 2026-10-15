import React, { Suspense, lazy } from 'react';
import { Radio, Loader2 } from 'lucide-react';

const LiveMapHero = lazy(() => import('../components/livemap/LiveMapHero.jsx').then(m => ({ default: m.LiveMapHero })));
const StatsSidebar = lazy(() => import('../components/livemap/StatsSidebar.jsx').then(m => ({ default: m.StatsSidebar })));
const LiveActivityTable = lazy(() => import('../components/livemap/LiveActivityTable.jsx').then(m => ({ default: m.LiveActivityTable })));

function LiveMapMainContent() {
  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto p-2.5 sm:p-4">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 sm:pb-4 gap-2">
        <div>
          <div className="text-[11px] sm:text-xs text-slate-500 mb-0.5">Beranda / LiveMap</div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Telemetri & LiveMap 3D</h1>
          <p className="text-[11px] sm:text-xs text-slate-500">Peta interaktif 3D pemantauan spasial lalu lintas logistik perkotaan realtime.</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            <Radio className="h-3 w-3 animate-pulse text-emerald-600" /> Realtime Live
          </div>
        </div>
      </div>

      {/* SECTION 1: PETA SPASIAL 3D UTAMA */}
      <div className="w-full">
        <Suspense fallback={
          <div className="w-full h-[380px] sm:h-[520px] rounded-2xl bg-slate-900 border border-slate-700 flex flex-col items-center justify-center text-teal-400 text-xs font-bold gap-3 animate-pulse shadow-md">
            <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
            <span>Memuat MapLibre GL JS WebGL Engine...</span>
          </div>
        }>
          <LiveMapHero />
        </Suspense>
      </div>

      {/* SECTION 2: STATISTIK & FEED AKTIVITAS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 pt-1">
        <div className="lg:col-span-7">
          <Suspense fallback={<div className="p-4 text-xs text-slate-400">Memuat Analytics...</div>}>
            <StatsSidebar />
          </Suspense>
        </div>

        <div className="lg:col-span-5">
          <Suspense fallback={<div className="p-4 text-xs text-slate-400">Memuat Feed Aktivitas...</div>}>
            <LiveActivityTable />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default function LiveMap() {
  return (
    <Suspense fallback={<div className="p-4 sm:p-8 text-center text-xs text-slate-400">Memuat LiveMap Spatial Dashboard...</div>}>
      <LiveMapMainContent />
    </Suspense>
  );
}
