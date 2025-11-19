'use client';

import { Bookmark } from '@/types/pinboard';
import { BookmarkMinimalView as BookmarkMinimalItem } from '../bookmark-minimal-view';
import { AnimatedList, AnimatedListItem } from '@/components/ui/animated-container';

interface BookmarkMinimalViewProps {
  bookmarks: Bookmark[];
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (bookmark: Bookmark) => void;
}

export function BookmarkMinimalView({ bookmarks, onEdit, onDelete }: BookmarkMinimalViewProps) {
  return (
    <AnimatedList key={`minimal-${bookmarks.length}`}>
      {bookmarks.map((bookmark) => (
        <AnimatedListItem key={bookmark.id}>
          <BookmarkMinimalItem
            bookmarks={[bookmark]}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </AnimatedListItem>
      ))}
    </AnimatedList>
  );
}
