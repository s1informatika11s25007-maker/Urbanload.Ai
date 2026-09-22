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
      attribution: 'Esri, Maxar, Earthstar Geographics',
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
    { id: 'satellite-tiles', type: 'raster', source: 'esri-satellite', minzoom: 0, maxzoom: 20 },
    { id: 'labels-tiles', type: 'raster', source: 'carto-labels', minzoom: 0, maxzoom: 20 },
  ],
};

const VECTORDARK_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
const VECTORSTREET_STYLE = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';

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

// Default real coordinate mapping for known Jakarta logistics zones (when WKT parsing is missing)
const JAKARTA_ZONE_COORDS = {
  '11111111-1111-1111-1111-111111111111': [[[106.812, -6.185], [106.822, -6.185], [106.822, -6.195], [106.812, -6.195], [106.812, -6.185]]],
  '22222222-2222-2222-2222-222222222222': [[[106.870, -6.105], [106.892, -6.105], [106.892, -6.125], [106.870, -6.125], [106.870, -6.105]]],
  '33333333-3333-3333-3333-333333333333': [[[106.818, -6.200], [106.828, -6.200], [106.823, -6.230], [106.813, -6.230], [106.818, -6.200]]],
  '44444444-4444-4444-4444-444444444444': [[[106.895, -6.150], [106.915, -6.150], [106.915, -6.170], [106.895, -6.170], [106.895, -6.150]]],
  '55555555-5555-5555-5555-555555555555': [[[106.910, -6.185], [106.932, -6.185], [106.932, -6.205], [106.910, -6.205], [106.910, -6.185]]],
  '66666666-6666-6666-6666-666666666666': [[[106.810, -6.138], [106.830, -6.138], [106.830, -6.155], [106.810, -6.155], [106.810, -6.138]]],
};

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

  // Real Database States
  const [realZones, setRealZones] = useState([]);
  const [realBookings, setRealBookings] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load Real Database Data from Supabase
  const loadDatabaseData = async () => {
    setLoading(true);
    const supabase = createClient();

    try {
      // 1. Fetch Real Zones
      const { data: zonesData } = await supabase
        .from('zones')
        .select('*')
        .order('created_at', { ascending: false });

      if (zonesData && zonesData.length > 0) {
        setRealZones(zonesData);
      }

      // 2. Fetch Real Active Bookings & Trucks
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
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), 'top-right');

    map.on('load', () => {
      loadDatabaseData();
    });

    mapRef.current = map;

    // Realtime Supabase Database Subscriptions
    const supabase = createClient();
    const zonesChannel = supabase
      .channel('realtime_map_zones')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'zones' }, () => loadDatabaseData())
      .subscribe();

    const bookingsChannel = supabase
      .channel('realtime_map_bookings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => loadDatabaseData())
      .subscribe();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      supabase.removeChannel(zonesChannel);
      supabase.removeChannel(bookingsChannel);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update Spatial Map Layers whenever realZones data changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    // Build GeoJSON FeatureCollection from Real Database Zones
    const zoneFeatures = realZones.map((z, idx) => {
      let coords = parseBoundaryPolygon(z.boundary_polygon);
      if (!coords && JAKARTA_ZONE_COORDS[z.id]) {
        coords = JAKARTA_ZONE_COORDS[z.id];
      }

      // Default fallback polygon around center if missing
      if (!coords) {
        const offsetLat = (idx % 3) * 0.03;
        const offsetLng = Math.floor(idx / 3) * 0.03;
        coords = [[
          [106.810 + offsetLng, -6.180 - offsetLat],
          [106.825 + offsetLng, -6.180 - offsetLat],
          [106.825 + offsetLng, -6.195 - offsetLat],
          [106.810 + offsetLng, -6.195 - offsetLat],
          [106.810 + offsetLng, -6.180 - offsetLat],
        ]];
      }

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
    });

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

      // 2D Fill Layer
      map.addLayer({
        id: 'zones-fill',
        type: 'fill',
        source: 'real-zones-source',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.28,
        },
      });

      // Outline Layer
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

      // 3D Extrusion Wall for Real Zones
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

      // Interactive Click Event on Zones
      map.on('click', 'zones-fill', (e) => {
        if (e.features && e.features[0]) {
          const props = e.features[0].properties;
          setSelectedFeature({
            type: 'Zona Logistik Real',
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

  // Handle Style Switching (Vektor, Satelit, Dark)
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

    // Remove old markers
    truckMarkersRef.current.forEach((m) => m.remove());
    truckMarkersRef.current = [];

    if (!showTrucks) return;

    realBookings.forEach((b, idx) => {
      // Determine coordinates based on associated zone or real GPS
      let coords = [106.8272 + ((idx % 4) * 0.02) - 0.03, -6.1754 + (Math.floor(idx / 4) * 0.02) - 0.02];

      if (b.zones && b.zones.boundary_polygon) {
        const parsed = parseBoundaryPolygon(b.zones.boundary_polygon);
        if (parsed && parsed[0] && parsed[0][0]) {
          coords = parsed[0][0];
        }
      }

      const el = document.createElement('div');
      el.className = 'group relative cursor-pointer';

      const statusColor = b.status === 'confirmed' ? '#10b981' : b.status === 'active' ? '#3b82f6' : '#f59e0b';

      el.innerHTML = `
        <div className="flex items-center gap-1 bg-slate-900/90 text-white px-2 py-1 rounded-full border border-slate-700 shadow-xl backdrop-blur-md transition-transform duration-200 group-hover:scale-110">
          <span className="h-2 w-2 rounded-full animate-ping" style="background-color: ${statusColor}"></span>
          <span className="text-[10px] font-black font-mono">${b.vehicle_plate || 'T-REAL'}</span>
        </div>
      `;

      el.addEventListener('click', () => {
        setSelectedFeature({
          type: 'Truk Real (Database)',
          title: b.vehicle_plate || 'B 9812 UAI',
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

  // Reset Camera to Jakarta Center
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
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Control Bar Top Right */}
      <div className="absolute top-4 right-14 z-20 flex flex-wrap items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-700/80 backdrop-blur-md shadow-lg text-xs">
        {/* Map Mode Buttons */}
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

        {/* 3D / 2D Toggle */}
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

        {/* 3D Camera Rotation Toggle */}
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

        {/* Refresh Real Data Button */}
        <button
          type="button"
          onClick={loadDatabaseData}
          className="p-1.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition"
          title="Sinkronisasi Data Real Database"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-teal-400' : ''}`} />
        </button>

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

      {/* Floating Layer Filters Panel Top Left */}
      <div className="absolute top-4 left-4 z-20 bg-slate-900/90 p-3 rounded-2xl border border-slate-800 backdrop-blur-md shadow-xl space-y-2 text-xs text-white max-w-[200px]">
        <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
          <Layers className="h-3 w-3 text-teal-400" /> Layer Database Real
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
              <span className="h-2 w-2 rounded-full bg-teal-500"></span> Zona Real ({realZones.length})
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
              <Truck className="h-3 w-3 text-amber-400" /> Truk Booking Real ({realBookings.length})
            </span>
          </label>
        </div>
      </div>

      {/* Selected Feature Modal Popup */}
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

      {/* Bottom Status Bar */}
      <div className="absolute bottom-4 left-4 z-20 bg-slate-900/90 px-3.5 py-2 rounded-2xl border border-slate-800 text-white text-xs backdrop-blur-md shadow-xl flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
          <span className="font-bold text-slate-200">Supabase Realtime DB</span>
        </div>
        <div className="h-3 w-[1px] bg-slate-700"></div>
        <div className="flex items-center gap-1.5 text-teal-400 font-bold">
          <Truck className="h-3.5 w-3.5" />
          <span>{realBookings.length} Booking Real Active</span>
        </div>
      </div>

      {/* Bottom Right Indicator */}
      <div className="absolute bottom-4 right-4 z-20 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] text-slate-300 font-mono backdrop-blur-md">
        Mode: <span className="font-bold text-teal-400 uppercase">{mapMode}</span> | {is3D ? '3D Extrusion' : '2D Ortho'}
      </div>
    </Card>
  );
}
