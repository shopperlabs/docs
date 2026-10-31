import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import clsx from 'clsx';
import { DiscordIcon, GithubIcon, XIcon } from '@/components/ui/brand-icons';
import { TouchTarget } from '@/components/ui/touch-target';
import { links } from '@/lib/shared';
import { versionHome, versions, type TreeNode } from './tree';

type FooterLink = { label: ReactNode; href: string; ext?: boolean };

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Community',
    links: [
      { label: 'GitHub', href: links.github, ext: true },
      { label: 'Discussions', href: links.discussions, ext: true },
      { label: 'Discord', href: links.discord, ext: true },
      { label: 'X', href: links.x, ext: true },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Release notes', href: links.releases, ext: true },
      { label: 'Blog', href: links.blog, ext: true },
      { label: 'Demo store', href: links.demo, ext: true },
    ],
  },
];

const SOCIAL = [
  { label: 'GitHub', href: links.github, Icon: GithubIcon },
  { label: 'X', href: links.x, Icon: XIcon },
  { label: 'Discord', href: links.discord, Icon: DiscordIcon },
];

function FooterLink({ link }: { link: FooterLink }) {
  const classes =
    'block py-1 text-base/6 text-muted-foreground transition-colors duration-200 hover:text-brand-700 sm:text-sm/6 dark:hover:text-brand-300';

  if (link.ext) {
    return (
      <a href={link.href} target="_blank" rel="noreferrer noopener" className={classes}>
        {link.label}
      </a>
    );
  }

  return (
    <Link href={link.href} className={classes}>
      {link.label}
    </Link>
  );
}

function SocialLinks({ className }: { className?: string }) {
  return (
    <ul role="list" className={clsx('flex items-center gap-1', className)}>
      {SOCIAL.map(({ label, href, Icon }) => (
        <li key={label}>
          <a
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={label}
            className="relative inline-flex size-9 items-center justify-center rounded-lg transition-colors duration-200 hover:bg-muted dark:hover:bg-white/6"
          >
            <TouchTarget />
            <Icon className="size-4 shrink-0 fill-zinc-600 transition-colors duration-200 hover:fill-zinc-950 dark:fill-zinc-400 dark:hover:fill-white" />
          </a>
        </li>
      ))}
    </ul>
  );
}

function Wordmark() {
  return (
    <Link href="/" aria-label="Shopper Docs home" className="inline-flex shrink-0 items-center gap-2">
      <Image src="/logo/logo.svg" alt="" width={20} height={24} className="h-6 w-auto" />
      <span className="text-base font-semibold text-foreground">Shopper</span>
    </Link>
  );
}

export function Footer({ tree }: { tree: TreeNode[] }) {
  const year = new Date().getFullYear();
  const columns = [
    {
      title: 'Documentation',
      links: [
        ...versions(tree).map((version) => ({ label: version.name, href: versionHome(version) })),
        { label: 'Upgrade guide', href: '/2.x/upgrade' },
      ],
    },
    ...COLUMNS,
  ];

  return (
    <footer
      aria-label="Site footer"
      className="border-t border-zinc-100 bg-background dark:border-white/6"
    >
      <div className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between lg:gap-16">
          <div className="max-w-sm">
            <Wordmark />
            <p className="mt-4 text-base/6 text-pretty text-muted-foreground sm:text-sm/6">
              Open-source headless e-commerce for Laravel.
            </p>
          </div>

          <nav aria-label="Footer" className="grid min-w-0 grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:gap-x-16">
            {columns.map((column) => (
              <div key={column.title}>
                <h2 className="text-base/6 font-semibold text-foreground sm:text-sm/6">{column.title}</h2>
                <ul role="list" className="mt-3 space-y-1">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <FooterLink link={link} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </div>

      <div className="border-t border-zinc-100 dark:border-white/6">
        <div className="mx-auto flex max-w-6xl flex-col-reverse items-start justify-between gap-4 px-6 py-8 text-base/6 text-muted-foreground sm:flex-row sm:items-center sm:text-sm/6">
          <p>{`© ${year} Shopper`}</p>
          <SocialLinks className="-mr-2" />
        </div>
      </div>
    </footer>
  );
}
