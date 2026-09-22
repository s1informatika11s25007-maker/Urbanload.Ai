import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X, ShieldCheck, Zap } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(({ title, message, type = 'success', duration = 4500 }) => {
    const id = Date.now() + Math.random().toString();
    const newToast = { id, title, message, type };

    setToasts((prev) => [newToast, ...prev.slice(0, 4)]); // max 5 active toasts

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Floating Toast Notification Cards Overlay - Top Right */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-2 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-top-4 fade-in ${
              toast.type === 'success'
                ? 'bg-slate-900/95 border-emerald-500/50 text-white'
                : toast.type === 'warning'
                ? 'bg-slate-900/95 border-amber-500/50 text-white'
                : toast.type === 'error'
                ? 'bg-slate-900/95 border-rose-500/50 text-white'
                : 'bg-slate-900/95 border-teal-500/50 text-white'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  toast.type === 'success'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : toast.type === 'warning'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : toast.type === 'error'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                }`}>
                  {toast.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
                  {toast.type === 'warning' && <AlertTriangle className="h-4 w-4" />}
                  {toast.type === 'error' && <AlertCircle className="h-4 w-4" />}
                  {toast.type === 'info' && <Zap className="h-4 w-4" />}
                </div>

                <div className="space-y-0.5">
                  <h4 className="text-xs font-black tracking-wide text-white flex items-center gap-1.5">
                    {toast.title}
                  </h4>
                  {toast.message && (
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {toast.message}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white p-1 transition shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback if component is outside provider
    return {
      showToast: ({ title, message }) => console.log(`Toast: ${title} - ${message}`),
    };
  }
  return context;
}
