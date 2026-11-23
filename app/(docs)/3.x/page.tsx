import { highlight } from 'fumadocs-core/highlight';
import { FileCode, FileText, Files, GitPullRequest, Plug } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { AnyLink, ArrowLink, buttons, filler, frame, Section, TileGrid, type Tile } from '@/components/home/sections';
import { Lined } from '@/components/ui/lined';
import { VersionMark } from '@/components/home/version-mark';
import { domainHref, firstUrl, flattenPages, tabsFor, versions } from '@/components/layout/tree';
import { DiscordIcon, GithubIcon, XIcon } from '@/components/ui/brand-icons';
import { InstallCommand } from '@/components/ui/install-command';
import { docsUrl, getPageImageUrl, links } from '@/lib/shared';
import { getDocsTree } from '@/lib/source';

export const metadata: Metadata = {
  title: { absolute: 'Shopper 3.x documentation' },
  description:
    'Install Shopper, run a store from its admin panel and build a storefront on the Store API. Documentation for Shopper 3, the headless e-commerce package for Laravel.',
  alternates: {
    canonical: '/3.x',
  },
  openGraph: {
    images: getPageImageUrl({ slugs: ['3.x'] }).url,
  },
};

const DOMAINS: { name: string; guideFolder?: string; glyph: string; description: string }[] = [
  {
    name: 'Catalog',
    glyph: 'catalog',
    description: 'Products, variants, attributes, collections, brands and suppliers.',
  },
  { name: 'Sales', glyph: 'orders', description: 'Customers, carts, orders, payments, refunds and shipments.' },
  { name: 'Marketing', glyph: 'promotions', description: 'Campaigns, discounts and abandoned carts.' },
  {
    name: 'Store Setup',
    glyph: 'geo',
    description: 'Store details, zones, locations, currencies, carriers and payment methods.',
  },
  {
    name: 'System',
    guideFolder: 'Administration',
    glyph: 'admin',
    description: 'Team and roles, webhooks, notifications, themes, imports and media.',
  },
];

const AI: Tile[] = [
  { title: 'llms.txt', description: 'Every page with its summary, for an assistant to pick from.', href: '/llms.txt', Icon: FileText },
  { title: 'llms-full.txt', description: 'The whole documentation in one Markdown file.', href: '/llms-full.txt', Icon: Files },
  {
    title: 'Page as Markdown',
    description: 'Add .md to any page URL, or send Accept: text/markdown.',
    href: '/3.x/getting-started.md',
    Icon: FileCode,
  },
  {
    title: 'MCP server',
    description: 'Search and read these pages from Claude Code, Cursor or any MCP client.',
    href: '/3.x/ai-tools#documentation-mcp-server',
    Icon: Plug,
  },
];

const COMMUNITY: Tile[] = [
  { title: 'GitHub', description: 'Source, issues and releases.', href: links.github, Icon: GithubIcon },
  { title: 'Discord', description: 'Questions and help from other Shopper developers.', href: links.discord, Icon: DiscordIcon },
  { title: 'X', description: 'Releases and news.', href: links.x, Icon: XIcon },
  { title: 'Contributing', description: 'Report a bug, propose a change, open a pull request.', href: links.contributing, Icon: GitPullRequest },
];

const COMMANDS = ['composer require shopper/framework', 'php artisan shopper:install'];
const MCP_COMMAND = `claude mcp add --transport http shopper-docs ${docsUrl}/mcp`;

export default async function Home() {
  const version = versions(getDocsTree()).find((node) => node.$id === '3.x')!;
  const tabs = tabsFor(version);
  const tab = (name: string) => tabs.find((entry) => entry.name === name)!.folder;
  const live = (url: string) => flattenPages(version).some((page) => page.url === url);

  const install = live('/3.x/installation') ? '/3.x/installation' : '#install';
  const storefront = firstUrl(tab('Storefront'))!;
  const tokens = await Promise.all(COMMANDS.map((command) => highlight(command, { lang: 'bash', structure: 'inline' })));
  const mcpTokens = await highlight(MCP_COMMAND, { lang: 'bash', structure: 'inline' });

  const steps = [
    {
      title: 'Evaluate',
      text: 'What Shopper covers, and a store running on it.',
      links: [
        { label: 'Introduction', href: firstUrl(tab('Documentation'))! },
        { label: 'Demo store', href: links.demo },
      ],
    },
    {
      title: 'Install',
      text: 'Add Shopper to a Laravel 12 or 13 application on PHP 8.3 or higher.',
      links: [{ label: 'Installation', href: install }],
    },
    {
      title: 'Build',
      text: 'Sell from a starter kit, or build your own front end on the Store API.',
      links: [{ label: 'Storefront', href: storefront }],
    },
  ];

  const news = [
    {
      title: 'Store API and JavaScript SDK',
      text: (
        <>
          A JSON:API for the catalog, customer accounts, carts, discount codes, shipping options, checkout, payment and orders,
          with a typed SDK: <code>@shopperlabs/shopper-sdk</code>.
        </>
      ),
      label: 'Storefront',
      href: storefront,
    },
    {
      title: 'Promotions',
      text: 'Campaigns with budgets, discounts that apply automatically, and priority and combination rules between discounts.',
      label: 'Marketing',
      href: domainHref(tab('Documentation'), 'Marketing'),
    },
    {
      title: 'Carrier tracking',
      text: 'Shipment status follows the carrier through inbound webhooks or scheduled polling, with shipment events. UPS, FedEx and USPS are opt-in packages.',
      label: 'Add-ons',
      href: firstUrl(tab('Add-ons'))!,
    },
    {
      title: 'Permissions on every action',
      text: (
        <>
          Permissions in dot notation, such as <code>system.settings</code>, checked on every admin action and Livewire update.
        </>
      ),
      label: 'System',
      href: domainHref(tab('Documentation'), 'System'),
    },
    {
      title: 'A new admin shell',
      text: 'Full-width header, breadcrumbs, grouped settings, and an appearance page to theme the admin.',
      label: 'User Guide',
      href: firstUrl(tab('User Guide'))!,
    },
    {
      title: 'Filament 5 and Laravel 13',
      text: (
        <>
          Shopper 3 runs on Filament 5, Livewire 4 and Laravel 12 or 13. <code>php artisan shopper:upgrade</code> moves a 2.x application with Rector rules and a permission migration.
        </>
      ),
      label: 'Upgrade guide',
      href: '/3.x/upgrade',
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pt-16 pb-28 sm:px-8 lg:pt-20">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <h1 className="font-display text-4xl font-medium tracking-tight text-balance text-zinc-950 sm:text-5xl dark:text-white">
            Shopper documentation
          </h1>
          <p className="mt-6 max-w-[56ch] text-lg/8 text-pretty text-zinc-600 sm:text-base/7 dark:text-zinc-400">
            Shopper is an open-source headless e-commerce package for Laravel. Install it, run the store from its admin
            panel, and build the storefront on its Store API.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <AnyLink href={install} className={buttons.solid}>
              Install Shopper
            </AnyLink>
            <Link href={storefront} className={buttons.outline}>
              Build a storefront
            </Link>
          </div>

          <section id="install" aria-labelledby="install-title" className="mt-10 max-w-md">
            <h2 id="install-title" className="sr-only">
              Install
            </h2>
            {COMMANDS.map((command, i) => (
              <InstallCommand key={command} command={command} className={i > 0 ? 'mt-3' : undefined}>
                {tokens[i]}
              </InstallCommand>
            ))}
            <p className="mt-3 text-sm/6 text-zinc-500">PHP 8.3 or higher, Laravel 12 or 13.</p>
          </section>
        </div>

        <VersionMark className="w-full max-lg:hidden" />
      </div>

      <Section id="start-here" title="Start here">
        <Lined>
          <ol role="list" className={`${frame} sm:grid-cols-3`}>
            {steps.map((step) => (
              <li key={step.title} className="flex flex-col bg-card p-6">
                <h3 className="text-base/6 font-semibold text-zinc-950 dark:text-white">{step.title}</h3>
                <p className="mt-1 text-sm/6 text-pretty text-zinc-600 dark:text-zinc-400">{step.text}</p>
                <p className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-4 text-sm/6">
                  {step.links.map((link) => (
                    <ArrowLink key={link.label} href={link.href}>
                      {link.label}
                    </ArrowLink>
                  ))}
                </p>
              </li>
            ))}
          </ol>
        </Lined>
      </Section>

      <Section id="sections" title="Browse the documentation">
        <Lined>
          <ul role="list" className={`${frame} sm:grid-cols-2 lg:grid-cols-4`}>
            {tabs.map(({ name, href, folder }) => {
              const pages = flattenPages(folder.children)
                .filter((page) => page.url !== href)
                .slice(0, 3);
              return (
                <li key={href} className="flex flex-col bg-card p-6">
                  <h3 className="text-base/6 font-semibold text-zinc-950 dark:text-white">
                    <Link href={href} className="hover:text-primary focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-hidden dark:focus-visible:ring-brand-400">
                      {name}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm/6 text-pretty text-zinc-600 dark:text-zinc-400">{folder.description}</p>
                  <ul role="list" className="mt-auto space-y-1 pt-4 text-sm/6">
                    {pages.length > 0 ? (
                      pages.map((page) => (
                        <li key={page.url}>
                          <ArrowLink href={page.url}>{page.name}</ArrowLink>
                        </li>
                      ))
                    ) : (
                      <li>
                        <ArrowLink href={href}>Overview</ArrowLink>
                      </li>
                    )}
                  </ul>
                </li>
              );
            })}
            <li aria-hidden className={`${filler} max-lg:hidden! lg:col-span-2`} />
          </ul>
        </Lined>
      </Section>

      <Section
        id="domains"
        title="By domain"
        lead="Each domain in the developer documentation, in the User Guide for the people who run the store, and in the reference tables."
      >
        <Lined>
          <ul role="list" className={`${frame} sm:grid-cols-2 lg:grid-cols-3`}>
            {DOMAINS.map((domain) => (
              <li key={domain.name} className="flex flex-col bg-card p-6">
                <h3 className="flex items-center gap-3 text-base/6 font-semibold text-zinc-950 dark:text-white">
                  <img src={`/images/home/domains/${domain.glyph}.svg`} alt="" className="h-10 w-auto shrink-0" />
                  {domain.name}
                </h3>
                <p className="mt-3 text-sm/6 text-pretty text-zinc-600 dark:text-zinc-400">{domain.description}</p>
                <ul role="list" className="mt-auto space-y-1 pt-4 text-sm/6">
                  {['Documentation', 'User Guide', 'Reference'].map((name) => (
                    <li key={name}>
                      <ArrowLink
                        href={domainHref(tab(name), name === 'User Guide' ? (domain.guideFolder ?? domain.name) : domain.name)}
                      >
                        {name}
                      </ArrowLink>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
            <li aria-hidden className={filler} />
          </ul>
        </Lined>
      </Section>

      <Section id="whats-new" title="What's new in 3.0">
        <Lined>
          <ul role="list" className={`${frame} sm:grid-cols-2 lg:grid-cols-3`}>
            {news.map((entry) => (
              <li key={entry.title} className="flex flex-col bg-card p-6">
                <h3 className="text-base/6 font-semibold text-zinc-950 dark:text-white">{entry.title}</h3>
                <p className="mt-1 text-sm/6 text-pretty text-zinc-600 dark:text-zinc-400 [&_code]:font-mono [&_code]:text-[0.8125rem] [&_code]:text-zinc-950 dark:[&_code]:text-white">{entry.text}</p>
                <p className="mt-auto pt-4 text-sm/6">
                  <ArrowLink href={entry.href}>{entry.label}</ArrowLink>
                </p>
              </li>
            ))}
          </ul>
        </Lined>
        <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm/6">
          {live('/3.x/whats-new') ? (
            <ArrowLink href="/3.x/whats-new">Everything new in 3.0</ArrowLink>
          ) : null}
          <ArrowLink href={links.releases}>All release notes</ArrowLink>
        </p>
      </Section>

      <Section
        id="ai"
        title="Use with AI"
        lead="Give an assistant the pages it needs, in Markdown or through the MCP server."
      >
        <TileGrid tiles={AI} className="sm:grid-cols-2 lg:grid-cols-4" />
        <div className="mt-6 max-w-3xl">
          <InstallCommand command={MCP_COMMAND}>{mcpTokens}</InstallCommand>
          <p className="mt-3 text-sm/6 text-pretty text-zinc-500 [&_code]:font-mono [&_code]:text-[0.8125rem] [&_code]:text-zinc-950 dark:[&_code]:text-white">
            Adds the MCP server to Claude Code. In Cursor, add <code>{`${docsUrl}/mcp`}</code> under <code>mcpServers</code> in{' '}
            <code>.cursor/mcp.json</code>.
          </p>
        </div>
      </Section>

      <Section id="community" title="Community">
        <TileGrid tiles={COMMUNITY} className="sm:grid-cols-2 lg:grid-cols-4" />
      </Section>
    </div>
  );
}
