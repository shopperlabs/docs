'use client';

import type { ComponentType, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {
  AimeosIcon,
  BagistoIcon,
  DiscordIcon,
  GithubIcon,
  LunarIcon,
  MedusaIcon,
  SyliusIcon,
  VaniloIcon,
  XIcon,
} from '@/components/ui/brand-icons';
import { InstallCommand } from '@/components/ui/install-command';
import { TouchTarget } from '@/components/ui/touch-target';
import { links, siteUrl } from '@/lib/shared';
import { Logo } from './logo';
import { flattenPages, versionFor, versionHome, versions, type TreeNode } from './tree';

type FooterLink = { label: ReactNode; href: string; ext?: boolean; Icon?: ComponentType<{ className?: string }> };

const vs = (name: string, Icon: FooterLink['Icon']): FooterLink => ({
  label: name,
  href: `${siteUrl}/vs/${name.toLowerCase()}`,
  ext: true,
  Icon,
});

const PRODUCT: FooterLink[] = [
  { label: 'Features', href: `${siteUrl}/features`, ext: true },
  { label: 'Headless / API & SDK', href: `${siteUrl}/headless`, ext: true },
  { label: 'Starter Kits', href: `${siteUrl}/starter-kits`, ext: true },
  { label: 'Add-ons', href: `${siteUrl}/addons`, ext: true },
  { label: 'Demo', href: links.demo, ext: true },
  { label: 'Roadmap', href: `${siteUrl}/roadmap`, ext: true },
];

const COMPARE: FooterLink[] = [
  vs('Lunar', LunarIcon),
  vs('Bagisto', BagistoIcon),
  vs('Medusa', MedusaIcon),
  vs('Aimeos', AimeosIcon),
  vs('Vanilo', VaniloIcon),
  vs('Sylius', SyliusIcon),
];

const COMMUNITY: FooterLink[] = [
  { label: 'Discord', href: links.discord, ext: true },
  { label: 'GitHub Discussions', href: links.discussions, ext: true },
  { label: 'Contributing', href: links.contributing, ext: true },
  { label: 'Sponsors', href: `${siteUrl}/sponsors`, ext: true },
  { label: 'X', href: links.x, ext: true },
];

const LEGAL: FooterLink[] = [
  { label: 'Privacy', href: `${siteUrl}/privacy`, ext: true },
  { label: 'Terms', href: `${siteUrl}/terms`, ext: true },
];

const SOCIAL = [
  { label: 'GitHub', href: links.github, Icon: GithubIcon },
  { label: 'X', href: links.x, Icon: XIcon },
  { label: 'Discord', href: links.discord, Icon: DiscordIcon },
];

const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });

function FooterLink({ link, className }: { link: FooterLink; className: string }) {
  const label = link.Icon ? (
    <span className="inline-flex items-center gap-2">
      <span className="opacity-60">vs.</span>
      <link.Icon className="size-5 shrink-0 sm:size-4" />
      {link.label}
    </span>
  ) : (
    link.label
  );

  if (link.ext) {
    return (
      <a href={link.href} target="_blank" rel="noreferrer noopener" className={className}>
        {label}
      </a>
    );
  }

  return (
    <Link href={link.href} className={className}>
      {label}
    </Link>
  );
}

const wordmarkText =
  'mb-[-0.32em] font-display text-[clamp(6rem,19vw,22rem)] leading-none font-semibold tracking-tight select-none';

function Wordmark() {
  return (
    <div className="relative overflow-hidden" aria-hidden="true">
      <p className={clsx(wordmarkText, 'px-6 text-transparent [-webkit-text-stroke:1px_rgb(255_255_255/0.12)]')}>
        Shopper
      </p>
      <p
        className={clsx(
          wordmarkText,
          'absolute inset-0 wordmark-sweep px-6 text-transparent [-webkit-text-stroke:1px_rgb(255_255_255/0.55)]',
        )}
      >
        Shopper
      </p>
    </div>
  );
}

/** The upgrade guide of the version read; 1.x has none, so its readers get the current release's. */
function upgradeGuide(tree: TreeNode[], pathname: string): string {
  const read = versionFor(tree, pathname);
  const url = `/${read.$id}/upgrade`;
  return flattenPages(read.children).some((page) => page.url === url) ? url : `/${versions(tree)[0].$id}/upgrade`;
}

export function Footer({ tree, stars }: { tree: TreeNode[]; stars?: number }) {
  const pathname = usePathname();
  // The reader is already in the docs, so the site's "Get started" button stays out.
  const columns = [
    { title: 'Product', links: PRODUCT },
    {
      title: 'Resources',
      links: [
        { label: 'Documentation', href: versionHome(versions(tree)[0]) },
        { label: 'Blog', href: links.blog, ext: true },
        { label: 'Changelog', href: `${siteUrl}/changelog`, ext: true },
        { label: 'Upgrade guide', href: upgradeGuide(tree, pathname) },
        { label: 'GitHub', href: links.github, ext: true },
      ],
    },
    { title: 'Compare', links: COMPARE },
    { title: 'Community', links: COMMUNITY },
  ];

  return (
    <footer aria-label="Site footer" className="bg-zinc-950 text-white dark:border-t dark:border-white/10">
      <div className="mx-auto w-full max-w-7xl border-x border-white/10 px-6">
        <div className="grid gap-10 border-b border-white/10 py-16 lg:grid-cols-2 lg:items-end lg:py-24">
          <div>
            <Logo className="w-fit" />
            {/* The site's sizes: the docs scale sets text-4xl and text-5xl smaller. */}
            <p className="mt-6 max-w-[24ch] font-display text-[2.25rem]/10 font-medium tracking-tight text-balance sm:text-6xl/none">
              The commerce engine for any storefront.
            </p>
          </div>
          <div className="flex flex-col gap-4 lg:items-end">
            <InstallCommand variant="overlay" command="composer require shopper/framework" className="w-full max-w-sm" />
            <a
              href={links.github}
              target="_blank"
              rel="noreferrer noopener"
              className="relative isolate inline-flex items-center gap-x-2 self-start border border-zinc-950/90 bg-zinc-900 px-3.5 py-2 font-mono text-sm/6 font-medium tracking-wide text-white uppercase after:absolute after:inset-0 after:-z-10 after:origin-right after:scale-x-0 after:bg-white/10 after:transition-transform after:duration-300 after:ease-out hover:after:origin-left hover:after:scale-x-100 motion-reduce:after:transition-none sm:px-4 sm:py-1.5 sm:text-[0.8125rem]/6 lg:self-end"
            >
              <GithubIcon className="size-5 shrink-0 text-zinc-400 sm:size-4" />
              {stars !== undefined ? (
                <>
                  <span className="tabular-nums">{compact.format(stars)}</span>
                  <span className="sr-only"> stars on GitHub</span>
                </>
              ) : (
                'GitHub'
              )}
            </a>
          </div>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 py-16 lg:grid-cols-4 lg:py-20">
          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="text-base font-semibold text-white">{column.title}</h2>
              <ul role="list" className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link.href} className="text-base/7 sm:text-sm/6">
                    <FooterLink link={link} className="text-zinc-400 hover:text-white" />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="flex flex-col gap-6 border-t border-white/10 py-8 text-base/7 text-zinc-400 sm:text-sm/6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <p>&copy; Shopper Labs</p>
            {LEGAL.map((link) => (
              <FooterLink key={link.href} link={link} className="hover:text-white" />
            ))}
          </div>
          <ul role="list" className="flex gap-5">
            {SOCIAL.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="relative flex text-zinc-400 hover:text-white"
                >
                  <TouchTarget />
                  <span className="sr-only">{label}</span>
                  <Icon className="size-6 shrink-0 sm:size-5" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl border-x border-t border-white/10">
        <Wordmark />
      </div>
    </footer>
  );
}
