import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Truck,
  Building2,
  Shield,
  Activity,
  Calendar,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ShieldAlert,
  Bot,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { createClient } from '../../lib/supabase/client.js';
import { RealtimeStatusDot } from './RealtimeStatusDot.jsx';

export function AppSidebar() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState({
    name: 'Pengguna',
    role: 'rider',
    roleLabel: 'Kurir',
    initial: 'K',
    email: ''
  });

  const popupRef = useRef(null);

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

  // Click Outside Listener to close User Popup
  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowUserPopup(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isPublicPreviewMap = pathname === '/city/livemap' && searchParams.get('preview') === 'public';
  const isPublicPage = pathname === '/' || pathname === '/lapor' || pathname.startsWith('/lapor') || (
    !currentUser && (
      pathname.startsWith('/fitur') ||
      pathname.startsWith('/tentang') ||
      pathname.startsWith('/lapor') ||
      pathname === '/login' ||
      pathname === '/register' ||
      isPublicPreviewMap
    )
  );

  if (isPublicPage || pathname === '/lapor' || pathname.startsWith('/lapor')) return null;

  const role = userProfile.role;

  const handleLogout = async () => {
    setShowUserPopup(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    setCurrentUser(null);
    navigate('/login');
  };

  return (
    <aside
      className={`hidden lg:flex flex-col justify-between border-r border-slate-800 bg-slate-950 text-white transition-all duration-300 z-40 sticky top-0 h-screen shrink-0 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* ATAS: Logo Brand & Sidebar Collapse Toggle */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/30">
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
          className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition"
          title={collapsed ? 'Perluas Sidebar' : 'Menciutkan Sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* TENGAH: Menu Navigasi Per Role */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        <div className="space-y-1">
          {!collapsed && (
            <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider px-3 block mb-1">
              Menu Utama
            </span>
          )}

          {/* 1. Dashboard Kurir (rider / admin) */}
          {(role === 'rider' || role === 'admin') && (
            <Link
              to="/rider/dashboard"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                pathname === '/rider/dashboard'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
              title="Dashboard Kurir"
            >
              <Truck className="h-4 w-4 shrink-0 text-teal-400" />
              {!collapsed && <span>Dashboard Kurir</span>}
            </Link>
          )}

          {/* 2. SmartSlot Booking AI (rider / admin) */}
          {(role === 'rider' || role === 'admin') && (
            <Link
              to="/rider/bookings/new"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                pathname === '/rider/bookings/new'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
              title="SmartSlot Booking"
            >
              <Calendar className="h-4 w-4 shrink-0 text-teal-400" />
              {!collapsed && <span>SmartSlot Booking AI</span>}
            </Link>
          )}

          {/* 3. Editor Zona PostGIS (city_admin / admin) */}
          {(role === 'city_admin' || role === 'admin') && (
            <Link
              to="/city/zones"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                pathname === '/city/zones'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
              title="Editor Zona PostGIS"
            >
              <Building2 className="h-4 w-4 shrink-0 text-teal-400" />
              {!collapsed && <span>Editor Zona PostGIS</span>}
            </Link>
          )}

          {/* 4. LiveMap Spasial 3D / Telemetri (Semua Role) */}
          <Link
            to="/city/livemap"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
              pathname === '/city/livemap'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
            title="Telemetri & LiveMap 3D"
          >
            <Shield className="h-4 w-4 shrink-0 text-indigo-400" />
            {!collapsed && <span>Telemetri & LiveMap 3D</span>}
          </Link>

          {/* 5. Laporan Warga CitizenReport (dishub_officer / city_admin / admin) */}
          {(role === 'dishub_officer' || role === 'city_admin' || role === 'admin') && (
            <Link
              to="/dishub/reports"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                pathname === '/dishub/reports'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
              title="Laporan Warga (CitizenReport)"
            >
              <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />
              {!collapsed && <span>Laporan Warga (Citizen)</span>}
            </Link>
          )}

          {/* 6. Skor Kepadatan AI (Semua Role) */}
          <Link
            to="/rider/congestion"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
              pathname === '/rider/congestion'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
            title="Skor Kepadatan AI"
          >
            <Activity className="h-4 w-4 shrink-0 text-amber-400" />
            {!collapsed && <span>Skor Kepadatan AI</span>}
          </Link>
        </div>

        {/* ASISTEN AI & TOOLS */}
        <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
          {!collapsed && (
            <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider px-3 block mb-1">
              Asisten AI LogiTalk
            </span>
          )}

          {/* LogiTalk AI Assistant Link Page */}
          <Link
            to="/logitalk"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition border shadow-sm ${
              pathname === '/logitalk'
                ? 'bg-teal-600 text-white border-teal-500 shadow-md'
                : 'bg-gradient-to-r from-teal-900/60 to-emerald-900/60 hover:from-teal-800/80 hover:to-emerald-800/80 text-teal-200 border-teal-700/50'
            }`}
            title="LogiTalk AI Assistant"
          >
            <Bot className="h-4 w-4 shrink-0 text-teal-300 animate-pulse" />
            {!collapsed && (
              <span className="flex items-center justify-between w-full">
                <span>LogiTalk AI Assistant</span>
                <Sparkles className="h-3 w-3 text-amber-400" />
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* BAWAH KIRI POJOK: User Profile Card & Sign Out Popover Menu */}
      <div className="p-3 border-t border-slate-800/80 relative" ref={popupRef}>
        {/* User Account Popover Menu */}
        {showUserPopup && (
          <div className="absolute bottom-full left-3 mb-2 w-56 bg-slate-900 border border-slate-700 rounded-2xl p-3 shadow-2xl space-y-3 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-teal-400 uppercase tracking-wider block">
                Akun Terhubung
              </span>
              <p className="font-bold text-xs text-white truncate">{userProfile.name}</p>
              <p className="text-[11px] text-slate-400 font-mono truncate">{userProfile.email || 'User Account'}</p>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono pt-1.5 border-t border-slate-800">
              <span className="text-slate-400 uppercase font-bold">Role Hak Akses:</span>
              <span className="bg-teal-500/20 text-teal-300 border border-teal-500/40 px-2 py-0.5 rounded font-bold uppercase">
                {userProfile.roleLabel}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="w-full py-2 px-3 rounded-xl bg-rose-900/60 hover:bg-rose-800 text-rose-200 font-bold text-xs transition border border-rose-700/50 flex items-center justify-center gap-1.5 shadow-sm"
            >
              <LogOut className="h-3.5 w-3.5" /> Keluar Akun
            </button>
          </div>
        )}

        {/* User Profile Card Button */}
        <button
          onClick={() => setShowUserPopup(!showUserPopup)}
          className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800/80 transition text-left group"
          title="Kelola Akun & Keluar"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-8 w-8 rounded-xl bg-teal-600 text-white font-black flex items-center justify-center text-xs shrink-0 shadow-sm">
              {userProfile.initial}
            </div>
            {!collapsed && (
              <div className="truncate text-xs leading-tight">
                <span className="font-bold text-white block truncate">{userProfile.name}</span>
                <span className="text-[10px] text-teal-300/90 font-mono block uppercase font-bold truncate">
                  {userProfile.roleLabel}
                </span>
              </div>
            )}
          </div>

          {!collapsed && (
            <ChevronUp className={`h-4 w-4 text-slate-400 group-hover:text-white transition-transform duration-200 ${showUserPopup ? 'rotate-180 text-teal-400' : ''}`} />
          )}
        </button>
      </div>
    </aside>
  );
}
