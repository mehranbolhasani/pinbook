'use client';

import { memo } from 'react';
import { motion } from 'motion/react';
import { Bookmark } from '@/types/pinboard';
import { formatDate } from '@/lib/utils';
import { ExternalLink, Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { listItem, hoverLift, buttonHover } from '@/lib/animations';

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
    <div data-index={index} className="flex items-center justify-between bg-card group/item hover:border-accent p-4 mb-3 rounded-xl border border-border transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <h3 className="font-normal text-md truncate">
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

      <div className="flex items-center shrink-0 gap-1 lg:invisible lg:group-hover/item:visible">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => handleOpenUrl(bookmark.url)}
          className='hover:text-primary hover:bg-transparent!'
          title="Open Link"
          aria-label="Open link"
        >
          <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
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
            <Pencil className="h-4 w-4" strokeWidth={1.5} />
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
            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
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
    >
      <motion.div
        variants={hoverLift}
        initial="rest"
        className="hover:shadow-2xl hover:shadow-primary/10"
      >
        {cardContent}
      </motion.div>
    </motion.div>
  );
});
