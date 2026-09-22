import React, { useState } from 'react';
import { Card } from '../ui/card.jsx';
import { Button } from '../ui/button.jsx';
import { Truck, MapPin, Calendar, Clock } from 'lucide-react';

export function BookingForm({ onCheckSlot }) {
  const [zone, setZone] = useState('');
  const [vehicle, setVehicle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onCheckSlot({ zone, vehicle });
  };

  return (
    <Card className="p-6">
      <h3 className="text-base font-black mb-4">Informasi Booking</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold block mb-1">Zona Tujuan</label>
          <select value={zone} onChange={e => setZone(e.target.value)} className="w-full border rounded-xl p-2.5 text-sm">
            <option value="">Pilih Zona</option>
            <option value="1">Zona A - Pasar Tanah Abang</option>
            <option value="2">Zona B - Monas</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold block mb-1">Nomor Polisi Truk</label>
          <input type="text" value={vehicle} onChange={e => setVehicle(e.target.value)} placeholder="B 1234 ABC" className="w-full border rounded-xl p-2.5 text-sm" />
        </div>
        <Button type="submit" className="md:col-span-2">Cek Ketersediaan Slot</Button>
      </form>
    </Card>
  );
}
