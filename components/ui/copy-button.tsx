'use client';

import { useCopyButton } from 'fumadocs-ui/utils/use-copy-button';
import { Check, Copy } from 'lucide-react';
import { TouchTarget } from './touch-target';

export function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, onClick] = useCopyButton(() => navigator.clipboard.writeText(text));

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={copied ? 'Copied' : label}
      className="relative inline-flex size-7 shrink-0 cursor-pointer items-center justify-center text-fd-muted-foreground transition-colors duration-200 hover:bg-zinc-950/5 hover:text-fd-foreground focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-hidden dark:hover:bg-white/10 dark:focus-visible:ring-brand-400"
    >
      <TouchTarget />
      {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
    </button>
  );
}
