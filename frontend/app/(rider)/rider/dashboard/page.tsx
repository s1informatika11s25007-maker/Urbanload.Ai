'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookingHistoryTable } from '@/components/booking/BookingHistoryTable';
import { Award, Plus, Database, ShieldCheck } from 'lucide-react';

function DashboardMainContent() {
  const searchParams = useSearchParams();
  const isDemo = searchParams.get('demo') === 'true';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Banner Sesi Demo Juri / Guest Reviewer */}
      {isDemo && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-center gap-2 font-bold">
            <Award className="h-5 w-5 text-amber-600 shrink-0" />
            <span>Mode Evaluasi Juri — Terhubung ke Database Spatial dengan data contoh terisolasi (reviewer@urbanload.ai)</span>
          </div>
          <span className="bg-white px-2.5 py-1 rounded-full text-[11px] font-mono border border-amber-200 text-amber-800">
            user_id: aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
          </span>
        </div>
      )}

      {/* Header Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Dashboard Operasional Kurir Logistik</h1>
          <p className="text-xs text-slate-500">
            Manajemen slot bongkar muat & status tiket QuickPass QR real-time.
          </p>
        </div>

        <Link href="/rider/bookings/new">
          <Button className="text-xs py-2 px-4 flex items-center gap-1.5 shadow-sm">
            <Plus className="h-4 w-4" /> Pesan Slot Booking Baru
          </Button>
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 bg-gradient-to-br from-teal-50 to-white border-teal-100 space-y-1">
          <span className="text-xs font-semibold text-teal-800 flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5 text-teal-600" /> Booking Aktif Realtime
          </span>
          <span className="text-3xl font-black text-slate-900">1 Slot</span>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-blue-50 to-white border-blue-100 space-y-1">
          <span className="text-xs font-semibold text-blue-800 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-600" /> Total Transaksi Selesai
          </span>
          <span className="text-3xl font-black text-slate-900">18 Slot</span>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-emerald-50 to-white border-emerald-100 space-y-1">
          <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5 text-emerald-600" /> Skor Kepatuhan Logistik
          </span>
          <span className="text-3xl font-black text-emerald-700">100%</span>
        </Card>
      </div>

      {/* Tabel Riwayat Booking Real-time */}
      <BookingHistoryTable isDemo={isDemo} />
    </div>
  );
}

export default function RiderDashboard() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Memuat Dashboard Operasional...</div>}>
      <DashboardMainContent />
    </Suspense>
  );
}
