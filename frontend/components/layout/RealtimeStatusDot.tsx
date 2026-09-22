'use client';
import { useEffect, useState } from 'react';

export function RealtimeStatusDot() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
      <span className={`h-2.5 w-2.5 rounded-full ${online ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
      <span>{online ? 'Live' : 'Reconnecting'}</span>
    </div>
  );
}
