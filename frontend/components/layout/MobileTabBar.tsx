'use client';

import Link from 'next/link';
import { Home, Calendar, AlertCircle, Map, Layers } from 'lucide-react';

export function MobileTabBar() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center justify-around z-50">
      <Link href="/rider/dashboard" className="flex flex-col items-center gap-1 text-slate-600 hover:text-teal-600">
        <Home className="h-5 w-5" />
        <span className="text-[10px]">Home</span>
      </Link>
      <Link href="/rider/bookings/new" className="flex flex-col items-center gap-1 text-slate-600 hover:text-teal-600">
        <Calendar className="h-5 w-5" />
        <span className="text-[10px]">Booking</span>
      </Link>
      <Link href="/rider/congestion" className="flex flex-col items-center gap-1 text-slate-600 hover:text-teal-600">
        <AlertCircle className="h-5 w-5" />
        <span className="text-[10px]">Kepadatan</span>
      </Link>
      <Link href="/city/zones" className="flex flex-col items-center gap-1 text-slate-600 hover:text-teal-600">
        <Layers className="h-5 w-5" />
        <span className="text-[10px]">Zona</span>
      </Link>
      <Link href="/city/livemap" className="flex flex-col items-center gap-1 text-slate-600 hover:text-teal-600">
        <Map className="h-5 w-5" />
        <span className="text-[10px]">LiveMap</span>
      </Link>
    </div>
  );
}
