'use client';

import {
  MoreHorizontal,
  Tag,
  ExternalLink,
  Copy
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bookmark } from '@/types/pinboard';
import { BookmarkContextMenu } from './bookmark-context-menu';
import { BookmarkQuickActions } from './bookmark-quick-actions';
import { RightClickContextMenu } from './right-click-context-menu';
import { formatDate } from '@/lib/utils';

interface MobileBookmarkCardProps {
  bookmark: Bookmark;
  onEdit?: (bookmark: Bookmark) => void;
  onDelete?: (bookmark: Bookmark) => void;
}

export function MobileBookmarkCard({ bookmark, onEdit, onDelete }: MobileBookmarkCardProps) {

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  return (
    <RightClickContextMenu
      bookmark={bookmark}
      onEdit={onEdit}
      onDelete={onDelete}
    >
      <div className="relative">
        <Card className="hover:shadow-md">
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
                {bookmark.isShared && (
                  <Badge variant="outline" className="text-xs">
                    Shared
                  </Badge>
                )}

                <BookmarkContextMenu
                  bookmark={bookmark}
                  onEdit={onEdit}
                  onDelete={onDelete}
                >
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </BookmarkContextMenu>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {bookmark.extended && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {bookmark.extended}
              </p>
            )}

            <BookmarkQuickActions
              bookmark={bookmark}
              showTags={false}
            />

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

              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(bookmark.url, '_blank', 'noopener,noreferrer')}
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
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RightClickContextMenu>
  );
}
