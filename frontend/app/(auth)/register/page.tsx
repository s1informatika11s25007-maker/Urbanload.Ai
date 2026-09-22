'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
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
  AlertCircle,
  Loader2,
  AtSign,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<'rider' | 'city' | 'dishub'>('rider');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Smart Email Normalizer: Auto-appends @gmail.com if no custom domain is entered
  const normalizeEmail = (val: string): string => {
    const trimmed = val.trim();
    if (!trimmed) return '';
    if (trimmed.includes('@')) return trimmed; // Custom domain entered by user
    return `${trimmed}@gmail.com`; // Default easy domain
  };

  const handleSelectRole = (selectedRole: 'rider' | 'city' | 'dishub') => {
    setRole(selectedRole);
    setErrorMessage(null);
    if (selectedRole === 'city' && !emailInput) {
      setEmailInput('admin@jakarta.go.id');
    } else if (selectedRole === 'dishub' && !emailInput) {
      setEmailInput('petugas@dishub.go.id');
    } else if (selectedRole === 'rider' && (emailInput === 'admin@jakarta.go.id' || emailInput === 'petugas@dishub.go.id')) {
      setEmailInput('');
    }
  };

  const handleApplyDomain = (domain: string) => {
    const username = emailInput.split('@')[0].trim();
    if (username) {
      setEmailInput(`${username}${domain}`);
    } else {
      setEmailInput(`pengguna${domain}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName || !phone || !password) {
      setErrorMessage('Nama Lengkap, Nomor Telepon, dan Kata Sandi wajib diisi.');
      return;
    }

    const finalEmail = emailInput ? normalizeEmail(emailInput) : `${phone.replace(/\D/g, '')}@rider.urbanload.ai`;
    const targetRole = role === 'city' ? 'city_admin' : role === 'dishub' ? 'dishub_officer' : 'rider';

    setLoading(true);
    const supabase = createClient();

    try {
      const { data, error } = await supabase.auth.signUp({
        email: finalEmail,
        password,
        options: {
          data: {
            full_name: fullName,
            phone_number: phone,
            role: targetRole,
          },
        },
      });

      if (error) {
        setErrorMessage(`Gagal Pendaftaran: ${error.message}`);
        setLoading(false);
        return;
      }

      if (data?.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          phone_number: phone,
          email: finalEmail,
          full_name: fullName,
          role: targetRole,
          phone_verified: false,
          updated_at: new Date().toISOString(),
        });
      }

      if (role === 'rider') {
        router.push(`/verify-otp?phone=${encodeURIComponent(phone)}&role=rider`);
      } else {
        router.push(`/verify-otp?email=${encodeURIComponent(finalEmail)}&role=${role}`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem saat mendaftar.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = fullName && phone && password && (role === 'rider' || emailInput);

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
            Registrasi real-time akun logistik perkotaan
          </p>
        </div>

        {/* Role Selection Tabs */}
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

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-semibold">{errorMessage}</div>
          </div>
        )}

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

          {/* Wajib 2: Nomor Telepon / WhatsApp */}
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

          {/* Conditional Field: Email */}
          <div>
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                {role === 'rider' ? 'Email atau Username (Opsional)' : role === 'city' ? 'Email Resmi Admin Kota' : 'Email Resmi Petugas Dishub'}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${role === 'rider' ? 'bg-slate-100 text-slate-600' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                {role === 'rider' ? 'Opsional' : 'Wajib'}
              </span>
            </label>
            <input
              type="text"
              required={role !== 'rider'}
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder={role === 'rider' ? 'kurir atau kurir@gmail.com' : role === 'city' ? 'admin@jakarta.go.id' : 'petugas@dishub.go.id'}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
            />

            {/* Smart Domain Shortcut Chips */}
            <div className="flex items-center gap-1.5 pt-2 flex-wrap">
              <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-0.5">
                <AtSign className="h-3 w-3" /> Pilih Domain:
              </span>
              <button
                type="button"
                onClick={() => handleApplyDomain('@gmail.com')}
                className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition"
              >
                + @gmail.com
              </button>
              <button
                type="button"
                onClick={() => handleApplyDomain('@urbanload.ai')}
                className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition"
              >
                + @urbanload.ai
              </button>
              <button
                type="button"
                onClick={() => handleApplyDomain('@jakarta.go.id')}
                className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 transition"
              >
                + @jakarta.go.id
              </button>
              <button
                type="button"
                onClick={() => handleApplyDomain('@dishub.go.id')}
                className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 transition"
              >
                + @dishub.go.id
              </button>
            </div>
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
            disabled={!agreed || !isFormValid || loading}
            className="w-full py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-md mt-2"
          >
            {loading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>Memuat...</span>
              </span>
            ) : role === 'rider' ? (
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
