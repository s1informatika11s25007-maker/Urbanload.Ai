import React from 'react';
import { Card } from '../ui/card.jsx';
import { Button } from '../ui/button.jsx';
import { Cpu, ShieldCheck, CheckCircle2, ArrowRight, QrCode, AlertTriangle } from 'lucide-react';

export function BookingSummary({ bookingData, onConfirm, onCancel }) {
  if (!bookingData) return null;

  const { zoneName, vehicle, requestedTime, aiResult } = bookingData;

  return (
    <Card className="p-6 border-teal-200 bg-gradient-to-br from-teal-50/50 via-white to-emerald-50/30 shadow-lg rounded-2xl space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header AI Result */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-teal-200/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md">
            <Cpu className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">Rekomendasi Optimalisasi LoadBalancer AI</h3>
            <p className="text-[11px] text-teal-800 font-semibold">{aiResult?.source || 'GroqLogix Engine (Qwen 27B/32B)'}</p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-black bg-teal-100 text-teal-900 border border-teal-300">
          CongestionScore: {aiResult?.congestionScore || '8.8'} / 10 ({aiResult?.statusLabel || 'Macet Parah'})
        </span>
      </div>

      {/* LoadBalancer AI Shift Alert if Conflict Detected */}
      {aiResult?.isRebalanced && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
          <div className="font-extrabold flex items-center gap-1.5 text-amber-900">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>LoadBalancer AI: Penyeimbangan Beban Otomatis Aktif</span>
          </div>
          <p className="text-amber-800 leading-relaxed text-[11px]">
            Terdapat penumpukan truk di {zoneName} pada jam {requestedTime} WIB. Untuk mencegah kemacetan total bahu jalan, LoadBalancer AI menggeser jadwal kedatangan Anda secara adil ke jam <strong className="font-bold font-mono underline text-amber-950">{aiResult.recommendedSlotTime} WIB</strong>.
          </p>
        </div>
      )}

      {/* Detail Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200 text-xs">
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Zona Tujuan</span>
          <span className="font-black text-slate-900 text-sm">{zoneName}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Kendaraan / Plat Nomor</span>
          <span className="font-black font-mono text-teal-700 text-sm">{vehicle}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Jadwal Minta Awal</span>
          <span className="font-bold text-slate-500">{requestedTime} WIB</span>
        </div>
        <div>
          <span className="text-[10px] text-teal-700 font-bold uppercase block">Jadwal Sah Rekomendasi AI</span>
          <span className="font-black font-mono text-emerald-600 text-sm flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {aiResult?.recommendedSlotTime || requestedTime} WIB
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-1">
        <Button onClick={onCancel} variant="outline" className="w-full sm:w-auto text-xs py-2 px-4">
          Batal / Ubah
        </Button>
        <Button onClick={onConfirm} className="w-full sm:w-auto text-xs py-2.5 px-6 font-bold shadow-md bg-teal-600 hover:bg-teal-700 flex items-center justify-center gap-2">
          <QrCode className="h-4 w-4" /> Konfirmasi SmartSlot & Terbitkan QuickPass QR <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
