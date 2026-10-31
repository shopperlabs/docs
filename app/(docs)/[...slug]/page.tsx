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
import { scopeFor, versionHome } from '@/components/layout/tree';
import { getMDXComponents } from '@/components/mdx';
import { getPageImageUrl, getPageMarkdownUrl, gitConfig } from '@/lib/shared';
import { pageSiblings } from '@/lib/siblings';
import { getDocsTree, source } from '@/lib/source';

const crumbLink =
  'transition-colors duration-200 hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:outline-hidden';

export default async function Page(props: PageProps<'/[...slug]'>) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const markdownUrl = getPageMarkdownUrl(page).url;
  const githubUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${page.path}`;
  const tree = getDocsTree();
  const scope = scopeFor(tree, page.url);
  const { prev, next } = pageSiblings(tree, page.url);
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
          <h1 className="text-3xl/tight font-bold tracking-tight text-balance text-foreground sm:text-4xl">
            {page.data.title}
          </h1>
          {page.data.description ? (
            <p className="mt-3 text-lg/7 text-pretty text-muted-foreground sm:text-base/7">{page.data.description}</p>
          ) : null}
          <div className="mt-6 flex items-center gap-2">
            <MarkdownCopyButton markdownUrl={markdownUrl} />
            <ViewOptionsPopover markdownUrl={markdownUrl} githubUrl={githubUrl} />
          </div>
        </header>

        <MobileTOC toc={toc} />

        <div className="prose">
          <MDX components={getMDXComponents({ a: createRelativeLink(source, page) })} />
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4">
          {page.data.lastModified ? <PageLastUpdate date={page.data.lastModified} /> : <span />}
          <EditOnGitHub href={githubUrl} />
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

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImageUrl(page).url,
    },
  };
}
