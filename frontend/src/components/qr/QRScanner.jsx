import React, { useState } from 'react';
import { Card } from '../ui/card.jsx';
import { Button } from '../ui/button.jsx';
import { QrCode, Search, ShieldCheck } from 'lucide-react';

export function QRScanner({ onScan }) {
  const [manualId, setManualId] = useState('');

  const handleVerify = (e) => {
    e.preventDefault();
    if (!manualId.trim()) return;
    if (onScan) onScan(manualId.trim());
  };

  return (
    <Card className="p-6 border-slate-300 bg-slate-50 rounded-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <QrCode className="h-4 w-4 text-teal-600" /> Scanner QR QuickPass & Verifikasi Tiket Digital
        </h4>
        <span className="text-[10px] font-mono font-bold bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full border border-teal-200 flex items-center gap-1">
          <ShieldCheck className="h-3 w-3 text-teal-600" /> HMAC-SHA256
        </span>
      </div>

      <div className="h-44 bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-teal-400 text-xs font-mono p-4 space-y-2 border border-slate-800 shadow-inner">
        <QrCode className="h-10 w-10 text-teal-500 animate-pulse" />
        <span>Kamera Pemindai QR Aktif</span>
        <span className="text-[10px] text-slate-500">Arahkan QR Tiket QuickPass ke area pemindaian</span>
      </div>

      <form onSubmit={handleVerify} className="flex gap-2">
        <input
          type="text"
          value={manualId}
          onChange={(e) => setManualId(e.target.value)}
          placeholder="Masukkan Kode Tiket / Booking ID (mis: UL-9812-XYZ)..."
          className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:border-teal-600 focus:outline-none"
        />
        <Button type="submit" disabled={!manualId.trim()} className="text-xs px-4 font-bold bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1">
          <Search className="h-3.5 w-3.5" /> Verifikasi
        </Button>
      </form>
    </Card>
  );
}
