import * as React from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm text-slate-800 transition hover:shadow-md', className)} {...props}>
      {children}
    </div>
  );
}
