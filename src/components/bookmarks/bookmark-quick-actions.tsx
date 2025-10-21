'use client';

import { useState } from 'react';
import { Bookmark } from '@/types/pinboard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  EyeOff, 
  Share, 
  Share2, 
  Tag,
  ExternalLink,
  Copy
} from 'lucide-react';
import { useBookmarkStore } from '@/lib/stores/bookmarks';
import { getPinboardAPI } from '@/lib/api/pinboard';
import { useAuthStore } from '@/lib/stores/auth';
import { InlineTagEditor } from './inline-tag-editor';

interface BookmarkQuickActionsProps {
  bookmark: Bookmark;
  showTags?: boolean;
  compact?: boolean;
}

export function BookmarkQuickActions({ 
  bookmark, 
  showTags = true,
  compact = false 
}: BookmarkQuickActionsProps) {
  const { updateBookmark } = useBookmarkStore();
  const { apiToken } = useAuthStore();
  const [showTagEditor, setShowTagEditor] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleToggleRead = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    const newReadStatus = !bookmark.isRead;
    
    // Update local state immediately for responsive UI
    updateBookmark(bookmark.id, { isRead: newReadStatus });
    
    // Sync with Pinboard API
    if (apiToken) {
      try {
        const api = getPinboardAPI(apiToken);
        if (api) {
          await api.updateBookmarkReadStatus(bookmark.hash, newReadStatus);
          console.log(`Bookmark "${bookmark.title}" marked as ${newReadStatus ? 'read' : 'unread'}.`);
        }
      } catch (error) {
        console.error('Failed to update bookmark read status:', error);
        // Revert local state on error
        updateBookmark(bookmark.id, { isRead: !newReadStatus });
      }
    }
    setIsProcessing(false);
  };

  const handleToggleShared = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    const newSharedStatus = !bookmark.isShared;
    
    // Update local state immediately for responsive UI
    updateBookmark(bookmark.id, { isShared: newSharedStatus });
    
    // Sync with Pinboard API
    if (apiToken) {
      try {
        const api = getPinboardAPI(apiToken);
        if (api) {
          await api.updateBookmarkShareStatus(bookmark.hash, newSharedStatus);
          console.log(`Bookmark "${bookmark.title}" marked as ${newSharedStatus ? 'shared' : 'private'}.`);
        }
      } catch (error) {
        console.error('Failed to update bookmark share status:', error);
        // Revert local state on error
        updateBookmark(bookmark.id, { isShared: !newSharedStatus });
      }
    }
    setIsProcessing(false);
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(bookmark.url);
      console.log('URL copied to clipboard');
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const handleOpenLink = () => {
    window.open(bookmark.url, '_blank', 'noopener,noreferrer');
  };

  if (showTagEditor) {
    return (
      <InlineTagEditor 
        bookmark={bookmark} 
        onClose={() => setShowTagEditor(false)} 
      />
    );
  }

  return (
    <div className="space-y-2">
      {/* Quick Action Buttons */}
      <div className={`flex items-center gap-1 ${compact ? 'flex-wrap' : 'flex-nowrap'}`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleRead}
          disabled={isProcessing}
          className="h-7 px-2"
        >
          {bookmark.isRead ? (
            <EyeOff className="h-3 w-3" />
          ) : (
            <Eye className="h-3 w-3" />
          )}
          {!compact && (
            <span className="ml-1 text-xs">
              {bookmark.isRead ? 'Unread' : 'Read'}
            </span>
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleShared}
          disabled={isProcessing}
          className="h-7 px-2"
        >
          {bookmark.isShared ? (
            <Share2 className="h-3 w-3" />
          ) : (
            <Share className="h-3 w-3" />
          )}
          {!compact && (
            <span className="ml-1 text-xs">
              {bookmark.isShared ? 'Private' : 'Public'}
            </span>
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleOpenLink}
          className="h-7 px-2"
        >
          <ExternalLink className="h-3 w-3" />
          {!compact && <span className="ml-1 text-xs">Open</span>}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyUrl}
          className="h-7 px-2"
        >
          <Copy className="h-3 w-3" />
          {!compact && <span className="ml-1 text-xs">Copy</span>}
        </Button>

        {showTags && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTagEditor(true)}
            className="h-7 px-2"
          >
            <Tag className="h-3 w-3" />
            {!compact && <span className="ml-1 text-xs">Tags</span>}
          </Button>
        )}
      </div>

      {/* Tags Display */}
      {showTags && bookmark.tags.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          {bookmark.tags.slice(0, compact ? 3 : 5).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {bookmark.tags.length > (compact ? 3 : 5) && (
            <Badge variant="outline" className="text-xs">
              +{bookmark.tags.length - (compact ? 3 : 5)}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
