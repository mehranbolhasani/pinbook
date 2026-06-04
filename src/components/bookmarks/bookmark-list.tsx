'use client';

import { memo } from 'react';
import { BookmarkListView } from './views/bookmark-list-view';
import { VirtualizedBookmarkList, useVirtualizationThreshold } from './virtualized-bookmark-list';
import { BookmarkListSkeleton } from './bookmark-skeleton';
import { Bookmark } from '@/types/pinboard';
import { useUIStore } from '@/lib/stores/ui';
import { Button } from '@/components/ui/button';
import { BookmarkX, BookmarkPlus } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';

import { usePaginatedBookmarks } from '@/hooks/usePaginatedBookmarks';

interface BookmarkListProps {
  bookmarks: Bookmark[];
  isLoading: boolean;
  onEditBookmark?: (bookmark: Bookmark) => void;
  onDeleteBookmark?: (bookmark: Bookmark) => void;
}

export const BookmarkList = memo(function BookmarkList({ bookmarks, isLoading, onEditBookmark, onDeleteBookmark }: BookmarkListProps) {
  const {
    searchQuery,
    selectedTags,
    setSearchQuery,
    setSelectedTags,
    setPage,
  } = useUIStore();

  const virtualizationThreshold = useVirtualizationThreshold();

  const {
    bookmarks: paginatedBookmarks,
    totalCount,
    pageCount,
    currentPage,
    pageSize,
  } = usePaginatedBookmarks(bookmarks);

  if (isLoading) {
    return <BookmarkListSkeleton count={6} />;
  }

  if (totalCount === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-4">
          {searchQuery || selectedTags.length > 0 ? (
            <>
              <BookmarkX className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No bookmarks found</h3>
              <p className="text-sm">
                Try adjusting your search or filters
              </p>
              <div className="mt-4 space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTags([]);
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            </>
          ) : (
            <>
              <BookmarkPlus className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No bookmarks yet</h3>
              <p className="text-sm">
                Start by adding your first bookmark
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  const shouldUseVirtualization = paginatedBookmarks.length > virtualizationThreshold;

  const renderBookmarks = () => {
    if (shouldUseVirtualization) {
      return (
        <VirtualizedBookmarkList
          bookmarks={paginatedBookmarks}
          onEditBookmark={onEditBookmark}
          onDeleteBookmark={onDeleteBookmark}
        />
      );
    }

    return (
      <BookmarkListView
        bookmarks={paginatedBookmarks}
        onEdit={onEditBookmark!}
        onDelete={onDeleteBookmark!}
      />
    );
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="mb-32">

      {renderBookmarks()}

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {startItem}-{endItem} of {totalCount} bookmarks
          {searchQuery && ` for "${searchQuery}"`}
          {selectedTags.length > 0 && ` with tags: ${selectedTags.join(', ')}`}
        </div>

        <Pagination
          currentPage={currentPage}
          pageCount={pageCount}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
});
