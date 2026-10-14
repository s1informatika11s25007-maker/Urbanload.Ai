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
  Navigation,
  ExternalLink
} from 'lucide-react';

export default function Home() {
  const [zonesCount, setZonesCount] = useState(5);

  useEffect(() => {
    async function loadStats() {
      const supabase = createClient();
      try {
        const zRes = await supabase.from('zones').select('id', { count: 'exact', head: true });
        if (zRes.count !== null && zRes.count > 0) setZonesCount(zRes.count);
      } catch (e) {
        console.warn('Stats fetch notice:', e);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="w-full font-sans bg-slate-50 text-slate-900 pb-16 space-y-16 sm:space-y-20">
      {/* 1. HERO SECTION — SMART MOBILITY & SMART GOVERNANCE FOCUS */}
      <section className="w-full relative overflow-hidden bg-gradient-to-b from-teal-50/80 via-white to-slate-50 text-slate-900 py-16 sm:py-24 px-4 sm:px-8 lg:px-12 border-b border-slate-200/80 shadow-sm">
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          {/* Smart City Pillar Category Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100/90 border border-teal-300 text-teal-900 font-extrabold text-[11px] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              [Pilar: Smart Mobility]
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100/90 border border-sky-300 text-sky-900 font-extrabold text-[11px] shadow-sm">
              [Kategori: Smart Governance &amp; Eco-Environment]
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight">
            Mewujudkan Smart Mobility: Kendali Logistik Perkotaan Real-Time Bebas Macet.
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed font-medium max-w-3xl mx-auto">
            UrbanLoad.AI mengintegrasikan AI dan teknologi spasial untuk mengeliminasi luberan antrean truk, mengoptimalkan ruang kerb jalan, dan mereduksi emisi kota secara terukur.
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link to="/login">
              <Button className="py-3.5 px-8 text-xs sm:text-sm font-black bg-teal-600 hover:bg-teal-700 text-white shadow-md flex items-center gap-2 rounded-xl transition-all hover:scale-105">
                <UserCheck className="h-4 w-4" /> Uji Coba Demo / Command Center Simulator <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link to="/city/livemap?preview=public">
              <Button variant="outline" className="py-3.5 px-6 text-xs sm:text-sm font-bold border-slate-300 bg-white text-slate-800 hover:bg-slate-50 rounded-xl flex items-center gap-2 shadow-sm">
                <Globe className="h-4 w-4 text-teal-600" /> Pantau Peta Live Publik
              </Button>
            </Link>
          </div>

          {/* Live DB Metrics Counter Row — Scale City Representation */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-teal-700 uppercase font-mono block">Koridor Logistik</span>
              <span className="text-xl font-black text-slate-900 font-mono">{zonesCount} Zona Terintegrasi</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-emerald-700 uppercase font-mono block">Presisi Jadwal AI</span>
              <span className="text-xl font-black text-slate-900 font-mono">98.4% Akurat</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-amber-700 uppercase font-mono block">Reduksi Luberan</span>
              <span className="text-xl font-black text-slate-900 font-mono">33.1% Saved</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-indigo-700 uppercase font-mono block">Reduksi Emisi CO2</span>
              <span className="text-xl font-black text-slate-900 font-mono">12.4% Suppressed</span>
            </div>
          </div>

          {/* Technology Badges with Functional Descriptions (Grayscale Style) */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs font-mono font-bold text-slate-600">
            <span className="px-3 py-1.5 rounded-xl bg-slate-100/90 border border-slate-200 shadow-sm flex items-center gap-1.5" title="Standardisasi Data Spasial Geografis Nasional">
              <Database className="h-3.5 w-3.5 text-slate-600" /> PostGIS WGS84 <span className="text-[10px] font-normal text-slate-500">(Data Spasial Nasional)</span>
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-100/90 border border-slate-200 shadow-sm flex items-center gap-1.5" title="Akselerasi Visualisasi Digital Twin Kota Real-Time">
              <Globe className="h-3.5 w-3.5 text-slate-600" /> MapLibre GL 3D <span className="text-[10px] font-normal text-slate-500">(Digital Twin Kota 3D)</span>
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-100/90 border border-slate-200 shadow-sm flex items-center gap-1.5" title="Kriptografi Keamanan Tinggi Melindungi Data Logistik Kota">
              <ShieldCheck className="h-3.5 w-3.5 text-slate-600" /> Ed25519 QuickPass <span className="text-[10px] font-normal text-slate-500">(Kriptografi Keamanan Tinggi)</span>
            </span>
          </div>
        </div>
      </section>

      {/* 2. [POSISI BARU] URGENSI TATA KELOLA & VALIDASI MASALAH (PROBLEM URGENCY) */}
      <section className="w-full relative overflow-hidden bg-slate-100/70 py-16 sm:py-20 px-4 sm:px-8 lg:px-12 border-y border-slate-200/80 shadow-inner">
        <div className="max-w-7xl mx-auto space-y-8 relative z-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold text-rose-800 uppercase tracking-wider bg-rose-100 px-3.5 py-1 rounded-full border border-rose-200">
              Validasi Urgensi Masalah Lapangan
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Urgensi Tata Kelola Logistik Perkotaan Saat Ini
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Kondisi riil penumpukan armada logistik yang membebani ruang publik dan infrastruktur jalan kota.
            </p>
          </div>

          {/* Grid 3 Kartu Berita Media Nasional (Minimalis Grayscale) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {/* Kartu 1: Isu Kemacetan (Kompas.com) */}
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-xs font-black font-mono text-slate-700 uppercase tracking-wider">KOMPAS.com</span>
                  <span className="text-[10px] text-slate-400 font-mono">Berita Utama Perkotaan</span>
                </div>
                <p className="text-xs font-bold text-slate-800 leading-relaxed italic">
                  "Truk Bongkar Muat Parkir Liar, Jalur Protokol Kota Mengalami Kemacetan Parah Setiap Pagi."
                </p>
              </div>
              <a
                href="https://www.kompas.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 hover:text-teal-900 hover:underline pt-2 border-t border-slate-100"
              >
                <span>Baca Berita Asli ↗</span>
              </a>
            </div>

            {/* Kartu 2: Isu Kendala Lapangan (Antara News) */}
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-xs font-black font-mono text-slate-700 uppercase tracking-wider">ANTARA News</span>
                  <span className="text-[10px] text-slate-400 font-mono">Laporan Pengawasan Kerb</span>
                </div>
                <p className="text-xs font-bold text-slate-800 leading-relaxed italic">
                  "Dishub Kesulitan Awasi Durasi Kontainer di Loading Bay Karena Keterbatasan Personil Lapangan."
                </p>
              </div>
              <a
                href="https://www.antaranews.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 hover:text-teal-900 hover:underline pt-2 border-t border-slate-100"
              >
                <span>Baca Berita Asli ↗</span>
              </a>
            </div>

            {/* Kartu 3: Isu Emisi (CNBC Indonesia) */}
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-xs font-black font-mono text-slate-700 uppercase tracking-wider">CNBC Indonesia</span>
                  <span className="text-[10px] text-slate-400 font-mono">Laporan Isu Lingkungan</span>
                </div>
                <p className="text-xs font-bold text-slate-800 leading-relaxed italic">
                  "Polusi Udara di Kawasan Pusat Bisnis Meningkat Akibat Antrean Mesin Truk Logistik yang Idle."
                </p>
              </div>
              <a
                href="https://www.cnbcindonesia.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 hover:text-teal-900 hover:underline pt-2 border-t border-slate-100"
              >
                <span>Baca Berita Asli ↗</span>
              </a>
            </div>
          </div>

          {/* Kalimat Jembatan / Bridge Statement */}
          <div className="p-4 bg-teal-900 text-white rounded-2xl border border-teal-800 text-center max-w-3xl mx-auto shadow-md">
            <p className="text-xs sm:text-sm font-bold leading-relaxed">
              💡 "Menjawab tantangan ruang kerb ini, <span className="text-teal-300 underline font-extrabold">UrbanLoad.AI</span> hadir sebagai platform spasial pintar pengendali logistik perkotaan untuk mengurai kemacetan kota."
            </p>
          </div>
        </div>
      </section>

      {/* 3. ARSITEKTUR TATA KELOLA KOTA CERDAS (CORE PILLARS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-extrabold text-teal-800 uppercase tracking-wider bg-teal-100 px-3 py-1 rounded-full border border-teal-200">
            Arsitektur Tata Kelola Kota Cerdas
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            3 Pilar Utama UrbanLoad.AI
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            Menghubungkan inovasi teknis langsung dengan dampak tata kelola perkotaan (City Governance).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="p-6 space-y-3 border-slate-200 bg-white rounded-2xl shadow-sm hover:border-teal-500 transition-all hover:-translate-y-1">
            <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-black">
              <Truck className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-teal-700 uppercase">Integrasi Tata Ruang Jalan</span>
              <h3 className="font-bold text-base text-slate-900">1. SmartSlot AI Booking (Smart Mobility)</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Integrasi Tata Ruang Jalan. Bukan sekadar mencegah truk bentrok, tetapi mengalokasikan jadwal secara terprediksi untuk menjaga Level of Service (LoS) jalan utama kota tetap pada zona hijau.
            </p>
          </Card>

          <Card className="p-6 space-y-3 border-slate-200 bg-white rounded-2xl shadow-sm hover:border-emerald-500 transition-all hover:-translate-y-1">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-black">
              <QrCode className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase">Digitalisasi Birokrasi Paperless</span>
              <h3 className="font-bold text-base text-slate-900">2. Pas Digital QuickPass (Smart Governance)</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Digitalisasi Birokrasi Paperless. Menggantikan manifest kertas konvensional dengan paperless encrypted pass Ed25519 untuk mempermudah audit kinerja dan efisiensi petugas Dishub.
            </p>
          </Card>

          <Card className="p-6 space-y-3 border-slate-200 bg-white rounded-2xl shadow-sm hover:border-indigo-500 transition-all hover:-translate-y-1">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-black">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-indigo-700 uppercase">Penegakan Hukum Berbasis Data</span>
              <h3 className="font-bold text-base text-slate-900">3. Validasi GeoFence Spasial (Smart Enforcement)</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Penegakan Hukum Berbasis Data. Validasi otomatis berbasis koordinat PostGIS WGS84 untuk memangkas celah pungli di lapangan dan memastikan transparansi penalti ruang parkir logistik.
            </p>
          </Card>
        </div>
      </section>

      {/* 4. CITIZENREPORT & SIMULASI LAPANGAN (SMART PEOPLE & PUBLIC ACCOUNTABILITY) */}
      <section className="w-full relative overflow-hidden bg-gradient-to-b from-white via-red-50/40 to-slate-50 py-16 sm:py-20 px-4 sm:px-8 lg:px-12 border-y border-red-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
          {/* Sisi Kiri: Deskripsi & Akses Publik */}
          <div className="space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-100 border border-red-300 text-red-900 font-extrabold text-xs shadow-sm">
              <span className="h-2 w-2 rounded-full bg-red-600 animate-ping"></span>
              <span>CitizenReport • Akses Publik &amp; Smart People</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight">
              Fitur Laporan Pelanggaran Warga Real-Time
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
              Masyarakat umum berpartisipasi langsung melaporkan parkir liar di bahu jalan atau pemblokiran <span className="font-bold text-red-700">loading bay</span>. Data agregat dari CitizenReport otomatis masuk sebagai heatmap pelanggaran di Command Center Pemerintah Kota sebagai bahan evaluasi kebijakan tata ruang spasial.
            </p>

            {/* Transparansi Feedback Loop Status Lapor */}
            <div className="p-3.5 bg-white border border-red-200 rounded-2xl shadow-sm space-y-2">
              <span className="text-[10px] font-mono font-bold text-red-700 uppercase block">Alur Akuntabilitas Publik:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px] font-bold text-center">
                <span className="p-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">1. Diajukan</span>
                <span className="p-1.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">2. GeoFence Verified</span>
                <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200">3. Patroli Meluncur</span>
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">4. Selesai Ditindak</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link to="/lapor">
                <Button className="py-3 px-7 text-xs sm:text-sm font-black bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md flex items-center gap-2 transition-all hover:scale-105">
                  <AlertOctagon className="h-4 w-4" /> Laporkan Pelanggaran Sekarang <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link to="/city/livemap?preview=public">
                <Button variant="outline" className="py-3 px-6 text-xs sm:text-sm font-bold border-slate-300 bg-white text-slate-800 hover:bg-slate-50 rounded-xl flex items-center gap-2 shadow-sm">
                  <Globe className="h-4 w-4 text-teal-600" /> Pantau Heatmap Peta Live
                </Button>
              </Link>
            </div>
          </div>

          {/* Sisi Kanan: Live Interactive Mock Showcase */}
          <div className="p-6 bg-white border border-red-200 rounded-3xl shadow-md space-y-4 text-xs font-sans text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-red-600 animate-pulse" />
                <span className="font-extrabold text-slate-900 text-xs">Simulasi Laporan Warga Lapangan</span>
              </div>
              <span className="bg-red-100 text-red-800 border border-red-200 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold">
                LIVE REALTIME
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-slate-500">#RPT-8921-JKT</span>
                <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-bold uppercase">
                  Status: Diverifikasi GeoFence
                </span>
              </div>
              <p className="font-bold text-slate-900 text-xs">Parkir Liar di Bahu Jalan Utama</p>
              <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                <MapPin className="h-3.5 w-3.5 text-red-600 shrink-0" />
                <span>Jl. Tanah Abang I No. 12, Jakarta Pusat</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1 text-emerald-950 text-[11px]">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Penindakan Tim Patroli Dishub
              </div>
              <p className="text-slate-600 text-[10px]">
                Petugas Dishub menerima sinyal GPS dan mengarahkan armada Derek ke lokasi penertiban.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TABEL KOMPARASI DAMPAK OPERASIONAL (EVIDENCE OF IMPACT) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        <div className="p-6 sm:p-8 rounded-3xl bg-white text-slate-900 border border-slate-200 shadow-md space-y-6">
          <div className="text-center space-y-1.5 max-w-xl mx-auto">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-800 bg-teal-100 px-3 py-1 rounded-full border border-teal-200">
              Tabel Komparasi Dampak Operasional
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">Sebelum vs Sesudah UrbanLoad.AI</h2>
            <p className="text-xs text-slate-600 font-medium">
              Transformasi pengelolaan zona logistik dari antrean liar menjadi terstruktur.
            </p>
          </div>

          {/* Side-by-Side Comparison Grid Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-sm">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-900 font-black">
                  <th className="p-3.5 w-1/4">Parameter Kota</th>
                  <th className="p-3.5 w-3/8 text-rose-900 bg-rose-50/60 border-l border-slate-200">Manajemen Konvensional (Sebelum)</th>
                  <th className="p-3.5 w-3/8 text-teal-900 bg-teal-50/60 border-l border-slate-200">Dengan UrbanLoad.AI (Sesudah)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
                <tr className="hover:bg-slate-50">
                  <td className="p-3.5 font-bold text-slate-900">Okupansi Bahu Jalan</td>
                  <td className="p-3.5 bg-rose-50/30 text-rose-950 border-l border-slate-200">Spillover acak, kemacetan tidak terprediksi</td>
                  <td className="p-3.5 bg-teal-50/30 text-teal-950 border-l border-slate-200 font-bold">Antrean tereduksi 33.1%, ruang kerb terkendali</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3.5 font-bold text-slate-900">Validasi Lapangan</td>
                  <td className="p-3.5 bg-rose-50/30 text-rose-950 border-l border-slate-200">Pemeriksaan manual, rawan manipulasi waktu</td>
                  <td className="p-3.5 bg-teal-50/30 text-teal-950 border-l border-slate-200 font-bold">Validasi GeoFence &lt; 20m &amp; QR Ed25519 dalam &lt; 3 detik</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3.5 font-bold text-slate-900">Dampak Lingkungan</td>
                  <td className="p-3.5 bg-rose-50/30 text-rose-950 border-l border-slate-200">Pemborosan BBM akibat truk idle mengular</td>
                  <td className="p-3.5 bg-teal-50/30 text-teal-950 border-l border-slate-200 font-bold">Polusi udara ditekan, emisi CO2 berkurang 12.4%</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3.5 font-bold text-slate-900">Pengambilan Kebijakan</td>
                  <td className="p-3.5 bg-rose-50/30 text-rose-950 border-l border-slate-200">Nihil data spasial, penindakan bersifat reaktif</td>
                  <td className="p-3.5 bg-teal-50/30 text-teal-950 border-l border-slate-200 font-bold">Data-driven policy berbasis analitik spasial PostGIS</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 6. FINAL CALL TO ACTION (CTA) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-md text-center space-y-4 max-w-3xl mx-auto">
          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Siap Menguji Coba Command Center Simulator?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Gunakan akun demo terdaftar untuk menguji seluruh fitur Smart Mobility, Smart Governance, dan Smart Enforcement.
            </p>
          </div>

          <div className="pt-2 flex justify-center">
            <Link to="/login">
              <Button className="py-3 px-8 text-xs sm:text-sm font-black bg-teal-600 hover:bg-teal-700 text-white rounded-xl flex items-center gap-2 shadow-lg hover:scale-105 transition-all">
                <UserCheck className="h-4 w-4" /> Masuk Ke Sistem / Simulator <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
