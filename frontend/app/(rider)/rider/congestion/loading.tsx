import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto py-8 space-y-6">
      <div className="h-8 w-64 bg-slate-200 rounded-xl animate-pulse"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-40 bg-white border border-slate-200 rounded-2xl animate-pulse"></div>
        <div className="h-40 bg-white border border-slate-200 rounded-2xl animate-pulse"></div>
        <div className="h-40 bg-white border border-slate-200 rounded-2xl animate-pulse"></div>
      </div>
      <div className="h-64 bg-white border border-slate-200 rounded-2xl animate-pulse"></div>
    </div>
  );
}
