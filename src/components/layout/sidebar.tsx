'use client';

import { useState } from 'react';
import { 
  Home, 
  Clock, 
  Tag, 
  Star, 
  Plus, 
  Filter,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBookmarkStore } from '@/lib/stores/bookmarks';

interface SidebarProps {
  onAddBookmark: () => void;
}

export function Sidebar({ onAddBookmark }: SidebarProps) {
  const { 
    tags, 
    selectedTags, 
    setSelectedTags, 
    bookmarks,
    clearFilters 
  } = useBookmarkStore();
  
  const [isTagsExpanded, setIsTagsExpanded] = useState(true);

  const unreadCount = bookmarks.filter(b => !b.isRead).length;
  const recentCount = bookmarks.filter(b => {
    const dayAgo = new Date();
    dayAgo.setDate(dayAgo.getDate() - 1);
    return b.createdAt > dayAgo;
  }).length;

  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleClearFilters = () => {
    clearFilters();
  };

  return (
    <aside className="w-64 border-r bg-background/50 p-4">
      <div className="space-y-4">
        {/* Add Bookmark Button */}
        <Button 
          onClick={onAddBookmark} 
          className="w-full justify-start"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Bookmark
        </Button>

        {/* Navigation */}
        <nav className="space-y-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start"
            onClick={handleClearFilters}
          >
            <Home className="h-4 w-4 mr-2" />
            All Bookmarks
            <Badge variant="secondary" className="ml-auto">
              {bookmarks.length}
            </Badge>
          </Button>

          <Button 
            variant="ghost" 
            className="w-full justify-start"
            onClick={() => setSelectedTags(['unread'])}
          >
            <Clock className="h-4 w-4 mr-2" />
            Unread
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-auto">
                {unreadCount}
              </Badge>
            )}
          </Button>

          <Button 
            variant="ghost" 
            className="w-full justify-start"
            onClick={() => setSelectedTags(['recent'])}
          >
            <Star className="h-4 w-4 mr-2" />
            Recent
            {recentCount > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {recentCount}
              </Badge>
            )}
          </Button>
        </nav>

        {/* Tags Section */}
        {tags.length > 0 && (
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-between"
              onClick={() => setIsTagsExpanded(!isTagsExpanded)}
            >
              <div className="flex items-center">
                <Tag className="h-4 w-4 mr-2" />
                Tags
              </div>
              {isTagsExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>

            {isTagsExpanded && (
              <div className="space-y-1 pl-6">
                {tags.slice(0, 20).map((tag) => (
                  <Button
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag}
                  </Button>
                ))}
                {tags.length > 20 && (
                  <p className="text-xs text-muted-foreground pl-2">
                    +{tags.length - 20} more tags
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Clear Filters */}
        {(selectedTags.length > 0) && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleClearFilters}
          >
            <Filter className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>
    </aside>
  );
}
