'use client';

import { useMemo } from 'react';
import { Bookmark } from '@/types/pinboard';
import { useUIStore } from '@/lib/stores/ui';

export function useFilteredBookmarks(bookmarks: Bookmark[]) {
  const { searchQuery, selectedTags, selectedFolderId, sortBy, sortOrder } = useUIStore();

  const filteredAndSortedBookmarks = useMemo(() => {
    let filtered = [...bookmarks];

    // Filter by folder
    if (selectedFolderId !== null) {
      filtered = filtered.filter(bookmark => bookmark.folderId === selectedFolderId);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(bookmark => 
        bookmark.title.toLowerCase().includes(query) ||
        bookmark.description.toLowerCase().includes(query) ||
        bookmark.url.toLowerCase().includes(query) ||
        bookmark.extended.toLowerCase().includes(query)
      );
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(bookmark => 
        selectedTags.some(tag => bookmark.tags.includes(tag))
      );
    }

    // Sort bookmarks
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

    return filtered;
  }, [bookmarks, searchQuery, selectedTags, selectedFolderId, sortBy, sortOrder]);

  return filteredAndSortedBookmarks;
}
