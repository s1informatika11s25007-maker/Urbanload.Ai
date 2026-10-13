import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Map, Building2, Shield, Activity } from 'lucide-react';
import { createClient } from '../../lib/supabase/client.js';

export function MobileTabBar() {
  const { pathname } = useLocation();
  const [role, setRole] = useState('rider');

  useEffect(() => {
    async function loadRole() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.role) {
          setRole(profile.role);
        }
      }
    }
    loadRole();
  }, [pathname]);

  if (pathname === '/' || pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 border-t border-slate-200 flex items-center justify-around px-2 z-40 backdrop-blur-md text-xs font-bold text-slate-600">
      {/* ROLE KURIR (rider) */}
      {(role === 'rider' || role === 'admin') && (
        <>
          <Link
            to="/rider/dashboard"
            className={`flex flex-col items-center gap-0.5 ${pathname === '/rider/dashboard' ? 'text-teal-600 font-black' : 'text-slate-500'}`}
          >
            <LayoutDashboard size={18} />
            <span className="text-[10px]">Dashboard</span>
          </Link>

          <Link
            to="/rider/bookings/new"
            className={`flex flex-col items-center gap-0.5 ${pathname === '/rider/bookings/new' ? 'text-teal-600 font-black' : 'text-slate-500'}`}
          >
            <Calendar size={18} />
            <span className="text-[10px]">Booking</span>
          </Link>
        </>
      )}

      {/* ROLE ADMIN KOTA (city_admin) */}
      {(role === 'city_admin' || role === 'admin') && (
        <Link
          to="/city/zones"
          className={`flex flex-col items-center gap-0.5 ${pathname === '/city/zones' ? 'text-teal-600 font-black' : 'text-slate-500'}`}
        >
          <Building2 size={18} />
          <span className="text-[10px]">Zona</span>
        </Link>
      )}

      {/* ROLE PETUGAS DISHUB (dishub_officer) */}
      {(role === 'dishub_officer' || role === 'admin') && (
        <Link
          to="/city/livemap"
          className={`flex flex-col items-center gap-0.5 ${pathname === '/city/livemap' ? 'text-teal-600 font-black' : 'text-slate-500'}`}
        >
          <Shield size={18} />
          <span className="text-[10px]">Telemetri</span>
        </Link>
      )}

      {/* LIVEMAP PETA */}
      <Link
        to="/city/livemap"
        className={`flex flex-col items-center gap-0.5 ${pathname === '/city/livemap' ? 'text-teal-600 font-black' : 'text-slate-500'}`}
      >
        <Map size={18} />
        <span className="text-[10px]">Peta</span>
      </Link>

      {/* SKOR KEPADATAN */}
      <Link
        to="/rider/congestion"
        className={`flex flex-col items-center gap-0.5 ${pathname === '/rider/congestion' ? 'text-teal-600 font-black' : 'text-slate-500'}`}
      >
        <Activity size={18} />
        <span className="text-[10px]">Kepadatan</span>
      </Link>
    </div>
  );
}
