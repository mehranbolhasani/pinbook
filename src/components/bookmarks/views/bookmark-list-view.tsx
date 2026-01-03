'use client';

import { memo } from 'react';
import { Bookmark } from '@/types/pinboard';
import { BookmarkListItem } from '../bookmark-list-item';

interface BookmarkListViewProps {
  bookmarks: Bookmark[];
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (bookmark: Bookmark) => void;
}

export const BookmarkListView = memo(function BookmarkListView({ bookmarks, onEdit, onDelete }: BookmarkListViewProps) {
  return (
    <div key={`list-${bookmarks.length}`} className="space-y-2 p-4">
      {bookmarks.map((bookmark) => (
        <div key={bookmark.id}>
          <BookmarkListItem
            bookmark={bookmark}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      ))}
    </div>
  );
});
