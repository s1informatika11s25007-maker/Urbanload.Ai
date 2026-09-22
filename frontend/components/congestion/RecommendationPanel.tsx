'use client';

import Link from 'next/link';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export function RecommendationPanel() {
  return (
    <Card className="p-6 border-amber-200 bg-amber-50/20 space-y-4">
      <h3 className="text-base font-bold text-slate-800">Section 3 — Rekomendasi Sistem (Rule-Based)</h3>

      <div className="space-y-3">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-amber-200 text-xs text-slate-800">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Peringatan Dini:</strong> Zona A mendekati penuh (skor 10/10). Pertimbangkan <strong>Zona B (skor 4)</strong> yang berjarak +400m untuk menghindari antrean.
            <div className="mt-2">
              <Link href="/rider/bookings/new?zone=B">
                <Button className="text-xs py-1 px-3">Pesan Slot di Zona B</Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-emerald-200 text-xs text-slate-800">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <strong>Rekomendasi Waktu Ideal:</strong> Zona C (Tg. Priok) sangat lega sepanjang hari. Waktu operasional optimal: <strong>14:00 – 16:00 WIB</strong>.
          </div>
        </div>
      </div>
    </Card>
  );
}
