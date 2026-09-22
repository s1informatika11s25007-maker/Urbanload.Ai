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
  Truck,
  Building2,
  Play,
  Pause,
  RefreshCw,
  RotateCcw,
  RotateCw,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Activity,
  Navigation,
  Crosshair,
} from 'lucide-react';

// 1. Street / Vektor Mode (100% Free OpenStreetMap - No API Key, Complete Cities)
const VECTORSTREET_STYLE = {
  version: 8,
  sources: {
    'osm-street-tiles': {
      type: 'raster',
      tiles: [
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
      maxzoom: 19,
    },
  },
  layers: [
    { id: 'bg-street', type: 'background', paint: { 'background-color': '#e2e8f0' } },
    { id: 'osm-street-layer', type: 'raster', source: 'osm-street-tiles', minzoom: 0, maxzoom: 19 },
  ],
};

// 2. High-Res Satellite Mode (100% Free Esri World Imagery - No API Key)
const SATELLITE_STYLE = {
  version: 8,
  sources: {
    'esri-satellite-tiles': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: 'Esri, Maxar, Earthstar Geographics',
      maxzoom: 19,
    },
    'esri-transportation-labels': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      maxzoom: 19,
    },
  },
  layers: [
    { id: 'bg-sat', type: 'background', paint: { 'background-color': '#020617' } },
    { id: 'satellite-layer', type: 'raster', source: 'esri-satellite-tiles', minzoom: 0, maxzoom: 19 },
    { id: 'labels-layer', type: 'raster', source: 'esri-transportation-labels', minzoom: 0, maxzoom: 19 },
  ],
};

// 3. Dark Mode (100% Free Dark Basemap - No API Key)
const VECTORDARK_STYLE = {
  version: 8,
  sources: {
    'esri-dark-tiles': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: 'Esri, HERE, Garmin, © OpenStreetMap contributors',
      maxzoom: 19,
    },
    'esri-dark-labels': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      maxzoom: 19,
    },
  },
  layers: [
    { id: 'bg-dark', type: 'background', paint: { 'background-color': '#090d16' } },
    { id: 'dark-layer', type: 'raster', source: 'esri-dark-tiles', minzoom: 0, maxzoom: 19 },
    { id: 'dark-labels-layer', type: 'raster', source: 'esri-dark-labels', minzoom: 0, maxzoom: 19 },
  ],
};

// Helper: Parse PostGIS WKT POLYGON / GeoJSON into MapLibre Ring Coordinates
function parseBoundaryPolygon(poly) {
  if (!poly) return null;
  if (typeof poly === 'object' && poly.type === 'Polygon') return poly.coordinates;
  if (typeof poly === 'string' && poly.includes('POLYGON')) {
    const match = poly.match(/\(\((.*?)\)\)/);
    if (match && match[1]) {
      const coords = match[1].split(',').map((pair) => {
        const [lng, lat] = pair.trim().split(/\s+/).map(Number);
        return [lng, lat];
      });
      return [coords];
    }
  }
  return null;
}

export function LiveMapHero() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const animationFrameRef = useRef(null);
  const truckMarkersRef = useRef([]);
  const userMarkerRef = useRef(null);
  const watchPositionIdRef = useRef(null);

  // Control States
  const [mapMode, setMapMode] = useState('street'); // 'street' | 'satellite' | 'dark'
  const [is3D, setIs3D] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [showZones, setShowZones] = useState(true);
  const [showTrucks, setShowTrucks] = useState(true);

  // Real Database States
  const [realZones, setRealZones] = useState([]);
  const [realBookings, setRealBookings] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [loading, setLoading] = useState(true);

  // User Live GNSS Location State (Zero Cache)
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // Load Real Database Data from Supabase
  const loadDatabaseData = async () => {
    setLoading(true);
    const supabase = createClient();

    try {
      const { data: zonesData } = await supabase
        .from('zones')
        .select('*')
        .order('created_at', { ascending: false });

      if (zonesData) {
        setRealZones(zonesData);
      }

      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*, profiles(full_name), zones(name, boundary_polygon)')
        .order('created_at', { ascending: false });

      if (bookingsData) {
        setRealBookings(bookingsData);
      }
    } catch (err) {
      console.error('Error fetching Supabase map data:', err);
    } finally {
      setLoading(false);
    }
  };

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
      dragRotate: true,
      pitchWithRotate: true,
      touchPitch: true,
      touchZoomRotate: true,
      maxParallelImageRequests: 16,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true, visualizePitch: true }), 'top-right');

    map.on('load', () => {
      loadDatabaseData();
      startAutoLocateUser(map);
    });

    mapRef.current = map;

    // Realtime Supabase Database Subscriptions
    const supabase = createClient();
    const zonesChannel = supabase
      .channel('realtime_map_zones_ch')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'zones' }, () => loadDatabaseData())
      .subscribe();

    const bookingsChannel = supabase
      .channel('realtime_map_bookings_ch')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => loadDatabaseData())
      .subscribe();

    return () => {
      if (watchPositionIdRef.current) navigator.geolocation.clearWatch(watchPositionIdRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      supabase.removeChannel(zonesChannel);
      supabase.removeChannel(bookingsChannel);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // REALTIME ZERO-CACHE USER LOCATION TRACKING (watchPosition with maximumAge: 0)
  const startAutoLocateUser = (map) => {
    if (!navigator.geolocation) return;

    watchPositionIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        const coords = { lat, lng, accuracy };
        setUserLocation(coords);

        if (mapRef.current) {
          updateUserMarker(mapRef.current, lng, lat, accuracy);
        }
      },
      (err) => console.warn('Auto locate warning:', err),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0, // FORCE FRESH REALTIME GNSS - ZERO CACHE
      }
    );
  };

  // Render or Update User Live Marker on Map (Location Pin Badge)
  const updateUserMarker = (map, lng, lat, accuracy) => {
    if (userMarkerRef.current) userMarkerRef.current.remove();

    const el = document.createElement('div');
    el.className = 'relative flex items-center justify-center cursor-pointer group shadow-2xl';
    el.innerHTML = `
      <div className="flex items-center gap-1.5 bg-teal-600 text-white px-2.5 py-1 rounded-full border-2 border-white shadow-2xl transition-transform duration-200 group-hover:scale-110">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        <span className="text-[10px] font-black tracking-wide">Lokasi Saya</span>
      </div>
    `;

    el.addEventListener('click', () => {
      setSelectedFeature({
        type: 'Lokasi Saya (Presisi GNSS)',
        title: 'Posisi Perangkat Anda (Realtime)',
        subtitle: `Akurasi GPS: ±${accuracy?.toFixed(1) || 5} meter`,
        capacity: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`,
        operating: 'Pembaruan otomatis tanpa cache (Fresh GNSS)',
        color: '#14b8a6',
      });
    });

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([lng, lat])
      .addTo(map);

    userMarkerRef.current = marker;
  };

  // Manual Trigger Button: Locate Me & Center Camera
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Browser tidak mendukung Geolocation.');
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        setUserLocation({ lat, lng, accuracy });
        setIsLocating(false);

        const map = mapRef.current;
        if (map) {
          updateUserMarker(map, lng, lat, accuracy);
          map.flyTo({
            center: [lng, lat],
            zoom: 15.5,
            pitch: is3D ? 55 : 0,
            duration: 1200,
          });
        }
      },
      (err) => {
        console.warn('Manual locate error:', err);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0, // ZERO CACHE
      }
    );
  };

  // Update Spatial Map Layers whenever realZones data changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    // Parse polygons purely from database rows
    const zoneFeatures = realZones
      .map((z, idx) => {
        const coords = parseBoundaryPolygon(z.boundary_polygon);
        if (!coords) return null;

        const capacityMax = z.max_truck_capacity || 10;

        return {
          type: 'Feature',
          properties: {
            id: z.id,
            name: z.name,
            maxCapacity: capacityMax,
            zoneType: z.zone_type || 'logistics',
            priority: z.priority_level || 'normal',
            operatingStart: z.operating_hours_start || '06:00',
            operatingEnd: z.operating_hours_end || '22:00',
            color: idx % 3 === 0 ? '#ef4444' : idx % 3 === 1 ? '#f59e0b' : '#10b981',
            height: 35 + (idx * 15),
          },
          geometry: {
            type: 'Polygon',
            coordinates: coords,
          },
        };
      })
      .filter(Boolean);

    const realGeoJSON = {
      type: 'FeatureCollection',
      features: zoneFeatures,
    };

    if (map.getSource('real-zones-source')) {
      map.getSource('real-zones-source').setData(realGeoJSON);
    } else {
      map.addSource('real-zones-source', {
        type: 'geojson',
        data: realGeoJSON,
      });

      map.addLayer({
        id: 'zones-fill',
        type: 'fill',
        source: 'real-zones-source',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.28,
        },
      });

      map.addLayer({
        id: 'zones-outline',
        type: 'line',
        source: 'real-zones-source',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 3,
          'line-dasharray': [2, 1],
        },
      });

      map.addLayer({
        id: 'zones-extrusion-3d',
        type: 'fill-extrusion',
        source: 'real-zones-source',
        paint: {
          'fill-extrusion-color': ['get', 'color'],
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.45,
        },
      });

      map.on('click', 'zones-fill', (e) => {
        if (e.features && e.features[0]) {
          const props = e.features[0].properties;
          setSelectedFeature({
            type: 'Zona Logistik Real (Database)',
            title: props.name,
            subtitle: `Tipe: ${props.zoneType} | Prioritas: ${props.priority}`,
            capacity: `Maksimal: ${props.maxCapacity} Truk`,
            operating: `Jam Operasional: ${props.operatingStart} - ${props.operatingEnd}`,
            color: props.color,
          });
        }
      });

      map.on('mouseenter', 'zones-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'zones-fill', () => { map.getCanvas().style.cursor = ''; });
    }
  }, [realZones]);

  // Handle Style Switching
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    let targetStyle;
    if (mapMode === 'satellite') targetStyle = SATELLITE_STYLE;
    else if (mapMode === 'dark') targetStyle = VECTORDARK_STYLE;
    else targetStyle = VECTORSTREET_STYLE;

    map.setStyle(targetStyle);

    map.once('styledata', () => {
      updateLayerVisibilities(map);
      if (userLocation) {
        updateUserMarker(map, userLocation.lng, userLocation.lat, userLocation.accuracy);
      }
    });
  }, [mapMode]);

  // Handle 3D / 2D Camera Transition
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (is3D) {
      map.easeTo({ pitch: 62, bearing: -22, duration: 1200 });
    } else {
      map.easeTo({ pitch: 0, bearing: 0, duration: 1200 });
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
  };

  useEffect(() => {
    updateLayerVisibilities(mapRef.current);
  }, [showZones, is3D]);

  // Render Real Active Truck Markers from Supabase Database Bookings
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    truckMarkersRef.current.forEach((m) => m.remove());
    truckMarkersRef.current = [];

    if (!showTrucks) return;

    realBookings.forEach((b) => {
      let coords = null;

      if (b.zones && b.zones.boundary_polygon) {
        const parsed = parseBoundaryPolygon(b.zones.boundary_polygon);
        if (parsed && parsed[0] && parsed[0][0]) {
          coords = parsed[0][0];
        }
      }

      if (!coords) return; // Only render real bookings with valid zone location

      const el = document.createElement('div');
      el.className = 'group relative cursor-pointer';

      const statusColor = b.status === 'confirmed' ? '#10b981' : b.status === 'active' ? '#3b82f6' : '#f59e0b';

      el.innerHTML = `
        <div className="flex items-center gap-1 bg-slate-900/90 text-white px-2 py-1 rounded-full border border-slate-700 shadow-xl backdrop-blur-md transition-transform duration-200 group-hover:scale-110">
          <span className="h-2 w-2 rounded-full animate-ping" style="background-color: ${statusColor}"></span>
          <span className="text-[10px] font-black font-mono">${b.vehicle_plate || 'TRUK REAL'}</span>
        </div>
      `;

      el.addEventListener('click', () => {
        setSelectedFeature({
          type: 'Truk Real (Database)',
          title: b.vehicle_plate || 'Truk Logistik',
          subtitle: `Pengemudi: ${b.profiles?.full_name || 'Kurir Logistik'}`,
          status: `Status: ${b.status || 'Aktif'}`,
          zone: `Zona: ${b.zones?.name || 'Zona Logistik'}`,
          cargo: `Muatan: ${b.cargo_type || 'Bahan Pokok'}`,
          color: statusColor,
        });
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(coords)
        .addTo(map);

      truckMarkersRef.current.push(marker);
    });
  }, [realBookings, showTrucks]);

  // MANUAL CAMERA ROTATION & PANNING CONTROLS
  const handleRotateLeft = () => {
    const map = mapRef.current;
    if (!map) return;
    map.easeTo({ bearing: map.getBearing() - 35, duration: 400 });
  };

  const handleRotateRight = () => {
    const map = mapRef.current;
    if (!map) return;
    map.easeTo({ bearing: map.getBearing() + 35, duration: 400 });
  };

  const handlePanLeft = () => {
    const map = mapRef.current;
    if (!map) return;
    map.panBy([-180, 0], { duration: 400 });
  };

  const handlePanRight = () => {
    const map = mapRef.current;
    if (!map) return;
    map.panBy([180, 0], { duration: 400 });
  };

  const handlePanUp = () => {
    const map = mapRef.current;
    if (!map) return;
    map.panBy([0, -180], { duration: 400 });
  };

  const handlePanDown = () => {
    const map = mapRef.current;
    if (!map) return;
    map.panBy([0, 180], { duration: 400 });
  };

  const handleTiltUp = () => {
    const map = mapRef.current;
    if (!map) return;
    const newPitch = Math.min(map.getPitch() + 15, 80);
    map.easeTo({ pitch: newPitch, duration: 400 });
  };

  const handleTiltDown = () => {
    const map = mapRef.current;
    if (!map) return;
    const newPitch = Math.max(map.getPitch() - 15, 0);
    map.easeTo({ pitch: newPitch, duration: 400 });
  };

  const handleResetNorth = () => {
    const map = mapRef.current;
    if (!map) return;
    map.easeTo({
      center: [106.8272, -6.1754],
      zoom: 12.8,
      pitch: is3D ? 55 : 0,
      bearing: 0,
      duration: 800,
    });
  };

  return (
    <Card className="w-full h-[450px] sm:h-[580px] p-0 overflow-hidden relative bg-slate-950 rounded-2xl sm:rounded-3xl border border-slate-800 shadow-2xl">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full bg-slate-950" />

      {/* Floating Control Bar Top Right - Mobile Responsive */}
      <div className="absolute top-3 right-12 sm:top-4 sm:right-14 z-20 flex flex-wrap items-center gap-1.5 sm:gap-2 bg-slate-900/90 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-slate-700/80 backdrop-blur-md shadow-lg text-[10px] sm:text-xs max-w-[85vw] sm:max-w-none">
        {/* Map Mode Buttons */}
        <div className="flex items-center gap-1 bg-slate-800/90 p-0.5 sm:p-1 rounded-lg sm:rounded-xl border border-slate-700">
          <button
            type="button"
            onClick={() => setMapMode('street')}
            className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg font-bold flex items-center gap-1 transition ${
              mapMode === 'street' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Vektor
          </button>
          <button
            type="button"
            onClick={() => setMapMode('satellite')}
            className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg font-bold flex items-center gap-1 transition ${
              mapMode === 'satellite' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Satelit
          </button>
          <button
            type="button"
            onClick={() => setMapMode('dark')}
            className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg font-bold flex items-center gap-1 transition ${
              mapMode === 'dark' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-300" /> Gelap
          </button>
        </div>

        {/* FEATURE 1: LOKASI SAYA BUTTON (FRESH ZERO CACHE GNSS) */}
        <button
          type="button"
          onClick={handleLocateMe}
          className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl font-bold flex items-center gap-1 border transition shadow-sm ${
            userLocation
              ? 'bg-teal-600 text-white border-teal-500 shadow-teal-600/30'
              : 'bg-slate-800 text-teal-300 border-slate-700 hover:bg-slate-700'
          }`}
          title="Fokuskan Ke Lokasi Saya Saat Ini (Akurat & Fresh GNSS)"
        >
          <Crosshair className={`h-3.5 w-3.5 ${isLocating ? 'animate-spin text-teal-300' : 'text-teal-400'}`} />
          <span>{isLocating ? 'Mencari...' : 'Lokasi Saya'}</span>
        </button>

        {/* 3D / 2D Toggle */}
        <button
          type="button"
          onClick={() => setIs3D(!is3D)}
          className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl font-bold flex items-center gap-1 border transition ${
            is3D
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
          }`}
        >
          <Box className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> {is3D ? '3D' : '2D'}
        </button>

        {/* 3D Camera Rotation Toggle */}
        {is3D && (
          <button
            type="button"
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-1 sm:p-1.5 rounded-lg sm:rounded-xl border transition ${
              autoRotate ? 'bg-teal-500/20 text-teal-300 border-teal-500/50' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Auto-Rotate Camera 3D"
          >
            {autoRotate ? <Pause className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin text-teal-400" /> : <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
          </button>
        )}

        {/* Refresh Real Data Button */}
        <button
          type="button"
          onClick={loadDatabaseData}
          className="p-1 sm:p-1.5 rounded-lg sm:rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition"
          title="Sinkronisasi Data Real Database"
        >
          <RefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${loading ? 'animate-spin text-teal-400' : ''}`} />
        </button>
      </div>

      {/* MANUAL CAMERA NAVIGATION & ROTATION CONTROL PANEL - Mobile Responsive (Bawah Kanan) */}
      <div className="absolute bottom-12 right-3 sm:bottom-16 sm:right-4 z-20 bg-slate-900/90 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border border-slate-700/80 backdrop-blur-md shadow-2xl flex flex-col items-center gap-1.5 sm:gap-2 text-white text-[10px] sm:text-xs">
        <div className="text-[9px] sm:text-[10px] font-black uppercase text-teal-400 tracking-wider flex items-center gap-1">
          <Compass className="h-3 w-3" /> Kontrol Kamera
        </div>

        {/* Rotasi Kiri & Kanan */}
        <div className="flex items-center gap-1 sm:gap-1.5 w-full justify-center">
          <button
            type="button"
            onClick={handleRotateLeft}
            className="px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-slate-800 border border-slate-700 hover:bg-teal-600 hover:border-teal-500 text-white font-bold flex items-center gap-1 transition shadow-md active:scale-95"
            title="Putar Kamera Ke Kiri 35°"
          >
            <RotateCcw className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Putar Kiri
          </button>
          <button
            type="button"
            onClick={handleResetNorth}
            className="p-1 sm:p-1.5 rounded-lg sm:rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-amber-400 font-bold transition shadow-md"
            title="Reset Arah Utara (North)"
          >
            <Compass className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
          <button
            type="button"
            onClick={handleRotateRight}
            className="px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-slate-800 border border-slate-700 hover:bg-teal-600 hover:border-teal-500 text-white font-bold flex items-center gap-1 transition shadow-md active:scale-95"
            title="Putar Kamera Ke Kanan 35°"
          >
            Putar Kanan <RotateCw className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
        </div>

        {/* D-Pad Pan & Tilt Direction Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            type="button"
            onClick={handlePanLeft}
            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white transition active:scale-95"
            title="Geser Peta Ke Kiri"
          >
            <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>

          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={handlePanUp}
              className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white transition active:scale-95"
              title="Geser Peta Ke Atas"
            >
              <ArrowUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
            <button
              type="button"
              onClick={handlePanDown}
              className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white transition active:scale-95"
              title="Geser Peta Ke Bawah"
            >
              <ArrowDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handlePanRight}
            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white transition active:scale-95"
            title="Geser Peta Ke Kanan"
          >
            <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>

          {/* Kemiringan Tilt 3D */}
          <div className="flex flex-col gap-1 border-l border-slate-700 pl-1">
            <button
              type="button"
              onClick={handleTiltUp}
              className="px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg bg-slate-800 border border-slate-700 hover:bg-amber-600 text-amber-300 text-[9px] sm:text-[10px] font-bold transition active:scale-95"
              title="Miringkan Ke Atas (3D Tilt)"
            >
              Tilt +
            </button>
            <button
              type="button"
              onClick={handleTiltDown}
              className="px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg bg-slate-800 border border-slate-700 hover:bg-amber-600 text-amber-300 text-[9px] sm:text-[10px] font-bold transition active:scale-95"
              title="Miringkan Ke Bawah (Flat)"
            >
              Tilt -
            </button>
          </div>
        </div>
      </div>

      {/* Floating Layer Filters Panel Top Left - Mobile Responsive */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 bg-slate-900/90 p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-800 backdrop-blur-md shadow-xl space-y-1.5 sm:space-y-2 text-xs text-white max-w-[170px] sm:max-w-[200px]">
        <div className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
          <Layers className="h-3 w-3 text-teal-400" /> Layer Database Real
        </div>
        <div className="space-y-1 pt-0.5 sm:pt-1">
          <label className="flex items-center gap-1.5 cursor-pointer text-[10px] sm:text-[11px] font-semibold text-slate-200">
            <input
              type="checkbox"
              checked={showZones}
              onChange={(e) => setShowZones(e.target.checked)}
              className="rounded border-slate-700 bg-slate-800 text-teal-500 focus:ring-teal-500"
            />
            <span className="flex items-center gap-1 truncate">
              <span className="h-2 w-2 rounded-full bg-teal-500 shrink-0"></span> Zona Real ({realZones.length})
            </span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-[10px] sm:text-[11px] font-semibold text-slate-200">
            <input
              type="checkbox"
              checked={showTrucks}
              onChange={(e) => setShowTrucks(e.target.checked)}
              className="rounded border-slate-700 bg-slate-800 text-teal-500 focus:ring-teal-500"
            />
            <span className="flex items-center gap-1 truncate">
              <Truck className="h-3 w-3 text-amber-400 shrink-0" /> Truk Booking Real ({realBookings.length})
            </span>
          </label>
        </div>
      </div>

      {/* VISUAL CONGESTIONSCORE LEGEND OVERLAY */}
      <div className="absolute top-28 left-3 sm:top-36 sm:left-4 z-20 bg-slate-900/90 p-2 sm:p-2.5 rounded-xl border border-slate-800/90 backdrop-blur-md shadow-xl text-[9px] sm:text-[10px] text-white space-y-1">
        <div className="font-bold text-slate-300 flex items-center gap-1 border-b border-slate-800 pb-1">
          <Activity className="h-3 w-3 text-teal-400" /> Legenda CongestionScore
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
          <span>1.0 - 4.9: Lancar</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
          <span>5.0 - 7.4: Sedang</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
          <span>7.5 - 10.0: Macet Parah</span>
        </div>
      </div>

      {/* Selected Feature Modal Popup - Mobile Responsive */}
      {selectedFeature && (
        <div className="absolute top-16 left-3 sm:top-20 sm:left-4 z-30 bg-slate-900/95 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-teal-500/40 backdrop-blur-xl shadow-2xl text-white text-xs w-64 sm:w-72 space-y-2 animate-in fade-in duration-200">
          <div className="flex justify-between items-start border-b border-slate-800 pb-2">
            <div>
              <span className="text-[9px] font-mono uppercase text-teal-400 font-bold block">{selectedFeature.type}</span>
              <h3 className="font-black text-xs sm:text-sm text-white">{selectedFeature.title}</h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400">{selectedFeature.subtitle}</p>
            </div>
            <button
              onClick={() => setSelectedFeature(null)}
              className="text-slate-400 hover:text-white text-base leading-none font-bold"
            >
              ×
            </button>
          </div>

          <div className="space-y-1.5 pt-1 text-[10px] sm:text-[11px]">
            {selectedFeature.capacity && (
              <div className="flex justify-between">
                <span className="text-slate-400">Kapasitas Slot:</span>
                <span className="font-bold text-slate-200">{selectedFeature.capacity}</span>
              </div>
            )}
            {selectedFeature.operating && (
              <div className="flex justify-between">
                <span className="text-slate-400">Operasional:</span>
                <span className="font-bold text-teal-300">{selectedFeature.operating}</span>
              </div>
            )}
            {selectedFeature.status && (
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-extrabold" style={{ color: selectedFeature.color }}>{selectedFeature.status}</span>
              </div>
            )}
            {selectedFeature.cargo && (
              <div className="flex justify-between">
                <span className="text-slate-400">Muatan Cargo:</span>
                <span className="font-bold text-amber-300">{selectedFeature.cargo}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Status Bar - Mobile Responsive */}
      <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20 bg-slate-900/90 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl border border-slate-800 text-white text-[10px] sm:text-xs backdrop-blur-md shadow-xl flex items-center gap-2 sm:gap-4 max-w-[80vw] sm:max-w-none overflow-x-auto">
        <div className="flex items-center gap-1.5 shrink-0">
          <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
          <span className="font-bold text-slate-200">Supabase DB</span>
        </div>
        <div className="h-3 w-[1px] bg-slate-700 shrink-0"></div>
        <div className="flex items-center gap-1 text-teal-400 font-bold shrink-0">
          <Truck className="h-3 w-3" />
          <span>{realBookings.length} Booking Real</span>
        </div>
        {userLocation && (
          <>
            <div className="h-3 w-[1px] bg-slate-700 shrink-0"></div>
            <div className="flex items-center gap-1 text-emerald-400 font-mono font-bold shrink-0">
              <Crosshair className="h-3 w-3" />
              <span>GPS ±{userLocation.accuracy?.toFixed(1)}m</span>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
