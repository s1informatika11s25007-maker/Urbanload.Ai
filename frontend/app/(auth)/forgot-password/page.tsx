import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ForgotPasswordPage() {
  return (
    <Card className="w-full max-w-sm p-6 space-y-4 text-center">
      <h2 className="text-xl font-bold">Lupa Kata Sandi</h2>
      <input type="email" placeholder="Email Anda" className="w-full border rounded p-2 text-xs" />
      <Button className="w-full text-xs">Kirim Link Reset</Button>
    </Card>
  );
}
