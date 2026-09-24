import React, { useEffect, useRef, useState } from 'react';
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
  Globe,
  Radio,
  MapPin,
  CheckCircle2,
  X,
  Zap,
  BarChart3,
  Scan,
  Cpu,
  Clock,
  Activity,
  Fuel,
  StopCircle,
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

// Linear Road Polyline Waypoints for Realistic Straight Movement Along Real Streets
const ROUTED_DEMO_VEHICLES = [
  {
    id: 'v1',
    plate: 'B 9812 UAI',
    type: 'Truk Box CDE',
    origin: 'Stasiun Tanah Abang (106.8115, -6.1865)',
    destination: 'Bay 3 - Pasar Tanah Abang (106.8218, -6.1928)',
    condition: '🛑 Lampu Merah Kebon Jati (Berhenti 45dtk)',
    isStopped: true,
    distanceRemaining: '0.6 km',
    eta: '2 min',
    status: 'confirmed',
    waypoints: [
      [106.8122, -6.1855],
      [106.8155, -6.1882],
      [106.8188, -6.1905],
      [106.8218, -6.1928],
    ],
  },
  {
    id: 'v2',
    plate: 'B 9102 TPK',
    type: 'Truk Tronton Fuso',
    origin: 'Gerbang Tol Yos Sudarso (106.8710, -6.1100)',
    destination: 'Dermaga 3 Tanjung Priok (106.8915, -6.1220)',
    condition: '⛽ SPBU Pertamina (Berhenti Isi Bensin)',
    isStopped: true,
    distanceRemaining: '1.2 km',
    eta: '4 min',
    status: 'active',
    waypoints: [
      [106.8710, -6.1100],
      [106.8790, -6.1140],
      [106.8860, -6.1180],
      [106.8915, -6.1220],
    ],
  },
  {
    id: 'v3',
    plate: 'B 9482 CDE',
    type: 'Truk CDD Box',
    origin: 'Semanggi Flyover (106.8185, -6.2180)',
    destination: 'Monas South Hub (106.8270, -6.1820)',
    condition: '⚠️ Padat Macet Jam Kerja (Slow 15 km/h)',
    isStopped: false,
    distanceRemaining: '1.8 km',
    eta: '7 min',
    status: 'confirmed',
    waypoints: [
      [106.8185, -6.2180],
      [106.8215, -6.2100],
      [106.8235, -6.1980],
      [106.8270, -6.1820],
    ],
  },
  {
    id: 'v4',
    plate: 'B 9011 BUS',
    type: 'Bus Logistik Pemprov',
    origin: 'Sunter Bypass (106.8910, -6.1520)',
    destination: 'Kelapa Gading Trade Center (106.9110, -6.1660)',
    condition: '🟢 Moving Smoothly di Jalur Utama',
    isStopped: false,
    distanceRemaining: '2.5 km',
    eta: '8 min',
    status: 'active',
    waypoints: [
      [106.8910, -6.1520],
      [106.9010, -6.1590],
      [106.9110, -6.1660],
    ],
  },
  {
    id: 'v5',
    plate: 'B 8821 TRK',
    type: 'Truk Kontainer 40ft',
    origin: 'Gerbang Tol Pulogadung (106.9120, -6.1860)',
    destination: 'Kawasan Industri Pulogadung (106.9310, -6.2020)',
    condition: '🟢 Moving to Target Bay',
    isStopped: false,
    distanceRemaining: '1.1 km',
    eta: '5 min',
    status: 'confirmed',
    waypoints: [
      [106.9120, -6.1860],
      [106.9210, -6.1940],
      [106.9310, -6.2020],
    ],
  },
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

function lerp(start, end, t) {
  return start + (end - start) * t;
}

function getPointAlongPolyline(waypoints, progress) {
  const numSegments = waypoints.length - 1;
  const totalProgress = progress * numSegments;
  const segmentIndex = Math.min(Math.floor(totalProgress), numSegments - 1);
  const segmentT = totalProgress - segmentIndex;

  const p1 = waypoints[segmentIndex];
  const p2 = waypoints[segmentIndex + 1];

  return [
    lerp(p1[0], p2[0], segmentT),
    lerp(p1[1], p2[1], segmentT),
  ];
}

export default function JuriDemoPage() {
  const { showToast } = useToast();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const vehicleMarkersRef = useRef([]);
  const animFrameRef = useRef(null);

  const [activeTab, setActiveTab] = useState('map'); // 'map' | 'qr' | 'booking' | 'dashboard' | 'analytics' | 'geofence'
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeQRBooking, setActiveQRBooking] = useState(null);
  const [vehicles, setVehicles] = useState(ROUTED_DEMO_VEHICLES);

  // Form State for Demo SmartSlot Booking
  const [demoPlate, setDemoPlate] = useState('B 1234 DEMO');
  const [demoZone, setDemoZone] = useState('demo-z1');
  const [demoTime, setDemoTime] = useState('10.00');
  const [bookingResult, setBookingResult] = useState(null);

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

      // Add Subtle Dashed Polyline Route Lines on Map
      const routeGeoJSON = {
        type: 'FeatureCollection',
        features: ROUTED_DEMO_VEHICLES.map((v) => ({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: v.waypoints,
          },
        })),
      };

      map.addSource('demo-routes-src', { type: 'geojson', data: routeGeoJSON });

      map.addLayer({
        id: 'demo-routes-line',
        type: 'line',
        source: 'demo-routes-src',
        paint: {
          'line-color': '#14b8a6',
          'line-width': 2.5,
          'line-dasharray': [2, 2],
          'line-opacity': 0.65,
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

  // ANIMATED MOVING VEHICLES ALONG REAL LINEAR ROAD POLYLINES (STATIONARY AT SPBU & LAMPU MERAH)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    let progress = 0;
    let direction = 1;

    const animateVehiclesAlongRoads = () => {
      // Slow, realistic live tracking speed
      progress += 0.0006 * direction;
      if (progress >= 1) {
        progress = 1;
        direction = -1;
      } else if (progress <= 0) {
        progress = 0;
        direction = 1;
      }

      // Compute exact position along polylines for each vehicle
      const currentPosList = ROUTED_DEMO_VEHICLES.map((v) => {
        let lng, lat;

        if (v.isStopped) {
          // Stationary at SPBU or Lampu Merah waypoint stop
          lng = v.waypoints[1][0];
          lat = v.waypoints[1][1];
        } else {
          // Moving slowly along polyline
          const point = getPointAlongPolyline(v.waypoints, progress);
          lng = point[0];
          lat = point[1];
        }

        return {
          ...v,
          lng,
          lat,
        };
      });

      // Update markers
      if (vehicleMarkersRef.current.length === 0) {
        currentPosList.forEach((v) => {
          const el = document.createElement('div');
          el.className = 'group cursor-pointer flex flex-col items-center';

          const statusColor = v.status === 'confirmed' ? '#10b981' : v.status === 'active' ? '#3b82f6' : '#f59e0b';

          el.innerHTML = `
            <div className="bg-slate-900/95 text-amber-300 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border border-amber-400/50 shadow-md mb-1 whitespace-nowrap flex items-center gap-1">
              ${v.condition}
            </div>
            <div className="flex items-center gap-1.5 bg-slate-950 text-white px-2.5 py-1 rounded-full border-2 border-teal-400 shadow-2xl backdrop-blur-md transition-transform duration-200 hover:scale-110">
              <svg class="h-3.5 w-3.5 text-teal-400 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
                <path d="M15 18H9"/>
                <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-2.85-3.54A1 1 0 0 0 18.15 8H14"/>
                <circle cx="6.5" cy="17.5" r="2.5"/>
                <circle cx="16.5" cy="17.5" r="2.5"/>
              </svg>
              <span className="text-[10px] font-mono font-black">${v.plate}</span>
            </div>
          `;

          el.addEventListener('click', () => {
            setSelectedItem({
              title: `Armada Real: ${v.plate}`,
              subtitle: `Tipe: ${v.type} | Rute: ${v.origin} ➔ ${v.destination}`,
              details: `Kondisi Rute: ${v.condition} | Posisi: ${v.lng.toFixed(6)}, ${v.lat.toFixed(6)} | Sisa Jarak: ${v.distanceRemaining}`,
              type: 'Armada Logistik Aktif',
              color: statusColor,
            });
          });

          const marker = new maplibregl.Marker({ element: el }).setLngLat([v.lng, v.lat]).addTo(map);
          vehicleMarkersRef.current.push(marker);
        });
      } else {
        currentPosList.forEach((v, idx) => {
          if (vehicleMarkersRef.current[idx]) {
            vehicleMarkersRef.current[idx].setLngLat([v.lng, v.lat]);
          }
        });
      }

      animFrameRef.current = requestAnimationFrame(animateVehiclesAlongRoads);
    };

    animFrameRef.current = requestAnimationFrame(animateVehiclesAlongRoads);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

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
    showToast({
      title: 'TrustGuard GeoCheck-In Valid',
      message: 'Truk B 9812 UAI terverifikasi presisi di dalam radius 20m Zona A Tanah Abang.',
      type: 'success',
    });
  };

  // Action 3: SmartSlot Booking Test
  const handleRunDemoBooking = (e) => {
    e.preventDefault();
    const selectedZoneObj = DEMO_ZONES.find((z) => z.id === demoZone);

    setBookingResult({
      zoneName: selectedZoneObj?.name || 'Zona A - Pasar Tanah Abang',
      plate: demoPlate,
      requestedTime: demoTime,
      recommendedSlotTime: demoTime === '10.00' ? '10.30 WIB (Disarankan Rebalance)' : `${demoTime} WIB`,
      congestionScore: selectedZoneObj?.score || 8.8,
      status: 'confirmed',
    });

    showToast({
      title: 'SmartSlot AI Berhasil Dikonfirmasi!',
      message: `Slot booking ${demoPlate} di ${selectedZoneObj?.name} telah diterbitkan.`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 font-sans text-slate-900">
      {/* Banner Sesi Demo Juri Lomba */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-teal-500/10 border-2 border-amber-400/60 text-slate-900 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md">
            <Award className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-black text-slate-900 flex items-center gap-2">
              Mode Evaluasi Juri Lomba — Interactive Sandbox Demo
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-semibold">
              Terhubung sebagai Sesi Login Reviewer (reviewer@urbanload.ai) — Uji coba seluruh fitur aplikasi tanpa registrasi.
            </p>
          </div>
        </div>

        <span className="bg-amber-100 text-amber-900 border border-amber-300 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold shrink-0">
          Sesi Evaluator: reviewer@urbanload.ai
        </span>
      </div>

      {/* FEATURE NAVIGATION TABS FOR JURY */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold no-scrollbar">
        <button
          onClick={() => setActiveTab('map')}
          className={`px-4 py-2.5 rounded-2xl transition flex items-center gap-1.5 shrink-0 shadow-sm ${
            activeTab === 'map' ? 'bg-teal-600 text-white shadow-teal-600/30 font-black' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Globe className="h-4 w-4" /> 1. Peta Live 3D & Animasi Rute Real
        </button>

        <button
          onClick={() => setActiveTab('qr')}
          className={`px-4 py-2.5 rounded-2xl transition flex items-center gap-1.5 shrink-0 shadow-sm ${
            activeTab === 'qr' ? 'bg-teal-600 text-white shadow-teal-600/30 font-black' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <QrCode className="h-4 w-4" /> 2. Barcode QuickPass QR
        </button>

        <button
          onClick={() => setActiveTab('booking')}
          className={`px-4 py-2.5 rounded-2xl transition flex items-center gap-1.5 shrink-0 shadow-sm ${
            activeTab === 'booking' ? 'bg-teal-600 text-white shadow-teal-600/30 font-black' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Cpu className="h-4 w-4" /> 3. SmartSlot Booking AI
        </button>

        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2.5 rounded-2xl transition flex items-center gap-1.5 shrink-0 shadow-sm ${
            activeTab === 'dashboard' ? 'bg-teal-600 text-white shadow-teal-600/30 font-black' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Truck className="h-4 w-4" /> 4. Dashboard & Panic Button
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 rounded-2xl transition flex items-center gap-1.5 shrink-0 shadow-sm ${
            activeTab === 'analytics' ? 'bg-teal-600 text-white shadow-teal-600/30 font-black' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="h-4 w-4" /> 5. Grafik BayUtilization
        </button>

        <button
          onClick={() => setActiveTab('geofence')}
          className={`px-4 py-2.5 rounded-2xl transition flex items-center gap-1.5 shrink-0 shadow-sm ${
            activeTab === 'geofence' ? 'bg-teal-600 text-white shadow-teal-600/30 font-black' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="h-4 w-4" /> 6. GeoFence Telemetri
        </button>
      </div>

      {/* TAB 1: PETA SPASIAL LIVE 3D WITH ANIMATED MOVING VEHICLES & REAL ROUTES */}
      {activeTab === 'map' && (
        <Card className="p-0 overflow-hidden relative bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl h-[540px]">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Floating Top Left Layer Info */}
          <div className="absolute top-4 left-4 z-20 bg-slate-900/90 p-3 rounded-2xl border border-slate-800 text-white text-xs backdrop-blur-md space-y-1">
            <div className="font-extrabold text-teal-400 flex items-center gap-1.5">
              <Radio className="h-3.5 w-3.5 text-teal-400 animate-pulse" /> Peta Spasial Live 3D (Pergerakan Lurus Jalur Jalan)
            </div>
            <p className="text-[10px] text-slate-300 font-semibold">
              Simulasi Kejadian Rute: 🛑 Lampu Merah | ⚠️ Macet | ⛽ SPBU Bensin
            </p>
          </div>

          {/* Selected Popup Modal */}
          {selectedItem && (
            <div className="absolute top-16 left-4 z-30 bg-slate-900/95 p-4 rounded-2xl border border-teal-500/40 text-white text-xs w-80 space-y-2 backdrop-blur-xl shadow-2xl animate-in fade-in">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-[10px] font-mono text-teal-400 font-bold uppercase">{selectedItem.type}</span>
                <button onClick={() => setSelectedItem(null)} className="text-slate-400 font-bold">×</button>
              </div>
              <h3 className="font-black text-sm text-white">{selectedItem.title}</h3>
              <p className="text-xs text-slate-300 font-semibold">{selectedItem.subtitle}</p>
              <p className="text-[11px] text-amber-300 font-mono leading-relaxed">{selectedItem.details}</p>
            </div>
          )}
        </Card>
      )}

      {/* TAB 2: QUICKPASS QR SCANNER & BARCODE TICKET */}
      {activeTab === 'qr' && (
        <Card className="p-6 border-slate-200 bg-white rounded-3xl shadow-md space-y-6">
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <QrCode className="h-5 w-5 text-emerald-600" /> Simulasi QuickPass QR & Verifikasi Barcode Digital
              </h3>
              <p className="text-xs text-slate-500 font-semibold">
                Setiap pemesanan slot menerbitkan tiket QR terenkripsi yang langsung diverifikasi oleh petugas Dishub.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
              HMAC-SHA256 Verified
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Left QR Ticket Preview */}
            <div className="p-6 bg-slate-950 text-white rounded-3xl border border-emerald-500/40 text-center space-y-4 shadow-xl">
              <span className="text-[10px] font-black uppercase text-teal-300 bg-teal-500/20 px-3 py-1 rounded-full border border-teal-500/30 inline-block">
                Tiket Digital QuickPass QR
              </span>

              <div className="p-4 bg-white rounded-2xl inline-block mx-auto shadow-xl">
                <QRCodeSVG value="URBANLOAD-QR|UL-DEMO-2025|B 9812 UAI|HMAC-SHA256-VALID" size={180} level="H" includeMargin={true} />
              </div>

              <div className="text-xs font-mono space-y-1 text-slate-300 border-t border-slate-800 pt-3">
                <div className="flex justify-between"><span className="text-slate-400">ID Tiket:</span><strong className="text-white">UL-DEMO-2025-QR</strong></div>
                <div className="flex justify-between"><span className="text-slate-400">Kendaraan:</span><strong className="text-teal-300">B 9812 UAI (CDE Box)</strong></div>
                <div className="flex justify-between"><span className="text-slate-400">Zona Tujuan:</span><strong className="text-white">Zona A - Pasar Tanah Abang</strong></div>
              </div>
            </div>

            {/* Right Interactive Scanner Simulation */}
            <div className="space-y-4 p-5 bg-slate-50 border border-slate-200 rounded-3xl">
              <div className="font-extrabold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                <Scan className="h-5 w-5 text-teal-600" /> Hasil Verifikasi Scanner Petugas Dishub
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center gap-2 font-black text-emerald-900">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" /> TIKET DIGITAL VALID & TERAUTENTIKASI
                </div>
                <p className="text-slate-700 leading-relaxed font-medium">
                  Tanda tangan digital HMAC-SHA256 cocok dengan akun kurir B 9812 UAI. Slot bongkar muat di Zona A disetujui.
                </p>
              </div>

              <Button
                onClick={() => showToast({ title: 'Koneksi Dishub Valid', message: 'Tiket QR B 9812 UAI disetujui oleh scanner petugas.', type: 'success' })}
                className="w-full py-3 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-2xl shadow-md"
              >
                Uji Scan Tiket QR Lagi
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 3: SMARTSLOT BOOKING AI FORM */}
      {activeTab === 'booking' && (
        <Card className="p-6 border-slate-200 bg-white rounded-3xl shadow-md space-y-6">
          <div className="border-b pb-3">
            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <Cpu className="h-5 w-5 text-teal-600" /> Uji Pemesanan SmartSlot AI & Dimensi Truk
            </h3>
            <p className="text-xs text-slate-500 font-semibold">
              Simulasi LoadBalancer AI GroqLogix untuk menentukan slot waktu paling bebas hambatan
            </p>
          </div>

          <form onSubmit={handleRunDemoBooking} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Pilih Zona Tujuan</label>
                <select
                  value={demoZone}
                  onChange={(e) => setDemoZone(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-900 focus:border-teal-600"
                >
                  {DEMO_ZONES.map((z) => (
                    <option key={z.id} value={z.id}>{z.name} (Kapasitas: {z.cap} Slot)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Plat Kendaraan</label>
                <input
                  type="text"
                  required
                  value={demoPlate}
                  onChange={(e) => setDemoPlate(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-mono font-bold text-slate-900 focus:border-teal-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Jendela Waktu Kedatangan</label>
                <select
                  value={demoTime}
                  onChange={(e) => setDemoTime(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-900 focus:border-teal-600"
                >
                  <option value="08.00">08.00 WIB</option>
                  <option value="10.00">10.00 WIB (Jam Kerja Padat)</option>
                  <option value="13.00">13.00 WIB</option>
                  <option value="15.00">15.00 WIB</option>
                </select>
              </div>
            </div>

            <Button type="submit" className="w-full py-3 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-2xl shadow-md">
              Jalankan Simulasi Optimalisasi SmartSlot AI
            </Button>
          </form>

          {bookingResult && (
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl space-y-2 text-xs animate-in fade-in">
              <div className="font-extrabold text-teal-900 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-teal-600" /> Rekomendasi LoadBalancer AI GroqLogix
              </div>
              <p className="text-slate-800 font-semibold leading-relaxed">
                Zona <strong>{bookingResult.zoneName}</strong> untuk <strong>{bookingResult.plate}</strong> direkomendasikan pada slot <strong>{bookingResult.recommendedSlotTime}</strong>. Skor Kepadatan Zona: {bookingResult.congestionScore}/10.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* TAB 4: RIDER DASHBOARD & PANIC BUTTON SIMULATOR */}
      {activeTab === 'dashboard' && (
        <Card className="p-6 border-slate-200 bg-white rounded-3xl shadow-md space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Truck className="h-5 w-5 text-teal-600" /> Simulasi Dashboard Kurir & Panic Reschedule
              </h3>
              <p className="text-xs text-slate-500 font-semibold">
                Riwayat transaksi booking aktif dan tombol Panic Button untuk pergeseran jadwal darurat saat macet.
              </p>
            </div>
            <span className="text-xs font-bold bg-teal-100 text-teal-900 px-3 py-1 rounded-full border border-teal-200">
              5 Transaksi Rute Aktif
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b bg-slate-50 text-slate-700 font-bold">
                  <th className="p-3">Plat Nomor</th>
                  <th className="p-3">Tipe Kendaraan</th>
                  <th className="p-3">Rute Asal ➔ Tujuan</th>
                  <th className="p-3">Kondisi Rute Realtime</th>
                  <th className="p-3 text-right">Aksi Darurat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-teal-800">{v.plate}</td>
                    <td className="p-3 text-slate-800">{v.type}</td>
                    <td className="p-3 text-slate-800">{v.origin} ➔ {v.destination}</td>
                    <td className="p-3 font-semibold text-amber-700">{v.condition}</td>
                    <td className="p-3 text-right">
                      <Button
                        onClick={() => handlePanicRescheduleDemo(v)}
                        variant="outline"
                        className="text-[10px] py-1 h-7 px-2.5 border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 font-bold"
                      >
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600" /> Panic Reschedule (+1 Jam)
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 5: BAYUTILIZATION ANALYTICS CHARTS */}
      {activeTab === 'analytics' && (
        <Card className="p-6 border-slate-200 bg-white rounded-3xl shadow-md space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-teal-600" /> BayUtilization Tracker (Simulasi Analytics)
              </h3>
              <p className="text-xs text-slate-500 font-semibold">
                Persentase penggunaan slot bongkar muat (% okupansi) sepanjang hari
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-teal-800 bg-teal-100 px-3 py-1 rounded-full border border-teal-200">
              Peak: 94% (Jam 10.00)
            </span>
          </div>

          <div className="h-64 w-full pt-2">
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
      )}

      {/* TAB 6: GEOFENCE TELEMETRY & GPS CHECK-IN */}
      {activeTab === 'geofence' && (
        <Card className="p-6 border-slate-200 bg-white rounded-3xl shadow-md space-y-4">
          <div className="border-b pb-3">
            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-teal-600" /> Uji Validasi Telemetri Virtual GeoFence PostGIS
            </h3>
            <p className="text-xs text-slate-500 font-semibold">
              Uji coba kuncian tombol GeoCheck-In berdasarkan radius lokasi GPS (&lt;20m)
            </p>
          </div>

          <div className="p-5 bg-slate-900 text-white rounded-3xl space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-800 rounded-2xl">
                <span className="text-slate-400 block text-[10px]">Sinyal GPS</span>
                <strong className="text-emerald-400 text-base">± 8.5 m</strong>
              </div>

              <div className="p-3 bg-slate-800 rounded-2xl">
                <span className="text-slate-400 block text-[10px]">Latitude</span>
                <strong className="text-white text-xs">-6.185201</strong>
              </div>

              <div className="p-3 bg-slate-800 rounded-2xl">
                <span className="text-slate-400 block text-[10px]">Longitude</span>
                <strong className="text-white text-xs">106.815302</strong>
              </div>

              <div className="p-3 bg-slate-800 rounded-2xl">
                <span className="text-slate-400 block text-[10px]">Kecepatan</span>
                <strong className="text-amber-400 text-base">0 km/h</strong>
              </div>
            </div>

            <Button
              onClick={handleTestGeofence}
              className="w-full py-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl shadow-md"
            >
              <Play className="h-4 w-4" /> Jalankan Simulasi GeoCheck-In (&lt;20m Radius Valid)
            </Button>
          </div>
        </Card>
      )}

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
