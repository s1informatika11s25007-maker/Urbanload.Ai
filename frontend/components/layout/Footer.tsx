'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export function Footer() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' }) + ' WIB');
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="flex h-[56px] w-full items-center justify-between border-t border-slate-200 bg-white px-6 text-xs text-slate-500">
      {/* Kiri */}
      <div>© 2025 UrbanLoad.AI · v1.0.0</div>

      {/* Tengah */}
      <div className="hidden sm:flex gap-5 font-medium text-slate-600">
        <Link href="/tentang" className="hover:text-teal-600 transition">Tentang</Link>
        <Link href="/kontak" className="hover:text-teal-600 transition">Kontak Tim</Link>
        <Link href="/docs-api" className="hover:text-teal-600 transition">Dokumentasi API</Link>
        <Link href="/status-sistem" className="hover:text-teal-600 transition">Status Sistem</Link>
      </div>

      {/* Kanan */}
      <div className="flex items-center gap-2 font-mono text-[11px]">
        <span className="text-slate-600">Server: {time || '21:14:03 WIB'}</span>
        <span className="flex items-center gap-1.5 font-sans text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          12 Zona Aktif
        </span>
      </div>
    </footer>
  );
}
