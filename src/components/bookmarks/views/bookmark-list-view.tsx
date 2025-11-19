'use client';

import { Bookmark } from '@/types/pinboard';
import { BookmarkListView as BookmarkListItem } from '../bookmark-list-view';
import { AnimatedList, AnimatedListItem } from '@/components/ui/animated-container';

interface BookmarkListViewProps {
  bookmarks: Bookmark[];
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (bookmark: Bookmark) => void;
}

export function BookmarkListView({ bookmarks, onEdit, onDelete }: BookmarkListViewProps) {
  return (
    <AnimatedList key={`list-${bookmarks.length}`}>
      {bookmarks.map((bookmark) => (
        <AnimatedListItem key={bookmark.id}>
          <BookmarkListItem
            bookmarks={[bookmark]}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </AnimatedListItem>
      ))}
    </AnimatedList>
  );
}
