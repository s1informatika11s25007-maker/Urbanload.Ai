'use client';

import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { CheckCircle2 } from 'lucide-react';

export function BookingSummary({ bookingData, onConfirm, onCancel }: any) {
  const [agreed, setAgreed] = useState(false);

  return (
    <Card className="p-6 border-teal-200 bg-teal-50/30">
      <h3 className="text-base font-bold text-slate-800 mb-2">Section 3 — Ringkasan & Konfirmasi</h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-4 p-4 rounded-xl bg-white border border-teal-100 text-xs">
        <div>
          <span className="text-slate-500 block">Zona Logistik</span>
          <span className="font-semibold text-slate-900">Zona A - Pasar Tanah Abang</span>
        </div>
        <div>
          <span className="text-slate-500 block">Waktu Booking</span>
          <span className="font-semibold text-slate-900">14:00 – 15:00 WIB</span>
        </div>
        <div>
          <span className="text-slate-500 block">Dimensi Truk</span>
          <span className="font-semibold text-slate-900 font-mono">8m x 2.2m x 3.2m</span>
        </div>
        <div>
          <span className="text-slate-500 block">Status Validasi</span>
          <span className="font-bold text-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> VALID & SESUAI
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          id="terms"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="rounded border-slate-300 text-teal-600 focus:ring-teal-600"
        />
        <label htmlFor="terms" className="text-xs text-slate-700">
          Saya menyetujui kebijakan pembatalan dan ketentuan operasional zona.
        </label>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button variant="secondary" onClick={onCancel}>
          Batal
        </Button>
        <Button onClick={onConfirm} disabled={!agreed}>
          Konfirmasi Booking (POST /api/v1/bookings)
        </Button>
      </div>
    </Card>
  );
}
