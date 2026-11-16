'use client';

import { Check, Copy, Terminal } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

export function InstallCommand({ command, className }: { command: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={clsx('overflow-hidden bg-white/5 p-0.5 ring-1 ring-white/15 forced-colors:outline', className)}>
      <div className="flex items-center justify-between gap-6 bg-white/10 p-1 pr-3 font-mono text-sm/7 text-white inset-ring-1 inset-ring-white/10">
        <div className="flex min-w-0 items-center gap-2 pl-3">
          <Terminal className="size-4 shrink-0 text-current/60" aria-hidden />
          <code className="truncate">{command}</code>
        </div>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? 'Copied' : 'Copy command'}
          className="relative isolate hidden size-4 shrink-0 cursor-pointer items-center justify-center before:absolute before:-inset-1 before:-z-10 before:transition-colors before:duration-300 hover:before:bg-white/15 motion-reduce:before:transition-none sm:flex"
        >
          {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
        </button>
      </div>
    </div>
  );
}
