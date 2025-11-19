'use client';

import { useState } from 'react';
import { 
  User, 
  Plus, 
  Filter,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUIStore } from '@/lib/stores/ui';
import { useBookmarks, useTags } from '@/hooks/usePinboard';
import { Settings, LogOut, Paperclip as BookmarkIcon } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuthStore } from '@/lib/stores/auth';

interface SidebarProps {
  onAddBookmark: () => void;
}

export function Sidebar({ onAddBookmark }: SidebarProps) {
  const { 
    selectedTags, 
    setSelectedTags, 
    clearFilters 
  } = useUIStore();
  
  const { data: bookmarks = [] } = useBookmarks();
  const { data: tagsData = {} } = useTags();
  const tags = Object.keys(tagsData);

  const { isAuthenticated, username, logout } = useAuthStore();
  
  const [isTagsExpanded, setIsTagsExpanded] = useState(false);
  

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
    <aside className="w-64 sticky top-0 flex flex-col justify-between min-h-screen overflow-hidden border-r border-primary/10 dark:border-primary/10">
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <BookmarkIcon className="h-6 w-6 text-primary" />
            <span className="font-medium text-xl tracking-tight">Pinbook</span>
          </div>
          <ThemeToggle />
        </div>

        
        <Button 
          onClick={onAddBookmark} 
          className="w-full justify-start cursor-pointer mt-8"
          size="sm"
        >
          <Plus className="h-6 w-6 mr-0" />
          Add Bookmark
        </Button>

        <nav className="space-y-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start"
            onClick={handleClearFilters}
          >
            <span className="flex items-center gap-2">
              All Bookmarks
            </span>
            <Badge variant="outline" className="ml-auto">
              {bookmarks.length}
            </Badge>
          </Button>

          
        {tags.length > 0 && (
          <div>
            <Button
              variant="ghost"
              className="w-full justify-between"
              onClick={() => setIsTagsExpanded(!isTagsExpanded)}
            >
              <span className="flex items-center gap-2">
                Tags
              </span>
              {isTagsExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>

            {isTagsExpanded && (
              <div className="space-y-1">
                {tags.slice(0, 20).map((tag) => (
                  <Button
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-start text-sm"
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag}
                  </Button>
                ))}
                {tags.length > 20 && (
                  <p className="text-xs text-muted-foreground">
                    +{tags.length - 20} more tags
                  </p>
                )}
              </div>
            )}
          </div>
        )}
        </nav>


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

      <div className="space-y-2 p-4">
        {isAuthenticated ? (
          <div className="flex items-start justify-between w-full flex-col">
            <div className="text-base text-forground w-full font-normal dark:text-neutral-400 flex flex-col border-b border-muted-foreground/20 dark:border-neutral-700 pb-2 mb-2">
              <User className="h-6 w-6 mb-2" />
              <span className="text-lg">{username}</span>
            </div>
            <div className="flex items-start w-full justify-start gap-2">
              <Link href="/settings">
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>

              <Button variant="ghost" size="sm" onClick={() => logout()}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
