'use client';

import { Bookmark } from '@/types/pinboard';
import { BookmarkListItem } from '../bookmark-list-item';
import { AnimatedList, AnimatedListItem } from '@/components/ui/animated-container';

interface BookmarkListViewProps {
  bookmarks: Bookmark[];
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (bookmark: Bookmark) => void;
}

export function BookmarkListView({ bookmarks, onEdit, onDelete }: BookmarkListViewProps) {
  return (
    <AnimatedList key={`list-${bookmarks.length}`} className="space-y-2">
      {bookmarks.map((bookmark) => (
        <AnimatedListItem key={bookmark.id}>
          <BookmarkListItem
            bookmark={bookmark}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </AnimatedListItem>
      ))}
    </AnimatedList>
  );
}
