'use client';

import clsx from 'clsx';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react';
import { containsActive, firstUrl, samePath, type TreeFolder, type TreeItem, type TreeNode } from './tree';

function itemClassName(active: boolean) {
  return clsx(
    'relative flex min-h-[32px] items-center justify-between gap-2 rounded-lg py-1 pr-3 text-base/6 transition select-none sm:text-sm/6',
    'focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:outline-hidden',
    active
      ? clsx(
          'bg-brand-600/6 font-medium text-brand-700 dark:bg-brand-400/10 dark:text-brand-300',
          "before:absolute before:inset-y-1 before:left-2 before:w-px before:bg-brand before:content-[''] dark:before:bg-brand-400",
        )
      : 'text-muted-foreground hover:text-foreground',
  );
}

function indentFor(depth: number) {
  return `${1.5 + depth * 0.75}rem`;
}

function NavLink({ item, depth, onNavigate }: { item: TreeItem; depth: number; onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = samePath(pathname, item.url);

  return (
    <Link
      href={item.url}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      data-nav-active={active ? 'true' : undefined}
      className={itemClassName(active)}
      style={{ paddingLeft: indentFor(depth) }}
    >
      <span className="min-w-0 flex-1 truncate">{item.name}</span>
    </Link>
  );
}

const NO_GROUPS: string[] = [];
const openGroups = new Map<string, string[]>();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Same reference until a write, as useSyncExternalStore requires. Storage can throw (private mode, blocked site data)
// or hold something other than a list, written by hand or by an older format.
function readOpenGroups(version: string): string[] {
  let groups = openGroups.get(version);
  if (!groups) {
    try {
      const stored: unknown = JSON.parse(sessionStorage.getItem(`shopper-docs-navigation:${version}`) ?? '[]');
      groups = Array.isArray(stored) ? stored : NO_GROUPS;
    } catch {
      groups = NO_GROUPS;
    }
    openGroups.set(version, groups);
  }
  return groups;
}

function writeOpenGroup(version: string, id: string, open: boolean) {
  const groups = readOpenGroups(version);
  if (groups.includes(id) === open) return;
  const next = open ? [...groups, id] : groups.filter((group) => group !== id);
  openGroups.set(version, next);
  try {
    sessionStorage.setItem(`shopper-docs-navigation:${version}`, JSON.stringify(next));
  } catch {}
  listeners.forEach((listener) => listener());
}

/**
 * Closed by default and open on the pages it holds. Opening it, by a click or
 * by visiting one of its pages, keeps it open for the rest of the tab's
 * session, per version, like the Filament docs; closing it keeps it closed.
 */
function useFold(id: string, holdsActive: boolean): [boolean, (open: boolean) => void] {
  const pathname = usePathname();
  const version = pathname.split('/')[1];
  const stored = useSyncExternalStore(subscribe, () => readOpenGroups(version), () => NO_GROUPS);
  const [toggled, setToggled] = useState<boolean | null>(null);
  const [seen, setSeen] = useState(pathname);
  if (seen !== pathname) {
    setSeen(pathname);
    setToggled(null);
  }

  useEffect(() => {
    if (holdsActive) writeOpenGroup(version, id, true);
  }, [version, id, holdsActive, pathname]);

  return [
    toggled ?? (holdsActive || stored.includes(id)),
    (open) => {
      setToggled(open);
      writeOpenGroup(version, id, open);
    },
  ];
}

/** Folded content stays in the HTML, hidden: every page keeps its links to the others, for readers and crawlers. */
function FoldContent({ id, open, children }: { id: string; open: boolean; children: ReactNode }) {
  return (
    <div id={id} className={open ? 'animate-fade-in' : 'hidden'}>
      {children}
    </div>
  );
}

function FolderGroup({ folder, depth, onNavigate }: { folder: TreeFolder; depth: number; onNavigate?: () => void }) {
  const pathname = usePathname();
  const contentId = useId();
  const [open, setOpen] = useFold(
    `folder:${folder.$id}`,
    containsActive(folder, pathname) || folder.defaultOpen === true,
  );

  const index = folder.index;
  const indexActive = index ? samePath(pathname, index.url) : false;
  const restChildren = index
    ? folder.children.filter((child) => child.type !== 'page' || child.url !== index.url)
    : folder.children;
  const triggerClassName = itemClassName(indexActive);
  const activeAttr = indexActive ? 'true' : undefined;

  if (index && restChildren.length === 0) {
    return (
      <Link
        href={index.url}
        onClick={onNavigate}
        aria-current={indexActive ? 'page' : undefined}
        data-nav-active={activeAttr}
        className={clsx(triggerClassName, 'w-full')}
        style={{ paddingLeft: indentFor(depth) }}
      >
        <span className="min-w-0 flex-1 truncate text-left">{folder.name}</span>
      </Link>
    );
  }

  return (
    <>
      {index ? (
        <div className="flex items-center">
          <Link
            href={index.url}
            onClick={onNavigate}
            aria-current={indexActive ? 'page' : undefined}
            data-nav-active={activeAttr}
            className={clsx(triggerClassName, 'flex-1')}
            style={{ paddingLeft: indentFor(depth) }}
          >
            <span className="min-w-0 flex-1 truncate text-left">{folder.name}</span>
          </Link>
          <button
            type="button"
            aria-expanded={open}
            aria-controls={contentId}
            aria-label={open ? 'Collapse section' : 'Expand section'}
            onClick={() => setOpen(!open)}
            className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:outline-hidden"
          >
            <ChevronRight
              className={clsx('size-3.5 transition-transform duration-200', open && 'rotate-90')}
              aria-hidden
            />
          </button>
        </div>
      ) : (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={contentId}
          onClick={() => setOpen(!open)}
          className={clsx(triggerClassName, 'w-full pr-0!')}
          style={{ paddingLeft: indentFor(depth) }}
        >
          <span className="min-w-0 flex-1 truncate text-left">{folder.name}</span>
          <span className="flex size-7 shrink-0 items-center justify-center">
            <ChevronRight
              className={clsx('size-3.5 text-muted-foreground transition-transform duration-200', open && 'rotate-90')}
              aria-hidden
            />
          </span>
        </button>
      )}
      <FoldContent id={contentId} open={open}>
        <ul className="list-none" role="list">
          <NodeItems nodes={restChildren} depth={depth + 1} onNavigate={onNavigate} />
        </ul>
      </FoldContent>
    </>
  );
}

function NodeItems({ nodes, depth, onNavigate }: { nodes: TreeNode[]; depth: number; onNavigate?: () => void }) {
  return nodes.map((node, i) => {
    if (node.type === 'folder') {
      return (
        <li key={node.$id ?? `folder-${i}`} role="none" className="relative">
          <FolderGroup folder={node} depth={depth} onNavigate={onNavigate} />
        </li>
      );
    }
    if (node.type === 'separator') {
      return (
        <li
          key={node.$id ?? `sep-${i}`}
          role="separator"
          aria-label={typeof node.name === 'string' ? node.name : undefined}
          className="mt-4 mb-1 font-mono text-xs/5 tracking-wide text-zinc-500 uppercase first:mt-1 dark:text-zinc-400"
          style={{ paddingLeft: indentFor(depth) }}
        >
          <span aria-hidden="true">{node.name}</span>
        </li>
      );
    }
    return (
      <li key={node.url} role="none" className="relative">
        <NavLink item={node} depth={depth} onNavigate={onNavigate} />
      </li>
    );
  });
}

type NavGroup = {
  key: string;
  title?: string;
  nodes: TreeNode[];
};

/**
 * Splits the tree into titled groups. Two title sources: the separators of
 * `meta.json`, and top-level folders, whose pages are lifted to the root
 * instead of living behind a chevron. Such a folder's index page becomes the
 * group's first entry, "Overview".
 */
function toGroups(nodes: TreeNode[]): NavGroup[] {
  const labelFor = (siblings: TreeNode[]) =>
    siblings.some(
      (n) => n.type === 'page' && typeof n.name === 'string' && n.name.trim().toLowerCase() === 'overview',
    )
      ? 'Introduction'
      : 'Overview';

  const groups: NavGroup[] = [];
  let current: NavGroup = { key: 'g0', nodes: [] };

  function flush() {
    if (current.nodes.length > 0) groups.push(current);
    current = { key: `g${groups.length + 1}`, title: undefined, nodes: [] };
  }

  for (const node of nodes) {
    if (node.type === 'separator') {
      flush();
      current.title = typeof node.name === 'string' ? node.name : undefined;
      continue;
    }
    if (node.type === 'folder') {
      flush();
      const index = node.index;
      const rest = index
        ? node.children.filter((child) => child.type !== 'page' || child.url !== index.url)
        : node.children;
      groups.push({
        key: `f${groups.length}`,
        title: typeof node.name === 'string' ? node.name : undefined,
        nodes: index ? [{ ...index, name: labelFor(rest) }, ...rest] : rest,
      });
      continue;
    }
    current.nodes.push(node);
  }
  flush();

  return groups;
}

function NavigationGroup({ group, onNavigate }: { group: NavGroup; onNavigate?: () => void }) {
  const pathname = usePathname();
  const contentId = useId();
  // Titles repeat across the tabs of a version (2.x Documentation and User Guide both have "Sales"); URLs do not.
  const [open, setOpen] = useFold(
    `group:${firstUrl(group.nodes[0])}`,
    group.title !== undefined && group.nodes.some((node) => containsActive(node, pathname)),
  );

  const list = (
    <div className={clsx('relative', group.title && 'mt-3')}>
      <div aria-hidden className="absolute inset-y-0 left-2 w-px bg-foreground/10 dark:bg-white/5" />
      <ul role="list" className="list-none">
        <NodeItems nodes={group.nodes} depth={0} onNavigate={onNavigate} />
      </ul>
    </div>
  );

  if (group.title) {
    return (
      <li className="relative mt-6 first:mt-0">
        <h2 className="text-sm/6 font-semibold sm:text-xs/5">
          <button
            type="button"
            aria-expanded={open}
            aria-controls={contentId}
            onClick={() => setOpen(!open)}
            className={clsx(
              '-mx-1 flex w-[calc(100%+0.5rem)] items-center justify-between gap-2 rounded-md px-1 text-left text-foreground transition-colors duration-200 hover:text-brand-700 dark:hover:text-brand-300',
              'focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:outline-hidden',
            )}
          >
            <span className="min-w-0 truncate">{group.title}</span>
            <ChevronRight
              className={clsx(
                'size-3.5 shrink-0 text-muted-foreground transition-transform duration-200',
                open && 'rotate-90',
              )}
              aria-hidden
            />
          </button>
        </h2>
        <FoldContent id={contentId} open={open}>
          {list}
        </FoldContent>
      </li>
    );
  }

  return <li className="relative mt-6 first:mt-0">{list}</li>;
}

export function SidebarNav({ nodes, onNavigate }: { nodes: TreeNode[]; onNavigate?: () => void }) {
  const groups = useMemo(() => toGroups(nodes), [nodes]);

  return (
    <nav aria-label="Documentation navigation">
      <ul className="list-none pb-10" role="list">
        {groups.map((group) => (
          <NavigationGroup key={group.key} group={group} onNavigate={onNavigate} />
        ))}
      </ul>
    </nav>
  );
}
