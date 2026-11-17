import type { ReactNode } from 'react';

/** Serializable mirror of fumadocs' page-tree node shapes, so the tree crosses the server/client boundary. */
export interface TreeItem {
  $id?: string;
  type: 'page';
  name: ReactNode;
  url: string;
  external?: boolean;
}
export interface TreeSeparator {
  $id?: string;
  type: 'separator';
  name?: ReactNode;
}
export interface TreeFolder {
  $id?: string;
  type: 'folder';
  name: ReactNode;
  index?: TreeItem;
  children: TreeNode[];
  /** `"version"` on a version folder, `true` on a section of a version (`meta.json`). */
  root?: boolean | string;
  defaultOpen?: boolean;
  collapsible?: boolean;
  description?: ReactNode;
}
export type TreeNode = TreeItem | TreeSeparator | TreeFolder;

/** First reachable page URL within a node. */
export function firstUrl(node: TreeNode): string | undefined {
  if (node.type === 'page') return node.url;
  if (node.type === 'folder') {
    if (node.index) return node.index.url;
    for (const child of node.children) {
      const url = firstUrl(child);
      if (url) return url;
    }
  }
  return undefined;
}

/** Depth-first list of page links under a node, used for prev/next nav. */
export function flattenPages(node: TreeNode | TreeNode[]): { url: string; name: ReactNode }[] {
  const nodes = Array.isArray(node) ? node : [node];
  const out: { url: string; name: ReactNode }[] = [];
  for (const n of nodes) {
    if (n.type === 'page') out.push({ url: n.url, name: n.name });
    else if (n.type === 'folder') {
      if (n.index) out.push({ url: n.index.url, name: n.index.name });
      out.push(...flattenPages(n.children));
    }
  }
  return out;
}

export function samePath(a: string | undefined, b: string | undefined): boolean {
  return a !== undefined && b !== undefined && a === b;
}

/** Whether a node or any descendant is the active page. */
export function containsActive(node: TreeNode, pathname: string): boolean {
  if (node.type === 'page') return samePath(node.url, pathname);
  if (node.type === 'folder') {
    if (samePath(node.index?.url, pathname)) return true;
    return node.children.some((child) => containsActive(child, pathname));
  }
  return false;
}

export function versions(tree: TreeNode[]): TreeFolder[] {
  return tree.filter((node): node is TreeFolder => node.type === 'folder' && node.root === 'version');
}

function versionPath(version: TreeFolder) {
  return `/${version.$id}`;
}

/** Versions with a landing page of their own, `app/(docs)/3.x/page.tsx`. */
const homes = new Set(['3.x']);

/**
 * Where a link to a version goes: its landing page, or its first page when it
 * has none. `/1.x` and `/2.x` are redirects (`redirects.json`), and the router
 * prefetches a link to a redirect in a loop.
 */
export function versionHome(version: TreeFolder): string {
  if (version.$id && homes.has(version.$id)) return versionPath(version);
  return firstUrl(version) ?? versionPath(version);
}

/** The version the pathname belongs to, the first one (the current release) outside any. */
export function versionFor(tree: TreeNode[], pathname: string): TreeFolder {
  const all = versions(tree);
  return (
    all.find((v) => pathname === versionPath(v) || pathname.startsWith(`${versionPath(v)}/`)) ?? all[0]
  );
}

export interface Tab {
  name: ReactNode;
  href: string;
  folder: TreeFolder;
}

/**
 * The sections shown in the bar under the header. A version split into root
 * folders (2.x, 3.x) gets one tab per folder; a flat version (1.x) gets a
 * single "Documentation" tab covering all of it.
 */
export function tabsFor(version: TreeFolder): Tab[] {
  const sections = version.children.filter(
    (node): node is TreeFolder => node.type === 'folder' && node.root === true,
  );
  if (sections.length === 0) {
    return [{ name: 'Documentation', href: versionHome(version), folder: version }];
  }
  return sections.map((folder) => ({
    name: folder.name,
    href: firstUrl(folder) ?? versionPath(version),
    folder,
  }));
}

export function activeTab(tabs: Tab[], pathname: string): Tab {
  return tabs.find((tab) => containsActive(tab.folder, pathname)) ?? tabs[0];
}

export interface Scope {
  version: TreeFolder;
  tabs: Tab[];
  tab: Tab;
  /** What the sidebar lists, and what previous/next walk through. */
  nodes: TreeNode[];
  /** On the version's landing page, which belongs to no tab. */
  home: boolean;
}

export function scopeFor(tree: TreeNode[], pathname: string): Scope {
  const version = versionFor(tree, pathname);
  const tabs = tabsFor(version);
  const tab = activeTab(tabs, pathname);
  return { version, tabs, tab, nodes: tab.folder.children, home: pathname === versionPath(version) };
}

const equivalents: Record<string, Record<string, string>> = {
  '2.x': {
    '/models': '/configuration#models',
    '/money': '/pricing#money-storage-standard',
    '/settings': '/setup-store#settings-model',
  },
};

/**
 * Same page in another version when it exists there, the page that covers its
 * topic there (`equivalents`, for a page 3.x split out of a 2.x page), that
 * version's landing page otherwise.
 */
export function versionHref(target: TreeFolder, current: TreeFolder, pathname: string): string {
  const relative = pathname.slice(versionPath(current).length);
  // A 404 outside every version falls back to the first version in `versionFor`, so its pathname has no page path.
  if (!relative.startsWith('/')) return versionHome(target);
  const urls = new Set(flattenPages(target.children).map((page) => page.url));
  const path = [relative, equivalents[target.$id ?? '']?.[relative]].find(
    (candidate) => candidate !== undefined && urls.has(`${versionPath(target)}${candidate.split('#')[0]}`),
  );
  return path ? `${versionPath(target)}${path}` : versionHome(target);
}
