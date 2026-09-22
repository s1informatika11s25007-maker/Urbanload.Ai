import React, { useState } from 'react';
import { Card } from '../ui/card.jsx';
import { Button } from '../ui/button.jsx';
import { CheckCircle2, Navigation } from 'lucide-react';

export function GeofenceValidator() {
  const [lat, setLat] = useState('-6.185');
  const [lng, setLng] = useState('106.815');

  return (
    <Card className="p-6">
      <h3 className="text-base font-black mb-4">Validasi Geofence</h3>
      <div className="grid grid-cols-2 gap-4">
        <input value={lat} onChange={e => setLat(e.target.value)} className="border rounded-xl p-2 text-sm" placeholder="Lat" />
        <input value={lng} onChange={e => setLng(e.target.value)} className="border rounded-xl p-2 text-sm" placeholder="Lng" />
      </div>
      <Button className="w-full mt-4">Uji PostGIS</Button>
    </Card>
  );
}
