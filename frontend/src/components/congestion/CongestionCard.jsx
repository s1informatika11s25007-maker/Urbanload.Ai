
import { Card } from '../ui/card.jsx';
import { MapPin, Info } from 'lucide-react';

interface Props {
  name: string;
  score: number;
  active: number;
  capacity: number;
}

export function CongestionCard({ name, score, active, capacity }) {
  const percent = Math.min(Math.round((active / capacity) * 100), 100);

  const getScoreColor = (s: number) => {
    if (s <= 3) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (s <= 6) return 'text-amber-700 bg-amber-50 border-amber-200';
    if (s <= 8) return 'text-orange-700 bg-orange-50 border-orange-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  const getProgressColor = (s: number) => {
    if (s <= 3) return 'bg-emerald-500';
    if (s <= 6) return 'bg-amber-500';
    if (s <= 8) return 'bg-orange-500';
    return 'bg-rose-500';
  };

  const getLevelLabel = (s: number) => {
    if (s <= 3) return 'Rendah';
    if (s <= 6) return 'Sedang';
    if (s <= 8) return 'Tinggi';
    return 'Kritis';
  };

  return (
     className="p-5 hover:shadow-md transition bg-white border-slate-200">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
             className="h-4 w-4 text-teal-600" />
            <span>{name}</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-5xl font-black tracking-tight ${getScoreColor(score).split(' ')[0]}`}>
              {score}
            </span>
            <span className="text-xs text-slate-400 font-semibold">/ 10</span>
          </div>
        </div>

        <div className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 ${getScoreColor(score)}`}>
          <span className={`h-2 w-2 rounded-full ${getProgressColor(score)}`}></span>
          {getLevelLabel(score)}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4 space-y-1.5">
        <div className="flex justify-between text-xs text-slate-500 font-medium">
          <span>Kapasitas Terpakai</span>
          <span>{percent}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full ${getProgressColor(score)} transition-all duration-500`} style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3 flex justify-between items-center text-xs text-slate-500">
        <span>{active} booking aktif / {capacity} slot/jam</span>
        <span className="cursor-help flex items-center gap-1 hover:text-teal-600 transition" title="Rumus Rule-Based = ceil((booking_aktif / kapasitas_maks) * 10)">
           className="h-3.5 w-3.5" /> Formula
        </span>
      </div>
    </Card>
  );
}
