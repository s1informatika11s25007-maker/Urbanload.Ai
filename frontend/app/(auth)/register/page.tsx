'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  User,
  Mail,
  Lock,
  Truck,
  Building2,
  Shield,
  UserPlus,
  ArrowRight,
  Eye,
  EyeOff,
  Phone,
  MessageSquare,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<'rider' | 'city' | 'dishub'>('rider');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);

  // Direct Role Selector with Immediate High-Contrast Visual Feedback
  const handleSelectRole = (selectedRole: 'rider' | 'city' | 'dishub') => {
    setRole(selectedRole);
    if (selectedRole === 'city' && !email) {
      setEmail('admin@jakarta.go.id');
    } else if (selectedRole === 'dishub' && !email) {
      setEmail('petugas@dishub.go.id');
    } else if (selectedRole === 'rider' && (email === 'admin@jakarta.go.id' || email === 'petugas@dishub.go.id')) {
      setEmail('');
    }
  };

  // Form submit handler with conditional verification flow
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !password) return;

    if (role === 'rider') {
      router.push(`/verify-otp?phone=${encodeURIComponent(phone)}&role=rider`);
    } else {
      if (!email) return;
      router.push(`/verify-otp?email=${encodeURIComponent(email)}&role=${role}`);
    }
  };

  const isFormValid = fullName && phone && password && (role === 'rider' || email);

  return (
    <div className="w-full max-w-md mx-auto py-8">
      <Card className="p-8 space-y-6 border-slate-200 shadow-xl bg-white/95 backdrop-blur-xl rounded-3xl">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-md shadow-teal-600/20 mx-auto">
            <UserPlus className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Daftar Akun Baru
          </h1>
          <p className="text-xs text-slate-500">
            Registrasi akun logistik berbasis Nomor Telepon (Primary Identifier)
          </p>
        </div>

        {/* Role Selection Tabs - High-Contrast Visual Toggle */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-teal-600" /> Pilih Peran Pengguna:
            </span>
            <span className="text-[11px] font-extrabold text-teal-700 uppercase tracking-wider">
              {role === 'rider' ? 'Kurir' : role === 'city' ? 'Admin Kota' : 'Dishub'}
            </span>
          </label>

          <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => handleSelectRole('rider')}
              className={`py-2.5 px-1 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all duration-150 ${
                role === 'rider'
                  ? 'bg-teal-600 text-white shadow-lg ring-2 ring-teal-600/30 scale-[1.02]'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Truck className="h-4 w-4 shrink-0" /> Kurir
            </button>

            <button
              type="button"
              onClick={() => handleSelectRole('city')}
              className={`py-2.5 px-1 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all duration-150 ${
                role === 'city'
                  ? 'bg-teal-600 text-white shadow-lg ring-2 ring-teal-600/30 scale-[1.02]'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Building2 className="h-4 w-4 shrink-0" /> Admin Kota
            </button>

            <button
              type="button"
              onClick={() => handleSelectRole('dishub')}
              className={`py-2.5 px-1 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all duration-150 ${
                role === 'dishub'
                  ? 'bg-teal-600 text-white shadow-lg ring-2 ring-teal-600/30 scale-[1.02]'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Shield className="h-4 w-4 shrink-0" /> Dishub
            </button>
          </div>
        </div>

        {/* Big Prominent Role Dynamic Notification Card */}
        <div className={`p-3.5 rounded-2xl border text-xs space-y-1 transition-all duration-200 ${
          role === 'rider'
            ? 'bg-teal-50 border-teal-200 text-teal-900'
            : role === 'city'
            ? 'bg-blue-50 border-blue-200 text-blue-900'
            : 'bg-purple-50 border-purple-200 text-purple-900'
        }`}>
          <div className="font-extrabold flex items-center gap-2">
            {role === 'rider' && <Truck className="h-4 w-4 text-teal-600" />}
            {role === 'city' && <Building2 className="h-4 w-4 text-blue-600" />}
            {role === 'dishub' && <Shield className="h-4 w-4 text-purple-600" />}
            <span>
              Peran Terpilih: {role === 'rider' ? 'Kurir Logistik / Rider' : role === 'city' ? 'Pengelola / Admin Kota' : 'Petugas Dishub Lapangan'}
            </span>
          </div>
          <div className="text-[11px] leading-relaxed opacity-90">
            {role === 'rider'
              ? 'Verifikasi via WhatsApp/SMS ke Nomor Telepon. Email bersifat opsional.'
              : role === 'city'
              ? 'Membutuhkan Email Resmi Admin Kota untuk laporan & verifikasi instansi.'
              : 'Membutuhkan Email Resmi Petugas Dishub untuk verifikasi akun pengawasan.'}
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Wajib 1: Nama Lengkap */}
          <div>
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
              <User className="h-3.5 w-3.5 text-slate-400" /> Nama Lengkap <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
            />
          </div>

          {/* Wajib 2: Nomor Telepon / WhatsApp (PRIMARY IDENTIFIER) */}
          <div>
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
              <Phone className="h-3.5 w-3.5 text-teal-600" /> Nomor Telepon / WhatsApp (Primary ID) <span className="text-rose-600">*</span>
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="081234567890"
              className="w-full rounded-xl border border-teal-300 bg-teal-50/20 px-3.5 py-2.5 text-xs text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 font-mono font-bold"
            />
          </div>

          {/* Conditional Field: Email (Opsional untuk Kurir, Wajib untuk Admin/Dishub) */}
          <div>
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                {role === 'rider' ? 'Email (Opsional)' : role === 'city' ? 'Email Resmi Admin Kota' : 'Email Resmi Petugas Dishub'}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${role === 'rider' ? 'bg-slate-100 text-slate-600' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                {role === 'rider' ? 'Opsional' : 'Wajib'}
              </span>
            </label>
            <input
              type="email"
              required={role !== 'rider'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={role === 'rider' ? 'kurir@gmail.com (Boleh dikosongkan)' : role === 'city' ? 'admin@jakarta.go.id' : 'petugas@dishub.go.id'}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
            />
          </div>

          {/* Wajib 3: Kata Sandi Baru */}
          <div>
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
              <Lock className="h-3.5 w-3.5 text-slate-400" /> Kata Sandi Baru <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Checkbox Terms */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="terms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="rounded border-slate-300 text-teal-600 focus:ring-teal-600"
            />
            <label htmlFor="terms" className="text-[11px] text-slate-600">
              Saya menyetujui <span className="text-teal-600 font-bold hover:underline">Ketentuan Kebijakan Logistik UrbanLoad.AI</span>.
            </label>
          </div>

          {/* Submit CTA */}
          <Button
            type="submit"
            disabled={!agreed || !isFormValid}
            className="w-full py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-md mt-2"
          >
            {role === 'rider' ? (
              <>
                <MessageSquare className="h-4 w-4" /> Lanjut Verifikasi OTP WhatsApp
              </>
            ) : role === 'city' ? (
              <>
                Lanjut Verifikasi Email Admin Kota <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                Lanjut Verifikasi Email Petugas Dishub <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {/* Footer Link */}
        <div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
          Sudah memiliki akun?{' '}
          <Link href="/login" className="text-teal-600 font-bold hover:underline">
            Masuk ke Akun
          </Link>
        </div>
      </Card>
    </div>
  );
}
