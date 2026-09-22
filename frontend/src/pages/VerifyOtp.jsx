import React, { useState, Suspense } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { MessageSquare, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

function VerifyOtpContent() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const phone = searchParams.get('phone');
  const email = searchParams.get('email');
  const role = searchParams.get('role') || 'rider';

  const [otp, setOtp] = useState('889912');
  const [verified, setVerified] = useState(false);

  const handleVerify = (e) => {
    e.preventDefault();
    if (otp.length < 6) return;
    setVerified(true);
    setTimeout(() => {
      if (role === 'city') navigate('/city/dashboard');
      else if (role === 'dishub') navigate('/dishub/dashboard');
      else navigate('/rider/dashboard');
    }, 1000);
  };

  return (
    <div className="w-full max-w-md mx-auto py-8 px-4">
      <Card className="p-8 space-y-6 border-slate-200 shadow-xl bg-white text-center rounded-3xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 border border-teal-100 text-teal-600 mx-auto">
          {phone ? <MessageSquare className="h-6 w-6" /> : <Mail className="h-6 w-6" />}
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl font-black text-slate-900">Verifikasi Kode OTP</h1>
          <p className="text-xs text-slate-500">
            {phone ? (
              <>Kode OTP 6-digit telah dikirim ke WhatsApp / SMS nomor <strong className="text-slate-900 font-mono">{phone}</strong></>
            ) : (
              <>Link verifikasi & kode OTP dikirim ke email institusi <strong className="text-slate-900">{email}</strong></>
            )}
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="889912"
              className="w-full text-center text-2xl font-mono tracking-[0.5em] border border-teal-300 bg-teal-50/20 rounded-2xl py-3 text-teal-900 font-black focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
            />
          </div>

          {verified ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-bold text-xs flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 animate-bounce" /> Verifikasi Berhasil! Mengalihkan ke Dashboard...
            </div>
          ) : (
            <Button type="submit" className="w-full py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-md">
              Verifikasi Kode OTP <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </form>

        <div className="text-xs text-slate-500 pt-2 border-t border-slate-100">
          Tidak menerima kode? <button className="text-teal-600 font-bold hover:underline">Kirim Ulang OTP</button>
        </div>
      </Card>
    </div>
  );
}

export default function VerifyOtp() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Memuat Halaman Verifikasi...</div>}>
      <VerifyOtpContent />
    </Suspense>
  );
}
