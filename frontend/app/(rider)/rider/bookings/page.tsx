import { BookingHistoryTable } from '@/components/booking/BookingHistoryTable';

export default function BookingsPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800">Daftar Riwayat Booking Saya</h2>
      <BookingHistoryTable />
    </div>
  );
}
