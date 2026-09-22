import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { createClient } from '../lib/supabase/client.js';
import { Activity, Radio, MapPin, RefreshCw, Cpu, ArrowRight, ShieldCheck } from 'lucide-react';

const CongestionTrendChart = lazy(() => import('../components/congestion/CongestionTrendChart.jsx').then((m) => ({ default: m.CongestionTrendChart })));

export default function RiderCongestion() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCongestionData = async () => {
    setLoading(true);
    const supabase = createClient();

    try {
      // Fetch real zones and active bookings from Supabase
      const { data: zonesData } = await supabase.from('zones').select('*').order('created_at', { ascending: false });
      const { data: bookingsData } = await supabase.from('bookings').select('zone_id, status');

      if (zonesData) {
        const mapped = zonesData.map((z) => {
          const zoneBookings = bookingsData ? bookingsData.filter((b) => b.zone_id === z.id) : [];
          const activeCount = zoneBookings.length;
          const maxCap = z.max_truck_capacity || 10;
          const ratio = activeCount / maxCap;
          const score = Math.round(Math.min(9.8, Math.max(1.2, ratio * 10 || 3.5)) * 10) / 10;

          return {
            id: z.id,
            name: z.name,
            score,
            activeTrucks: activeCount,
            capacity: maxCap,
            statusLabel: score >= 7.5 ? 'Macet Parah' : score >= 5.0 ? 'Sedang' : 'Lancar',
            color: score >= 7.5 ? '#ef4444' : score >= 5.0 ? '#f59e0b' : '#10b981',
          };
        });

        setZones(mapped);
      }
    } catch (err) {
      console.error('Error loading congestion data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCongestionData();

    const supabase = createClient();
    const channel = supabase
      .channel('rider_congestion_page_ch')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => loadCongestionData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-2">
        <div>
          <div className="text-xs text-slate-500 mb-1">
            <Link to="/rider/dashboard" className="hover:underline">Dashboard</Link> / <span className="font-semibold text-slate-700">Kepadatan</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Activity className="h-6 w-6 text-teal-600" /> Dashboard Kepadatan & CongestionScore Real-Time
          </h1>
          <p className="text-xs text-slate-500">
            Pemantauan skor kepadatan zona (1.0 - 10.0) berbasis AI GroqLogix & telemetri real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={loadCongestionData} variant="outline" className="text-xs flex items-center gap-1 font-bold">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
          </Button>
          <Link to="/city/livemap">
            <Button className="text-xs py-2 px-4 flex items-center gap-1.5 shadow-md bg-teal-600 hover:bg-teal-700 font-bold">
              Buka LiveMap Spasial <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid Status Kepadatan Zona Realtime */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {zones.length === 0 ? (
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 p-8 text-center text-xs text-slate-400">
            {loading ? 'Memuat data skor kepadatan zona real...' : 'Belum ada data zona di database.'}
          </div>
        ) : (
          zones.map((z) => (
            <Card key={z.id} className="p-5 border-slate-200 bg-white shadow-sm rounded-2xl space-y-3 hover:border-teal-500 transition">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 font-mono uppercase block">Zona Logistik</span>
                  <h3 className="font-black text-sm text-slate-900">{z.name}</h3>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-black font-mono border" style={{ backgroundColor: `${z.color}15`, color: z.color, borderColor: `${z.color}40` }}>
                  {z.score} / 10
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Status Kepadatan:</span>
                  <span className="font-extrabold" style={{ color: z.color }}>{z.statusLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Truk Aktif / Kapasitas:</span>
                  <span className="font-mono font-bold text-slate-800">{z.activeTrucks} / {z.capacity} Slot</span>
                </div>
              </div>

              <Link to="/rider/bookings/new" className="block pt-1">
                <Button variant="outline" className="w-full text-xs py-1.5 font-bold">
                  Pesan Slot di Zona Ini
                </Button>
              </Link>
            </Card>
          ))
        )}
      </div>

      {/* Grafik Tren Kepadatan */}
      <Suspense fallback={<div className="p-6 text-center text-xs text-slate-400">Memuat Grafik Tren Kepadatan...</div>}>
        <CongestionTrendChart />
      </Suspense>
    </div>
  );
}
