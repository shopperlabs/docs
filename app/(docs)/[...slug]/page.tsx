import {
  EditOnGitHub,
  MarkdownCopyButton,
  PageLastUpdate,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/notebook/page';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MobileTOC } from '@/components/layout/mobile-toc';
import { PageSiblings } from '@/components/layout/page-siblings';
import { TableOfContents } from '@/components/layout/table-of-contents';
import { GithubIcon } from '@/components/ui/brand-icons';
import { scopeFor, versionHome } from '@/components/layout/tree';
import { getMDXComponents } from '@/components/mdx';
import { getPageImageUrl, getPageMarkdownUrl, gitConfig } from '@/lib/shared';
import { pageSiblings } from '@/lib/siblings';
import { getDocsTree, source } from '@/lib/source';

const crumbLink =
  'transition-colors duration-200 hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-hidden dark:focus-visible:ring-brand-400';

// The marketing site's outline button, over Fumadocs' secondary one: its fill sweeps in from the left.
// `data-[popup-open]:` stays in Fumadocs' spelling, not the canonical `data-popup-open:`: `cn` drops their
// `data-[popup-open]:bg-fd-accent` only when the variant is written the same way.
const pageAction = [
  'relative isolate border-zinc-950/10 bg-white px-3 font-mono text-xs/5 tracking-wide text-zinc-950 uppercase',
  'hover:border-zinc-950/20 hover:bg-white hover:text-zinc-950 data-[popup-open]:bg-white',
  'after:absolute after:inset-0 after:-z-10 after:origin-right after:scale-x-0 after:bg-zinc-950/4 after:transition-transform after:duration-300 after:ease-out motion-reduce:after:transition-none',
  'hover:after:origin-left hover:after:scale-x-100 data-popup-open:after:origin-left data-popup-open:after:scale-x-100',
  'dark:border-white/15 dark:bg-transparent dark:text-white dark:after:bg-white/5 dark:hover:border-white/25 dark:hover:bg-transparent dark:hover:text-white dark:data-popup-open:bg-transparent',
].join(' ');

export default async function Page(props: PageProps<'/[...slug]'>) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const markdownUrl = getPageMarkdownUrl(page).url;
  const githubUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${page.path}`;
  const tree = getDocsTree();
  const scope = scopeFor(tree, page.url);
  const { prev, next } = pageSiblings(
    tree,
    page.url,
    (url) => source.getPages().find((entry) => entry.url === url)?.data.description,
  );
  const toc = page.data.toc;
  // A flat version (3.x, 1.x) has a single section named after nothing in particular.
  const showSection = scope.tab.folder !== scope.version && scope.tab.name !== page.data.title;

  return (
    <>
      <article className="w-full max-w-3xl min-w-0 flex-1 animate-page-enter">
        <nav
          className="mb-5 flex flex-wrap items-center gap-1.5 text-sm/6 text-muted-foreground sm:text-xs/5"
          aria-label="Breadcrumb"
        >
          <Link href={versionHome(scope.version)} className={crumbLink}>
            {scope.version.name}
          </Link>
          {showSection ? (
            <>
              <ChevronRight className="size-3.5 shrink-0 text-border" aria-hidden />
              <Link href={scope.tab.href} className={`max-w-[8rem] truncate sm:max-w-none ${crumbLink}`}>
                {scope.tab.name}
              </Link>
            </>
          ) : null}
          <ChevronRight className="size-3.5 shrink-0 text-border" aria-hidden />
          <span className="truncate font-medium text-foreground">{page.data.title}</span>
        </nav>

        <header className="mb-9">
          <h1 className="text-3xl/tight font-medium tracking-tight text-balance text-foreground sm:text-4xl">
            {page.data.title}
          </h1>
          {page.data.description ? (
            <p className="mt-3 text-lg/7 text-pretty text-muted-foreground sm:text-base/7">{page.data.description}</p>
          ) : null}
          <div className="mt-6 flex items-center gap-2">
            <MarkdownCopyButton markdownUrl={markdownUrl} className={pageAction} />
            <ViewOptionsPopover markdownUrl={markdownUrl} githubUrl={githubUrl} className={pageAction} />
          </div>
        </header>

        <MobileTOC toc={toc} />

        <div className="prose">
          <MDX components={getMDXComponents({ a: createRelativeLink(source, page) })} />
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4">
          {page.data.lastModified ? <PageLastUpdate date={page.data.lastModified} /> : <span />}
          <EditOnGitHub href={githubUrl} className={pageAction}>
            <GithubIcon className="size-3.5" />
            Edit on GitHub
          </EditOnGitHub>
        </div>

        <PageSiblings prev={prev} next={next} />
      </article>

      <TableOfContents toc={toc} />
    </>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: PageProps<'/[...slug]'>): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  // The same page exists in several versions under the same title: the version tells them apart in results.
  const { version } = scopeFor(getDocsTree(), page.url);

  return {
    title: { absolute: `${page.data.title} | Shopper ${version.$id}` },
    description: page.data.description,
    alternates: {
      canonical: page.url,
    },
    // Archived versions stay reachable from links, but their pages must not outrank the current ones.
    robots: version.description === 'Archived' ? { index: false, follow: true } : undefined,
    openGraph: {
      url: page.url,
      type: 'article',
      images: getPageImageUrl(page).url,
    },
  };
}
