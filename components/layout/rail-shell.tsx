'use client';

import type { ReactNode } from 'react';
import { Footer } from './footer';
import { Header } from './header';
import { Sidebar } from './sidebar';
import type { TreeNode } from './tree';

export function RailShell({
  tree,
  stars,
  nodes,
  sectionName,
  children,
  onMenuClick,
  drawerOpen,
  home,
}: {
  tree: TreeNode[];
  stars?: number;
  nodes: TreeNode[];
  sectionName: ReactNode;
  children: ReactNode;
  onMenuClick: () => void;
  drawerOpen: boolean;
  home: boolean;
}) {
  return (
    <>
      <Header tree={tree} stars={stars} onMenuClick={onMenuClick} drawerOpen={drawerOpen} />

      {home ? (
        <main id="content" tabIndex={-1} className="outline-hidden">
          {children}
        </main>
      ) : (
        <div className="lg:grid lg:grid-cols-[var(--spacing-sidebar)_minmax(0,1fr)]">
          <aside
            aria-label="Documentation sidebar"
            className="sticky top-subheader hidden h-[calc(100dvh-var(--spacing-subheader))] border-r border-zinc-200 lg:block dark:border-white/10"
          >
            <Sidebar nodes={nodes} navClassName="px-6 pb-10" header={<SectionHeading name={sectionName} />} />
          </aside>

          <main id="content" tabIndex={-1} className="min-w-0 outline-hidden">
            <div className="mx-auto flex w-full max-w-6xl gap-x-24 px-6 pt-12 pb-24 sm:px-8">{children}</div>
          </main>
        </div>
      )}

      <Footer tree={tree} stars={stars} />
    </>
  );
}

/**
 * Names the section whose tree the sidebar shows. Switching section goes
 * through the bar under the header, so this title is no selector. It sticks
 * to the top of the scrolling area and its gradient fades the entries passing
 * behind it.
 */
export function SectionHeading({ name }: { name: ReactNode }) {
  return (
    <div className="pointer-events-none sticky top-0 z-10">
      <div className="pointer-events-auto flex items-center gap-2.5 bg-background px-6 pt-6 pb-1">
        <p className="text-sm/6 font-semibold text-foreground">{name}</p>
      </div>
      <div className="h-6 bg-linear-to-b from-background to-transparent" />
    </div>
  );
}
