import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto py-8 space-y-6">
      <div className="h-8 w-64 bg-slate-200 rounded-xl animate-pulse"></div>
      <div className="h-96 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 animate-pulse">
        <div className="h-6 w-48 bg-slate-200 rounded"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-32 bg-slate-100 rounded-xl"></div>
          <div className="h-32 bg-slate-100 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}
