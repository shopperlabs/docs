'use client';

import { useEffect, useState } from 'react';

/** Shortcut label for the platform, resolved after mount so hydration matches. */
export function useShortcutLabel(key = 'K') {
  const [label, setLabel] = useState(`⌘${key}`);

  useEffect(() => {
    if (!/Mac|iPhone|iPad/.test(navigator.platform)) setLabel(`Ctrl ${key}`);
  }, [key]);

  return label;
}
