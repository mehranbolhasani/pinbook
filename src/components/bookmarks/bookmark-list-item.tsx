'use client';

import { memo } from 'react';
import { motion } from 'motion/react';
import { Bookmark } from '@/types/pinboard';
import { formatDate } from '@/lib/utils';
import { Delete, EditNote } from '@nine-thirty-five/material-symbols-react/rounded/300';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { bookmarkItem } from '@/lib/animations';

interface BookmarkListItemProps {
  bookmark: Bookmark;
  index?: number;
  onEdit?: (bookmark: Bookmark) => void;
  onDelete?: (bookmark: Bookmark) => void;
  animated?: boolean;
}

export const BookmarkListItem = memo(function BookmarkListItem({ bookmark, index = 0, onEdit, onDelete, animated = true }: BookmarkListItemProps) {
  const prefersReducedMotion = useReducedMotion();

  const cardContent = (
    <div data-index={index} className="flex items-center justify-between bg-transparent group/item transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-0">
          <h3 className="font-normal text-md truncate tracking-tight">
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group-hover/item:text-primary hover:underline"
            >
              {bookmark.title}
            </a>
          </h3>
        </div>
        <div className="flex items-center space-x-2 mt-0">
          <span className="text-xs text-foreground/40">
            {formatDate(bookmark.createdAt)}
          </span>
        </div>
      </div>

      <div className="flex items-center shrink-0 gap-1 sm:gap-2 sm:invisible sm:opacity-0 sm:group-hover/item:visible sm:group-hover/item:opacity-100">
        {onEdit && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(bookmark)}
            className='lg:hover:text-primary lg:hover:bg-transparent!'
            title="Edit Bookmark"
            aria-label="Edit bookmark"
          >
            <EditNote size={16} />
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(bookmark)}
            className='lg:hover:text-destructive lg:hover:bg-transparent!'
            title="Delete Bookmark"
            aria-label="Delete bookmark"
          >
            <Delete size={16} />
          </Button>
        )}
      </div>
    </div>
  );

  if (prefersReducedMotion || !animated) {
    return cardContent;
  }

  return (
    <motion.div
      variants={bookmarkItem}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className='relative [counter-increment:bkmrk] before:hidden lg:before:block before:content-[counter(bkmrk)] before:absolute before:font-mono before:text-sm before:top-1/2 before:-left-8 before:text-primary before:-translate-y-1/2'
    >
      {cardContent}
    </motion.div>
  );
});
