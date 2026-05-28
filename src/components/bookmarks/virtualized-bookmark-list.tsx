'use client';

import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { useRef, useState, useEffect } from 'react';
import { Bookmark } from '@/types/pinboard';
import { BookmarkListItem } from './bookmark-list-item';

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
  const [scrollMargin, setScrollMargin] = useState(0);

  useEffect(() => {
    if (parentRef.current) {
      setScrollMargin(parentRef.current.offsetTop);
    }
  }, []);

  const virtualizer = useWindowVirtualizer({
    count: bookmarks.length,
    estimateSize: () => 80,
    measureElement: (el) => el.getBoundingClientRect().height,
    overscan: 5,
    scrollMargin,
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
            data-index={virtualItem.index}
            ref={virtualizer.measureElement}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start - scrollMargin}px)`,
            }}
          >
            <BookmarkListItem
              bookmark={bookmarks[virtualItem.index]}
              index={virtualItem.index}
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
  return 75;
}
