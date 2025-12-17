'use client';

import { 
  Grid3X3, 
  List, 
  ListOrdered, 
  SortAsc,
  SortDesc
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/lib/stores/ui';
import { cn } from '@/lib/utils';

export function BookmarkToolbar() {
  const { 
    sortBy, 
    setSortBy, 
    sortOrder, 
    setSortOrder,
    layout,
    setLayout 
  } = useUIStore();

  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'title', label: 'Title' },
    { value: 'url', label: 'URL' }
  ];

  const layoutOptions = [
    { value: 'card', label: 'Card', icon: Grid3X3 },
    { value: 'list', label: 'List', icon: List },
    { value: 'minimal', label: 'Minimal', icon: ListOrdered }
  ];

  return (
    <div className="flex items-center justify-between w-full">
      {/* Sort Button Group */}
      <div className="flex items-center gap-1 border rounded-lg p-1 bg-background">
        {sortOptions.map((option) => (
          <Button
            key={option.value}
            variant={sortBy === option.value ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSortBy(option.value as 'date' | 'title' | 'url')}
            className={cn(
              'h-8 px-3 hover:bg-primary/90 hover:text-primary-foreground dark:hover:bg-primary/50 dark:hover:text-primary!',
              sortBy === option.value && 'bg-primary text-primary-foreground dark:bg-primary/30 dark:text-primary hover:bg-primary/90 dark:hover:bg-primary/50'
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

      {/* Layout Button Group */}
      <div className="flex items-center gap-1 border rounded-lg p-1 bg-background">
        {layoutOptions.map((option) => {
          const Icon = option.icon;
          return (
            <Button
              key={option.value}
              variant={layout === option.value ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setLayout(option.value as 'card' | 'list' | 'minimal')}
              className={cn(
                'h-8 px-3 hover:bg-primary/90 hover:text-primary-foreground dark:hover:bg-primary/50 dark:hover:text-primary!',
                layout === option.value && 'bg-primary text-primary-foreground dark:bg-primary/30 dark:text-primary hover:bg-primary/90 dark:hover:bg-primary/50'
              )}
              title={option.label}
            >
              <Icon className="h-4 w-4" />
            </Button>
          );
        })}
      </div>
    </div>
  );
}
