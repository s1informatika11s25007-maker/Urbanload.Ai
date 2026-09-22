import { Card } from '@/components/ui/card';

export default function ProfilePage() {
  return (
    <Card className="p-6 max-w-md mx-auto space-y-3">
      <h2 className="text-lg font-bold">Profil Pengguna</h2>
      <div className="text-xs space-y-1">
        <div><strong>Nama:</strong> Kurir Budi</div>
        <div><strong>Role:</strong> Rider / Kurir</div>
        <div><strong>Status:</strong> Terverifikasi Active</div>
      </div>
    </Card>
  );
}
