'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { Card } from '../ui/card';
import { Globe, Map, PenTool, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';

export function ZoneDrawMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  const [mapStyle, setMapStyle] = useState<'standard' | 'satellite'>('standard');
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState<[number, number][]>([
    [106.800, -6.210],
    [106.810, -6.210],
    [106.810, -6.220],
    [106.800, -6.220],
  ]);

  const [zoneName, setZoneName] = useState('Zona D - Kawasan Senayan');
  const [maxCapacity, setMaxCapacity] = useState(20);
  const [zoneType, setZoneType] = useState('logistics');
  const [priorityLevel, setPriorityLevel] = useState('normal');
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Format WKT string for PostGIS ST_GeomFromText
  const getWKT = (pts: [number, number][]) => {
    if (pts.length < 3) return '';
    const closedPts = [...pts, pts[0]];
    const str = closedPts.map(([lng, lat]) => `${lng} ${lat}`).join(', ');
    return `POLYGON((${str}))`;
  };

  // Instant Route Transition + Idle WebGL Map Initialization
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
        center: [106.8272, -6.1754],
        zoom: 13,
        pitch: 30,
      });

      map.addControl(new maplibregl.NavigationControl(), 'bottom-right');

      map.on('load', () => {
        // 1. ESRI Satellite Source
        if (!map.getSource('esri-satellite-draw')) {
          map.addSource('esri-satellite-draw', {
            type: 'raster',
            tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
            tileSize: 256,
          });

          map.addLayer({
            id: 'satellite-layer-draw',
            type: 'raster',
            source: 'esri-satellite-draw',
            layout: { visibility: 'none' },
          });
        }

        // 2. High-Contrast Overlay Labels
        if (!map.getSource('carto-labels-draw-source')) {
          map.addSource('carto-labels-draw-source', {
            type: 'raster',
            tiles: ['https://a.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{y}/{x}.png'],
            tileSize: 256,
          });

          map.addLayer({
            id: 'carto-labels-draw-layer',
            type: 'raster',
            source: 'carto-labels-draw-source',
            layout: { visibility: 'none' },
          });
        }

        // 3. Zone Editor Polygon Source
        const initialCoords = points.length >= 3 ? [...points, points[0]] : [];
        if (!map.getSource('zone-editor-source')) {
          map.addSource('zone-editor-source', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [
                {
                  type: 'Feature',
                  properties: { name: 'Poligon Zona Aktif' },
                  geometry: {
                    type: 'Polygon',
                    coordinates: [initialCoords],
                  },
                },
              ],
            },
          });

          map.addLayer({
            id: 'zone-editor-fill',
            type: 'fill',
            source: 'zone-editor-source',
            paint: {
              'fill-color': '#0d9488',
              'fill-opacity': 0.45,
            },
          });

          map.addLayer({
            id: 'zone-editor-line',
            type: 'line',
            source: 'zone-editor-source',
            paint: {
              'line-color': '#14b8a6',
              'line-width': 3,
            },
          });
        }
      });

      mapRef.current = map;
    }, 0);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Handle map click drawing
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleMapClick = (e: maplibregl.MapMouseEvent) => {
      if (!isDrawing) return;
      const newPt: [number, number] = [Number(e.lngLat.lng.toFixed(4)), Number(e.lngLat.lat.toFixed(4))];
      setPoints((prev) => {
        const next = [...prev, newPt];
        updateMapPolygon(next);
        return next;
      });
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [isDrawing]);

  // Update MapLibre source when points change
  const updateMapPolygon = (pts: [number, number][]) => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const source = map.getSource('zone-editor-source') as maplibregl.GeoJSONSource;
    if (source) {
      const closed = pts.length >= 3 ? [...pts, pts[0]] : [];
      source.setData({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { name: zoneName },
            geometry: {
              type: 'Polygon',
              coordinates: [closed],
            },
          },
        ],
      });
    }
  };

  // Toggle Draw Mode
  const toggleDrawMode = () => {
    const next = !isDrawing;
    setIsDrawing(next);
    const map = mapRef.current;
    if (map) {
      map.getCanvas().style.cursor = next ? 'crosshair' : '';
    }
  };

  // Clear / Delete Polygon
  const handleClear = () => {
    setPoints([]);
    updateMapPolygon([]);
    setIsDrawing(false);
    setStatusMsg('');
    const map = mapRef.current;
    if (map) map.getCanvas().style.cursor = '';
  };

  // Layer Switching
  const handleStyleChange = (newStyle: 'standard' | 'satellite') => {
    setMapStyle(newStyle);
    const map = mapRef.current;
    if (!map) return;

    const toggleLayer = (layerId: string, visible: boolean) => {
      if (map.isStyleLoaded() && map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
      }
    };

    if (newStyle === 'satellite') {
      toggleLayer('satellite-layer-draw', true);
      toggleLayer('carto-labels-draw-layer', true);
    } else {
      toggleLayer('satellite-layer-draw', false);
      toggleLayer('carto-labels-draw-layer', false);
    }
  };

  // Save Drawn Polygon directly to Supabase Postgres
  const handleSaveZone = async () => {
    if (points.length < 3) {
      setStatusMsg('Klik minimal 3 titik koordinat di peta untuk membentuk poligon.');
      return;
    }

    setSaving(true);
    setStatusMsg('');

    try {
      const wkt = getWKT(points);
      const res = await fetch('/api/v1/zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: zoneName,
          maxTruckCapacity: Number(maxCapacity),
          operatingHoursStart: '06:00',
          operatingHoursEnd: '22:00',
          zoneType,
          priorityLevel,
          wktPolygon: wkt,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMsg('Poligon Zona Berhasil Disimpan ke Supabase PostgreSQL!');
      } else {
        setStatusMsg(`Gagal menyimpan: ${data.error || 'Terjadi kesalahan'}`);
      }
    } catch (err: any) {
      setStatusMsg(`Gagal koneksi: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Kiri (70%): Map Split */}
      <Card className="lg:col-span-8 p-4 h-[520px] flex flex-col justify-between bg-slate-900 text-slate-200 relative overflow-hidden shadow-lg">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 z-10 bg-slate-900/90 p-3 rounded-xl backdrop-blur border border-slate-700 shadow-md">
          <span className="text-xs font-bold text-teal-400">Drawing Tools PostGIS WGS84: MapLibre GL JS</span>

          {/* Layer Switcher & Draw / Delete Actions */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => handleStyleChange('standard')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                mapStyle === 'standard' ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Map className="h-3 w-3" /> Vector Lengkap
            </button>
            <button
              onClick={() => handleStyleChange('satellite')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                mapStyle === 'satellite' ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Globe className="h-3 w-3" /> Satelit + Label Tempat
            </button>

            <div className="h-4 w-px bg-slate-700 mx-1"></div>

            <button
              onClick={toggleDrawMode}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                isDrawing ? 'bg-amber-500 text-slate-950 animate-pulse' : 'bg-teal-600 hover:bg-teal-500 text-white'
              }`}
            >
              <PenTool className="h-3.5 w-3.5" /> {isDrawing ? 'Klik Titik Peta...' : 'Draw'}
            </button>

            <button
              onClick={handleClear}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        </div>

        {/* MapLibre Canvas Container */}
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

        {/* Bottom Info Bar */}
        <div className="flex justify-between items-center z-10 bg-slate-900/90 p-2.5 rounded-xl text-xs backdrop-blur border border-slate-700 mt-auto shadow-md">
          <span>
            {isDrawing
              ? ' Mode Draw Aktif: Klik pada peta untuk menambahkan titik poligon.'
              : `Titik Terdaftar: ${points.length} Titik Koordinat`}
          </span>
          <span className="font-mono text-teal-400">PostGIS GEOGRAPHY(POLYGON, 4326)</span>
        </div>
      </Card>

      {/* Kanan (30%): Form Properti & Simpan Supabase */}
      <Card className="lg:col-span-4 p-5 space-y-4 border-slate-200 bg-white shadow-sm">
        <h4 className="text-sm font-bold text-slate-900 border-b pb-2">Properti Zona Logistik</h4>

        <div>
          <label className="text-xs font-semibold text-slate-700">Nama Zona</label>
          <input
            type="text"
            value={zoneName}
            onChange={(e) => setZoneName(e.target.value)}
            className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 mt-1"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700">Kapasitas Maks Truk</label>
          <input
            type="number"
            value={maxCapacity}
            onChange={(e) => setMaxCapacity(Number(e.target.value))}
            className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700">Tipe Zona</label>
            <select
              value={zoneType}
              onChange={(e) => setZoneType(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 mt-1"
            >
              <option value="logistics">Logistik</option>
              <option value="culinary">Kuliner</option>
              <option value="mixed">Campuran</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Akses Priority</label>
            <select
              value={priorityLevel}
              onChange={(e) => setPriorityLevel(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 mt-1"
            >
              <option value="normal">Normal</option>
              <option value="priority_pass">PriorityPass</option>
            </select>
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 font-mono space-y-1">
          <div><strong>PostGIS WKT Output:</strong></div>
          <div className="text-teal-700 break-all">{getWKT(points) || 'Belum ada poligon'}</div>
        </div>

        {statusMsg && (
          <div className={`p-3 rounded-xl border text-xs font-semibold ${statusMsg.includes('Berhasil') ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
            {statusMsg}
          </div>
        )}

        <Button
          onClick={handleSaveZone}
          disabled={saving || points.length < 3}
          className="w-full py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-md"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          Simpan Poligon Zona ke Supabase
        </Button>
      </Card>
    </div>
  );
}
