import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function OnboardingPage() {
  return (
    <Card className="w-full max-w-md p-6 space-y-4 text-center">
      <h2 className="text-xl font-bold">Selamat Datang di UrbanLoad.AI!</h2>
      <p className="text-xs text-slate-500">Pilih peran Anda untuk menyesuaikan tampilan dashboard:</p>
      <div className="grid grid-cols-2 gap-3 pt-2">
        <Button variant="outline" className="text-xs">Kurir Logistik</Button>
        <Button variant="outline" className="text-xs">Petugas Dishub</Button>
      </div>
    </Card>
  );
}
