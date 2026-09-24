import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button.jsx';
import { Card } from '../components/ui/card.jsx';
import { createClient } from '../lib/supabase/client.js';
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
  CheckCircle2,
} from 'lucide-react';

export default function Home() {
  const [zonesCount, setZonesCount] = useState(null);

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
    <div className="space-y-16 sm:space-y-24 py-6 sm:py-10 max-w-6xl mx-auto px-4">
      {/* 1. HERO — VALUE PROPOSITION & HIGH CONTRAST TYPOGRAPHY */}
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
          <Link to="/rider/dashboard?demo=true" className="inline-block w-full sm:w-auto">
            <Button className="w-full sm:w-auto px-8 py-4 text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl font-black bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-2xl transform hover:scale-[1.02] transition">
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
            <ShieldCheck className="h-3.5 w-3.5 text-teal-600" /> Tiket Terenkripsi
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
          <Card className="p-6 space-y-3 border-rose-200 bg-rose-50/50 rounded-2xl shadow-sm hover:border-rose-300 transition">
            <MapPin className="h-7 w-7 text-rose-600" />
            <h3 className="font-black text-base text-slate-900">Truk Parkir Liar di Bahu Jalan</h3>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
              Tanpa jadwal slot yang jelas, truk logistik menunggu giliran bongkar muat di badan jalan — memicu kemacetan di kawasan seperti pasar dan pelabuhan.
            </p>
          </Card>

          <Card className="p-6 space-y-3 border-amber-200 bg-amber-50/50 rounded-2xl shadow-sm hover:border-amber-300 transition">
            <Radar className="h-7 w-7 text-amber-600" />
            <h3 className="font-black text-base text-slate-900">Petugas Tak Punya Alat Verifikasi</h3>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
              Dishub lapangan masih mengandalkan pengecekan manual — tidak ada cara cepat memverifikasi izin slot dan dimensi truk di lokasi.
            </p>
          </Card>

          <Card className="p-6 space-y-3 border-teal-200 bg-teal-50/50 rounded-2xl shadow-sm hover:border-teal-300 transition">
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
          {[
            {
              n: 1,
              title: 'Pilih Slot Waktu (SmartSlot)',
              desc: 'Kurir memilih zona & jam kedatangan. Sistem otomatis mencocokkan kapasitas bay dengan dimensi truk agar tidak terjadi antrean.',
            },
            {
              n: 2,
              title: 'Scan Pas Digital (QuickPass QR)',
              desc: 'Setiap booking langsung mendapat tiket QR anti-pemalsuan yang ditunjukkan ke petugas saat tiba di lokasi.',
            },
            {
              n: 3,
              title: 'Terverifikasi Otomatis (GeoFence)',
              desc: 'Saat truk memasuki radius zona, lokasi GPS tervalidasi otomatis dan status slot berubah jadi terisi.',
            },
          ].map((s) => (
            <Card
              key={s.n}
              className="p-6 space-y-4 border-slate-200 bg-white rounded-3xl shadow-sm hover:border-teal-500 transition"
            >
              <div className="h-12 w-12 rounded-2xl bg-teal-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                {s.n}
              </div>
              <div className="space-y-1.5">
                <h3 className="font-black text-base sm:text-lg text-slate-900">{s.title}</h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">{s.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 4. SHOWCASE TAMPILAN APLIKASI ASLI */}
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
          {[
            {
              tag: 'LiveMap Spasial',
              tagColor: 'text-teal-300 bg-teal-500/30 border-teal-400',
              title: 'Pemantauan Zona & Kepadatan',
              desc: 'Peta interaktif dengan warna skor kepadatan per zona dan posisi truk real-time.',
              icon: <Globe className="h-4 w-4 text-teal-400" />,
              href: '/city/livemap?preview=public',
              btn: 'Buka LiveMap',
              btnColor: 'bg-teal-600 hover:bg-teal-500 text-white',
              mockup: (
                <div className="h-32 rounded-2xl bg-gradient-to-br from-slate-950 to-teal-950 border border-slate-700 grid grid-cols-3 gap-1.5 p-2.5 shadow-inner">
                  <div className="rounded-xl bg-emerald-500/40 border border-emerald-400/30 flex items-center justify-center text-[10px] font-bold text-emerald-200">Zona A</div>
                  <div className="rounded-xl bg-amber-500/40 border border-amber-400/30 flex items-center justify-center text-[10px] font-bold text-amber-200">Zona B</div>
                  <div className="rounded-xl bg-rose-500/40 border border-rose-400/30 flex items-center justify-center text-[10px] font-bold text-rose-200">Zona C</div>
                </div>
              ),
            },
            {
              tag: 'QuickPass QR',
              tagColor: 'text-emerald-300 bg-emerald-500/30 border-emerald-400',
              title: 'Tiket Digital & Panic Button',
              desc: 'Tiket QR untuk petugas Dishub, plus tombol reschedule darurat saat macet.',
              icon: <ShieldCheck className="h-4 w-4 text-emerald-400" />,
              href: '/rider/dashboard?demo=true',
              btn: 'Coba QuickPass',
              btnColor: 'bg-emerald-600 hover:bg-emerald-500 text-white',
              mockup: (
                <div className="h-32 rounded-2xl bg-slate-950 border border-slate-700 flex items-center justify-center p-2 shadow-inner">
                  <div className="h-22 w-22 rounded-xl bg-white grid grid-cols-4 grid-rows-4 gap-0.5 p-2 shadow-lg">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div key={i} className={i % 3 === 0 ? 'bg-slate-900 rounded-sm' : 'bg-white'} />
                    ))}
                  </div>
                </div>
              ),
            },
            {
              tag: 'BayUtilization',
              tagColor: 'text-amber-300 bg-amber-500/30 border-amber-400',
              title: 'Grafik Okupansi Zona',
              desc: 'Tren pemakaian slot per jam untuk bantu kurir pilih waktu paling lengang.',
              icon: <BarChart3 className="h-4 w-4 text-amber-400" />,
              href: '/rider/congestion',
              btn: 'Lihat Tren',
              btnColor: 'bg-amber-600 hover:bg-amber-500 text-white',
              mockup: (
                <div className="h-32 rounded-2xl bg-slate-950 border border-slate-700 flex items-end gap-2 p-3 shadow-inner">
                  {[40, 65, 30, 85, 55, 95, 45].map((h, i) => (
                    <div key={i} className="flex-1 bg-amber-500/80 rounded-t-lg shadow" style={{ height: `${h}%` }} />
                  ))}
                </div>
              ),
            },
          ].map((c) => (
            <Card
              key={c.tag}
              className="p-6 border-slate-800 bg-slate-900 text-white rounded-3xl shadow-xl space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                {c.mockup}
                <div className="flex items-center justify-between pt-1">
                  <span className={`text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full border ${c.tagColor}`}>
                    {c.tag}
                  </span>
                  {c.icon}
                </div>
                <h3 className="font-black text-base text-white">{c.title}</h3>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">{c.desc}</p>
              </div>
              <Link to={c.href} className="block pt-2">
                <Button className={`w-full text-xs font-black py-2.5 ${c.btnColor}`}>
                  {c.btn} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* 5. DAMPAK SEBELUM VS SESUDAH — HIGH CONTRAST TEXT */}
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

      {/* 6. KREDIBILITAS TIM */}
      <section id="tim" className="space-y-6 scroll-mt-20 text-center">
        <span className="text-xs font-black text-slate-800 uppercase tracking-wider bg-slate-200 px-3.5 py-1.5 rounded-full border border-slate-300">
          Di Balik UrbanLoad.AI
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Tim Pengembang</h2>
        <p className="text-xs sm:text-sm font-bold text-slate-700 max-w-lg mx-auto">
          Mahasiswa Informatika yang membangun sistem ini dari nol untuk ICONFEST 2026 — kode sumber terbuka untuk ditinjau juri.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link to="/tentang">
            <Button className="px-5 py-2.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex items-center gap-2">
              <UserCheck className="h-3.5 w-3.5" /> Lihat Profil Tim
            </Button>
          </Link>
          <a href="https://github.com" target="_blank" rel="noreferrer">
            <Button className="px-5 py-2.5 text-xs font-bold bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl flex items-center gap-2 shadow-sm">
              <Github className="h-3.5 w-3.5" /> Repository Kode Sumber
            </Button>
          </a>
        </div>
      </section>

      {/* 7. BANNER MODE DEMO JURI */}
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

        <Link to="/rider/dashboard?demo=true" className="shrink-0">
          <Button className="px-8 py-3.5 text-xs sm:text-sm font-black shadow-xl bg-teal-600 hover:bg-teal-700 text-white rounded-2xl">
            Mulai Mode Demo Juri
          </Button>
        </Link>
      </Card>
    </div>
  );
}
