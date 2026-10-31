'use client';

import clsx from 'clsx';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { TouchTarget } from '@/components/ui/touch-target';

const THEMES = [
  { value: 'system', label: 'System', icon: Monitor },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
];

export function ThemeMenu() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // The stored choice is only readable on the client: the server renders the default, System.
  const current = THEMES.find((option) => option.value === (mounted ? theme : 'system')) ?? THEMES[0];

  return (
    <Menu>
      <MenuButton
        aria-label={`Theme: ${current.label}`}
        className="group relative flex shrink-0 items-center justify-center rounded-lg p-2 focus:outline-hidden data-focus:ring-2 data-focus:ring-brand/50"
      >
        <TouchTarget />
        <current.icon
          className="size-4 text-zinc-500 group-hover:text-zinc-700 dark:text-zinc-400 dark:group-hover:text-zinc-200"
          aria-hidden
        />
      </MenuButton>
      <MenuItems
        anchor={{ to: 'bottom end', gap: 1 }}
        transition
        className="z-50 min-w-32 origin-top-right rounded-2xl border border-zinc-200 bg-white p-1 shadow-xl shadow-zinc-500/5 transition duration-100 ease-out focus:outline-hidden data-closed:scale-95 data-closed:opacity-0 dark:border-white/10 dark:bg-zinc-950 dark:shadow-none"
      >
        {THEMES.map((option) => {
          const active = option.value === current.value;
          return (
            <MenuItem key={option.value}>
              <button
                type="button"
                onClick={() => setTheme(option.value)}
                className={clsx(
                  'flex w-full items-center justify-between gap-2 rounded-xl p-2 text-sm/5 data-focus:bg-zinc-950/5 dark:data-focus:bg-white/5',
                  active ? 'font-medium text-primary' : 'text-zinc-950/70 dark:text-white/70',
                )}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <option.icon className="size-4 shrink-0" aria-hidden />
                  {option.label}
                </span>
                {active ? <Check className="size-3.5 shrink-0" aria-hidden /> : null}
              </button>
            </MenuItem>
          );
        })}
      </MenuItems>
    </Menu>
  );
}
