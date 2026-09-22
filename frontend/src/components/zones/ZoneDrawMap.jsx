import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { createClient } from '../../lib/supabase/client.js';
import { Card } from '../ui/card.jsx';
import {
  Layers,
  Globe,
  Box,
  Compass,
  RotateCcw,
  RotateCw,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  RefreshCw,
} from 'lucide-react';

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
    { id: 'bg-street', type: 'background', paint: { 'background-color': '#0f172a' } },
    { id: 'osm-street-layer', type: 'raster', source: 'osm-street-tiles', minzoom: 0, maxzoom: 19 },
  ],
};

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

const PREDEFINED_ZONE_COORDS = {
  '11111111-1111-1111-1111-111111111111': [[[106.812, -6.185], [106.822, -6.185], [106.822, -6.195], [106.812, -6.195], [106.812, -6.185]]],
  '22222222-2222-2222-2222-222222222222': [[[106.870, -6.105], [106.892, -6.105], [106.892, -6.125], [106.870, -6.125], [106.870, -6.105]]],
  '33333333-3333-3333-3333-333333333333': [[[106.818, -6.200], [106.828, -6.200], [106.823, -6.230], [106.813, -6.230], [106.818, -6.200]]],
  '44444444-4444-4444-4444-444444444444': [[[106.895, -6.150], [106.915, -6.150], [106.915, -6.170], [106.895, -6.170], [106.895, -6.150]]],
  '55555555-5555-5555-5555-555555555555': [[[106.910, -6.185], [106.932, -6.185], [106.932, -6.205], [106.910, -6.205], [106.910, -6.185]]],
  '66666666-6666-6666-6666-666666666666': [[[106.810, -6.138], [106.830, -6.138], [106.830, -6.155], [106.810, -6.155], [106.810, -6.138]]],
};

function parseBoundaryPolygon(poly, zoneId, zoneIndex = 0) {
  if (poly && typeof poly === 'object' && poly.type === 'Polygon' && Array.isArray(poly.coordinates)) {
    return poly.coordinates;
  }

  if (typeof poly === 'string' && poly.toUpperCase().includes('POLYGON')) {
    const match = poly.match(/\(\((.*?)\)\)/);
    if (match && match[1]) {
      const coords = match[1].split(',').map((pair) => {
        const [lng, lat] = pair.trim().split(/\s+/).map(Number);
        return [lng, lat];
      });
      if (coords.length >= 3) return [coords];
    }
  }

  if (zoneId && PREDEFINED_ZONE_COORDS[zoneId]) {
    return PREDEFINED_ZONE_COORDS[zoneId];
  }

  const baseLng = 106.812 + (zoneIndex % 4) * 0.035;
  const baseLat = -6.185 - Math.floor(zoneIndex / 4) * 0.035;
  return [[
    [baseLng, baseLat],
    [baseLng + 0.025, baseLat],
    [baseLng + 0.025, baseLat - 0.02],
    [baseLng, baseLat - 0.02],
    [baseLng, baseLat]
  ]];
}

export function ZoneDrawMap() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  const [mapMode, setMapMode] = useState('street'); // 'street' | 'satellite' | 'dark'
  const [is3D, setIs3D] = useState(true);
  const [realZones, setRealZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadRealZones = async () => {
    setLoading(true);
    const supabase = createClient();
    try {
      const { data } = await supabase.from('zones').select('*').order('created_at', { ascending: false });
      if (data) setRealZones(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: VECTORSTREET_STYLE,
      center: [106.83, -6.18],
      zoom: 11.8,
      pitch: 50,
      bearing: -15,
      antialias: true,
      dragRotate: true,
      pitchWithRotate: true,
      touchPitch: true,
      touchZoomRotate: true,
      maxParallelImageRequests: 16,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), 'top-right');

    map.on('load', () => {
      loadRealZones();
    });

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const zoneFeatures = realZones
      .map((z, idx) => {
        const coords = parseBoundaryPolygon(z.boundary_polygon, z.id, idx);
        if (!coords) return null;

        return {
          type: 'Feature',
          properties: {
            id: z.id,
            name: z.name,
            maxCapacity: z.max_truck_capacity || 10,
            zoneType: z.zone_type || 'logistics',
            priority: z.priority_level || 'normal',
            color: idx % 3 === 0 ? '#ef4444' : idx % 3 === 1 ? '#f59e0b' : '#10b981',
            height: 40 + idx * 10,
          },
          geometry: {
            type: 'Polygon',
            coordinates: coords,
          },
        };
      })
      .filter(Boolean);

    const geojson = { type: 'FeatureCollection', features: zoneFeatures };

    if (map.getSource('draw-zones-source')) {
      map.getSource('draw-zones-source').setData(geojson);
    } else {
      map.addSource('draw-zones-source', { type: 'geojson', data: geojson });

      map.addLayer({
        id: 'draw-zones-fill',
        type: 'fill',
        source: 'draw-zones-source',
        paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0.35 },
      });

      map.addLayer({
        id: 'draw-zones-line',
        type: 'line',
        source: 'draw-zones-source',
        paint: { 'line-color': ['get', 'color'], 'line-width': 3.5 },
      });

      map.addLayer({
        id: 'draw-zones-extrusion',
        type: 'fill-extrusion',
        source: 'draw-zones-source',
        paint: {
          'fill-extrusion-color': ['get', 'color'],
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.55,
        },
      });

      map.on('click', 'draw-zones-fill', (e) => {
        if (e.features && e.features[0]) {
          const props = e.features[0].properties;
          setSelectedZone(props);
        }
      });
    }
  }, [realZones]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    let targetStyle = VECTORSTREET_STYLE;
    if (mapMode === 'satellite') targetStyle = SATELLITE_STYLE;
    else if (mapMode === 'dark') targetStyle = VECTORDARK_STYLE;

    map.setStyle(targetStyle);
  }, [mapMode]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.easeTo({
      pitch: is3D ? 55 : 0,
      bearing: is3D ? -15 : 0,
      duration: 1000,
    });
  }, [is3D]);

  // MANUAL CAMERA ROTATION & PANNING
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

  const handleResetNorth = () => {
    const map = mapRef.current;
    if (!map) return;
    map.easeTo({
      center: [106.8272, -6.1754],
      zoom: 13,
      pitch: is3D ? 55 : 0,
      bearing: 0,
      duration: 600,
    });
  };

  return (
    <Card className="p-0 h-[420px] sm:h-[500px] overflow-hidden relative bg-slate-950 border border-slate-800 shadow-xl rounded-2xl sm:rounded-3xl">
      <div ref={mapContainerRef} className="w-full h-full bg-slate-950" />

      {/* Floating Mode Switcher Top Left - Mobile Responsive */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex items-center gap-1.5 sm:gap-2 bg-slate-900/90 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-slate-700/80 backdrop-blur-md shadow-lg text-[10px] sm:text-xs text-white max-w-[85vw] sm:max-w-none">
        <button
          type="button"
          onClick={() => setMapMode('street')}
          className={`px-2.5 py-1 rounded-lg sm:rounded-xl font-bold flex items-center gap-1 transition ${
            mapMode === 'street' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Vektor
        </button>
        <button
          type="button"
          onClick={() => setMapMode('satellite')}
          className={`px-2.5 py-1 rounded-lg sm:rounded-xl font-bold flex items-center gap-1 transition ${
            mapMode === 'satellite' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Globe className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Satelit
        </button>
        <button
          type="button"
          onClick={() => setMapMode('dark')}
          className={`px-2.5 py-1 rounded-lg sm:rounded-xl font-bold flex items-center gap-1 transition ${
            mapMode === 'dark' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-300" /> Gelap
        </button>
        <button
          type="button"
          onClick={() => setIs3D(!is3D)}
          className={`px-2.5 py-1 rounded-lg sm:rounded-xl font-bold flex items-center gap-1 border transition ${
            is3D ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' : 'bg-slate-800 text-slate-300 border-slate-700'
          }`}
        >
          <Box className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> {is3D ? '3D' : '2D'}
        </button>
        <button
          type="button"
          onClick={loadRealZones}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700"
          title="Refresh Data DB"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-teal-400' : ''}`} />
        </button>
      </div>

      {/* Manual Navigation Controls Bottom Right - Mobile Responsive */}
      <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-20 bg-slate-900/90 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border border-slate-700/80 backdrop-blur-md shadow-2xl flex flex-col items-center gap-1.5 text-white text-[10px] sm:text-xs">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleRotateLeft}
            className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 hover:bg-teal-600 text-white font-bold flex items-center gap-1 transition"
            title="Putar Kiri 35°"
          >
            <RotateCcw className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Kiri
          </button>
          <button
            type="button"
            onClick={handleResetNorth}
            className="p-1 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-amber-400 transition"
            title="Reset Utara"
          >
            <Compass className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
          <button
            type="button"
            onClick={handleRotateRight}
            className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 hover:bg-teal-600 text-white font-bold flex items-center gap-1 transition"
            title="Putar Kanan 35°"
          >
            Kanan <RotateCw className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
        </div>

        {/* D-Pad Pan Direction Controls */}
        <div className="flex items-center gap-1">
          <button type="button" onClick={handlePanLeft} className="p-1 rounded bg-slate-800 hover:bg-slate-700"><ArrowLeft className="h-3 w-3" /></button>
          <div className="flex flex-col gap-0.5">
            <button type="button" onClick={handlePanUp} className="p-1 rounded bg-slate-800 hover:bg-slate-700"><ArrowUp className="h-3 w-3" /></button>
            <button type="button" onClick={handlePanDown} className="p-1 rounded bg-slate-800 hover:bg-slate-700"><ArrowDown className="h-3 w-3" /></button>
          </div>
          <button type="button" onClick={handlePanRight} className="p-1 rounded bg-slate-800 hover:bg-slate-700"><ArrowRight className="h-3 w-3" /></button>
        </div>
      </div>

      {/* Selected Zone Popup */}
      {selectedZone && (
        <div className="absolute top-16 left-3 z-30 bg-slate-900/95 p-3 rounded-2xl border border-teal-500/40 text-white text-xs w-64 space-y-1">
          <div className="flex justify-between items-center border-b border-slate-800 pb-1">
            <span className="font-bold text-teal-400">{selectedZone.name}</span>
            <button onClick={() => setSelectedZone(null)} className="text-slate-400 font-bold">×</button>
          </div>
          <p className="text-[10px] text-slate-300">Tipe: {selectedZone.zoneType} | Kapasitas: {selectedZone.maxCapacity} Truk</p>
        </div>
      )}

      <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20 bg-slate-900/90 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border border-slate-800 text-[9px] sm:text-[11px] text-slate-300 font-mono backdrop-blur-md max-w-[70vw] sm:max-w-none truncate">
        Editor Batas Poligon GeoJSON Real Database ({realZones.length} Zona)
      </div>
    </Card>
  );
}
