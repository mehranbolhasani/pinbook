'use client';

import { motion } from 'framer-motion';
import { Bookmark } from '@/types/pinboard';
import { BookmarkCard } from '../bookmark-card';

interface BookmarkCardViewProps {
  bookmarks: Bookmark[];
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (bookmark: Bookmark) => void;
}

export function BookmarkCardView({ bookmarks, onEdit, onDelete }: BookmarkCardViewProps) {
  return (
    <div key={`card-${bookmarks.length}`} className="columns-1 md:columns-2 lg:columns-2 gap-4 space-y-4">
      {bookmarks.map((bookmark) => (
        <motion.div
          key={bookmark.id}
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="break-inside-avoid mb-4"
        >
          <BookmarkCard
            bookmark={bookmark}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </motion.div>
      ))}
    </div>
  );
}
