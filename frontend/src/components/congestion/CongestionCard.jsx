import React from 'react';
import { Card } from '../ui/card.jsx';
import { MapPin, Info, Truck } from 'lucide-react';

export function CongestionCard({ name, score, active, capacity }) {
  const safeScore = score ? Number(score) : 1.0;
  const safeActive = active ? Number(active) : 0;
  const safeCapacity = capacity ? Number(capacity) : 10;
  const percent = Math.min(Math.round((safeActive / safeCapacity) * 100), 100);

  const getScoreColor = (s) => {
    if (s <= 3) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (s <= 6) return 'text-amber-700 bg-amber-50 border-amber-200';
    if (s <= 8) return 'text-orange-700 bg-orange-50 border-orange-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  const getProgressColor = (s) => {
    if (s <= 3) return 'bg-emerald-500';
    if (s <= 6) return 'bg-amber-500';
    if (s <= 8) return 'bg-orange-500';
    return 'bg-rose-500';
  };

  const getLevelLabel = (s) => {
    if (s <= 3) return 'Lancar';
    if (s <= 6) return 'Sedang';
    if (s <= 8) return 'Tinggi';
    return 'Kritis / Macet';
  };

  return (
    <Card className="p-5 hover:shadow-md transition-all duration-200 bg-white border border-slate-200 rounded-2xl space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <MapPin className="h-4 w-4 text-teal-600 shrink-0" />
            <span className="truncate max-w-[180px]">{name}</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-4xl sm:text-5xl font-black tracking-tight font-mono ${getScoreColor(safeScore).split(' ')[0]}`}>
              {safeScore.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 font-semibold font-mono">/ 10.0</span>
          </div>
        </div>

        <div className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 ${getScoreColor(safeScore)}`}>
          <span className={`h-2 w-2 rounded-full ${getProgressColor(safeScore)} animate-pulse`}></span>
          <span>{getLevelLabel(safeScore)}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-slate-600 font-semibold">
          <span>Okupansi Bay</span>
          <span className="font-mono font-bold text-teal-700">{percent}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div className={`h-full ${getProgressColor(safeScore)} transition-all duration-500`} style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs text-slate-500 font-medium">
        <span className="flex items-center gap-1 font-mono">
          <Truck className="h-3.5 w-3.5 text-slate-400" /> {safeActive} aktif / {safeCapacity} slot/jam
        </span>
        <span className="cursor-help flex items-center gap-1 hover:text-teal-600 transition" title="Formula = min(10.0, ceil((active_trucks / capacity) * 10))">
          <Info className="h-3.5 w-3.5" /> Formula
        </span>
      </div>
    </Card>
  );
}
