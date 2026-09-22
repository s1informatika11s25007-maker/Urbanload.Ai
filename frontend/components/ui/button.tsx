import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'danger';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-xs font-bold transition-all focus:outline-none focus:ring-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';
    const variants = {
      default: 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm shadow-teal-600/20 font-bold',
      secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200',
      outline: 'border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400',
      ghost: 'hover:bg-slate-100 text-slate-600 hover:text-slate-900',
      danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-600/20',
    };

    return (
      <button ref={ref} className={cn(base, variants[variant], className)} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
