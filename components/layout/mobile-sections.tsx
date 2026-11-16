'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, ChevronDown, ChevronRight, ExternalLink, MessagesSquare, Store, Tag } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { DiscordIcon, XIcon } from '@/components/ui/brand-icons';
import { SoftCard } from '@/components/ui/soft-card';
import { links } from '@/lib/shared';
import { scopeFor, versionHref, versions, type TreeNode } from './tree';

const RESOURCES = [
  { label: 'Release notes', href: links.releases, icon: Tag },
  { label: 'Blog', href: links.blog, icon: BookOpen },
  { label: 'Demo store', href: links.demo, icon: Store },
  { label: 'Discussions', href: links.discussions, icon: MessagesSquare },
  { label: 'Discord', href: links.discord, icon: DiscordIcon },
  { label: 'X', href: links.x, icon: XIcon },
];

const ROW =
  'flex min-h-11 w-full items-center gap-2.5 rounded-lg px-2 text-base/6 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:outline-hidden';

const SUB =
  'flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-[15px]/[22px] transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:outline-hidden';

const DIVIDER = 'mx-2 my-1 h-px bg-zinc-100 dark:bg-white/6';

type MenuId = 'version' | 'resources';

/**
 * The entries of the section bar, for the small-screen drawer where the bar
 * is hidden. The menus unfold in place. The list stays folded behind the
 * section name: the drawer is opened mostly for its tree.
 */
export function MobileSections({ tree, onNavigate }: { tree: TreeNode[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  const scope = scopeFor(tree, pathname);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<MenuId | null>(null);

  const menuButton = (id: MenuId, label: string, current?: ReactNode) => (
    <button
      type="button"
      aria-expanded={menu === id}
      onClick={() => setMenu(menu === id ? null : id)}
      className={clsx(ROW, 'text-muted-foreground hover:text-foreground')}
    >
      <span className="min-w-0 flex-1 truncate text-left">{label}</span>
      {current ? <span className="shrink-0 text-sm">{current}</span> : null}
      <ChevronRight
        className={clsx('size-4 shrink-0 transition-transform duration-200', menu === id && 'rotate-90')}
        aria-hidden
      />
    </button>
  );

  return (
    <SoftCard
      className="mb-6 [--card-px:--spacing(3)] [&>header]:py-1.5"
      header={<p className="text-sm/5 font-medium text-zinc-950 dark:text-white">Section</p>}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={clsx(ROW, 'min-h-12 rounded-none px-3 font-medium text-foreground')}
      >
        <span className="min-w-0 flex-1 truncate text-left">{scope.tab.name}</span>
        <ChevronDown
          className={clsx('size-4 shrink-0 text-muted-foreground transition-transform duration-200', open && 'rotate-180')}
          aria-hidden
        />
      </button>

      {open ? (
        <div className="border-t border-zinc-100 p-1 dark:border-white/6">
          <ul role="list" className="list-none">
            {scope.tabs.map((tab) => {
              const active = !scope.home && tab === scope.tab;
              return (
                <li key={tab.href}>
                  <Link
                    href={tab.href}
                    onClick={onNavigate}
                    aria-current={active ? (pathname === tab.href ? 'page' : 'true') : undefined}
                    className={clsx(
                      ROW,
                      active
                        ? 'bg-zinc-50 font-medium text-foreground dark:bg-white/6'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate">{tab.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div aria-hidden className={DIVIDER} />

          <ul role="list" className="list-none">
            <li>
              {menuButton('version', 'Version', scope.version.name)}
              {menu === 'version' ? (
                <ul role="list" className="list-none pb-1 pl-4">
                  {versions(tree).map((version) => {
                    const current = version === scope.version;
                    return (
                      <li key={version.$id}>
                        <Link
                          href={versionHref(version, scope.version, pathname)}
                          onClick={onNavigate}
                          aria-current={current ? 'true' : undefined}
                          className={clsx(
                            SUB,
                            current ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground',
                          )}
                        >
                          <span className="min-w-0 flex-1 truncate">{version.name}</span>
                          {version.description ? (
                            <span className="shrink-0 text-sm font-normal text-muted-foreground">
                              {version.description}
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </li>
            <li>
              {menuButton('resources', 'Resources')}
              {menu === 'resources' ? (
                <ul role="list" className="list-none pb-1 pl-4">
                  {RESOURCES.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className={clsx(SUB, 'text-muted-foreground hover:text-foreground')}
                      >
                        <link.icon className="size-4 shrink-0" />
                        {link.label}
                        <ExternalLink className="size-3 shrink-0" aria-hidden />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          </ul>
        </div>
      ) : null}
    </SoftCard>
  );
}
