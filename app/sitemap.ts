import type { MetadataRoute } from 'next';
import { versionFor, versionHome, versions } from '@/components/layout/tree';
import redirects from '@/redirects.json';
import { docsUrl } from '@/lib/shared';
import { getDocsTree, source } from '@/lib/source';

// Exact match: the pattern sources (`/v1/:path*`, `/v2/:path*`) cover no page path.
const redirected = new Set(redirects.map((redirect) => redirect.source));

export default function sitemap(): MetadataRoute.Sitemap {
  const tree = getDocsTree();
  // Archived versions stay online and linked, but out of the index: Google ignores `priority`.
  const listed = (pathname: string) =>
    versionFor(tree, pathname).description !== 'Archived' && !redirected.has(pathname);

  const landings = versions(tree)
    .filter((version) => versionHome(version) === `/${version.$id}` && listed(`/${version.$id}`))
    .map((version) => ({ url: `${docsUrl}/${version.$id}` }));

  const pages = source
    .getPages()
    .filter((page) => listed(page.url))
    .map((page) => ({ url: `${docsUrl}${page.url}`, lastModified: page.data.lastModified }));

  return [...landings, ...pages];
}
