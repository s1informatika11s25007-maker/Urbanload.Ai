import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Card } from '../ui/card.jsx';
import { Button } from '../ui/button.jsx';
import { MapPin, X, Check, Loader2, Navigation, Map as MapIcon } from 'lucide-react';

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

/**
 * MapLocationPickerModal
 * Interactive Map Selector allowing users to click anywhere on the map to pick
 * a precise road/area location for reporting violations.
 */
export function MapLocationPickerModal({ isOpen, onClose, onSelectLocation, initialLocationName }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const [selectedCoords, setSelectedCoords] = useState({ lat: -6.1820, lng: 106.8150 });
  const [selectedAddress, setSelectedAddress] = useState(initialLocationName || 'Pasar Tanah Abang, Jakarta Pusat');
  const [loadingGeocode, setLoadingGeocode] = useState(false);

  // Reverse Geocode Selected Map Coordinates
  const reverseGeocode = async (lat, lng) => {
    setLoadingGeocode(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const road = addr.road || addr.pedestrian || addr.suburb || addr.neighbourhood || 'Jl. Raya Kebon Jati';
        const district = addr.city_district || addr.suburb || '';
        const city = addr.city || addr.regency || 'Jakarta Pusat';
        const formatted = `${road}${district ? `, ${district}` : ''}, ${city}`;
        setSelectedAddress(formatted);
      } else {
        setSelectedAddress(`Area Koordinat: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      }
    } catch (e) {
      setSelectedAddress(`Area Koordinat: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } finally {
      setLoadingGeocode(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    // Small delay to ensure container DOM is ready in modal
    const timer = setTimeout(() => {
      if (!mapContainerRef.current || mapRef.current) return;

      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: VECTORSTREET_STYLE,
        center: [selectedCoords.lng, selectedCoords.lat],
        zoom: 14,
      });

      map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), 'top-right');

      // Create draggable marker pin
      const el = document.createElement('div');
      el.className = 'cursor-pointer hover:scale-125 transition-transform duration-200';
      el.innerHTML = `
        <div class="p-2 bg-red-600 text-white rounded-full shadow-2xl border-2 border-white flex items-center justify-center animate-bounce">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
        </div>
      `;

      const marker = new maplibregl.Marker({ element: el, draggable: true })
        .setLngLat([selectedCoords.lng, selectedCoords.lat])
        .addTo(map);

      marker.on('dragend', () => {
        const lngLat = marker.getLngLat();
        setSelectedCoords({ lat: lngLat.lat, lng: lngLat.lng });
        reverseGeocode(lngLat.lat, lngLat.lng);
      });

      // Click on map to move marker
      map.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        marker.setLngLat([lng, lat]);
        setSelectedCoords({ lat, lng });
        reverseGeocode(lat, lng);
      });

      mapRef.current = map;
      markerRef.current = marker;
    }, 150);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isOpen]);

  const handleConfirmSelection = () => {
    onSelectLocation(selectedAddress);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-2xl bg-white rounded-3xl border border-teal-200 shadow-2xl relative overflow-hidden flex flex-col h-[520px]">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2">
            <MapIcon className="h-5 w-5 text-teal-400" />
            <div>
              <h3 className="text-sm font-black text-white">Pilih Lokasi Kejadian Dari Peta Interaktif</h3>
              <p className="text-[11px] text-slate-300">Klik titik lokasi pada peta atau geser penanda merah</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Map Container */}
        <div className="flex-1 w-full bg-slate-950 relative">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Floating Instructions Banner */}
          <div className="absolute top-3 left-3 bg-slate-900/90 text-white text-[11px] px-3 py-1.5 rounded-xl border border-slate-700 backdrop-blur-md shadow-md">
            📍 Klik pada jalan / daerah untuk memilih lokasi
          </div>
        </div>

        {/* Footer Selected Address Preview & CTA */}
        <div className="p-4 border-t bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs truncate max-w-md">
            <MapPin className="h-5 w-5 text-red-600 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Alamat Terdeteksi:</span>
              <span className="font-bold text-slate-900 block truncate">
                {loadingGeocode ? 'Mencari nama jalan...' : selectedAddress}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button type="button" variant="outline" onClick={onClose} className="w-1/2 sm:w-auto text-xs py-2">
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleConfirmSelection}
              disabled={loadingGeocode || !selectedAddress}
              className="w-1/2 sm:w-auto text-xs py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center justify-center gap-1.5 shadow-md"
            >
              <Check className="h-4 w-4" /> Gunakan Lokasi Ini
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
