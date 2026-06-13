'use client';

import { useSyncExternalStore } from 'react';

// Tailwind lg breakpoint is 1024px; mobile is below that.
const MOBILE_QUERY = '(max-width: 1023px)';

function subscribe(callback: () => void) {
  const mediaQuery = window.matchMedia(MOBILE_QUERY);
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
}

function getSnapshot() {
  return window.matchMedia(MOBILE_QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

export function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
