'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { fetchBookings } from '@/lib/api/bookings';

export function BookingHistoryTable({ isDemo = false }: { isDemo?: boolean }) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings()
      .then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          setHistory(res.data);
        } else if (isDemo) {
          setHistory([
            { id: 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', zone_name: 'Zona A - Pasar Tanah Abang', created_at: new Date().toISOString(), status: 'confirmed', notes: '[Data Contoh Evaluasi] Slot Bongkar Muat Tekstil Tanah Abang' },
            { id: 'aaaaaaaa-2222-2222-2222-aaaaaaaaaaaa', zone_name: 'Zona B - Kawasan Monas & Gambir', created_at: new Date(Date.now() - 86400000).toISOString(), status: 'completed', notes: '[Data Contoh Evaluasi] Slot Logistik Monas Selesai' },
          ]);
        } else {
          setHistory([]);
        }
      })
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [isDemo]);

  return (
    <Card className="p-6 border-slate-200 bg-white">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Riwayat Booking Slot Logistik</h3>
          <p className="text-xs text-slate-500">Query langsung dari database spatial <code className="font-mono text-teal-700">public.bookings</code></p>
        </div>
        {isDemo && (
          <span className="text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full">
            Sesi Guest Reviewer (Data Contoh Evaluasi)
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
              <th className="p-3 font-semibold">ID Booking</th>
              <th className="p-3 font-semibold">Zona Logistik</th>
              <th className="p-3 font-semibold">Waktu Pembuatan</th>
              <th className="p-3 font-semibold">Catatan Evaluasi</th>
              <th className="p-3 font-semibold">Status</th>
              <th className="p-3 font-semibold text-right">Aksi Real-time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-400 text-xs">
                  Memuat data riwayat transaksi...
                </td>
              </tr>
            ) : history.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500 text-xs">
                  Belum ada riwayat booking. Buat booking baru untuk menyimpan transaksi pertama Anda!
                </td>
              </tr>
            ) : (
              history.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-semibold text-slate-900">{h.id.slice(0, 18)}...</td>
                  <td className="p-3 font-semibold text-slate-800">{h.zone_name || h.zoneName || 'Zona A - Pasar Tanah Abang'}</td>
                  <td className="p-3 text-slate-500">{new Date(h.created_at || Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="p-3 text-slate-600 font-mono text-[11px]">{h.notes || '-'}</td>
                  <td className="p-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        h.status === 'confirmed'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : h.status === 'completed'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {(h.status || 'confirmed').toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <Link href={`/rider/bookings/${h.id}/qr`}>
                      <Button variant="outline" className="text-xs py-1 px-2.5">
                        Lihat QR Live
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
