import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Lock, ShieldAlert, ArrowRight } from 'lucide-react';

export default function GeoFenceFiturPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold">
          <MapPin className="h-4 w-4 text-teal-600" /> Penjelasan Fitur Modul 3
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900">
          Virtual GeoFence (PostGIS Spatial)
        </h1>
        <p className="text-xs md:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Manajemen poligon batas zona logistik perkotaan menggunakan PostGIS GEOGRAPHY(POLYGON, 4326) dan validasi RPC lokasi truk real-time.
        </p>
      </div>

      <Card className="p-8 space-y-6 border-slate-200 shadow-md">
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 space-y-3 text-xs">
          <div className="font-bold text-amber-900 text-sm flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-700 shrink-0" />
            <span>Manajemen Zona Terproteksi Khusus Admin</span>
          </div>
          <p className="text-amber-800 leading-relaxed">
            Penggambaran dan pengubahan poligon batas zona logistik kota adalah fitur sensitif yang hanya dapat dilakukan oleh **Admin Pengelola Kota** untuk menjaga keamanan data tata ruang kota.
          </p>
          <div className="pt-2">
            <Link href="/login">
              <Button className="text-xs py-2 px-4 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" /> Login sebagai Admin untuk Kelola Zona <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
