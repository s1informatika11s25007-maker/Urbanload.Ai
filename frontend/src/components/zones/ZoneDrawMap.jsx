import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Card } from '../ui/card.jsx';
import {
  Layers,
  Globe,
  Box,
  Compass,
  RotateCcw,
  RotateCw,
} from 'lucide-react';

const VECTOR_STYLE = {
  version: 8,
  sources: {
    'carto-voyager': {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        'https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      ],
      tileSize: 256,
      attribution: 'OpenStreetMap, CARTO',
      maxzoom: 20,
    },
  },
  layers: [
    { id: 'background', type: 'background', paint: { 'background-color': '#0f172a' } },
    { id: 'voyager-tiles', type: 'raster', source: 'carto-voyager', minzoom: 0, maxzoom: 20 },
  ],
};

const SATELLITE_STYLE = {
  version: 8,
  sources: {
    'esri-satellite': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: 'Esri, Maxar, Earthstar Geographics',
      maxzoom: 20,
    },
    'carto-labels': {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
        'https://b.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
        'https://c.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
      ],
      tileSize: 256,
      maxzoom: 20,
    },
  },
  layers: [
    { id: 'background', type: 'background', paint: { 'background-color': '#020617' } },
    { id: 'satellite-tiles', type: 'raster', source: 'esri-satellite', minzoom: 0, maxzoom: 20 },
    { id: 'labels-tiles', type: 'raster', source: 'carto-labels', minzoom: 0, maxzoom: 20 },
  ],
};

export function ZoneDrawMap() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [mapMode, setMapMode] = useState('vector'); // 'vector' | 'satellite'
  const [is3D, setIs3D] = useState(true);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: VECTOR_STYLE,
      center: [106.8272, -6.1754],
      zoom: 13,
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
    if (!map) return;
    map.setStyle(mapMode === 'satellite' ? SATELLITE_STYLE : VECTOR_STYLE);
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
    <Card className="p-0 h-[400px] sm:h-[480px] overflow-hidden relative bg-slate-950 border border-slate-800 shadow-xl rounded-2xl sm:rounded-3xl">
      <div ref={mapContainerRef} className="w-full h-full bg-slate-950" />

      {/* Floating Mode Switcher Top Left - Mobile Responsive */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex items-center gap-1.5 sm:gap-2 bg-slate-900/90 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-slate-700/80 backdrop-blur-md shadow-lg text-[10px] sm:text-xs text-white max-w-[85vw] sm:max-w-none">
        <button
          type="button"
          onClick={() => setMapMode('vector')}
          className={`px-2.5 py-1 rounded-lg sm:rounded-xl font-bold flex items-center gap-1 transition ${
            mapMode === 'vector' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
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
          onClick={() => setIs3D(!is3D)}
          className={`px-2.5 py-1 rounded-lg sm:rounded-xl font-bold flex items-center gap-1 border transition ${
            is3D ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' : 'bg-slate-800 text-slate-300 border-slate-700'
          }`}
        >
          <Box className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> {is3D ? '3D' : '2D'}
        </button>
      </div>

      {/* Manual Navigation Controls Bottom Right - Mobile Responsive */}
      <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-20 bg-slate-900/90 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border border-slate-700/80 backdrop-blur-md shadow-2xl flex items-center gap-1.5 sm:gap-2 text-white text-[10px] sm:text-xs">
        <button
          type="button"
          onClick={handleRotateLeft}
          className="px-2 py-1 rounded-lg sm:rounded-xl bg-slate-800 border border-slate-700 hover:bg-teal-600 text-white font-bold flex items-center gap-1 transition"
          title="Putar Kiri 35°"
        >
          <RotateCcw className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Kiri
        </button>
        <button
          type="button"
          onClick={handleResetNorth}
          className="p-1 rounded-lg sm:rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-amber-400 transition"
          title="Reset Utara"
        >
          <Compass className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>
        <button
          type="button"
          onClick={handleRotateRight}
          className="px-2 py-1 rounded-lg sm:rounded-xl bg-slate-800 border border-slate-700 hover:bg-teal-600 text-white font-bold flex items-center gap-1 transition"
          title="Putar Kanan 35°"
        >
          Kanan <RotateCw className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </button>
      </div>

      <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20 bg-slate-900/90 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border border-slate-800 text-[9px] sm:text-[11px] text-slate-300 font-mono backdrop-blur-md max-w-[70vw] sm:max-w-none truncate">
        Editor Batas Poligon GeoJSON (PostGIS WGS84 EPSG:4326)
      </div>
    </Card>
  );
}
