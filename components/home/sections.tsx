import clsx from 'clsx';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import type { ComponentType, ReactNode } from 'react';
import { hatch, Lined, linings } from '@/components/ui/lined';

/** Square cells with hairline gaps, the marketing site's grid. */
export const frame = 'grid gap-px border border-zinc-950/10 bg-zinc-950/10 dark:border-white/10 dark:bg-white/10';

/**
 * The marketing site's hatch, for the cell a grid leaves empty. 7 tabs and 5
 * domains leave exactly one at 2, 3 and 4 columns; another count needs another span.
 */
export const filler = clsx('hidden bg-background sm:block', hatch, linings.zinc);

const sweep =
  'relative isolate inline-flex items-center gap-x-2 border px-3.5 py-2 font-mono text-sm/6 font-medium tracking-wide uppercase after:absolute after:inset-0 after:-z-10 after:origin-right after:scale-x-0 after:transition-transform after:duration-300 after:ease-out hover:after:origin-left hover:after:scale-x-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:after:transition-none sm:px-4 sm:py-1.5 sm:text-[0.8125rem]/6';

export const buttons = {
  solid: clsx(
    sweep,
    'border-brand-700/90 bg-brand-600 text-white after:bg-white/10',
  ),
  outline: clsx(
    sweep,
    'border-zinc-950/10 text-zinc-950 after:bg-zinc-950/4 hover:border-zinc-950/20 dark:border-white/15 dark:text-white dark:after:bg-white/5 dark:hover:border-white/25',
  ),
};

export function Section({
  id,
  title,
  lead,
  children,
}: {
  id: string;
  title: string;
  lead?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="mt-20 sm:mt-24">
      <h2
        id={id}
        className="font-display text-2xl font-medium tracking-tight text-balance text-zinc-950 sm:text-3xl dark:text-white"
      >
        {title}
      </h2>
      {lead ? (
        <p className="mt-3 max-w-[64ch] text-base/7 text-pretty text-zinc-600 dark:text-zinc-400">{lead}</p>
      ) : null}
      <div className="mt-8">{children}</div>
    </section>
  );
}

/** Plain anchors for external links and route handlers, which the router must not prefetch. */
export function AnyLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  if (href.startsWith('http')) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" className={className}>
        {children}
      </a>
    );
  }
  if (href.startsWith('#') || /\.(txt|md)$/.test(href)) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export function ArrowLink({ href, children }: { href: string; children: ReactNode }) {
  const external = href.startsWith('http');
  const Arrow = external ? ArrowUpRight : ArrowRight;

  return (
    <AnyLink
      href={href}
      className="group inline-flex items-center gap-1.5 font-medium text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:outline-hidden"
    >
      {children}
      <Arrow
        aria-hidden
        className={clsx(
          'size-4 shrink-0 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none',
          external && 'group-hover:-translate-y-0.5',
        )}
      />
    </AnyLink>
  );
}

export interface Tile {
  title: string;
  description: string;
  href: string;
  Icon: ComponentType<{ className?: string }>;
}

/** A grid of cells that are each one link. */
export function TileGrid({ tiles, className }: { tiles: Tile[]; className?: string }) {
  return (
    <Lined>
      <ul role="list" className={clsx(frame, className)}>
        {tiles.map(({ title, description, href, Icon }) => (
          <li key={title} className="flex">
            <AnyLink
              href={href}
              className="group relative flex w-full flex-col bg-background p-6 transition-colors duration-200 hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:outline-hidden focus-visible:ring-inset dark:hover:bg-white/3"
            >
              <ArrowUpRight
                aria-hidden
                className="absolute top-6 right-6 size-4 text-primary opacity-0 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 motion-reduce:transition-none"
              />
              <Icon className="size-5 text-zinc-500 group-hover:text-primary dark:text-zinc-400" />
              <span className="mt-4 text-base/6 font-semibold text-zinc-950 dark:text-white">{title}</span>
              <span className="mt-1 text-sm/6 text-pretty text-zinc-600 dark:text-zinc-400">{description}</span>
            </AnyLink>
          </li>
        ))}
      </ul>
    </Lined>
  );
}
