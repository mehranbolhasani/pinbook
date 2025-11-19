'use client';

import { useEffect } from 'react';

export function ThemePaletteApplier() {
  useEffect(() => {
    try {
      const stored = localStorage.getItem('pinbook-theme-vars');
      if (!stored) return;
      const colors = JSON.parse(stored) as Record<string, string>;
      Object.entries(colors).forEach(([key, value]) => {
        const cssVar = `--${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`;
        document.documentElement.style.setProperty(cssVar, value);
      });
    } catch {}
  }, []);

  return null;
}
