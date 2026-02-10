'use client';

import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import { Bookmark } from '@/types/pinboard';
import { BookmarkListItem } from './bookmark-list-item';

const LIST_ITEM_HEIGHT = 80;

interface VirtualizedBookmarkListProps {
  bookmarks: Bookmark[];
  onEditBookmark?: (bookmark: Bookmark) => void;
  onDeleteBookmark?: (bookmark: Bookmark) => void;
  className?: string;
}

export function VirtualizedBookmarkList({
  bookmarks,
  onEditBookmark,
  onDeleteBookmark,
  className = ''
}: VirtualizedBookmarkListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useWindowVirtualizer({
    count: bookmarks.length,
    estimateSize: () => LIST_ITEM_HEIGHT,
    overscan: 5,
    scrollMargin: parentRef.current?.offsetTop ?? 0,
  });

  const items = virtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      className={className}
      style={{
        contain: 'strict',
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
              transform: `translateY(${virtualItem.start - virtualizer.options.scrollMargin}px)`,
            }}
          >
            <BookmarkListItem
              bookmark={bookmarks[virtualItem.index]}
              onEdit={onEditBookmark}
              onDelete={onDeleteBookmark}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Hook for determining when to use virtualization
export function useVirtualizationThreshold() {
  return 75; // Use virtualization when more than 75 bookmarks
}
