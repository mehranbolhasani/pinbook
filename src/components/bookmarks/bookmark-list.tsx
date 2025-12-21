'use client';

import { memo, useCallback } from 'react';
import { BookmarkCardView } from './views/bookmark-card-view';
import { BookmarkListView } from './views/bookmark-list-view';
import { BookmarkMinimalView } from './views/bookmark-minimal-view';
import { VirtualizedBookmarkList, useVirtualizationThreshold } from './virtualized-bookmark-list';
import { BookmarkToolbar } from './bookmark-toolbar';
import { BookmarkListSkeleton } from './bookmark-skeleton';
import { Bookmark } from '@/types/pinboard';
import { useUIStore } from '@/lib/stores/ui';
import { Button } from '@/components/ui/button';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { PullToRefreshIndicator } from '@/components/ui/pull-to-refresh-indicator';
import { useBookmarks } from '@/hooks/usePinboard';

import { useFilteredBookmarks } from '@/hooks/useFilteredBookmarks';

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
    layout,
    setSearchQuery,
    setSelectedTags,
  } = useUIStore();

  // Pull-to-refresh for mobile
  const { refetch } = useBookmarks();
  const { bind, isRefreshing, pullDistance } = usePullToRefresh({
    onRefresh: async () => {
      await refetch();
    },
    threshold: 80,
  });

  // Check if we should use virtualization (moved to component level)
  const virtualizationThreshold = useVirtualizationThreshold();

  const filteredAndSortedBookmarks = useFilteredBookmarks(bookmarks);


  if (isLoading) {
    return <BookmarkListSkeleton count={6} layout={layout} />;
  }

  if (filteredAndSortedBookmarks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-4">
          {searchQuery || selectedTags.length > 0 ? (
            <>
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

  const shouldUseVirtualization = filteredAndSortedBookmarks.length > virtualizationThreshold;

  const renderBookmarks = () => {
    if (isLoading) {
      return <BookmarkListSkeleton count={6} layout={layout} />;
    }

    // Use virtualization for large lists
    if (shouldUseVirtualization) {
      return (
        <VirtualizedBookmarkList
          bookmarks={filteredAndSortedBookmarks}
          onEditBookmark={onEditBookmark}
          onDeleteBookmark={onDeleteBookmark}
          layout={layout}
        />
      );
    }

    switch (layout) {
      case 'list':
        return (
          <BookmarkListView
            bookmarks={filteredAndSortedBookmarks}
            onEdit={onEditBookmark!}
            onDelete={onDeleteBookmark!}
          />
        );
      case 'minimal':
        return (
          <BookmarkMinimalView
            bookmarks={filteredAndSortedBookmarks}
            onEdit={onEditBookmark!}
            onDelete={onDeleteBookmark!}
          />
        );
      case 'card':
      default:
        return (
          <BookmarkCardView
            bookmarks={filteredAndSortedBookmarks}
            onEdit={onEditBookmark!}
            onDelete={onDeleteBookmark!}
          />
        );
    }
  };

  return (
    <div data-ptr-container {...bind()} className="lg:touch-auto mb-32">
      {/* Pull-to-refresh indicator - mobile only */}
      <div className="lg:hidden">
        <PullToRefreshIndicator
          pullDistance={pullDistance}
          isRefreshing={isRefreshing}
          threshold={80}
        />
      </div>

      {/* Toolbar */}
      <div className="items-center justify-end mb-4 hidden lg:flex">
        <BookmarkToolbar />
      </div>
      
      {/* Results counter */}
      {(searchQuery || selectedTags.length > 0) && (
        <div className="text-sm text-muted-foreground mb-4">
          Showing {filteredAndSortedBookmarks.length} of {bookmarks.length} bookmarks
          {searchQuery && ` for "${searchQuery}"`}
          {selectedTags.length > 0 && ` with tags: ${selectedTags.join(', ')}`}
        </div>
      )}
      
      {/* Bookmarks */}
      {renderBookmarks()}
      
      {/* Selection mode removed */}
    </div>
  );
});
