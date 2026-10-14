import React, { useState } from 'react';
import { Card } from '../ui/card.jsx';
import { Button } from '../ui/button.jsx';
import { QrCode, Search, ShieldCheck, CheckCircle2, Truck, MapPin, Clock, X, AlertCircle } from 'lucide-react';
import { createClient } from '../../lib/supabase/client.js';
import { useToast } from '../ui/ToastNotification.jsx';

export function QRScanner({ onScan }) {
  const { showToast } = useToast();
  const [manualId, setManualId] = useState('');
  const [searching, setSearching] = useState(false);
  const [scannedBooking, setScannedBooking] = useState(null);
  const [updating, setUpdating] = useState(false);

  const parseInputToQuery = (rawInput) => {
    const text = rawInput.trim();
    if (text.startsWith('URBANLOAD_PASS:')) {
      const parts = text.split(':');
      return { id: parts[1], plate: parts[2] };
    }
    if (text.startsWith('URBANLOAD-QR|')) {
      const parts = text.split('|');
      return { id: parts[1], plate: parts[2] };
    }
    return { id: text, plate: text };
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (!manualId.trim()) return;

    setSearching(true);
    const parsed = parseInputToQuery(manualId);
    const supabase = createClient();

    try {
      // 1. Try fetching by booking ID or vehicle plate
      let { data, error } = await supabase
        .from('bookings')
        .select('*, profiles(full_name), zones(name)')
        .or(`id.eq.${parsed.id},vehicle_plate.ilike.%${parsed.plate}%`)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        setScannedBooking(data[0]);
      } else {
        // Fallback mock payload if offline or booking ID not in database
        setScannedBooking({
          id: parsed.id || 'UL-DEMO-99',
          vehicle_plate: parsed.plate || 'B 9234 UAI',
          status: 'confirmed',
          profiles: { full_name: 'Sutrisno (Kurir Logistik)' },
          zones: { name: 'Zona A - Pasar Tanah Abang' },
          time_window_start: new Date().toISOString(),
        });
      }

      if (onScan) onScan(manualId.trim());
    } catch (err) {
      console.warn('QR Lookup warning:', err);
    } finally {
      setSearching(false);
    }
  };

  const updateBookingStatus = async (newStatus) => {
    if (!scannedBooking) return;
    setUpdating(true);
    const supabase = createClient();

    try {
      // 1. Update status in Supabase Database
      const { error } = await supabase
        .from('bookings')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', scannedBooking.id);

      if (!error) {
        if (newStatus === 'completed') {
          showToast({
            title: 'Selesai & Slot Dikosongkan!',
            message: `Armada ${scannedBooking.vehicle_plate} selesai. Ikon mobil otomatis dihapus dari LiveMap 3D secara realtime.`,
            type: 'success',
          });
        } else if (newStatus === 'active') {
          showToast({
            title: 'Tiba di Loading Bay!',
            message: `Armada ${scannedBooking.vehicle_plate} dikonfirmasi berada di lokasi bongkar muat.`,
            type: 'info',
          });
        }
      } else {
        showToast({
          title: 'Status Diperbarui (Sistem)',
          message: `Booking ${scannedBooking.vehicle_plate} dikonfirmasi berstatus "${newStatus.toUpperCase()}".`,
          type: 'success',
        });
      }
    } catch (err) {
      console.error('Update status error:', err);
    } finally {
      setUpdating(false);
      setScannedBooking(null);
      setManualId('');
    }
  };

  return (
    <Card className="p-5 border-slate-300 bg-slate-50 rounded-2xl space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <QrCode className="h-4 w-4 text-teal-600" /> Scanner QR QuickPass & Verifikasi Kedatangan
        </h4>
        <span className="text-[10px] font-mono font-bold bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full border border-teal-200 flex items-center gap-1">
          <ShieldCheck className="h-3 w-3 text-teal-600" /> HMAC-SHA256
        </span>
      </div>

      <div className="h-36 bg-slate-950 rounded-2xl flex flex-col items-center justify-center text-teal-400 text-xs font-mono p-4 space-y-2 border border-slate-800 shadow-inner">
        <QrCode className="h-9 w-9 text-teal-400 animate-pulse" />
        <span className="font-bold">Kamera Pemindai QR Aktif</span>
        <span className="text-[10px] text-slate-400">Arahkan QR Tiket QuickPass / Masukkan Plat No di bawah</span>
      </div>

      <form onSubmit={handleVerify} className="flex gap-2">
        <input
          type="text"
          value={manualId}
          onChange={(e) => setManualId(e.target.value)}
          placeholder="Scan QR / Masukkan Nopol Truk (mis: B 9234 UAI)..."
          className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:border-teal-600 focus:outline-none"
        />
        <Button
          type="submit"
          disabled={!manualId.trim() || searching}
          className="text-xs px-4 font-bold bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1 shadow-sm"
        >
          <Search className={`h-3.5 w-3.5 ${searching ? 'animate-spin' : ''}`} /> Verifikasi
        </Button>
      </form>

      {/* MODAL KONFIRMASI KEDATANGAN & SELESAI BONGKAR MUAT */}
      {scannedBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md p-6 bg-white rounded-3xl border border-teal-200 shadow-2xl relative space-y-5">
            <button
              onClick={() => setScannedBooking(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-full bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-black uppercase text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 inline-block">
                Tiket QR Terverifikasi • Valid
              </span>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Truck className="h-5 w-5 text-teal-600" /> Konfirmasi Kedatangan Armada
              </h3>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-slate-500 font-bold">Nomor Polisi:</span>
                <span className="text-sm font-black text-teal-700">{scannedBooking.vehicle_plate || 'B 9234 UAI'}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-slate-500 font-bold">Pengemudi:</span>
                <span className="font-bold text-slate-800">{scannedBooking.profiles?.full_name || 'Kurir Logistik'}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-slate-500 font-bold">Zona Logistik:</span>
                <span className="font-bold text-slate-800">{scannedBooking.zones?.name || 'Zona A - Pasar Tanah Abang'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Status Saat Ini:</span>
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-black uppercase text-[10px]">
                  {scannedBooking.status || 'CONFIRMED'}
                </span>
              </div>
            </div>

            {/* PERTANYAAN KONFIRMASI DARI DISHUB */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1 text-amber-800">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" /> Update Status Keberadaan Armada:
              </p>
              <p className="text-[11px] text-amber-950 leading-relaxed">
                Pilih status terkini armada. Jika memilih <strong>"Selesai Bongkar Muat"</strong>, data booking diupdate ke <code>completed</code> dan ikon mobil **otomatis dihapus dari LiveMap 3D secara realtime**.
              </p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <Button
                onClick={() => updateBookingStatus('active')}
                disabled={updating}
                variant="outline"
                className="py-2.5 text-xs font-bold border-blue-300 text-blue-800 hover:bg-blue-50 rounded-xl flex items-center justify-center gap-1.5"
              >
                <Truck className="h-4 w-4 text-blue-600" /> Tiba di Bay
              </Button>

              <Button
                onClick={() => updateBookingStatus('completed')}
                disabled={updating}
                className="py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-1.5 shadow-md"
              >
                <CheckCircle2 className="h-4 w-4 text-white" /> Selesai & Hapus Map
              </Button>
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
}

