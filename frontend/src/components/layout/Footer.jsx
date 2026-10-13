import React from 'react';
import { Truck, ShieldCheck, Database, Cpu, Globe } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-8 px-4 sm:px-8 text-xs text-slate-600 font-medium">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Brand & One-Liner */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
            <Truck className="h-4 w-4" />
          </div>
          <div>
            <span className="font-black text-slate-900 text-sm tracking-tight block">
              UrbanLoad<span className="text-teal-600">.AI</span>
            </span>
            <span className="text-[11px] text-slate-500 font-medium block">
              Spillover-Aware Urban Freight Control Platform
            </span>
          </div>
        </div>

        {/* Tech Badges */}
        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 font-semibold flex-wrap justify-center">
          <span className="flex items-center gap-1 text-slate-700">
            <Database className="h-3.5 w-3.5 text-teal-600" /> PostGIS WGS84
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-slate-700">
            <Cpu className="h-3.5 w-3.5 text-teal-600" /> Groq Qwen 32B
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-slate-700">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Ed25519 QuickPass
          </span>
        </div>

        {/* Copyright */}
        <div className="text-[11px] text-slate-400 font-medium text-center md:text-right">
          © 2026 UrbanLoad.AI — Hak Cipta Dilindungi Undang-Undang.
        </div>
      </div>
    </footer>
  );
}
