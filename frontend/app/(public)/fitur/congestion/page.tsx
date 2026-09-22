import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Eye, ArrowRight } from 'lucide-react';

export default function CongestionFiturPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold">
          <Activity className="h-4 w-4 text-teal-600" /> Penjelasan Fitur Modul 2
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900">
          CongestionScore Real-Time
        </h1>
        <p className="text-xs md:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Skor kepadatan zona 1-10 berbasis rumus rule-based transparan yang dapat diakses publik secara gratis untuk transparansi Smart City.
        </p>
      </div>

      <Card className="p-8 space-y-6 border-slate-200 shadow-md">
        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3 text-xs">
          <div className="font-bold text-emerald-900 text-sm flex items-center gap-2">
            <Eye className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>Informasi Publik (Tanpa Login)</span>
          </div>
          <p className="text-emerald-800 leading-relaxed">
            Masyarakat dan pengemudi truk dapat memantau tingkat kepadatan zona secara publik untuk memilih waktu operasional paling efisien.
          </p>
          <div className="pt-2">
            <Link href="/rider/congestion">
              <Button className="text-xs py-2 px-4 flex items-center gap-1.5">
                Lihat Skor Kepadatan Publik <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
