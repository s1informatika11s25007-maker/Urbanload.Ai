import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button.jsx';
import { Card } from '../components/ui/card.jsx';
import { createClient } from '../lib/supabase/client.js';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import {
  ArrowRight,
  UserCheck,
  ShieldCheck,
  BarChart3,
  Zap,
  Globe,
  Database,
  Eye,
  MapPin,
  QrCode,
  Radar,
  Scan,
  CheckCircle2,
  Truck,
  Building2,
  Shield,
  Activity,
  Cpu,
  Clock,
  Layers,
  Sparkles,
  TrendingDown
} from 'lucide-react';

export default function Home() {
  const [zonesCount, setZonesCount] = useState(4);
  const [bookingsCount, setBookingsCount] = useState(2);

  const liveOccupancyData = [
    { jam: '06.00', okupansi: 20 },
    { jam: '08.00', okupansi: 65 },
    { jam: '10.00', okupansi: 92 },
    { jam: '12.00', okupansi: 85 },
    { jam: '14.00', okupansi: 70 },
    { jam: '16.00', okupansi: 88 },
    { jam: '18.00', okupansi: 35 },
  ];

  useEffect(() => {
    async function loadStats() {
      const supabase = createClient();
      try {
        const { count: zCount } = await supabase.from('zones').select('id', { count: 'exact', head: true });
        const { count: bCount } = await supabase.from('bookings').select('id', { count: 'exact', head: true });
        if (zCount !== null) setZonesCount(zCount);
        if (bCount !== null) setBookingsCount(bCount);
      } catch (e) {
        console.warn('Stats fetch warning:', e);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24 font-sans text-slate-900 pb-12">
      {/* 1. HERO SECTION — HIGH IMPACT EXECUTIVE SMART CITY THEME */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-950 via-slate-900 to-slate-950 text-white py-16 sm:py-24 px-4 sm:px-8 border-b border-teal-800/40 shadow-2xl">
        {/* Ambient Glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-400/30 text-teal-300 font-extrabold text-xs backdrop-blur-md shadow-inner">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Platform Spasial Pengendali Logistik Perkotaan Real-Time</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
            UrbanLoad<span className="text-teal-400">.AI</span> — Spillover-Aware Urban Freight Control
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 leading-relaxed font-medium max-w-3xl mx-auto">
            Memprediksi durasi bongkar muat, mengalokasikan slot kedatangan secara presisi, dan mencegah luberan antrean truk di bahu jalan umum kota — terukur langsung dalam <span className="font-bold text-teal-300 font-mono">meter-menit</span>.
          </p>

          {/* Call to Action Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Link to="/login">
              <Button className="py-3 px-6 text-xs sm:text-sm font-black bg-teal-500 hover:bg-teal-600 text-slate-950 shadow-lg shadow-teal-500/25 flex items-center gap-2">
                <UserCheck className="h-4 w-4" /> Masuk System / Uji Coba Demo <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/city/livemap?preview=public">
              <Button variant="outline" className="py-3 px-6 text-xs sm:text-sm font-bold border-slate-700 bg-slate-900/80 text-teal-300 hover:bg-slate-800 hover:text-white flex items-center gap-2">
                <Eye className="h-4 w-4 text-teal-400" /> Buka LiveMap Pemantauan Kota
              </Button>
            </Link>
          </div>

          {/* Live DB Metrics Counter Row */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md space-y-1">
              <span className="text-[10px] font-bold text-teal-400 uppercase font-mono block">Zona Logistik</span>
              <span className="text-2xl font-black text-white font-mono">{zonesCount} Zona Active</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase font-mono block">Booking Real-Time</span>
              <span className="text-2xl font-black text-white font-mono">{bookingsCount} Transaksi</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md space-y-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase font-mono block">Presisi GeoFence</span>
              <span className="text-2xl font-black text-white font-mono">&lt; 20 Meter</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md space-y-1">
              <span className="text-[10px] font-bold text-indigo-400 uppercase font-mono block">Reduksi Luberan</span>
              <span className="text-2xl font-black text-white font-mono">33.1% Saved</span>
            </div>
          </div>

          {/* Technology Badges */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2 text-xs font-mono font-bold text-slate-400">
            <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-1.5 text-slate-300">
              <Database className="h-3.5 w-3.5 text-teal-400" /> PostGIS WGS84
            </span>
            <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-1.5 text-slate-300">
              <Cpu className="h-3.5 w-3.5 text-teal-400" /> Groq Qwen 32B
            </span>
            <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-1.5 text-slate-300">
              <Globe className="h-3.5 w-3.5 text-teal-400" /> MapLibre GL 3D
            </span>
            <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Ed25519 QuickPass
            </span>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 space-y-16 sm:space-y-24">
        {/* 2. MASALAH LAPANGAN VS SOLUSI URBANLOAD */}
        <section id="masalah" className="space-y-8 scroll-mt-20">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold text-rose-900 uppercase tracking-wider bg-rose-100 px-3.5 py-1 rounded-full border border-rose-300">
              Tantangan Lapangan Logistik Perkotaan
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Mengapa Logistik Kota Membutuhkan Solusi Ini?
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-slate-600">
              Antrean truk tanpa koordinasi memicu kemacetan bahu jalan, pemborosan BBM idle, dan ketidakpastian operasional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 space-y-3 border-rose-200 bg-white rounded-2xl shadow-sm hover:border-rose-400 transition">
              <MapPin className="h-8 w-8 text-rose-600" />
              <h3 className="font-black text-base text-slate-900">Truk Parkir Liar di Bahu Jalan</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Tanpa pengaturan waktu kedatangan, truk menumpuk di badan jalan umum kawasan padat seperti Pasar Tanah Abang dan Pelabuhan Priok.
              </p>
            </Card>

            <Card className="p-6 space-y-3 border-amber-200 bg-white rounded-2xl shadow-sm hover:border-amber-400 transition">
              <Radar className="h-8 w-8 text-amber-600" />
              <h3 className="font-black text-base text-slate-900">Kurangnya Alat Verifikasi Lapangan</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Petugas Dishub tidak memiliki instrumen cepat untuk memverifikasi izin slot, dimensi truk, dan durasi dwell di lokasi.
              </p>
            </Card>

            <Card className="p-6 space-y-3 border-teal-200 bg-white rounded-2xl shadow-sm hover:border-teal-400 transition">
              <BarChart3 className="h-8 w-8 text-teal-600" />
              <h3 className="font-black text-base text-slate-900">Visibilitas Data Okupansi Kritis</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Pemerintah Kota tidak memiliki data kuantitatif dalam meter dan menit atas tingkat luberan kemacetan bahu jalan.
              </p>
            </Card>
          </div>
        </section>

        {/* 3. ALUR KERJA SOLUSI DALAM 3 LANGKAH */}
        <section id="cara-kerja" className="space-y-8 scroll-mt-20">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold text-teal-900 uppercase tracking-wider bg-teal-100 px-3.5 py-1.5 rounded-full border border-teal-300">
              Alur Operasional
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              3 Langkah Bebas Hambatan Antrean Bahu Jalan
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 space-y-4 border-slate-200 bg-white rounded-3xl shadow-sm hover:border-teal-500 transition">
              <div className="h-12 w-12 rounded-2xl bg-teal-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                1
              </div>
              <div className="space-y-1.5">
                <h3 className="font-black text-base text-slate-900">SmartSlot AI Booking</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Kurir memesan slot kedatangan. Solver memprediksi durasi P50/P90 dan mencocokkan kapasitas bay tanpa bentrok (*anti double-booking*).
                </p>
              </div>
            </Card>

            <Card className="p-6 space-y-4 border-slate-200 bg-white rounded-3xl shadow-sm hover:border-emerald-500 transition">
              <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                <QrCode className="h-6 w-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-black text-base text-slate-900">Pas Digital QuickPass Ed25519</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Sistem menerbitkan tiket digital ber-signature kriptografi Ed25519 yang terenkripsi dan dapat dipindai oleh Petugas Dishub.
                </p>
              </div>
            </Card>

            <Card className="p-6 space-y-4 border-slate-200 bg-white rounded-3xl shadow-sm hover:border-indigo-500 transition">
              <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                3
              </div>
              <div className="space-y-1.5">
                <h3 className="font-black text-base text-slate-900">Verifikasi GeoFence & Staging</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Presisi lokasi GPS tervalidasi otomatis saat kendaraan tiba. Jika jadwal padat, truk diarahkan ke Staging Area dengan waktu rilis otomatis.
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* 4. SHOWCASE INTERAKTIF PLATFORM */}
        <section id="showcase" className="space-y-8 scroll-mt-20">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold text-teal-900 uppercase tracking-wider bg-teal-100 px-3.5 py-1.5 rounded-full border border-teal-300">
              Showcase Platform Interaktif
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Eksplorasi Modul Operasional UrbanLoad
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* LiveMap Card */}
            <Card className="p-6 border-slate-200 bg-white rounded-3xl shadow-sm space-y-4 flex flex-col justify-between hover:border-teal-500 transition">
              <div className="space-y-3">
                <div className="h-32 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-3 gap-1.5 p-2.5 shadow-inner">
                  <div className="rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[10px] font-black text-emerald-300 font-mono">Zona A</div>
                  <div className="rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-[10px] font-black text-amber-300 font-mono">Zona B</div>
                  <div className="rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-[10px] font-black text-rose-300 font-mono">Zona C</div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-bold px-3 py-1 rounded-full border text-teal-900 bg-teal-100 border-teal-300">
                    MapLibre 3D Spasial
                  </span>
                  <Globe className="h-5 w-5 text-teal-600" />
                </div>
                <h3 className="font-black text-base text-slate-900">LiveMap Pemantauan Spasial</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Pemantauan zona logistik, segmen kerb, posisi truk real-time, dan deteksi kluster henti liar (`ST_ClusterDBSCAN`).
                </p>
              </div>
              <Link to="/city/livemap?preview=public" className="block pt-2">
                <Button className="w-full text-xs font-bold py-2.5 rounded-xl shadow-sm bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center gap-2">
                  Buka LiveMap Spasial <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </Card>

            {/* QuickPass QR Card */}
            <Card className="p-6 border-slate-200 bg-white rounded-3xl shadow-sm space-y-4 flex flex-col justify-between hover:border-emerald-500 transition ring-2 ring-emerald-500/10">
              <div className="space-y-3">
                <div className="h-32 rounded-2xl bg-slate-950 border border-emerald-500/40 flex items-center justify-between p-3.5 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white rounded-xl shadow-lg border border-slate-200 shrink-0">
                      <QrCode className="h-9 w-9 text-slate-900" />
                    </div>
                    <div className="space-y-1 text-left">
                      <span className="text-[9px] font-mono font-extrabold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30 inline-block">
                        Ed25519 VERIFIED
                      </span>
                      <span className="text-xs font-black text-white block">PAS DIGITAL QUICKPASS</span>
                      <span className="text-[10px] text-slate-400 font-mono block">ID: UL-2026-PASS</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-bold px-3 py-1 rounded-full border text-emerald-900 bg-emerald-100 border-emerald-300 flex items-center gap-1">
                    <Scan className="h-3.5 w-3.5 text-emerald-700" /> Ed25519 QuickPass
                  </span>
                  <QrCode className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="font-black text-base text-slate-900">Tiket Digital & Verifikasi QR</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Pas digital sekali pakai dengan tanda tangan kriptografi Ed25519, nonce unik, dan verifikasi status atomik.
                </p>
              </div>
              <Link to="/rider/bookings/new" className="block pt-2">
                <Button className="w-full text-xs font-bold py-2.5 rounded-xl shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2">
                  Uji Coba Booking & QR <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </Card>

            {/* Recharts Area Chart Card */}
            <Card className="p-6 border-slate-200 bg-white rounded-3xl shadow-sm space-y-4 flex flex-col justify-between hover:border-amber-500 transition ring-2 ring-amber-500/10">
              <div className="space-y-3">
                <div className="h-32 rounded-2xl bg-slate-950 border border-amber-500/40 p-2.5 shadow-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-amber-300 border-b border-slate-800 pb-1">
                    <span className="flex items-center gap-1"><BarChart3 className="h-3 w-3 text-amber-400" /> Okupansi Bay Real-Time</span>
                    <span className="text-emerald-400 font-extrabold bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">Peak 92%</span>
                  </div>
                  <div className="h-20 w-full pt-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={liveOccupancyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="amberGradHome" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="jam" tick={{ fontSize: 8, fill: '#94a3b8' }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 8, fill: '#94a3b8' }} unit="%" />
                        <Area type="monotone" dataKey="okupansi" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#amberGradHome)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-bold px-3 py-1 rounded-full border text-amber-900 bg-amber-100 border-amber-300">
                    BayUtilization Real
                  </span>
                  <BarChart3 className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="font-black text-base text-slate-900">Grafik Okupansi & Kepadatan</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Fluktuasi skor kepadatan per jam berdasarkan telemetri aktual untuk mempermudah pemilihan slot bebas antrean.
                </p>
              </div>
              <Link to="/rider/congestion" className="block pt-2">
                <Button className="w-full text-xs font-bold py-2.5 rounded-xl shadow-sm bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-2">
                  Lihat Skor Kepadatan <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </Card>
          </div>
        </section>

        {/* 5. SEBELUM VS SESUDAH URBANLOAD */}
        <section
          id="dampak"
          className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-teal-950 via-slate-900 to-slate-950 text-white border border-teal-700/60 shadow-2xl space-y-6"
        >
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-wider text-teal-300 bg-teal-500/20 px-3.5 py-1 rounded-full border border-teal-500/30">
              Proyeksi Dampak Fisik
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Sebelum vs Sesudah UrbanLoad.AI</h2>
            <p className="text-xs sm:text-sm font-medium text-slate-300">
              Dampak terukur nyata dalam unit meter-menit luberan antrean, menit tunggu, dan estimasi reduksi emisi CO2.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 max-w-3xl mx-auto">
            <div className="p-6 rounded-3xl bg-white text-slate-900 border-2 border-rose-200 space-y-3 shadow-xl">
              <div className="text-xs font-black text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-600"></span> Kondisi Eksistensi Lapangan
              </div>
              <ul className="text-xs sm:text-sm text-slate-900 space-y-2.5 leading-relaxed font-bold">
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 shrink-0">•</span>
                  <span>Truk berhenti tanpa koordinasi di bahu jalan, memicu kemacetan umum.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 shrink-0">•</span>
                  <span>Mesin truk dalam keadaan idle menghasilkan pemborosan BBM & emisi tinggi.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 shrink-0">•</span>
                  <span>Pemerintah Kota tidak memiliki instrumen data kuantitatif untuk pengawasan.</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-3xl bg-white text-slate-900 border-2 border-teal-200 space-y-3 shadow-xl">
              <div className="text-xs font-black text-teal-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-teal-600"></span> Solusi Cerdas UrbanLoad.AI
              </div>
              <ul className="text-xs sm:text-sm text-slate-900 space-y-2.5 leading-relaxed font-bold">
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 shrink-0">•</span>
                  <span>Slot kedatangan terjadwal presisi, mereduksi luberan antrean hingga 33.1%.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 shrink-0">•</span>
                  <span>Verifikasi lokasi GPS GeoFence dan tiket QuickPass QR Ed25519 secara instan.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 shrink-0">•</span>
                  <span>Dashboard eksekutif kota memuat audit log keputusan solver dan simulator What-If.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 6. CALL TO ACTION FOR REVIEWERS / DEMO ACCESS */}
        <section className="p-8 sm:p-10 rounded-3xl bg-white border border-teal-200 shadow-xl text-center space-y-5 relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase text-teal-800 bg-teal-100 px-3 py-1 rounded-full border border-teal-300">
              Akses Demo & Pengujian
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Uji Coba Sistem UrbanLoad Secara End-to-End
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Gunakan akun terdaftar di Live DB Supabase untuk menguji seluruh fitur sesuai peran masing-masing.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link to="/login">
              <Button className="py-3 px-6 text-xs sm:text-sm font-black bg-teal-600 hover:bg-teal-700 text-white shadow-md flex items-center gap-2">
                <UserCheck className="h-4 w-4" /> Masuk Ke Sistem Akun <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/city/livemap">
              <Button variant="outline" className="py-3 px-6 text-xs sm:text-sm font-bold border-slate-300 text-slate-800 hover:bg-slate-100 flex items-center gap-2">
                <Globe className="h-4 w-4 text-teal-600" /> Buka LiveMap Pemantauan
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
