import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ResetPasswordPage() {
  return (
    <Card className="w-full max-w-sm p-6 space-y-4 text-center">
      <h2 className="text-xl font-bold">Reset Kata Sandi</h2>
      <input type="password" placeholder="Kata Sandi Baru" className="w-full border rounded p-2 text-xs" />
      <Button className="w-full text-xs">Simpan Kata Sandi</Button>
    </Card>
  );
}
