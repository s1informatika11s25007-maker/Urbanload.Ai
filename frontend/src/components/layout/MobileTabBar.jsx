import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Calendar, Activity, Map } from 'lucide-react';

export function MobileTabBar() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t flex items-center justify-around px-4 z-40">
      <Link to="/rider/dashboard" className="flex flex-col items-center text-slate-500"><LayoutDashboard size={20}/><span className="text-[10px]">Dashboard</span></Link>
      <Link to="/rider/bookings/new" className="flex flex-col items-center text-slate-500"><Calendar size={20}/><span className="text-[10px]">Booking</span></Link>
      <Link to="/city/livemap" className="flex flex-col items-center text-slate-500"><Map size={20}/><span className="text-[10px]">Peta</span></Link>
    </div>
  );
}
