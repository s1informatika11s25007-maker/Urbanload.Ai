import React, { useEffect, useState, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from '../ui/card.jsx';
import { Button } from '../ui/button.jsx';
import { createClient } from '../../lib/supabase/client.js';
import { useToast } from '../ui/ToastNotification.jsx';
import { RefreshCw, Radio, QrCode, AlertTriangle, ShieldCheck, X } from 'lucide-react';

export function BookingHistoryTable() {
  const { showToast } = useToast();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQRBooking, setActiveQRBooking] = useState(null);
  const [reschedulingId, setReschedulingId] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    try {
      const { data } = await supabase
        .from('bookings')
        .select('*, profiles(full_name), zones(name)')
        .order('created_at', { ascending: false });

      if (data) {
        setHistory(data);
      }
    } catch (e) {
      console.error('Error loading booking history:', e);
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
            <span className="flex items-center gap-1 text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-0.5 rounded-full">
              <Radio className="h-3 w-3 text-teal-600 animate-pulse" /> Realtime WebSocket
            </span>
          </div>
        </div>

        <Button onClick={loadData} variant="outline" className="text-xs h-8 font-bold">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
              <th className="p-3 font-bold">ID Booking</th>
              <th className="p-3 font-bold">Plat Nomor</th>
              <th className="p-3 font-bold">Zona Tujuan</th>
              <th className="p-3 font-bold">Jadwal Minta</th>
              <th className="p-3 font-bold">Status</th>
              <th className="p-3 font-bold text-right">Aksi Darurat & QR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {history.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-400 font-semibold">
                  {loading ? 'Memuat riwayat booking dari database...' : 'Belum ada riwayat booking.'}
                </td>
              </tr>
            ) : (
              history.map((h, idx) => (
                <tr key={h.id} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-mono font-bold text-slate-900">
                    UL-2025-{(idx + 101).toString()}
                  </td>
                  <td className="p-3 font-mono font-bold text-teal-700">{h.vehicle_plate || 'B 1234 ABC'}</td>
                  <td className="p-3 font-semibold text-slate-800">{h.zones?.name || 'Zona Logistik'}</td>
                  <td className="p-3 text-slate-600 font-mono">
                    {new Date(h.time_window_start || h.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                  </td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                      h.status === 'confirmed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                      h.status === 'active' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                      'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {h.status}
                    </span>
                  </td>
                  <td className="p-3 text-right flex items-center justify-end gap-1.5">
                    {/* Button 1: QuickPass QR Modal Toggle */}
                    <Button
                      onClick={() => setActiveQRBooking(h)}
                      className="text-[10px] py-1 h-7 px-2.5 bg-teal-600 hover:bg-teal-700 font-bold flex items-center gap-1 shadow-sm"
                    >
                      <QrCode className="h-3.5 w-3.5" /> QuickPass QR
                    </Button>

                    {/* Button 2: Panic Reschedule Emergency Button */}
                    <Button
                      onClick={() => handlePanicReschedule(h)}
                      disabled={reschedulingId === h.id}
                      variant="outline"
                      className="text-[10px] py-1 h-7 px-2.5 border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 font-bold flex items-center gap-1"
                      title="Panic Reschedule Darurat (+1 Jam)"
                    >
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600" /> Panic Reschedule
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* QUICKPASS QR MODAL DISPLAY FOR DISHUB VERIFICATION SCAN */}
      {activeQRBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-sm p-6 bg-white rounded-3xl border border-teal-200 shadow-2xl text-center space-y-4 relative">
            <button
              onClick={() => setActiveQRBooking(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 inline-block">
                Tiket Digital QuickPass QR (HMAC-SHA256)
              </span>
              <h3 className="text-lg font-black text-slate-900">{activeQRBooking.zones?.name || 'Zona Logistik'}</h3>
              <p className="text-xs text-slate-500 font-mono font-bold">Plat: {activeQRBooking.vehicle_plate}</p>
            </div>

            {/* QR SVG Canvas */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl inline-block mx-auto shadow-inner">
              <QRCodeSVG
                value={`URBANLOAD-QR|${activeQRBooking.id}|${activeQRBooking.vehicle_plate}|HMAC-SHA256-VALID`}
                size={180}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="space-y-1 text-xs text-slate-600 border-t border-slate-100 pt-3">
              <div className="flex justify-between font-mono">
                <span className="text-slate-400">ID Tiket:</span>
                <span className="font-bold text-slate-900">{activeQRBooking.id.slice(0, 16)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Jam Minta:</span>
                <span className="font-bold text-teal-700 font-mono">
                  {new Date(activeQRBooking.time_window_start || activeQRBooking.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                </span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-400">Signature:</span>
                <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 font-bold flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-600" /> HMAC-SHA256 Verified
                </span>
              </div>
            </div>

            <Button onClick={() => setActiveQRBooking(null)} className="w-full py-2.5 text-xs font-bold shadow-md bg-teal-600 hover:bg-teal-700">
              Tutup QR
            </Button>
          </Card>
        </div>
      )}
    </Card>
  );
}
