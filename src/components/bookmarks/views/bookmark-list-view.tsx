'use client';

import { memo } from 'react';
import { motion } from 'motion/react';
import { Bookmark } from '@/types/pinboard';
import { BookmarkListItem } from '../bookmark-list-item';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { bookmarkList } from '@/lib/animations';

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
    <motion.div
      className="flex flex-col gap-8"
      style={{ counterReset: `bkmrk ${counterStart - 1}` }}
      initial="hidden"
      animate="visible"
      variants={bookmarkList}
    >
      {bookmarks.map((bookmark, index) => (
        <BookmarkListItem
          key={bookmark.id}
          bookmark={bookmark}
          index={index}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </motion.div>
  );
});
