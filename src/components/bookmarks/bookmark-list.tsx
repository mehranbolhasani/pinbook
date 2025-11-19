'use client';

import { useMemo } from 'react';
import { BookmarkCardView } from './views/bookmark-card-view';
import { BookmarkListView } from './views/bookmark-list-view';
import { BookmarkMinimalView } from './views/bookmark-minimal-view';
import { MobileBookmarkCard } from './mobile-bookmark-card';
import { VirtualizedBookmarkList, useVirtualizationThreshold } from './virtualized-bookmark-list';
import { BookmarkToolbar } from './bookmark-toolbar';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { BookmarkListSkeleton } from './bookmark-skeleton';
import { AnimatedList, AnimatedListItem } from '@/components/ui/animated-container';
import { Bookmark } from '@/types/pinboard';
import { useUIStore } from '@/lib/stores/ui';
import { Button } from '@/components/ui/button';

interface BookmarkListProps {
  bookmarks: Bookmark[];
  isLoading: boolean;
  onEditBookmark?: (bookmark: Bookmark) => void;
  onDeleteBookmark?: (bookmark: Bookmark) => void;
}

export function BookmarkList({ bookmarks, isLoading, onEditBookmark, onDeleteBookmark }: BookmarkListProps) {
  const { 
    searchQuery, 
    selectedTags, 
    sortBy, 
    sortOrder,
    layout,
    setSearchQuery,
    setSelectedTags,
  } = useUIStore();

  // Check if we should use virtualization (moved to component level)
  const virtualizationThreshold = useVirtualizationThreshold();

  const filteredAndSortedBookmarks = useMemo(() => {
    let filtered = [...bookmarks];

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
    <div>
      {/* Toolbar */}
      <div className="items-center justify-between mb-4 hidden lg:flex">
        <BookmarkToolbar />
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search bookmarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
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
}
