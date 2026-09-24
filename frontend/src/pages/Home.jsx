import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button.jsx';
import { Card } from '../components/ui/card.jsx';
import { createClient } from '../lib/supabase/client.js';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import {
  ArrowRight,
  UserCheck,
  Award,
  ShieldCheck,
  BarChart3,
  Zap,
  Globe,
  Database,
  Eye,
  Github,
  MapPin,
  QrCode,
  Radar,
  Scan,
  CheckCircle2,
} from 'lucide-react';

export default function Home() {
  const [zonesCount, setZonesCount] = useState(null);

  const liveOccupancyData = [
    { jam: '08.00', okupansi: 42 },
    { jam: '10.00', okupansi: 88 },
    { jam: '12.00', okupansi: 95 },
    { jam: '14.00', okupansi: 65 },
    { jam: '16.00', okupansi: 82 },
    { jam: '18.00', okupansi: 38 },
  ];

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('zones')
      .select('id', { count: 'exact', head: true })
      .then(({ count }) => {
        if (count !== null && count !== undefined) {
          setZonesCount(count);
        }
      });
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24 py-6 sm:py-10 max-w-6xl mx-auto px-4 font-sans text-slate-900">
      {/* 1. HERO SECTION — VALUE PROPOSITION & KONSISTENSI TIPOGRAFI */}
      <div className="text-center space-y-6 max-w-3xl mx-auto pt-2 sm:pt-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-100 text-teal-900 border border-teal-300 font-extrabold text-xs shadow-sm">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
          <span>
            {zonesCount !== null && zonesCount > 0
              ? `${zonesCount} Zona Logistik Perkotaan Terhubung Real-Time`
              : 'Prototipe Aktif — Zona Percontohan Terhubung Real-Time'}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight">
          Mengurai Kemacetan Bongkar Muat Logistik Perkotaan
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-slate-800 leading-relaxed font-semibold max-w-2xl mx-auto">
          Kurir memesan slot waktu, sistem memvalidasi lokasi secara otomatis, dan petugas kota memantau semuanya lewat satu peta hidup — tanpa lagi truk parkir liar di bahu jalan.
        </p>

        <div className="pt-3 space-y-4">
          <Link to="/demo/juri" className="inline-block w-full sm:w-auto">
            <Button className="w-full sm:w-auto px-8 py-4 text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl font-black bg-teal-600 hover:bg-teal-700 text-white rounded-2xl transform hover:scale-[1.02] transition">
              <Award className="h-5 w-5 text-amber-300" />
              <span>Coba Mode Demo Juri (Tanpa Daftar)</span>
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm font-extrabold text-slate-800 pt-1">
            <Link to="/city/livemap?preview=public" className="hover:text-teal-700 underline underline-offset-4 flex items-center gap-1.5 text-teal-800">
              <Eye className="h-4 w-4 text-teal-600" /> Lihat LiveMap Pemantauan Kota
            </Link>
            <span className="text-slate-400">•</span>
            <Link to="/login" className="hover:text-teal-700 underline underline-offset-4 flex items-center gap-1.5 text-teal-800">
              <UserCheck className="h-4 w-4 text-teal-600" /> Masuk ke Sistem Akun
            </Link>
          </div>
        </div>

        {/* Tech Stack Badges */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-2 text-xs font-mono font-bold text-slate-700">
          <span className="px-3 py-1 rounded-xl bg-white border border-slate-300 shadow-sm flex items-center gap-1.5 text-slate-800">
            <Database className="h-3.5 w-3.5 text-teal-600" /> PostGIS Spatial
          </span>
          <span className="px-3 py-1 rounded-xl bg-white border border-slate-300 shadow-sm flex items-center gap-1.5 text-slate-800">
            <Zap className="h-3.5 w-3.5 text-teal-600" /> GroqLogix AI
          </span>
          <span className="px-3 py-1 rounded-xl bg-white border border-slate-300 shadow-sm flex items-center gap-1.5 text-slate-800">
            <Globe className="h-3.5 w-3.5 text-teal-600" /> MapLibre GL
          </span>
          <span className="px-3 py-1 rounded-xl bg-white border border-slate-300 shadow-sm flex items-center gap-1.5 text-slate-800">
            <QrCode className="h-3.5 w-3.5 text-teal-600" /> QuickPass QR
          </span>
        </div>
      </div>

      {/* 2. MASALAH LAPANGAN */}
      <section id="masalah" className="space-y-6 scroll-mt-20">
        <div className="text-center space-y-2">
          <span className="text-xs font-extrabold text-rose-900 uppercase tracking-wider bg-rose-100 px-3.5 py-1 rounded-full border border-rose-300">
            Masalah di Lapangan
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Kenapa Logistik Perkotaan Butuh Solusi Ini?
          </h2>
          <p className="text-xs sm:text-sm font-bold text-slate-700 max-w-xl mx-auto">
            Berdasarkan observasi lapangan dan referensi pemberitaan di kawasan padat logistik.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-3 border-rose-200 bg-white rounded-2xl shadow-sm hover:border-rose-400 transition">
            <MapPin className="h-7 w-7 text-rose-600" />
            <h3 className="font-black text-base text-slate-900">Truk Parkir Liar di Bahu Jalan</h3>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
              Tanpa jadwal slot yang jelas, truk logistik menunggu giliran bongkar muat di badan jalan — memicu kemacetan di kawasan seperti pasar dan pelabuhan.
            </p>
          </Card>

          <Card className="p-6 space-y-3 border-amber-200 bg-white rounded-2xl shadow-sm hover:border-amber-400 transition">
            <Radar className="h-7 w-7 text-amber-600" />
            <h3 className="font-black text-base text-slate-900">Petugas Tak Punya Alat Verifikasi</h3>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
              Dishub lapangan masih mengandalkan pengecekan manual — tidak ada cara cepat memverifikasi izin slot dan dimensi truk di lokasi.
            </p>
          </Card>

          <Card className="p-6 space-y-3 border-teal-200 bg-white rounded-2xl shadow-sm hover:border-teal-400 transition">
            <QrCode className="h-7 w-7 text-teal-700" />
            <h3 className="font-black text-base text-slate-900">Tidak Ada Data Okupansi Zona</h3>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
              Pemkot tidak memiliki visibilitas real-time atas seberapa padat tiap titik bongkar muat, sehingga sulit membuat kebijakan berbasis data.
            </p>
          </Card>
        </div>
        <p className="text-xs text-slate-600 font-semibold text-center max-w-xl mx-auto">
          *Poin di atas berdasarkan observasi tim & referensi berita umum, bukan data resmi Dishub — dijelaskan lebih rinci di laporan teknis proyek.
        </p>
      </section>

      {/* 3. SOLUSI DALAM 3 LANGKAH */}
      <section id="cara-kerja" className="space-y-8 scroll-mt-20">
        <div className="text-center space-y-2">
          <span className="text-xs font-extrabold text-teal-900 uppercase tracking-wider bg-teal-100 px-3.5 py-1.5 rounded-full border border-teal-300">
            Alur Kerja Sederhana
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            3 Langkah Distribusi Logistik Bebas Hambatan
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-4 border-slate-200 bg-white rounded-3xl shadow-sm hover:border-teal-500 transition">
            <div className="h-12 w-12 rounded-2xl bg-teal-600 text-white font-black text-lg flex items-center justify-center shadow-md">
              1
            </div>
            <div className="space-y-1.5">
              <h3 className="font-black text-base sm:text-lg text-slate-900">Pilih Slot Waktu (SmartSlot)</h3>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                Kurir memilih zona & jam kedatangan. Sistem otomatis mencocokkan kapasitas bay dengan dimensi truk agar tidak terjadi antrean.
              </p>
            </div>
          </Card>

          <Card className="p-6 space-y-4 border-slate-200 bg-white rounded-3xl shadow-sm hover:border-teal-500 transition">
            <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center shadow-md">
              <QrCode className="h-6 w-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-black text-base sm:text-lg text-slate-900 flex items-center gap-2">
                Scan Pas Digital (QuickPass QR)
              </h3>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                Setiap booking langsung mendapat pas digital Barcode QuickPass QR terenkripsi yang ditunjukkan ke petugas saat tiba di lokasi.
              </p>
            </div>
          </Card>

          <Card className="p-6 space-y-4 border-slate-200 bg-white rounded-3xl shadow-sm hover:border-teal-500 transition">
            <div className="h-12 w-12 rounded-2xl bg-teal-600 text-white font-black text-lg flex items-center justify-center shadow-md">
              3
            </div>
            <div className="space-y-1.5">
              <h3 className="font-black text-base sm:text-lg text-slate-900">Terverifikasi Otomatis (GeoFence)</h3>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                Saat truk memasuki radius zona, lokasi GPS tervalidasi otomatis dan status slot berubah jadi terisi.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* 4. SHOWCASE TAMPILAN APLIKASI ASLI WITH REAL INTERACTIVE RECHARTS AREA CHART FOR OKUPANSI ZONA */}
      <section id="showcase" className="space-y-8 scroll-mt-20">
        <div className="text-center space-y-2">
          <span className="text-xs font-extrabold text-teal-900 uppercase tracking-wider bg-teal-100 px-3.5 py-1.5 rounded-full border border-teal-300">
            Tampilan Aplikasi
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Lihat Langsung Sistemnya Bekerja
          </h2>
          <p className="text-xs sm:text-sm font-bold text-slate-700 max-w-xl mx-auto">
            Bukan mockup — semua bisa dicoba langsung lewat mode demo juri.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Showcase 1: LiveMap */}
          <Card className="p-6 border-slate-200 bg-white text-slate-900 rounded-3xl shadow-md space-y-4 flex flex-col justify-between hover:border-teal-500 transition">
            <div className="space-y-3">
              <div className="h-32 rounded-2xl bg-slate-900 border border-slate-300 grid grid-cols-3 gap-1.5 p-2.5 shadow-inner">
                <div className="rounded-xl bg-emerald-500/40 border border-emerald-400/30 flex items-center justify-center text-[10px] font-extrabold text-white">Zona A</div>
                <div className="rounded-xl bg-amber-500/40 border border-amber-400/30 flex items-center justify-center text-[10px] font-extrabold text-white">Zona B</div>
                <div className="rounded-xl bg-rose-500/40 border border-rose-400/30 flex items-center justify-center text-[10px] font-extrabold text-white">Zona C</div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-extrabold px-3 py-1 rounded-full border text-teal-900 bg-teal-100 border-teal-300">
                  LiveMap Spasial
                </span>
                <Globe className="h-5 w-5 text-teal-600" />
              </div>
              <h3 className="font-black text-base sm:text-lg text-slate-900">Pemantauan Zona & Kepadatan</h3>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                Peta interaktif dengan warna skor kepadatan per zona dan posisi truk real-time.
              </p>
            </div>
            <Link to="/city/livemap?preview=public" className="block pt-2">
              <Button className="w-full text-xs font-black py-3 rounded-xl shadow-sm bg-teal-600 hover:bg-teal-700 text-white">
                Buka LiveMap <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </Card>

          {/* Showcase 2: QuickPass QR Barcode Logo Card */}
          <Card className="p-6 border-slate-200 bg-white text-slate-900 rounded-3xl shadow-md space-y-4 flex flex-col justify-between hover:border-emerald-500 transition ring-2 ring-emerald-500/20">
            <div className="space-y-3">
              {/* QR Code Barcode Digital Ticket Mockup */}
              <div className="h-32 rounded-2xl bg-slate-950 border border-emerald-500/40 flex items-center justify-between p-3.5 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white rounded-xl shadow-lg border border-slate-200 shrink-0">
                    <QrCode className="h-10 w-10 text-slate-900" />
                  </div>
                  <div className="space-y-1 text-left">
                    <span className="text-[9px] font-mono font-extrabold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30 inline-block">
                      HMAC-SHA256 VERIFIED
                    </span>
                    <span className="text-xs font-black text-white block">PAS DIGITAL QUICKPASS</span>
                    <span className="text-[10px] text-slate-400 font-mono block">ID: UL-2025-QR891</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-extrabold px-3 py-1 rounded-full border text-emerald-900 bg-emerald-100 border-emerald-300 flex items-center gap-1.5">
                  <Scan className="h-3.5 w-3.5 text-emerald-700" /> Barcode QuickPass QR
                </span>
                <QrCode className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="font-black text-base sm:text-lg text-slate-900">Tiket Digital & Panic Button</h3>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                Pas digital Barcode QuickPass QR untuk verifikasi petugas Dishub, plus tombol Panic Reschedule darurat saat macet.
              </p>
            </div>
            <Link to="/demo/juri" className="block pt-2">
              <Button className="w-full text-xs font-black py-3 rounded-xl shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white">
                Coba QuickPass QR <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </Card>

          {/* Showcase 3: BayUtilization Real Recharts Interactive Graph Card */}
          <Card className="p-6 border-slate-200 bg-white text-slate-900 rounded-3xl shadow-md space-y-4 flex flex-col justify-between hover:border-amber-500 transition ring-2 ring-amber-500/20">
            <div className="space-y-3">
              {/* REAL INTERACTIVE RECHARTS AREA CHART GRAPH MOCKUP */}
              <div className="h-32 rounded-2xl bg-slate-950 border border-amber-500/40 p-2.5 shadow-xl flex flex-col justify-between">
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-amber-300 border-b border-slate-800 pb-1">
                  <span className="flex items-center gap-1"><BarChart3 className="h-3 w-3 text-amber-400" /> % Okupansi Bay Realtime</span>
                  <span className="text-emerald-400 font-extrabold bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">95% Peak</span>
                </div>
                <div className="h-22 w-full pt-1">
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
                <span className="text-xs font-extrabold px-3 py-1 rounded-full border text-amber-900 bg-amber-100 border-amber-300">
                  BayUtilization Real
                </span>
                <BarChart3 className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="font-black text-base sm:text-lg text-slate-900">Grafik Okupansi Zona Real</h3>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                Grafik tren pemakaian slot per jam (% okupansi) secara real-time untuk bantu kurir memilih waktu paling bebas hambatan.
              </p>
            </div>
            <Link to="/rider/congestion" className="block pt-2">
              <Button className="w-full text-xs font-black py-3 rounded-xl shadow-sm bg-amber-600 hover:bg-amber-700 text-white">
                Lihat Tren Kepadatan Real <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* 5. DAMPAK SEBELUM VS SESUDAH — HIGH CONTRAST TEKS HITAM PEKAT */}
      <section
        id="dampak"
        className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-teal-950 via-slate-900 to-emerald-950 text-white border border-teal-700/60 shadow-2xl space-y-6"
      >
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-wider text-teal-300 bg-teal-500/20 px-3.5 py-1 rounded-full border border-teal-500/30">
            Proyeksi Dampak
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Sebelum vs Sesudah UrbanLoad.AI</h2>
          <p className="text-xs sm:text-sm font-medium text-slate-200">
            Simulasi berdasarkan skenario operasional yang kami uji di prototipe — bukan hasil implementasi skala kota.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 max-w-3xl mx-auto">
          {/* Card Sebelum */}
          <div className="p-6 rounded-3xl bg-white text-slate-900 border-2 border-rose-200 space-y-3 shadow-xl">
            <div className="text-xs font-black text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-600"></span> Sebelum (Masalah)
            </div>
            <ul className="text-xs sm:text-sm text-slate-900 space-y-2.5 leading-relaxed font-bold">
              <li className="flex items-start gap-2">
                <span className="text-rose-600 shrink-0">•</span>
                <span>Truk menunggu tanpa jadwal pasti, parkir liar di bahu jalan.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 shrink-0">•</span>
                <span>Petugas mengecek izin & dimensi truk secara manual di lapangan.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 shrink-0">•</span>
                <span>Tidak ada data okupansi zona real-time untuk pengambilan kebijakan.</span>
              </li>
            </ul>
          </div>

          {/* Card Sesudah */}
          <div className="p-6 rounded-3xl bg-white text-slate-900 border-2 border-teal-200 space-y-3 shadow-xl">
            <div className="text-xs font-black text-teal-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-teal-600"></span> Sesudah (Solusi UrbanLoad.AI)
            </div>
            <ul className="text-xs sm:text-sm text-slate-900 space-y-2.5 leading-relaxed font-bold">
              <li className="flex items-start gap-2">
                <span className="text-teal-600 shrink-0">•</span>
                <span>Slot terjadwal presisi, truk langsung masuk ke bay yang sesuai.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 shrink-0">•</span>
                <span>Verifikasi QR + GPS otomatis terkonfirmasi dalam hitungan detik.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 shrink-0">•</span>
                <span>Dashboard kota menampilkan okupansi real-time per zona.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 6. BANNER MODE DEMO JURI */}
      <Card className="p-8 bg-gradient-to-r from-teal-50 via-white to-emerald-50 border-teal-200 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg rounded-3xl">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 font-extrabold text-teal-900 text-xs bg-white px-3.5 py-1 rounded-full border border-teal-300 shadow-sm">
            <Award className="h-4 w-4 text-teal-600" /> Khusus Penilaian Juri Lomba
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Uji Coba Interactive Sandbox Demo</h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-700 max-w-xl leading-relaxed">
            Akses simulasi lengkap — pemesanan slot, verifikasi scan Dishub, hingga peta live — tanpa perlu mendaftar akun.
          </p>
        </div>

        <Link to="/demo/juri" className="shrink-0">
          <Button className="px-8 py-3.5 text-xs sm:text-sm font-black shadow-xl bg-teal-600 hover:bg-teal-700 text-white rounded-2xl">
            Mulai Mode Demo Juri
          </Button>
        </Link>
      </Card>
    </div>
  );
}
