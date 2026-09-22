import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, ShieldCheck, PlayCircle, Lock, ArrowRight } from 'lucide-react';

export default function QuickPassFiturPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold">
          <QrCode className="h-4 w-4 text-teal-600" /> Penjelasan Fitur Modul 1
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900">
          QuickPass QR Digital Ticket
        </h1>
        <p className="text-xs md:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Tiket digital QR berkriptografi HMAC-SHA256 yang aman, terikat pada ID booking spesifik, dan dapat diverifikasi langsung oleh petugas Dishub di lokasi.
        </p>
      </div>

      <Card className="p-8 space-y-6 border-slate-200 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3 text-xs">
            <h2 className="text-base font-bold text-slate-900">Keamanan Kriptografi HMAC-SHA256</h2>
            <p className="text-slate-600 leading-relaxed">
              QuickPass QR mengkodekan booking ID, timestamp pembuatan, serta signature HMAC-SHA256 unik untuk mencegah pemalsuan tiket di lokasi bongkar muat.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-teal-50 border border-teal-200 text-center space-y-3">
            <ShieldCheck className="h-8 w-8 text-teal-600 mx-auto" />
            <h3 className="font-bold text-sm text-teal-900">Uji Coba Demo Tanpa Login</h3>
            <p className="text-xs text-slate-600">Juri & reviewer dapat mencoba simulasi pembentukan dan scan QR di Interactive Sandbox Demo.</p>
            <Link href="/demo/quickpass">
              <Button className="w-full text-xs py-2 flex items-center justify-center gap-1.5">
                <PlayCircle className="h-4 w-4" /> Buka Interactive Sandbox Demo
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
