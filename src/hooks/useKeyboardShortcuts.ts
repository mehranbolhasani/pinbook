'use client';

import { useEffect, useCallback } from 'react';

interface KeyboardShortcutsOptions {
  onSearch?: () => void;
  onAddBookmark?: () => void;
  onCloseDialog?: () => void;
  onNavigate?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onOpenSelected?: () => void;
  onEditSelected?: () => void;
  onToggleRead?: () => void;
  onShowHelp?: () => void;
  isDialogOpen?: boolean;
}

export function useKeyboardShortcuts({
  onSearch,
  onAddBookmark,
  onCloseDialog,
  onNavigate,
  onOpenSelected,
  onEditSelected,
  onToggleRead,
  onShowHelp,
  isDialogOpen = false
}: KeyboardShortcutsOptions) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts if user is typing in an input/textarea
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return;
    }

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const ctrlKey = isMac ? event.metaKey : event.ctrlKey;

    // Global shortcuts (work everywhere)
    if (ctrlKey && event.key === 'k') {
      event.preventDefault();
      onSearch?.();
      return;
    }

    if (ctrlKey && event.key === 'n') {
      event.preventDefault();
      onAddBookmark?.();
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      onCloseDialog?.();
      return;
    }

    if (event.key === '?') {
      event.preventDefault();
      onShowHelp?.();
      return;
    }

    // Only trigger navigation shortcuts when no dialog is open
    if (!isDialogOpen) {
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          onNavigate?.('up');
          break;
        case 'ArrowDown':
          event.preventDefault();
          onNavigate?.('down');
          break;
        case 'ArrowLeft':
          event.preventDefault();
          onNavigate?.('left');
          break;
        case 'ArrowRight':
          event.preventDefault();
          onNavigate?.('right');
          break;
        case 'Enter':
          event.preventDefault();
          onOpenSelected?.();
          break;
        case 'e':
        case 'E':
          event.preventDefault();
          onEditSelected?.();
          break;
        case 'r':
        case 'R':
          event.preventDefault();
          onToggleRead?.();
          break;
      }
    }
  }, [
    onSearch,
    onAddBookmark,
    onCloseDialog,
    onNavigate,
    onOpenSelected,
    onEditSelected,
    onToggleRead,
    onShowHelp,
    isDialogOpen
  ]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
