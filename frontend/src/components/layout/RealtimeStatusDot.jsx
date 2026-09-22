import React from 'react';

export function RealtimeStatusDot() {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
      <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
      <span className="text-[9px] font-bold text-emerald-700 uppercase">Live</span>
    </div>
  );
}
