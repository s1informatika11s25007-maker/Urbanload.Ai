'use client';

import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body className="flex min-h-screen flex-col items-center justify-center p-6 text-center space-y-4 bg-slate-50 text-slate-900">
        <h2 className="text-2xl font-black text-slate-900">Kendala Aplikasi Global</h2>
        <p className="text-xs text-slate-500 max-w-sm">
          Sistem mendeteksi kesalahan pada komponen tingkat atas.
        </p>
        <Button onClick={() => reset()} className="text-xs py-2 px-4">
          Coba Lagi
        </Button>
      </body>
    </html>
  );
}
