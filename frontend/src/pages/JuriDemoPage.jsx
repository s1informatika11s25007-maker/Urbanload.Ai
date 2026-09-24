import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { QRCodeSVG } from 'qrcode.react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { useToast } from '../components/ui/ToastNotification.jsx';
import {
  Award,
  Truck,
  ShieldCheck,
  QrCode,
  AlertTriangle,
  Play,
  RotateCcw,
  RotateCw,
  Compass,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Layers,
  Globe,
  Box,
  Radio,
  MapPin,
  CheckCircle2,
  X,
  Zap,
  BarChart3,
  RefreshCw,
  Navigation,
} from 'lucide-react';

// Isolated Mock Data for Jury Review (100% Safe - No Database Mutation)
const DEMO_ZONES = [
  { id: 'demo-z1', name: 'Zona A - Pasar Tanah Abang', cap: 15, active: 13, score: 8.8, color: '#ef4444', poly: [[[106.812, -6.185], [106.822, -6.185], [106.822, -6.195], [106.812, -6.195], [106.812, -6.185]]] },
  { id: 'demo-z2', name: 'Zona B - Pelabuhan Tanjung Priok', cap: 35, active: 22, score: 6.2, color: '#f59e0b', poly: [[[106.870, -6.105], [106.892, -6.105], [106.892, -6.125], [106.870, -6.125], [106.870, -6.105]]] },
  { id: 'demo-z3', name: 'Zona C - Koridor Sudirman-Thamrin', cap: 20, active: 7, score: 3.5, color: '#10b981', poly: [[[106.818, -6.200], [106.828, -6.200], [106.823, -6.230], [106.813, -6.230], [106.818, -6.200]]] },
  { id: 'demo-z4', name: 'Zona D - Kelapa Gading Trade Center', cap: 18, active: 11, score: 5.8, color: '#f59e0b', poly: [[[106.895, -6.150], [106.915, -6.150], [106.915, -6.170], [106.895, -6.170], [106.895, -6.150]]] },
  { id: 'demo-z5', name: 'Zona E - Kawasan Industri Pulogadung', cap: 40, active: 31, score: 7.9, color: '#ef4444', poly: [[[106.910, -6.185], [106.932, -6.185], [106.932, -6.205], [106.910, -6.205], [106.910, -6.185]]] },
  { id: 'demo-z6', name: 'Zona F - Glodok Commercial Center', cap: 15, active: 4, score: 2.8, color: '#10b981', poly: [[[106.810, -6.138], [106.830, -6.138], [106.830, -6.155], [106.810, -6.155], [106.810, -6.138]]] },
];

const INITIAL_DEMO_VEHICLES = [
  { id: 'v1', plate: 'B 9812 UAI', type: 'Truk Box CDE', zone: 'Zona A - Pasar Tanah Abang', status: 'confirmed', lng: 106.817, lat: -6.190 },
  { id: 'v2', plate: 'B 9102 TPK', type: 'Truk Tronton Fuso', zone: 'Zona B - Pelabuhan Tanjung Priok', status: 'active', lng: 106.880, lat: -6.115 },
  { id: 'v3', plate: 'B 9482 CDE', type: 'Truk CDD Box', zone: 'Zona C - Koridor Sudirman', status: 'confirmed', lng: 106.822, lat: -6.215 },
  { id: 'v4', plate: 'B 9011 BUS', type: 'Bus Logistik Pemprov', zone: 'Zona D - Kelapa Gading', status: 'active', lng: 106.905, lat: -6.160 },
  { id: 'v5', plate: 'B 8821 TRK', type: 'Truk Kontainer 40ft', zone: 'Zona E - Pulogadung', status: 'confirmed', lng: 106.920, lat: -6.195 },
  { id: 'v6', plate: 'B 7712 FUSO', type: 'Truk Wingbox', zone: 'Zona B - Pelabuhan Tanjung Priok', status: 'active', lng: 106.885, lat: -6.110 },
  { id: 'v7', plate: 'B 9511 UAI', type: 'Truk Semen & Material', zone: 'Zona A - Pasar Tanah Abang', status: 'confirmed', lng: 106.815, lat: -6.188 },
  { id: 'v8', plate: 'B 8122 JKT', type: 'Bus Cargo Komersial', zone: 'Zona F - Glodok Center', status: 'completed', lng: 106.820, lat: -6.145 },
];

const DEMO_CHART_DATA = [
  { jam: '06.00', okupansi: 35 },
  { jam: '08.00', okupansi: 78 },
  { jam: '10.00', okupansi: 94 },
  { jam: '12.00', okupansi: 88 },
  { jam: '14.00', okupansi: 62 },
  { jam: '16.00', okupansi: 85 },
  { jam: '18.00', okupansi: 42 },
];

export default function JuriDemoPage() {
  const { showToast } = useToast();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const vehicleMarkersRef = useRef([]);

  const [mapMode, setMapMode] = useState('street');
  const [is3D, setIs3D] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeQRBooking, setActiveQRBooking] = useState(null);
  const [vehicles, setVehicles] = useState(INITIAL_DEMO_VEHICLES);
  const [geofenceChecked, setGeofenceChecked] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const VECTOR_STYLE = {
      version: 8,
      sources: {
        'osm-tiles': {
          type: 'raster',
          tiles: [
            'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
            'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
          ],
          tileSize: 256,
          maxzoom: 19,
        },
      },
      layers: [
        { id: 'bg', type: 'background', paint: { 'background-color': '#0f172a' } },
        { id: 'osm', type: 'raster', source: 'osm-tiles' },
      ],
    };

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: VECTOR_STYLE,
      center: [106.84, -6.17],
      zoom: 11.5,
      pitch: 55,
      bearing: -15,
      antialias: true,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

    map.on('load', () => {
      // Add 3D Extruded Zones
      const geojson = {
        type: 'FeatureCollection',
        features: DEMO_ZONES.map((z, idx) => ({
          type: 'Feature',
          properties: {
            id: z.id,
            name: z.name,
            capacity: z.cap,
            active: z.active,
            score: z.score,
            color: z.color,
            height: 40 + idx * 12,
          },
          geometry: { type: 'Polygon', coordinates: z.poly },
        })),
      };

      map.addSource('demo-zones-src', { type: 'geojson', data: geojson });

      map.addLayer({
        id: 'demo-zones-fill',
        type: 'fill',
        source: 'demo-zones-src',
        paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0.35 },
      });

      map.addLayer({
        id: 'demo-zones-extrusion',
        type: 'fill-extrusion',
        source: 'demo-zones-src',
        paint: {
          'fill-extrusion-color': ['get', 'color'],
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.55,
        },
      });

      map.on('click', 'demo-zones-fill', (e) => {
        if (e.features && e.features[0]) {
          const p = e.features[0].properties;
          setSelectedItem({
            title: p.name,
            subtitle: `Skor Kepadatan: ${p.score} / 10`,
            details: `Kapasitas: ${p.active} / ${p.capacity} Slot Truk Terisi`,
            type: 'Zona Logistik Realtime',
            color: p.color,
          });
        }
      });
    });

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Render Vehicles Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    vehicleMarkersRef.current.forEach((m) => m.remove());
    vehicleMarkersRef.current = [];

    vehicles.forEach((v) => {
      const el = document.createElement('div');
      el.className = 'group cursor-pointer';

      const statusColor = v.status === 'confirmed' ? '#10b981' : v.status === 'active' ? '#3b82f6' : '#f59e0b';

      el.innerHTML = `
        <div className="flex items-center gap-1.5 bg-slate-900/95 text-white px-2.5 py-1 rounded-full border border-teal-400 shadow-2xl backdrop-blur-md transition-transform duration-200 hover:scale-110">
          <span className="h-2 w-2 rounded-full animate-ping" style="background-color: ${statusColor}"></span>
          <span className="text-[10px] font-mono font-black">${v.plate}</span>
        </div>
      `;

      el.addEventListener('click', () => {
        setSelectedItem({
          title: `Kendaraan: ${v.plate}`,
          subtitle: `Tipe: ${v.type} | Status: ${v.status}`,
          details: `Lokasi: ${v.zone}`,
          type: 'Armada Logistik Aktif',
          color: statusColor,
        });
      });

      const marker = new maplibregl.Marker({ element: el }).setLngLat([v.lng, v.lat]).addTo(map);
      vehicleMarkersRef.current.push(marker);
    });
  }, [vehicles]);

  // Action 1: Panic Reschedule Test
  const handlePanicRescheduleDemo = (v) => {
    setVehicles((prev) =>
      prev.map((item) => (item.id === v.id ? { ...item, status: 'rescheduled' } : item))
    );
    showToast({
      title: 'Panic Reschedule Berhasil!',
      message: `Jadwal ${v.plate} digeser +1 jam otomatis untuk menghindari penumpukan bahu jalan.`,
      type: 'warning',
    });
  };

  // Action 2: Geofence Check Test
  const handleTestGeofence = () => {
    setGeofenceChecked(true);
    showToast({
      title: 'TrustGuard GeoCheck-In Valid',
      message: 'Truk B 9812 UAI terverifikasi presisi di dalam radius 20m Zona A Tanah Abang.',
      type: 'success',
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 font-sans text-slate-900">
      {/* Banner Sesi Demo Juri Lomba */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-teal-500/10 border-2 border-amber-400/60 text-slate-900 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              Mode Evaluasi Juri Lomba — Sandbox Demo Terisolasi
            </h1>
            <p className="text-xs text-slate-600 font-semibold">
              Simulasi lengkap fitur tanpa mengubah data asli di database Supabase produksi.
            </p>
          </div>
        </div>

        <span className="bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full text-xs font-mono font-bold shrink-0">
          reviewer@urbanload.ai
        </span>
      </div>

      {/* 3D Map Showcase Panel */}
      <Card className="p-0 overflow-hidden relative bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl h-[480px]">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Top Left Layer Info */}
        <div className="absolute top-4 left-4 z-20 bg-slate-900/90 p-3 rounded-2xl border border-slate-800 text-white text-xs backdrop-blur-md space-y-1">
          <div className="font-extrabold text-teal-400 flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5 text-teal-400 animate-pulse" /> Peta Spasial Live 3D (Simulasi Juri)
          </div>
          <p className="text-[10px] text-slate-300">
            6 Zona PostGIS & 8+ Armada Truk/Bus Terhubung
          </p>
        </div>

        {/* Selected Popup Modal */}
        {selectedItem && (
          <div className="absolute top-16 left-4 z-30 bg-slate-900/95 p-4 rounded-2xl border border-teal-500/40 text-white text-xs w-72 space-y-2 backdrop-blur-xl shadow-2xl animate-in fade-in">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-[10px] font-mono text-teal-400 font-bold uppercase">{selectedItem.type}</span>
              <button onClick={() => setSelectedItem(null)} className="text-slate-400 font-bold">×</button>
            </div>
            <h3 className="font-black text-sm text-white">{selectedItem.title}</h3>
            <p className="text-xs text-slate-300 font-semibold">{selectedItem.subtitle}</p>
            <p className="text-[11px] text-teal-300 font-mono">{selectedItem.details}</p>
          </div>
        )}
      </Card>

      {/* Interactive Feature Testing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: QuickPass QR Scanner Test */}
        <Card className="p-6 border-slate-200 bg-white rounded-3xl shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <QrCode className="h-5 w-5 text-emerald-600" /> Uji QuickPass QR Digital
              </h3>
              <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                HMAC-SHA256
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              Uji pembentukan tiket digital QR terenkripsi yang digunakan petugas Dishub saat memeriksa truk di lokasi.
            </p>
          </div>

          <Button
            onClick={() =>
              setActiveQRBooking({
                id: 'UL-DEMO-2025-QR',
                plate: 'B 9812 UAI',
                zone: 'Zona A - Pasar Tanah Abang',
                time: '10:00 WIB',
              })
            }
            className="w-full py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md"
          >
            Buka Simulasi QuickPass QR
          </Button>
        </Card>

        {/* Card 2: Panic Reschedule Test */}
        <Card className="p-6 border-slate-200 bg-white rounded-3xl shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" /> Uji Panic Reschedule
              </h3>
              <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-300">
                Emergency Shift
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              Simulasi pergeseran jadwal otomatis (+1 Jam) ketika armada kurir terjebak kemacetan parah di jalan.
            </p>
          </div>

          <Button
            onClick={() => handlePanicRescheduleDemo(vehicles[0])}
            variant="outline"
            className="w-full py-2.5 text-xs font-bold border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-xl"
          >
            Simulasi Panic Reschedule (+1 Jam)
          </Button>
        </Card>

        {/* Card 3: GeoFence Verification Test */}
        <Card className="p-6 border-slate-200 bg-white rounded-3xl shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-teal-600" /> Uji GeoFence Check-In
              </h3>
              <span className="text-[10px] font-mono font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded border border-teal-300">
                Radius &lt;20m
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              Simulasi validasi lokasi GPS presisi PostGIS untuk mengunci tombol check-in jika truk berada di luar radius.
            </p>
          </div>

          <Button
            onClick={handleTestGeofence}
            className="w-full py-2.5 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md"
          >
            Uji GeoCheck-In Presisi
          </Button>
        </Card>
      </div>

      {/* BayUtilization Analytics Chart Showcase */}
      <Card className="p-6 border-slate-200 bg-white rounded-3xl shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-teal-600" /> BayUtilization Tracker (Simulasi Realtime)
            </h3>
            <p className="text-xs text-slate-500 font-semibold">
              Persentase penggunaan slot bongkar muat (% okupansi) sepanjang hari
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-teal-800 bg-teal-100 px-3 py-1 rounded-full border border-teal-200">
            Peak: 94% (Jam 10.00)
          </span>
        </div>

        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={DEMO_CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="demoAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis dataKey="jam" tick={{ fontSize: 10, fill: '#475569' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#475569' }} unit="%" />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="p-2.5 bg-slate-900 text-white text-xs rounded-xl shadow-xl font-mono">
                        <p className="font-bold">Jam {label} WIB</p>
                        <p className="text-teal-300">Okupansi Bay: {payload[0]?.value}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="okupansi" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#demoAreaGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* QUICKPASS QR MODAL DISPLAY FOR JURY */}
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
              <span className="text-[10px] font-black uppercase text-teal-800 bg-teal-100 px-3 py-1 rounded-full border border-teal-200 inline-block">
                Tiket Digital QuickPass QR (HMAC-SHA256)
              </span>
              <h3 className="text-lg font-black text-slate-900">{activeQRBooking.zone}</h3>
              <p className="text-xs text-slate-600 font-mono font-bold">Plat: {activeQRBooking.plate}</p>
            </div>

            {/* QR SVG Canvas */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl inline-block mx-auto shadow-inner">
              <QRCodeSVG
                value={`URBANLOAD-QR|${activeQRBooking.id}|${activeQRBooking.plate}|HMAC-SHA256-VALID`}
                size={180}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="space-y-1 text-xs text-slate-600 border-t border-slate-100 pt-3 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">ID Tiket:</span>
                <span className="font-bold text-slate-900">{activeQRBooking.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Jam Minta:</span>
                <span className="font-bold text-teal-700">{activeQRBooking.time}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-400">Signature:</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded border border-emerald-300 font-bold flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-600" /> HMAC-SHA256 Verified
                </span>
              </div>
            </div>

            <Button onClick={() => setActiveQRBooking(null)} className="w-full py-2.5 text-xs font-bold shadow-md bg-teal-600 hover:bg-teal-700 text-white rounded-xl">
              Tutup QR
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
