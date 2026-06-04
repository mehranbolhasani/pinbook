'use client';

import { useMemo, useEffect } from 'react';
import { Bookmark } from '@/types/pinboard';
import { useUIStore } from '@/lib/stores/ui';
import { useFilteredBookmarks } from './useFilteredBookmarks';

const DEFAULT_PAGE_SIZE = 20;

export function usePaginatedBookmarks(bookmarks: Bookmark[]) {
  const { page, setPage, searchQuery, selectedTags, sortBy, sortOrder } = useUIStore();

  const filteredAndSortedBookmarks = useFilteredBookmarks(bookmarks);

  // Reset to page 1 when filters or sort change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedTags, sortBy, sortOrder, setPage]);

  const totalCount = filteredAndSortedBookmarks.length;
  const pageCount = Math.max(1, Math.ceil(totalCount / DEFAULT_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);

  const paginatedBookmarks = useMemo(() => {
    const start = (currentPage - 1) * DEFAULT_PAGE_SIZE;
    const end = start + DEFAULT_PAGE_SIZE;
    return filteredAndSortedBookmarks.slice(start, end);
  }, [filteredAndSortedBookmarks, currentPage]);

  return {
    bookmarks: paginatedBookmarks,
    totalCount,
    pageCount,
    currentPage,
    pageSize: DEFAULT_PAGE_SIZE,
  };
}
