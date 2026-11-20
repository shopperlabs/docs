import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import type { Sibling } from '@/lib/siblings';

const FOCUS =
  'focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-hidden dark:focus-visible:ring-brand-400';

/**
 * A link that leaves the section becomes a soft card with the section's
 * description, so the change of section shows before the click.
 */
export function PageSiblings({ prev, next }: { prev?: Sibling; next?: Sibling }) {
  if (!prev && !next) return null;

  return (
    <nav
      aria-label="Page navigation"
      className="mt-12 grid items-start gap-8 border-t border-zinc-200 pt-8 sm:grid-cols-2 dark:border-white/10"
    >
      {prev ? (
        <SiblingLink link={prev} direction="prev" label={prev.section ? 'Previous section' : 'Previous'} />
      ) : (
        <span />
      )}
      {next ? (
        <SiblingLink link={next} direction="next" label={next.section ? 'Next section' : 'Next'} />
      ) : (
        <span />
      )}
    </nav>
  );
}

function SiblingLink({ link, direction, label }: { link: Sibling; direction: 'prev' | 'next'; label: string }) {
  const isNext = direction === 'next';
  const Arrow = isNext ? ArrowRight : ArrowLeft;
  const arrow = (
    <Arrow
      className={clsx(
        'size-4 shrink-0 transition-transform duration-200',
        isNext ? 'group-hover/sib:translate-x-0.5' : 'group-hover/sib:-translate-x-0.5',
      )}
      aria-hidden
    />
  );

  return (
    <Link
      href={link.url}
      className={clsx(
        'group/sib flex min-w-0 flex-col',
        isNext && 'sm:items-end sm:text-right',
        link.section
          ? 'gap-1.5 rounded-xl bg-muted/70 p-4 transition-colors duration-200 hover:bg-muted dark:bg-white/4 dark:hover:bg-white/6'
          : 'gap-1 rounded-lg',
        FOCUS,
      )}
    >
      <span className="flex items-center gap-1.5 text-base/6 text-muted-foreground sm:text-sm/6">
        {isNext ? null : arrow}
        {label}
        {isNext ? arrow : null}
      </span>
      <span className="flex max-w-full items-center gap-2 text-lg/7 font-medium text-foreground transition-colors duration-200 group-hover/sib:text-brand-700 sm:text-base/6 dark:group-hover/sib:text-brand-300">
        <span className="truncate">{link.name}</span>
      </span>
      {link.section?.description ? (
        <span className="line-clamp-2 text-base/6 text-muted-foreground sm:text-sm/5">{link.section.description}</span>
      ) : null}
    </Link>
  );
}
