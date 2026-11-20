import clsx from 'clsx';
import { useId, type ComponentPropsWithoutRef, type ReactNode } from 'react';

// Card with an inset body: header and footer sit on the soft background, the
// body is laid on top of it with a concentric radius (2xl minus inset).
export function SoftCard({
  title,
  description,
  action,
  header,
  footer,
  className,
  children,
  ...props
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  /** Replaces the title block when the header is a control bar. */
  header?: ReactNode;
  footer?: ReactNode;
} & ComponentPropsWithoutRef<'section'>) {
  // A <section> is only a landmark once it has a name, so the heading names it.
  const titleId = useId();

  return (
    <section
      aria-labelledby={title ? titleId : undefined}
      {...props}
      className={clsx(
        className,
        'group flex flex-col rounded-2xl bg-muted/70 [--card-inset:--spacing(1)] [--card-px:--spacing(6)] [--card-section-px:calc(var(--card-px)-var(--card-inset))] [--card-section-py:var(--card-px)] dark:bg-zinc-800/50 [:where(&)]:py-(--card-inset)',
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-4 [:where(&)]:px-(--card-px) [:where(&)]:py-4">
        {header ?? (
          <div className="min-w-0 flex-1 basis-64">
            <h3 id={titleId} className="text-base/6 font-semibold text-zinc-950 sm:text-sm/6 dark:text-white">
              {title}
            </h3>
            {description && (
              <p className="mt-0.5 text-base/6 text-pretty text-zinc-600 sm:text-sm/6 dark:text-zinc-400">
                {description}
              </p>
            )}
          </div>
        )}
        {action && <div className="flex shrink-0 items-center gap-3 whitespace-nowrap">{action}</div>}
      </header>
      <div className="mx-(--card-inset) flex-1 overflow-hidden rounded-[calc(var(--radius-2xl)-var(--spacing))] bg-white shadow-[0_1px_2px_0_rgba(25,28,33,0.06),0_0_2px_0_rgba(0,0,0,0.08)] ring-1 ring-zinc-950/5 dark:bg-black/40 dark:shadow-none dark:ring-white/5">
        {children}
      </div>
      {footer && <footer className="[:where(&)]:px-(--card-px) [:where(&)]:pt-4 [:where(&)]:pb-3">{footer}</footer>}
    </section>
  );
}
