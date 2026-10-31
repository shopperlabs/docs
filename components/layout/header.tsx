'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { Check, Menu as MenuIcon, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { GithubIcon } from '@/components/ui/brand-icons';
import { TouchTarget } from '@/components/ui/touch-target';
import { links, shopperRepo } from '@/lib/shared';
import { Logo } from './logo';
import { SearchBar, SearchDialog, SearchIconButton } from './search';
import { SubNav } from './sub-nav';
import { ThemeMenu } from './theme-menu';
import { scopeFor, versionHref, versions, type TreeNode } from './tree';

/**
 * The header and, from md on versions split into sections, the sections bar
 * under it: one sticky band, 64px or 112px high (`--spacing-subheader`).
 */
export function Header({
  tree,
  stars,
  onMenuClick,
  drawerOpen,
}: {
  tree: TreeNode[];
  stars?: number;
  onMenuClick: () => void;
  drawerOpen: boolean;
}) {
  const pathname = usePathname();
  const scope = scopeFor(tree, pathname);
  const sectioned = scope.tabs.length > 1;
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-500/5 bg-background/90 backdrop-blur-md dark:border-white/6">
      <div className="px-4 lg:px-12">
        {/* Three equal columns put the search bar on the page centre. */}
        <div
          className={clsx(
            'flex h-header items-center gap-x-4',
            sectioned && 'md:border-b md:border-zinc-500/5 md:dark:border-white/6',
          )}
        >
          <div className="flex min-w-0 flex-1 items-center gap-x-2 lg:gap-x-4">
            <button
              type="button"
              aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={drawerOpen}
              onClick={onMenuClick}
              className="relative inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:outline-hidden lg:hidden dark:hover:bg-white/6"
            >
              <TouchTarget />
              <MenuIcon className="size-4.5" />
            </button>

            <Logo />

            <Menu>
              <MenuButton className="group hidden h-8 items-center gap-2 rounded-xl px-2.5 py-1.5 text-sm font-medium whitespace-nowrap text-zinc-900 hover:bg-zinc-600/5 focus:outline-hidden data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-primary data-open:bg-zinc-600/5 lg:flex dark:text-zinc-300 dark:hover:bg-zinc-200/5 dark:data-open:bg-zinc-200/5">
                <span className="sr-only">Version </span>
                {scope.version.name}
                {/* Mintlify's chevron: wider and bolder than lucide's at 12px. */}
                <svg
                  viewBox="0 0 18 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="size-3 shrink-0 overflow-visible text-zinc-400 transition-transform group-hover:text-zinc-600 group-data-open:rotate-180 dark:text-zinc-600 dark:group-hover:text-zinc-400"
                >
                  <path d="M2.75 6.5 9 12.75l6.25-6.25" />
                </svg>
              </MenuButton>
              <MenuItems
                anchor={{ to: 'bottom start', gap: 3 }}
                transition
                className="z-50 max-h-[420px] min-w-(--button-width) origin-top-left overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-1 shadow-xl shadow-zinc-500/5 transition duration-100 ease-out focus:outline-hidden data-closed:scale-95 data-closed:opacity-0 dark:border-white/[0.07] dark:bg-zinc-950 dark:shadow-none"
              >
                {versions(tree).map((version) => {
                  const current = version === scope.version;
                  return (
                    <MenuItem key={version.$id}>
                      <Link
                        href={versionHref(version, scope.version, pathname)}
                        aria-current={current ? 'true' : undefined}
                        className="flex items-center gap-2 rounded-xl py-2 pr-4 pl-2.5 text-sm/5 font-medium data-focus:bg-zinc-600/5 dark:data-focus:bg-zinc-200/5"
                      >
                        <span
                          className={clsx('flex-1', current ? 'text-primary' : 'text-zinc-800 dark:text-zinc-300')}
                        >
                          {version.name}
                        </span>
                        {current ? <Check className="size-4 shrink-0 text-primary" aria-hidden /> : null}
                      </Link>
                    </MenuItem>
                  );
                })}
              </MenuItems>
            </Menu>
          </div>

          <div className="hidden flex-1 items-center justify-center lg:flex">
            <SearchBar onClick={() => setSearchOpen(true)} />
          </div>

          <div className="flex flex-1 items-center justify-end gap-x-2 lg:gap-x-4">
            <SearchIconButton onClick={() => setSearchOpen(true)} />
            <a
              href={links.github}
              target="_blank"
              rel="noreferrer"
              className="hidden min-w-0 items-center gap-1.5 text-sm font-medium whitespace-nowrap text-zinc-600 hover:text-zinc-900 focus-visible:rounded focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:outline-hidden lg:flex dark:text-zinc-400 dark:hover:text-zinc-300"
            >
              <GithubIcon className="size-4 shrink-0" />
              <span className="truncate">
                {shopperRepo.owner}/{shopperRepo.repo}
              </span>
              {stars !== undefined ? (
                <span className="ml-1 flex shrink-0 items-center gap-1.5">
                  <Star className="size-3.5" aria-label="Stars" />
                  {stars.toLocaleString('en-US')}
                </span>
              ) : null}
            </a>
            <ThemeMenu />
          </div>
        </div>
      </div>
      {sectioned ? <SubNav scope={scope} /> : null}
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
