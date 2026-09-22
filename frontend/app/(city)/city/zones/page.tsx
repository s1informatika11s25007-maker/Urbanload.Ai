'use client';

import dynamic from 'next/dynamic';
import { ZoneListTable } from '@/components/zones/ZoneListTable';
import { GeofenceValidator } from '@/components/zones/GeofenceValidator';
import { Download, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ZoneDrawMap = dynamic(
  () => import('@/components/zones/ZoneDrawMap').then((mod) => mod.ZoneDrawMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[500px] rounded-2xl bg-slate-900 border border-slate-700 flex flex-col items-center justify-center text-teal-400 text-xs font-bold gap-3 animate-pulse shadow-md">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        <span>Memuat MapLibre Drawing Editor...</span>
      </div>
    ),
  }
);

export default function VirtualGeoFencePage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-2">
        <div>
          <div className="text-xs text-slate-500 mb-1">Beranda / Manajemen Zona</div>
          <h1 className="text-2xl font-black text-slate-900">Manajemen Batas Zona Logistik</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button className="text-xs flex items-center gap-1">
            <Plus className="h-3.5 w-3.5" /> Tambah Zona Baru
          </Button>
          <Button variant="outline" className="text-xs flex items-center gap-1">
            <Download className="h-3.5 w-3.5" /> Ekspor GeoJSON
          </Button>
        </div>
      </div>

      {/* Section 1: Peta Interaktif Drawing Tool */}
      <ZoneDrawMap />

      {/* Section 2: Tabel Daftar Zona */}
      <ZoneListTable />

      {/* Section 3: Panel Validasi Lokasi (PostGIS) */}
      <GeofenceValidator />

      {/* Footer Info Teknis */}
      <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-500 border border-slate-200 font-mono">
        Info teknis: Sistem koordinat WGS84 / EPSG:4326. Penyimpanan: PostGIS GEOGRAPHY(POLYGON).
      </div>
    </div>
  );
}
