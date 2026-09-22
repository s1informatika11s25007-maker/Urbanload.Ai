'use client';

import { useState } from 'react';
import { QRScanner } from '@/components/qr/QRScanner';
import { ScanResultPanel } from '@/components/qr/ScanResultPanel';

export default function DishubScanPage() {
  const [result, setResult] = useState<'valid' | 'out_of_schedule' | 'invalid' | 'outside_zone'>('valid');

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold text-slate-900">Verifikasi Scan QR QuickPass (Petugas Dishub)</h1>
      <QRScanner onScan={() => setResult('valid')} />
      <ScanResultPanel result={result} />
    </div>
  );
}
