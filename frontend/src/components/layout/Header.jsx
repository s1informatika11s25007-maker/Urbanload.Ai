import React, { Suspense, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { NotificationBell } from './NotificationBell.jsx';
import { RealtimeStatusDot } from './RealtimeStatusDot.jsx';
import {
  LogOut,
  Truck,
  UserCheck,
  UserPlus,
  Building2,
  Shield,
  MapPin,
  Calendar,
  BarChart3,
  Sliders,
  Map,
  Layers,
  Activity
} from 'lucide-react';
import { Button } from '../ui/button.jsx';
import { createClient } from '../../lib/supabase/client.js';

function HeaderNavContent() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState({
    name: 'Pengguna',
    role: 'rider',
    roleLabel: 'Kurir',
    initial: 'K'
  });

  useEffect(() => {
    async function loadUserProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setCurrentUser(user);
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', user.id)
          .maybeSingle();

        const name = profile?.full_name || user.user_metadata?.full_name || 'Pengguna';
        const role = profile?.role || user.user_metadata?.role || 'rider';

        let roleLabel = 'Kurir';
        if (role === 'city_admin') roleLabel = 'Admin Kota';
        else if (role === 'dishub_officer') roleLabel = 'Petugas Dishub';
        else if (role === 'admin') roleLabel = 'System Admin';

        const initial = name.charAt(0).toUpperCase() || 'K';
        setUserProfile({ name, role, roleLabel, initial });
      } else {
        setCurrentUser(null);
      }
    }

    loadUserProfile();
  }, [pathname]);

  const isPublicPreviewMap = pathname === '/city/livemap' && searchParams.get('preview') === 'public';

  const isPublicPage = !currentUser && (
    pathname === '/' ||
    pathname.startsWith('/fitur') ||
    pathname.startsWith('/cara-kerja') ||
    pathname.startsWith('/tentang') ||
    pathname.startsWith('/kontak') ||
    pathname.startsWith('/docs-api') ||
    pathname.startsWith('/status-sistem') ||
    pathname === '/login' ||
    pathname === '/register' ||
    isPublicPreviewMap
  );

  const role = userProfile.role;

  return (
    <header className="sticky top-0 z-50 flex h-[64px] w-full items-center justify-between border-b border-slate-200/90 bg-white/90 px-4 sm:px-6 backdrop-blur-md text-slate-800 shadow-sm">
      {/* Kiri: Logo + Role Badge */}
      <div className="flex items-center gap-3">
        <Link
          to={
            role === 'city_admin' || role === 'admin'
              ? '/city/zones'
              : role === 'dishub_officer'
              ? '/city/livemap'
              : '/rider/dashboard'
          }
          className="flex items-center gap-2.5 group"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md shadow-teal-600/20 group-hover:scale-105 transition duration-200">
            <Truck className="h-5 w-5" />
          </div>
          <span className="text-lg font-black tracking-tight text-slate-900">
            UrbanLoad<span className="text-teal-600">.AI</span>
          </span>
        </Link>
      </div>

      {/* Tengah: Navigasi Khusus per Role Pengguna */}
      {isPublicPage ? (
        <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600">
          <Link to="/" className="hover:text-teal-600 transition">
            Beranda
          </Link>
          <Link to="/city/livemap?preview=public" className="hover:text-teal-600 transition flex items-center gap-1.5 text-teal-700 font-extrabold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Preview (Public Spectator)
          </Link>
          <Link to="/tentang" className="hover:text-teal-600 transition">
            Tentang Tim
          </Link>
        </nav>
      ) : (
        <nav className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100/80 p-1 rounded-2xl border border-slate-200">
          {/* MENU UNTUK ROLE KURIR (rider) */}
          {(role === 'rider' || role === 'admin') && (
            <>
              <Link
                to="/rider/dashboard"
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  pathname === '/rider/dashboard' ? 'bg-white text-teal-700 shadow-sm font-extrabold' : 'hover:text-slate-900'
                }`}
              >
                <Truck className="h-3.5 w-3.5 text-teal-600" /> Dashboard Kurir
              </Link>
              <Link
                to="/rider/bookings/new"
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  pathname === '/rider/bookings/new' ? 'bg-white text-teal-700 shadow-sm font-extrabold' : 'hover:text-slate-900'
                }`}
              >
                <Calendar className="h-3.5 w-3.5 text-teal-600" /> SmartSlot Booking
              </Link>
            </>
          )}

          {/* MENU UNTUK ADMIN KOTA (city_admin / admin) */}
          {(role === 'city_admin' || role === 'admin') && (
            <>
              <Link
                to="/city/zones"
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  pathname === '/city/zones' ? 'bg-white text-teal-700 shadow-sm font-extrabold' : 'hover:text-slate-900'
                }`}
              >
                <Building2 className="h-3.5 w-3.5 text-teal-600" /> Editor Zona PostGIS
              </Link>
            </>
          )}

          {/* MENU UNTUK PETUGAS DISHUB (dishub_officer / admin) */}
          {(role === 'dishub_officer' || role === 'admin') && (
            <>
              <Link
                to="/city/livemap"
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  pathname === '/city/livemap' ? 'bg-white text-teal-700 shadow-sm font-extrabold' : 'hover:text-slate-900'
                }`}
              >
                <Shield className="h-3.5 w-3.5 text-indigo-600" /> Telemetri & Geofence
              </Link>
            </>
          )}

          {/* MENU KEPADATAN ZONA (SEMUA ROLE) */}
          <Link
            to="/rider/congestion"
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              pathname === '/rider/congestion' ? 'bg-white text-teal-700 shadow-sm font-extrabold' : 'hover:text-slate-900'
            }`}
          >
            <Activity className="h-3.5 w-3.5 text-amber-600" /> Skor Kepadatan
          </Link>

          {/* MENU LIVEMAP (KURIR & CITY ADMIN) */}
          {role !== 'dishub_officer' && (
            <Link
              to="/city/livemap"
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                pathname === '/city/livemap' ? 'bg-white text-teal-700 shadow-sm font-extrabold' : 'hover:text-slate-900'
              }`}
            >
              <Map className="h-3.5 w-3.5 text-teal-600" /> LiveMap
            </Link>
          )}
        </nav>
      )}

      {/* Kanan: Profile & Role Badge */}
      <div className="flex items-center gap-3">
        {isPublicPage ? (
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="outline" className="text-xs py-1.5 px-3 flex items-center gap-1.5 font-bold">
                <UserCheck className="h-3.5 w-3.5" /> Masuk
              </Button>
            </Link>
            <Link to="/register">
              <Button className="text-xs py-1.5 px-3 flex items-center gap-1.5 font-bold">
                <UserPlus className="h-3.5 w-3.5" /> Daftar
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <NotificationBell />
            <RealtimeStatusDot />

            <div className="flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50/60 px-3 py-1 shadow-sm">
              <div className="h-6 w-6 rounded-full bg-teal-600 flex items-center justify-center text-xs font-black text-white uppercase">
                {userProfile.initial}
              </div>
              <div className="text-left leading-tight hidden sm:block">
                <span className="text-xs font-bold text-slate-900 block truncate max-w-[110px]">
                  {userProfile.name}
                </span>
                <span className="text-[10px] font-black uppercase text-teal-800 tracking-wider block">
                  {userProfile.roleLabel}
                </span>
              </div>
            </div>

            <button
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                setCurrentUser(null);
                navigate('/login');
              }}
              className="text-slate-400 hover:text-rose-600 transition p-1"
              title="Keluar dari Akun"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export function Header() {
  return (
    <Suspense fallback={<header className="h-[64px] border-b border-slate-200/90 bg-white/80" />}>
      <HeaderNavContent />
    </Suspense>
  );
}
