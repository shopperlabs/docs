'use client';

import { AnchorProvider, TOCItem, type TOCItemType } from 'fumadocs-core/toc';
import { ArrowUp } from 'lucide-react';
import clsx from 'clsx';

export function TableOfContents({ toc }: { toc: TOCItemType[] }) {
  // H4 and deeper nest too far for a 224px rail.
  const items = toc.filter((item) => item.depth <= 3);

  if (items.length === 0) {
    return <div className="hidden w-toc shrink-0 min-[1120px]:block" aria-hidden />;
  }

  const minDepth = Math.min(...items.map((item) => item.depth));

  return (
    <div className="hidden w-toc shrink-0 min-[1120px]:block" role="navigation" aria-label="Table of contents">
      <div
        className="no-scrollbar overflow-y-auto py-8 pl-2"
        style={{
          position: 'sticky',
          top: 'var(--nav-offset, 72px)',
          maxHeight: 'calc(100dvh - var(--nav-offset, 72px))',
        }}
      >
        <p className="mb-3 font-mono text-xs/5 tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
          On this page
        </p>
        <AnchorProvider toc={items}>
          <ul className="flex flex-col border-l border-border text-sm">
            {items.map((item) => (
              <li key={item.url}>
                <TOCItem
                  href={item.url}
                  className={clsx(
                    '-ml-px block border-l-2 border-transparent py-1 leading-snug text-muted-foreground',
                    'transition-colors duration-200',
                    'hover:text-foreground',
                    'focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:outline-hidden',
                    'data-[active=true]:border-brand data-[active=true]:font-medium',
                    'data-[active=true]:text-brand-700 dark:data-[active=true]:text-brand-300',
                  )}
                  style={{ paddingLeft: `${(item.depth - minDepth) * 0.75 + 0.75}rem` }}
                >
                  {item.title}
                </TOCItem>
              </li>
            ))}
          </ul>
        </AnchorProvider>
        <button
          type="button"
          onClick={() => {
            // The reduced-motion CSS override does not reach scrolling started from JavaScript.
            const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            window.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' });
          }}
          className={clsx(
            'mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground',
            'transition-colors duration-200 hover:text-foreground',
            'focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:outline-hidden',
          )}
        >
          <ArrowUp className="size-3.5" aria-hidden />
          Back to top
        </button>
      </div>
    </div>
  );
}
