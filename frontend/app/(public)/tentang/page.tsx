'use client';

import { Card } from '@/components/ui/card';
import { Truck, ShieldCheck, Award, Users, GraduationCap } from 'lucide-react';
import { useState } from 'react';

export default function TentangPage() {
  const [glenSrc, setGlenSrc] = useState('/assets/glen.jpeg');
  const [tianSrc, setTianSrc] = useState('/assets/tian.jpeg');

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

  return (
    <div className="max-w-4xl mx-auto py-12 space-y-10 px-4">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold">
          <Users className="h-4 w-4 text-teal-600" /> Tim Pengembang
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900">
          Tim Pengembang UrbanLoad.AI
        </h1>
        <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
          Inovasi Sistem Manajemen Logistik Perkotaan Berbasis PostGIS, Next.js 14, dan Supabase Realtime.
        </p>
      </div>

      {/* Grid Tim Pengembang */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
        {/* Glen Rejeki Sitorus */}
        <Card className="p-6 border-slate-200 shadow-md bg-white hover:shadow-lg transition duration-200 text-center space-y-4">
          <div className="relative h-32 w-32 rounded-full overflow-hidden bg-slate-100 mx-auto border-4 border-teal-500 shadow-md flex items-center justify-center text-teal-700 font-black text-3xl">
            <img
              src={glenSrc}
              alt="Glen Rejeki Sitorus"
              onError={handleGlenError}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-black text-slate-900">
              Glen Rejeki Sitorus
            </h2>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              <GraduationCap className="h-3.5 w-3.5 text-teal-600" /> S1 Informatika 2023
            </div>
          </div>
        </Card>

        {/* Christian Johannes Hutahaean */}
        <Card className="p-6 border-slate-200 shadow-md bg-white hover:shadow-lg transition duration-200 text-center space-y-4">
          <div className="relative h-32 w-32 rounded-full overflow-hidden bg-slate-100 mx-auto border-4 border-teal-500 shadow-md flex items-center justify-center text-teal-700 font-black text-3xl">
            <img
              src={tianSrc}
              alt="Christian Johannes Hutahaean"
              onError={handleTianError}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-black text-slate-900">
              Christian Johannes Hutahaean
            </h2>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              <GraduationCap className="h-3.5 w-3.5 text-teal-600" /> S1 Informatika 2023
            </div>
          </div>
        </Card>
      </div>

      {/* Visi & Misi Platform */}
      <Card className="p-8 space-y-4 border-slate-200 shadow-sm bg-white">
        <h2 className="text-lg font-black text-slate-900 border-b pb-2">Visi Platform UrbanLoad.AI</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          UrbanLoad.AI dirancang untuk mengatasi permasalahan kronis kemacetan lalu lintas perkotaan yang disebabkan oleh antrean truk bongkar muat di bahu jalan. Dengan memanfaatkan PostGIS Spatial Geofence, algoritma rule-based CongestionScore, dan tiket QuickPass QR HMAC-SHA256, UrbanLoad.AI menciptakan ekosistem logistik pintar yang efisien, transparan, dan teratur.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          <div className="p-4 bg-slate-50 rounded-xl text-center space-y-1 border border-slate-200">
            <Truck className="h-5 w-5 text-teal-600 mx-auto" />
            <div className="font-bold text-xs text-slate-900">Efisiensi Slot</div>
            <div className="text-[11px] text-slate-500">Mencegah kemacetan bahu jalan</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl text-center space-y-1 border border-slate-200">
            <ShieldCheck className="h-5 w-5 text-teal-600 mx-auto" />
            <div className="font-bold text-xs text-slate-900">Keamanan QR</div>
            <div className="text-[11px] text-slate-500">HMAC-SHA256 Signature</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl text-center space-y-1 border border-slate-200">
            <Award className="h-5 w-5 text-teal-600 mx-auto" />
            <div className="font-bold text-xs text-slate-900">Smart City</div>
            <div className="text-[11px] text-slate-500">PostGIS Spatial Engine</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
