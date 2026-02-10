'use client';

import { SortAsc, SortDesc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/lib/stores/ui';
import { cn } from '@/lib/utils';

export function BookmarkToolbar() {
  const { 
    sortBy, 
    setSortBy, 
    sortOrder, 
    setSortOrder
  } = useUIStore();

  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'title', label: 'Title' },
    { value: 'url', label: 'URL' }
  ];

  return (
    <div className="flex items-center justify-between w-full pb-4 px-4">
      {/* Sort Button Group */}
      <div className="flex items-center gap-1 bg-background">
        {sortOptions.map((option) => (
          <Button
            key={option.value}
            variant={sortBy === option.value ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSortBy(option.value as 'date' | 'title' | 'url')}
            className={cn(
              'h-8 px-3 hover:bg-primary/90 hover:text-primary-foreground dark:hover:bg-primary/50 dark:hover:text-primary!',
              sortBy === option.value && 'bg-primary/15 text-primary hover:bg-primary/90 dark:hover:bg-primary/50'
            )}
          >
            {option.label}
          </Button>
        ))}
        <div className="w-px h-4 bg-border mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="h-8 px-2 hover:bg-primary/90 hover:text-primary-foreground dark:hover:bg-primary/50 dark:hover:text-primary!"
          title={`Sort ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
        >
          {sortOrder === 'asc' ? (
            <SortAsc className="h-4 w-4" />
          ) : (
            <SortDesc className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
