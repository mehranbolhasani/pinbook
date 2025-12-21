'use client';

import { memo } from 'react';
import { Bookmark } from '@/types/pinboard';
import { BookmarkCard } from '../bookmark-card';

interface BookmarkCardViewProps {
  bookmarks: Bookmark[];
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (bookmark: Bookmark) => void;
}

export const BookmarkCardView = memo(function BookmarkCardView({ bookmarks, onEdit, onDelete }: BookmarkCardViewProps) {
  return (
    <div 
      key={`card-${bookmarks.length}`} 
      className="columns-1 md:columns-2 lg:columns-2 gap-4 space-y-4"
    >
      {bookmarks.map((bookmark) => (
        <div key={bookmark.id} className="break-inside-avoid mb-4">
          <BookmarkCard
            bookmark={bookmark}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      ))}
    </div>
  );
});
