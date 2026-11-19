'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useFetchSearch, useHighlightQuery } from 'fumadocs-core/search/client';
import { toJsx } from 'fumadocs-core/utils/hast-to-jsx';
import clsx from 'clsx';
import { Clock, FileText, Hash } from 'lucide-react';
import { useShortcutLabel } from '@/components/ui/kbd';
import { TouchTarget } from '@/components/ui/touch-target';
import {
  CommandPalette,
  CommandPaletteEmpty,
  CommandPaletteGroup,
  CommandPaletteHint,
  CommandPaletteItem,
  CommandPaletteLabel,
} from '@/components/ui/command-palette';
import type { TreeFolder } from './tree';

const RECENT_KEY = 'shopper-docs-recent-searches';
const MAX_RECENT = 5;

// localStorage throws in private mode or when storage is disabled.
function loadRecent(): string[] {
  try {
    const stored = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
    return Array.isArray(stored) ? stored.filter((q): q is string => typeof q === 'string') : [];
  } catch {
    return [];
  }
}

function saveRecent(query: string): string[] {
  const next = [query, ...loadRecent().filter((q) => q !== query)].slice(0, MAX_RECENT);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {}
  return next;
}

function clearRecent() {
  try {
    localStorage.removeItem(RECENT_KEY);
  } catch {}
}

const marks =
  '[&_::highlight(fd-search)]:bg-brand-100 [&_::highlight(fd-search)]:text-brand-800 group-data-focus:[&_::highlight(fd-search)]:bg-white/20 group-data-focus:[&_::highlight(fd-search)]:text-white [&_code]:font-mono';

function Line({ children }: { children?: ReactNode }) {
  return <span className="block truncate">{children}</span>;
}

function Children({ children }: { children?: ReactNode }) {
  return children;
}

function Cell({ children }: { children?: ReactNode }) {
  return <div className="min-w-0 not-last:truncate last:line-clamp-2">{children}</div>;
}

const text = { p: Line };
const cells = { table: Children, thead: Children, tbody: Children, tr: Children, th: Cell, td: Cell };
const rowCells = { ...cells, thead: () => null };

export function SearchGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className={className}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
      />
    </svg>
  );
}

export function SearchBar({ onClick }: { onClick: () => void }) {
  const shortcut = useShortcutLabel();

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-9 w-full cursor-text items-center gap-2 rounded-xl bg-white pr-3 pl-3.5 text-left text-sm/6 text-zinc-500 ring-1 ring-zinc-400/30 hover:ring-zinc-600/30 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary dark:bg-white/5 dark:text-white/50 dark:ring-zinc-600/30 dark:hover:ring-zinc-500/30"
    >
      <SearchGlyph className="size-4 shrink-0 text-zinc-700 group-hover:text-zinc-800 dark:text-zinc-400 dark:group-hover:text-zinc-200" />
      <span className="min-w-0 flex-1 truncate">Search...</span>
      <span className="shrink-0 text-xs font-medium">{shortcut}</span>
    </button>
  );
}

export function SearchIconButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open search"
      className="relative inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:outline-hidden lg:hidden dark:hover:bg-white/6"
    >
      <TouchTarget />
      <SearchGlyph className="size-4" />
    </button>
  );
}

export function SearchDialog({
  open,
  onOpenChange,
  version,
  versions,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  version: TreeFolder;
  versions: TreeFolder[];
}) {
  const router = useRouter();
  const [picked, setPicked] = useState<TreeFolder>();
  const scope = picked ?? version;
  const { search, onSearchChange, isLoading, data } = useFetchSearch({
    api: '/api/search',
    tag: scope.$id,
    delayMs: 250,
  });
  const [recent, setRecent] = useState<string[]>([]);
  const items = data?.items ?? [];
  const count = items.reduce((total, item) => total + (item.type === 'table' ? item.rows.length : 1), 0);
  const term = search.trim();
  const highlight = useHighlightQuery(term);

  useEffect(() => {
    if (open) setRecent(loadRecent());
    else {
      onSearchChange('');
      setPicked(undefined);
    }
  }, [open, onSearchChange]);

  function go(url: string) {
    if (term) setRecent(saveRecent(term));
    onOpenChange(false);
    router.push(url);
  }

  return (
    <CommandPalette
      size="2xl"
      open={open}
      onClose={() => onOpenChange(false)}
      label="Search documentation"
      placeholder="Search..."
      query={search}
      onQueryChange={onSearchChange}
      onEscape={() => {
        if (!search) return false;
        onSearchChange('');
        return true;
      }}
      panel={
        !term && recent.length > 0 ? (
          <div className="flex justify-end px-4 py-2">
            <button
              type="button"
              onClick={() => {
                clearRecent();
                setRecent([]);
              }}
              className="text-xs/5 font-medium text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
            >
              Clear all
            </button>
          </div>
        ) : undefined
      }
      footer={
        <div className="flex items-center gap-1 text-xs/5 text-zinc-500 dark:text-zinc-400">
          <span className="mr-1">Version</span>
          {versions.map((candidate) => (
            <button
              key={candidate.$id}
              type="button"
              aria-pressed={candidate.$id === scope.$id}
              // Keeps the focus in the input, so typing goes on after a switch.
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setPicked(candidate)}
              className="rounded-md px-1.5 font-medium hover:text-zinc-950 aria-pressed:bg-zinc-950/5 aria-pressed:text-zinc-950 dark:hover:text-white dark:aria-pressed:bg-white/10 dark:aria-pressed:text-white"
            >
              {candidate.name}
            </button>
          ))}
        </div>
      }
    >
      {!term && recent.length > 0 && (
        <CommandPaletteGroup heading="Recent">
          {recent.map((q) => (
            <CommandPaletteItem key={q} value={`recent:${q}`} filter={false} onSelect={() => onSearchChange(q)}>
              <Clock data-slot="icon" aria-hidden />
              <CommandPaletteLabel>{q}</CommandPaletteLabel>
            </CommandPaletteItem>
          ))}
        </CommandPaletteGroup>
      )}

      {!term && recent.length === 0 && (
        <CommandPaletteEmpty>Search pages and guides. Use arrow keys to navigate results.</CommandPaletteEmpty>
      )}

      {term && count > 0 && (
        <CommandPaletteGroup heading={`${count} result${count > 1 ? 's' : ''}`}>
          {items.map((item) => {
            if (item.type === 'table') {
              const headerId = `search-table-${item.id}`;

              return (
                <div
                  key={item.id}
                  role={item.header ? 'group' : undefined}
                  aria-labelledby={item.header ? headerId : undefined}
                  className="ml-7 grid gap-x-3"
                  style={{ gridTemplateColumns: `${'fit-content(30%) '.repeat(item.columns - 1)}minmax(30%, 1fr)` }}
                >
                  {item.header && (
                    <div
                      id={headerId}
                      ref={highlight}
                      aria-hidden
                      className={clsx(
                        marks,
                        'col-span-full grid grid-cols-subgrid rounded-md bg-zinc-50 px-2 py-1 text-xs/5 text-zinc-500 dark:bg-white/5 dark:text-zinc-400',
                      )}
                    >
                      {toJsx(item.header, { components: cells })}
                    </div>
                  )}
                  {item.rows.map((row) => (
                    <CommandPaletteItem
                      key={row.id}
                      value={row.id}
                      filter={false}
                      onSelect={() => go(row.url)}
                      className="col-span-full grid! grid-cols-subgrid items-baseline!"
                    >
                      <div ref={highlight} className={clsx(marks, 'contents')}>
                        {toJsx(row.hastContent, { components: item.header ? rowCells : cells })}
                      </div>
                    </CommandPaletteItem>
                  ))}
                </div>
              );
            }

            const Icon = item.type === 'page' ? FileText : Hash;

            return (
              <CommandPaletteItem key={item.id} value={item.id} filter={false} onSelect={() => go(item.url)}>
                <Icon data-slot="icon" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span ref={highlight} className={clsx(marks, item.type === 'page' && 'font-medium', 'block')}>
                    {toJsx(item.hastContent, { components: text })}
                  </span>
                  {item.breadcrumbs && item.breadcrumbs.length > 0 && (
                    <span className="block truncate text-xs text-zinc-500 group-data-focus:text-white/80 dark:text-zinc-400">
                      {item.breadcrumbs.join(' > ')}
                    </span>
                  )}
                </span>
                <CommandPaletteHint>Open</CommandPaletteHint>
              </CommandPaletteItem>
            );
          })}
        </CommandPaletteGroup>
      )}

      {term && !isLoading && count === 0 && (
        <CommandPaletteEmpty>No results for &quot;{term}&quot;</CommandPaletteEmpty>
      )}
    </CommandPalette>
  );
}
