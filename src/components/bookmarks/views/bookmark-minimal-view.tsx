'use client';

import { Bookmark } from '@/types/pinboard';
import { BookmarkMinimalItem } from '../bookmark-minimal-item';
import { AnimatedList, AnimatedListItem } from '@/components/ui/animated-container';

interface BookmarkMinimalViewProps {
  bookmarks: Bookmark[];
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (bookmark: Bookmark) => void;
}

export function BookmarkMinimalView({ bookmarks, onEdit, onDelete }: BookmarkMinimalViewProps) {
  return (
    <AnimatedList key={`minimal-${bookmarks.length}`} className="space-y-1">
      {bookmarks.map((bookmark) => (
        <AnimatedListItem key={bookmark.id}>
          <BookmarkMinimalItem
            bookmark={bookmark}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </AnimatedListItem>
      ))}
    </AnimatedList>
  );
}
