'use client';

import { Card } from '../ui/card';
import { Button } from '../ui/button';

interface Slot {
  time: string;
  remainingCapacity: number;
  maxDimension: string;
  status: 'available' | 'almost_full' | 'full' | 'closed';
}

export function SlotAvailabilityTable({ onSelectSlot }: { onSelectSlot: (slot: Slot) => void }) {
  const slots: Slot[] = [
    { time: '08:00 - 09:00', remainingCapacity: 8, maxDimension: '12m x 2.5m x 3.8m', status: 'available' },
    { time: '09:00 - 10:00', remainingCapacity: 2, maxDimension: '12m x 2.5m x 3.8m', status: 'almost_full' },
    { time: '10:00 - 11:00', remainingCapacity: 0, maxDimension: '12m x 2.5m x 3.8m', status: 'full' },
    { time: '11:00 - 12:00', remainingCapacity: 10, maxDimension: '12m x 2.5m x 3.8m', status: 'available' },
    { time: '12:00 - 13:00', remainingCapacity: 12, maxDimension: '12m x 2.5m x 3.8m', status: 'available' },
    { time: '13:00 - 14:00', remainingCapacity: 5, maxDimension: '12m x 2.5m x 3.8m', status: 'available' },
    { time: '14:00 - 15:00', remainingCapacity: 1, maxDimension: '12m x 2.5m x 3.8m', status: 'almost_full' },
    { time: '22:00 - 23:00', remainingCapacity: 0, maxDimension: '12m x 2.5m x 3.8m', status: 'closed' },
  ];

  const getStatusBadge = (status: Slot['status']) => {
    switch (status) {
      case 'available':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Tersedia
          </span>
        );
      case 'almost_full':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span> Hampir Penuh (&lt;20%)
          </span>
        );
      case 'full':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span> Penuh / Bentrok
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span> Di Luar Operasional
          </span>
        );
    }
  };

  return (
    <Card className="p-6 border-slate-200 bg-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">Section 2 — Tabel Ketersediaan Slot</h3>
          <p className="text-xs text-slate-500 font-mono mt-0.5">Endpoint: GET /api/v1/zones/&#123;id&#125;/available-slots</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="text-xs py-1">Hari Ini</Button>
          <Button variant="outline" className="text-xs py-1">Besok</Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
              <th className="p-3 font-semibold">Jam</th>
              <th className="p-3 font-semibold">Sisa Kapasitas</th>
              <th className="p-3 font-semibold">Dimensi Maks</th>
              <th className="p-3 font-semibold">Status</th>
              <th className="p-3 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {slots.map((s, idx) => (
              <tr
                key={idx}
                onClick={() => s.status !== 'closed' && s.status !== 'full' && onSelectSlot(s)}
                className={`hover:bg-slate-50 cursor-pointer transition ${
                  s.status === 'available' ? 'bg-emerald-50/20' : s.status === 'almost_full' ? 'bg-amber-50/20' : ''
                }`}
              >
                <td className="p-3 font-semibold text-slate-900">{s.time}</td>
                <td className="p-3 text-slate-600">{s.remainingCapacity} truk</td>
                <td className="p-3 text-slate-600 font-mono">{s.maxDimension}</td>
                <td className="p-3">{getStatusBadge(s.status)}</td>
                <td className="p-3 text-right">
                  <Button
                    variant={s.status === 'available' ? 'default' : 'outline'}
                    disabled={s.status === 'full' || s.status === 'closed'}
                    className="text-xs py-1 px-3"
                  >
                    Pilih Slot
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
