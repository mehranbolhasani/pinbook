'use client';

import { useMemo } from 'react';
import { Bookmark } from '@/types/pinboard';
import { useUIStore } from '@/lib/stores/ui';

export function useFilteredBookmarks(bookmarks: Bookmark[]) {
  const { searchQuery, selectedTags } = useUIStore();

  const filteredBookmarks = useMemo(() => {
    if (bookmarks.length === 0) {
      return [];
    }

    let filtered = [...bookmarks];

    if (selectedTags.length > 0) {
      filtered = filtered.filter(bookmark => 
        selectedTags.some(tag => bookmark.tags.includes(tag))
      );
      if (filtered.length === 0) {
        return [];
      }
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(bookmark => 
        bookmark.title.toLowerCase().includes(query) ||
        bookmark.description?.toLowerCase().includes(query) ||
        bookmark.url.toLowerCase().includes(query) ||
        bookmark.extended?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [bookmarks, searchQuery, selectedTags]);

  return filteredBookmarks;
}
