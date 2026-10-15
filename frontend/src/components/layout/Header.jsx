import React, { Suspense, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { NotificationBell } from './NotificationBell.jsx';
import { RealtimeStatusDot } from './RealtimeStatusDot.jsx';
import {
  LogOut,
  Truck,
  UserCheck,
  UserPlus,
  ChevronRight,
  ShieldAlert,
  X,
  User,
  Shield
} from 'lucide-react';
import { Button } from '../ui/button.jsx';
import { createClient } from '../../lib/supabase/client.js';

function HeaderNavContent() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [showMobileLogoutModal, setShowMobileLogoutModal] = useState(false);
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

        let roleLabel = 'Kurir Logistik';
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

  const isPublicPage = pathname === '/' || pathname === '/lapor' || pathname.startsWith('/lapor') || (!currentUser && (
    pathname.startsWith('/fitur') ||
    pathname.startsWith('/cara-kerja') ||
    pathname.startsWith('/tentang') ||
    pathname.startsWith('/kontak') ||
    pathname.startsWith('/docs-api') ||
    pathname.startsWith('/status-sistem') ||
    pathname === '/login' ||
    pathname === '/register' ||
    isPublicPreviewMap
  ));

  const handleLogout = async () => {
    setShowMobileLogoutModal(false);
    setCurrentUser(null);
    setUserProfile({ name: 'Pengguna', role: 'rider', roleLabel: 'Kurir', initial: 'K', email: '' });

    const supabase = createClient();
    await supabase.auth.signOut();
    const { performCleanLogout } = await import('../../lib/auth-logout.js');
    await performCleanLogout(navigate);
  };

  const getBreadcrumbTitle = () => {
    if (pathname === '/city/zones') return { category: 'Manajemen Spasial', title: 'Editor Zona PostGIS' };
    if (pathname === '/city/livemap') return { category: 'Pemantauan Realtime', title: 'Telemetri & GeoFence Spasial' };
    if (pathname === '/rider/dashboard') return { category: 'Operasional Kurir', title: 'Dashboard Slot Booking' };
    if (pathname === '/rider/bookings/new') return { category: 'SmartSlot AI', title: 'Pemesanan Slot Baru' };
    if (pathname === '/rider/congestion') return { category: 'Analisis Logistik', title: 'Skor Kepadatan Zona' };
    return { category: 'UrbanLoad.AI', title: 'Dashboard System' };
  };

  const breadcrumb = getBreadcrumbTitle();

  return (
    <header className="sticky top-0 z-30 flex h-[64px] w-full items-center justify-between border-b border-slate-200/90 bg-white/95 px-3 sm:px-6 backdrop-blur-md text-slate-800 shadow-sm relative">
      {/* Kiri: Mobile Brand & Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="flex lg:hidden items-center gap-2 group"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white shadow-md">
            <Truck className="h-4 w-4" />
          </div>
          <span className="text-base font-black tracking-tight text-slate-900">
            UrbanLoad<span className="text-teal-600">.AI</span>
          </span>
        </Link>

        {!isPublicPage && (
          <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="text-slate-400 font-mono">{breadcrumb.category}</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-extrabold text-slate-900 text-xs font-sans">{breadcrumb.title}</span>
          </div>
        )}
      </div>

      {/* Tengah: Navigasi Khusus Publik */}
      {isPublicPage && (
        <nav className="hidden md:flex items-center gap-7 text-xs font-bold text-slate-600 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
          <Link
            to="/"
            className={`hover:text-teal-600 transition-colors py-1 border-b-2 ${
              pathname === '/' ? 'text-teal-600 border-teal-600 font-extrabold' : 'border-transparent hover:border-slate-300'
            }`}
          >
            Beranda
          </Link>
          <Link
            to="/city/livemap?preview=public"
            className={`hover:text-teal-600 transition-colors py-1 border-b-2 flex items-center gap-1.5 font-extrabold ${
              isPublicPreviewMap ? 'text-teal-700 border-teal-600' : 'text-teal-700/90 border-transparent hover:border-teal-300'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Map Publik
          </Link>
          <Link
            to="/tentang"
            className={`hover:text-teal-600 transition-colors py-1 border-b-2 ${
              pathname === '/tentang' ? 'text-teal-600 border-teal-600 font-extrabold' : 'border-transparent hover:border-slate-300'
            }`}
          >
            Tentang Tim
          </Link>
          <Link
            to="/lapor"
            className={`hover:text-teal-600 transition-colors py-1 border-b-2 ${
              pathname === '/lapor' || pathname.startsWith('/lapor')
                ? 'text-rose-600 border-rose-600 font-extrabold'
                : 'border-transparent hover:border-slate-300'
            }`}
          >
            Lapor Pelanggaran
          </Link>
        </nav>
      )}

      {/* Kanan: Realtime Bell & Profil jika Logged In / Publik Links jika Belum Login */}
      <div className="flex items-center gap-2 sm:gap-3">
        {isPublicPage ? (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link to="/login">
              <Button variant="outline" className="text-xs py-1 px-2.5 sm:py-1.5 sm:px-3 flex items-center gap-1 font-bold">
                <UserCheck className="h-3.5 w-3.5" /> Masuk
              </Button>
            </Link>
            <Link to="/register">
              <Button className="text-xs py-1 px-2.5 sm:py-1.5 sm:px-3 flex items-center gap-1 font-bold bg-teal-600 hover:bg-teal-700 text-white">
                <UserPlus className="h-3.5 w-3.5" /> Daftar
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3">
            <RealtimeStatusDot />
            <NotificationBell />

            <Link
              to="/dishub/reports"
              className="hidden sm:flex items-center gap-1.5 bg-rose-50 text-rose-800 border border-rose-200 px-2.5 py-1 rounded-xl text-xs font-extrabold hover:bg-rose-100 transition shadow-sm"
              title="Pusat Laporan Pelanggaran CitizenReport"
            >
              <ShieldAlert className="h-3.5 w-3.5 text-rose-600 animate-pulse" />
              <span>CitizenReport</span>
            </Link>

            {/* ELEGAN PROFILE BADGE WITH TAP LOGOUT FOR MOBILE ANDROID */}
            <div className="relative pl-1 border-l border-slate-200">
              <button
                type="button"
                onClick={() => setShowMobileLogoutModal(!showMobileLogoutModal)}
                className="flex items-center gap-2 group p-1 rounded-xl hover:bg-slate-100 transition active:scale-95"
                title="Kelola Akun / Keluar"
              >
                <div className="h-8 w-8 rounded-xl bg-teal-600 text-white font-black flex items-center justify-center text-xs shadow-sm ring-2 ring-teal-500/30 group-hover:ring-teal-600">
                  {userProfile.initial}
                </div>
                <div className="hidden sm:block text-left leading-tight">
                  <span className="font-bold text-xs text-slate-900 block truncate max-w-[110px]">
                    {userProfile.name}
                  </span>
                  <span className="text-[10px] text-teal-700 font-mono font-bold block uppercase">
                    {userProfile.roleLabel}
                  </span>
                </div>
              </button>

              {/* ELEGANT MOBILE & DESKTOP LOGOUT POPUP MODAL */}
              {showMobileLogoutModal && (
                <div className="absolute right-0 top-12 z-50 w-64 bg-slate-900 text-white rounded-2xl border border-slate-700 shadow-2xl p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex justify-between items-start border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-xl bg-teal-600 text-white font-black flex items-center justify-center text-sm shadow-md">
                        {userProfile.initial}
                      </div>
                      <div className="text-left leading-tight">
                        <span className="font-black text-xs text-white block truncate max-w-[140px]">
                          {userProfile.name}
                        </span>
                        <span className="text-[10px] text-teal-400 font-mono font-bold uppercase block">
                          {userProfile.roleLabel}
                        </span>
                        {userProfile.email && (
                          <span className="text-[9px] text-slate-400 block truncate max-w-[140px]">
                            {userProfile.email}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setShowMobileLogoutModal(false)}
                      className="text-slate-400 hover:text-white p-0.5"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition active:scale-95"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Keluar Akun (Log Out)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
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
