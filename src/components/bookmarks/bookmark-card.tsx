'use client';

import { cn, formatDate } from '@/lib/utils';
import { 
  MoreHorizontal
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bookmark } from '@/types/pinboard';
import { useBookmarkStore } from '@/lib/stores/bookmarks';
import { BookmarkContextMenu } from './bookmark-context-menu';
import { RightClickContextMenu } from './right-click-context-menu';
import { motion } from 'framer-motion';
import { fadeInUpStagger } from '@/lib/animations';

interface BookmarkCardProps {
  bookmark: Bookmark;
  onEdit?: (bookmark: Bookmark) => void;
  onDelete?: (bookmark: Bookmark) => void;
}

export function BookmarkCard({ bookmark, onEdit, onDelete }: BookmarkCardProps) {
  const {} = useBookmarkStore();

  return (
    <RightClickContextMenu
      bookmark={bookmark}
      onEdit={onEdit}
      onDelete={onDelete}
    >
      <motion.div
        layout
        variants={fadeInUpStagger}
        initial="initial"
        animate="animate"
        exit="exit"
        whileHover="hover"
        whileTap="tap"
        className="group"
      >
        <Card 
          className={`bg-card dark:bg-card transition-all duration-200 shadow-md shadow-primary/10 hover:shadow-lg h-fit w-full`}
        >
          <CardHeader className="pb-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 pr-2 word-break-words">
                <h3 className="font-semibold text-lg leading-tight line-clamp-2 mb-1 break-all">
                  {bookmark.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-1 break-all">
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
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2 wrap-break-word">
                {bookmark.extended}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 flex-row">
                <span className="text-xs text-muted-foreground">
                  {formatDate(bookmark.createdAt)}
                </span>
                {bookmark.tags.length > 0 && (
                  <>
                    <span className="bg-muted-foreground h-px w-8 opacity-35"></span>
                    <div className="flex items-center space-x-1">
                      <div className="flex flex-wrap gap-1 max-w-full">
                        {bookmark.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="default" className="text-xs truncate max-w-20">
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
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </RightClickContextMenu>
  );
}
