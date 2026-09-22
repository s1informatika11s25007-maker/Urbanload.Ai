import React, { useState } from 'react';
import { Card } from '../ui/card.jsx';
import { Button } from '../ui/button.jsx';
import { useRealtimeZones } from '../../hooks/useRealtimeZones.js';
import { Truck, MapPin } from 'lucide-react';

export function BookingForm({ onCheckSlot }) {
  const { zones, loading: loadingZones } = useRealtimeZones();
  const [zoneId, setZoneId] = useState('');
  const [vehicle, setVehicle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!zoneId || !vehicle) return;
    const selectedZoneObj = zones.find((z) => z.id === zoneId);
    onCheckSlot({ zoneId, zoneName: selectedZoneObj?.name || 'Zona Logistik', vehicle });
  };

  return (
    <Card className="p-6 border-slate-200 bg-white shadow-sm rounded-2xl space-y-4">
      <h3 className="text-base font-black text-slate-900 border-b pb-2 flex items-center gap-2">
        <Truck className="h-5 w-5 text-teal-600" /> Informasi Booking Slot Realtime
      </h3>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-teal-600" /> Pilih Zona Tujuan Real
          </label>
          <select
            value={zoneId}
            onChange={(e) => setZoneId(e.target.value)}
            className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
            required
          >
            <option value="">{loadingZones ? 'Memuat daftar zona real...' : 'Pilih Zona Database Real'}</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name} (Kapasitas: {z.max_truck_capacity} Truk)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
            <Truck className="h-3.5 w-3.5 text-teal-600" /> Nomor Polisi Truk / Kendaraan
          </label>
          <input
            type="text"
            required
            value={vehicle}
            onChange={(e) => setVehicle(e.target.value)}
            placeholder="Contoh: B 9812 UAI"
            className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-mono font-bold text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
          />
        </div>

        <Button type="submit" disabled={!zoneId || !vehicle} className="md:col-span-2 py-3 text-xs font-bold shadow-md">
          Cek Ketersediaan Slot Realtime
        </Button>
      </form>
    </Card>
  );
}
