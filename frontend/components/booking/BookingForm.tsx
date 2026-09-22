'use client';

import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { TruckDimensionInput } from './TruckDimensionInput';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export function BookingForm({ onCheckSlot }: { onCheckSlot: (data: any) => void }) {
  const [zoneId, setZoneId] = useState('11111111-1111-1111-1111-111111111111');
  const [licensePlate, setLicensePlate] = useState('B 1234 XYZ');
  const [dim, setDim] = useState({ lengthCm: 800, widthCm: 220, heightCm: 320, weightKg: 8000 });
  const [date, setDate] = useState('2025-10-15');
  const [timeStart, setTimeStart] = useState('14:00');
  const [timeEnd, setTimeEnd] = useState('15:00');
  const [notes, setNotes] = useState('');

  const isValidDimension = dim.lengthCm <= 1000 && dim.weightKg <= 12000;
  const isConflict = false;
  const isOpen = true;

  const handleCheck = () => {
    onCheckSlot({ zoneId, licensePlate, dim, date, timeStart, timeEnd, notes });
  };

  return (
    <Card className="p-6 border-slate-200 shadow-sm bg-white">
      <h3 className="text-base font-bold text-slate-900 mb-4">Section 1 — Form Input Booking</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kolom Kiri: Data Truk */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-teal-700 border-b border-slate-200 pb-2 uppercase tracking-wider">Kolom Kiri — Data Truk</h4>

          <div>
            <label className="text-xs font-semibold text-slate-700">Pilih Zona Logistik</label>
            <select
              value={zoneId}
              onChange={(e) => setZoneId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-600 mt-1"
            >
              <option value="11111111-1111-1111-1111-111111111111">Zona A - Pasar Tanah Abang (Kapasitas: 12 Truk)</option>
              <option value="22222222-2222-2222-2222-222222222222">Zona B - Monas & Gambir (Kapasitas: 15 Truk)</option>
              <option value="33333333-3333-3333-3333-333333333333">Zona C - Tanjung Priok Port (Kapasitas: 30 Truk)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Nomor Polisi Truk</label>
            <input
              type="text"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
              placeholder="Contoh: B 1234 XYZ"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 font-mono uppercase focus:outline-none focus:border-teal-600 mt-1"
            />
          </div>

          <TruckDimensionInput
            lengthCm={dim.lengthCm}
            widthCm={dim.widthCm}
            heightCm={dim.heightCm}
            weightKg={dim.weightKg}
            onChange={(fields) => setDim((prev) => ({ ...prev, ...fields }))}
          />

          <div>
            <label className="text-xs font-semibold text-slate-700">Upload STNK (Opsional)</label>
            <input type="file" className="w-full text-xs text-slate-500 mt-1 border border-slate-200 bg-slate-50 rounded-xl p-2" />
          </div>
        </div>

        {/* Kolom Kanan: Jendela Waktu */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-teal-700 border-b border-slate-200 pb-2 uppercase tracking-wider">Kolom Kanan — Jendela Waktu</h4>

          <div>
            <label className="text-xs font-semibold text-slate-700">Pilih Tanggal Booking</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-600 mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Jam Mulai</label>
              <input
                type="time"
                value={timeStart}
                onChange={(e) => setTimeStart(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-600 mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Jam Selesai</label>
              <input
                type="time"
                value={timeEnd}
                onChange={(e) => setTimeEnd(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-600 mt-1"
              />
            </div>
          </div>

          <div className="rounded-xl bg-teal-50 p-3 border border-teal-100 text-xs text-teal-800 font-medium">
            <strong>Duration Indicator:</strong> Durasi estimasi 1 jam operasional bongkar muat.
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Catatan Tambahan (Max 200 Karakter)</label>
            <textarea
              maxLength={200}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instruksi khusus muatan..."
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-600 mt-1 h-20"
            />
          </div>
        </div>
      </div>

      {/* Validasi Real-time Inline */}
      <div className="mt-6 rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-2 text-xs">
        <div className="font-bold text-slate-800 mb-1">Status Validasi Real-time:</div>
        <div className="flex items-center gap-2 text-emerald-700 font-medium">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Dimensi truk ≤ kapasitas maksimum zona</span>
        </div>
        {!isConflict ? (
          <div className="flex items-center gap-2 text-emerald-700 font-medium">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Slot tidak bentrok dengan booking lain</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-amber-700 font-medium">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>Slot bentrok dengan booking lain</span>
          </div>
        )}
        {isOpen ? (
          <div className="flex items-center gap-2 text-emerald-700 font-medium">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Zona buka pada jam operasional</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-rose-700 font-medium">
            <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>Zona tutup pada jam tersebut</span>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleCheck} disabled={!isValidDimension}>
          Cek Ketersediaan Slot
        </Button>
      </div>
    </Card>
  );
}
