import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Card } from '../ui/card.jsx';
import { Layers, Globe, Box, Compass } from 'lucide-react';

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
    { id: 'satellite-tiles', type: 'raster', source: 'esri-satellite' },
    { id: 'labels-tiles', type: 'raster', source: 'carto-labels' },
  ],
};

const VECTOR_STYLE = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';

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

  return (
    <Card className="p-0 h-[450px] overflow-hidden rounded-2xl relative bg-slate-950 border border-slate-800 shadow-xl">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Mode Switcher Top Left */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-700/80 backdrop-blur-md shadow-lg text-xs text-white">
        <button
          type="button"
          onClick={() => setMapMode('vector')}
          className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 transition ${
            mapMode === 'vector' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="h-3.5 w-3.5" /> Vektor
        </button>
        <button
          type="button"
          onClick={() => setMapMode('satellite')}
          className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 transition ${
            mapMode === 'satellite' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Globe className="h-3.5 w-3.5" /> Satelit
        </button>
        <button
          type="button"
          onClick={() => setIs3D(!is3D)}
          className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 border transition ${
            is3D ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' : 'bg-slate-800 text-slate-300 border-slate-700'
          }`}
        >
          <Box className="h-3.5 w-3.5" /> {is3D ? '3D View' : '2D View'}
        </button>
      </div>

      <div className="absolute bottom-4 left-4 z-20 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 font-mono backdrop-blur-md">
        Editor Batas Poligon GeoJSON (PostGIS WGS84 EPSG:4326)
      </div>
    </Card>
  );
}
