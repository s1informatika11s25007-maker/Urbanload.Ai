'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { createClient } from '@/lib/supabase/client';
import { Card } from '../ui/card';
import { Globe, Truck, Map, Box } from 'lucide-react';

export function LiveMapHero() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const animRef = useRef<number | null>(null);
  const [mapStyle, setMapStyle] = useState<'standard' | 'satellite' | 'logistics'>('standard');
  const [is3D, setIs3D] = useState(true);

  // Instant Route Transition + Idle WebGL Map Initialization
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initTimer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
        center: [106.8272, -6.1754], // Monas, Jakarta [lng, lat]
        zoom: 13,
        pitch: 45,
        bearing: -15,
      });

      map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right');

      map.on('load', () => {
        // 1. ESRI Satellite High-Res Raster Layer
        if (!map.getSource('esri-satellite')) {
          map.addSource('esri-satellite', {
            type: 'raster',
            tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
            tileSize: 256,
            attribution: 'Tiles &copy; Esri',
          });

          map.addLayer({
            id: 'satellite-layer',
            type: 'raster',
            source: 'esri-satellite',
            layout: { visibility: 'none' },
          });
        }

        // 2. High-Contrast Overlay Labels over Satellite
        if (!map.getSource('carto-labels-source')) {
          map.addSource('carto-labels-source', {
            type: 'raster',
            tiles: ['https://a.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{y}/{x}.png'],
            tileSize: 256,
          });

          map.addLayer({
            id: 'carto-labels-layer',
            type: 'raster',
            source: 'carto-labels-source',
            layout: { visibility: 'none' },
          });
        }

        // 3. Precise Curved Logistics Corridors GeoJSON
        const truck1Route = [
          [106.8227, -6.1820], // Monas South
          [106.8231, -6.1865], // Jl. M.H. Thamrin North
          [106.8225, -6.1920], // Sarinah
          [106.8222, -6.1950], // Bundaran HI Roundabout
          [106.8210, -6.2020], // Dukuh Atas Bridge
          [106.8185, -6.2115], // Karet Sudirman
          [106.8115, -6.2250], // Semanggi Interchange Curve
          [106.8040, -6.2370], // Senayan / GBK
          [106.8115, -6.2250], // Return Semanggi
          [106.8185, -6.2115], // Return Karet
          [106.8210, -6.2020], // Return Dukuh Atas
          [106.8222, -6.1950], // Return Bundaran HI
          [106.8227, -6.1820]  // Return Monas
        ];

        const truck2Route = [
          [106.8720, -6.1550], // Sunter Mall
          [106.8745, -6.1420], // Cempaka Putih
          [106.8780, -6.1300], // Kelapa Gading Flyover
          [106.8830, -6.1150], // Jl. Enggano
          [106.8860, -6.1050], // Pelabuhan Tanjung Priok Terminal
          [106.8830, -6.1150], // Return
          [106.8780, -6.1300], // Return
          [106.8720, -6.1550]  // Return
        ];

        if (!map.getSource('logistics-corridors')) {
          map.addSource('logistics-corridors', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [
                {
                  type: 'Feature',
                  properties: { name: 'Koridor Utama Jl. M.H. Thamrin - Jl. Jend. Sudirman' },
                  geometry: {
                    type: 'LineString',
                    coordinates: truck1Route,
                  },
                },
                {
                  type: 'Feature',
                  properties: { name: 'Akses Utama Pelabuhan Tanjung Priok' },
                  geometry: {
                    type: 'LineString',
                    coordinates: truck2Route,
                  },
                },
              ],
            },
          });

          map.addLayer({
            id: 'logistics-lines',
            type: 'line',
            source: 'logistics-corridors',
            layout: { visibility: 'none', 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': '#0d9488',
              'line-width': 5,
              'line-dasharray': [2, 1],
            },
          });
        }

        // 4. PostGIS GeoJSON Polygons for Logistics Zones
        if (!map.getSource('zones-source')) {
          map.addSource('zones-source', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [
                {
                  type: 'Feature',
                  properties: { name: 'Zona A - Pasar Tanah Abang', score: 10, capacity: '12 Truk' },
                  geometry: {
                    type: 'Polygon',
                    coordinates: [[[106.810, -6.180], [106.820, -6.180], [106.820, -6.190], [106.810, -6.190], [106.810, -6.180]]],
                  },
                },
                {
                  type: 'Feature',
                  properties: { name: 'Zona B - Kawasan Monas & Gambir', score: 4, capacity: '15 Truk' },
                  geometry: {
                    type: 'Polygon',
                    coordinates: [[[106.820, -6.170], [106.830, -6.170], [106.830, -6.180], [106.820, -6.180], [106.820, -6.170]]],
                  },
                },
                {
                  type: 'Feature',
                  properties: { name: 'Zona C - Tanjung Priok Port', score: 2, capacity: '30 Truk' },
                  geometry: {
                    type: 'Polygon',
                    coordinates: [[[106.870, -6.100], [106.890, -6.100], [106.890, -6.120], [106.870, -6.120], [106.870, -6.100]]],
                  },
                },
              ],
            },
          });

          map.addLayer({
            id: 'zones-fill',
            type: 'fill',
            source: 'zones-source',
            paint: {
              'fill-color': [
                'step',
                ['get', 'score'],
                '#22c55e',
                4, '#eab308',
                7, '#f97316',
                9, '#ef4444',
              ],
              'fill-opacity': 0.5,
            },
          });

          map.addLayer({
            id: 'zones-outline',
            type: 'line',
            source: 'zones-source',
            paint: {
              'line-color': '#0f172a',
              'line-width': 2.5,
            },
          });
        }

        // 5. Smooth 60 FPS Real-time Vehicle Marker Animation
        const createTruckMarkerEl = (label: string, color: string) => {
          const el = document.createElement('div');
          el.className = 'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white font-extrabold text-[10px] shadow-xl border border-white/60 cursor-pointer backdrop-blur transition hover:scale-110 z-30';
          el.style.backgroundColor = color;
          el.innerHTML = `<span>${label}</span>`;
          return el;
        };

        const marker1 = new maplibregl.Marker({ element: createTruckMarkerEl('B 1234 XYZ', '#0d9488') })
          .setLngLat(truck1Route[0] as [number, number])
          .setPopup(new maplibregl.Popup().setHTML('<strong>Truk B 1234 XYZ</strong><br/>Telemetri WebGL Realtime: Koridor Jl. M.H. Thamrin<br/>Kecepatan: 32 km/h'))
          .addTo(map);

        const marker2 = new maplibregl.Marker({ element: createTruckMarkerEl('B 9123 UZA', '#2563eb') })
          .setLngLat(truck2Route[0] as [number, number])
          .setPopup(new maplibregl.Popup().setHTML('<strong>Truk B 9123 UZA</strong><br/>Telemetri WebGL Realtime: Koridor Pelabuhan Tg. Priok<br/>Kecepatan: 45 km/h'))
          .addTo(map);

        // Precise Segment-Based Waypoint Interpolation
        let progress1 = 0;
        let progress2 = 0;

        const animateCurvedVehicles = () => {
          progress1 += 0.0015;
          if (progress1 >= truck1Route.length - 1) progress1 = 0;

          const idx1 = Math.floor(progress1);
          const segmentProgress1 = progress1 - idx1;
          const start1 = truck1Route[idx1];
          const end1 = truck1Route[idx1 + 1] || truck1Route[0];

          const lng1 = start1[0] + (end1[0] - start1[0]) * segmentProgress1;
          const lat1 = start1[1] + (end1[1] - start1[1]) * segmentProgress1;
          marker1.setLngLat([lng1, lat1]);

          progress2 += 0.002;
          if (progress2 >= truck2Route.length - 1) progress2 = 0;

          const idx2 = Math.floor(progress2);
          const segmentProgress2 = progress2 - idx2;
          const start2 = truck2Route[idx2];
          const end2 = truck2Route[idx2 + 1] || truck2Route[0];

          const lng2 = start2[0] + (end2[0] - start2[0]) * segmentProgress2;
          const lat2 = start2[1] + (end2[1] - start2[1]) * segmentProgress2;
          marker2.setLngLat([lng2, lat2]);

          animRef.current = requestAnimationFrame(animateCurvedVehicles);
        };

        animateCurvedVehicles();
      });

      mapRef.current = map;
    }, 0);

    // 6. Connect Supabase Realtime WebSocket Channel
    const supabase = createClient();
    const channel = supabase
      .channel('livemap_realtime_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {})
      .subscribe();

    return () => {
      clearTimeout(initTimer);
      if (animRef.current) cancelAnimationFrame(animRef.current);
      supabase.removeChannel(channel);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Safe Zero-Error Layer Switching Handler
  const handleStyleChange = (newStyle: 'standard' | 'satellite' | 'logistics') => {
    setMapStyle(newStyle);
    const map = mapRef.current;
    if (!map) return;

    const toggleLayer = (layerId: string, visible: boolean) => {
      if (map.isStyleLoaded() && map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
      }
    };

    if (newStyle === 'satellite') {
      toggleLayer('satellite-layer', true);
      toggleLayer('carto-labels-layer', true);
      toggleLayer('logistics-lines', false);
    } else if (newStyle === 'logistics') {
      toggleLayer('satellite-layer', false);
      toggleLayer('carto-labels-layer', false);
      toggleLayer('logistics-lines', true);
    } else {
      toggleLayer('satellite-layer', false);
      toggleLayer('carto-labels-layer', false);
      toggleLayer('logistics-lines', false);
    }
  };

  // Safe 3D Pitch Toggle
  const toggle3D = () => {
    const map = mapRef.current;
    if (!map) return;
    const next3D = !is3D;
    setIs3D(next3D);
    map.easeTo({
      pitch: next3D ? 45 : 0,
      bearing: next3D ? -15 : 0,
      duration: 1000,
    });
  };

  return (
    <Card className="w-full h-[calc(100vh-120px)] p-0 overflow-hidden relative border-slate-200 shadow-lg rounded-2xl bg-slate-900 text-white">
      {/* Top Right BaseMap & Layer Switcher Bar */}
      <div className="absolute top-4 right-4 z-20 bg-slate-900/90 backdrop-blur border border-slate-700 p-1.5 rounded-2xl text-xs flex items-center gap-1 shadow-xl">
        <button
          onClick={() => handleStyleChange('standard')}
          className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
            mapStyle === 'standard' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Map className="h-3.5 w-3.5" /> Vector Peta Lengkap
        </button>

        <button
          onClick={() => handleStyleChange('satellite')}
          className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
            mapStyle === 'satellite' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Globe className="h-3.5 w-3.5" /> Satelit + Label Jalan
        </button>

        <button
          onClick={() => handleStyleChange('logistics')}
          className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
            mapStyle === 'logistics' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Truck className="h-3.5 w-3.5" /> Jalur Logistik
        </button>

        <div className="h-4 w-px bg-slate-700 mx-1"></div>

        <button
          onClick={toggle3D}
          className={`px-2.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1 ${
            is3D ? 'bg-slate-800 text-teal-300 border border-teal-500/40' : 'text-slate-400 hover:bg-slate-800'
          }`}
          title="Toggle 3D View"
        >
          <Box className="h-3.5 w-3.5" /> 3D
        </button>
      </div>

      {/* MapLibre WebGL Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Bottom Left Legend */}
      <div className="absolute bottom-6 left-6 z-20 bg-slate-900/90 border border-slate-700 p-3 rounded-2xl text-xs flex items-center gap-4 text-white shadow-xl backdrop-blur">
        <span className="font-bold text-slate-300 text-[11px] uppercase tracking-wider">Skor Kepadatan:</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-emerald-500"></span> 1-3 Rendah</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-amber-500"></span> 4-6 Sedang</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-orange-500"></span> 7-8 Tinggi</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-rose-500"></span> 9-10 Kritis</span>
      </div>
    </Card>
  );
}
