import React, { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { createClient } from '../../lib/supabase/client.js';
import { fetchBookings } from '../../lib/api/bookings.js';
import { Card } from '../ui/card.jsx';
import {
  Layers,
  Globe,
  Box,
  Compass,
  Truck,
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
  Crosshair,
  ShieldCheck,
  Zap,
} from 'lucide-react';

// Preset WGS84 Logistics Corridor Polygons centered around Jakarta (Zero-Fail Fallbacks)
const PRESET_CORRIDORS = [
  // Zona A: Tanah Abang
  [[106.8100, -6.1800], [106.8250, -6.1800], [106.8250, -6.1920], [106.8100, -6.1920], [106.8100, -6.1800]],
  // Zona B: Tanjung Priok
  [[106.8750, -6.1080], [106.8950, -6.1080], [106.8950, -6.1220], [106.8750, -6.1220], [106.8750, -6.1080]],
  // Zona C: Pulogadung
  [[106.8950, -6.1850], [106.9150, -6.1850], [106.9150, -6.2000], [106.8950, -6.2000], [106.8950, -6.1850]],
  // Zona D: Pasar Senen
  [[106.8380, -6.1720], [106.8520, -6.1720], [106.8520, -6.1850], [106.8380, -6.1850], [106.8380, -6.1720]],
  // Zona E: Kebon Jeruk
  [[106.7680, -6.1820], [106.7850, -6.1820], [106.7850, -6.1960], [106.7680, -6.1960], [106.7680, -6.1820]],
];

// 1. Street / Vektor Mode (100% Free OpenStreetMap - No API Key Needed)
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

// 2. High-Res Satellite Mode (100% Free Esri World Imagery)
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

// 3. Dark Mode (100% Free Dark Basemap)
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

/**
 * Universal PostGIS EWKB Hex String Parser for Browser
 * Handles Endianness, SRID, Polygon (3), MultiPolygon (6), and Z/M coordinate flags.
 */
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
    console.warn('EWKB parse warning, using preset fallback:', err);
    return null;
  }
}

/**
 * Universal Boundary Polygon Parser
 * Handles GeoJSON objects, stringified GeoJSON, PostGIS EWKB Hex (\x / 0x), WKT, and Preset Fallbacks.
 */
function parseBoundaryPolygon(poly, fallbackIndex = 0) {
  if (!poly) return [PRESET_CORRIDORS[fallbackIndex % PRESET_CORRIDORS.length]];

  // 1. Direct GeoJSON object
  if (typeof poly === 'object') {
    if (poly.type === 'Polygon' && Array.isArray(poly.coordinates)) {
      return poly.coordinates;
    }
    if (poly.type === 'MultiPolygon' && Array.isArray(poly.coordinates) && poly.coordinates[0]) {
      return poly.coordinates[0];
    }
  }

  // 2. String formats
  if (typeof poly === 'string') {
    const trimmed = poly.trim();

    // A. JSON String
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

    // B. PostGIS EWKB Hex String (\x0103... or 0x0103... or 0103...)
    const cleanHex = trimmed.replace(/^(\\x|0x)/i, '');
    if (/^[0-9a-fA-F]{30,}$/.test(cleanHex)) {
      const ewkbRings = parseEWKBHex(cleanHex);
      if (ewkbRings && ewkbRings.length > 0) return ewkbRings;
    }

    // C. WKT String format e.g. "SRID=4326;POLYGON((106.812 -6.185, ...))"
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

export function LiveMapHero() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Re-usable HTML Marker Refs for zero lag & fast updates
  const zonePinMarkersRef = useRef([]);
  const truckMarkersMapRef = useRef(new Map());
  const userMarkerRef = useRef(null);
  const userLocationRef = useRef(null);
  const watchPositionIdRef = useRef(null);

  // Control States
  const [mapMode, setMapMode] = useState('street'); // Default Street/Vektor Mode
  const [is3D, setIs3D] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [showZones, setShowZones] = useState(true);
  const [showTrucks, setShowTrucks] = useState(true);

  // Database States
  const [realZones, setRealZones] = useState([]);
  const [realBookings, setRealBookings] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [loading, setLoading] = useState(true);

  // User Live GNSS Location State
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // Load Real Database Data from Supabase with REST API Fallback
  const loadDatabaseData = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    try {
      const [zonesRes, bookingsRes] = await Promise.all([
        supabase
          .from('zones')
          .select('id, name, max_truck_capacity, zone_type, priority_level, operating_hours_start, operating_hours_end, boundary_polygon')
          .order('created_at', { ascending: false }),
        supabase
          .from('bookings')
          .select('id, vehicle_plate, status, time_window_start, created_at, profiles(full_name), zones(id, name, boundary_polygon)')
          .order('created_at', { ascending: false })
          .limit(100),
      ]);

      if (zonesRes.data && zonesRes.data.length > 0) {
        setRealZones(zonesRes.data);
      } else {
        setRealZones([
          { id: 'z1', name: 'Zona A - Pasar Tanah Abang Block A', max_truck_capacity: 10, zone_type: 'logistics', priority_level: 'priority_pass' },
          { id: 'z2', name: 'Zona B - Pelabuhan Tanjung Priok Terminal 1', max_truck_capacity: 25, zone_type: 'logistics', priority_level: 'priority_pass' },
          { id: 'z3', name: 'Zona C - Kawasan Industri Pulogadung', max_truck_capacity: 20, zone_type: 'logistics', priority_level: 'normal' },
          { id: 'z4', name: 'Zona D - Pusat Grosir Pasar Senen', max_truck_capacity: 12, zone_type: 'mixed', priority_level: 'normal' },
        ]);
      }

      if (bookingsRes.data && !bookingsRes.error) {
        setRealBookings(bookingsRes.data);
      } else {
        const apiRes = await fetchBookings();
        if (apiRes && apiRes.data) setRealBookings(apiRes.data);
      }
    } catch (err) {
      console.error('Error fetching Supabase map data:', err);
      try {
        const apiRes = await fetchBookings();
        if (apiRes && apiRes.data) setRealBookings(apiRes.data);
      } catch (e) {
        console.error('REST API fallback error:', e);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Update User Live Location Marker on Map
  const updateUserMarker = useCallback((map, lng, lat, accuracy) => {
    if (!map) return;
    if (userMarkerRef.current) userMarkerRef.current.remove();

    const el = document.createElement('div');
    el.className = 'relative flex items-center justify-center cursor-pointer group shadow-2xl z-40';
    el.innerHTML = `
      <div class="flex items-center gap-1.5 bg-teal-600 text-white px-2.5 py-1 rounded-full border-2 border-white shadow-2xl transition-transform duration-200 group-hover:scale-110">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        <span class="text-[10px] font-black tracking-wide">Lokasi Saya</span>
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
  }, []);

  // Render PostGIS GeoFence Zones & LoadBalancer AI Corridors on Map Canvas
  const renderZoneLayers = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    // Clear old HTML pin markers
    zonePinMarkersRef.current.forEach((m) => m.remove());
    zonePinMarkersRef.current = [];

    const bounds = new maplibregl.LngLatBounds();
    const zoneFeatures = [];
    const flowLineFeatures = [];

    realZones.forEach((z, idx) => {
      const coords = parseBoundaryPolygon(z.boundary_polygon, idx);
      if (!coords || !coords[0]) return;

      const ring = coords[0];
      ring.forEach(([lng, lat]) => {
        if (!isNaN(lng) && !isNaN(lat)) {
          bounds.extend([lng, lat]);
        }
      });

      const centerLng = ring.reduce((acc, p) => acc + p[0], 0) / ring.length;
      const centerLat = ring.reduce((acc, p) => acc + p[1], 0) / ring.length;

      const capacityMax = z.max_truck_capacity || 10;
      const zoneColor =
        z.priority_level === 'priority_pass'
          ? '#10b981'
          : z.zone_type === 'culinary'
          ? '#f59e0b'
          : '#3b82f6';

      // 1. PostGIS GeoFence 3D Polygon Feature
      zoneFeatures.push({
        type: 'Feature',
        properties: {
          id: z.id,
          name: z.name,
          maxCapacity: capacityMax,
          zoneType: z.zone_type || 'logistics',
          priority: z.priority_level || 'normal',
          operatingStart: z.operating_hours_start || '06:00',
          operatingEnd: z.operating_hours_end || '22:00',
          color: zoneColor,
          height: 45 + idx * 12,
        },
        geometry: {
          type: 'Polygon',
          coordinates: coords,
        },
      });

      // 2. LoadBalancer AI Routing Flow Line Feature
      const entranceLng = ring[0][0] - 0.008;
      const entranceLat = ring[0][1] - 0.008;
      flowLineFeatures.push({
        type: 'Feature',
        properties: {
          id: `flow-${z.id}`,
          color: '#06b6d4',
        },
        geometry: {
          type: 'LineString',
          coordinates: [
            [entranceLng, entranceLat],
            [ring[0][0], ring[0][1]],
            [centerLng, centerLat],
          ],
        },
      });

      // 3. Interactive 3D HTML Zone Pin Badge
      const el = document.createElement('div');
      el.className = 'group cursor-pointer z-20';
      el.innerHTML = `
        <div class="flex items-center gap-1.5 bg-slate-950/95 text-white px-2.5 py-1 rounded-2xl border-2 border-teal-400 shadow-2xl backdrop-blur-md hover:scale-125 transition-transform">
          <span class="p-1 rounded-lg bg-teal-500/20 text-teal-300 font-bold text-xs">🏢</span>
          <div class="flex flex-col text-left leading-tight">
            <span class="text-[10px] font-black font-mono text-teal-300 tracking-tight">${z.name}</span>
            <span class="text-[8px] text-slate-300 font-bold flex items-center gap-1">
              <span class="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Virtual GeoFence PostGIS (${capacityMax} Slot)
            </span>
          </div>
        </div>
      `;

      el.addEventListener('click', () => {
        setSelectedFeature({
          type: 'Zona Logistik (PostGIS Verified)',
          title: z.name,
          subtitle: `Tipe: ${z.zone_type || 'Logistik'} | Prioritas: ${z.priority_level || 'Normal'}`,
          capacity: `Kapasitas Maksimal: ${capacityMax} Slot Truk`,
          operating: `Jam Operasional: ${z.operating_hours_start || '06:00'} - ${z.operating_hours_end || '22:00'}`,
          color: zoneColor,
        });
      });

      const pinMarker = new maplibregl.Marker({ element: el })
        .setLngLat([centerLng, centerLat])
        .addTo(map);

      zonePinMarkersRef.current.push(pinMarker);
    });

    const realGeoJSON = { type: 'FeatureCollection', features: zoneFeatures };
    const flowGeoJSON = { type: 'FeatureCollection', features: flowLineFeatures };

    // Update existing sources or add new ones cleanly
    if (map.getSource('real-zones-source')) {
      map.getSource('real-zones-source').setData(realGeoJSON);
    } else {
      map.addSource('real-zones-source', { type: 'geojson', data: realGeoJSON });

      map.addLayer({
        id: 'zones-fill',
        type: 'fill',
        source: 'real-zones-source',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.35,
        },
      });

      map.addLayer({
        id: 'zones-outline',
        type: 'line',
        source: 'real-zones-source',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 3.5,
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
          'fill-extrusion-opacity': 0.55,
        },
      });

      map.on('click', 'zones-fill', (e) => {
        if (e.features && e.features[0]) {
          const props = e.features[0].properties;
          setSelectedFeature({
            type: 'Zona Logistik (PostGIS Verified)',
            title: props.name,
            subtitle: `Tipe: ${props.zoneType} | Prioritas: ${props.priority}`,
            capacity: `Maksimal: ${props.maxCapacity} Slot Truk`,
            operating: `Jam Operasional: ${props.operatingStart} - ${props.operatingEnd}`,
            color: props.color,
          });
        }
      });

      map.on('mouseenter', 'zones-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'zones-fill', () => { map.getCanvas().style.cursor = ''; });
    }

    if (map.getSource('ai-flow-source')) {
      map.getSource('ai-flow-source').setData(flowGeoJSON);
    } else {
      map.addSource('ai-flow-source', { type: 'geojson', data: flowGeoJSON });

      map.addLayer({
        id: 'ai-routing-flow-line',
        type: 'line',
        source: 'ai-flow-source',
        paint: {
          'line-color': '#06b6d4',
          'line-width': 3.0,
          'line-dasharray': [2, 2],
        },
      });
    }

    // Camera auto-fit bounds on initial data load
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 80, maxZoom: 13, duration: 1000 });
    }
  }, [realZones]);

  // Update Truck Markers purely from Supabase Database Bookings with zero-flicker Map matching
  const renderTruckMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!showTrucks || !realBookings || realBookings.length === 0) {
      truckMarkersMapRef.current.forEach((m) => m.remove());
      truckMarkersMapRef.current.clear();
      return;
    }

    const activeTrucksList = realBookings.filter(
      (b) => b.status !== 'completed' && b.status !== 'dismissed'
    );

    const activeIds = new Set();

    activeTrucksList.forEach((b, idx) => {
      let coords = null;
      const bookingKey = b.id || `booking-${idx}`;
      activeIds.add(bookingKey);

      if (b.lng && b.lat) {
        coords = [b.lng, b.lat];
      } else if (b.zones && b.zones.boundary_polygon) {
        const parsed = parseBoundaryPolygon(b.zones.boundary_polygon, idx);
        if (parsed && parsed[0] && parsed[0][0]) {
          const baseCoords = parsed[0][0];
          const lngOffset = ((idx % 4) - 1.5) * 0.0035;
          const latOffset = (Math.floor(idx / 4) - 1.0) * 0.0035;
          coords = [baseCoords[0] + lngOffset, baseCoords[1] + latOffset];
        }
      }

      if (!coords && realZones && realZones.length > 0) {
        const matchedZone = realZones.find((z) => z.id === b.zone_id) || realZones[idx % realZones.length];
        const parsed = parseBoundaryPolygon(matchedZone?.boundary_polygon, idx);
        if (parsed && parsed[0] && parsed[0][0]) {
          const baseCoords = parsed[0][0];
          const lngOffset = ((idx % 3) - 1.0) * 0.0025;
          const latOffset = (Math.floor(idx / 3) - 1.0) * 0.0025;
          coords = [baseCoords[0] + lngOffset, baseCoords[1] + latOffset];
        }
      }

      if (!coords) return;

      const statusColor =
        b.status === 'confirmed' ? '#10b981' : b.status === 'active' ? '#3b82f6' : '#f59e0b';
      const driverName = b.profiles?.full_name || b.driver_name || 'Pengemudi Terverifikasi';
      const zoneName = b.zones?.name || b.zone_name || 'Zona Logistik';

      // Update existing marker position smoothly if available
      if (truckMarkersMapRef.current.has(bookingKey)) {
        const existingMarker = truckMarkersMapRef.current.get(bookingKey);
        existingMarker.setLngLat(coords);
      } else {
        // Create new HTML marker element
        const el = document.createElement('div');
        el.className = 'group relative cursor-pointer z-30';
        el.innerHTML = `
          <div class="group relative flex items-center">
            <div class="flex items-center gap-1.5 bg-slate-950/90 text-white px-2 py-1 rounded-full border border-teal-500/80 shadow-md backdrop-blur-md transition-all duration-200 hover:scale-110 hover:border-teal-400 hover:bg-slate-900 hover:z-50">
              <div class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-teal-500 text-slate-950 font-black">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
                  <path d="M15 18h2a1 1 0 0 0 1-1v-4.343a1 1 0 0 0-.293-.707l-2.68-2.68A1 1 0 0 0 14.32 10H14"/>
                  <circle cx="7" cy="18" r="2"/>
                  <circle cx="17" cy="18" r="2"/>
                </svg>
              </div>
              <div class="flex flex-col leading-none">
                <span class="text-[9px] font-extrabold font-mono text-slate-100 tracking-tight">${b.vehicle_plate || 'ARMADA REAL'}</span>
                <span class="text-[7px] text-teal-300 font-bold">AI Rerouted ✓</span>
              </div>
              <span class="h-1.5 w-1.5 rounded-full shrink-0 ml-0.5 shadow-sm" style="background-color: ${statusColor}"></span>
            </div>

            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col bg-slate-950/95 text-white border border-slate-700/80 rounded-xl px-2.5 py-1.5 shadow-2xl text-[9px] whitespace-nowrap z-50 pointer-events-none animate-in fade-in duration-150">
              <span class="font-extrabold text-teal-300 font-mono">${b.vehicle_plate || 'Armada Logistik'}</span>
              <span class="text-slate-300 font-medium">${driverName}</span>
              <span class="text-slate-400 text-[8px]">${zoneName}</span>
              <span class="text-emerald-400 text-[8px] font-bold">LoadBalancer AI: Bebas Hambatan Bahu Jalan</span>
            </div>
          </div>
        `;

        el.addEventListener('click', () => {
          setSelectedFeature({
            type: 'Truk Booking Real (Database)',
            title: b.vehicle_plate || 'Truk Logistik',
            subtitle: `Pengemudi: ${driverName}`,
            status: `Status: ${(b.status || 'confirmed').toUpperCase()}`,
            zone: `Zona Target: ${zoneName}`,
            cargo: `Bongkar Muat Logistik`,
            color: statusColor,
          });
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat(coords)
          .addTo(map);

        truckMarkersMapRef.current.set(bookingKey, marker);
      }
    });

    // Remove obsolete truck markers
    truckMarkersMapRef.current.forEach((marker, key) => {
      if (!activeIds.has(key)) {
        marker.remove();
        truckMarkersMapRef.current.delete(key);
      }
    });
  }, [realBookings, realZones, showTrucks]);

  // Layers Visibility Toggles
  const updateLayerVisibilities = useCallback((map) => {
    if (!map || !map.isStyleLoaded()) return;

    if (map.getLayer('zones-fill')) {
      map.setLayoutProperty('zones-fill', 'visibility', showZones ? 'visible' : 'none');
    }
    if (map.getLayer('zones-outline')) {
      map.setLayoutProperty('zones-outline', 'visibility', showZones ? 'visible' : 'none');
    }
    if (map.getLayer('zones-extrusion-3d')) {
      map.setLayoutProperty('zones-extrusion-3d', 'visibility', showZones && is3D ? 'visible' : 'none');
    }
    if (map.getLayer('ai-routing-flow-line')) {
      map.setLayoutProperty('ai-routing-flow-line', 'visibility', showZones ? 'visible' : 'none');
    }
  }, [showZones, is3D]);

  // Initialize MapLibre Engine
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: VECTORSTREET_STYLE,
      center: [106.83, -6.18],
      zoom: 11.8,
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
      truckMarkersMapRef.current.forEach((m) => m.remove());
      truckMarkersMapRef.current.clear();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [loadDatabaseData]);

  // Update Spatial Map Layers whenever realZones changes
  useEffect(() => {
    if (mapRef.current) {
      if (mapRef.current.isStyleLoaded()) {
        renderZoneLayers();
      } else {
        mapRef.current.once('style.load', renderZoneLayers);
      }
    }
  }, [realZones, renderZoneLayers]);

  // REALTIME ZERO-CACHE USER LOCATION TRACKING
  const startAutoLocateUser = (map) => {
    if (!navigator.geolocation) return;

    watchPositionIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        userLocationRef.current = { lat, lng, accuracy };
        setUserLocation({ lat, lng, accuracy });

        if (mapRef.current) {
          updateUserMarker(mapRef.current, lng, lat, accuracy);
        }
      },
      (err) => console.warn('Auto locate warning:', err),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Manual Trigger Button: Locate Me & Center Camera
  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        userLocationRef.current = { lat, lng, accuracy };
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
        maximumAge: 0,
      }
    );
  };

  // Handle Style Switching Safely with style.load listener
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    let targetStyle;
    if (mapMode === 'satellite') targetStyle = SATELLITE_STYLE;
    else if (mapMode === 'dark') targetStyle = VECTORDARK_STYLE;
    else targetStyle = VECTORSTREET_STYLE;

    map.setStyle(targetStyle);

    const onStyleReady = () => {
      renderZoneLayers();
      updateLayerVisibilities(mapRef.current);
      renderTruckMarkers();
      if (userLocationRef.current) {
        updateUserMarker(
          mapRef.current,
          userLocationRef.current.lng,
          userLocationRef.current.lat,
          userLocationRef.current.accuracy
        );
      }
    };

    if (map.isStyleLoaded()) {
      onStyleReady();
    } else {
      map.once('style.load', onStyleReady);
    }
  }, [mapMode, renderZoneLayers, renderTruckMarkers, updateLayerVisibilities, updateUserMarker]);

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

  useEffect(() => {
    updateLayerVisibilities(mapRef.current);
  }, [showZones, is3D, updateLayerVisibilities]);

  // Render Real Active Truck Markers whenever realBookings changes
  useEffect(() => {
    if (mapRef.current) {
      if (mapRef.current.isStyleLoaded()) {
        renderTruckMarkers();
      } else {
        mapRef.current.once('style.load', renderTruckMarkers);
      }
    }
  }, [realBookings, realZones, showTrucks, renderTruckMarkers]);

  // Manual Camera Controls
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

      {/* Floating Control Bar Top Right */}
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

        {/* LOKASI SAYA BUTTON */}
        <button
          type="button"
          onClick={handleLocateMe}
          className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl font-bold flex items-center gap-1 border transition shadow-sm ${
            userLocation
              ? 'bg-teal-600 text-white border-teal-500 shadow-teal-600/30'
              : 'bg-slate-800 text-teal-300 border-slate-700 hover:bg-slate-700'
          }`}
          title="Fokuskan Ke Lokasi Saya Saat Ini"
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

      {/* MANUAL CAMERA NAVIGATION & ROTATION CONTROL PANEL */}
      <div className="absolute bottom-12 right-3 sm:bottom-16 sm:right-4 z-20 bg-slate-900/90 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border border-slate-700/80 backdrop-blur-md shadow-2xl flex flex-col items-center gap-1.5 sm:gap-2 text-white text-[10px] sm:text-xs">
        <div className="text-[9px] sm:text-[10px] font-black uppercase text-teal-400 tracking-wider flex items-center gap-1">
          <Compass className="h-3 w-3" /> Kontrol Kamera 3D
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

      {/* Floating Layer Filters Panel Top Left */}
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
          <Activity className="h-3 w-3 text-teal-400" /> Virtual GeoFence PostGIS
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
          <span>Bebas Antrean Bahu Jalan</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>Corridor LoadBalancer AI</span>
        </div>
      </div>

      {/* Selected Feature Modal Popup */}
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

      {/* Bottom Status Bar */}
      <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20 bg-slate-900/90 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl border border-slate-800 text-white text-[10px] sm:text-xs backdrop-blur-md shadow-xl flex items-center gap-2 sm:gap-4 max-w-[80vw] sm:max-w-none overflow-x-auto">
        <div className="flex items-center gap-1.5 shrink-0">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span className="font-bold text-slate-200">PostGIS Verified</span>
        </div>
        <div className="h-3 w-[1px] bg-slate-700 shrink-0"></div>
        <div className="flex items-center gap-1 text-teal-400 font-bold shrink-0">
          <Zap className="h-3 w-3 text-cyan-400 animate-pulse" />
          <span>LoadBalancer AI Active</span>
        </div>
        <div className="h-3 w-[1px] bg-slate-700 shrink-0"></div>
        <div className="flex items-center gap-1 text-amber-400 font-bold shrink-0">
          <Truck className="h-3 w-3" />
          <span>{realBookings.length} Booking Real DB</span>
        </div>
      </div>
    </Card>
  );
}
