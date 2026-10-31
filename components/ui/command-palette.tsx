'use client';

import * as Headless from '@headlessui/react';
import clsx from 'clsx';
import React, { createContext, useContext, useEffect, useId, useRef, useState } from 'react';
import { Search } from 'lucide-react';

const sizes = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
  '3xl': 'sm:max-w-3xl',
};

type PaletteContextValue = {
  filterTerm: string;
  handlers: Map<string, (() => void) | undefined>;
};

const PaletteContext = createContext<PaletteContextValue | null>(null);

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/gu, '');
}

function textOf(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join(' ');
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) return textOf(node.props.children);
  return '';
}

function useResultAnnouncement(list: React.RefObject<HTMLElement | null>, dependency: unknown): string {
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    const count = list.current?.querySelectorAll('[role="option"]').length ?? 0;
    const timer = setTimeout(() => {
      setAnnouncement(count === 0 ? 'No results' : `${count} result${count > 1 ? 's' : ''}`);
    }, 250);

    return () => clearTimeout(timer);
  }, [list, dependency]);

  return announcement;
}

export function CommandPalette({
  size = 'xl',
  placeholder = 'Search...',
  label = 'Search',
  filterTerm,
  className,
  children,
  breadcrumb,
  panel,
  footer,
  query: controlledQuery,
  onQueryChange,
  onChange,
  onTab,
  onBack,
  onEscape,
  ...props
}: {
  size?: keyof typeof sizes;
  placeholder?: string;
  label?: string;
  filterTerm?: string;
  className?: string;
  children: React.ReactNode;
  breadcrumb?: React.ReactNode;
  panel?: React.ReactNode;
  footer?: React.ReactNode;
  query?: string;
  onQueryChange?: (query: string) => void;
  onChange?: (value: string) => void;
  onTab?: (value: string | null) => void;
  onBack?: () => boolean;
  onEscape?: () => boolean;
} & Omit<Headless.DialogProps, 'as' | 'className' | 'children'>) {
  const [uncontrolledQuery, setUncontrolledQuery] = useState('');
  const query = controlledQuery ?? uncontrolledQuery;
  const [handlers] = useState(() => new Map<string, (() => void) | undefined>());
  const list = useRef<HTMLDivElement>(null);
  const footerId = useId();
  const announcement = useResultAnnouncement(list, `${filterTerm ?? query}`);

  function updateQuery(next: string) {
    if (controlledQuery === undefined) setUncontrolledQuery(next);
    onQueryChange?.(next);
  }

  function onKeyDownCapture(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Tab' && !event.shiftKey && onTab) {
      event.preventDefault();
      event.stopPropagation();

      const activeId = event.currentTarget.querySelector('input')?.getAttribute('aria-activedescendant');
      onTab(activeId ? (document.getElementById(activeId)?.dataset.commandValue ?? null) : null);

      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      if (onEscape?.() !== true) props.onClose(false);
      return;
    }

    if (event.key === 'Backspace' && (event.target as HTMLInputElement).value === '' && onBack?.() === true) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  return (
    <Headless.Dialog aria-label={label} {...props} className="relative z-50">
      <Headless.DialogBackdrop
        transition
        className="fixed inset-0 bg-zinc-950/25 transition duration-100 focus:outline-0 data-closed:opacity-0 data-enter:ease-out data-leave:ease-in motion-reduce:duration-0 dark:bg-zinc-950/50"
      />

      <div className="fixed inset-0 w-screen overflow-y-auto p-4 sm:p-6 md:p-20">
        <Headless.DialogPanel
          transition
          onKeyDownCapture={onKeyDownCapture}
          className={clsx(
            className,
            sizes[size],
            'mx-auto w-full divide-y divide-zinc-950/5 overflow-hidden rounded-xl',
            'bg-white dark:divide-white/10 dark:bg-zinc-900',
            'shadow-lg ring-1 ring-zinc-950/10 dark:ring-white/10 dark:ring-inset',
            'forced-colors:outline',
            'transition duration-100 will-change-transform data-closed:translate-y-4 data-closed:opacity-0 data-enter:ease-out data-leave:ease-in motion-reduce:duration-0 sm:data-closed:translate-y-0 sm:data-closed:scale-95',
          )}
        >
          <PaletteContext.Provider value={{ filterTerm: filterTerm ?? query, handlers }}>
            <Headless.Combobox
              immediate
              onChange={(value: string | null) => {
                if (value === null) return;
                handlers.get(value)?.();
                onChange?.(value);
              }}
              onClose={() => updateQuery('')}
            >
              <div className="flex items-center gap-3 px-4">
                <Search
                  aria-hidden
                  className="size-5 shrink-0 text-zinc-500 sm:size-4 dark:text-zinc-400 forced-colors:text-[CanvasText]"
                />

                {breadcrumb}

                <Headless.ComboboxInput
                  autoFocus
                  aria-label={label}
                  aria-describedby={footer ? footerId : undefined}
                  autoComplete="off"
                  placeholder={placeholder}
                  value={query}
                  onChange={(event) => updateQuery(event.target.value)}
                  className={clsx(
                    'min-w-0 flex-1 appearance-none bg-transparent py-4 sm:py-3.5',
                    'text-base/6 sm:text-sm/6',
                    'text-zinc-950 placeholder:text-zinc-500 dark:text-white',
                    'focus:outline-hidden',
                  )}
                />
              </div>

              <Headless.ComboboxOptions
                ref={list}
                static
                className="group/list max-h-[60dvh] scroll-py-2 overflow-y-auto overscroll-contain p-2 empty:hidden sm:max-h-96"
              >
                {children}
              </Headless.ComboboxOptions>

              {panel}

              <span role="status" aria-live="polite" className="sr-only">
                {announcement}
              </span>

              {footer && (
                <div id={footerId} className="px-4 py-2.5">
                  {footer}
                </div>
              )}
            </Headless.Combobox>
          </PaletteContext.Provider>
        </Headless.DialogPanel>
      </div>
    </Headless.Dialog>
  );
}

export function CommandPaletteGroup({
  heading,
  className,
  children,
  ...props
}: { heading?: string } & React.ComponentPropsWithoutRef<'div'>) {
  const headingId = useId();

  return (
    <div
      {...props}
      role={heading ? 'group' : undefined}
      aria-labelledby={heading ? headingId : undefined}
      className={clsx(className, 'not-first:mt-2 not-has-[[role=option]]:hidden')}
    >
      {heading && (
        <div id={headingId} className="px-2 py-1.5 text-xs/5 font-medium text-zinc-500 dark:text-zinc-400">
          {heading}
        </div>
      )}
      {children}
    </div>
  );
}

export function CommandPaletteItem({
  value,
  keywords,
  filter = true,
  onSelect,
  className,
  children,
  ...props
}: {
  value: string;
  keywords?: string;
  filter?: boolean;
  onSelect?: () => void;
  className?: string;
  children?: React.ReactNode;
} & Omit<Headless.ComboboxOptionProps<'div', string>, 'as' | 'className' | 'value' | 'children'>) {
  const context = useContext(PaletteContext);

  useEffect(() => {
    context?.handlers.set(value, onSelect);
    return () => {
      context?.handlers.delete(value);
    };
  });

  const term = normalize(context?.filterTerm.trim() ?? '');
  const haystack = normalize(`${value} ${keywords ?? ''} ${textOf(children)}`);
  if (filter && term !== '' && !haystack.includes(term)) return null;

  return (
    <Headless.ComboboxOption
      {...props}
      value={value}
      data-command-value={value}
      className={clsx(
        className,
        'group flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 sm:py-2',
        'text-base/6 text-zinc-950 sm:text-sm/6 dark:text-white',
        'outline-hidden focus:outline-hidden focus-visible:outline-hidden data-focus:bg-brand-600 data-focus:text-white',
        'data-disabled:cursor-default data-disabled:opacity-50',
        '*:data-[slot=icon]:size-5 *:data-[slot=icon]:shrink-0 sm:*:data-[slot=icon]:size-4',
        '*:data-[slot=icon]:text-zinc-500 data-focus:*:data-[slot=icon]:text-white dark:*:data-[slot=icon]:text-zinc-400',
        '*:data-[slot=avatar]:-my-0.5 *:data-[slot=avatar]:size-6 *:data-[slot=avatar]:shrink-0 sm:*:data-[slot=avatar]:size-5',
        'forced-color-adjust-none forced-colors:text-[CanvasText]',
        'forced-colors:data-focus:bg-[Highlight] forced-colors:data-focus:text-[HighlightText]',
        'forced-colors:*:data-[slot=icon]:text-[CanvasText] forced-colors:data-focus:*:data-[slot=icon]:text-[HighlightText]',
      )}
    >
      {children}
    </Headless.ComboboxOption>
  );
}

export function CommandPaletteLabel({ className, ...props }: React.ComponentPropsWithoutRef<'span'>) {
  return <span data-slot="label" {...props} className={clsx(className, 'min-w-0 flex-1 truncate')} />;
}

export function CommandPaletteDescription({ className, ...props }: React.ComponentPropsWithoutRef<'span'>) {
  return (
    <span
      data-slot="description"
      {...props}
      className={clsx(
        className,
        'shrink-0 truncate text-zinc-500 group-data-focus:text-white dark:text-zinc-400 forced-colors:group-data-focus:text-[HighlightText]',
      )}
    />
  );
}

export function CommandPaletteKbd({ className, ...props }: React.ComponentPropsWithoutRef<'kbd'>) {
  return (
    <kbd
      {...props}
      className={clsx(
        className,
        'inline-flex min-w-5 items-center justify-center rounded border border-zinc-950/10 px-1 py-px font-sans text-xs/5 text-zinc-500 dark:border-white/15 dark:text-zinc-400',
      )}
    />
  );
}

export function CommandPaletteHint({
  keys = '\u21b5',
  className,
  children,
  ...props
}: { keys?: string; className?: string; children: React.ReactNode } & Omit<
  React.ComponentPropsWithoutRef<'span'>,
  'children'
>) {
  return (
    <span
      {...props}
      aria-hidden="true"
      className={clsx(
        className,
        'hidden shrink-0 items-center gap-1.5 text-xs/5 text-zinc-500 group-data-focus:flex group-data-focus:text-white max-sm:group-data-focus:hidden dark:text-zinc-400',
      )}
    >
      <CommandPaletteKbd className="border-current/25 text-inherit">{keys}</CommandPaletteKbd>
      {children}
    </span>
  );
}

export function CommandPaletteShortcut({
  keys,
  className,
  ...props
}: { keys: string | string[]; className?: string } & React.ComponentPropsWithoutRef<'kbd'>) {
  return (
    <kbd {...props} className={clsx(className, 'flex shrink-0')}>
      {(Array.isArray(keys) ? keys : keys.split('')).map((char, index) => (
        <kbd
          key={index}
          className={clsx([
            'min-w-[2ch] text-center font-sans text-zinc-400 capitalize',
            'group-data-focus:text-white forced-colors:group-data-focus:text-[HighlightText]',
            index > 0 && char.length > 1 && 'pl-1',
          ])}
        >
          {char}
        </kbd>
      ))}
    </kbd>
  );
}

export function CommandPaletteEmpty({ className, children, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      {...props}
      className={clsx(
        className,
        'hidden px-6 py-14 text-center text-base/7 text-zinc-500 group-not-has-[[role=option]]/list:block sm:text-sm/6 dark:text-zinc-400',
      )}
    >
      {children}
    </div>
  );
}
