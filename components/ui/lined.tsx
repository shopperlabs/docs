import clsx from 'clsx';
import type { ReactNode } from 'react';

export const hatch =
  'bg-[repeating-linear-gradient(135deg,transparent,transparent_4px,var(--hatch)_4px,var(--hatch)_5px)]';

export const linings = {
  zinc: 'border-zinc-200 [--hatch:var(--color-zinc-200)] dark:border-white/10 dark:[--hatch:rgb(255_255_255/0.08)]',
  brand:
    'border-brand-200 [--hatch:var(--color-brand-200)] dark:border-brand-400/25 dark:[--hatch:color-mix(in_oklab,var(--color-brand-400)_25%,transparent)]',
  emerald:
    'border-emerald-200 [--hatch:var(--color-emerald-200)] dark:border-emerald-400/25 dark:[--hatch:color-mix(in_oklab,var(--color-emerald-400)_25%,transparent)]',
  amber:
    'border-amber-200 [--hatch:var(--color-amber-200)] dark:border-amber-400/25 dark:[--hatch:color-mix(in_oklab,var(--color-amber-400)_25%,transparent)]',
  red: 'border-red-200 [--hatch:var(--color-red-200)] dark:border-red-400/25 dark:[--hatch:color-mix(in_oklab,var(--color-red-400)_25%,transparent)]',
};

/** The marketing site's card lining: a hatched double of the frame, offset down-left under it. */
export function Lined({
  children,
  className,
  tone = 'zinc',
}: {
  children: ReactNode;
  className?: string;
  tone?: keyof typeof linings;
}) {
  return (
    <div className={clsx('relative', className)}>
      <div aria-hidden className={clsx('absolute inset-0 -translate-x-2 translate-y-2 border', hatch, linings[tone])} />
      <div className="relative h-full bg-background">{children}</div>
    </div>
  );
}
