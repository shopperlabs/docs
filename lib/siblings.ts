import type { ReactNode } from 'react';
import { flattenPages, scopeFor, type Tab, type TreeNode } from '../components/layout/tree.ts';

export interface Sibling {
  url: string;
  name: ReactNode;
  /** Set when the link leaves the section: the section it opens. */
  section?: { description?: string };
}

/**
 * Previous and next for a page: its neighbours in the sidebar it is shown in
 * and, past either end, the first page of the section before or after it in
 * the same version, with that page's description. Only the first and the last
 * page of a version stop.
 */
export function pageSiblings(
  tree: TreeNode[],
  url: string,
  describe: (url: string) => string | undefined,
): { prev?: Sibling; next?: Sibling } {
  const scope = scopeFor(tree, url);
  const pages = flattenPages(scope.nodes);
  const index = pages.findIndex((page) => page.url === url);
  if (index === -1) return {};

  const sectionLink = (tab: Tab | undefined): Sibling | undefined =>
    tab && { url: tab.href, name: tab.name, section: { description: describe(tab.href) } };
  const at = scope.tabs.indexOf(scope.tab);
  return {
    prev: pages[index - 1] ?? sectionLink(scope.tabs[at - 1]),
    next: pages[index + 1] ?? sectionLink(scope.tabs[at + 1]),
  };
}
