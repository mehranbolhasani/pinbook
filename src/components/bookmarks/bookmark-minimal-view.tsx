'use client';

import { Bookmark } from '@/types/pinboard';
import { format } from 'date-fns';
import { ExternalLink, Eye, EyeOff, Share, Share2, Trash2, Edit, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBookmarkStore } from '@/lib/stores/bookmarks';
import { getPinboardAPI } from '@/lib/api/pinboard';
import { useAuthStore } from '@/lib/stores/auth';

interface BookmarkMinimalViewProps {
  bookmarks: Bookmark[];
  onEdit?: (bookmark: Bookmark) => void;
  onDelete?: (bookmark: Bookmark) => void;
}

export function BookmarkMinimalView({ bookmarks, onEdit, onDelete }: BookmarkMinimalViewProps) {
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
    <div className="space-y-1">
      {bookmarks.map((bookmark) => (
        <div
          key={bookmark.id}
          className="flex items-center justify-between py-2 px-3 hover:bg-muted/50 transition-colors rounded"
        >
          <div className="flex-1 min-w-0 flex items-center space-x-3">
            <div className="flex-shrink-0">
              {!bookmark.isRead && (
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
              )}
            </div>
            
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
          
          <div className="flex items-center space-x-1 ml-4">
            <span className="text-xs text-muted-foreground">
              {format(bookmark.createdAt, 'MMM d')}
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenUrl(bookmark.url)}
              className="h-6 w-6 p-0"
              title="Open Link"
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopyUrl(bookmark.url)}
              className="h-6 w-6 p-0"
              title="Copy URL"
            >
              <Copy className="h-3 w-3" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleToggleRead(bookmark)}
              className="h-6 w-6 p-0"
              title={bookmark.isRead ? "Mark as Unread" : "Mark as Read"}
            >
              {bookmark.isRead ? (
                <EyeOff className="h-3 w-3" />
              ) : (
                <Eye className="h-3 w-3" />
              )}
            </Button>
            
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(bookmark)}
                className="h-6 w-6 p-0"
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
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                title="Delete Bookmark"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
