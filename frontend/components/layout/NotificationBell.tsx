'use client';
import { Bell } from 'lucide-react';
import { useState } from 'react';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unread] = useState(2);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 transition"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white p-4 shadow-xl border border-slate-200 z-50">
          <h4 className="text-sm font-semibold text-slate-800 mb-2">Notifikasi Realtime</h4>
          <div className="space-y-2 text-xs text-slate-600">
            <div className="p-2 rounded bg-slate-50 border border-slate-100">
              <span className="font-semibold text-slate-800">Booking Dikonfirmasi:</span> Slot 14:00 Zona A disetujui.
            </div>
            <div className="p-2 rounded bg-slate-50 border border-slate-100">
              <span className="font-semibold text-slate-800">Peringatan Kepadatan:</span> Zona A mencapai skor 10.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
