'use client';

import { useState } from 'react';
import { 
  Tag, 
  Plus, 
  ChevronDown,
  ChevronRight,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBookmarkStore } from '@/lib/stores/bookmarks';

interface MobileSidebarProps {
  onAddBookmark: () => void;
  onClose?: () => void;
}

export function MobileSidebar({ onAddBookmark, onClose }: MobileSidebarProps) {
  const { 
    tags, 
    selectedTags, 
    setSelectedTags, 
    bookmarks,
    searchQuery,
    setSearchQuery 
  } = useBookmarkStore();
  
  const [isTagsExpanded, setIsTagsExpanded] = useState(false);

  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const clearFilters = () => {
    setSelectedTags([]);
    setSearchQuery('');
  };

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-lg font-semibold">Filters</h2>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      

      

      {/* Tags */}
      <div className="flex-1 overflow-y-auto p-4">
        <Button
          variant="ghost"
          className="w-full justify-start mb-2"
          onClick={() => setIsTagsExpanded(!isTagsExpanded)}
        >
          <Tag className="mr-2 h-4 w-4" />
          Tags
          {isTagsExpanded ? (
            <ChevronDown className="ml-auto h-4 w-4" />
          ) : (
            <ChevronRight className="ml-auto h-4 w-4" />
          )}
        </Button>
        
        {isTagsExpanded && (
          <div className="space-y-1">
            {tags.slice(0, 10).map((tag) => {
              const tagCount = bookmarks.filter(bookmark => 
                bookmark.tags.includes(tag)
              ).length;
              
              return (
                <Button
                  key={tag}
                  variant={selectedTags.includes(tag) ? 'secondary' : 'ghost'}
                  className="w-full justify-start text-sm"
                  onClick={() => handleTagClick(tag)}
                >
                  <Tag className="mr-2 h-3 w-3" />
                  {tag}
                  <Badge variant="outline" className="ml-auto text-xs">
                    {tagCount}
                  </Badge>
                </Button>
              );
            })}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="border-t p-4 space-y-2">
        <Button
          onClick={onAddBookmark}
          className="w-full"
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Bookmark
        </Button>
        
        {(selectedTags.length > 0 || searchQuery) && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="w-full"
            size="sm"
          >
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}
