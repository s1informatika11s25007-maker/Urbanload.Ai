import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PanicReschedulePage() {
  return (
    <Card className="p-6 max-w-md mx-auto space-y-4 text-center">
      <h2 className="text-xl font-bold text-rose-600">Panic Reschedule Button</h2>
      <p className="text-xs text-slate-500">Gunakan dalam situasi darurat macet parah atau kendala mesin untuk menjadwal ulang tanpa terkena sanksi penalti StrikeBan.</p>
      <Button variant="danger" className="w-full text-xs py-2">Aktifkan Reschedule Darurat</Button>
    </Card>
  );
}
