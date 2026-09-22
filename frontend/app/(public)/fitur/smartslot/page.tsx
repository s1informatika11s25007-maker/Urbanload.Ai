import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, Lock, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export default function SmartSlotFiturPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold">
          <Truck className="h-4 w-4 text-teal-600" /> Penjelasan Fitur Modul 1
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900">
          SmartSlot Booking Logistik
        </h1>
        <p className="text-xs md:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Pemesanan slot jendela waktu bongkar muat secara cerdas dengan validasi real-time dimensi & tonase truk versus kapasitas zona logistik kota.
        </p>
      </div>

      <Card className="p-8 space-y-6 border-slate-200 shadow-md">
        <h2 className="text-lg font-bold text-slate-900 border-b pb-3">Keunggulan & Cara Kerja SmartSlot</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Validasi Dimensi Truk
            </div>
            <p className="text-slate-600">Mencegah truk berukuran melebihi kapasitas jalan/loading bay masuk ke zona logistik padat.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Jendela Waktu Presisi
            </div>
            <p className="text-slate-600">Slot 1 jam operasional teratur untuk menghilangkan antrean liar di bahu jalan.</p>
          </div>
        </div>

        {/* Protection Notice & CTA */}
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <div className="space-y-1 text-center sm:text-left">
            <div className="font-bold text-amber-900 text-sm flex items-center gap-1.5 justify-center sm:justify-start">
              <Lock className="h-4 w-4 text-amber-700" /> Aksi Terproteksi (Wajib Login)
            </div>
            <div className="text-amber-800">Pembuatan pesanan slot harus terikat dengan identitas akun kurir/perusahaan resmi untuk mencegah spam booking.</div>
          </div>

          <div className="flex gap-2 shrink-0">
            <Link href="/login">
              <Button className="text-xs py-2.5 px-4 flex items-center gap-1.5">
                Masuk ke Akun <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" className="text-xs py-2.5 px-4">
                Daftar Akun
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
