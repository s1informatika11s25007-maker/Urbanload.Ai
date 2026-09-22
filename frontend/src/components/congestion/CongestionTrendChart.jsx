import React from 'react';
import { Card } from '../ui/card.jsx';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';

export function CongestionTrendChart() {
  const data = [
    { jam: '00:00', zonaA: 1.2, zonaB: 1.0, zonaC: 1.1 },
    { jam: '04:00', zonaA: 2.1, zonaB: 1.5, zonaC: 1.2 },
    { jam: '08:00', zonaA: 6.8, zonaB: 4.2, zonaC: 3.1 },
    { jam: '10:00', zonaA: 8.8, zonaB: 6.4, zonaC: 3.2 },
    { jam: '12:00', zonaA: 9.2, zonaB: 5.8, zonaC: 3.8 },
    { jam: '16:00', zonaA: 7.9, zonaB: 5.1, zonaC: 2.9 },
    { jam: '20:00', zonaA: 4.5, zonaB: 2.8, zonaC: 1.8 },
  ];

  return (
    <Card className="p-4 sm:p-6 border-slate-200 bg-white shadow-sm rounded-2xl space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
            <Activity className="h-5 w-5 text-teal-600" /> Tren Kepadatan Zona Spasial (CongestionScore 1-10)
          </h3>
          <p className="text-xs text-slate-500">Histori fluktuasi skor kepadatan per jam berdasarkan telemetri & AI</p>
        </div>
        <div className="flex gap-1.5 text-xs">
          <button className="px-3 py-1 rounded-xl bg-teal-600 text-white font-bold shadow-sm">Hari Ini</button>
          <button className="px-3 py-1 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200">7 Hari</button>
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="jam" tick={{ fontSize: 10, fill: '#64748b' }} />
            <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: '#64748b' }} unit=" /10" />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="p-2.5 bg-slate-900 text-white text-xs rounded-xl shadow-xl font-mono space-y-1">
                      <p className="font-bold border-b border-slate-800 pb-1">Jam {label} WIB</p>
                      <p className="text-rose-400">Tanah Abang: {payload[0]?.value} /10</p>
                      <p className="text-amber-400">Tanjung Priok: {payload[1]?.value} /10</p>
                      <p className="text-emerald-400">Sudirman: {payload[2]?.value} /10</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line type="monotone" dataKey="zonaA" name="Zona Tanah Abang" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="zonaB" name="Zona Tanjung Priok" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="zonaC" name="Zona Sudirman" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
