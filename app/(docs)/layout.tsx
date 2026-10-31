import { fetchRepositoryInfo } from 'fumadocs-ui/components/github-info';
import { DocsShell } from '@/components/layout/docs-shell';
import { shopperRepo } from '@/lib/shared';
import { getDocsTree } from '@/lib/source';

// In a route group rather than `[...slug]`, so the layout does not take the slug: the
// router keeps the shell mounted across pages and fetches the tree once.
export default async function Layout({ children }: LayoutProps<'/'>) {
  // The star count is decoration: a GitHub outage or rate limit renders the link without it.
  const stars = await fetchRepositoryInfo({ ...shopperRepo, fetchOptions: { next: { revalidate: 86400 } } }).then(
    (info) => info.stars,
    () => undefined,
  );

  return (
    <DocsShell tree={getDocsTree()} stars={stars}>
      {children}
    </DocsShell>
  );
}
