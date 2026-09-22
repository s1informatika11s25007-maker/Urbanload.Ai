'use client';

import { Suspense, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { NotificationBell } from './NotificationBell';
import { RealtimeStatusDot } from './RealtimeStatusDot';
import { LogOut, Truck, UserCheck, UserPlus } from 'lucide-react';
import { Button } from '../ui/button';

function HeaderNavContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Prefetch all key app feature routes in background
  useEffect(() => {
    router.prefetch('/rider/dashboard');
    router.prefetch('/rider/bookings/new');
    router.prefetch('/rider/congestion');
    router.prefetch('/city/zones');
    router.prefetch('/city/livemap');
  }, [router]);

  const isPublicPreviewMap = pathname === '/city/livemap' && searchParams.get('preview') === 'public';

  const isPublicPage =
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
    isPublicPreviewMap;

  return (
    <header className="sticky top-0 z-50 flex h-[64px] w-full items-center justify-between border-b border-slate-200/90 bg-white/80 px-6 backdrop-blur-md text-slate-800">
      {/* Kiri: Logo + Wordmark */}
      <div className="flex items-center gap-3">
        <Link href="/" prefetch={true} className="flex items-center gap-2.5 group">
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
          <Link href="/" prefetch={true} className="hover:text-teal-600 transition">
            Beranda
          </Link>
          <Link href="/#modul" prefetch={true} className="hover:text-teal-600 transition">
            Fitur & Cara Kerja
          </Link>
          <Link href="/city/livemap?preview=public" prefetch={true} className="hover:text-teal-600 transition flex items-center gap-1.5 text-teal-700 font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Preview (View-Only)
          </Link>
          <Link href="/tentang" prefetch={true} className="hover:text-teal-600 transition">
            Tentang Tim
          </Link>
        </nav>
      ) : (
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
          <Link href="/rider/dashboard" prefetch={true} className="hover:text-teal-600 transition">
            Dashboard
          </Link>
          <Link href="/rider/bookings/new" prefetch={true} className="hover:text-teal-600 transition">
            Booking
          </Link>
          <Link href="/rider/congestion" prefetch={true} className="hover:text-teal-600 transition">
            Kepadatan
          </Link>
          <Link href="/city/zones" prefetch={true} className="hover:text-teal-600 transition">
            Zona
          </Link>
          <Link href="/city/livemap" prefetch={true} className="hover:text-teal-600 transition">
            LiveMap
          </Link>
        </nav>
      )}

      {/* Kanan: Actions */}
      <div className="flex items-center gap-3">
        {isPublicPage ? (
          <div className="flex items-center gap-2">
            <Link href="/login" prefetch={true}>
              <Button variant="outline" className="text-xs py-1.5 px-3 flex items-center gap-1.5">
                <UserCheck className="h-3.5 w-3.5" /> Masuk
              </Button>
            </Link>
            <Link href="/register" prefetch={true}>
              <Button className="text-xs py-1.5 px-3 flex items-center gap-1.5">
                <UserPlus className="h-3.5 w-3.5" /> Daftar
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <NotificationBell />
            <RealtimeStatusDot />

            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
              <div className="h-6 w-6 rounded-full bg-teal-600 flex items-center justify-center text-xs font-bold text-white">
                K
              </div>
              <span className="text-xs font-semibold text-slate-700">Kurir</span>
            </div>

            <Link href="/login" prefetch={true}>
              <button className="text-slate-400 hover:text-rose-600 transition p-1" title="Keluar">
                <LogOut className="h-5 w-5" />
              </button>
            </Link>
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
