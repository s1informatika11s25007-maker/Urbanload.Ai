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
    <div className="space-y-20 py-10 max-w-6xl mx-auto px-4">
      {/* 1. HERO SECTION */}
      <div className="text-center space-y-6 max-w-3xl mx-auto pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 font-semibold text-xs mb-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>
            {zonesCount !== null && zonesCount > 0
              ? `${zonesCount} Zona Logistik Perkotaan Aktif Real-Time`
              : 'Zona Logistik Perkotaan Aktif Real-Time'}
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight">
          UrbanLoad<span className="text-teal-600">.AI</span>
        </h1>

        <p className="text-base md:text-lg text-slate-600 leading-relaxed font-normal">
          Platform AI Spatial & Manajemen Slot Bongkar Muat Logistik Perkotaan Berbasis PostGIS Virtual GeoFence, CongestionScore Rule-Based, dan QuickPass QR HMAC-SHA256.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-2">
          <Link to="/login" className="w-full sm:w-auto">
            <Button className="px-7 py-3 text-xs sm:text-sm flex items-center justify-center gap-2 w-full shadow-md font-bold">
              <UserCheck className="h-4 w-4" /> Masuk ke Sistem
            </Button>
          </Link>

          <Link to="/rider/dashboard?demo=true" className="w-full sm:w-auto">
            <Button variant="outline" className="px-7 py-3 text-xs sm:text-sm flex items-center justify-center gap-2 w-full border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100 font-bold">
              <PlayCircle className="h-4 w-4 text-teal-600" /> Mode Demo Juri
            </Button>
          </Link>

          <Link to="/city/livemap?preview=public" className="w-full sm:w-auto">
            <Button variant="ghost" className="px-6 py-3 text-xs sm:text-sm flex items-center justify-center gap-2 w-full text-slate-600 font-semibold">
              Lihat Live Preview <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. SECTION URGENSI & MASALAH LOGISTIK KOTA */}
      <section id="masalah" className="space-y-8 scroll-mt-20">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            Urgensi Permasalahan Kota
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900">
            Mengapa Logistik Perkotaan Membutuhkan UrbanLoad.AI?
          </h2>
          <p className="text-xs text-slate-500 max-w-xl mx-auto">
            Antrean truk di bahu jalan menimbulkan kemacetan parah, kerugian ekonomi miliaran rupiah, dan risiko keselamatan lalu lintas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-3 border-rose-100 bg-rose-50/20">
            <div className="h-10 w-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Kemacetan Bahu Jalan</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Truk logistik sering parkir liar menunggu antrean bongkar muat di kawasan padat seperti Pasar Tanah Abang dan Pelabuhan.
            </p>
          </Card>

          <Card className="p-6 space-y-3 border-amber-100 bg-amber-50/20">
            <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
              <TrendingDown className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Kerugian Efisiensi BBM & Waktu</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Idle time truk logistik yang panjang mengakibatkan pemborosan BBM dan kerugian waktu pengiriman bahan pokok kota.
            </p>
          </Card>

          <Card className="p-6 space-y-3 border-blue-100 bg-blue-50/20">
            <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <FileCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Pengawasan Manual Petugas</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Petugas Dishub di lapangan tidak memiliki alat verifikasi digital otomatis untuk mengecek izin dimensi truk dan jadwal slot.
            </p>
          </Card>
        </div>
      </section>

      {/* 3. CONSOLIDATED SECTION: FITUR & CARA KERJA SISTEM */}
      <section id="modul" className="space-y-10 scroll-mt-20">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-3.5 py-1.5 rounded-full border border-teal-200">
            Arsitektur Fitur & Alur Kerja
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900">
            Modul Fitur & Cara Kerja UrbanLoad.AI
          </h2>
          <p className="text-xs text-slate-500 max-w-lg mx-auto">
            Solusi terintegrasi dari booking slot, tiket QR terenkripsi, hingga validasi geofence PostGIS real-time.
          </p>
        </div>

        {/* 3 Step Alur Kerja Visual */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-3 text-center border-slate-200 bg-slate-50/50">
            <div className="h-9 w-9 rounded-full bg-teal-600 text-white font-black text-xs flex items-center justify-center mx-auto shadow-md">
              Langkah 1
            </div>
            <h3 className="font-bold text-sm text-slate-900">Pesan SmartSlot</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Kurir memilih zona & jendela waktu. Sistem memvalidasi dimensi truk vs kapasitas zona.
            </p>
          </Card>

          <Card className="p-6 space-y-3 text-center border-slate-200 bg-slate-50/50">
            <div className="h-9 w-9 rounded-full bg-teal-600 text-white font-black text-xs flex items-center justify-center mx-auto shadow-md">
              Langkah 2
            </div>
            <h3 className="font-bold text-sm text-slate-900">Terbitkan QuickPass QR</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sistem menerbitkan tiket digital terenkripsi signature HMAC-SHA256 yang terikat pada akun kurir.
            </p>
          </Card>

          <Card className="p-6 space-y-3 text-center border-slate-200 bg-slate-50/50">
            <div className="h-9 w-9 rounded-full bg-teal-600 text-white font-black text-xs flex items-center justify-center mx-auto shadow-md">
              Langkah 3
            </div>
            <h3 className="font-bold text-sm text-slate-900">Validasi PostGIS Real-Time</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Petugas Dishub memverifikasi tiket QR & lokasi truk menggunakan RPC PostGIS <code className="text-teal-700 font-mono text-[10px]">ST_Contains</code>.
            </p>
          </Card>
        </div>

        {/* Modul Cards Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {/* Card Modul 1 */}
          <Card className="p-6 space-y-4 border-slate-200 hover:border-teal-500 transition">
            <div className="flex justify-between items-start">
              <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Truck className="h-5 w-5" />
              </div>
              <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                <Lock className="h-3 w-3" /> Wajib Login Kurir
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Modul 1: SmartSlot Booking</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Pemesanan slot jendela waktu bongkar muat dengan validasi real-time dimensi truk.
              </p>
            </div>
            <Link to="/rider/bookings/new" className="block pt-2">
              <Button variant="outline" className="w-full text-xs py-2">
                Pesan Slot Booking
              </Button>
            </Link>
          </Card>

          {/* Card Modul 1 Demo Sandbox */}
          <Card className="p-6 space-y-4 border-teal-200 bg-teal-50/20">
            <div className="flex justify-between items-start">
              <div className="h-10 w-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                <QrCode className="h-5 w-5" />
              </div>
              <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-teal-300 flex items-center gap-1">
                <Award className="h-3 w-3" /> Sandbox Juri
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Modul 1: QuickPass QR Demo</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Uji simulasi pembentukan tiket QR HMAC-SHA256 dan verifikasi scan tanpa akun riil.
              </p>
            </div>
            <Link to="/rider/dashboard?demo=true" className="block pt-2">
              <Button className="w-full text-xs py-2">
                Buka Interactive Sandbox
              </Button>
            </Link>
          </Card>

          {/* Card Modul 2 */}
          <Card className="p-6 space-y-4 border-slate-200 hover:border-teal-500 transition">
            <div className="flex justify-between items-start">
              <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Activity className="h-5 w-5" />
              </div>
              <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <Eye className="h-3 w-3" /> Publik (Read-Only)
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Modul 2: CongestionScore</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Skor kepadatan zona 1-10 berbasis rumus rule-based transparan untuk masyarakat.
              </p>
            </div>
            <Link to="/fitur/congestion" className="block pt-2">
              <Button variant="outline" className="w-full text-xs py-2">
                Lihat Penjelasan Fitur
              </Button>
            </Link>
          </Card>

          {/* Card Modul 3 */}
          <Card className="p-6 space-y-4 border-slate-200 hover:border-teal-500 transition">
            <div className="flex justify-between items-start">
              <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <MapPin className="h-5 w-5" />
              </div>
              <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                <Lock className="h-3 w-3" /> Wajib Login Admin
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Modul 3: Virtual GeoFence</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Penggambaran polygon zona PostGIS WGS84 EPSG:4326 dan pengaturan kapasitas.
              </p>
            </div>
            <Link to="/fitur/geofence" className="block pt-2">
              <Button variant="outline" className="w-full text-xs py-2">
                Lihat Penjelasan Fitur
              </Button>
            </Link>
          </Card>

          {/* Card Modul 4 */}
          <Card className="p-6 space-y-4 border-slate-200 hover:border-teal-500 transition lg:col-span-2">
            <div className="flex justify-between items-start">
              <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Layers className="h-5 w-5" />
              </div>
              <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <Eye className="h-3 w-3" /> Live Public Preview
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Modul 4: LiveMap Spatial Dashboard</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Peta interaktif kota dengan render polygon PostGIS, indikator status keterisian live, dan feed aktivitas WebSocket Supabase.
              </p>
            </div>
            <Link to="/city/livemap?preview=public" className="block pt-2">
              <Button className="w-full sm:w-auto text-xs py-2">
                Buka LiveMap Spatial (View-Only)
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* 4. BANNER MODE DEMO JURI */}
      <Card className="p-8 bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-200 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 font-extrabold text-teal-800 text-xs bg-white px-3 py-1 rounded-full border border-teal-200 shadow-sm">
            <Award className="h-4 w-4 text-teal-600" /> Khusus Penilaian Juri Lomba
          </div>
          <h2 className="text-2xl font-black text-slate-900">Uji Coba Sandbox Demo tanpa Registrasi</h2>
          <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
            Akses simulasi terisolasi untuk mereview pembuatan QuickPass QR, verifikasi scan Dishub, dan query PostGIS RPC.
          </p>
        </div>

        <Link to="/rider/dashboard?demo=true" className="shrink-0">
          <Button className="px-7 py-3 text-xs font-bold shadow-md">
            Mulai Mode Demo Juri
          </Button>
        </Link>
      </Card>
    </div>
  );
}
