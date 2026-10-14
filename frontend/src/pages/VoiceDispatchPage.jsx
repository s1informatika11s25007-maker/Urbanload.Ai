import React, { Suspense, lazy } from 'react';
import { Radio, Mic, Siren, ShieldCheck } from 'lucide-react';

const VoiceDispatchConsole = lazy(() => import('../components/dispatch/VoiceDispatchConsole.jsx').then(m => ({ default: m.VoiceDispatchConsole })));

export default function VoiceDispatchPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      {/* Banner Modul Operasional */}
      <div className="p-3.5 rounded-2xl bg-teal-950 text-teal-200 border border-teal-800 flex items-center justify-between text-xs shadow-md">
        <div className="flex items-center gap-2 font-bold">
          <Radio className="h-4 w-4 text-teal-400 animate-pulse shrink-0" />
          <span>Sistem Otomasi Dispatch Suara Operasional & Jalur Darurat Perkotaan</span>
        </div>
        <span className="bg-teal-800/80 px-2.5 py-0.5 rounded-full text-[10px] font-mono text-teal-200 font-bold uppercase tracking-wider border border-teal-600 flex items-center gap-1">
          <ShieldCheck className="h-3 w-3 text-emerald-400" /> Terkoneksi Realtime
        </span>
      </div>

      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
        <div>
          <div className="text-xs text-slate-500 mb-1">Fitur Operasional / Dispatch Suara</div>
          <h1 className="text-2xl font-black text-slate-900">Voice-Driven Hands-Free Dispatch & Siren Preemption</h1>
          <p className="text-xs text-slate-500 mt-1">
            Sistem perintah suara dua arah hands-free untuk pengemudi truk saat menyetir dan pengosongan jalur sirene darurat Dishub.
          </p>
        </div>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Memuat Console Perintah Suara...</div>}>
        <VoiceDispatchConsole />
      </Suspense>

      {/* Info Tambahan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-teal-700 font-bold text-xs">
            <Mic className="h-4 w-4" /> Perintah Suara Hands-Free Kabin Truk
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Pengemudi tidak perlu menatap layar saat menyetir. Cukup katakan *"UrbanLoad, saya macet 20 menit di Palmerah, geser slot saya ke Bay 3"*. Sistem mentranskripsi perintah suara secara otomatis dan menyesuaikan slot di lokasi PostGIS.
          </p>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
            <Siren className="h-4 w-4" /> Siren Emergency Preemption
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Ketika sensor akustik kota / radio Dishub mendeteksi sirine Ambulans atau Pemadam Kebakaran, sistem secara otomatis mengosongkan seluruh bay bahu jalan di lokasi PostGIS.
          </p>
        </div>
      </div>
    </div>
  );
}
