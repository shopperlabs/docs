import { firstUrl, type TreeNode } from './tree.ts';

export interface NavGroup {
  id: string;
  title?: string;
  nodes: TreeNode[];
}

/**
 * Splits the tree into titled groups. Two title sources: the separators of
 * `meta.json`, and top-level folders, whose pages are lifted to the root
 * instead of living behind a chevron. Such a folder's index page becomes the
 * group's first entry, "Overview". A group is known by its first page's URL:
 * titles repeat across the tabs of a version (2.x Documentation and User Guide
 * both have "Sales"), URLs do not.
 */
export function toGroups(nodes: TreeNode[]): NavGroup[] {
  const labelFor = (siblings: TreeNode[]) =>
    siblings.some(
      (n) => n.type === 'page' && typeof n.name === 'string' && n.name.trim().toLowerCase() === 'overview',
    )
      ? 'Introduction'
      : 'Overview';
  const group = (title: string | undefined, nodes: TreeNode[]): NavGroup => ({
    id: `group:${firstUrl(nodes[0])}`,
    title,
    nodes,
  });

  const groups: NavGroup[] = [];
  let title: string | undefined;
  let current: TreeNode[] = [];

  function flush() {
    if (current.length > 0) groups.push(group(title, current));
    title = undefined;
    current = [];
  }

  for (const node of nodes) {
    if (node.type === 'separator') {
      flush();
      title = typeof node.name === 'string' ? node.name : undefined;
      continue;
    }
    if (node.type === 'folder') {
      flush();
      const index = node.index;
      const rest = index
        ? node.children.filter((child) => child.type !== 'page' || child.url !== index.url)
        : node.children;
      groups.push(
        group(typeof node.name === 'string' ? node.name : undefined, index ? [{ ...index, name: labelFor(rest) }, ...rest] : rest),
      );
      continue;
    }
    current.push(node);
  }
  flush();

  return groups;
}

// Storage can hold something other than a list, written by hand or by an older format.
export function parseOpenGroups(raw: string | null): string[] {
  try {
    const stored: unknown = JSON.parse(raw ?? '[]');
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

// The same array when nothing changes: useSyncExternalStore renders again on every new snapshot.
export function withGroup(groups: string[], id: string, open: boolean): string[] {
  if (groups.includes(id) === open) return groups;
  return open ? [...groups, id] : groups.filter((group) => group !== id);
}
