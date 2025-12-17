'use client';

import { Bookmark } from '@/types/pinboard';
import { BookmarkCard } from '../bookmark-card';
import { AnimatedList, AnimatedListItem } from '@/components/ui/animated-container';

interface BookmarkCardViewProps {
  bookmarks: Bookmark[];
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (bookmark: Bookmark) => void;
}

export function BookmarkCardView({ bookmarks, onEdit, onDelete }: BookmarkCardViewProps) {
  return (
    <AnimatedList 
      key={`card-${bookmarks.length}`} 
      className="columns-1 md:columns-2 lg:columns-2 gap-4 space-y-4"
    >
      {bookmarks.map((bookmark) => (
        <AnimatedListItem key={bookmark.id} className="break-inside-avoid mb-4">
          <BookmarkCard
            bookmark={bookmark}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </AnimatedListItem>
      ))}
    </AnimatedList>
  );
}
