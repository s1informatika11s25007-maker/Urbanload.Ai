
import { useEffect } from 'react';

/**
 * HmrAutoSync:
 * Mendeteksi jika Next.js gagal memuat chunk (biasanya terjadi saat server restart dan cache lama masih di browser).
 * Secara otomatis melakukan refresh halaman untuk menyinkronkan aset terbaru tanpa intervensi manual.
 */
export function HmrAutoSync() {
  useEffect(() => {
    const handleChunkError = (event) => {
      const errorMsg = event.message || '';
      // Pola error Next.js saat chunk 404
      if (
        errorMsg.includes('Loading chunk') ||
        errorMsg.includes('Unexpected token') ||
        errorMsg.includes('SyntaxError')
      ) {
        console.warn('⚠️ UrbanLoad Sync aset lama, menyinkronkan ulang halaman...');
        window.location.reload();
      }
    };

    window.addEventListener('error', handleChunkError);
    return () => window.removeEventListener('error', handleChunkError);
  }, []);

  return null;
}
