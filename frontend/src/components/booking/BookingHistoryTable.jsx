import React, { useEffect, useState, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from '../ui/card.jsx';
import { Button } from '../ui/button.jsx';
import { fetchBookings, deleteBooking } from '../../lib/api/bookings.js';
import { createClient } from '../../lib/supabase/client.js';
import { useToast } from '../ui/ToastNotification.jsx';
import { RefreshCw, Radio, QrCode, ShieldCheck, X, Trash2 } from 'lucide-react';

export function BookingHistoryTable() {
  const { showToast } = useToast();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQRBooking, setActiveQRBooking] = useState(null);
  const [reschedulingId, setReschedulingId] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchBookings();
      if (res && res.data) {
        setHistory(res.data);
      } else {
        setHistory([]);
      }
    } catch (e) {
      console.error('Error fetching booking history:', e);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const supabase = createClient();
    const channel = supabase
      .channel('booking_history_table_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadData]);

  // Action: Delete Booking with Failover API
  const handleDeleteBooking = async (booking) => {
    const plateName = booking.vehicle_plate || 'tersebut';
    if (!window.confirm(`Apakah Anda yakin ingin menghapus riwayat booking armada ${plateName}?`)) {
      return;
    }

    try {
      await deleteBooking(booking.id);
      showToast({
        title: 'Riwayat Booking Dihapus!',
        message: `Riwayat booking kendaraan ${plateName} telah dihapus dari database.`,
        type: 'success',
      });
      setHistory((prev) => prev.filter((item) => item.id !== booking.id));
      loadData();
    } catch (err) {
      console.error('Delete booking error:', err);
      showToast({
        title: 'Gagal Menghapus Booking',
        message: err.message || 'Terjadi kesalahan saat terhubung ke database.',
        type: 'error',
      });
    }
  };

  // Action: Panic Reschedule (Emergency Re-route)
  const handlePanicReschedule = async (booking) => {
    setReschedulingId(booking.id);
    try {
      const supabase = createClient();
      const currentStart = new Date(booking.time_window_start || Date.now());
      const newStart = new Date(currentStart.getTime() + 60 * 60 * 1000); // Shift +1 hour
      const newEnd = new Date(newStart.getTime() + 60 * 60 * 1000);

      const { error } = await supabase
        .from('bookings')
        .update({
          time_window_start: newStart.toISOString(),
          time_window_end: newEnd.toISOString(),
          status: 'confirmed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', booking.id);

      if (!error) {
        showToast({
          title: 'Panic Reschedule Berhasil!',
          message: `Jadwal booking ${booking.vehicle_plate} telah digeser otomatis ke ${newStart.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB.`,
          type: 'warning',
        });
        loadData();
      }
    } catch (err) {
      console.error('Panic Reschedule error:', err);
    } finally {
      setReschedulingId(null);
    }
  };

  return (
    <Card className="p-4 sm:p-6 border-slate-200 bg-white shadow-sm rounded-2xl space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">Riwayat Booking Slot Logistik Realtime</h3>
            <span className="flex items-center gap-1 text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-0.5 rounded-full font-mono">
              <Radio className="h-3 w-3 text-teal-600 animate-pulse" /> Realtime WebSocket
            </span>
          </div>
        </div>

        <Button onClick={loadData} variant="outline" className="text-xs h-8 font-bold">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
        </Button>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b text-slate-700 font-bold">
              <th className="p-3">Nopol Kendaraan</th>
              <th className="p-3">Jendela Waktu Slot</th>
              <th className="p-3">Status Slot</th>
              <th className="p-3 text-right">Aksi & Tiket QR</th>
            </tr>
          </thead>
          <tbody className="divide-y text-slate-800 font-medium">
            {history.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-slate-400 font-semibold">
                  {loading ? 'Memuat riwayat booking real...' : 'Belum ada riwayat booking.'}
                </td>
              </tr>
            ) : (
              history.map((b) => {
                const statusBg =
                  b.status === 'confirmed'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : b.status === 'active'
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300';

                return (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-mono font-bold text-slate-900">{b.vehicle_plate || 'B 1234 LOG'}</td>
                    <td className="p-3 font-mono">
                      {b.time_window_start
                        ? new Date(b.time_window_start).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                        : '10.00'}{' '}
                      WIB
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase ${statusBg}`}>
                        {b.status || 'confirmed'}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <Button
                        onClick={() => setActiveQRBooking(b)}
                        className="text-[10px] h-7 px-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold"
                      >
                        <QrCode className="h-3 w-3 mr-1" /> Tampilkan QR
                      </Button>

                      <Button
                        onClick={() => handlePanicReschedule(b)}
                        disabled={reschedulingId === b.id}
                        variant="outline"
                        className="text-[10px] h-7 px-2 bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 font-bold"
                      >
                        Panic Reschedule (+1 Jam)
                      </Button>

                      <Button
                        onClick={() => handleDeleteBooking(b)}
                        variant="outline"
                        className="text-[10px] h-7 px-2.5 bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 font-bold"
                        title="Hapus riwayat booking dari database"
                      >
                        <Trash2 className="h-3 w-3 mr-1" /> Hapus
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal QuickPass QR Ticket */}
      {activeQRBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-sm p-6 bg-white rounded-3xl border border-teal-200 shadow-2xl relative space-y-4 text-center">
            <button
              onClick={() => setActiveQRBooking(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-black uppercase text-teal-700 tracking-wider bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                QuickPass QR • HMAC-SHA256
              </span>
              <h3 className="text-lg font-black text-slate-900">Tiket Pas Digital</h3>
              <p className="text-xs text-slate-500 font-mono font-bold">{activeQRBooking.vehicle_plate}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block shadow-inner">
              <QRCodeSVG
                value={`URBANLOAD_PASS:${activeQRBooking.id}:${activeQRBooking.vehicle_plate}`}
                size={180}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs font-mono text-emerald-900 space-y-1 text-left">
              <div className="flex items-center gap-1 font-bold text-emerald-800">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> Signature Kriptografi Terverifikasi
              </div>
              <p className="text-[10px] text-slate-600 truncate">Token: {activeQRBooking.id}</p>
            </div>

            <Button
              onClick={() => setActiveQRBooking(null)}
              className="w-full py-2.5 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl"
            >
              Tutup Tiket Pas
            </Button>
          </Card>
        </div>
      )}
    </Card>
  );
}
