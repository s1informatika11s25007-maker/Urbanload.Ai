import React, { Suspense, useEffect, useState, lazy } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { createClient } from '../lib/supabase/client.js';
import {
  Award,
  Plus,
  Database,
  ShieldCheck,
  RefreshCw,
  Truck,
  HelpCircle,
  MapPin,
  Calendar,
  QrCode,
  CheckCircle2
} from 'lucide-react';

const BookingHistoryTable = lazy(() => import('../components/booking/BookingHistoryTable.jsx').then(m => ({ default: m.BookingHistoryTable })));
const HighAccuracyTracker = lazy(() => import('../components/location/HighAccuracyTracker.jsx').then(m => ({ default: m.HighAccuracyTracker })));

function DashboardMainContent() {
  const [activeCount, setActiveCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [complianceScore, setComplianceScore] = useState(100);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [showGuide, setShowGuide] = useState(true);

  const loadMetrics = async () => {
    setLoadingMetrics(true);
    const supabase = createClient();

    try {
      const { data: userSession } = await supabase.auth.getUser();
      const activeUserId = userSession?.user?.id;

      let query = supabase.from('bookings').select('status').limit(200);
      if (activeUserId) {
        query = query.eq('user_id', activeUserId);
      }

      const { data: bookings } = await query;

      if (bookings && bookings.length > 0) {
        const active = bookings.filter((b) => b.status === 'confirmed' || b.status === 'pending' || b.status === 'active').length;
        const completed = bookings.filter((b) => b.status === 'completed').length;
        setActiveCount(active);
        setCompletedCount(completed);
        setComplianceScore(100);
      } else {
        setActiveCount(0);
        setCompletedCount(0);
        setComplianceScore(100);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMetrics(false);
    }
  };

  useEffect(() => {
    loadMetrics();

    const supabase = createClient();
    const channel = supabase
      .channel('dashboard_metrics_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        loadMetrics();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      {/* Banner Khusus Modul Kurir */}
      <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 flex items-center justify-between text-xs shadow-sm">
        <div className="flex items-center gap-2 font-bold">
          <Truck className="h-4 w-4 text-teal-600 shrink-0" />
          <span>Modul Operasional Kurir Logistik — Pengelolaan Slot Booking & Tiket QuickPass QR</span>
        </div>
        <span className="bg-white px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-teal-300 text-teal-800">
          Kurir Access
        </span>
      </div>

      {/* Header Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Dashboard Operasional Kurir Logistik</h1>
          <p className="text-xs text-slate-500">
            Manajemen slot bongkar muat & status tiket QuickPass QR real-time.
          </p>
        </div>

        <Link to="/rider/bookings/new">
          <Button className="text-xs py-2 px-4 flex items-center gap-1.5 shadow-sm font-bold bg-teal-600 hover:bg-teal-700 text-white">
            <Plus className="h-4 w-4" /> Pesan Slot Booking Baru
          </Button>
        </Link>
      </div>

      {/* 3-STEP QUICK USER GUIDE CARD */}
      {showGuide && (
        <Card className="p-5 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white rounded-3xl shadow-xl space-y-4 border border-teal-800/80 relative">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">Panduan Penggunaan Cepat (3 Langkah Mudah)</h3>
                <p className="text-xs text-slate-400">Cara menggunakan aplikasi UrbanLoad.AI untuk pengemudi kurir logistik</p>
              </div>
            </div>
            <button
              onClick={() => setShowGuide(false)}
              className="text-xs font-bold text-slate-400 hover:text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700"
            >
              Tutup Panduan ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Step 1 */}
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1.5">
              <div className="flex items-center gap-2 text-teal-400 font-bold text-xs">
                <span className="h-6 w-6 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center font-mono text-xs text-teal-300 font-black">1</span>
                <span>Aktifkan GPS Telemetri</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Biarkan sinyal GPS aktif. Sistem otomatis memverifikasi posisi Anda di dalam radius geofence lokasi bongkar muat.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1.5">
              <div className="flex items-center gap-2 text-teal-400 font-bold text-xs">
                <span className="h-6 w-6 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center font-mono text-xs text-teal-300 font-black">2</span>
                <span>Pesan Slot Booking</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Klik tombol <strong className="text-teal-300">Pesan Slot Booking Baru</strong> untuk memilih zona tujuan, jam kedatangan, dan dimensi truk.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1.5">
              <div className="flex items-center gap-2 text-teal-400 font-bold text-xs">
                <span className="h-6 w-6 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center font-mono text-xs text-teal-300 font-black">3</span>
                <span>Tunjukkan QR ke Dishub</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Saat tiba di bay lokasi, klik <strong className="text-teal-300">Tampilkan QR</strong> pada tabel riwayat untuk dipindai oleh petugas Dishub.
              </p>
            </div>
          </div>
        </Card>
      )}

      <Suspense fallback={<div className="p-4 text-xs text-slate-400">Memuat Tracker Lokasi...</div>}>
        <HighAccuracyTracker />
      </Suspense>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 bg-gradient-to-br from-teal-50 to-white border-teal-100 space-y-1">
          <span className="text-xs font-semibold text-teal-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5"><Database className="h-3.5 w-3.5 text-teal-600" /> Booking Aktif Realtime</span>
            {loadingMetrics && <RefreshCw className="h-3 w-3 animate-spin text-teal-600" />}
          </span>
          <span className="text-3xl font-black text-slate-900">{activeCount} Booking</span>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-blue-50 to-white border-blue-100 space-y-1">
          <span className="text-xs font-semibold text-blue-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-blue-600" /> Total Transaksi Selesai</span>
            {loadingMetrics && <RefreshCw className="h-3 w-3 animate-spin text-blue-600" />}
          </span>
          <span className="text-3xl font-black text-slate-900">{completedCount} Booking</span>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-emerald-50 to-white border-emerald-100 space-y-1">
          <span className="text-xs font-semibold text-emerald-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5"><Award className="h-3.5 w-3.5 text-emerald-600" /> Skor Kepatuhan Logistik</span>
          </span>
          <span className="text-3xl font-black text-emerald-700">{complianceScore}%</span>
        </Card>
      </div>

      {/* Tabel Riwayat Booking Real-time */}
      <Suspense fallback={<div className="p-4 text-xs text-slate-400">Memuat Riwayat Booking...</div>}>
        <BookingHistoryTable />
      </Suspense>
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
