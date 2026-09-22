'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookingForm } from '@/components/booking/BookingForm';
import { SlotAvailabilityTable } from '@/components/booking/SlotAvailabilityTable';
import { BookingSummary } from '@/components/booking/BookingSummary';
import { BookingHistoryTable } from '@/components/booking/BookingHistoryTable';
import { RefreshCw, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SmartSlotBookingPage() {
  const router = useRouter();
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [formData, setFormData] = useState<any>(null);

  const handleCheckSlot = (data: any) => {
    setFormData(data);
  };

  const handleSelectSlot = (slot: any) => {
    setSelectedSlot(slot);
  };

  const handleConfirm = () => {
    // POST /api/v1/bookings success -> Redirect /rider/bookings/[id]/qr
    router.push('/rider/bookings/UL-2025-091823/qr');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-2">
        <div>
          <div className="text-xs text-slate-500 mb-1">
            <Link href="/" className="hover:underline">Beranda</Link> / <Link href="/rider/bookings" className="hover:underline">Booking</Link> / <span className="font-semibold text-slate-700">Baru</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Pesan Slot Bongkar Muat</h1>
          <p className="text-xs text-slate-500">"Pilih zona, isi dimensi truk, sistem akan memvalidasi ketersediaan."</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="text-xs flex items-center gap-1">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh Slot
          </Button>
          <Button variant="ghost" className="text-xs flex items-center gap-1">
            <HelpCircle className="h-3.5 w-3.5" /> Panduan
          </Button>
        </div>
      </div>

      {/* Section 1: Form Input Booking */}
      <BookingForm onCheckSlot={handleCheckSlot} />

      {/* Section 2: Tabel Ketersediaan Slot */}
      <SlotAvailabilityTable onSelectSlot={handleSelectSlot} />

      {/* Section 3: Ringkasan & Konfirmasi */}
      <BookingSummary bookingData={formData} onConfirm={handleConfirm} onCancel={() => setSelectedSlot(null)} />

      {/* Section 4: Riwayat Booking Saya */}
      <BookingHistoryTable />

      {/* Footer Halaman: Catatan Kebijakan */}
      <div className="rounded-xl bg-slate-100 p-4 text-xs text-slate-600 space-y-1 border border-slate-200">
        <div className="font-bold text-slate-800">Catatan Kebijakan & Pembatalan:</div>
        <p>• Pembatalan ≤2 jam sebelum slot: Gratis tanpa biaya penalti.</p>
        <p>• Pembatalan &lt;2 jam sebelum slot: Dikenakan sanksi penalti StrikeBan harian.</p>
        <p>• Layanan Panic Button dapat digunakan untuk reschedule darurat otomatis.</p>
      </div>
    </div>
  );
}
