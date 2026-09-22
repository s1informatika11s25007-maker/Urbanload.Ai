import React, { useState } from 'react';
import { Bell } from 'lucide-react';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-full">
        <Bell size={20} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border rounded-xl shadow-lg p-4 z-50">
          <h4 className="text-xs font-bold uppercase mb-2">Notifikasi</h4>
          <p className="text-[11px] text-slate-500">Tidak ada notifikasi baru.</p>
        </div>
      )}
    </div>
  );
}
