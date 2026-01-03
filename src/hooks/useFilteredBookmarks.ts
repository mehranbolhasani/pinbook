'use client';

import { useMemo } from 'react';
import { Bookmark } from '@/types/pinboard';
import { useUIStore } from '@/lib/stores/ui';

export function useFilteredBookmarks(bookmarks: Bookmark[]) {
  const { searchQuery, selectedTags, sortBy, sortOrder } = useUIStore();

  const filteredAndSortedBookmarks = useMemo(() => {
    // Early return if no bookmarks
    if (bookmarks.length === 0) {
      return [];
    }

    let filtered = [...bookmarks];

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(bookmark => 
        selectedTags.some(tag => bookmark.tags.includes(tag))
      );
      // Early return if tag filter results in empty array
      if (filtered.length === 0) {
        return [];
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(bookmark => 
        bookmark.title.toLowerCase().includes(query) ||
        bookmark.description?.toLowerCase().includes(query) ||
        bookmark.url.toLowerCase().includes(query) ||
        bookmark.extended?.toLowerCase().includes(query)
      );
    }

    // Sort bookmarks
    if (filtered.length > 0) {
      filtered.sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
          case 'title':
            comparison = a.title.localeCompare(b.title);
            break;
          case 'url':
            comparison = a.url.localeCompare(b.url);
            break;
          case 'date':
          default:
            comparison = a.createdAt.getTime() - b.createdAt.getTime();
            break;
        }
        
        return sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    return filtered;
  }, [bookmarks, searchQuery, selectedTags, sortBy, sortOrder]);

  return filteredAndSortedBookmarks;
}
