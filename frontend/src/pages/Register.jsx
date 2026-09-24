import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button.jsx';
import { createClient } from '../lib/supabase/client.js';
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
  Cpu,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState('rider');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const normalizeEmail = (val) => {
    const trimmed = val.trim();
    if (!trimmed) return '';
    if (trimmed.includes('@')) return trimmed;
    return `${trimmed}@gmail.com`;
  };

  const handleSelectRole = (selectedRole) => {
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

  const handleApplyDomain = (domain) => {
    const username = emailInput.split('@')[0].trim();
    if (username) {
      setEmailInput(`${username}${domain}`);
    } else {
      setEmailInput(`pengguna${domain}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName || !phone || !password) {
      setErrorMessage('Nama Lengkap, Nomor Telepon, dan Kata Sandi wajib diisi.');
      return;
    }

    const finalEmail = emailInput ? normalizeEmail(emailInput) : null;
    const targetRole = role === 'city' ? 'city_admin' : role === 'dishub' ? 'dishub_officer' : 'rider';

    setLoading(true);

    try {
      // 1. Direct Backend API Registration
      const apiRes = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          phoneNumber: phone,
          email: finalEmail,
          password,
          role: targetRole,
        }),
      });

      const apiData = await apiRes.json();

      // 2. Supabase Auth Registration
      const supabase = createClient();
      if (finalEmail) {
        const { error: authError } = await supabase.auth.signUp({
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

        if (authError && !authError.message.includes('rate limit') && !apiData.success) {
          setErrorMessage(`Gagal Pendaftaran: ${authError.message}`);
          setLoading(false);
          return;
        }
      }

      // 3. Upsert Profile
      await supabase.from('profiles').upsert({
        phone_number: phone,
        email: finalEmail,
        full_name: fullName,
        role: targetRole,
        phone_verified: false,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'phone_number' });

      // 4. Smooth Navigation to OTP
      if (role === 'rider') {
        navigate(`/verify-otp?phone=${encodeURIComponent(phone)}&role=rider`);
      } else {
        navigate(`/verify-otp?email=${encodeURIComponent(finalEmail || phone)}&role=${role}`);
      }
    } catch (err) {
      navigate(`/verify-otp?phone=${encodeURIComponent(phone)}&role=${role}`);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = fullName && phone && password && (role === 'rider' || emailInput);

  return (
    <div className="min-h-[calc(100vh-64px)] w-full flex flex-col lg:flex-row bg-slate-50 text-slate-900">
      {/* KIRI: Brand Showcase Panel (Laptops/Desktops Only, Konsisten Warna Hijau/Teal & Latar Putih) */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-teal-50/80 via-white to-emerald-50/60 p-12 flex-col justify-between relative border-r border-slate-200">
        {/* Subtle Green Ambient Glow */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-teal-200/30 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Tagline Only (Logo Removed To Prevent Double Logo) */}
        <div className="relative z-10 space-y-1">
          <span className="text-[11px] font-black uppercase tracking-widest text-teal-700 font-mono">
            Registrasi Akun Pengendali Logistik
          </span>
          <p className="text-xs text-slate-600 max-w-md font-medium">
            Terhubung Langsung Ke Sistem Kuota Loading Bay & SmartSlot AI
          </p>
        </div>

        {/* Middle Value Proposition */}
        <div className="relative z-10 space-y-6 my-auto max-w-lg">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-teal-100 text-teal-800 border border-teal-200">
              <Shield className="h-3.5 w-3.5 text-teal-600" /> Ekosistem Terverifikasi
            </span>
            <h2 className="text-3xl font-black leading-tight text-slate-900">
              Bergabung dengan Jaringan Logistik Cerdas
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Daftar sebagai Kurir Logistik, Admin Kota, atau Petugas Dishub untuk mengelola slot bongkar muat secara efisien.
            </p>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-teal-100 shadow-sm">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-slate-900 block">Registrasi Otomatis & Terverifikasi</span>
                <span className="text-[11px] text-slate-500">Integrasi OTP WhatsApp & Email verifikasi instan</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-teal-100 shadow-sm">
              <CheckCircle2 className="h-5 w-5 text-teal-600 shrink-0" />
              <div>
                <span className="font-bold text-slate-900 block">Akses Langsung Fitur SmartSlot AI</span>
                <span className="text-[11px] text-slate-500">Rekomendasi slot waktu bebas hambatan & penalti StrikeBan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Status */}
        <div className="relative z-10 p-4 rounded-2xl bg-white border border-teal-200 flex items-center justify-between shadow-sm">
          <span className="text-xs font-bold text-slate-800">
            Terhubung ke Database PostGIS Realtime
          </span>
          <span className="text-[10px] font-mono bg-teal-50 text-teal-800 px-2.5 py-1 rounded-full border border-teal-200 font-bold">
            Aman & Enkripsi HMAC-SHA256
          </span>
        </div>
      </div>

      {/* KANAN: Form Pendaftaran (Full Width di Mobile Android, Half Width di Laptop, White Background) */}
      <div className="w-full lg:w-1/2 bg-white p-6 sm:p-12 flex flex-col justify-center items-center overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Daftar Akun Baru
            </h1>
            <p className="text-xs text-slate-500">
              Lengkapi formulir di bawah ini untuk membuat akun baru
            </p>
          </div>

          {/* Role Selection Tabs */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-teal-600" /> Pilih Peran Pengguna:
              </span>
              <span className="text-[11px] font-black text-teal-700 uppercase tracking-wider">
                {role === 'rider' ? 'Kurir' : role === 'city' ? 'Admin Kota' : 'Dishub'}
              </span>
            </label>

            <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => handleSelectRole('rider')}
                className={`py-2.5 px-1 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
                  role === 'rider'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <Truck className="h-3.5 w-3.5 shrink-0" /> Kurir
              </button>

              <button
                type="button"
                onClick={() => handleSelectRole('city')}
                className={`py-2.5 px-1 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
                  role === 'city'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <Building2 className="h-3.5 w-3.5 shrink-0" /> Admin Kota
              </button>

              <button
                type="button"
                onClick={() => handleSelectRole('dishub')}
                className={`py-2.5 px-1 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
                  role === 'dishub'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <Shield className="h-3.5 w-3.5 shrink-0" /> Dishub
              </button>
            </div>
          </div>

          {/* Error Alert Box */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in font-semibold">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
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
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 font-medium"
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
                className="w-full rounded-xl border border-teal-300 bg-teal-50/30 px-3.5 py-2.5 text-xs text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 font-mono font-bold"
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
                placeholder={role === 'rider' ? 'kurir atau kurir@gmail.com (Boleh dikosongkan)' : role === 'city' ? 'admin@jakarta.go.id' : 'petugas@dishub.go.id'}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 font-medium"
              />

              {/* Smart Domain Shortcut Chips */}
              <div className="flex items-center gap-1.5 pt-2 flex-wrap">
                <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-0.5">
                  <AtSign className="h-3 w-3" /> Domain:
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
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 pr-10 font-medium"
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
              className="w-full py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-md bg-teal-600 hover:bg-teal-700 text-white mt-2"
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
            <Link to="/login" className="text-teal-600 font-bold hover:underline">
              Masuk ke Akun
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
