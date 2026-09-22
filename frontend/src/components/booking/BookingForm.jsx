import React, { useState } from 'react';
import { Card } from '../ui/card.jsx';
import { Button } from '../ui/button.jsx';
import { useRealtimeZones } from '../../hooks/useRealtimeZones.js';
import { validatePromptGuard, runGroqLogixOptimization } from '../../lib/groq.js';
import { TruckDimensionInput } from './TruckDimensionInput.jsx';
import { Truck, MapPin, Clock, ShieldCheck, Cpu, AlertCircle, Loader2 } from 'lucide-react';

export function BookingForm({ onCheckSlot }) {
  const { zones, loading: loadingZones } = useRealtimeZones();
  const [zoneId, setZoneId] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [requestedTime, setRequestedTime] = useState('10.00');

  // Truck Dimension state
  const [truckDimensions, setTruckDimensions] = useState({
    category: 'CDD',
    lengthM: 4.5,
    widthM: 2.0,
    heightM: 2.0,
    weightTon: 5.0,
  });

  const [loadingAI, setLoadingAI] = useState(false);
  const [guardError, setGuardError] = useState(null);

  const handleDimensionChange = (fields) => {
    setTruckDimensions((prev) => ({ ...prev, ...fields }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardError(null);
    if (!zoneId || !vehicle) return;

    setLoadingAI(true);

    try {
      // 1. Security Layer: Llama Prompt Guard 2 Check
      const guardResult = await validatePromptGuard(vehicle);
      if (!guardResult.safe) {
        setGuardError(guardResult.reason);
        setLoadingAI(false);
        return;
      }

      const selectedZoneObj = zones.find((z) => z.id === zoneId);

      // 2. Tahap 1: Perencanaan & Optimalisasi AI (GroqLogix Engine: CongestionScore AI & LoadBalancer AI)
      const aiResult = await runGroqLogixOptimization({
        zoneId,
        zoneName: selectedZoneObj?.name || 'Zona Logistik',
        requestedTime,
        activeTrucksCount: Math.floor(Math.random() * 8) + 5,
        capacityMax: selectedZoneObj?.max_truck_capacity || 15,
        truckDimensions,
      });

      // Pass result to Booking Summary and parent
      onCheckSlot({
        zoneId,
        zoneName: selectedZoneObj?.name || 'Zona Logistik',
        vehicle,
        requestedTime,
        truckDimensions,
        aiResult,
      });
    } catch (err) {
      console.error('Error running GroqLogix AI booking optimization:', err);
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <Card className="p-4 sm:p-6 border-slate-200 bg-white shadow-sm rounded-2xl space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-3">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
          <Truck className="h-5 w-5 text-teal-600" /> SmartSlot Booking — GroqLogix AI Engine
        </h3>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-800 border border-teal-200 px-3 py-1 rounded-full">
          <Cpu className="h-3.5 w-3.5 text-teal-600 animate-pulse" /> GroqLogix Engine — ditenagai Qwen 32B via Groq LPU (inferensi ultra-cepat)
        </span>
      </div>

      {guardError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2 font-bold animate-in fade-in">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{guardError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-teal-600" /> Pilih Zona Tujuan
            </label>
            <select
              value={zoneId}
              onChange={(e) => setZoneId(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
              required
            >
              <option value="">{loadingZones ? 'Memuat daftar zona real...' : 'Pilih Zona Tujuan'}</option>
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

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-teal-600" /> Jendela Waktu Kedatangan
            </label>
            <select
              value={requestedTime}
              onChange={(e) => setRequestedTime(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
            >
              <option value="08.00">08.00 WIB</option>
              <option value="09.00">09.00 WIB</option>
              <option value="10.00">10.00 WIB (Padat Jam Kerja)</option>
              <option value="11.00">11.00 WIB</option>
              <option value="13.00">13.00 WIB</option>
              <option value="14.00">14.00 WIB</option>
              <option value="15.00">15.00 WIB</option>
            </select>
          </div>
        </div>

        {/* Mandatory Truck Dimensions & Volume Component */}
        <TruckDimensionInput
          category={truckDimensions.category}
          lengthM={truckDimensions.lengthM}
          widthM={truckDimensions.widthM}
          heightM={truckDimensions.heightM}
          weightTon={truckDimensions.weightTon}
          onChange={handleDimensionChange}
        />

        <Button
          type="submit"
          disabled={!zoneId || !vehicle || loadingAI}
          className="w-full py-3 text-xs font-bold shadow-md flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700"
        >
          {loadingAI ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span>Memproses LoadBalancer AI & CongestionScore AI...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" />
              <span>Jalankan Optimalisasi SmartSlot AI</span>
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}
