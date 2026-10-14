import React, { Suspense, lazy } from 'react';
import { Shield, ShieldAlert, Radio, CheckCircle2, AlertOctagon } from 'lucide-react';
import { Card } from '../components/ui/card.jsx';

const CitizenReportsFeed = lazy(() =>
  import('../components/enforcement/CitizenReportsFeed.jsx').then((m) => ({ default: m.CitizenReportsFeed }))
);

export default function DishubReportsPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      {/* Banner Khusus Petugas Dishub */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-50 to-indigo-50 border border-red-200 text-red-950 flex items-center justify-between text-xs shadow-sm">
        <div className="flex items-center gap-2 font-bold">
          <ShieldAlert className="h-4 w-4 text-red-600 shrink-0" />
          <span>Modul Petugas Dishub (`dishub_officer`) — Penanganan Laporan Parkir Liar, Pemblokiran Bahu Jalan & Penjatuhan Sanksi</span>
        </div>
        <span className="bg-white px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-red-300 text-red-800">
          Petugas Dishub Access
        </span>
      </div>

      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-2">
        <div>
          <div className="text-xs text-slate-500 mb-1">Beranda / Penindakan Dishub</div>
          <h1 className="text-2xl font-black text-slate-900">Laporan Masyarakat (CitizenReport)</h1>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
          <Radio className="h-3.5 w-3.5 animate-pulse text-red-600" /> Live Feed Realtime
        </div>
      </div>

      {/* CitizenReport Feed Component */}
      <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Memuat Feed Laporan Dishub...</div>}>
        <CitizenReportsFeed />
      </Suspense>
    </div>
  );
}
