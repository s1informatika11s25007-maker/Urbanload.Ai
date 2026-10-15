import React, { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useRealtimeZones } from '../../hooks/useRealtimeZones.js';
import { Card } from '../ui/card.jsx';
import { Button } from '../ui/button.jsx';
import {
  Layers,
  Globe,
  Box,
  ShieldCheck,
  Building2,
  MapPin,
  Circle,
  RotateCcw,
  Check
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
      ],
      tileSize: 256,
      attribution: 'Esri, Maxar, Earthstar Geographics',
      maxzoom: 19,
    },
  },
  layers: [
    { id: 'bg-sat', type: 'background', paint: { 'background-color': '#020617' } },
    { id: 'satellite-layer', type: 'raster', source: 'esri-satellite-tiles', minzoom: 0, maxzoom: 19 },
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
  },
  layers: [
    { id: 'bg-dark', type: 'background', paint: { 'background-color': '#090d16' } },
    { id: 'dark-layer', type: 'raster', source: 'esri-dark-tiles', minzoom: 0, maxzoom: 19 },
  ],
};

const PRESET_CORRIDORS = [
  [[106.8100, -6.1800], [106.8250, -6.1800], [106.8250, -6.1920], [106.8100, -6.1920], [106.8100, -6.1800]],
  [[106.8750, -6.1080], [106.8950, -6.1080], [106.8950, -6.1220], [106.8750, -6.1220], [106.8750, -6.1080]],
  [[106.8950, -6.1850], [106.9150, -6.1850], [106.9150, -6.2000], [106.8950, -6.2000], [106.8950, -6.1850]],
];

function generateCirclePolygon([centerLng, centerLat], radiusMeters, numPoints = 32) {
  const coords = [];
  const km = radiusMeters / 1000;
  const radLat = (centerLat * Math.PI) / 180;

  for (let i = 0; i <= numPoints; i++) {
    const angle = (i * 2 * Math.PI) / numPoints;
    const dLat = (km / 6371) * (180 / Math.PI) * Math.cos(angle);
    const dLng = (km / (6371 * Math.cos(radLat))) * (180 / Math.PI) * Math.sin(angle);
    coords.push([Number((centerLng + dLng).toFixed(6)), Number((centerLat + dLat).toFixed(6))]);
  }
  return [coords];
}

function coordsToWKT(ring) {
  if (!ring || ring.length < 3) return '';
  const closed = [...ring];
  if (closed[0][0] !== closed[closed.length - 1][0] || closed[0][1] !== closed[closed.length - 1][1]) {
    closed.push(closed[0]);
  }
  const pairs = closed.map(([lng, lat]) => `${lng.toFixed(6)} ${lat.toFixed(6)}`).join(', ');
  return `POLYGON((${pairs}))`;
}

function parseEWKBHex(cleanHex) {
  try {
    const bytes = new Uint8Array(cleanHex.length / 2);
    for (let i = 0; i < cleanHex.length; i += 2) {
      bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
    }
    const view = new DataView(bytes.buffer);
    const isLittleEndian = bytes[0] === 1;
    let offset = 1;

    let geomType = isLittleEndian ? view.getUint32(offset, true) : view.getUint32(offset, false);
    offset += 4;

    const hasSRID = (geomType & 0x20000000) !== 0;
    const hasZ = (geomType & 0x80000000) !== 0 || (geomType >= 1000 && geomType < 2000) || (geomType >= 3000 && geomType < 4000);
    const hasM = (geomType & 0x40000000) !== 0 || (geomType >= 2000 && geomType < 3000) || (geomType >= 3000 && geomType < 4000);

    geomType = geomType & 0x0fffffff;
    if (geomType >= 1000) geomType = geomType % 1000;

    if (hasSRID) offset += 4;

    let numRings = 0;
    if (geomType === 3) {
      numRings = isLittleEndian ? view.getUint32(offset, true) : view.getUint32(offset, false);
      offset += 4;
    } else if (geomType === 6) {
      const numPolys = isLittleEndian ? view.getUint32(offset, true) : view.getUint32(offset, false);
      offset += 4;
      if (numPolys > 0) {
        offset += 5;
        if (hasSRID) offset += 4;
        numRings = isLittleEndian ? view.getUint32(offset, true) : view.getUint32(offset, false);
        offset += 4;
      }
    }

    if (numRings <= 0) return null;

    const rings = [];
    for (let r = 0; r < numRings; r++) {
      const numPoints = isLittleEndian ? view.getUint32(offset, true) : view.getUint32(offset, false);
      offset += 4;
      const ring = [];
      for (let p = 0; p < numPoints; p++) {
        if (offset + 16 > view.byteLength) break;
        const lng = isLittleEndian ? view.getFloat64(offset, true) : view.getFloat64(offset, false);
        offset += 8;
        const lat = isLittleEndian ? view.getFloat64(offset, true) : view.getFloat64(offset, false);
        offset += 8;

        if (hasZ) offset += 8;
        if (hasM) offset += 8;

        if (!isNaN(lng) && !isNaN(lat) && lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90) {
          ring.push([lng, lat]);
        }
      }
      if (ring.length >= 3) {
        rings.push(ring);
      }
    }
    return rings.length > 0 ? rings : null;
  } catch (err) {
    console.warn('EWKB parse warning, using fallback:', err);
    return null;
  }
}

function parseBoundaryPolygon(poly, fallbackIndex = 0) {
  if (!poly) return [PRESET_CORRIDORS[fallbackIndex % PRESET_CORRIDORS.length]];

  if (typeof poly === 'object') {
    if (poly.type === 'Polygon' && Array.isArray(poly.coordinates)) {
      return poly.coordinates;
    }
    if (poly.type === 'MultiPolygon' && Array.isArray(poly.coordinates) && poly.coordinates[0]) {
      return poly.coordinates[0];
    }
  }

  if (typeof poly === 'string') {
    const trimmed = poly.trim();

    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed.type === 'Polygon' && Array.isArray(parsed.coordinates)) return parsed.coordinates;
        if (parsed.type === 'MultiPolygon' && Array.isArray(parsed.coordinates) && parsed.coordinates[0]) return parsed.coordinates[0];
        if (Array.isArray(parsed) && Array.isArray(parsed[0])) return parsed;
      } catch (e) {
        // Continue
      }
    }

    const cleanHex = trimmed.replace(/^(\\x|0x)/i, '');
    if (/^[0-9a-fA-F]{30,}$/.test(cleanHex)) {
      const ewkbRings = parseEWKBHex(cleanHex);
      if (ewkbRings && ewkbRings.length > 0) return ewkbRings;
    }

    const wktUpper = trimmed.toUpperCase();
    if (wktUpper.includes('POLYGON')) {
      const match = trimmed.match(/\(\((.*?)\)\)/) || trimmed.match(/\((.*?)\)/);
      if (match && match[1]) {
        const coords = match[1]
          .split(',')
          .map((pair) => {
            const parts = pair.trim().split(/\s+/).map(Number);
            return [parts[0], parts[1]];
          })
          .filter(([lng, lat]) => !isNaN(lng) && !isNaN(lat) && lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90);
        if (coords.length >= 3) return [coords];
      }
    }
  }

  return [PRESET_CORRIDORS[fallbackIndex % PRESET_CORRIDORS.length]];
}

export function ZoneDrawMap({ readOnly = false, onSelectNewZoneWKT }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const zonePinMarkersRef = useRef([]);
  const customPinsRef = useRef([]);

  const [mapMode, setMapMode] = useState('street');
  const [is3D, setIs3D] = useState(true);

  // AUTOMATIC REALTIME ZONES HOOK
  const { zones: realZones } = useRealtimeZones();

  // INTERACTIVE DRAWING STATES
  const [drawMode, setDrawMode] = useState('pins');
  const [placedPins, setPlacedPins] = useState([]);
  const [zoneRadiusMeters, setZoneRadiusMeters] = useState(300);
  const [currentCreatedWKT, setCurrentCreatedWKT] = useState('');
  const [selectedZone, setSelectedZone] = useState(null);

  const updateCustomDrawLayer = useCallback(() => {
    if (readOnly) return;
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    let coords = [];
    if (placedPins.length === 0) {
      if (map.getLayer('custom-draw-fill')) map.removeLayer('custom-draw-fill');
      if (map.getLayer('custom-draw-outline')) map.removeLayer('custom-draw-outline');
      if (map.getSource('custom-draw-source')) map.removeSource('custom-draw-source');
      setCurrentCreatedWKT('');
      return;
    }

    if (drawMode === 'radius' && placedPins.length > 0) {
      const centerPin = placedPins[0];
      const circleRings = generateCirclePolygon(centerPin, zoneRadiusMeters);
      coords = circleRings[0];
    } else if (placedPins.length >= 3) {
      coords = [...placedPins, placedPins[0]];
    } else {
      coords = placedPins;
    }

    if (coords.length < 3) return;

    const wkt = coordsToWKT(coords);
    setCurrentCreatedWKT(wkt);

    const geojson = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [coords]
      }
    };

    if (map.getSource('custom-draw-source')) {
      map.getSource('custom-draw-source').setData(geojson);
    } else {
      map.addSource('custom-draw-source', { type: 'geojson', data: geojson });

      map.addLayer({
        id: 'custom-draw-fill',
        type: 'fill',
        source: 'custom-draw-source',
        paint: { 'fill-color': '#f59e0b', 'fill-opacity': 0.55 },
      });

      map.addLayer({
        id: 'custom-draw-outline',
        type: 'line',
        source: 'custom-draw-source',
        paint: { 'line-color': '#f59e0b', 'line-width': 4.5 },
      });
    }
  }, [placedPins, drawMode, zoneRadiusMeters, readOnly]);

  const handleMapClick = useCallback((e) => {
    if (readOnly) return;
    const { lng, lat } = e.lngLat;
    const newPoint = [Number(lng.toFixed(6)), Number(lat.toFixed(6))];

    if (drawMode === 'radius') {
      setPlacedPins([newPoint]);
    } else {
      setPlacedPins((prev) => [...prev, newPoint]);
    }
  }, [drawMode, readOnly]);

  useEffect(() => {
    if (readOnly) return;
    const map = mapRef.current;
    if (!map) return;

    customPinsRef.current.forEach((m) => m.remove());
    customPinsRef.current = [];

    placedPins.forEach(([lng, lat], idx) => {
      const el = document.createElement('div');
      el.className = 'cursor-pointer hover:scale-125 transition-transform duration-200 z-50';
      el.innerHTML = `
        <div class="flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded-full shadow-2xl border-2 border-white font-black text-[10px] animate-bounce">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          <span>Pin #${idx + 1}</span>
        </div>
      `;

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(map);

      customPinsRef.current.push(marker);
    });

    updateCustomDrawLayer();
  }, [placedPins, updateCustomDrawLayer, readOnly]);

  const renderZoneLayers = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !realZones || !realZones.length) return;

    zonePinMarkersRef.current.forEach((m) => m.remove());
    zonePinMarkersRef.current = [];

    const bounds = new maplibregl.LngLatBounds();

    const zoneFeatures = realZones
      .map((z, idx) => {
        const coords = parseBoundaryPolygon(z.boundary_polygon, idx);
        if (!coords || !coords[0]) return null;

        const ring = coords[0];
        ring.forEach(([lng, lat]) => {
          if (!isNaN(lng) && !isNaN(lat)) {
            bounds.extend([lng, lat]);
          }
        });

        const centerLng = ring.reduce((acc, p) => acc + p[0], 0) / ring.length;
        const centerLat = ring.reduce((acc, p) => acc + p[1], 0) / ring.length;

        const zoneColor = idx % 4 === 0 ? '#10b981' : idx % 4 === 1 ? '#06b6d4' : idx % 4 === 2 ? '#f59e0b' : '#3b82f6';

        const el = document.createElement('div');
        el.className = 'group cursor-pointer z-20';
        el.innerHTML = `
          <div class="flex items-center gap-1.5 bg-slate-900/95 text-white px-3 py-1.5 rounded-2xl border-2 border-teal-400 shadow-2xl backdrop-blur-md hover:scale-125 transition-transform">
            <span class="text-sm">🏢</span>
            <div class="flex flex-col text-left leading-none">
              <span class="text-[11px] font-black font-mono text-teal-300">${z.name}</span>
              <span class="text-[9px] text-slate-300 font-bold">Kapasitas: ${z.max_truck_capacity || 10} Slot</span>
            </div>
          </div>
        `;

        el.addEventListener('click', () => {
          setSelectedZone({
            id: z.id,
            name: z.name,
            maxCapacity: z.max_truck_capacity || 10,
            zoneType: z.zone_type || 'logistics',
            priority: z.priority_level || 'normal',
            operatingHours: `${z.operating_hours_start || '06:00'} - ${z.operating_hours_end || '22:00'}`
          });
        });

        const pinMarker = new maplibregl.Marker({ element: el })
          .setLngLat([centerLng, centerLat])
          .addTo(map);

        zonePinMarkersRef.current.push(pinMarker);

        return {
          type: 'Feature',
          properties: {
            id: z.id,
            name: z.name,
            maxCapacity: z.max_truck_capacity || 10,
            color: zoneColor,
            height: 50 + idx * 15,
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
        paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0.45 },
      });

      map.addLayer({
        id: 'draw-zones-line',
        type: 'line',
        source: 'draw-zones-source',
        paint: { 'line-color': ['get', 'color'], 'line-width': 4.0 },
      });

      map.addLayer({
        id: 'draw-zones-extrusion',
        type: 'fill-extrusion',
        source: 'draw-zones-source',
        paint: {
          'fill-extrusion-color': ['get', 'color'],
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.65,
        },
      });
    }

    if (!bounds.isEmpty() && placedPins.length === 0) {
      map.fitBounds(bounds, { padding: 60, maxZoom: 13, duration: 1000 });
    }
  }, [realZones, placedPins.length]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: VECTORSTREET_STYLE,
      center: [106.83, -6.18],
      zoom: 11.5,
      pitch: 50,
      bearing: -15,
      antialias: true,
      dragRotate: true,
      pitchWithRotate: true,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), 'top-right');

    if (!readOnly) {
      map.on('click', handleMapClick);
    }

    mapRef.current = map;

    return () => {
      zonePinMarkersRef.current.forEach((m) => m.remove());
      customPinsRef.current.forEach((m) => m.remove());
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [handleMapClick, readOnly]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (map.isStyleLoaded()) {
      renderZoneLayers();
      updateCustomDrawLayer();
    } else {
      map.once('style.load', () => {
        renderZoneLayers();
        updateCustomDrawLayer();
      });
    }
  }, [realZones, renderZoneLayers, updateCustomDrawLayer]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    let targetStyle = VECTORSTREET_STYLE;
    if (mapMode === 'satellite') targetStyle = SATELLITE_STYLE;
    else if (mapMode === 'dark') targetStyle = VECTORDARK_STYLE;

    map.setStyle(targetStyle);

    if (map.isStyleLoaded()) {
      renderZoneLayers();
      updateCustomDrawLayer();
    } else {
      map.once('style.load', () => {
        renderZoneLayers();
        updateCustomDrawLayer();
      });
    }
  }, [mapMode, renderZoneLayers, updateCustomDrawLayer]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (map.getLayer('draw-zones-extrusion')) {
      map.setLayoutProperty('draw-zones-extrusion', 'visibility', is3D ? 'visible' : 'none');
    }
  }, [is3D]);

  const handleResetPins = () => {
    setPlacedPins([]);
    setCurrentCreatedWKT('');
    customPinsRef.current.forEach((m) => m.remove());
    customPinsRef.current = [];
  };

  const handleConfirmCustomWKT = () => {
    if (currentCreatedWKT && onSelectNewZoneWKT) {
      onSelectNewZoneWKT(currentCreatedWKT);
    }
  };

  return (
    <Card className="p-0 h-[420px] sm:h-[520px] overflow-hidden relative bg-slate-950 border border-slate-800 shadow-xl rounded-2xl sm:rounded-3xl">
      <div ref={mapContainerRef} className={`w-full h-full bg-slate-950 ${readOnly ? '' : 'cursor-crosshair'}`} />

      {/* FLOATING MULTI-PIN & RADIUS INTERACTIVE EDITOR CONTROLS OVERLAY */}
      {!readOnly && (
        <div className="absolute top-3 left-3 right-3 sm:left-4 sm:right-auto z-20 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-900/95 p-2 sm:p-2.5 rounded-2xl border border-teal-500/40 backdrop-blur-md shadow-2xl text-xs text-white max-w-full sm:max-w-2xl">
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => setDrawMode('pins')}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition ${
                drawMode === 'pins' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <MapPin className="h-3.5 w-3.5 text-red-400" /> Multi-Pin
            </button>
            <button
              type="button"
              onClick={() => setDrawMode('radius')}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition ${
                drawMode === 'radius' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Circle className="h-3.5 w-3.5 text-amber-400" /> Mode Radius
            </button>
          </div>

          {drawMode === 'radius' && (
            <div className="flex items-center gap-2 bg-slate-800/90 px-2.5 py-1 rounded-xl border border-slate-700 text-[11px] shrink-0">
              <span className="font-bold text-amber-300 whitespace-nowrap">Radius: {zoneRadiusMeters} m</span>
              <input
                type="range"
                min="50"
                max="1500"
                step="25"
                value={zoneRadiusMeters}
                onChange={(e) => setZoneRadiusMeters(Number(e.target.value))}
                className="w-24 accent-amber-500 cursor-pointer"
              />
            </div>
          )}

          <div className="flex items-center gap-1.5 ml-auto">
            {placedPins.length > 0 && (
              <button
                type="button"
                onClick={handleResetPins}
                className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center gap-1 transition border border-slate-700 text-[11px]"
                title="Hapus semua pin merah"
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </button>
            )}

            {currentCreatedWKT && (
              <Button
                type="button"
                onClick={handleConfirmCustomWKT}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black flex items-center gap-1 shadow-md text-xs animate-pulse"
              >
                <Check className="h-4 w-4" /> Terapkan Poligon Ini
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Floating Style Switcher Top Right */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-[11px] text-white backdrop-blur-md shadow-lg">
        <button
          type="button"
          onClick={() => setMapMode('street')}
          className={`px-2 py-0.5 rounded-lg font-bold transition ${
            mapMode === 'street' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="h-3 w-3 inline mr-1" /> Vektor
        </button>
        <button
          type="button"
          onClick={() => setMapMode('satellite')}
          className={`px-2 py-0.5 rounded-lg font-bold transition ${
            mapMode === 'satellite' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Globe className="h-3 w-3 inline mr-1" /> Satelit
        </button>
        <button
          type="button"
          onClick={() => setMapMode('dark')}
          className={`px-2 py-0.5 rounded-lg font-bold transition ${
            mapMode === 'dark' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Gelap
        </button>
        <button
          type="button"
          onClick={() => setIs3D(!is3D)}
          className={`px-2 py-0.5 rounded-lg font-bold border transition ${
            is3D ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' : 'bg-slate-800 text-slate-300 border-slate-700'
          }`}
        >
          <Box className="h-3 w-3 inline mr-1" /> {is3D ? '3D' : '2D'}
        </button>
      </div>

      {/* Status Overlay Bottom Left */}
      <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-200 backdrop-blur-md flex items-center gap-2 shadow-xl">
        {readOnly ? (
          <>
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Tampilan Peta Spasial PostGIS ({(realZones || []).length} Zona Aktif) — Klik 'Manage Zona' untuk Edit/Tambah/Hapus</span>
          </>
        ) : (
          <>
            <MapPin className="h-4 w-4 text-red-500 animate-bounce shrink-0" />
            <span>
              {drawMode === 'pins'
                ? 'Klik pada peta untuk menandai pin merah. Tandai 3+ pin untuk membentuk poligon zona.'
                : 'Klik pada peta untuk menaruh titik pusat, lalu geser slider radius zona.'}
            </span>
          </>
        )}
      </div>

      {/* Selected Zone Popup */}
      {selectedZone && (
        <div className="absolute top-16 left-3 z-30 bg-slate-900/95 p-4 rounded-2xl border border-teal-500/50 text-white text-xs w-72 space-y-2 shadow-2xl backdrop-blur-md animate-in fade-in">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="font-bold text-teal-400 flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-teal-400" /> {selectedZone.name}
            </span>
            <button onClick={() => setSelectedZone(null)} className="text-slate-400 hover:text-white font-bold text-sm">×</button>
          </div>
          <div className="space-y-1 text-[11px] text-slate-300 font-mono">
            <p>• Tipe Zona: <strong className="text-white">{selectedZone.zoneType}</strong></p>
            <p>• Kapasitas Maks: <strong className="text-teal-300">{selectedZone.maxCapacity} Truk</strong></p>
            <p>• Prioritas: <strong className="text-amber-300">{selectedZone.priority}</strong></p>
            <p>• Operasional: <strong className="text-slate-200">{selectedZone.operatingHours}</strong></p>
          </div>
        </div>
      )}
    </Card>
  );
}
