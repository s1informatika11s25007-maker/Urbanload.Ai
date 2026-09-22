
interface Props {
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  weightKg: number;
  onChange: (fields: any) => void;
}

export function TruckDimensionInput({ lengthCm, widthCm, heightCm, weightKg, onChange }) {
  return (
    <div className="space-y-3">
      <label className="text-xs font-semibold text-slate-700">Dimensi & Tonase Truk</label>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] text-slate-500">Panjang (cm)</label>
          <input
            type="number"
            value={lengthCm}
            onChange={(e) => onChange({ lengthCm(e.target.value) })}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
          />
        </div>
        <div>
          <label className="text-[11px] text-slate-500">Lebar (cm)</label>
          <input
            type="number"
            value={widthCm}
            onChange={(e) => onChange({ widthCm(e.target.value) })}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
          />
        </div>
        <div>
          <label className="text-[11px] text-slate-500">Tinggi (cm)</label>
          <input
            type="number"
            value={heightCm}
            onChange={(e) => onChange({ heightCm(e.target.value) })}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
          />
        </div>
        <div>
          <label className="text-[11px] text-slate-500">Tonase (kg)</label>
          <input
            type="number"
            value={weightKg}
            onChange={(e) => onChange({ weightKg(e.target.value) })}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
          />
        </div>
      </div>
    </div>
  );
}
