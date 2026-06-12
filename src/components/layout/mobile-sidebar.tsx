'use client';

import { Label } from '@nine-thirty-five/material-symbols-react/rounded/300';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useUIStore } from '@/lib/stores/ui';
import { useTags } from '@/hooks/usePinboard';

export function MobileSidebar() {
  const {
    selectedTags,
    setSelectedTags,
    searchQuery,
    clearFilters
  } = useUIStore();

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

  return (
    <div className="flex h-full flex-col bg-background">
      <SheetHeader>
        <SheetTitle>Filter</SheetTitle>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="font-medium text-sm mb-3">Filter by Tags</h3>
          {tags.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Label size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No tags available</p>
            </div>
          ) : (
            <div className="space-y-1">
              {tags.map((tag) => {
                const tagCount = tagsData[tag] ?? 0;

                return (
                  <Button
                    key={tag}
                    variant={selectedTags.includes(tag) ? 'default' : 'ghost'}
                    className="w-full justify-start text-sm h-auto py-2"
                    onClick={() => handleTagClick(tag)}
                  >
                    <Label size={12} className="mr-2 shrink-0" />
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
