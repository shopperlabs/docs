'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { buttons } from '@/components/home/sections';

// The not-found boundary gets no params: the version comes from the address, the current release outside any.
export function PageNotFound({ homes }: { homes: { id: string; href: string }[] }) {
  const pathname = usePathname();
  const version = homes.find(({ id }) => pathname === `/${id}` || pathname.startsWith(`/${id}/`)) ?? homes[0];

  return (
    <article className="w-full max-w-3xl min-w-0 flex-1 animate-page-enter">
      <p className="font-mono text-sm/6 font-medium tracking-wide text-primary uppercase">404</p>
      <h1 className="mt-2 text-3xl/tight font-medium tracking-tight text-balance text-foreground sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-3 text-lg/7 text-pretty text-muted-foreground sm:text-base/7">
        The {version.id} documentation has no page at this address. Pick another version in the menu at the top, or
        start again from the {version.id} documentation.
      </p>
      <div className="mt-8">
        <Link href={version.href} className={buttons.solid}>
          Go to the {version.id} documentation
        </Link>
      </div>
    </article>
  );
}
