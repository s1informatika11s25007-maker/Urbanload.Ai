import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Truck,
  Building2,
  Shield,
  Activity,
  Map,
  Calendar,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Database,
  Users,
  BarChart3,
  Cpu,
  Radio,
  SlidersHorizontal
} from 'lucide-react';
import { createClient } from '../../lib/supabase/client.js';
import { RealtimeStatusDot } from './RealtimeStatusDot.jsx';
import { NotificationBell } from './NotificationBell.jsx';

export function AppSidebar() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState({
    name: 'Pengguna',
    role: 'rider',
    roleLabel: 'Kurir',
    initial: 'K',
    email: ''
  });

  useEffect(() => {
    async function loadUserProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setCurrentUser(user);
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, role, email')
          .eq('id', user.id)
          .maybeSingle();

        const name = profile?.full_name || user.user_metadata?.full_name || 'Pengguna';
        const role = profile?.role || user.user_metadata?.role || 'rider';
        const email = profile?.email || user.email || '';

        let roleLabel = 'Kurir';
        if (role === 'city_admin') roleLabel = 'Admin Kota';
        else if (role === 'dishub_officer') roleLabel = 'Petugas Dishub';
        else if (role === 'admin') roleLabel = 'System Admin';

        const initial = name.charAt(0).toUpperCase() || 'K';
        setUserProfile({ name, role, roleLabel, initial, email });
      } else {
        setCurrentUser(null);
      }
    }

    loadUserProfile();
  }, [pathname]);

  const isPublicPreviewMap = pathname === '/city/livemap' && searchParams.get('preview') === 'public';
  const isPublicPage = pathname === '/' || (
    !currentUser && (
      pathname.startsWith('/fitur') ||
      pathname.startsWith('/tentang') ||
      pathname === '/login' ||
      pathname === '/register' ||
      isPublicPreviewMap
    )
  );

  // If public page (home, login, register), sidebar is hidden
  if (isPublicPage) return null;

  const role = userProfile.role;

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setCurrentUser(null);
    navigate('/login');
  };

  return (
    <aside
      className={`hidden lg:flex flex-col justify-between border-r border-slate-200/90 bg-slate-900 text-white transition-all duration-300 z-40 sticky top-0 h-screen shrink-0 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* ATAS: Logo Brand & Sidebar Collapse Toggle */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white shadow-lg shadow-teal-600/30">
            <Truck className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="leading-tight animate-in fade-in">
              <span className="text-base font-black tracking-tight text-white block">
                UrbanLoad<span className="text-teal-400">.AI</span>
              </span>
              <span className="text-[10px] font-mono text-teal-300 font-bold uppercase block tracking-widest">
                Logistics OS
              </span>
            </div>
          )}
        </Link>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          title={collapsed ? 'Perluas Sidebar' : 'Menciutkan Sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* TENGAH: User Profile Card & Role Navigation Links */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* User Profile Badge Card */}
        {!collapsed ? (
          <div className="p-3 rounded-2xl bg-gradient-to-br from-teal-950/80 to-slate-950 border border-teal-800/60 text-xs space-y-1.5 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-teal-600 text-white font-black flex items-center justify-center text-xs">
                  {userProfile.initial}
                </div>
                <div className="truncate max-w-[110px]">
                  <span className="font-bold text-white block truncate">{userProfile.name}</span>
                  <span className="text-[10px] text-teal-300 font-mono block truncate">{userProfile.email || 'Role User'}</span>
                </div>
              </div>
              <RealtimeStatusDot />
            </div>

            <div className="pt-1 border-t border-teal-800/40 flex items-center justify-between text-[10px] font-mono">
              <span className="text-slate-400 font-sans uppercase font-bold">Role Aktif:</span>
              <span className="bg-teal-500/20 text-teal-300 border border-teal-500/40 px-2 py-0.5 rounded-md font-bold uppercase">
                {userProfile.roleLabel}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-2">
            <div className="h-9 w-9 rounded-xl bg-teal-600 text-white font-black flex items-center justify-center text-sm shadow-md" title={userProfile.name}>
              {userProfile.initial}
            </div>
          </div>
        )}

        {/* NAVIGASI UTAMA BERDASARKAN ROLE */}
        <div className="space-y-1">
          {!collapsed && (
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider px-3 block mb-1">
              Menu Navigasi
            </span>
          )}

          {/* MENU UNTUK KURIR LOGISTIK (rider / admin) */}
          {(role === 'rider' || role === 'admin') && (
            <>
              <Link
                to="/rider/dashboard"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                  pathname === '/rider/dashboard'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
                title="Dashboard Kurir"
              >
                <Truck className="h-4 w-4 shrink-0 text-teal-400" />
                {!collapsed && <span>Dashboard Kurir</span>}
              </Link>

              <Link
                to="/rider/bookings/new"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                  pathname === '/rider/bookings/new'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
                title="SmartSlot Booking"
              >
                <Calendar className="h-4 w-4 shrink-0 text-teal-400" />
                {!collapsed && <span>SmartSlot Booking AI</span>}
              </Link>
            </>
          )}

          {/* MENU UNTUK ADMIN KOTA (city_admin / admin) */}
          {(role === 'city_admin' || role === 'admin') && (
            <Link
              to="/city/zones"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                pathname === '/city/zones'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              title="Editor Zona PostGIS"
            >
              <Building2 className="h-4 w-4 shrink-0 text-teal-400" />
              {!collapsed && <span>Editor Zona PostGIS</span>}
            </Link>
          )}

          {/* MENU UNTUK PETUGAS DISHUB (dishub_officer / admin) */}
          {(role === 'dishub_officer' || role === 'admin') && (
            <Link
              to="/city/livemap"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                pathname === '/city/livemap'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              title="Telemetri & Geofence"
            >
              <Shield className="h-4 w-4 shrink-0 text-indigo-400" />
              {!collapsed && <span>Telemetri & Geofence</span>}
            </Link>
          )}

          {/* LIVEMAP SPASIAL 3D (KURIR & ADMIN KOTA) */}
          {role !== 'dishub_officer' && (
            <Link
              to="/city/livemap"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                pathname === '/city/livemap'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              title="Peta Spasial LiveMap"
            >
              <Map className="h-4 w-4 shrink-0 text-teal-400" />
              {!collapsed && <span>LiveMap Spasial 3D</span>}
            </Link>
          )}

          {/* TREN SKOR KEPADATAN */}
          <Link
            to="/rider/congestion"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
              pathname === '/rider/congestion'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
            title="Skor Kepadatan AI"
          >
            <Activity className="h-4 w-4 shrink-0 text-amber-400" />
            {!collapsed && <span>Skor Kepadatan AI</span>}
          </Link>
        </div>
      </div>

      {/* BAWAH: Notification Bell & Logout Button */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <NotificationBell />
          {!collapsed && (
            <span className="text-[10px] font-mono text-teal-400 font-bold bg-teal-950/80 px-2 py-0.5 rounded-full border border-teal-800">
              Realtime Connected
            </span>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-800 hover:bg-rose-900/80 text-rose-300 font-bold text-xs transition border border-rose-800/40"
          title="Keluar dari Akun"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Keluar Akun</span>}
        </button>
      </div>
    </aside>
  );
}
