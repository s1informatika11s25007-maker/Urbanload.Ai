import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DishubDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Dashboard Petugas Lapangan Dishub</h2>
          <p className="text-xs text-slate-500">Akses cepat verifikasi tiket QuickPass QR dan pengawasan area.</p>
        </div>
        <Link href="/dishub/scan">
          <Button className="text-xs">Buka Scanner QR</Button>
        </Link>
      </div>

      <Card className="p-4 bg-teal-50 border-teal-100">
        <span className="text-xs text-teal-700 block">Total Scan Terverifikasi Hari Ini</span>
        <span className="text-2xl font-bold text-teal-900">48 Truk</span>
      </Card>
    </div>
  );
}
