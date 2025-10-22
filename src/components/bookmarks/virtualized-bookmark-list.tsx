'use client';

import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import { Bookmark } from '@/types/pinboard';
import { BookmarkCard } from './bookmark-card';
import { BookmarkMinimalView } from './bookmark-minimal-view';
import { BookmarkListView } from './bookmark-list-view';
// import { useBookmarkStore } from '@/lib/stores/bookmarks';

interface VirtualizedBookmarkListProps {
  bookmarks: Bookmark[];
  onEditBookmark?: (bookmark: Bookmark) => void;
  onDeleteBookmark?: (bookmark: Bookmark) => void;
  layout: 'card' | 'list' | 'minimal';
  className?: string;
}

export function VirtualizedBookmarkList({
  bookmarks,
  onEditBookmark,
  onDeleteBookmark,
  layout,
  className = ''
}: VirtualizedBookmarkListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  // const { selectedBookmarks } = useBookmarkStore();

  // Calculate item height based on layout
  const getItemHeight = (layout: string) => {
    switch (layout) {
      case 'minimal':
        return 60; // Minimal list items
      case 'list':
        return 80; // List view items
      case 'card':
        return 200; // Card items (approximate)
      default:
        return 80;
    }
  };

  const itemHeight = getItemHeight(layout);

  const virtualizer = useVirtualizer({
    count: bookmarks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan: 5, // Render 5 extra items for smooth scrolling
  });

  const items = virtualizer.getVirtualItems();

  const renderBookmark = (bookmark: Bookmark) => {
    
    switch (layout) {
      case 'minimal':
        return (
          <BookmarkMinimalView
            key={bookmark.id}
            bookmarks={[bookmark]}
            onEdit={onEditBookmark}
            onDelete={onDeleteBookmark}
          />
        );
      case 'list':
        return (
          <BookmarkListView
            key={bookmark.id}
            bookmarks={[bookmark]}
            onEdit={onEditBookmark}
            onDelete={onDeleteBookmark}
          />
        );
      case 'card':
        return (
          <BookmarkCard
            key={bookmark.id}
            bookmark={bookmark}
            onEdit={onEditBookmark}
            onDelete={onDeleteBookmark}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={parentRef}
      className={`h-full overflow-auto ${className}`}
      style={{
        contain: 'strict', // Optimize for virtualization
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {items.map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderBookmark(bookmarks[virtualItem.index])}
          </div>
        ))}
      </div>
    </div>
  );
}

// Hook for determining when to use virtualization
export function useVirtualizationThreshold() {
  return 100; // Use virtualization when more than 100 bookmarks
}

// Performance monitoring hook
export function useVirtualizationPerformance() {
  const [metrics, setMetrics] = React.useState({
    renderTime: 0,
    itemCount: 0,
    visibleItems: 0,
  });

  const measurePerformance = useCallback((itemCount: number, visibleItems: number) => {
    const start = performance.now();
    
    // Use requestAnimationFrame to measure actual render time
    requestAnimationFrame(() => {
      const end = performance.now();
      setMetrics({
        renderTime: end - start,
        itemCount,
        visibleItems,
      });
    });
  }, []);

  return { metrics, measurePerformance };
}

import React, { useCallback } from 'react';
