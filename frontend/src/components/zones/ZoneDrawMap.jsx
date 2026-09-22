import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { Card } from '../ui/card.jsx';

export function ZoneDrawMap() {
  const mapContainerRef = useRef(null);

  useEffect(() => {
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
      center: [106.8272, -6.1754],
      zoom: 13,
    });
    return () => map.remove();
  }, []);

  return (
    <Card className="p-0 h-[400px] overflow-hidden rounded-2xl relative">
      <div ref={mapContainerRef} className="w-full h-full" />
    </Card>
  );
}
