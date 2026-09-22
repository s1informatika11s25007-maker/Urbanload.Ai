import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { createClient } from '../../lib/supabase/client.js';
import { Card } from '../ui/card.jsx';
import {
  Radio,
  Layers,
  Globe,
  Box,
  Compass,
  Maximize2,
  Truck,
  Building2,
  RefreshCw,
  Play,
  Pause,
  MapPin,
  Maximize,
} from 'lucide-react';

// ESRI High-Resolution Satellite Map Style Definition
const SATELLITE_STYLE = {
  version: 8,
  sources: {
    'esri-satellite': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: 'Esri, Maxar, Earthstar Geographics, USDA, USGS, AeroGRID, IGN, and the GIS User Community',
    },
    'carto-labels': {
      type: 'raster',
      tiles: [
        'https://basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
      ],
      tileSize: 256,
    },
  },
  layers: [
    {
      id: 'satellite-tiles',
      type: 'raster',
      source: 'esri-satellite',
      minzoom: 0,
      maxzoom: 20,
    },
    {
      id: 'labels-tiles',
      type: 'raster',
      source: 'carto-labels',
      minzoom: 0,
      maxzoom: 20,
    },
  ],
};

const VECTORDARK_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
const VECTORSTREET_STYLE = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';

// Logistical Zones GeoJSON Data for Jakarta
const JAKARTA_ZONES_GEOJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        id: 'zone-a',
        name: 'Zona A - Pasar Tanah Abang',
        code: 'Z-TNA-01',
        status: 'Padat',
        score: '8.8 / 10',
        color: '#ef4444', // Red
        activeTrucks: 14,
        capacity: '12/15 Slot',
        speed: '12 km/jam',
        height: 45,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [106.812, -6.185],
            [106.822, -6.185],
            [106.822, -6.195],
            [106.812, -6.195],
            [106.812, -6.185],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'zone-b',
        name: 'Zona B - Pelabuhan Tanjung Priok',
        code: 'Z-TPK-02',
        status: 'Sedang',
        score: '6.4 / 10',
        color: '#f59e0b', // Yellow
        activeTrucks: 28,
        capacity: '22/35 Slot',
        speed: '24 km/jam',
        height: 60,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [106.870, -6.105],
            [106.892, -6.105],
            [106.892, -6.125],
            [106.870, -6.125],
            [106.870, -6.105],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'zone-c',
        name: 'Zona C - Koridor Sudirman-Thamrin',
        code: 'Z-SUD-03',
        status: 'Lancar',
        score: '3.2 / 10',
        color: '#10b981', // Green
        activeTrucks: 8,
        capacity: '6/20 Slot',
        speed: '38 km/jam',
        height: 90,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [106.818, -6.200],
            [106.828, -6.200],
            [106.823, -6.230],
            [106.813, -6.230],
            [106.818, -6.200],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'zone-d',
        name: 'Zona D - Kelapa Gading Trade Center',
        code: 'Z-KGD-04',
        status: 'Sedang',
        score: '5.9 / 10',
        color: '#f59e0b',
        activeTrucks: 11,
        capacity: '10/18 Slot',
        speed: '28 km/jam',
        height: 35,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [106.895, -6.150],
            [106.915, -6.150],
            [106.915, -6.170],
            [106.895, -6.170],
            [106.895, -6.150],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'zone-e',
        name: 'Zona E - Kawasan Industri Pulogadung',
        code: 'Z-PLG-05',
        status: 'Lancar',
        score: '2.8 / 10',
        color: '#10b981',
        activeTrucks: 19,
        capacity: '14/40 Slot',
        speed: '42 km/jam',
        height: 30,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [106.910, -6.185],
            [106.932, -6.185],
            [106.932, -6.205],
            [106.910, -6.205],
            [106.910, -6.185],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'zone-f',
        name: 'Zona F - Glodok & Mangga Dua',
        code: 'Z-GLD-06',
        status: 'Padat',
        score: '9.1 / 10',
        color: '#ef4444',
        activeTrucks: 17,
        capacity: '14/15 Slot',
        speed: '10 km/jam',
        height: 40,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [106.810, -6.138],
            [106.830, -6.138],
            [106.830, -6.155],
            [106.810, -6.155],
            [106.810, -6.138],
          ],
        ],
      },
    },
  ],
};

// 3D Simulated Buildings Landmarks for High Visual Fidelity
const JAKARTA_3D_BUILDINGS_GEOJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Monumen Nasional (Monas)', height: 132, base_height: 0, color: '#f1f5f9' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [106.8268, -6.1751], [106.8276, -6.1751], [106.8276, -6.1757], [106.8268, -6.1757], [106.8268, -6.1751]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Wisma 46 Sudirman', height: 262, base_height: 0, color: '#38bdf8' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [106.8202, -6.2078], [106.8212, -6.2078], [106.8212, -6.2088], [106.8202, -6.2088], [106.8202, -6.2078]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Gedung Pasar Tanah Abang Blok A', height: 85, base_height: 0, color: '#f43f5e' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [106.8155, -6.1882], [106.8185, -6.1882], [106.8185, -6.1912], [106.8155, -6.1912], [106.8155, -6.1882]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Terminal Kontainer Priok', height: 65, base_height: 0, color: '#eab308' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [106.8780, -6.1100], [106.8850, -6.1100], [106.8850, -6.1170], [106.8780, -6.1170], [106.8780, -6.1100]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Gedung Glodok Plaza', height: 70, base_height: 0, color: '#a855f7' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [106.8150, -6.1430], [106.8200, -6.1430], [106.8200, -6.1470], [106.8150, -6.1470], [106.8150, -6.1430]
        ]]
      }
    }
  ]
};

// Simulated Active Live Moving Trucks
const INITIAL_LIVE_TRUCKS = [
  { id: 'T-01', plate: 'B 9812 UAI', driver: 'Budi Santoso', zone: 'Tanah Abang', status: 'Bongkar Muat', speed: '12 km/h', lng: 106.816, lat: -6.189, color: '#ef4444' },
  { id: 'T-02', plate: 'B 9201 PKS', driver: 'Ahmad Supri', zone: 'Tanjung Priok', status: 'Menuju Slot', speed: '28 km/h', lng: 106.881, lat: -6.115, color: '#f59e0b' },
  { id: 'T-03', plate: 'B 9543 SDK', driver: 'Dedi Kurniawan', zone: 'Sudirman', status: 'Transit', speed: '36 km/h', lng: 106.821, lat: -6.212, color: '#10b981' },
  { id: 'T-04', plate: 'B 9110 KGD', driver: 'Rian Hidayat', zone: 'Kelapa Gading', status: 'Selesai', speed: '0 km/h', lng: 106.905, lat: -6.160, color: '#3b82f6' },
  { id: 'T-05', plate: 'B 9377 PLG', driver: 'Siti Rahma', zone: 'Pulogadung', status: 'Menuju Slot', speed: '40 km/h', lng: 106.920, lat: -6.192, color: '#10b981' },
  { id: 'T-06', plate: 'B 9700 GLD', driver: 'Hendrik', zone: 'Glodok', status: 'Antre Slot', speed: '8 km/h', lng: 106.818, lat: -6.145, color: '#ef4444' }
];

export function LiveMapHero() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const animationFrameRef = useRef(null);
  const truckMarkersRef = useRef([]);

  // Control States
  const [mapMode, setMapMode] = useState('street'); // 'street' | 'satellite' | 'dark'
  const [is3D, setIs3D] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [showZones, setShowZones] = useState(true);
  const [show3DBuildings, setShow3DBuildings] = useState(true);
  const [showTrucks, setShowTrucks] = useState(true);

  const [activeTrucks, setActiveTrucks] = useState(INITIAL_LIVE_TRUCKS);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [bookingsCount, setBookingsCount] = useState(97);

  // Initialize MapLibre Engine
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: VECTORSTREET_STYLE,
      center: [106.8272, -6.1754],
      zoom: 12.8,
      pitch: 55,
      bearing: -18,
      antialias: true,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), 'top-right');

    map.on('load', () => {
      setupMapLayers(map);
      fetchRealtimeBookings();
    });

    mapRef.current = map;

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const fetchRealtimeBookings = async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase.from('bookings').select('*');
      if (data && data.length > 0) {
        setBookingsCount(data.length);
      }
    } catch (err) {
      console.warn('Realtime Supabase sync:', err);
    }
  };

  // Function to Add Spatial Layers (Zones, 3D Buildings, Extrusions)
  const setupMapLayers = (map) => {
    if (!map) return;

    // 1. Add Logistical Zones Source & Layers
    if (!map.getSource('jakarta-zones')) {
      map.addSource('jakarta-zones', {
        type: 'geojson',
        data: JAKARTA_ZONES_GEOJSON,
      });

      // Fill Layer for 2D/3D surface
      map.addLayer({
        id: 'zones-fill',
        type: 'fill',
        source: 'jakarta-zones',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.28,
        },
      });

      // Outline Layer
      map.addLayer({
        id: 'zones-outline',
        type: 'line',
        source: 'jakarta-zones',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 3,
          'line-dasharray': [2, 1],
        },
      });

      // 3D Extrusion Wall for Zones when 3D is Active
      map.addLayer({
        id: 'zones-extrusion-3d',
        type: 'fill-extrusion',
        source: 'jakarta-zones',
        paint: {
          'fill-extrusion-color': ['get', 'color'],
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.45,
        },
      });
    }

    // 2. Add 3D Building Landmarks Source & Layer
    if (!map.getSource('jakarta-buildings-3d')) {
      map.addSource('jakarta-buildings-3d', {
        type: 'geojson',
        data: JAKARTA_3D_BUILDINGS_GEOJSON,
      });

      map.addLayer({
        id: 'buildings-3d-layer',
        type: 'fill-extrusion',
        source: 'jakarta-buildings-3d',
        paint: {
          'fill-extrusion-color': ['get', 'color'],
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'base_height'],
          'fill-extrusion-opacity': 0.85,
        },
      });
    }

    // Interactive Hover & Click Events on Zones
    map.on('click', 'zones-fill', (e) => {
      if (e.features && e.features[0]) {
        const props = e.features[0].properties;
        setSelectedFeature({
          type: 'Zone',
          title: props.name,
          subtitle: `Kode: ${props.code}`,
          status: props.status,
          score: props.score,
          capacity: props.capacity,
          activeTrucks: props.activeTrucks,
          speed: props.speed,
          color: props.color,
        });
      }
    });

    map.on('mouseenter', 'zones-fill', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'zones-fill', () => {
      map.getCanvas().style.cursor = '';
    });
  };

  // Handle Style Switching (Vektor, Satelit, Dark)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    let targetStyle;
    if (mapMode === 'satellite') {
      targetStyle = SATELLITE_STYLE;
    } else if (mapMode === 'dark') {
      targetStyle = VECTORDARK_STYLE;
    } else {
      targetStyle = VECTORSTREET_STYLE;
    }

    map.setStyle(targetStyle);

    // Re-attach spatial layers when style loads
    const onStyleLoad = () => {
      setupMapLayers(map);
      updateLayerVisibilities(map);
    };

    map.once('styledata', onStyleLoad);
  }, [mapMode]);

  // Handle 3D / 2D Camera Transition
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (is3D) {
      map.easeTo({
        pitch: 62,
        bearing: -22,
        duration: 1200,
      });
    } else {
      map.easeTo({
        pitch: 0,
        bearing: 0,
        duration: 1200,
      });
    }
  }, [is3D]);

  // Handle Auto Rotation in 3D Mode
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    let rotating = autoRotate;

    const rotateCamera = () => {
      if (rotating && mapRef.current) {
        const currentBearing = map.getBearing();
        map.setBearing(currentBearing + 0.15);
        animationFrameRef.current = requestAnimationFrame(rotateCamera);
      }
    };

    if (autoRotate) {
      rotateCamera();
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [autoRotate]);

  // Handle Layers Visibility Toggles
  const updateLayerVisibilities = (map) => {
    if (!map) return;

    if (map.getLayer('zones-fill')) {
      map.setLayoutProperty('zones-fill', 'visibility', showZones ? 'visible' : 'none');
    }
    if (map.getLayer('zones-outline')) {
      map.setLayoutProperty('zones-outline', 'visibility', showZones ? 'visible' : 'none');
    }
    if (map.getLayer('zones-extrusion-3d')) {
      map.setLayoutProperty('zones-extrusion-3d', 'visibility', showZones && is3D ? 'visible' : 'none');
    }
    if (map.getLayer('buildings-3d-layer')) {
      map.setLayoutProperty('buildings-3d-layer', 'visibility', show3DBuildings ? 'visible' : 'none');
    }
  };

  useEffect(() => {
    updateLayerVisibilities(mapRef.current);
  }, [showZones, show3DBuildings, is3D]);

  // Render Live Truck Markers on Map
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old markers
    truckMarkersRef.current.forEach((m) => m.remove());
    truckMarkersRef.current = [];

    if (!showTrucks) return;

    activeTrucks.forEach((truck) => {
      const el = document.createElement('div');
      el.className = 'group relative cursor-pointer';

      // Custom HTML Marker Badge with pulse effect
      el.innerHTML = `
        <div className="flex items-center gap-1 bg-slate-900/90 text-white px-2 py-1 rounded-full border border-slate-700 shadow-xl backdrop-blur-md transition-transform duration-200 group-hover:scale-110">
          <span className="h-2 w-2 rounded-full animate-ping" style="background-color: ${truck.color}"></span>
          <span className="text-[10px] font-black font-mono">${truck.plate}</span>
        </div>
      `;

      el.addEventListener('click', () => {
        setSelectedFeature({
          type: 'Truk Logistik',
          title: truck.plate,
          subtitle: `Pengemudi: ${truck.driver}`,
          status: truck.status,
          zone: `Zona: ${truck.zone}`,
          speed: `Kecepatan: ${truck.speed}`,
          color: truck.color,
        });
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([truck.lng, truck.lat])
        .addTo(map);

      truckMarkersRef.current.push(marker);
    });
  }, [activeTrucks, showTrucks]);

  // Reset Map View to Center Jakarta
  const handleResetCamera = () => {
    const map = mapRef.current;
    if (!map) return;

    map.flyTo({
      center: [106.8272, -6.1754],
      zoom: 12.8,
      pitch: is3D ? 55 : 0,
      bearing: is3D ? -18 : 0,
      duration: 1000,
    });
  };

  return (
    <Card className="w-full h-[580px] p-0 overflow-hidden relative bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl">
      {/* Container Peta Utama */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Control Bar Atas Kanan */}
      <div className="absolute top-4 right-14 z-20 flex flex-wrap items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-700/80 backdrop-blur-md shadow-lg text-xs">
        {/* Toggle Mode Peta (Street / Satelit / Dark) */}
        <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
          <button
            type="button"
            onClick={() => setMapMode('street')}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition ${
              mapMode === 'street' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" /> Vektor
          </button>
          <button
            type="button"
            onClick={() => setMapMode('satellite')}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition ${
              mapMode === 'satellite' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="h-3.5 w-3.5" /> Satelit
          </button>
          <button
            type="button"
            onClick={() => setMapMode('dark')}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition ${
              mapMode === 'dark' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5 text-slate-300" /> Gelap
          </button>
        </div>

        {/* Toggle Mode 3D / 2D */}
        <button
          type="button"
          onClick={() => setIs3D(!is3D)}
          className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 border transition ${
            is3D
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
          }`}
        >
          <Box className="h-3.5 w-3.5" /> {is3D ? 'Mode 3D' : 'Mode 2D'}
        </button>

        {/* Toggle Rotasi Kamera 3D */}
        {is3D && (
          <button
            type="button"
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-1.5 rounded-xl border transition ${
              autoRotate ? 'bg-teal-500/20 text-teal-300 border-teal-500/50' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Auto-Rotate Camera 3D"
          >
            {autoRotate ? <Pause className="h-4 w-4 animate-spin text-teal-400" /> : <Play className="h-4 w-4" />}
          </button>
        )}

        {/* Reset Camera Button */}
        <button
          type="button"
          onClick={handleResetCamera}
          className="p-1.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition"
          title="Reset Kamera Ke Tengah Jakarta"
        >
          <Compass className="h-4 w-4" />
        </button>
      </div>

      {/* Floating Layer Filters Panel Kiri Atas */}
      <div className="absolute top-4 left-4 z-20 bg-slate-900/90 p-3 rounded-2xl border border-slate-800 backdrop-blur-md shadow-xl space-y-2 text-xs text-white max-w-[200px]">
        <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
          <Layers className="h-3 w-3 text-teal-400" /> Filter Layer Map
        </div>
        <div className="space-y-1.5 pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-[11px] font-semibold text-slate-200">
            <input
              type="checkbox"
              checked={showZones}
              onChange={(e) => setShowZones(e.target.checked)}
              className="rounded border-slate-700 bg-slate-800 text-teal-500 focus:ring-teal-500"
            />
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-teal-500"></span> Poligon Zona
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-[11px] font-semibold text-slate-200">
            <input
              type="checkbox"
              checked={showTrucks}
              onChange={(e) => setShowTrucks(e.target.checked)}
              className="rounded border-slate-700 bg-slate-800 text-teal-500 focus:ring-teal-500"
            />
            <span className="flex items-center gap-1">
              <Truck className="h-3 w-3 text-amber-400" /> Truk Aktif
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-[11px] font-semibold text-slate-200">
            <input
              type="checkbox"
              checked={show3DBuildings}
              onChange={(e) => setShow3DBuildings(e.target.checked)}
              className="rounded border-slate-700 bg-slate-800 text-teal-500 focus:ring-teal-500"
            />
            <span className="flex items-center gap-1">
              <Building2 className="h-3 w-3 text-sky-400" /> Gedung 3D
            </span>
          </label>
        </div>
      </div>

      {/* Modal Detail Feature ketika Zona / Truk Diklil */}
      {selectedFeature && (
        <div className="absolute top-20 left-4 z-30 bg-slate-900/95 p-4 rounded-2xl border border-teal-500/40 backdrop-blur-xl shadow-2xl text-white text-xs w-72 space-y-2 animate-in fade-in slide-in-from-left-2 duration-200">
          <div className="flex justify-between items-start border-b border-slate-800 pb-2">
            <div>
              <span className="text-[10px] font-mono uppercase text-teal-400 font-bold block">{selectedFeature.type}</span>
              <h3 className="font-black text-sm text-white">{selectedFeature.title}</h3>
              <p className="text-[11px] text-slate-400">{selectedFeature.subtitle}</p>
            </div>
            <button
              onClick={() => setSelectedFeature(null)}
              className="text-slate-400 hover:text-white text-base leading-none font-bold"
            >
              ×
            </button>
          </div>

          <div className="space-y-1.5 pt-1 text-[11px]">
            {selectedFeature.status && (
              <div className="flex justify-between">
                <span className="text-slate-400">Status Kepadatan:</span>
                <span className="font-extrabold" style={{ color: selectedFeature.color }}>{selectedFeature.status}</span>
              </div>
            )}
            {selectedFeature.score && (
              <div className="flex justify-between">
                <span className="text-slate-400">CongestionScore:</span>
                <span className="font-mono font-bold text-teal-300">{selectedFeature.score}</span>
              </div>
            )}
            {selectedFeature.capacity && (
              <div className="flex justify-between">
                <span className="text-slate-400">Kapasitas Slot:</span>
                <span className="font-bold text-slate-200">{selectedFeature.capacity}</span>
              </div>
            )}
            {selectedFeature.speed && (
              <div className="flex justify-between">
                <span className="text-slate-400">Kecepatan Telemetri:</span>
                <span className="font-mono font-bold text-amber-300">{selectedFeature.speed}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Status Bar Bawah Kiri */}
      <div className="absolute bottom-4 left-4 z-20 bg-slate-900/90 px-3.5 py-2 rounded-2xl border border-slate-800 text-white text-xs backdrop-blur-md shadow-xl flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
          <span className="font-bold text-slate-200">Realtime Engine: Connected</span>
        </div>
        <div className="h-3 w-[1px] bg-slate-700"></div>
        <div className="flex items-center gap-1.5 text-teal-400 font-bold">
          <Truck className="h-3.5 w-3.5" />
          <span>{bookingsCount} Total Booking</span>
        </div>
        <div className="h-3 w-[1px] bg-slate-700"></div>
        <div className="text-[10px] text-slate-400 font-mono">
          60 FPS (WebGL 3D)
        </div>
      </div>

      {/* Indicator Mode Aktif Bawah Kanan */}
      <div className="absolute bottom-4 right-4 z-20 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] text-slate-300 font-mono backdrop-blur-md">
        Mode: <span className="font-bold text-teal-400 uppercase">{mapMode}</span> | {is3D ? '3D Render' : '2D Ortho'}
      </div>
    </Card>
  );
}
