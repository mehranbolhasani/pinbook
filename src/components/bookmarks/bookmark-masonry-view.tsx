'use client';

import { Bookmark } from '@/types/pinboard';
// import { BookmarkCard } from './bookmark-card';
import { format } from 'date-fns';
import { ExternalLink, Share, Trash2, Edit, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface BookmarkMasonryViewProps {
  bookmarks: Bookmark[];
  onEdit?: (bookmark: Bookmark) => void;
  onDelete?: (bookmark: Bookmark) => void;
}

export function BookmarkMasonryView({ bookmarks, onEdit, onDelete }: BookmarkMasonryViewProps) {

  // const handleToggleShared = async (bookmark: Bookmark) => {
  //   const newSharedStatus = !bookmark.isShared;
  //   
  //   // Update local state immediately for responsive UI
  //   updateBookmark(bookmark.id, { isShared: newSharedStatus });
  //   
  //   // Sync with Pinboard API
  //   if (apiToken) {
  //     try {
  //       const api = getPinboardAPI(apiToken);
  //       if (api) {
  //         await api.updateBookmarkShareStatus(bookmark.hash, newSharedStatus);
  //       }
  //     } catch (error) {
  //       console.error('Failed to update share status:', error);
  //       // Revert local state on error
  //       updateBookmark(bookmark.id, { isShared: bookmark.isShared });
  //     }
  //   }
  // };

  const handleOpenUrl = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="columns-1 md:columns-2 lg:columns-4 gap-2 space-y-4"> 
      {bookmarks.map((bookmark) => (
        <Card key={bookmark.id} className="break-inside-avoid mb-4 hover:shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm leading-tight line-clamp-2 mb-1">
                  {bookmark.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {bookmark.domain}
                </p>
              </div>
              
              <div className="flex items-center space-x-1 ml-2">
                
                {bookmark.isShared && (
                  <Share className="h-3 w-3 text-muted-foreground shrink-0" />
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">
                {format(bookmark.createdAt, 'MMM d, yyyy')}
              </span>
              
              <div className="flex items-center space-x-1">
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
          </CardHeader>
          
          {bookmark.extended && (
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground line-clamp-3">
                {bookmark.extended}
              </p>
            </CardContent>
          )}
          
          {bookmark.tags.length > 0 && (
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-1">
                {bookmark.tags.slice(0, 4).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {bookmark.tags.length > 4 && (
                  <span className="text-xs text-muted-foreground">
                    +{bookmark.tags.length - 4}
                  </span>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
