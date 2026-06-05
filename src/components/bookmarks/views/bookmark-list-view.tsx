'use client';

import { memo } from 'react';
import { Bookmark } from '@/types/pinboard';
import { BookmarkListItem } from '../bookmark-list-item';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface BookmarkListViewProps {
  bookmarks: Bookmark[];
  counterStart: number;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (bookmark: Bookmark) => void;
}

export const BookmarkListView = memo(function BookmarkListView({ bookmarks, counterStart, onEdit, onDelete }: BookmarkListViewProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className="flex flex-col" style={{ counterReset: `bkmrk ${counterStart - 1}` }}>
        {bookmarks.map((bookmark) => (
          <BookmarkListItem
            key={bookmark.id}
            bookmark={bookmark}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ counterReset: `bkmrk ${counterStart - 1}` }}>
      {bookmarks.map((bookmark, index) => (
        <BookmarkListItem
          key={bookmark.id}
          bookmark={bookmark}
          index={index}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
});
