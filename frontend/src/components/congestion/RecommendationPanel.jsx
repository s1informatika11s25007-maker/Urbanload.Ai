import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/card.jsx';
import { Button } from '../ui/button.jsx';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { fetchCongestionScores } from '../../lib/api/congestion.js';

export function RecommendationPanel() {
  const [highZone, setHighZone] = useState(null);
  const [lowZone, setLowZone] = useState(null);

  useEffect(() => {
    fetchCongestionScores()
      .then((res) => {
        if (res.success && res.data && Array.isArray(res.data) && res.data.length > 0) {
          const sorted = [...res.data].sort((a, b) => b.score - a.score);
          setHighZone(sorted[0]);
          setLowZone(sorted[sorted.length - 1]);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <Card className="p-6 border-amber-200 bg-amber-50/20 space-y-4 rounded-2xl">
      <h3 className="text-base font-bold text-slate-800">Rekomendasi Sistem AI Kepadatan Zona</h3>
      <div className="space-y-3">
        {highZone ? (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-amber-200 text-xs text-slate-800 shadow-sm">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Analisis Kepadatan:</strong> {highZone.zoneName || 'Zona Utama'} berada pada tingkat kepadatan {highZone.score}/10.
              {lowZone && (
                <span> Pertimbangkan beralih ke <strong>{lowZone.zoneName} (skor {lowZone.score}/10)</strong> yang lebih lengang.</span>
              )}
              <div className="mt-2.5">
                <Link to="/rider/bookings/new">
                  <Button className="text-xs py-1 px-3 font-bold">Pesan Slot alternatif</Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-emerald-200 text-xs text-slate-800 shadow-sm">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong>Kondisi Normal:</strong> Seluruh zona logistik berada pada tingkat kepadatan optimal.
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
