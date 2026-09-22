import React, { Suspense, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { NotificationBell } from './NotificationBell.jsx';
import { RealtimeStatusDot } from './RealtimeStatusDot.jsx';
import { LogOut, Truck, UserCheck, UserPlus } from 'lucide-react';
import { Button } from '../ui/button.jsx';
import { createClient } from '../../lib/supabase/client.js';

function HeaderNavContent() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState({ name: 'Pengguna', roleLabel: 'Kurir', initial: 'K' });

  useEffect(() => {
    async function loadUserProfile() {
      const isDemo = searchParams.get('demo') === 'true';
      if (isDemo) {
        setCurrentUser({ id: 'demo-user' });
        setUserProfile({ name: 'Juri Reviewer', roleLabel: 'Evaluator Juri', initial: 'J' });
        return;
      }

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
        if (role === 'city_admin' || role === 'admin') roleLabel = 'Admin Kota';
        else if (role === 'dishub_officer') roleLabel = 'Petugas Dishub';

        const initial = name.charAt(0).toUpperCase() || 'K';
        setUserProfile({ name, roleLabel, initial });
      } else {
        setCurrentUser(null);
      }
    }

    loadUserProfile();
  }, [searchParams, pathname]);

  const isPublicPreviewMap = pathname === '/city/livemap' && searchParams.get('preview') === 'public';

  // If user is authenticated, they are NEVER treated as public visitor!
  const isPublicPage = !currentUser && (
    pathname === '/' ||
    pathname.startsWith('/fitur') ||
    pathname.startsWith('/cara-kerja') ||
    pathname.startsWith('/tentang') ||
    pathname.startsWith('/kontak') ||
    pathname.startsWith('/docs-api') ||
    pathname.startsWith('/status-sistem') ||
    pathname.startsWith('/demo') ||
    pathname === '/login' ||
    pathname === '/register' ||
    isPublicPreviewMap
  );

  return (
    <header className="sticky top-0 z-50 flex h-[64px] w-full items-center justify-between border-b border-slate-200/90 bg-white/80 px-4 sm:px-6 backdrop-blur-md text-slate-800">
      {/* Kiri: Logo + Wordmark */}
      <div className="flex items-center gap-3">
        <Link to={currentUser ? '/rider/dashboard' : '/'} className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md shadow-teal-600/20 group-hover:scale-105 transition duration-200">
            <Truck className="h-5 w-5" />
          </div>
          <span className="text-lg font-black tracking-tight text-slate-900">
            UrbanLoad<span className="text-teal-600">.AI</span>
          </span>
        </Link>
      </div>

      {/* Tengah: Navigasi Terpisah (Public Marketing vs Operational App) */}
      {isPublicPage ? (
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
          <Link to="/" className="hover:text-teal-600 transition">
            Beranda
          </Link>
          <a href="/#modul" className="hover:text-teal-600 transition">
            Fitur & Cara Kerja
          </a>
          <Link to="/city/livemap?preview=public" className="hover:text-teal-600 transition flex items-center gap-1.5 text-teal-700 font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Preview (View-Only)
          </Link>
          <Link to="/tentang" className="hover:text-teal-600 transition">
            Tentang Tim
          </Link>
        </nav>
      ) : (
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
          <Link to="/rider/dashboard" className={`hover:text-teal-600 transition ${pathname === '/rider/dashboard' ? 'text-teal-600 font-bold' : ''}`}>
            Dashboard
          </Link>
          <Link to="/rider/bookings/new" className={`hover:text-teal-600 transition ${pathname === '/rider/bookings/new' ? 'text-teal-600 font-bold' : ''}`}>
            Booking
          </Link>
          <Link to="/rider/congestion" className={`hover:text-teal-600 transition ${pathname === '/rider/congestion' ? 'text-teal-600 font-bold' : ''}`}>
            Kepadatan
          </Link>
          <Link to="/city/zones" className={`hover:text-teal-600 transition ${pathname === '/city/zones' ? 'text-teal-600 font-bold' : ''}`}>
            Zona
          </Link>
          <Link to="/city/livemap" className={`hover:text-teal-600 transition ${pathname === '/city/livemap' ? 'text-teal-600 font-bold' : ''}`}>
            LiveMap
          </Link>
        </nav>
      )}

      {/* Kanan: Actions */}
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

            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
              <div className="h-6 w-6 rounded-full bg-teal-600 flex items-center justify-center text-xs font-bold text-white uppercase">
                {userProfile.initial}
              </div>
              <div className="text-left leading-tight hidden sm:block">
                <span className="text-xs font-bold text-slate-800 block truncate max-w-[100px]">
                  {userProfile.name}
                </span>
                <span className="text-[10px] text-teal-700 font-medium block">
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
              title="Keluar"
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
