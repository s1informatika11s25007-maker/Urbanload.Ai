'use client';

import { Download, Share2, XCircle, MapPin } from 'lucide-react';
import { Button } from '../ui/button';

export function QRDownloadButton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 max-w-[500px] mx-auto my-4">
      <Button variant="outline" className="text-xs flex items-center justify-center gap-2">
        <Download className="h-4 w-4" /> Unduh QR
      </Button>
      <Button variant="outline" className="text-xs flex items-center justify-center gap-2">
        <Share2 className="h-4 w-4" /> Bagikan
      </Button>
      <Button variant="outline" className="text-xs flex items-center justify-center gap-2">
        <MapPin className="h-4 w-4" /> Rute Zona
      </Button>
      <Button variant="danger" className="text-xs flex items-center justify-center gap-2">
        <XCircle className="h-4 w-4" /> Batalkan
      </Button>
    </div>
  );
}
