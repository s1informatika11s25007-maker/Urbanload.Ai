import { Card } from '@/components/ui/card';

export default function DocsApiPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-slate-900">Dokumentasi API v1</h1>
        <p className="text-xs text-slate-500">RESTful & PostGIS RPC Endpoint Architecture</p>
      </div>

      <Card className="p-6 space-y-4 text-xs font-mono">
        <div className="p-3 bg-slate-900 text-slate-100 rounded-xl space-y-1">
          <span className="text-teal-400">POST</span> /api/v1/bookings — Membuat pesanan slot bongkar muat baru
        </div>
        <div className="p-3 bg-slate-900 text-slate-100 rounded-xl space-y-1">
          <span className="text-teal-400">POST</span> /api/v1/qr/verify — Verifikasi HMAC-SHA256 signature QuickPass QR
        </div>
        <div className="p-3 bg-slate-900 text-slate-100 rounded-xl space-y-1">
          <span className="text-teal-400">POST</span> /api/v1/geofence/check — Eksekusi RPC PostGIS ST_Contains untuk lokasi truk
        </div>
        <div className="p-3 bg-slate-900 text-slate-100 rounded-xl space-y-1">
          <span className="text-teal-400">GET</span> /api/v1/congestion/score — Skor kepadatan real-time (1-10) per zona
        </div>
      </Card>
    </div>
  );
}
