'use client';

import { Check, Copy, Terminal } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import clsx from 'clsx';

export function InstallCommand({
  command,
  variant = 'normal',
  className,
  children,
}: {
  command: string;
  /** `overlay` sits on the dark footer whatever the theme. */
  variant?: 'normal' | 'overlay';
  className?: string;
  /** `command` as Shiki tokens, highlighted on the server so the client bundle carries no highlighter. */
  children?: ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className={clsx(
        'overflow-hidden p-0.5 ring-1 forced-colors:outline',
        variant === 'normal' && 'bg-zinc-50 shadow-lg ring-zinc-950/10 dark:bg-white/5 dark:shadow-none dark:ring-white/15',
        variant === 'overlay' && 'bg-white/5 ring-white/15',
        className,
      )}
    >
      <div
        className={clsx(
          'flex items-center justify-between gap-6 p-1 pr-3 font-mono text-sm/7 inset-ring-1',
          variant === 'normal' &&
            'bg-white text-zinc-800 inset-ring-black/10 dark:bg-white/10 dark:text-white dark:inset-ring-white/10',
          variant === 'overlay' && 'bg-white/10 text-white inset-ring-white/10',
        )}
      >
        <div className="flex min-w-0 items-center gap-2 pl-3">
          <Terminal className="size-4 shrink-0 text-current/60" aria-hidden />
          <code className={clsx('truncate', children && 'shiki')}>{children ?? command}</code>
        </div>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? 'Copied' : 'Copy command'}
          className={clsx(
            'relative isolate hidden size-4 shrink-0 cursor-pointer items-center justify-center before:absolute before:-inset-1 before:-z-10 before:transition-colors before:duration-300 motion-reduce:before:transition-none sm:flex',
            variant === 'normal' ? 'hover:before:bg-zinc-950/10 dark:hover:before:bg-white/15' : 'hover:before:bg-white/15',
          )}
        >
          {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
        </button>
      </div>
    </div>
  );
}
