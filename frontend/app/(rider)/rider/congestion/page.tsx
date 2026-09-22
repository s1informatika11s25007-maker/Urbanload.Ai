'use client';

import dynamic from 'next/dynamic';
import { CongestionCard } from '@/components/congestion/CongestionCard';
import { RecommendationPanel } from '@/components/congestion/RecommendationPanel';
import { RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CongestionTrendChart = dynamic(
  () => import('@/components/congestion/CongestionTrendChart').then((mod) => mod.CongestionTrendChart),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-64 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-teal-700 text-xs font-bold gap-2 animate-pulse">
        <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
        <span>Memuat Grafik Tren Kepadatan Recharts...</span>
      </div>
    ),
  }
);

export default function CongestionScorePage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-2">
        <div>
          <div className="text-xs text-slate-500 mb-1">Beranda / Kepadatan Zona</div>
          <h1 className="text-2xl font-black text-slate-900">Skor Kepadatan Zona — Real-Time</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="text-xs flex items-center gap-1">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh (30s)
          </Button>
        </div>
      </div>

      {/* Section 1: Kartu Skor per Zona (Grid Responsif) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CongestionCard name="Zona A - Pasar Tanah Abang" score={10} active={11} capacity={12} />
        <CongestionCard name="Zona B - Monas & Gambir" score={4} active={6} capacity={15} />
        <CongestionCard name="Zona C - Tanjung Priok Port" score={2} active={5} capacity={30} />
      </div>

      {/* Section 2: Grafik Tren Kepadatan */}
      <CongestionTrendChart />

      {/* Section 3: Rekomendasi Sistem */}
      <RecommendationPanel />

      {/* Footer Halaman Disclaimer */}
      <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-500 border border-slate-200 font-mono">
        Disclaimer metodologi: "Skor dihitung dengan formula rule-based: booking_aktif ÷ kapasitas_maks_per_jam. Tidak menggunakan AI generatif."
      </div>
    </div>
  );
}
