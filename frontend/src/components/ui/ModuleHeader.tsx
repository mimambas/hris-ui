'use client';

import type { ReactNode } from 'react';

export default function ModuleHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-7">
      <div>
        {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary mb-2">{eyebrow}</p>}
        <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>
        <p className="mt-1.5 text-sm text-muted">{description}</p>
      </div>
      {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
    </div>
  );
}
