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
                  'relative flex h-full items-center font-mono text-xs font-medium tracking-wide whitespace-nowrap uppercase focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:outline-hidden focus-visible:ring-inset',
                  'after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-right after:bg-primary after:transition-transform after:duration-300 after:ease-out motion-reduce:after:transition-none',
                  active
                    ? 'text-zinc-950 after:scale-x-100 dark:text-white'
                    : 'text-zinc-600 after:scale-x-0 hover:text-zinc-950 hover:after:origin-left hover:after:scale-x-100 dark:text-zinc-400 dark:hover:text-white',
                )}
              >
                {tab.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
