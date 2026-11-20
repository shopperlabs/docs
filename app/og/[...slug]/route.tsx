import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { notFound } from 'next/navigation';
import { ImageResponse } from 'next/og';
import type { ReactNode } from 'react';
import { versionFor, versionHome, versions, type TreeNode } from '@/components/layout/tree';
import { getPageImageUrl } from '@/lib/shared';
import { getDocsTree, source } from '@/lib/source';

export const revalidate = false;

export async function GET(_req: Request, { params }: RouteContext<'/og/[...slug]'>) {
  const { slug } = await params;
  const slugs = slug.slice(0, -1);
  const pathname = `/${slugs.join('/')}`;
  const tree = getDocsTree();
  const page = source.getPage(slugs);
  if (!page && !landings(tree).some((version) => versionHome(version) === pathname)) notFound();

  const version = versionFor(tree, pathname);
  const logo = await readFile(join(process.cwd(), 'public/logo/logo.svg'), 'base64');

  return new ImageResponse(
    <Card
      logo={`data:image/svg+xml;base64,${logo}`}
      version={version.name}
      status={version.description}
      title={page?.data.title ?? 'Documentation'}
      description={page?.data.description}
    />,
    { width: 1200, height: 630 },
  );
}

/** Versions whose home is a landing page of its own rather than one of their pages. */
function landings(tree: TreeNode[]) {
  return versions(tree).filter((version) => versionHome(version) === `/${version.$id}`);
}

function Card({
  logo,
  version,
  status,
  title,
  description,
}: {
  logo: string;
  version: ReactNode;
  status: ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        padding: '72px 80px',
        color: '#ffffff',
        backgroundColor: '#020618',
        backgroundImage: 'radial-gradient(circle at 100% 0%, rgba(37, 99, 235, 0.45), rgba(2, 6, 24, 0) 55%)',
        borderBottom: '12px solid #2563eb',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <img src={logo} width={46} height={56} alt="" />
        <span style={{ fontSize: '40px', letterSpacing: '-0.02em' }}>Shopper</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: 'auto' }}>
          <span
            style={{
              padding: '6px 18px',
              fontSize: '28px',
              color: '#bfdbfe',
              backgroundColor: 'rgba(37, 99, 235, 0.25)',
              border: '2px solid rgba(96, 165, 250, 0.5)',
              borderRadius: '9999px',
            }}
          >
            {version}
          </span>
          <span style={{ fontSize: '28px', color: '#90a1b9' }}>{status}</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto' }}>
        <div style={{ display: 'block', fontSize: '76px', lineHeight: 1.1, letterSpacing: '-0.03em', lineClamp: 3 }}>
          {title}
        </div>
        {description ? (
          <div
            style={{ display: 'block', marginTop: '24px', fontSize: '32px', lineHeight: 1.4, color: '#90a1b9', lineClamp: 2 }}
          >
            {description}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return [
    ...source.getPages().map((page) => ({ slug: getPageImageUrl(page).segments })),
    ...landings(getDocsTree()).map((version) => ({ slug: getPageImageUrl({ slugs: [version.$id!] }).segments })),
  ];
}
