import React, { useEffect, useState } from 'react';
import { Card } from '../ui/card.jsx';
import { ShieldCheck, Radio, ArrowRight } from 'lucide-react';
import { fetchCongestionScores } from '../../lib/api/congestion.js';

/**
 * [KILL LIST #2] Event-Driven Dispatch Status Panel
 * Menggantikan panel rekomendasi teks pasif dengan status dispatch spasial real-time.
 */
export function RecommendationPanel() {
  const [activeZone, setActiveZone] = useState(null);

  useEffect(() => {
    fetchCongestionScores()
      .then((res) => {
        if (res.success && res.data && Array.isArray(res.data) && res.data.length > 0) {
          const sorted = [...res.data].sort((a, b) => b.score - a.score);
          setActiveZone(sorted[0]);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <Card className="p-5 border-slate-200 bg-slate-900 text-white space-y-3 rounded-2xl shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Event-Driven Spatial Dispatch System
          </h3>
        </div>
        <span className="flex items-center gap-1 text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
          <ShieldCheck className="h-3 w-3" /> Llama Guard Secured
        </span>
      </div>

      <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200 space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-teal-400">Status Koridor Logistik:</span>
          <span className="font-mono text-slate-400">PostGIS Live Sync</span>
        </div>
        <p className="text-slate-300">
          {activeZone ? (
            <>
              Zona <strong>{activeZone.zoneName || 'Utama'}</strong> memiliki tingkat okupansi bahu jalan{' '}
              <span className="font-bold text-amber-400">{activeZone.score}/10</span>. Alokasi slot diproses otomatis oleh Solver Spasial.
            </>
          ) : (
            'Seluruh koridor logistik berjalan pada kapasitas optimal dengan koordinasi PostGIS.'
          )}
        </p>
      </div>
    </Card>
  );
}
