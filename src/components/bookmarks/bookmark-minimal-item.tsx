'use client';

import { Bookmark } from '@/types/pinboard';
import { formatDate } from '@/lib/utils';
import { ExternalLink, Share, Trash2, Edit, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SwipeableBookmarkItem } from './swipeable-bookmark-item';

interface BookmarkMinimalItemProps {
  bookmark: Bookmark;
  onEdit?: (bookmark: Bookmark) => void;
  onDelete?: (bookmark: Bookmark) => void;
}

export function BookmarkMinimalItem({ bookmark, onEdit, onDelete }: BookmarkMinimalItemProps) {
  const handleOpenUrl = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  return (
    <SwipeableBookmarkItem
      bookmark={bookmark}
      onEdit={onEdit}
      onDelete={onDelete}
      className="mb-0"
    >
      <div
        className="flex items-center justify-between py-2 px-3 hover:bg-primary/30 transition-colors rounded group/item"
      >
        <div className="flex-1 min-w-0 flex items-center space-x-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-sm truncate">
                {bookmark.title}
              </h3>
              {bookmark.isShared && (
                <Share className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {bookmark.url}
            </p>
          </div>
        </div>
        
        <div className="hidden lg:flex items-center space-x-1 invisible group-hover/item:visible transition-opacity duration-50 bg-white p-2 rounded-md border border-muted-foreground/20 dark:bg-neutral-800 dark:border-neutral-700">
          <span className="text-xs text-muted-foreground dark:text-neutral-400">
            {formatDate(bookmark.createdAt)}
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenUrl(bookmark.url)}
            className="h-6 w-6 p-0 cursor-pointer scale-75"
            title="Open Link"
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleCopyUrl(bookmark.url)}
            className="h-6 w-6 p-0 cursor-pointer scale-75"
            title="Copy URL"
          >
            <Copy className="h-3 w-3" />
          </Button>
          
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(bookmark)}
              className="h-6 w-6 p-0 cursor-pointer scale-75"
              title="Edit Bookmark"
            >
              <Edit className="h-3 w-3" />
            </Button>
          )}
          
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(bookmark)}
              className="h-6 w-6 p-0 text-destructive hover:text-destructive cursor-pointer scale-75"
              title="Delete Bookmark"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </SwipeableBookmarkItem>
  );
}
