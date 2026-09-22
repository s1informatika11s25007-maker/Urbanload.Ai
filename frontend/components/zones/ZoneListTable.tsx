'use client';

import { Card } from '../ui/card';
import { Button } from '../ui/button';

export function ZoneListTable() {
  const zones = [
    { id: '1', name: 'Zona A - Pasar Tanah Abang', cap: 12, active: 11, score: 10, status: 'active' },
    { id: '2', name: 'Zona B - Monas & Gambir', cap: 15, active: 6, score: 4, status: 'active' },
    { id: '3', name: 'Zona C - Tanjung Priok Port', cap: 30, active: 5, score: 2, status: 'active' },
  ];

  return (
    <Card className="p-6">
      <h3 className="text-base font-bold text-slate-800 mb-4">Section 2 — Tabel Daftar Zona Logistik</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
              <th className="p-3 font-semibold">Nama Zona</th>
              <th className="p-3 font-semibold">Kapasitas Maks</th>
              <th className="p-3 font-semibold">Booking Aktif</th>
              <th className="p-3 font-semibold">Skor</th>
              <th className="p-3 font-semibold">Status</th>
              <th className="p-3 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {zones.map((z) => (
              <tr key={z.id} className="hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-900">{z.name}</td>
                <td className="p-3 text-slate-600">{z.cap} truk</td>
                <td className="p-3 text-slate-600">{z.active} truk</td>
                <td className="p-3 font-bold text-teal-700">{z.score}/10</td>
                <td className="p-3">
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    AKTIF
                  </span>
                </td>
                <td className="p-3 text-right space-x-2">
                  <Button variant="outline" className="text-xs py-1 px-2">Edit</Button>
                  <Button variant="ghost" className="text-xs py-1 px-2">Lihat Peta</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
