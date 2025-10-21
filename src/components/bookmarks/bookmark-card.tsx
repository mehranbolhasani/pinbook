'use client';

// import { useState } from 'react';
import { format } from 'date-fns';
import { 
  MoreHorizontal, 
  Tag,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bookmark } from '@/types/pinboard';
import { useBookmarkStore } from '@/lib/stores/bookmarks';
import { Checkbox } from '@/components/ui/checkbox';
import { BookmarkContextMenu } from './bookmark-context-menu';
import { BookmarkQuickActions } from './bookmark-quick-actions';
import { motion } from 'framer-motion';

interface BookmarkCardProps {
  bookmark: Bookmark;
  onEdit?: (bookmark: Bookmark) => void;
  onDelete?: (bookmark: Bookmark) => void;
}

export function BookmarkCard({ bookmark, onEdit, onDelete }: BookmarkCardProps) {
  const { selectedBookmarks, isSelectionMode, toggleBookmarkSelection } = useBookmarkStore();


  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    
    return format(date, 'MMM d, yyyy');
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -2 }}
      className="group"
    >
      <Card 
        className={`transition-all duration-200 hover:shadow-md ${
          !bookmark.isRead ? 'border-l-4 border-l-blue-500' : ''
        }`}
      >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          {isSelectionMode && (
            <div className="flex items-center mr-3">
              <Checkbox
                checked={selectedBookmarks.has(bookmark.id)}
                onCheckedChange={() => toggleBookmarkSelection(bookmark.id)}
                className="mt-1"
              />
            </div>
          )}
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
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(bookmark.url, '_blank', 'noopener,noreferrer')}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
    </motion.div>
  );
}
