'use client';

import { useEffect, useCallback } from 'react';

interface KeyboardShortcutsOptions {
  onSearch?: () => void;
  onAddBookmark?: () => void;
  onCloseDialog?: () => void;
  onNavigate?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onOpenSelected?: () => void;
  onEditSelected?: () => void;
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

    // Escape only when a dialog is open
    if (event.key === 'Escape') {
      if (isDialogOpen && onCloseDialog) {
        event.preventDefault();
        onCloseDialog();
      }
      return;
    }

    // Help shortcut: Shift+/ to avoid blocking find-in-page
    if (event.shiftKey && event.key === '?') {
      event.preventDefault();
      onShowHelp?.();
      return;
    }

    // Only trigger navigation shortcuts when no dialog is open
    if (!isDialogOpen) {
      switch (event.key) {
        case 'ArrowUp':
          if (onNavigate) {
            event.preventDefault();
            onNavigate('up');
          }
          break;
        case 'ArrowDown':
          if (onNavigate) {
            event.preventDefault();
            onNavigate('down');
          }
          break;
        case 'ArrowLeft':
          if (onNavigate) {
            event.preventDefault();
            onNavigate('left');
          }
          break;
        case 'ArrowRight':
          if (onNavigate) {
            event.preventDefault();
            onNavigate('right');
          }
          break;
        case 'Enter':
          if (onOpenSelected) {
            event.preventDefault();
            onOpenSelected();
          }
          break;
        case 'e':
        case 'E':
          if (onEditSelected) {
            event.preventDefault();
            onEditSelected();
          }
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
    onShowHelp,
    isDialogOpen
  ]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
