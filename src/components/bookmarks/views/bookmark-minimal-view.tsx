'use client';

import { memo } from 'react';
import { Bookmark } from '@/types/pinboard';
import { BookmarkMinimalItem } from '../bookmark-minimal-item';

interface BookmarkMinimalViewProps {
  bookmarks: Bookmark[];
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (bookmark: Bookmark) => void;
}

export const BookmarkMinimalView = memo(function BookmarkMinimalView({ bookmarks, onEdit, onDelete }: BookmarkMinimalViewProps) {
  return (
    <div key={`minimal-${bookmarks.length}`} className="space-y-1">
      {bookmarks.map((bookmark) => (
        <div key={bookmark.id}>
          <BookmarkMinimalItem
            bookmark={bookmark}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      ))}
    </div>
  );
});
