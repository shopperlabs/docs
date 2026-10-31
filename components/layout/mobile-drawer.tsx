'use client';

import { Description, Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { Logo } from './logo';
import { MobileSections } from './mobile-sections';
import { Sidebar } from './sidebar';
import type { TreeNode } from './tree';

/**
 * The small-screen drawer. On top, the sections, version and resources,
 * unfolded in place rather than in a second window over the drawer; below,
 * the tree of the current section.
 */
export function MobileDrawer({
  open,
  onOpenChange,
  tree,
  nodes,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tree: TreeNode[];
  nodes: TreeNode[];
}) {
  const close = () => onOpenChange(false);

  // Past the breakpoint (rotation, wider window) the page shows its own
  // navigation and the drawer is hidden: it closes, otherwise it would stay
  // open and invisible with the page scroll locked.
  useEffect(() => {
    if (!open) return;
    const query = window.matchMedia('(min-width: 64rem)');
    const onChange = () => {
      if (query.matches) onOpenChange(false);
    };
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onClose={close} className="lg:hidden">
      <DialogBackdrop
        transition
        className="fixed inset-0 z-overlay bg-black/50 backdrop-blur-xs transition-opacity duration-200 data-closed:opacity-0"
      />
      <DialogPanel
        transition
        className="fixed inset-y-0 left-0 z-modal flex w-[min(320px,88vw)] flex-col bg-background shadow-2xl transition-transform duration-250 ease-spring data-closed:-translate-x-full dark:shadow-none"
        style={{ paddingLeft: 'env(safe-area-inset-left)' }}
      >
        <DialogTitle className="sr-only">Documentation navigation</DialogTitle>
        <Description className="sr-only">Browse the documentation sections and pages.</Description>

        <div className="flex h-header shrink-0 items-center justify-between border-b border-zinc-100 px-4 dark:border-white/6">
          <Logo />
          <button
            type="button"
            onClick={close}
            aria-label="Close navigation"
            className="inline-flex size-11 items-center justify-center rounded-md text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:outline-hidden"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <div className="min-h-0 flex-1">
          <Sidebar
            nodes={nodes}
            onNavigate={close}
            navClassName="px-4 pt-4 pb-10"
            intro={<MobileSections tree={tree} onNavigate={close} />}
          />
        </div>
      </DialogPanel>
    </Dialog>
  );
}
