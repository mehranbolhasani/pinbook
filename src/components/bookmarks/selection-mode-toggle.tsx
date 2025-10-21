'use client';

import { Button } from '@/components/ui/button';
import { CheckSquare, Square } from 'lucide-react';
import { useBookmarkStore } from '@/lib/stores/bookmarks';

export function SelectionModeToggle() {
  const { isSelectionMode, toggleSelectionMode } = useBookmarkStore();

  return (
    <Button
      variant={isSelectionMode ? "default" : "outline"}
      size="sm"
      onClick={toggleSelectionMode}
      className="gap-2"
    >
      {isSelectionMode ? (
        <>
          <CheckSquare className="h-4 w-4" />
          Selection Mode
        </>
      ) : (
        <>
          <Square className="h-4 w-4" />
          Select
        </>
      )}
    </Button>
  );
}
