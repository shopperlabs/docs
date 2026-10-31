'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Scope } from './tree';

/**
 * The sections of the current version, in the bar under the header. Hidden
 * below `md`, where the drawer carries the same entries.
 */
export function SubNav({ scope }: { scope: Scope }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Documentation sections" className="hidden h-12 px-4 md:flex lg:px-12">
      {/* Scrolls without an edge fade if a version outgrows the bar: 2.x's five tabs fit from md. */}
      <ul role="list" className="no-scrollbar flex h-full list-none gap-x-6 overflow-x-auto text-sm">
        {scope.tabs.map((tab) => {
          const active = tab === scope.tab;
          return (
            <li key={tab.href} className="flex">
              <Link
                href={tab.href}
                aria-current={active ? (pathname === tab.href ? 'page' : 'true') : undefined}
                className={clsx(
                  'group relative flex h-full items-center font-medium whitespace-nowrap focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:outline-hidden focus-visible:ring-inset',
                  active
                    ? 'text-zinc-800 [text-shadow:-0.2px_0_0_currentColor,0.2px_0_0_currentColor] dark:text-zinc-200'
                    : 'text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-300',
                )}
              >
                {tab.name}
                <span
                  aria-hidden
                  className={clsx(
                    'absolute bottom-0 left-0 h-[1.5px] w-full',
                    active ? 'bg-primary' : 'group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700',
                  )}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
