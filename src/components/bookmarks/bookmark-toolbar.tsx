'use client';

import { 
  Grid3X3, 
  List, 
  ListOrdered, 
  LayoutGrid,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUIStore } from '@/lib/stores/ui';

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
    { value: 'card', label: 'Card View', icon: Grid3X3 },
    { value: 'list', label: 'List View', icon: List },
    { value: 'minimal', label: 'Minimal List', icon: ListOrdered }
  ];

  const getSortIcon = () => {
    return sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />;
  };

  const getLayoutIcon = () => {
    const option = layoutOptions.find(opt => opt.value === layout);
    return option ? <option.icon className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />;
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {getSortIcon()}
              <span className="ml-1">Sort by {sortBy}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setSortBy(option.value as 'date' | 'title' | 'url')}
                className={sortBy === option.value ? 'bg-primary/20 hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/20 group' : 'group'}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setSortOrder('asc')}>
              <SortAsc className="mr-2 h-4 w-4 text-foreground group-hover:text-accent" />
              Ascending
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortOrder('desc')}>
              <SortDesc className="mr-2 h-4 w-4 text-foreground group-hover:text-accent" />
              Descending
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Layout Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {getLayoutIcon()}
              <span className="ml-1">Layout</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>View Layout</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {layoutOptions.map((option) => {
              const Icon = option.icon;
              return (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setLayout(option.value as 'card' | 'list' | 'minimal')}
                  className={layout === option.value ? 'bg-primary/20 hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/20 group' : 'group'}
                >
                  <Icon className="mr-2 h-4 w-4 text-foreground group-hover:text-accent" />
                  {option.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
