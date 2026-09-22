'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Truck,
  Lock,
  Mail,
  ArrowRight,
  Award,
  Eye,
  EyeOff,
  Building2,
  Shield,
  CheckCircle2,
} from 'lucide-react';

export default function LoginPage() {
  const [role, setRole] = useState<'rider' | 'city' | 'dishub'>('rider');
  const [email, setEmail] = useState('kurir@urbanload.ai');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);

  // Quick fill preset per role
  const handleRoleSelect = (selectedRole: 'rider' | 'city' | 'dishub') => {
    setRole(selectedRole);
    if (selectedRole === 'rider') {
      setEmail('kurir@urbanload.ai');
    } else if (selectedRole === 'city') {
      setEmail('admin@urbanload.ai');
    } else if (selectedRole === 'dishub') {
      setEmail('petugas@dishub.go.id');
    }
  };

  const getDashboardLink = () => {
    if (role === 'city') return '/city/dashboard';
    if (role === 'dishub') return '/dishub/dashboard';
    return '/rider/dashboard';
  };

  return (
    <div className="w-full max-w-md mx-auto py-8">
      <Card className="p-8 space-y-6 border-slate-200 shadow-xl bg-white/95 backdrop-blur-xl rounded-3xl">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-md shadow-teal-600/20 mx-auto">
            <Truck className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Masuk ke UrbanLoad<span className="text-teal-600">.AI</span>
          </h1>
          <p className="text-xs text-slate-500">
            Akses dashboard operasional logistik perkotaan & PostGIS spatial
          </p>
        </div>

        {/* Guest Reviewer / Demo Juri Banner */}
        <Link href="/rider/dashboard?demo=true" className="block">
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 hover:border-amber-300 transition shadow-sm flex items-center justify-between text-xs group">
            <div className="flex items-center gap-2.5 font-bold text-amber-900">
              <div className="h-7 w-7 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <Award className="h-4 w-4 text-amber-700" />
              </div>
              <div className="space-y-0.5 text-left">
                <div>Login Guest Reviewer (Juri Lomba)</div>
                <div className="text-[10px] text-amber-700 font-normal">Akses otomatis data contoh terisolasi</div>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-amber-700 group-hover:translate-x-1 transition shrink-0" />
          </div>
        </Link>

        {/* Separator */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-3 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
            atau pilih peran akun
          </span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => handleRoleSelect('rider')}
            className={`py-2 px-1 rounded-xl font-bold flex items-center justify-center gap-1 transition ${
              role === 'rider'
                ? 'bg-white text-teal-800 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="h-3.5 w-3.5 text-teal-600" /> Kurir
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect('city')}
            className={`py-2 px-1 rounded-xl font-bold flex items-center justify-center gap-1 transition ${
              role === 'city'
                ? 'bg-white text-teal-800 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="h-3.5 w-3.5 text-teal-600" /> Admin Kota
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect('dishub')}
            className={`py-2 px-1 rounded-xl font-bold flex items-center justify-center gap-1 transition ${
              role === 'dishub'
                ? 'bg-white text-teal-800 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="h-3.5 w-3.5 text-teal-600" /> Dishub
          </button>
        </div>

        {/* Input Form */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
              <Mail className="h-3.5 w-3.5 text-slate-400" /> Email Akun
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@urbanload.ai"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-slate-400" /> Kata Sandi
              </label>
              <Link href="/forgot-password" className="text-[11px] text-teal-600 font-medium hover:underline">
                Lupa Sandi?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
        </div>

        {/* Submit CTA */}
        <Link href={getDashboardLink()} className="block pt-1">
          <Button className="w-full py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-md">
            Masuk ke Dashboard {role === 'city' ? 'Admin Kota' : role === 'dishub' ? 'Petugas Dishub' : 'Kurir'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>

        {/* Footer Link */}
        <div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
          Belum memiliki akun?{' '}
          <Link href="/register" className="text-teal-600 font-bold hover:underline">
            Daftar Akun Baru
          </Link>
        </div>
      </Card>
    </div>
  );
}
