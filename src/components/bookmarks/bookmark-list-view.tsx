'use client';

import { Bookmark } from '@/types/pinboard';
// import { BookmarkCard } from './bookmark-card';
import { format } from 'date-fns';
import { ExternalLink, Trash2, Edit, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SwipeableBookmarkItem } from './swipeable-bookmark-item';
 

interface BookmarkListViewProps {
  bookmarks: Bookmark[];
  onEdit?: (bookmark: Bookmark) => void;
  onDelete?: (bookmark: Bookmark) => void;
}

export function BookmarkListView({ bookmarks, onEdit, onDelete }: BookmarkListViewProps) {

  

  

  const handleOpenUrl = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="space-y-2 group">
      {bookmarks.map((bookmark) => (
        <SwipeableBookmarkItem
          key={bookmark.id}
          bookmark={bookmark}
          onEdit={onEdit}
          onDelete={onDelete}
        >
          <div
            className="flex items-center justify-between p-4 hover:bg-muted/80 transition-colors rounded-xl dark:hover:bg-neutral-800/50 mb-2 shadow-md shadow-primary/20"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-medium text-md truncate">
                  {bookmark.title}
                </h3>
                
                {bookmark.isShared && (
                  <Badge variant="outline" className="text-xs">
                    Shared
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {bookmark.url}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-foreground/60">
                  {format(bookmark.createdAt, 'MMM d, yyyy')}
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
            
            <div className="hidden lg:flex items-center space-x-1 invisible group-hover:visible transition-opacity duration-50 bg-white p-2 rounded-md border border-muted-foreground/20 dark:bg-neutral-800 dark:border-neutral-700">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenUrl(bookmark.url)}
                className="h-8 w-8 p-0 cursor-pointer"
                title="Open Link"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopyUrl(bookmark.url)}
                className="h-8 w-8 p-0 cursor-pointer"
                title="Copy URL"
              >
                <Copy className="h-3 w-3" />
              </Button>
              
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(bookmark)}
                  className="h-8 w-8 p-0 cursor-pointer"
                  title="Edit Bookmark"
                >
                  <Edit className="h-3 w-3" />
                </Button>
              )}
              
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onDelete(bookmark)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive cursor-pointer"
                  title="Delete Bookmark"
                >
                  <Trash2 className="h-12 w-3" />
                </Button>
              )}
            </div>
          </div>
        </SwipeableBookmarkItem>
      ))}
    </div>
  );
}
