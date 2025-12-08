'use client';

import { useState } from 'react';
import { Bookmark } from '@/types/pinboard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Tag,
  ExternalLink,
  Copy
} from 'lucide-react';
 
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
  const [showTagEditor, setShowTagEditor] = useState(false);

  

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(bookmark.url);
    } catch {
      // Silently fail
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
          onClick={handleOpenLink}
          className="h-7 px-2 cursor-pointer"
        >
          <ExternalLink className="h-3 w-3" />
          {!compact && <span className="ml-1 text-xs">Open</span>}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyUrl}
          className="h-7 px-2 cursor-pointer"
        >
          <Copy className="h-3 w-3" />
          {!compact && <span className="ml-1 text-xs">Copy</span>}
        </Button>

        {showTags && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTagEditor(true)}
            className="h-7 px-2 cursor-pointer"
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
