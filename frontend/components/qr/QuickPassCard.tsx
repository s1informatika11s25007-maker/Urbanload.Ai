'use client';

import { QRCodeSVG } from 'qrcode.react';
import { Card } from '../ui/card';
import { useEffect, useState } from 'react';

export function QuickPassCard({ bookingId = 'UL-2025-091823', zone = 'Zona A - Pasar Tanah Abang' }: any) {
  const [timeLeft, setTimeLeft] = useState(1799); // 30 mins

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="max-w-[420px] mx-auto p-6 text-center shadow-xl border-slate-200 rounded-2xl bg-white">
      <div className="flex justify-between items-center mb-4 border-b pb-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">QuickPass Digital Ticket</span>
        <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
          CONFIRMED
        </span>
      </div>

      {/* Hero QR Container */}
      <div className="my-4 flex justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100 relative">
        <QRCodeSVG value={`https://urbanload.ai/verify?booking=${bookingId}&sig=hmac256_sig`} size={280} />
      </div>

      <div className="space-y-1.5 text-slate-800">
        <div className="text-xs font-mono text-slate-500">Booking ID: <strong className="text-slate-900">{bookingId}</strong></div>
        <div className="text-sm font-bold text-teal-800">{zone}</div>
        <div className="text-xs font-medium text-slate-600">Waktu: 14:00 – 15:00 WIB · No. Truk: B 1234 XYZ</div>
      </div>

      {/* Countdown Timer & Pulse */}
      <div className="mt-5 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-amber-900 text-xs">
        <span>Berlaku hingga slot berakhir:</span>
        <span className="font-mono font-bold text-sm text-amber-700 animate-pulse">{formatTimer(timeLeft)}</span>
      </div>
    </Card>
  );
}
