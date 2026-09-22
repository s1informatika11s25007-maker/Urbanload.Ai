import { Card } from '@/components/ui/card';

export default function KontakPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-slate-900">Kontak Tim Pengembang</h1>
        <p className="text-xs text-slate-500">Tim UrbanLoad.AI — Solusi Inovasi Logistik Perkotaan</p>
      </div>

      <Card className="p-6 space-y-4 text-xs text-slate-700">
        <div><strong>Email Dukungan:</strong> support@urbanload.ai</div>
        <div><strong>Tim Developer:</strong> UrbanLoad.AI Core Innovation Team</div>
        <div><strong>Lokasi Operasional:</strong> Jakarta, Indonesia</div>
      </Card>
    </div>
  );
}
