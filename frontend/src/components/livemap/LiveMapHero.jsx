import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { createClient } from '../../lib/supabase/client.js';
import { Card } from '../ui/card.jsx';
import { Radio } from 'lucide-react';

export function LiveMapHero() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [bookingsCount, setBookingsCount] = useState(0);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const supabase = createClient();

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
      center: [106.8272, -6.1754],
      zoom: 12,
      pitch: 45,
    });

    map.on('load', async () => {
      const { data: realBookings } = await supabase.from('bookings').select('*');
      setBookingsCount(realBookings ? realBookings.length : 0);
    });

    mapRef.current = map;
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <Card className="w-full h-[500px] p-0 overflow-hidden relative bg-slate-900 rounded-2xl">
      <div ref={mapContainerRef} className="w-full h-full" />
      <div className="absolute bottom-4 left-4 z-10 bg-slate-900/90 p-3 rounded-xl border border-slate-700 text-white text-xs">
        <div className="flex items-center gap-2">
          <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
          <span>{bookingsCount} Truk Aktif</span>
        </div>
      </div>
    </Card>
  );
}
