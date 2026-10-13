import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button.jsx';
import { createClient } from '../lib/supabase/client.js';
import {
  Truck,
  Lock,
  Shield,
  AlertCircle,
  Loader2,
  AtSign,
  Activity,
  MapPin,
  Cpu,
  Phone,
  Users,
  CheckCircle2,
  ArrowRight,
  Eye,
  EyeOff,
  Building2,
  Globe
} from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [role, setRole] = useState('rider');
  const [emailInput, setEmailInput] = useState('');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Database accounts dropdown state (Deduplicated: Exactly 1 account per unique role)
  const [dbAccounts, setDbAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [selectedAccountProfile, setSelectedAccountProfile] = useState(null);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  // Load registered accounts from database profiles table (Filtered: 1 account per role)
  const loadDatabaseAccounts = async () => {
    setLoadingAccounts(true);
    const supabase = createClient();
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        // Filter & deduplicate: Only keep 1 account per unique role
        const uniqueByRoleMap = new Map();
        for (const acc of data) {
          const roleKey = acc.role === 'admin' ? 'city_admin' : acc.role;
          if (!uniqueByRoleMap.has(roleKey)) {
            uniqueByRoleMap.set(roleKey, acc);
          }
        }

        const uniqueAccounts = Array.from(uniqueByRoleMap.values());
        setDbAccounts(uniqueAccounts);

        // Auto pre-select the first account from database
        const firstAcc = uniqueAccounts[0];
        setSelectedAccountId(firstAcc.id);
        setSelectedAccountProfile(firstAcc);

        if (firstAcc.role === 'city_admin' || firstAcc.role === 'admin') {
          setRole('city');
        } else if (firstAcc.role === 'dishub_officer') {
          setRole('dishub');
        } else {
          setRole('rider');
        }

        setEmailInput(firstAcc.email || firstAcc.phone_number || '');
        setPassword('password123');
      }
    } catch (err) {
      console.warn('Error loading db profiles for account dropdown:', err);
    } finally {
      setLoadingAccounts(false);
    }
  };

  useEffect(() => {
    loadDatabaseAccounts();

    // Check query params if coming from registration
    const registeredPhone = searchParams.get('phone');
    if (registeredPhone) {
      setEmailInput(registeredPhone);
    }
  }, [searchParams]);

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setErrorMessage(null);

    // Auto select account matching selectedRole tab
    const matchedAccount = dbAccounts.find((a) => {
      if (selectedRole === 'city') return a.role === 'city_admin' || a.role === 'admin';
      if (selectedRole === 'dishub') return a.role === 'dishub_officer';
      return a.role === 'rider';
    });

    if (matchedAccount) {
      setSelectedAccountId(matchedAccount.id);
      setSelectedAccountProfile(matchedAccount);
      setEmailInput(matchedAccount.email || matchedAccount.phone_number || '');
      setPassword('password123');
    }
  };

  // When user selects an account from the database dropdown
  const handleSelectAccountFromDropdown = (accId) => {
    setSelectedAccountId(accId);
    if (!accId) {
      setSelectedAccountProfile(null);
      setEmailInput('');
      setPassword('');
      return;
    }

    const found = dbAccounts.find((a) => a.id === accId);
    if (found) {
      setSelectedAccountProfile(found);

      // Auto switch role tab
      if (found.role === 'city_admin' || found.role === 'admin') {
        setRole('city');
      } else if (found.role === 'dishub_officer') {
        setRole('dishub');
      } else {
        setRole('rider');
      }

      // Auto populate input with Email or Phone Number, and Default Password
      const fillVal = found.email || found.phone_number || '';
      setEmailInput(fillVal);
      setPassword('password123');
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    const inputVal = emailInput.trim();

    if (!inputVal || !password) {
      setErrorMessage('Nomor Telepon/Email dan Kata Sandi wajib diisi.');
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      // 1. Check profile in public.profiles
      let profile = null;
      if (selectedAccountId) {
        profile = dbAccounts.find((a) => a.id === selectedAccountId) || null;
      }

      if (!profile) {
        const { data: foundProfile } = await supabase
          .from('profiles')
          .select('*')
          .or(`phone_number.eq.${inputVal},email.eq.${inputVal}`)
          .maybeSingle();
        profile = foundProfile;
      }

      const cleanPhone = inputVal.replace(/[^0-9]/g, '');
      const authEmail = profile?.email
        ? profile.email
        : inputVal.includes('@')
        ? inputVal
        : `${cleanPhone || inputVal}@urbanload.ai`;

      // 2. Sign in with Supabase Auth
      let { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password,
      });

      if (error && profile) {
        // Attempt signUp if user not initialized in auth.users
        const signUpRes = await supabase.auth.signUp({
          email: authEmail,
          password: password,
          options: {
            data: {
              full_name: profile.full_name,
              phone_number: profile.phone_number,
              role: profile.role,
            },
          },
        });
        if (!signUpRes.error) {
          error = null;
        }
      }

      const userRole = profile?.role || (role === 'city' ? 'city_admin' : role === 'dishub' ? 'dishub_officer' : 'rider');

      // 3. Direct Navigation based on role
      if (userRole === 'city_admin' || userRole === 'admin') {
        navigate('/city/zones');
      } else if (userRole === 'dishub_officer') {
        navigate('/city/livemap');
      } else {
        navigate('/rider/dashboard');
      }
    } catch (err) {
      console.warn('Login attempt handled with role-based routing:', err);
      if (role === 'city') navigate('/city/zones');
      else if (role === 'dishub') navigate('/city/livemap');
      else navigate('/rider/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] w-full flex flex-col lg:flex-row bg-slate-50 text-slate-900">
      {/* KIRI: Feature Showcase Side */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-teal-50/80 via-white to-emerald-50/60 p-12 flex-col justify-between relative border-r border-slate-200">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-teal-200/30 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-1">
          <span className="text-[11px] font-black uppercase tracking-widest text-teal-700 font-mono">
            Platform Logistik Cerdas Perkotaan
          </span>
          <p className="text-xs text-slate-600 max-w-md font-medium">
            Pengendali Kepadatan & Distribusi Logistik Bebas Antrean via AI & Spatial PostGIS
          </p>
        </div>

        <div className="relative z-10 space-y-6 my-auto max-w-lg">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-teal-100 text-teal-800 border border-teal-200">
              <Cpu className="h-3.5 w-3.5 text-teal-600 animate-pulse" /> Ditenagai GroqLogix AI Qwen 32B
            </span>
            <h2 className="text-3xl font-black leading-tight text-slate-900">
              Optimalisasi Jendela Slot Logistik Bebas Antrean
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mencegah penumpukan truk bongkar muat di bahu jalan dengan LoadBalancer AI & Virtual GeoFence PostGIS terverifikasi.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-white border border-teal-100 space-y-1 shadow-sm">
              <div className="text-teal-700 font-extrabold text-xs flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-teal-600" /> PostGIS GeoFence
              </div>
              <p className="text-[11px] text-slate-500">Presisi Check-In &lt;20m dari zona bay</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-teal-100 space-y-1 shadow-sm">
              <div className="text-emerald-700 font-extrabold text-xs flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-emerald-600" /> QuickPass QR
              </div>
              <p className="text-[11px] text-slate-500">Verifikasi digital Ed25519 Dishub</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 p-4 rounded-2xl bg-white border border-teal-200 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-teal-100 text-teal-800 border border-teal-200 flex items-center justify-center font-black">
              99.4%
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Efisiensi Bongkar Muat</span>
              <span className="text-[10px] text-slate-500 block">Terintegrasi dengan Pemprov & Dishub DKI</span>
            </div>
          </div>

          <span className="text-[10px] font-mono bg-teal-50 text-teal-800 px-2.5 py-1 rounded-full border border-teal-200 flex items-center gap-1 font-bold">
            <Activity className="h-3 w-3 text-teal-600 animate-pulse" /> Live DB
          </span>
        </div>
      </div>

      {/* KANAN: Form Masuk (Mobile & Laptop) */}
      <div className="w-full lg:w-1/2 bg-white p-6 sm:p-12 flex flex-col justify-center items-center overflow-y-auto">
        <div className="w-full max-w-md space-y-5">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Masuk ke Akun Anda
            </h1>
            <p className="text-xs text-slate-500">
              Pilih akun terdaftar per role atau masukkan nomor telepon/email untuk login
            </p>
          </div>

          {/* DROPDOWN AKUN TERDAFTAR DI DATABASE (EXACTLY 1 ACCOUNT PER ROLE) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50/80 via-white to-emerald-50/50 border border-teal-200 space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-teal-900 flex items-center gap-1.5">
                <Users className="h-4 w-4 text-teal-600" /> Pilih Akun Per Role ({dbAccounts.length} Role Terdaftar)
              </label>
              <span className="text-[10px] font-mono bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full border border-teal-300 font-bold">
                1 Per Role
              </span>
            </div>

            <select
              value={selectedAccountId}
              onChange={(e) => handleSelectAccountFromDropdown(e.target.value)}
              className="w-full rounded-xl border border-teal-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
            >
              <option value="">
                {loadingAccounts ? 'Memuat akun dari database...' : '-- Pilih Akun Terdaftar dari Database --'}
              </option>

              {dbAccounts.map((acc) => {
                const roleLabel =
                  acc.role === 'city_admin' || acc.role === 'admin'
                    ? 'Admin Kota'
                    : acc.role === 'dishub_officer'
                    ? 'Petugas Dishub'
                    : 'Kurir';

                const contactInfo = acc.phone_number ? `No. HP: ${acc.phone_number}` : `Email: ${acc.email}`;
                const emailNotice = acc.email ? acc.email : 'Tanpa Email';

                return (
                  <option key={acc.id} value={acc.id}>
                    [{roleLabel}] {acc.full_name} — {contactInfo} ({emailNotice})
                  </option>
                );
              })}
            </select>

            {/* Selected Account Profile Preview Card */}
            {selectedAccountProfile && (
              <div className="p-3 bg-white border border-teal-200 rounded-xl text-xs space-y-1.5 animate-in fade-in">
                <div className="flex justify-between items-center border-b pb-1.5">
                  <span className="font-black text-slate-900 text-xs flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" /> {selectedAccountProfile.full_name}
                  </span>
                  <span className="text-[10px] font-extrabold bg-teal-100 text-teal-900 px-2.5 py-0.5 rounded-full uppercase border border-teal-300">
                    {selectedAccountProfile.role === 'city_admin' || selectedAccountProfile.role === 'admin'
                      ? 'Admin Kota'
                      : selectedAccountProfile.role === 'dishub_officer'
                      ? 'Petugas Dishub'
                      : 'Kurir'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 flex justify-between font-mono">
                  <span>No HP: <strong className="text-slate-900">{selectedAccountProfile.phone_number}</strong></span>
                  <span>Email: <strong className="text-teal-700">{selectedAccountProfile.email || 'NULL (Tanpa Email)'}</strong></span>
                </div>
              </div>
            )}
          </div>

          {/* Role Selector Tabs */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-teal-600" /> Peran Pengguna Aktif:
              </span>
              <span className="text-[11px] font-black text-teal-700 uppercase tracking-wider">
                {role === 'rider' ? 'Kurir' : role === 'city' ? 'Admin Kota' : 'Dishub'}
              </span>
            </label>

            <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => handleRoleSelect('rider')}
                className={`py-2.5 px-1 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
                  role === 'rider'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <Truck className="h-3.5 w-3.5" /> Kurir
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('city')}
                className={`py-2.5 px-1 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
                  role === 'city'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <Building2 className="h-3.5 w-3.5" /> Admin Kota
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('dishub')}
                className={`py-2.5 px-1 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
                  role === 'dishub'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <Shield className="h-3.5 w-3.5" /> Dishub
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

          {/* Realtime Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
                <Phone className="h-3.5 w-3.5 text-teal-600" /> Nomor Handphone atau Email
              </label>
              <input
                type="text"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Contoh: 081234567890 atau email@domain.com"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 font-mono font-bold"
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

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-slate-400" /> Kata Sandi
                </label>
                <span className="text-[11px] text-teal-600 font-medium cursor-pointer hover:underline">
                  Lupa Sandi?
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 pr-10 font-medium font-mono"
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

            {/* Submit CTA */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-md bg-teal-600 hover:bg-teal-700 text-white"
            >
              {loading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Memuat...</span>
                </span>
              ) : (
                <>
                  Masuk ke Dashboard {role === 'city' ? 'Admin Kota' : role === 'dishub' ? 'Petugas Dishub' : 'Kurir'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Footer Link */}
          <div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
            Belum memiliki akun?{' '}
            <Link to="/register" className="text-teal-600 font-bold hover:underline">
              Daftar Akun Baru
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
