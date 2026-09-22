'use client';

import Link from 'next/link';
import { QuickPassCard } from '@/components/qr/QuickPassCard';
import { QRDownloadButton } from '@/components/qr/QRDownloadButton';
import { QRScanner } from '@/components/qr/QRScanner';
import { ScanResultPanel } from '@/components/qr/ScanResultPanel';
import { RefreshCw, ArrowLeft, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function QuickPassQRPage({ params }: { params: { id: string } }) {
  const [scanStatus, setScanStatus] = useState<'valid' | 'out_of_schedule' | 'invalid' | 'outside_zone'>('valid');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-2">
        <div>
          <div className="text-xs text-slate-500 mb-1">
            <Link href="/" className="hover:underline">Beranda</Link> / <Link href="/rider/bookings" className="hover:underline">Booking</Link> / <span className="font-semibold text-slate-700">QuickPass</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Tiket Digital QuickPass QR</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="text-xs flex items-center gap-1">
            <RefreshCw className="h-3.5 w-3.5" /> Regenerate QR
          </Button>
          <Link href="/rider/bookings">
            <Button variant="ghost" className="text-xs flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Kembali
            </Button>
          </Link>
        </div>
      </div>

      {/* Section 1: Hero Card QR Code */}
      <QuickPassCard bookingId={params.id || 'UL-2025-091823'} />

      {/* Section 2: Tombol Aksi */}
      <QRDownloadButton />

      {/* Section 3: Panel Verifikasi Scan (Role: Petugas Dishub) */}
      <div className="pt-6 border-t space-y-4">
        <h3 className="text-sm font-bold text-slate-800">Section 3 — Panel Verifikasi Scan (Role Petugas Dishub)</h3>
        <QRScanner onScan={() => setScanStatus('valid')} />
        <ScanResultPanel result={scanStatus} />
      </div>

      {/* Footer Halaman Peringatan Keamanan */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-100 text-slate-600 text-xs border border-slate-200">
        <ShieldAlert className="h-4 w-4 text-slate-500 shrink-0" />
        <span>Peringatan keamanan: QR unik & terikat signature HMAC-SHA256. Jangan dibagikan ke pihak tidak berkepentingan.</span>
      </div>
    </div>
  );
}
