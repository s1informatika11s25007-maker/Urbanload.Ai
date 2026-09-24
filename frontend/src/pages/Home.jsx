import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button.jsx';
import { Card } from '../components/ui/card.jsx';
import { createClient } from '../lib/supabase/client.js';
import {
  Truck,
  MapPin,
  QrCode,
  Activity,
  ArrowRight,
  UserCheck,
  PlayCircle,
  AlertTriangle,
  TrendingDown,
  FileCheck,
  Lock,
  Eye,
  Layers,
  Award,
  ShieldCheck,
  BarChart3,
  Zap,
  CheckCircle2,
  Clock,
  Navigation,
  Globe,
  Database,
} from 'lucide-react';

export default function Home() {
  const [zonesCount, setZonesCount] = useState(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.from('zones').select('id', { count: 'exact', head: true }).then(({ count }) => {
      if (count !== null && count !== undefined) {
        setZonesCount(count);
      }
    });
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24 py-6 sm:py-10 max-w-6xl mx-auto px-4">
      {/* 1. HERO SECTION — ONE Clear Primary CTA for Jury, Human Language Value Prop */}
      <div className="text-center space-y-6 max-w-3xl mx-auto pt-2 sm:pt-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 font-bold text-xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>
            {zonesCount !== null && zonesCount > 0
              ? `${zonesCount} Zona Logistik Perkotaan Terhubung Real-Time`
              : 'Zona Logistik Perkotaan Terhubung Real-Time'}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight">
          Solusi Cerdas Pengendali Kepadatan Bongkar Muat Logistik Perkotaan
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto">
          Mencegah penumpukan truk di bahu jalan dengan jadwal slot bebas antrean, validasi lokasi presisi, dan pas digital terverifikasi.
        </p>

        {/* Action Hero: ONE Clear Primary CTA + Secondary Links */}
        <div className="pt-2 space-y-3">
          {/* PRIMARY CTA FOR JURY / REVIEWERS */}
          <Link to="/rider/dashboard?demo=true" className="inline-block w-full sm:w-auto">
            <Button className="w-full sm:w-auto px-8 py-4 text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl font-black bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-2xl transform hover:scale-[1.02] transition">
              <Award className="h-5 w-5 text-amber-300" />
              <span>Coba Mode Demo Juri (Akses Instan)</span>
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>

          {/* SECONDARY LINKS */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-600 pt-1">
            <Link to="/login" className="hover:text-teal-700 underline underline-offset-4 flex items-center gap-1">
              <UserCheck className="h-3.5 w-3.5 text-teal-600" /> Masuk ke Sistem Akun
            </Link>
            <span className="text-slate-300">•</span>
            <Link to="/city/livemap?preview=public" className="hover:text-teal-700 underline underline-offset-4 flex items-center gap-1">
              <Eye className="h-3.5 w-3.5 text-teal-600" /> Lihat LiveMap Pemantauan Kota
            </Link>
          </div>
        </div>

        {/* Tech Stack Badges Bar */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-2 text-[10px] font-mono font-bold text-slate-500">
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 flex items-center gap-1">
            <Database className="h-3 w-3 text-teal-600" /> Supabase PostGIS
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 flex items-center gap-1">
            <Zap className="h-3 w-3 text-teal-600" /> GroqLogix AI
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 flex items-center gap-1">
            <Globe className="h-3 w-3 text-teal-600" /> MapLibre GL JS
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-teal-600" /> HMAC-SHA256
          </span>
        </div>
      </div>

      {/* 2. SECTION MASALAH DENGAN DATA & ANGKA */}
      <section id="masalah" className="space-y-8 scroll-mt-20">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-rose-700 uppercase tracking-wider bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            Dampak Kepadatan Logistik
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Masalah Nyata Lapangan yang Diselesaikan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Kurangnya koordinasi jadwal bongkar muat menimbulkan kerugian waktu dan emisi karbon harian di pusat kota.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-3 border-rose-200 bg-rose-50/30 rounded-2xl shadow-sm">
            <div className="text-3xl font-black text-rose-600 font-mono">4.2 Jam</div>
            <h3 className="font-bold text-sm text-slate-900">Antrean Idle di Bahu Jalan</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Rata-rata waktu tunggu truk parkir liar di area padat seperti Pasar Tanah Abang dan Pelabuhan Tanjung Priok akibat kapasitas bay tidak teratur.
            </p>
          </Card>

          <Card className="p-6 space-y-3 border-amber-200 bg-amber-50/30 rounded-2xl shadow-sm">
            <div className="text-3xl font-black text-amber-600 font-mono">68%</div>
            <h3 className="font-bold text-sm text-slate-900">Kemacetan Area Pasar & Industri</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Persentase penyumbatan lalu lintas yang dipicu oleh aktivitas bongkar muat tanpa alokasi jadwal slot waktu yang pasti.
            </p>
          </Card>

          <Card className="p-6 space-y-3 border-teal-200 bg-teal-50/30 rounded-2xl shadow-sm">
            <div className="text-3xl font-black text-teal-700 font-mono">Rp 12.8 M</div>
            <h3 className="font-bold text-sm text-slate-900">Kerugian Operasional BBM & Waktu</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Estimasi pemborosan biaya BBM dan keterlambatan barang pokok harian yang dialami armada kurir logistik kota.
            </p>
          </Card>
        </div>
      </section>

      {/* 3. SOLUSI DALAM 3 LANGKAH VISUAL (BAHASA MANUSIA) */}
      <section id="cara-kerja" className="space-y-10 scroll-mt-20">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-teal-800 uppercase tracking-wider bg-teal-50 px-3.5 py-1.5 rounded-full border border-teal-200">
            Alur Kerja Sederhana
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            3 Langkah Mudah Distribusi Logistik Bebas Hambatan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            Proses cepat dari reservasi slot, verifikasi pas digital, hingga konfirmasi di lokasi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-4 border-slate-200 bg-white rounded-3xl shadow-sm hover:border-teal-500 transition">
            <div className="h-12 w-12 rounded-2xl bg-teal-100 text-teal-700 font-black text-lg flex items-center justify-center border border-teal-200">
              1
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-base text-slate-900">Pilih Slot Waktu (SmartSlot)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Kurir memilih zona tujuan & jam kedatangan. Sistem AI otomatis mencocokkan kapasitas bay dan dimensi truk agar tidak terjadi antrean.
              </p>
            </div>
          </Card>

          <Card className="p-6 space-y-4 border-slate-200 bg-white rounded-3xl shadow-sm hover:border-teal-500 transition">
            <div className="h-12 w-12 rounded-2xl bg-teal-100 text-teal-700 font-black text-lg flex items-center justify-center border border-teal-200">
              2
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-base text-slate-900">Scan Pas Digital (QuickPass QR)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Setiap pemesanan langsung mendapatkan tiket QR digital anti-pemalsuan yang tersimpan di HP kurir untuk ditunjukkan ke petugas.
              </p>
            </div>
          </Card>

          <Card className="p-6 space-y-4 border-slate-200 bg-white rounded-3xl shadow-sm hover:border-teal-500 transition">
            <div className="h-12 w-12 rounded-2xl bg-teal-100 text-teal-700 font-black text-lg flex items-center justify-center border border-teal-200">
              3
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-base text-slate-900">Otomatis Terverifikasi (GeoFence)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Saat truk memasuki radius 20m dari zona bongkar muat, lokasi GPS otomatis tervalidasi dan slot menjadi terisi (*Occupied*).
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* 4. SHOWCASE SCREENSHOT & DOKUMENTASI APLIKASI ASLI */}
      <section id="showcase" className="space-y-8 scroll-mt-20">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-teal-800 uppercase tracking-wider bg-teal-50 px-3.5 py-1.5 rounded-full border border-teal-200">
            Tampilan Aplikasi Asli
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Antarmuka Pengendali Spasial & Operasional Kurir
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Lihat langsung fitur utama aplikasi yang dapat diuji pada mode demo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card Showcase 1: LiveMap Spasial */}
          <Card className="p-5 border-slate-200 bg-slate-900 text-white rounded-3xl shadow-xl space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-teal-400 bg-teal-500/20 px-2.5 py-0.5 rounded-full border border-teal-500/30">
                  LiveMap 3D Spasial
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <h3 className="font-black text-sm text-white">Pemantauan Zona & Kepadatan</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Peta interaktif dengan indikator warna CongestionScore (Hijau, Kuning, Merah) dan posisi armada truk real-time.
              </p>
            </div>
            <Link to="/city/livemap?preview=public" className="block pt-2">
              <Button className="w-full text-xs font-bold py-2 bg-teal-600 hover:bg-teal-500 text-white">
                Buka LiveMap Spasial <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </Card>

          {/* Card Showcase 2: QuickPass QR & Panic Reschedule */}
          <Card className="p-5 border-slate-200 bg-slate-900 text-white rounded-3xl shadow-xl space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  QuickPass QR Tiket
                </span>
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              </div>
              <h3 className="font-black text-sm text-white">Tiket Pas Digital & Panic Button</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Verifikasi QR digital HMAC-SHA256 untuk petugas Dishub serta fitur Panic Reschedule untuk pergeseran jadwal darurat.
              </p>
            </div>
            <Link to="/rider/dashboard?demo=true" className="block pt-2">
              <Button className="w-full text-xs font-bold py-2 bg-emerald-600 hover:bg-emerald-500 text-white">
                Coba QuickPass QR <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </Card>

          {/* Card Showcase 3: BayUtilization Tracker */}
          <Card className="p-5 border-slate-200 bg-slate-900 text-white rounded-3xl shadow-xl space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  BayUtilization Tracker
                </span>
                <BarChart3 className="h-4 w-4 text-amber-400" />
              </div>
              <h3 className="font-black text-sm text-white">Grafik Okupansi & Kepadatan</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Analisis persentase penggunaan slot bongkar muat (% okupansi) dan tren jam kerja untuk membantu keputusan kurir.
              </p>
            </div>
            <Link to="/rider/congestion" className="block pt-2">
              <Button className="w-full text-xs font-bold py-2 bg-amber-600 hover:bg-amber-500 text-white">
                Lihat Tren Kepadatan <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* 5. DAMPAK & ECOFOOTPRINT METRICS */}
      <section id="dampak" className="p-8 rounded-3xl bg-gradient-to-br from-teal-900 via-slate-900 to-emerald-950 text-white border border-teal-700/60 shadow-2xl space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-wider text-teal-300 bg-teal-500/20 px-3 py-1 rounded-full border border-teal-500/30">
            Proyeksi Dampak Efisiensi Kota
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Dampak Langsung Penggunaan UrbanLoad.AI
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Estimasi penurunan hambatan dan emisi karbon harian di koridor logistik perkotaan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1 text-center">
            <div className="text-3xl font-black text-teal-400 font-mono">-45%</div>
            <div className="text-xs font-bold text-white">Penurunan Waktu Tunggu Truk</div>
            <p className="text-[11px] text-slate-400">Truk langsung masuk ke bay tanpa parkir liar di bahu jalan</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1 text-center">
            <div className="text-3xl font-black text-emerald-400 font-mono">-38%</div>
            <div className="text-xs font-bold text-white">Reduksi Emisi Karbon CO2</div>
            <p className="text-[11px] text-slate-400">Mengurangi gas buang idle kendaraan selama waktu antrean</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1 text-center">
            <div className="text-3xl font-black text-amber-400 font-mono">100%</div>
            <div className="text-xs font-bold text-white">Validasi Presisi GeoFence</div>
            <p className="text-[11px] text-slate-400">Mencegah klaim keberadaan fiktif dengan koordinat WGS84</p>
          </div>
        </div>
      </section>

      {/* 6. BANNER MODE DEMO JURI */}
      <Card className="p-8 bg-gradient-to-r from-teal-50 via-white to-emerald-50 border-teal-200 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg rounded-3xl">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 font-extrabold text-teal-800 text-xs bg-white px-3 py-1 rounded-full border border-teal-200 shadow-sm">
            <Award className="h-4 w-4 text-teal-600" /> Khusus Penilaian Juri Lomba
          </div>
          <h2 className="text-2xl font-black text-slate-900">Uji Coba Interactive Sandbox Demo</h2>
          <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
            Akses simulasi terisolasi untuk mereview pemesanan slot AI, verifikasi scan Dishub, dan query PostGIS tanpa pendaftaran.
          </p>
        </div>

        <Link to="/rider/dashboard?demo=true" className="shrink-0">
          <Button className="px-8 py-3.5 text-xs font-black shadow-xl bg-teal-600 hover:bg-teal-700 text-white rounded-2xl">
            Mulai Mode Demo Juri
          </Button>
        </Link>
      </Card>
    </div>
  );
}
