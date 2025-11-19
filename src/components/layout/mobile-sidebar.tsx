'use client';

import { 
  Tag,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useUIStore } from '@/lib/stores/ui';
import { useBookmarks, useTags } from '@/hooks/usePinboard';

export function MobileSidebar() {
  const { 
    selectedTags, 
    setSelectedTags, 
    searchQuery,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    clearFilters
  } = useUIStore();
  
  const { data: bookmarks = [] } = useBookmarks();
  const { data: tagsData = {} } = useTags();
  const tags = Object.keys(tagsData).sort();

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

  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'title', label: 'Title' },
    { value: 'url', label: 'URL' }
  ];

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <SheetHeader>
        <SheetTitle>Sort & Filter</SheetTitle>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto">
        {/* Sort Section */}
        <div className="p-4 space-y-3">
          <h3 className="font-medium text-sm">Sort By</h3>
          <div className="grid grid-cols-3 gap-2">
            {sortOptions.map((option) => (
              <Button
                key={option.value}
                variant={sortBy === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy(option.value as 'date' | 'title' | 'url')}
                className="h-9"
              >
                {option.label}
              </Button>
            ))}
          </div>
          
          <div className="flex gap-2 mt-2">
            <Button
              variant={sortOrder === 'asc' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortOrder('asc')}
              className="flex-1"
            >
              <SortAsc className="h-4 w-4 mr-1" />
              Ascending
            </Button>
            <Button
              variant={sortOrder === 'desc' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortOrder('desc')}
              className="flex-1"
            >
              <SortDesc className="h-4 w-4 mr-1" />
              Descending
            </Button>
          </div>
        </div>

        <Separator />

        {/* Filter Section */}
        <div className="p-4">
          <h3 className="font-medium text-sm mb-3">Filter by Tags</h3>
          {tags.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No tags available</p>
            </div>
          ) : (
            <div className="space-y-1">
              {tags.map((tag) => {
                const tagCount = bookmarks.filter(bookmark => 
                  bookmark.tags.includes(tag)
                ).length;
                
                return (
                  <Button
                    key={tag}
                    variant={selectedTags.includes(tag) ? 'default' : 'ghost'}
                    className="w-full justify-start text-sm h-auto py-2"
                    onClick={() => handleTagClick(tag)}
                  >
                    <Tag className="mr-2 h-3 w-3 shrink-0" />
                    <span className="flex-1 text-left truncate">{tag}</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {tagCount}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="border-t p-4">
        {(selectedTags.length > 0 || searchQuery) && (
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="w-full"
            size="sm"
          >
            Clear All Filters
          </Button>
        )}
        {selectedTags.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''} selected
          </p>
        )}
      </div>
    </div>
  );
}
