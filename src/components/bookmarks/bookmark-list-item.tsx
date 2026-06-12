'use client';

import { memo } from 'react';
import { motion } from 'motion/react';
import { Bookmark } from '@/types/pinboard';
import { formatDate } from '@/lib/utils';
import { OpenInNew, Delete, EditNote } from '@nine-thirty-five/material-symbols-react/rounded/300';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { listItem, hoverLift } from '@/lib/animations';

interface BookmarkListItemProps {
  bookmark: Bookmark;
  index?: number;
  onEdit?: (bookmark: Bookmark) => void;
  onDelete?: (bookmark: Bookmark) => void;
}

export const BookmarkListItem = memo(function BookmarkListItem({ bookmark, index = 0, onEdit, onDelete }: BookmarkListItemProps) {
  const prefersReducedMotion = useReducedMotion();

  const handleOpenUrl = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const cardContent = (
    <div data-index={index} className="flex items-center justify-between bg-transparent group/item transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-0">
          <h3 className="font-normal text-md truncate tracking-tight group-hover/item:text-primary">
            {bookmark.title}
          </h3>
        </div>
        <div className="flex items-center space-x-2 mt-0">
          <span className="text-xs text-foreground/40">
            {formatDate(bookmark.createdAt)}
          </span>
        </div>
      </div>

      <div className="flex items-center shrink-0 gap-2 lg:invisible lg:group-hover/item:visible border border-foreground rounded-full px-2 py-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => handleOpenUrl(bookmark.url)}
          className='hover:text-primary hover:bg-transparent!'
          title="Open Link"
          aria-label="Open link"
        >
          <OpenInNew size={16} />
        </Button>
        {onEdit && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(bookmark)}
            className='hover:text-primary hover:bg-transparent!'
            title="Edit Bookmark"
            aria-label="Edit bookmark"
          >
            <EditNote size={16} />
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(bookmark)}
            className='hover:text-destructive hover:bg-transparent!'
            title="Delete Bookmark"
            aria-label="Delete bookmark"
          >
            <Delete size={16} />
          </Button>
        )}
      </div>
    </div>
  );

  if (prefersReducedMotion) {
    return cardContent;
  }

  return (
    <motion.div
      variants={listItem(index)}
      initial="hidden"
      animate="visible"
      exit="hidden"
      whileHover="hover"
      className='relative [counter-increment:bkmrk] before:content-[counter(bkmrk)] before:absolute before:font-mono before:text-sm before:top-1/2 before:-left-8 before:text-primary before:-translate-y-1/2'
    >
      <motion.div
        variants={hoverLift}
        initial="rest"
        className=""
      >
        {cardContent}
      </motion.div>
    </motion.div>
  );
});
