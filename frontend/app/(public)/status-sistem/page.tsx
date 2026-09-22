import { Card } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export default function StatusSistemPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-slate-900">Status Sistem Real-Time</h1>
        <p className="text-xs text-slate-500">Infrastruktur Supabase + Vercel Serverless Status</p>
      </div>

      <Card className="p-6 space-y-3 text-xs">
        <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl border border-emerald-200">
          <span className="font-medium text-slate-800">Supabase PostgreSQL + PostGIS Engine</span>
          <span className="font-bold text-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Operational (99.9%)
          </span>
        </div>
        <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl border border-emerald-200">
          <span className="font-medium text-slate-800">Vercel Serverless Functions API v1</span>
          <span className="font-bold text-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Operational (42ms Latency)
          </span>
        </div>
        <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl border border-emerald-200">
          <span className="font-medium text-slate-800">Supabase Realtime WebSockets Channel</span>
          <span className="font-bold text-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Active Connected
          </span>
        </div>
      </Card>
    </div>
  );
}
