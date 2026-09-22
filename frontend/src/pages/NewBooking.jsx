import React, { useState, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RefreshCw, HelpCircle } from 'lucide-react';
import { Button } from '../components/ui/button.jsx';

const BookingForm = lazy(() => import('../components/booking/BookingForm.jsx').then(m => ({ default: m.BookingForm })));
const SlotAvailabilityTable = lazy(() => import('../components/booking/SlotAvailabilityTable.jsx').then(m => ({ default: m.SlotAvailabilityTable })));
const BookingSummary = lazy(() => import('../components/booking/BookingSummary.jsx').then(m => ({ default: m.BookingSummary })));
const BookingHistoryTable = lazy(() => import('../components/booking/BookingHistoryTable.jsx').then(m => ({ default: m.BookingHistoryTable })));

export default function NewBooking() {
  const navigate = useNavigate();
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [formData, setFormData] = useState(null);

  const handleCheckSlot = (data) => {
    setFormData(data);
  };

  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot);
  };

  const handleConfirm = () => {
    navigate('/rider/bookings/UL-2025-091823/qr');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-2">
        <div>
          <div className="text-xs text-slate-500 mb-1">
            <Link to="/" className="hover:underline">Beranda</Link> / <Link to="/rider/dashboard" className="hover:underline">Booking</Link> / <span className="font-semibold text-slate-700">Baru</span>
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

      <Suspense fallback={<div>Loading...</div>}>
        <BookingForm onCheckSlot={handleCheckSlot} />
        <SlotAvailabilityTable onSelectSlot={handleSelectSlot} />
        <BookingSummary bookingData={formData} onConfirm={handleConfirm} onCancel={() => setSelectedSlot(null)} />
        <BookingHistoryTable />
      </Suspense>

      <div className="rounded-xl bg-slate-100 p-4 text-xs text-slate-600 space-y-1 border border-slate-200">
        <div className="font-bold text-slate-800">Catatan Kebijakan & Pembatalan:</div>
        <p>• Pembatalan ≤2 jam sebelum slot: Gratis tanpa biaya penalti.</p>
        <p>• Pembatalan &lt;2 jam sebelum slot: Dikenakan sanksi penalti StrikeBan harian.</p>
        <p>• Layanan Panic Button dapat digunakan untuk reschedule darurat otomatis.</p>
      </div>
    </div>
  );
}
