'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';
import { SidebarNav } from './sidebar-nav';
import type { TreeNode } from './tree';

export function Sidebar({
  nodes,
  onNavigate,
  header,
  intro,
  className,
  navClassName,
}: {
  nodes: TreeNode[];
  onNavigate?: () => void;
  /** Stuck at the top of the scrolling area. */
  header?: ReactNode;
  /** Rendered in the flow, above the tree. */
  intro?: ReactNode;
  className?: string;
  navClassName?: string;
}) {
  return (
    <div className={clsx('relative flex h-full flex-col', className)}>
      {/* The stuck block lives in the scrolling container, otherwise nothing passes behind it and its fade has nothing to fade. */}
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
        {header}
        <div className={navClassName}>
          {intro}
          {nodes.length > 0 ? <SidebarNav nodes={nodes} onNavigate={onNavigate} /> : null}
        </div>
      </div>

      {/* The only hint that entries remain, the scrollbar being hidden. Laid on the background, so it stays invisible when nothing overflows. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-background to-transparent"
      />
    </div>
  );
}
