import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { createClient } from '../lib/supabase/client.js';
import { Activity, Eye, ArrowRight, ShieldCheck } from 'lucide-react';

export default function FeatureCongestion() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setIsLoggedIn(true);
    }
    checkAuth();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-12 space-y-8 px-4">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold">
          <Activity className="h-4 w-4 text-teal-600" /> Modul 2 — CongestionScore Real-Time
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900">
          CongestionScore Real-Time
        </h1>
        <p className="text-xs md:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Skor kepadatan zona 1–10 berbasis GroqLogix AI dan algoritma rule-based transparan yang terhubung ke database PostGIS Supabase.
        </p>
      </div>

      <Card className="p-8 space-y-6 border-slate-200 shadow-md rounded-3xl bg-white">
        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3 text-xs">
          <div className="font-bold text-emerald-900 text-sm flex items-center gap-2">
            {isLoggedIn ? <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" /> : <Eye className="h-5 w-5 text-emerald-600 shrink-0" />}
            <span>{isLoggedIn ? 'Sesi Akun Aktif Terhubung' : 'Informasi Publik (Tanpa Login)'}</span>
          </div>
          <p className="text-emerald-800 leading-relaxed">
            {isLoggedIn
              ? 'Akun Anda aktif. Anda dapat langsung memantau peta kepadatan zona spasial dan status slot booking secara real-time.'
              : 'Masyarakat dan pengemudi truk dapat memantau tingkat kepadatan zona secara publik untuk memilih waktu operasional paling efisien.'}
          </p>
          <div className="pt-2">
            <Link to={isLoggedIn ? '/city/livemap' : '/city/livemap?preview=public'}>
              <Button className="text-xs py-2 px-5 flex items-center gap-1.5 font-bold shadow-md bg-teal-600 hover:bg-teal-700">
                {isLoggedIn ? 'Buka LiveMap Skor Kepadatan Realtime' : 'Lihat Skor Kepadatan Publik'} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
