import React, { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { LayoutDashboard, Calendar, Map, Building2, Shield, Activity, ShieldAlert, Mic, Bot, Lock } from 'lucide-react';
import { createClient } from '../../lib/supabase/client.js';

export function MobileTabBar() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState('rider');

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    async function checkAuthAndRole() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user && isMounted) {
          setCurrentUser(user);
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

          if (profile?.role && isMounted) {
            setRole(profile.role);
          }
        } else if (isMounted) {
          setCurrentUser(null);
        }
      } catch (err) {
        console.warn('MobileTabBar auth check notice:', err);
      }
    }

    checkAuthAndRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && isMounted) {
        setCurrentUser(session.user);
      } else if (isMounted) {
        setCurrentUser(null);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [pathname]);

  const isPublicPreviewMap = pathname === '/city/livemap' && searchParams.get('preview') === 'public';

  // Do NOT render Mobile Bottom Tab Bar if user is NOT logged in or on public landing/auth pages
  const isPublicPage =
    !currentUser ||
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/tentang' ||
    pathname === '/lapor' ||
    pathname.startsWith('/lapor') ||
    pathname.startsWith('/fitur') ||
    isPublicPreviewMap;

  if (isPublicPage) {
    return null;
  }

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-950/95 border-t border-slate-800/90 flex items-center justify-around px-2 z-40 backdrop-blur-md text-[11px] font-bold text-slate-400 shadow-2xl">
      {/* 1. ROLE KURIR LOGISTIK (rider) */}
      {role === 'rider' && (
        <>
          <Link
            to="/rider/dashboard"
            className={`flex flex-col items-center gap-0.5 ${pathname === '/rider/dashboard' ? 'text-teal-400 font-extrabold' : 'hover:text-white'}`}
          >
            <LayoutDashboard size={18} />
            <span className="text-[10px]">Dashboard</span>
          </Link>

          <Link
            to="/rider/bookings/new"
            className={`flex flex-col items-center gap-0.5 ${pathname === '/rider/bookings/new' ? 'text-teal-400 font-extrabold' : 'hover:text-white'}`}
          >
            <Calendar size={18} />
            <span className="text-[10px]">Booking</span>
          </Link>

          <Link
            to="/dispatch/voice"
            className={`flex flex-col items-center gap-0.5 ${pathname === '/dispatch/voice' ? 'text-teal-400 font-extrabold' : 'hover:text-white'}`}
          >
            <Mic size={18} />
            <span className="text-[10px]">Dispatch</span>
          </Link>

          <Link
            to="/city/livemap"
            className={`flex flex-col items-center gap-0.5 ${pathname === '/city/livemap' ? 'text-teal-400 font-extrabold' : 'hover:text-white'}`}
          >
            <Map size={18} />
            <span className="text-[10px]">Peta 3D</span>
          </Link>

          <Link
            to="/logitalk"
            className={`flex flex-col items-center gap-0.5 ${pathname === '/logitalk' ? 'text-teal-400 font-extrabold' : 'hover:text-white'}`}
          >
            <Bot size={18} />
            <span className="text-[10px]">LogiTalk</span>
          </Link>
        </>
      )}

      {/* 2. ROLE ADMIN KOTA (city_admin) */}
      {role === 'city_admin' && (
        <>
          <Link
            to="/city/zones"
            className={`flex flex-col items-center gap-0.5 ${pathname === '/city/zones' ? 'text-sky-400 font-extrabold' : 'hover:text-white'}`}
          >
            <Building2 size={18} />
            <span className="text-[10px]">Zona PostGIS</span>
          </Link>

          <Link
            to="/city/livemap"
            className={`flex flex-col items-center gap-0.5 ${pathname === '/city/livemap' ? 'text-sky-400 font-extrabold' : 'hover:text-white'}`}
          >
            <Shield size={18} />
            <span className="text-[10px]">Telemetri</span>
          </Link>

          <Link
            to="/dishub/reports"
            className={`flex flex-col items-center gap-0.5 ${pathname === '/dishub/reports' ? 'text-sky-400 font-extrabold' : 'hover:text-white'}`}
          >
            <ShieldAlert size={18} />
            <span className="text-[10px]">Laporan</span>
          </Link>

          <Link
            to="/security/prompt-guard"
            className={`flex flex-col items-center gap-0.5 ${pathname === '/security/prompt-guard' ? 'text-sky-400 font-extrabold' : 'hover:text-white'}`}
          >
            <Lock size={18} />
            <span className="text-[10px]">Security</span>
          </Link>

          <Link
            to="/logitalk"
            className={`flex flex-col items-center gap-0.5 ${pathname === '/logitalk' ? 'text-sky-400 font-extrabold' : 'hover:text-white'}`}
          >
            <Bot size={18} />
            <span className="text-[10px]">LogiTalk</span>
          </Link>
        </>
      )}

      {/* 3. ROLE PETUGAS DISHUB (dishub_officer) */}
      {role === 'dishub_officer' && (
        <>
          <Link
            to="/dishub/reports"
            className={`flex flex-col items-center gap-0.5 ${pathname === '/dishub/reports' ? 'text-amber-400 font-extrabold' : 'hover:text-white'}`}
          >
            <ShieldAlert size={18} />
            <span className="text-[10px]">Laporan</span>
          </Link>

          <Link
            to="/city/livemap"
            className={`flex flex-col items-center gap-0.5 ${pathname === '/city/livemap' ? 'text-amber-400 font-extrabold' : 'hover:text-white'}`}
          >
            <Shield size={18} />
            <span className="text-[10px]">Command Center</span>
          </Link>

          <Link
            to="/dispatch/voice"
            className={`flex flex-col items-center gap-0.5 ${pathname === '/dispatch/voice' ? 'text-amber-400 font-extrabold' : 'hover:text-white'}`}
          >
            <Mic size={18} />
            <span className="text-[10px]">Siren AI</span>
          </Link>

          <Link
            to="/rider/congestion"
            className={`flex flex-col items-center gap-0.5 ${pathname === '/rider/congestion' ? 'text-amber-400 font-extrabold' : 'hover:text-white'}`}
          >
            <Activity size={18} />
            <span className="text-[10px]">Traffic</span>
          </Link>

          <Link
            to="/logitalk"
            className={`flex flex-col items-center gap-0.5 ${pathname === '/logitalk' ? 'text-amber-400 font-extrabold' : 'hover:text-white'}`}
          >
            <Bot size={18} />
            <span className="text-[10px]">LogiTalk</span>
          </Link>
        </>
      )}

      {/* 4. ROLE SYSTEM ADMIN (admin) */}
      {role === 'admin' && (
        <>
          <Link
            to="/rider/dashboard"
            className={`flex flex-col items-center gap-0.5 ${pathname === '/rider/dashboard' ? 'text-purple-400 font-extrabold' : 'hover:text-white'}`}
          >
            <LayoutDashboard size={18} />
            <span className="text-[10px]">Kurir</span>
          </Link>

          <Link
            to="/city/zones"
            className={`flex flex-col items-center gap-0.5 ${pathname === '/city/zones' ? 'text-purple-400 font-extrabold' : 'hover:text-white'}`}
          >
            <Building2 size={18} />
            <span className="text-[10px]">Zona</span>
          </Link>

          <Link
            to="/city/livemap"
            className={`flex flex-col items-center gap-0.5 ${pathname === '/city/livemap' ? 'text-purple-400 font-extrabold' : 'hover:text-white'}`}
          >
            <Shield size={18} />
            <span className="text-[10px]">LiveMap</span>
          </Link>

          <Link
            to="/dishub/reports"
            className={`flex flex-col items-center gap-0.5 ${pathname === '/dishub/reports' ? 'text-purple-400 font-extrabold' : 'hover:text-white'}`}
          >
            <ShieldAlert size={18} />
            <span className="text-[10px]">Laporan</span>
          </Link>

          <Link
            to="/logitalk"
            className={`flex flex-col items-center gap-0.5 ${pathname === '/logitalk' ? 'text-purple-400 font-extrabold' : 'hover:text-white'}`}
          >
            <Bot size={18} />
            <span className="text-[10px]">LogiTalk</span>
          </Link>
        </>
      )}
    </div>
  );
}
