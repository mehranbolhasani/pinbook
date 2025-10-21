'use client';

import { useMemo } from 'react';
// import { BookmarkCard } from './bookmark-card';
import { BookmarkListView } from './bookmark-list-view';
import { BookmarkMinimalView } from './bookmark-minimal-view';
import { BookmarkMasonryView } from './bookmark-masonry-view';
import { BookmarkToolbar } from './bookmark-toolbar';
import { SelectionModeToggle } from './selection-mode-toggle';
import { BulkActionsToolbar } from './bulk-actions-toolbar';
import { Bookmark } from '@/types/pinboard';
import { useBookmarkStore } from '@/lib/stores/bookmarks';
import { Button } from '@/components/ui/button';

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

  const renderBookmarks = () => {
    switch (layout) {
      case 'list':
        return (
          <BookmarkListView
            bookmarks={filteredAndSortedBookmarks}
            onEdit={onEditBookmark}
            onDelete={onDeleteBookmark}
          />
        );
      case 'minimal':
        return (
          <BookmarkMinimalView
            bookmarks={filteredAndSortedBookmarks}
            onEdit={onEditBookmark}
            onDelete={onDeleteBookmark}
          />
        );
      case 'card':
      default:
        return (
          <BookmarkMasonryView
            bookmarks={filteredAndSortedBookmarks}
            onEdit={onEditBookmark}
            onDelete={onDeleteBookmark}
          />
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
