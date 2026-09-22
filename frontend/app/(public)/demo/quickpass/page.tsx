'use client';

import { useState } from 'react';
import Link from 'next/link';
import { QuickPassCard } from '@/components/qr/QuickPassCard';
import { QRScanner } from '@/components/qr/QRScanner';
import { ScanResultPanel } from '@/components/qr/ScanResultPanel';
import { Award, ArrowLeft, ShieldCheck, CheckCircle2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function SandboxDemoPage() {
  const [scanStatus, setScanStatus] = useState<'valid' | 'out_of_schedule' | 'invalid' | 'outside_zone'>('valid');

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-8">
      {/* Banner Sandbox Juri */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 font-bold">
          <Award className="h-5 w-5 text-amber-600 shrink-0" />
          <span>[MODE DEMO SANDBOX JURI - DATA SIMULASI GUEST REVIEWER]</span>
        </div>
        <Link href="/">
          <Button variant="outline" className="text-xs py-1 px-3 flex items-center gap-1 border-amber-300 text-amber-800 bg-white">
            <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Landing Page
          </Button>
        </Link>
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-slate-900">Interactive QR & PostGIS Sandbox Demo</h1>
        <p className="text-xs text-slate-500 max-w-lg mx-auto">
          Lingkungan uji terbatas untuk Juri & Reviewer. Uji coba pembuatan tiket digital QuickPass QR HMAC-SHA256 dan simulasi scan verifikasi di lokasi.
        </p>
      </div>

      {/* Grid Simulasi Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="text-xs font-bold text-teal-700 uppercase tracking-wider flex items-center gap-1.5">
            <Play className="h-4 w-4" /> Step 1: Simulasi Tiket Digital QR
          </div>
          <QuickPassCard bookingId="DEMO-2025-JURI-01" zone="Zona A - Pasar Tanah Abang (Demo)" />
        </div>

        <div className="space-y-4">
          <div className="text-xs font-bold text-teal-700 uppercase tracking-wider flex items-center gap-1.5">
            <Play className="h-4 w-4" /> Step 2: Simulasi Scanner Petugas Dishub
          </div>
          <Card className="p-6 space-y-4">
            <h4 className="text-xs font-bold text-slate-800">Uji Coba Hasil Verifikasi Scan:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Button onClick={() => setScanStatus('valid')} variant={scanStatus === 'valid' ? 'default' : 'outline'} className="text-[11px] py-1.5">
                Simulasi Valid
              </Button>
              <Button onClick={() => setScanStatus('out_of_schedule')} variant={scanStatus === 'out_of_schedule' ? 'default' : 'outline'} className="text-[11px] py-1.5">
                Simulasi Luar Jadwal
              </Button>
              <Button onClick={() => setScanStatus('invalid')} variant={scanStatus === 'invalid' ? 'default' : 'outline'} className="text-[11px] py-1.5">
                Simulasi Invalid Signature
              </Button>
              <Button onClick={() => setScanStatus('outside_zone')} variant={scanStatus === 'outside_zone' ? 'default' : 'outline'} className="text-[11px] py-1.5">
                Simulasi Luar Poligon
              </Button>
            </div>

            <ScanResultPanel result={scanStatus} />

            <div className="p-3 bg-slate-50 rounded-xl border text-[11px] text-slate-600 space-y-1">
              <div><strong>Fungsi Terkait:</strong> POST /api/v1/qr/verify</div>
              <div><strong>Kriptografi:</strong> Signature dienkripsi dengan HMAC-SHA256 secret key.</div>
            </div>
          </Card>
        </div>
      </div>

      {/* Banner CTA Login */}
      <Card className="p-6 bg-teal-50 border-teal-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="space-y-1 text-center sm:text-left">
          <div className="font-bold text-teal-900 text-sm">Ingin Mencoba Operasional Penuh?</div>
          <div className="text-slate-600">Masuk sebagai Kurir untuk memesan slot riil atau Pengelola Kota untuk membuat polygon PostGIS baru.</div>
        </div>
        <div className="flex gap-2">
          <Link href="/login">
            <Button className="text-xs">Masuk ke Akun</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" className="text-xs">Daftar Akun Baru</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
