'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Route Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center space-y-4">
      <h2 className="text-2xl font-black text-slate-900">Terjadi Kesalahan Sistem</h2>
      <p className="text-xs text-slate-500 max-w-sm">
        Sistem mendeteksi kendala pada pemuatan modul. Silakan muat ulang halaman.
      </p>
      <Button onClick={() => reset()} className="text-xs py-2 px-4">
        Coba Muat Ulang Halaman
      </Button>
    </div>
  );
}
