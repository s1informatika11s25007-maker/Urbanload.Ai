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
  Activity,
  Map,
  ChevronRight,
  Database
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

  // Breadcrumb Context Label based on active route
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
    <header className="sticky top-0 z-30 flex h-[64px] w-full items-center justify-between border-b border-slate-200/90 bg-white/95 px-4 sm:px-6 backdrop-blur-md text-slate-800 shadow-sm">
      {/* Kiri: Mobile Brand (atau Page Title Breadcrumb jika logged in) */}
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

      {/* Tengah: Navigasi Khusus Publik (Hanya muncul jika belum login) */}
      {isPublicPage && (
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
      )}

      {/* Kanan: Profile & Role Badge (Terpusat) */}
      <div className="flex items-center gap-3">
        {isPublicPage ? (
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="outline" className="text-xs py-1.5 px-3 flex items-center gap-1.5 font-bold">
                <UserCheck className="h-3.5 w-3.5" /> Masuk
              </Button>
            </Link>
            <Link to="/register">
              <Button className="text-xs py-1.5 px-3 flex items-center gap-1.5 font-bold bg-teal-600 hover:bg-teal-700 text-white">
                <UserPlus className="h-3.5 w-3.5" /> Daftar
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <NotificationBell />
            <RealtimeStatusDot />

            <div className="flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50/70 px-3 py-1 shadow-sm">
              <div className="h-6 w-6 rounded-full bg-teal-600 flex items-center justify-center text-xs font-black text-white uppercase">
                {userProfile.initial}
              </div>
              <div className="text-left leading-tight hidden sm:block">
                <span className="text-xs font-bold text-slate-900 block truncate max-w-[120px]">
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
