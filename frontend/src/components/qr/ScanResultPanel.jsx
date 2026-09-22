
import { CheckCircle2, AlertTriangle, XCircle, Ban } from 'lucide-react';

export function ScanResultPanel({ result }: { result: 'valid' | 'out_of_schedule' | 'invalid' | 'outside_zone' }) {
  const items = {
    valid: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon:  className="h-6 w-6 text-emerald-600 shrink-0" />,
      text: 'Valid & Sesuai Jadwal Operasional',
    },
    out_of_schedule: {
      bg: 'bg-amber-50 border-amber-200 text-amber-800',
      icon:  className="h-6 w-6 text-amber-600 shrink-0" />,
      text: 'Di Luar Jadwal Slot yang Ditentukan',
    },
    invalid: {
      bg: 'bg-rose-50 border-rose-200 text-rose-800',
      icon:  className="h-6 w-6 text-rose-600 shrink-0" />,
      text: 'Tiket Tidak Valid / Sudah Dipakai',
    },
    outside_zone: {
      bg: 'bg-red-100 border-red-300 text-red-900',
      icon:  className="h-6 w-6 text-red-700 shrink-0" />,
      text: 'Truk Berada di Luar Poligon Zona (RPC ST_Contains Fail)',
    },
  };

  const current = items[result] || items.valid;

  return (
    <div className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-bold ${current.bg}`}>
      {current.icon}
      <span>{current.text}</span>
    </div>
  );
}
