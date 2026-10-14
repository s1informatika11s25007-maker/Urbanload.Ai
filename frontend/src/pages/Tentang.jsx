import React, { useState } from 'react';
import { Card } from '../components/ui/card.jsx';
import { Truck, ShieldCheck, Award, Users, GraduationCap, Code2, Lock } from 'lucide-react';

export default function Tentang() {
  const [glenSrc, setGlenSrc] = useState('/assets/glen.jpeg');
  const [tianSrc, setTianSrc] = useState('/assets/tian.jpeg');
  const [mikeSrc, setMikeSrc] = useState('/assets/michael.jpeg');

  const handleGlenError = () => {
    if (glenSrc === '/assets/glen.jpeg') setGlenSrc('/glen.jpeg');
    else if (glenSrc === '/glen.jpeg') setGlenSrc('/assets/glen.jpg');
    else if (glenSrc === '/assets/glen.jpg') setGlenSrc('/assets/glen.png');
    else if (glenSrc === '/assets/glen.png') setGlenSrc('/assets/glen.svg');
  };

  const handleTianError = () => {
    if (tianSrc === '/assets/tian.jpeg') setTianSrc('/tian.jpeg');
    else if (tianSrc === '/tian.jpeg') setTianSrc('/assets/tian.jpg');
    else if (tianSrc === '/assets/tian.jpg') setTianSrc('/assets/tian.png');
    else if (tianSrc === '/assets/tian.png') setTianSrc('/assets/tian.svg');
  };

  const handleMikeError = () => {
    if (mikeSrc === '/assets/michael.jpeg') setMikeSrc('/michael.jpeg');
    else if (mikeSrc === '/michael.jpeg') setMikeSrc('/assets/michael.jpg');
    else if (mikeSrc === '/assets/michael.jpg') setMikeSrc('/assets/michael.png');
    else if (mikeSrc === '/assets/michael.png') setMikeSrc('/assets/michael.svg');
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-12 space-y-12 px-4 sm:px-8 lg:px-12 font-sans bg-slate-50 text-slate-900">
      {/* 1. HEADER & VISI TIM (DILETAKKAN DI ATAS) */}
      <section className="text-center space-y-4 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-100 text-teal-900 border border-teal-300 text-xs font-black shadow-sm">
          <Users className="h-4 w-4 text-teal-700" /> Tim Pengembang UrbanLoad.AI
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
          Visi &amp; Inovasi Pengembang
        </h1>

        <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-medium bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-justify sm:text-center">
          "UrbanLoad.AI dirancang oleh tim interdisipliner untuk mengatasi permasalahan kronis kemacetan lalu lintas perkotaan akibat antrean truk bongkar muat di bahu jalan. Kami menggabungkan kekuatan PostGIS Spatial Geofence, algoritma cerdas CongestionScore, dan arsitektur WebSockets Realtime untuk membangun ekosistem logistik kota yang efisien, transparan, dan teratur."
        </p>
      </section>

      {/* 2. PEMBAGIAN PERAN ANGGOTA TIM (CORE TEAM & ROLES) */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-extrabold text-teal-800 uppercase tracking-wider bg-teal-100 px-3 py-1 rounded-full border border-teal-200">
            Struktur Tim Pengembang
          </span>
          <h2 className="text-2xl font-black text-slate-900">Core Team &amp; Roles</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Anggota 1: Glen Rejeki Sitorus */}
          <Card className="p-6 border-slate-200 shadow-sm bg-white hover:shadow-md transition-all duration-200 space-y-4 flex flex-col justify-between">
            <div className="space-y-4 text-center">
              <div className="relative h-28 w-28 rounded-full overflow-hidden bg-slate-100 mx-auto border-4 border-teal-500 shadow-md flex items-center justify-center text-teal-700 font-black text-3xl">
                <img
                  src={glenSrc}
                  alt="Glen Rejeki Sitorus"
                  onError={handleGlenError}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-black text-slate-900">
                  Glen Rejeki Sitorus
                </h3>
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                  <GraduationCap className="h-3.5 w-3.5 text-teal-600" /> S1 Informatika 2023
                </div>
                <div className="text-xs font-mono font-bold text-teal-700 pt-1 block">
                  Project Manager &amp; GIS Spatial Engineer
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-600 leading-relaxed font-medium">
              <span className="font-bold text-slate-800 block mb-0.5">Fokus Kerja:</span>
              Bertanggung jawab atas pemodelan spasial PostGIS WGS84, perancangan arsitektur GeoFence, dan integrasi basis data spasial perkotaan.
            </div>
          </Card>

          {/* Anggota 2: Christian Johannes Hutahaean */}
          <Card className="p-6 border-slate-200 shadow-sm bg-white hover:shadow-md transition-all duration-200 space-y-4 flex flex-col justify-between">
            <div className="space-y-4 text-center">
              <div className="relative h-28 w-28 rounded-full overflow-hidden bg-slate-100 mx-auto border-4 border-teal-500 shadow-md flex items-center justify-center text-teal-700 font-black text-3xl">
                <img
                  src={tianSrc}
                  alt="Christian Johannes Hutahaean"
                  onError={handleTianError}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-black text-slate-900">
                  Christian Johannes Hutahaean
                </h3>
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                  <GraduationCap className="h-3.5 w-3.5 text-teal-600" /> S1 Informatika 2023
                </div>
                <div className="text-xs font-mono font-bold text-teal-700 pt-1 block">
                  Backend &amp; Security Architect
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-600 leading-relaxed font-medium">
              <span className="font-bold text-slate-800 block mb-0.5">Fokus Kerja:</span>
              Membangun GroqLogix Engine, mengamankan tiket QuickPass QR menggunakan kriptografi Ed25519/HMAC-SHA256, serta menangani komunikasi data WebSockets Realtime.
            </div>
          </Card>

          {/* Anggota 3: Michael Handreak Siburian */}
          <Card className="p-6 border-slate-200 shadow-sm bg-white hover:shadow-md transition-all duration-200 space-y-4 flex flex-col justify-between">
            <div className="space-y-4 text-center">
              <div className="relative h-28 w-28 rounded-full overflow-hidden bg-slate-100 mx-auto border-4 border-teal-500 shadow-md flex items-center justify-center text-teal-700 font-black text-3xl">
                <img
                  src={mikeSrc}
                  alt="Michael Handreak Siburian"
                  onError={handleMikeError}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-black text-slate-900">
                  Michael Handreak Siburian
                </h3>
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                  <GraduationCap className="h-3.5 w-3.5 text-teal-600" /> S1 Informatika 2025
                </div>
                <div className="text-xs font-mono font-bold text-teal-700 pt-1 block">
                  Frontend &amp; UI/UX Engineer
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-600 leading-relaxed font-medium">
              <span className="font-bold text-slate-800 block mb-0.5">Fokus Kerja:</span>
              Implementasi antarmuka landing page, pengembangan dashboard command center berbasis React, dan visualisasi peta digital twin 3D menggunakan MapLibre GL.
            </div>
          </Card>
        </div>
      </section>

      {/* 3. PILAR KOMPETENSI TEKNOLOGI TIM */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-extrabold text-teal-800 uppercase tracking-wider bg-teal-100 px-3 py-1 rounded-full border border-teal-200">
            Kapabilitas Teknikal
          </span>
          <h2 className="text-2xl font-black text-slate-900">Pilar Kompetensi Teknologi Tim</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="p-6 space-y-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-teal-500 transition-all">
            <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-black">
              <Truck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">
              Smart City &amp; GIS Spasial
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Implementasi PostGIS Spatial Engine untuk pemetaan zona logistik kota secara presisi secara real-time.
            </p>
          </Card>

          <Card className="p-6 space-y-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-teal-500 transition-all">
            <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-black">
              <Code2 className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">
              Efisiensi &amp; Real-Time
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Pemanfaatan React &amp; WebSockets guna menjamin pasokan data instan dari laporan warga ke petugas lapangan tanpa jeda.
            </p>
          </Card>

          <Card className="p-6 space-y-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-teal-500 transition-all">
            <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-black">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">
              Kriptografi &amp; Keamanan
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Pengamanan validasi ruang kerb melalui tanda tangan digital HMAC-SHA256 dan tiket Ed25519 QuickPass demi mencegah pemalsuan.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
