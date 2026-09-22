import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CityDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Dashboard CivicLogix Kota</h2>
          <p className="text-xs text-slate-500">Pemantauan efisiensi zona logistik perkotaan dan PostGIS GeoFence.</p>
        </div>
        <Link href="/city/livemap">
          <Button className="text-xs">Buka LiveMap Spatial</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-teal-50 border-teal-100">
          <span className="text-xs text-teal-700 block">Total Zona Aktif</span>
          <span className="text-2xl font-bold text-teal-900">12 Zona</span>
        </Card>
        <Card className="p-4 bg-amber-50 border-amber-100">
          <span className="text-xs text-amber-700 block">Zona Kepadatan Tinggi</span>
          <span className="text-2xl font-bold text-amber-900">2 Zona</span>
        </Card>
        <Card className="p-4 bg-blue-50 border-blue-100">
          <span className="text-xs text-blue-700 block">Utilisasi Slot Harian</span>
          <span className="text-2xl font-bold text-blue-900">84%</span>
        </Card>
        <Card className="p-4 bg-emerald-50 border-emerald-100">
          <span className="text-xs text-emerald-700 block">Kepatuhan Logistik</span>
          <span className="text-2xl font-bold text-emerald-900">96.2%</span>
        </Card>
      </div>
    </div>
  );
}
