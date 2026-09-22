import React from 'react';
import { Truck, Scale, Box } from 'lucide-react';

export function TruckDimensionInput({ category, lengthM, widthM, heightM, weightTon, onChange }) {
  const volumeM3 = (Number(lengthM) || 0) * (Number(widthM) || 0) * (Number(heightM) || 0);

  const handleCategorySelect = (cat) => {
    if (cat === 'CDE') {
      onChange({ category: 'CDE', lengthM: 3.1, widthM: 1.7, heightM: 1.7, weightTon: 2.5 });
    } else if (cat === 'CDD') {
      onChange({ category: 'CDD', lengthM: 4.5, widthM: 2.0, heightM: 2.0, weightTon: 5.0 });
    } else if (cat === 'FUSO') {
      onChange({ category: 'FUSO', lengthM: 7.0, widthM: 2.4, heightM: 2.5, weightTon: 12.0 });
    }
  };

  return (
    <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
      <div className="flex justify-between items-center border-b border-slate-200 pb-2">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <Truck className="h-4 w-4 text-teal-600" /> Kategori & Dimensi Truk (Kapasitas $m^3$)
        </label>
        <span className="text-[11px] font-mono font-black text-teal-700 bg-teal-100/60 px-2.5 py-0.5 rounded-full border border-teal-200">
          Volume: {volumeM3.toFixed(1)} $m^3$
        </span>
      </div>

      {/* Preset Category Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => handleCategorySelect('CDE')}
          className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
            category === 'CDE' ? 'bg-teal-600 text-white border-teal-600 shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          Truk Kecil (CDE)
          <span className="block text-[9px] font-normal opacity-80">Box ~ 9 m³</span>
        </button>

        <button
          type="button"
          onClick={() => handleCategorySelect('CDD')}
          className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
            category === 'CDD' ? 'bg-teal-600 text-white border-teal-600 shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          Truk Sedang (CDD)
          <span className="block text-[9px] font-normal opacity-80">Box ~ 18 m³</span>
        </button>

        <button
          type="button"
          onClick={() => handleCategorySelect('FUSO')}
          className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
            category === 'FUSO' ? 'bg-teal-600 text-white border-teal-600 shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          Truk Besar (Fuso)
          <span className="block text-[9px] font-normal opacity-80">Tronton ~ 42 m³</span>
        </button>
      </div>

      {/* Custom Dimensions Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        <div>
          <label className="text-[10px] font-semibold text-slate-500 block">Panjang (m)</label>
          <input
            type="number"
            step="0.1"
            value={lengthM}
            onChange={(e) => onChange({ category, lengthM: e.target.value, widthM, heightM, weightTon })}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-teal-600"
          />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-slate-500 block">Lebar (m)</label>
          <input
            type="number"
            step="0.1"
            value={widthM}
            onChange={(e) => onChange({ category, lengthM, widthM: e.target.value, heightM, weightTon })}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-teal-600"
          />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-slate-500 block">Tinggi (m)</label>
          <input
            type="number"
            step="0.1"
            value={heightM}
            onChange={(e) => onChange({ category, lengthM, widthM, heightM: e.target.value, weightTon })}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-teal-600"
          />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-slate-500 block">Tonase (Ton)</label>
          <input
            type="number"
            step="0.5"
            value={weightTon}
            onChange={(e) => onChange({ category, lengthM, widthM, heightM, weightTon: e.target.value })}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-teal-600"
          />
        </div>
      </div>
    </div>
  );
}
