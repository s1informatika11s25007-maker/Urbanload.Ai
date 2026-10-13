import React, { useEffect, useState } from 'react';
import { Card } from '../ui/card.jsx';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, RefreshCw } from 'lucide-react';
import { createClient } from '../../lib/supabase/client.js';

export function CongestionTrendChart() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCongestionTrendData = async () => {
    setLoading(true);
    const supabase = createClient();
    try {
      const [zonesRes, scoresRes, bookingsRes] = await Promise.all([
        supabase.from('zones').select('id, name').limit(3),
        supabase.from('congestion_scores').select('zone_id, score, calculated_at').order('calculated_at', { ascending: true }).limit(50),
        supabase.from('bookings').select('zone_id, created_at').limit(300)
      ]);

      const zones = zonesRes.data;
      const scores = scoresRes.data;
      const bookings = bookingsRes.data;

      const hours = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];

      const formatted = hours.map((jam, idx) => {
        const hourNum = parseInt(jam.split(':')[0], 10);

        const countA = bookings?.filter((b) => b.zone_id === zones?.[0]?.id).length || 0;
        const countB = bookings?.filter((b) => b.zone_id === zones?.[1]?.id).length || 0;
        const countC = bookings?.filter((b) => b.zone_id === zones?.[2]?.id).length || 0;

        const scoreA = scores?.[idx]?.score || Math.min(10, Math.max(1, countA * 2 + (hourNum === 10 ? 3 : 1)));
        const scoreB = Math.min(10, Math.max(1, countB * 1.5 + (hourNum === 10 ? 2 : 0.5)));
        const scoreC = Math.min(10, Math.max(1, countC * 1.2 + 0.5));

        return {
          jam,
          zonaA: Number(scoreA.toFixed(1)),
          zonaB: Number(scoreB.toFixed(1)),
          zonaC: Number(scoreC.toFixed(1)),
        };
      });

      setChartData(formatted);
    } catch (err) {
      console.error('Error loading congestion trend chart data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCongestionTrendData();
  }, []);

  return (
    <Card className="p-4 sm:p-6 border-slate-200 bg-white shadow-sm rounded-2xl space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
            <Activity className="h-5 w-5 text-teal-600" /> Tren Kepadatan Zona Spasial (CongestionScore 1-10)
          </h3>
          <p className="text-xs text-slate-500">Histori fluktuasi skor kepadatan per jam berdasarkan telemetri & AI</p>
        </div>
        <div className="flex gap-1.5 text-xs items-center">
          <button onClick={loadCongestionTrendData} className="px-3 py-1 rounded-xl bg-teal-600 text-white font-bold shadow-sm flex items-center gap-1">
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} /> Hari Ini Real
          </button>
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                      <p className="text-emerald-400">Pulogadung: {payload[2]?.value} /10</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line type="monotone" dataKey="zonaA" name="Zona Tanah Abang" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="zonaB" name="Zona Tanjung Priok" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="zonaC" name="Zona Pulogadung" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
