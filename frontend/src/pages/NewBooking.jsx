import React, { useState, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RefreshCw, HelpCircle, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/button.jsx';
import { createClient } from '../lib/supabase/client.js';

const BookingForm = lazy(() => import('../components/booking/BookingForm.jsx').then(m => ({ default: m.BookingForm })));
const SlotAvailabilityTable = lazy(() => import('../components/booking/SlotAvailabilityTable.jsx').then(m => ({ default: m.SlotAvailabilityTable })));
const BookingSummary = lazy(() => import('../components/booking/BookingSummary.jsx').then(m => ({ default: m.BookingSummary })));
const BookingHistoryTable = lazy(() => import('../components/booking/BookingHistoryTable.jsx').then(m => ({ default: m.BookingHistoryTable })));

export default function NewBooking() {
  const navigate = useNavigate();
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [formData, setFormData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleCheckSlot = (data) => {
    setFormData(data);
  };

  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot);
  };

  const handleConfirm = async () => {
    if (!formData) return;
    setSubmitting(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate('/login');
        return;
      }

      const user_id = user.id;
      const slotTime = formData.aiResult?.recommendedSlotTime || formData.requestedTime || '10.00';

      const now = new Date();
      const [h, m] = slotTime.split('.').map(Number);
      const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h || 10, m || 0);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

      // 1. Insert Real Booking into Supabase DB
      const { data: newBooking, error } = await supabase
        .from('bookings')
        .insert({
          user_id,
          zone_id: formData.zoneId,
          vehicle_plate: formData.vehicle,
          cargo_type: 'Bahan Pokok Logistik',
          time_window_start: startTime.toISOString(),
          time_window_end: endTime.toISOString(),
          status: 'confirmed',
        })
        .select('*')
        .single();

      if (error && !newBooking) {
        console.warn('Booking insertion notice:', error);
      }

      // Smooth Navigation to Rider Dashboard
      navigate('/rider/dashboard');
    } catch (err) {
      console.error('Error confirming booking:', err);
      navigate('/rider/dashboard');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-2">
        <div>
          <div className="text-xs text-slate-500 mb-1">
            <Link to="/" className="hover:underline">Beranda</Link> / <Link to="/rider/dashboard" className="hover:underline">Booking</Link> / <span className="font-semibold text-slate-700">Baru</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Pesan Slot Bongkar Muat Realtime</h1>
          <p className="text-xs text-slate-500">"Pilih zona, isi plat kendaraan, sistem GroqLogix AI akan mengoptimalkan slot bebas antrean."</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="text-xs flex items-center gap-1 font-bold">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh Slot
          </Button>
          <Button variant="ghost" className="text-xs flex items-center gap-1 font-semibold">
            <HelpCircle className="h-3.5 w-3.5" /> Panduan
          </Button>
        </div>
      </div>

      <Suspense fallback={<div className="p-4 text-xs text-slate-400">Memuat Form Booking AI...</div>}>
        <BookingForm onCheckSlot={handleCheckSlot} />
        <SlotAvailabilityTable onSelectSlot={handleSelectSlot} />
        <BookingSummary bookingData={formData} onConfirm={handleConfirm} onCancel={() => setFormData(null)} />
        <BookingHistoryTable />
      </Suspense>

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
