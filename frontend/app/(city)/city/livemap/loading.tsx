import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto py-8 space-y-6">
      <div className="h-8 w-64 bg-slate-200 rounded-xl animate-pulse"></div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 h-[calc(100vh-140px)] rounded-2xl bg-slate-900 border border-slate-700 flex flex-col items-center justify-center text-teal-400 text-xs font-bold gap-3 animate-pulse">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
          <span>Memuat LiveMap Spatial...</span>
        </div>
        <div className="lg:col-span-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="h-20 bg-slate-200 rounded-2xl animate-pulse"></div>
            <div className="h-20 bg-slate-200 rounded-2xl animate-pulse"></div>
          </div>
          <div className="h-60 bg-slate-200 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
