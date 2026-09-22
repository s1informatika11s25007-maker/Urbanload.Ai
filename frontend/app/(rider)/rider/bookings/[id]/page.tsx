import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function BookingDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-4 max-w-lg mx-auto py-6">
      <h2 className="text-xl font-bold">Detail Booking: {params.id}</h2>
      <p className="text-xs text-slate-600">Status: Confirmed | Zona A - Pasar Tanah Abang | 14:00 - 15:00 WIB</p>
      <Link href={`/rider/bookings/${params.id}/qr`}>
        <Button className="w-full text-xs">Lihat Tiket QuickPass QR</Button>
      </Link>
    </div>
  );
}
