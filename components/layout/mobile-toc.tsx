'use client';

import { useId, useState } from 'react';
import { AnchorProvider, TOCItem, type TOCItemType } from 'fumadocs-core/toc';
import { ChevronDown, List } from 'lucide-react';
import clsx from 'clsx';

/** Shown under the page header below 1120px, where the side rail is hidden. */
export function MobileTOC({ toc }: { toc: TOCItemType[] }) {
  const [open, setOpen] = useState(false);
  const contentId = useId();

  const items = toc.filter((item) => item.depth <= 3);
  if (items.length === 0) return null;

  const minDepth = Math.min(...items.map((item) => item.depth));

  return (
    <div className="not-prose mb-6 rounded-xl border border-border min-[1120px]:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen(!open)}
        className={clsx(
          'flex w-full items-center justify-between px-4 py-3.5',
          'min-h-[44px] text-sm font-medium text-foreground',
          'transition-colors duration-200 hover:bg-muted/30',
          'focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:outline-hidden',
        )}
      >
        <span className="flex items-center gap-2">
          <List className="size-4 text-muted-foreground" aria-hidden />
          On this page
        </span>
        <ChevronDown
          className={clsx('size-4 text-muted-foreground transition-transform duration-200', open && 'rotate-180')}
          aria-hidden
        />
      </button>

      <nav
        id={contentId}
        hidden={!open}
        aria-label="Table of contents"
        className="animate-fade-in border-t border-border px-4 py-3"
      >
        <AnchorProvider toc={items}>
          <ul className="space-y-0.5">
            {items.map((item) => (
              <li key={item.url}>
                <TOCItem
                  href={item.url}
                  onClick={() => setOpen(false)}
                  className={clsx(
                    'block rounded-md py-2 text-sm text-muted-foreground transition-colors duration-200',
                    'hover:text-foreground',
                    'focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:outline-hidden',
                    'data-[active=true]:font-medium data-[active=true]:text-brand-700 dark:data-[active=true]:text-brand-300',
                  )}
                  style={{ paddingLeft: `${(item.depth - minDepth) * 0.75 + 0.75}rem` }}
                >
                  {item.title}
                </TOCItem>
              </li>
            ))}
          </ul>
        </AnchorProvider>
      </nav>
    </div>
  );
}
