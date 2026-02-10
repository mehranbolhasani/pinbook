'use client';

import { memo } from 'react';
import { Bookmark } from '@/types/pinboard';
import { formatDate } from '@/lib/utils';
import { ExternalLink, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface BookmarkListItemProps {
  bookmark: Bookmark;
  onEdit?: (bookmark: Bookmark) => void;
  onDelete?: (bookmark: Bookmark) => void;
}

export const BookmarkListItem = memo(function BookmarkListItem({ bookmark, onEdit, onDelete }: BookmarkListItemProps) {
  const handleOpenUrl = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex items-center justify-between group/item mb-2 hover:bg-zinc-100 p-4">
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
          size="sm"
          onClick={() => handleOpenUrl(bookmark.url)}
          className="h-8 w-8 p-0"
          title="Open Link"
          aria-label="Open link"
        >
          <ExternalLink className="h-3 w-3" />
        </Button>
        {onEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(bookmark)}
            className="h-8 w-8 p-0"
            title="Edit Bookmark"
            aria-label="Edit bookmark"
          >
            <Edit className="h-3 w-3" />
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(bookmark)}
            className="h-8 w-8 p-0 text-destructive hover:text-white hover:bg-destructive"
            title="Delete Bookmark"
            aria-label="Delete bookmark"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
});
