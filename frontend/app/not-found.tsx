import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex h-[70vh] flex-col items-center justify-center text-center p-6">
      <h1 className="text-6xl font-black text-teal-600">404</h1>
      <h2 className="mt-2 text-xl font-bold text-slate-800">Halaman Tidak Ditemukan</h2>
      <p className="mt-1 text-xs text-slate-500 max-w-sm">
        Halaman yang Anda cari tidak tersedia atau telah dipindahkan dalam sistem UrbanLoad.AI.
      </p>
      <div className="mt-6">
        <Link href="/">
          <Button>Kembali ke Beranda</Button>
        </Link>
      </div>
    </div>
  );
}
