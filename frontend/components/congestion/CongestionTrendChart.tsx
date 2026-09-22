'use client';

import { Card } from '../ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function CongestionTrendChart() {
  const data = [
    { jam: '00:00', zonaA: 1, zonaB: 1, zonaC: 1 },
    { jam: '04:00', zonaA: 2, zonaB: 1, zonaC: 1 },
    { jam: '08:00', zonaA: 6, zonaB: 3, zonaC: 2 },
    { jam: '12:00', zonaA: 10, zonaB: 5, zonaC: 3 },
    { jam: '16:00', zonaA: 8, zonaB: 4, zonaC: 2 },
    { jam: '20:00', zonaA: 4, zonaB: 2, zonaC: 1 },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">Section 2 — Grafik Tren Kepadatan Zona</h3>
          <p className="text-xs text-slate-500">Line chart multi-series per zona (00:00 – 23:00)</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded bg-teal-50 text-teal-700 text-xs font-semibold">Hari Ini</button>
          <button className="px-3 py-1 rounded bg-slate-100 text-slate-600 text-xs font-semibold">7 Hari</button>
          <button className="px-3 py-1 rounded bg-slate-100 text-slate-600 text-xs font-semibold">30 Hari</button>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="jam" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="zonaA" name="Zona A (Tanah Abang)" stroke="#ef4444" strokeWidth={3} />
            <Line type="monotone" dataKey="zonaB" name="Zona B (Monas)" stroke="#eab308" strokeWidth={2} />
            <Line type="monotone" dataKey="zonaC" name="Zona C (Tg. Priok)" stroke="#22c55e" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
