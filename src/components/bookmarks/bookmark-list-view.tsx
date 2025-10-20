'use client';

import { Bookmark } from '@/types/pinboard';
import { BookmarkCard } from './bookmark-card';
import { format } from 'date-fns';
import { ExternalLink, Eye, EyeOff, Share, Share2, Trash2, Edit, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBookmarkStore } from '@/lib/stores/bookmarks';
import { getPinboardAPI } from '@/lib/api/pinboard';
import { useAuthStore } from '@/lib/stores/auth';

interface BookmarkListViewProps {
  bookmarks: Bookmark[];
  onEdit?: (bookmark: Bookmark) => void;
  onDelete?: (bookmark: Bookmark) => void;
}

export function BookmarkListView({ bookmarks, onEdit, onDelete }: BookmarkListViewProps) {
  const { updateBookmark } = useBookmarkStore();
  const { apiToken } = useAuthStore();

  const handleToggleRead = async (bookmark: Bookmark) => {
    const newReadStatus = !bookmark.isRead;
    
    // Update local state immediately for responsive UI
    updateBookmark(bookmark.id, { isRead: newReadStatus });
    
    // Sync with Pinboard API
    if (apiToken) {
      try {
        const api = getPinboardAPI(apiToken);
        if (api) {
          await api.updateBookmarkReadStatus(bookmark.hash, newReadStatus);
        }
      } catch (error) {
        console.error('Failed to update read status:', error);
        // Revert local state on error
        updateBookmark(bookmark.id, { isRead: bookmark.isRead });
      }
    }
  };

  const handleToggleShared = async (bookmark: Bookmark) => {
    const newSharedStatus = !bookmark.isShared;
    
    // Update local state immediately for responsive UI
    updateBookmark(bookmark.id, { isShared: newSharedStatus });
    
    // Sync with Pinboard API
    if (apiToken) {
      try {
        const api = getPinboardAPI(apiToken);
        if (api) {
          await api.updateBookmarkShareStatus(bookmark.hash, newSharedStatus);
        }
      } catch (error) {
        console.error('Failed to update share status:', error);
        // Revert local state on error
        updateBookmark(bookmark.id, { isShared: bookmark.isShared });
      }
    }
  };

  const handleOpenUrl = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="space-y-2">
      {bookmarks.map((bookmark) => (
        <div
          key={bookmark.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-medium text-sm truncate">
                {bookmark.title}
              </h3>
              {!bookmark.isRead && (
                <Badge variant="secondary" className="text-xs">
                  Unread
                </Badge>
              )}
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
              <span className="text-xs text-muted-foreground">
                {format(bookmark.createdAt, 'MMM d, yyyy')}
              </span>
              {bookmark.tags.length > 0 && (
                <div className="flex items-center space-x-1">
                  {bookmark.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
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
          
          <div className="flex items-center space-x-1 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenUrl(bookmark.url)}
              className="h-8 w-8 p-0"
              title="Open Link"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopyUrl(bookmark.url)}
              className="h-8 w-8 p-0"
              title="Copy URL"
            >
              <Copy className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleToggleRead(bookmark)}
              className="h-8 w-8 p-0"
              title={bookmark.isRead ? "Mark as Unread" : "Mark as Read"}
            >
              {bookmark.isRead ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleToggleShared(bookmark)}
              className="h-8 w-8 p-0"
              title={bookmark.isShared ? "Make Private" : "Make Public"}
            >
              {bookmark.isShared ? (
                <Share2 className="h-4 w-4" />
              ) : (
                <Share className="h-4 w-4" />
              )}
            </Button>
            
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(bookmark)}
                className="h-8 w-8 p-0"
                title="Edit Bookmark"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(bookmark)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                title="Delete Bookmark"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
