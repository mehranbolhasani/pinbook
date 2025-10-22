'use client';

import { useMemo } from 'react';
// import { BookmarkCard } from './bookmark-card';
import { BookmarkListView } from './bookmark-list-view';
import { BookmarkMinimalView } from './bookmark-minimal-view';
import { BookmarkCard } from './bookmark-card';
import { MobileBookmarkCard } from './mobile-bookmark-card';
import { VirtualizedBookmarkList, useVirtualizationThreshold } from './virtualized-bookmark-list';
import { BookmarkToolbar } from './bookmark-toolbar';
import { SelectionModeToggle } from './selection-mode-toggle';
import { BulkActionsToolbar } from './bulk-actions-toolbar';
import { BookmarkListSkeleton } from './bookmark-skeleton';
import { AnimatedList, AnimatedListItem } from '@/components/ui/animated-container';
import { Bookmark } from '@/types/pinboard';
import { useBookmarkStore } from '@/lib/stores/bookmarks';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface BookmarkListProps {
  onEditBookmark?: (bookmark: Bookmark) => void;
  onDeleteBookmark?: (bookmark: Bookmark) => void;
}

export function BookmarkList({ onEditBookmark, onDeleteBookmark }: BookmarkListProps) {
  const { 
    bookmarks, 
    searchQuery, 
    selectedTags, 
    sortBy, 
    sortOrder,
    layout,
    isLoading,
    selectedBookmarks,
    setSearchQuery,
    setSelectedTags,
    toggleSelectionMode
  } = useBookmarkStore();

  // Check if we should use virtualization (moved to component level)
  const virtualizationThreshold = useVirtualizationThreshold();

  const filteredAndSortedBookmarks = useMemo(() => {
    let filtered = bookmarks;

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
      filtered = filtered.filter(bookmark => {
        // Special handling for 'unread' and 'recent' filters
        if (selectedTags.includes('unread')) {
          return !bookmark.isRead;
        }
        if (selectedTags.includes('recent')) {
          const dayAgo = new Date();
          dayAgo.setDate(dayAgo.getDate() - 1);
          return bookmark.createdAt > dayAgo;
        }
        
        // Regular tag filtering
        return selectedTags.some(tag => bookmark.tags.includes(tag));
      });
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
  }, [bookmarks, searchQuery, selectedTags, sortBy, sortOrder]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-muted rounded-lg"></div>
          </div>
        ))}
      </div>
    );
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

    // Mobile-optimized layout - use CSS classes instead of JS detection
    const isMobile = false; // We'll handle mobile via CSS classes
    
    if (isMobile) {
      return (
        <AnimatedList className="space-y-3">
          {filteredAndSortedBookmarks.map((bookmark) => (
            <AnimatedListItem key={bookmark.id}>
              <MobileBookmarkCard
                bookmark={bookmark}
                onEdit={onEditBookmark}
                onDelete={onDeleteBookmark}
              />
            </AnimatedListItem>
          ))}
        </AnimatedList>
      );
    }

    // Use virtualization for large lists
    if (shouldUseVirtualization) {
      return (
        <VirtualizedBookmarkList
          bookmarks={filteredAndSortedBookmarks}
          onEditBookmark={onEditBookmark}
          onDeleteBookmark={onDeleteBookmark}
          layout={layout}
          className="h-[600px]" // Set a fixed height for virtualization
        />
      );
    }

    switch (layout) {
      case 'list':
        return (
          <AnimatedList>
            {filteredAndSortedBookmarks.map((bookmark) => (
              <AnimatedListItem key={bookmark.id}>
                <BookmarkListView
                  bookmarks={[bookmark]}
                  onEdit={onEditBookmark}
                  onDelete={onDeleteBookmark}
                />
              </AnimatedListItem>
            ))}
          </AnimatedList>
        );
      case 'minimal':
        return (
          <AnimatedList>
            {filteredAndSortedBookmarks.map((bookmark) => (
              <AnimatedListItem key={bookmark.id}>
                <BookmarkMinimalView
                  bookmarks={[bookmark]}
                  onEdit={onEditBookmark}
                  onDelete={onDeleteBookmark}
                />
              </AnimatedListItem>
            ))}
          </AnimatedList>
        );
      case 'card':
      default:
        return (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
            {filteredAndSortedBookmarks.map((bookmark) => (
              <motion.div
                key={bookmark.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="break-inside-avoid mb-4"
              >
                <BookmarkCard
                  bookmark={bookmark}
                  onEdit={onEditBookmark}
                  onDelete={onDeleteBookmark}
                />
              </motion.div>
            ))}
          </div>
        );
    }
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <BookmarkToolbar />
        <SelectionModeToggle />
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
      
      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar 
        selectedCount={selectedBookmarks.size}
        onClose={() => toggleSelectionMode()}
      />
    </div>
  );
}
