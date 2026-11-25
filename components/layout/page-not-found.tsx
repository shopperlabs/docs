'use client';

import { useFetchSearch, type SearchResultRecord } from 'fumadocs-core/search/client';
import { FileText } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { use, useEffect } from 'react';
import { buttons } from '@/components/home/sections';
import { gitConfig } from '@/lib/shared';
import { TreeContext } from './docs-shell';
import { versionFor, versionHome, versionPage, versions } from './tree';

const wordsOf = (text: string) =>
  text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2);

const link =
  'text-primary underline underline-offset-4 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-hidden dark:focus-visible:ring-brand-400';

// The not-found boundary gets no params: the version comes from the address, the current release outside any.
export function PageNotFound() {
  const pathname = usePathname();
  const tree = use(TreeContext);
  const version = versionFor(tree, pathname);
  const elsewhere = versions(tree).flatMap((other) => {
    const href = other === version ? undefined : versionPage(other, version, pathname);
    return href ? [{ id: other.$id, href }] : [];
  })[0];

  const prefix = `/${version.$id}`;
  const words = wordsOf(pathname.startsWith(`${prefix}/`) ? pathname.slice(prefix.length) : pathname);
  const query = words.join(' ');
  const { data, onSearchChange } = useFetchSearch({ api: '/api/search', tag: version.$id, delayMs: 0 });
  useEffect(() => {
    onSearchChange(query);
  }, [onSearchChange, query]);

  // The search ranks pages by their text, so a page that only mentions a word of the address can come first: a
  // suggestion must share a word with the address in its URL or title ("modal" matches "modals", "install" matches
  // "installation"), and the most shared words come first.
  const shared = (page: SearchResultRecord) => {
    const tokens = wordsOf(`${page.url} ${page.content}`);
    return words.filter((word) => tokens.some((token) => token.startsWith(word) || word.startsWith(token))).length;
  };
  const suggestions = (data?.items ?? [])
    .filter((item): item is SearchResultRecord => item.type === 'page' && shared(item) > 0)
    .toSorted((a, b) => shared(b) - shared(a))
    .slice(0, 5);

  const report = `https://github.com/${gitConfig.user}/${gitConfig.repo}/issues/new?${new URLSearchParams({ title: `Broken link to ${pathname}` })}`;

  return (
    <article className="w-full max-w-3xl min-w-0 flex-1 animate-page-enter">
      <p className="font-mono text-sm/6 font-medium tracking-wide text-primary uppercase">404</p>
      <h1 className="mt-2 text-3xl/tight font-medium tracking-tight text-balance text-foreground sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-3 text-lg/7 text-pretty text-muted-foreground sm:text-base/7">
        The {version.$id} documentation has no page at this address.{' '}
        {elsewhere ? (
          <>
            Open it in the{' '}
            <Link href={elsewhere.href} className={link}>
              {elsewhere.id} documentation
            </Link>
            ,
          </>
        ) : (
          'Pick another version in the menu at the top,'
        )}{' '}
        or start again from the {version.$id} documentation.
      </p>
      <div className="mt-8">
        <Link href={versionHome(version)} className={buttons.solid}>
          Go to the {version.$id} documentation
        </Link>
      </div>

      {suggestions.length > 0 && (
        <section aria-labelledby="pages-that-may-match" className="mt-12">
          <h2 id="pages-that-may-match" className="text-sm/6 font-medium text-foreground">
            Pages that may match
          </h2>
          <ul className="mt-3 divide-y divide-zinc-200 border border-zinc-200 bg-fd-card dark:divide-white/10 dark:border-white/10">
            {suggestions.map((page) => (
              <li key={page.id}>
                <Link
                  href={page.url}
                  className="flex items-center gap-3 px-4 py-3 text-sm/6 text-foreground transition-colors hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-hidden focus-visible:ring-inset dark:hover:bg-white/3 dark:focus-visible:ring-brand-400"
                >
                  <FileText aria-hidden className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1">{page.content}</span>
                  <span className="hidden truncate font-mono text-xs text-muted-foreground sm:block">{page.url}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-12 text-sm/6 text-muted-foreground">
        Did a link bring you here?{' '}
        <a href={report} className={link}>
          Report it on GitHub
        </a>
        .
      </p>
    </article>
  );
}
