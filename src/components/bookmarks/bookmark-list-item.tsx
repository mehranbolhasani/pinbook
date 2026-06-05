'use client';

import { memo } from 'react';
import { motion } from 'motion/react';
import { Bookmark } from '@/types/pinboard';
import { formatDate } from '@/lib/utils';
import { HugeiconsIcon } from '@hugeicons/react';
import { ExternalLinkIcon, Delete02Icon, PencilEdit01Icon } from '@hugeicons/core-free-icons';
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
    <div data-index={index} className="flex items-center justify-between bg-transparent group/item p-4 border-b border-primary/20 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <h3 className="font-normal text-md truncate tracking-tight group-hover/item:text-primary">
            {bookmark.title}
          </h3>

          {bookmark.isShared && (
            <Badge variant="outline" className="text-xs">
              Shared
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {bookmark.url}
        </p>
        <div className="flex items-center space-x-2 mt-1">
          <span className="text-xs text-foreground/60">
            {formatDate(bookmark.createdAt)}
          </span>
          {bookmark.tags.length > 0 && (
            <div className="flex items-center space-x-1">
              {bookmark.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="default" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {bookmark.tags.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{bookmark.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center shrink-0 gap-4 lg:invisible lg:group-hover/item:visible">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => handleOpenUrl(bookmark.url)}
          className='hover:text-primary hover:bg-transparent!'
          title="Open Link"
          aria-label="Open link"
        >
          <HugeiconsIcon icon={ExternalLinkIcon} size={16} strokeWidth={1.5} />
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
            <HugeiconsIcon icon={PencilEdit01Icon} size={16} strokeWidth={1.5} />
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
            <HugeiconsIcon icon={Delete02Icon} size={16} strokeWidth={1.5} />
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
      className='relative [counter-increment:bkmrk] before:content-[counter(bkmrk)] before:absolute before:font-mono before:text-sm before:top-1 before:left-1 before:text-primary/50'
    >
      <motion.div
        variants={hoverLift}
        initial="rest"
        className="hover:bg-primary/10"
      >
        {cardContent}
      </motion.div>
    </motion.div>
  );
});
