'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { 
  ExternalLink, 
  MoreHorizontal, 
  Eye, 
  EyeOff, 
  Share, 
  Share2,
  Trash2,
  Edit,
  Tag,
  Copy
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bookmark } from '@/types/pinboard';
import { useBookmarkStore } from '@/lib/stores/bookmarks';
import { getPinboardAPI } from '@/lib/api/pinboard';
import { useAuthStore } from '@/lib/stores/auth';

interface BookmarkCardProps {
  bookmark: Bookmark;
  onEdit?: (bookmark: Bookmark) => void;
  onDelete?: (bookmark: Bookmark) => void;
}

export function BookmarkCard({ bookmark, onEdit, onDelete }: BookmarkCardProps) {
  const { updateBookmark } = useBookmarkStore();
  const { apiToken } = useAuthStore();
  const [isHovered, setIsHovered] = useState(false);

  const handleToggleRead = async () => {
    const newReadStatus = !bookmark.isRead;
    
    // Update local state immediately for responsive UI
    updateBookmark(bookmark.id, { isRead: newReadStatus });
    
    // Sync with Pinboard API
    if (apiToken) {
      try {
        const api = getPinboardAPI(apiToken);
        if (api) {
          await api.updateBookmarkReadStatus(bookmark.hash, newReadStatus);
          console.log('Successfully updated read status to:', newReadStatus);
        }
      } catch (error) {
        console.error('Failed to update read status:', error);
        // Revert local state on error
        updateBookmark(bookmark.id, { isRead: bookmark.isRead });
      }
    }
  };

  const handleToggleShared = async () => {
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

  const handleOpenUrl = () => {
    window.open(bookmark.url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(bookmark.url);
    // You could add a toast notification here
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    
    return format(date, 'MMM d, yyyy');
  };

  return (
    <Card 
      className={`transition-all duration-200 hover:shadow-md ${
        !bookmark.isRead ? 'border-l-4 border-l-blue-500' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg leading-tight line-clamp-2">
              {bookmark.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
              {bookmark.domain}
            </p>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
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
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenUrl}
                className="h-8 w-8 p-0"
                title="Open Link"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyUrl}
                className="h-8 w-8 p-0"
                title="Copy URL"
              >
                <Copy className="h-4 w-4" />
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
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleToggleRead}>
                    {bookmark.isRead ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Mark as Unread
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Mark as Read
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleToggleShared}>
                    {bookmark.isShared ? (
                      <>
                        <Share2 className="h-4 w-4 mr-2" />
                        Make Private
                      </>
                    ) : (
                      <>
                        <Share className="h-4 w-4 mr-2" />
                        Make Public
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {bookmark.extended && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {bookmark.extended}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">
              {formatDate(bookmark.createdAt)}
            </span>
            {bookmark.tags.length > 0 && (
              <>
                <span className="text-xs text-muted-foreground">•</span>
                <div className="flex items-center space-x-1">
                  <Tag className="h-3 w-3 text-muted-foreground" />
                  <div className="flex flex-wrap gap-1">
                    {bookmark.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {bookmark.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{bookmark.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenUrl}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
