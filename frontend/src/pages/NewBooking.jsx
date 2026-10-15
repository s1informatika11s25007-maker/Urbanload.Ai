import React, { useState, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createBooking } from '../lib/api/bookings.js';
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
      const cleanPlate = formData.vehicle.trim().toUpperCase();

      const supabase = createClient();
      const { data: existingActive } = await supabase
        .from('bookings')
        .select('id, status')
        .ilike('vehicle_plate', cleanPlate)
        .in('status', ['confirmed', 'active', 'pending']);

      if (existingActive && existingActive.length > 0) {
        alert(`Kendaraan ${cleanPlate} masih memiliki booking aktif (Status: ${existingActive[0].status.toUpperCase()}). Harap selesaikan bongkar muat terlebih dahulu.`);
        setSubmitting(false);
        return;
      }

      const slotTime = formData.aiResult?.recommendedSlotTime || formData.requestedTime || '10.00';

      const now = new Date();
      const [h, m] = slotTime.split('.').map(Number);
      const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h || 10, m || 0);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

      const res = await createBooking({
        zoneId: formData.zoneId,
        vehiclePlate: formData.vehicle,
        cargoType: 'Bahan Pokok Logistik',
        truckDimension: formData.truckDimensions,
        timeWindowStart: startTime.toISOString(),
        timeWindowEnd: endTime.toISOString(),
      });

      if (res && res.success) {
        alert(`Booking SmartSlot Berhasil Disimpan Ke Database!\nPlat: ${cleanPlate}\nJadwal: ${slotTime} WIB`);
        navigate('/rider/dashboard');
      }
    } catch (err) {
      console.error('Error confirming booking:', err);
      alert(`Gagal menyimpan booking: ${err.message || 'Terjadi kesalahan sistem'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto p-2.5 sm:p-4">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 sm:pb-4 gap-2">
        <div>
          <div className="text-[11px] sm:text-xs text-slate-500 mb-0.5">
            <Link to="/" className="hover:underline">Beranda</Link> / <Link to="/rider/dashboard" className="hover:underline">Operasional Kurir</Link> / <span className="font-semibold text-slate-700">Booking Slot</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">SmartSlot Booking AI</h1>
          <p className="text-[11px] sm:text-xs text-slate-500">Pesan slot bongkar muat bebas antrean berbasis Solver Backend Deterministik & PostGIS Virtual GeoFence.</p>
        </div>
      </div>

      <Suspense fallback={<div className="p-4 text-xs text-slate-400">Memuat Form Booking...</div>}>
        <BookingForm onCheckSlot={handleCheckSlot} />
        <SlotAvailabilityTable onSelectSlot={handleSelectSlot} />
        <BookingSummary bookingData={formData} onConfirm={handleConfirm} onCancel={() => setFormData(null)} />
        <BookingHistoryTable />
      </Suspense>
    </div>
  );
}
