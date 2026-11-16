'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { MobileDrawer } from './mobile-drawer';
import { RailShell } from './rail-shell';
import { scopeFor, type TreeNode } from './tree';

export function DocsShell({ tree, stars, children }: { tree: TreeNode[]; stars?: number; children: ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const scope = useMemo(() => scopeFor(tree, pathname), [tree, pathname]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // The router aligns the top of the new segment, which starts under the
  // sticky header: a forward navigation lands ~26px down instead of at 0.
  // Back navigation keeps its position.
  const restoringRef = useRef(false);
  useEffect(() => {
    function onPopState() {
      restoringRef.current = true;
    }
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    if (restoringRef.current) {
      restoringRef.current = false;
      return;
    }
    if (window.location.hash) return;

    // The router and streamed content move the scroll for up to a second
    // after navigating, so the top is held over that window and any user
    // input releases it.
    let pinning = true;
    const release = () => {
      pinning = false;
    };
    window.addEventListener('wheel', release, { passive: true, once: true });
    window.addEventListener('touchstart', release, { passive: true, once: true });
    window.addEventListener('keydown', release, { once: true });

    const deadline = performance.now() + 1000;
    let frame = 0;
    function pin(now: number) {
      if (!pinning) return;
      if (window.scrollY !== 0) window.scrollTo(0, 0);
      if (now < deadline) frame = requestAnimationFrame(pin);
    }
    frame = requestAnimationFrame(pin);

    return () => {
      pinning = false;
      cancelAnimationFrame(frame);
      window.removeEventListener('wheel', release);
      window.removeEventListener('touchstart', release);
      window.removeEventListener('keydown', release);
    };
  }, [pathname]);

  return (
    // `data-sections` adds the sections bar to the sticky offsets in global.css.
    <div className="min-h-dvh" data-sections={scope.tabs.length > 1 ? '' : undefined}>
      <RailShell
        tree={tree}
        stars={stars}
        nodes={scope.nodes}
        sectionName={scope.tab.name}
        onMenuClick={() => setDrawerOpen(true)}
        drawerOpen={drawerOpen}
        home={scope.home}
      >
        {children}
      </RailShell>

      <MobileDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        tree={tree}
        nodes={scope.nodes}
      />
    </div>
  );
}
