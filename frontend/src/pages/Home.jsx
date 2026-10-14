import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button.jsx';
import { Card } from '../components/ui/card.jsx';
import { createClient } from '../lib/supabase/client.js';
import {
  ArrowRight,
  UserCheck,
  ShieldCheck,
  Globe,
  Database,
  MapPin,
  QrCode,
  Cpu,
  Truck,
  ShieldAlert,
  AlertOctagon,
  UploadCloud,
  CheckCircle2,
  Navigation
} from 'lucide-react';

export default function Home() {
  const [zonesCount, setZonesCount] = useState(4);
  const [bookingsCount, setBookingsCount] = useState(2);

  useEffect(() => {
    async function loadStats() {
      const supabase = createClient();
      try {
        const [zRes, bRes] = await Promise.all([
          supabase.from('zones').select('id', { count: 'exact', head: true }),
          supabase.from('bookings').select('id', { count: 'exact', head: true })
        ]);

        if (zRes.count !== null) setZonesCount(zRes.count);
        if (bRes.count !== null) setBookingsCount(bRes.count);
      } catch (e) {
        console.warn('Stats fetch warning:', e);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="w-full font-sans text-slate-900 pb-12 space-y-16 sm:space-y-20">
      {/* 1. HERO SECTION — SLEEK, ELEGANT & PROFESSIONAL */}
      <section className="w-full relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white py-16 sm:py-24 px-4 sm:px-8 lg:px-12 border-b border-slate-800 shadow-xl">
        {/* Ambient Subtle Glow */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 font-bold text-xs backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Platform Spasial Pengendali Logistik Perkotaan Real-Time</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            UrbanLoad<span className="text-teal-400">.AI</span> — Spillover-Aware Urban Freight Control
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed font-medium max-w-3xl mx-auto">
            Memprediksi durasi bongkar muat, mengalokasikan slot kedatangan secara presisi, dan mencegah luberan antrean truk di bahu jalan umum kota — terukur dalam <span className="font-bold text-teal-300 font-mono">meter-menit</span>.
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link to="/login">
              <Button className="py-3.5 px-8 text-xs sm:text-sm font-black bg-teal-500 hover:bg-teal-600 text-slate-950 shadow-lg shadow-teal-500/20 flex items-center gap-2 rounded-xl transition-all hover:scale-105">
                <UserCheck className="h-4 w-4" /> Masuk Ke System / Demo <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link to="/city/livemap?preview=public">
              <Button variant="outline" className="py-3.5 px-6 text-xs sm:text-sm font-bold border-slate-700 bg-slate-900/80 text-slate-200 hover:bg-slate-800 rounded-xl flex items-center gap-2">
                <Globe className="h-4 w-4 text-teal-400" /> Pantau Peta Live Publik
              </Button>
            </Link>
          </div>

          {/* Live DB Metrics Counter Row */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md space-y-1">
              <span className="text-[10px] font-bold text-teal-400 uppercase font-mono block">Zona Logistik</span>
              <span className="text-xl font-black text-white font-mono">{zonesCount} Zona Active</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase font-mono block">Booking Real-Time</span>
              <span className="text-xl font-black text-white font-mono">{bookingsCount} Transaksi</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md space-y-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase font-mono block">Presisi GeoFence</span>
              <span className="text-xl font-black text-white font-mono">&lt; 20 Meter</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md space-y-1">
              <span className="text-[10px] font-bold text-indigo-400 uppercase font-mono block">Reduksi Luberan</span>
              <span className="text-xl font-black text-white font-mono">33.1% Saved</span>
            </div>
          </div>

          {/* Technology Badges */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs font-mono font-medium text-slate-400">
            <span className="px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center gap-1.5 text-slate-300">
              <Database className="h-3.5 w-3.5 text-teal-400" /> PostGIS WGS84
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center gap-1.5 text-slate-300">
              <Cpu className="h-3.5 w-3.5 text-teal-400" /> UrbanLoad AI Engine
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center gap-1.5 text-slate-300">
              <Globe className="h-3.5 w-3.5 text-teal-400" /> MapLibre GL 3D
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Ed25519 QuickPass
            </span>
          </div>
        </div>
      </section>

      {/* 2. SOLUSI UTAMA (3 PILAR ELEGANT) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-extrabold text-teal-800 uppercase tracking-wider bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            Arsitektur Sistem Cerdas
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            3 Pilar Utama UrbanLoad.AI
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Sistem terintegrasi untuk efisiensi bongkar muat dan pengawasan kerb perkotaan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="p-6 space-y-3 border-slate-200 bg-white rounded-2xl shadow-sm hover:border-teal-500 transition-all hover:-translate-y-1">
            <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-black">
              <Truck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">1. SmartSlot AI Booking</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Mengalokasikan slot waktu kedatangan truk berdasarkan estimasi durasi bongkar muat untuk mencegah bentrok dan penumpukan kendaraan.
            </p>
          </Card>

          <Card className="p-6 space-y-3 border-slate-200 bg-white rounded-2xl shadow-sm hover:border-emerald-500 transition-all hover:-translate-y-1">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-black">
              <QrCode className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">2. Pas Digital QuickPass</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Tiket QR terenkripsi Ed25519 sekali pakai untuk pemindaian dan verifikasi cepat oleh Petugas Dishub di lapangan.
            </p>
          </Card>

          <Card className="p-6 space-y-3 border-slate-200 bg-white rounded-2xl shadow-sm hover:border-indigo-500 transition-all hover:-translate-y-1">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-black">
              <MapPin className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">3. Validasi GeoFence Spasial</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Memastikan keberadaan fisik truk dalam radius GeoFence zona logistik secara real-time sebelum izin parkir aktif.
            </p>
          </Card>
        </div>
      </section>

      {/* 3. FITUR UTAMA: LAPORAN PELANGGARAN WARGA (CITIZENREPORT) — FULL BLEED EDGE-TO-EDGE */}
      <section className="w-full relative overflow-hidden bg-gradient-to-r from-slate-950 via-red-950 to-slate-950 text-white py-16 sm:py-20 px-4 sm:px-8 lg:px-12 border-y border-red-900/50 shadow-2xl">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
          {/* Sisi Kiri: Deskripsi & Akses Publik */}
          <div className="space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-500/20 border border-red-400/40 text-red-300 font-extrabold text-xs backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-red-400 animate-ping"></span>
              <span>CitizenReport • Akses Publik Tanpa Login</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              Fitur Laporan Pelanggaran Warga Real-Time
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
              Masyarakat umum dapat berpartisipasi langsung melaporkan parkir liar di bahu jalan, truk tanpa reservasi yang memblokir <span className="font-bold text-red-300">loading bay</span>, atau pelanggaran durasi bongkar muat. Laporan dikirim seketika ke Petugas Dishub Lapangan.
            </p>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 bg-slate-900/80 border border-red-900/50 rounded-2xl space-y-1">
                <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                  <Navigation className="h-4 w-4 text-red-400" /> Presisi GPS Lokasi Saya
                </span>
                <p className="text-[11px] text-slate-400">Deteksi otomatis koordinat & alamat akurat lokasi kejadian.</p>
              </div>

              <div className="p-3.5 bg-slate-900/80 border border-red-900/50 rounded-2xl space-y-1">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <UploadCloud className="h-4 w-4 text-amber-400" /> Bukti Foto Kamera
                </span>
                <p className="text-[11px] text-slate-400">Unggah foto bukti pelanggaran langsung dari kamera ponsel.</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <Link to="/lapor">
                <Button className="py-3 px-7 text-xs sm:text-sm font-black bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-600/30 flex items-center gap-2 transition-all hover:scale-105">
                  <AlertOctagon className="h-4 w-4" /> Laporkan Pelanggaran Sekarang <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Sisi Kanan: Live Interactive Mock Showcase */}
          <div className="p-6 bg-slate-900/90 border border-red-900/60 rounded-3xl shadow-2xl space-y-4 text-xs font-sans text-slate-200 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-red-500 animate-pulse" />
                <span className="font-extrabold text-white text-xs">Simulasi Laporan Warga Lapangan</span>
              </div>
              <span className="bg-red-500/20 text-red-300 border border-red-500/40 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold">
                LIVE REALTIME
              </span>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-slate-400">#RPT-8921-JKT</span>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-bold uppercase">
                  Laporan Diterima Dishub
                </span>
              </div>
              <p className="font-bold text-slate-100 text-xs">Parkir Liar di Bahu Jalan Utama</p>
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                <MapPin className="h-3.5 w-3.5 text-red-400 shrink-0" />
                <span>Jl. Tanah Abang I No. 12, Jakarta Pusat</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-950/40 border border-emerald-800/50 rounded-2xl space-y-1 text-emerald-200 text-[11px]">
              <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Penindakan Tim Patroli Dishub
              </div>
              <p className="text-slate-300 text-[10px]">
                Petugas Dishub menerima sinyal GPS dan mengarahkan armada Derek ke lokasi penertiban.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SEBELUM VS SESUDAH URBANLOAD */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-teal-950 via-slate-900 to-slate-950 text-white border border-teal-800/50 shadow-xl space-y-6">
          <div className="text-center space-y-1.5 max-w-xl mx-auto">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-300 bg-teal-500/20 px-3 py-1 rounded-full border border-teal-500/30">
              Dampak Operasional
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">Sebelum vs Sesudah UrbanLoad.AI</h2>
            <p className="text-xs text-slate-300 font-medium">
              Transformasi pengelolaan zona logistik dari antrean liar menjadi terstruktur.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            <div className="p-5 rounded-2xl bg-slate-900/90 text-slate-200 border border-rose-500/30 space-y-2.5">
              <div className="text-xs font-black text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500"></span> Kondisi Tanpa Sistem
              </div>
              <ul className="text-xs text-slate-300 space-y-2 leading-relaxed font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 shrink-0">•</span>
                  <span>Truk parkir liar di bahu jalan menyebabkan kemacetan lalu lintas.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 shrink-0">•</span>
                  <span>Mesin idle berkepanjangan memicu pemborosan BBM dan emisi CO2.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 shrink-0">•</span>
                  <span>Kurangnya data real-time untuk pengawasan dan penindakan Dishub.</span>
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 text-slate-200 border border-teal-500/30 space-y-2.5">
              <div className="text-xs font-black text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-teal-400"></span> Dengan UrbanLoad.AI
              </div>
              <ul className="text-xs text-slate-300 space-y-2 leading-relaxed font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-teal-400 shrink-0">•</span>
                  <span>Kedatangan truk terjadwal, mereduksi luberan antrean hingga 33.1%.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-400 shrink-0">•</span>
                  <span>Verifikasi lokasi GeoFence dan tiket QuickPass QR dalam hitungan detik.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-400 shrink-0">•</span>
                  <span>Visibilitas okupansi dan pemantauan spasial untuk keputusan kota.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION DEMO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-md text-center space-y-4 max-w-3xl mx-auto">
          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Siap Menguji Coba UrbanLoad.AI?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Gunakan akun demo terdaftar untuk mencoba seluruh fitur pengirim, pengawas, dan administrator.
            </p>
          </div>

          <div className="pt-2 flex justify-center">
            <Link to="/login">
              <Button className="py-3 px-7 text-xs sm:text-sm font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl flex items-center gap-2 shadow-md">
                <UserCheck className="h-4 w-4" /> Masuk Ke Sistem Akun <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
