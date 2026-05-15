'use client';

import { useState, useMemo, useEffect, memo } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { Search, Settings, LogOut, Album, Plus, Moon, Sun, Monitor, Tag, Filter, SortAsc, SortDesc, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/stores/auth';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUIStore } from '@/lib/stores/ui';
import { useTags } from '@/hooks/usePinboard';
import { debounce } from '@/lib/utils/debounce';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { fadeInDown, buttonHover } from '@/lib/animations';
import { StaggerContainer } from '@/components/ui/stagger-container';

// Subcomponents with minimal store subscriptions

function HeaderLogo() {
  const clearFilters = useUIStore((s) => s.clearFilters);
  const prefersReducedMotion = useReducedMotion();

  const content = (
    <div className="flex items-center">
      <button
        type="button"
        onClick={clearFilters}
        className="flex items-center space-x-1 cursor-pointer text-emerald-500"
        aria-label="Pinbook – clear filters"
      >
        <Album className="h-5 w-5" />
        <h1 className="text-lg font-book tracking-tight">Pinbook</h1>
      </button>
    </div>
  );

  if (prefersReducedMotion) return content;

  return (
    <motion.button
      type="button"
      onClick={clearFilters}
      className="flex items-center space-x-1 cursor-pointer text-emerald-500"
      aria-label="Pinbook – clear filters"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Album className="h-5 w-5" />
      <h1 className="text-lg font-book tracking-tight">Pinbook</h1>
    </motion.button>
  );
}

function HeaderUserActions() {
  const { username, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground mr-2 hidden sm:inline">{username}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="icon"
            size="icon-sm"
            aria-label="Theme"
            className='bg-transparent'
            title="Theme"
          >
            {theme === 'dark' ? (
              <Moon className='size-4' size={16} strokeWidth={1.5} aria-hidden />
            ) : theme === 'light' ? (
              <Sun className='size-4' size={16} strokeWidth={1.5} aria-hidden />
            ) : (
              <Monitor className='size-4' size={16} strokeWidth={1.5} aria-hidden />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="mb-2">
          <DropdownMenuLabel className="text-xs text-muted-foreground">Theme</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setTheme('light')}>
            <Sun className="mr-2 h-4 w-4" aria-hidden />
            <span>Light</span>
            {theme === 'light' && <span className="ml-auto">✓</span>}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('dark')}>
            <Moon className="mr-2 h-4 w-4" aria-hidden />
            <span>Dark</span>
            {theme === 'dark' && <span className="ml-auto">✓</span>}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('system')}>
            <Monitor className="mr-2 h-4 w-4" aria-hidden />
            <span>System</span>
            {(theme === 'system' || !theme) && <span className="ml-auto">✓</span>}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant="icon" size="icon-sm" className="h-8 w-8 bg-transparent" asChild aria-label="Settings">
        <Link href="/settings">
          <Settings className='size-4' size={16} strokeWidth={1.5} aria-hidden />
        </Link>
      </Button>
      <Button
        variant="icon"
        size="icon-sm"
        className="h-8 w-8 bg-transparent hover:text-destructive"
        onClick={logout}
        aria-label="Logout"
      >
        <LogOut className='size-4' size={16} strokeWidth={1.5} aria-hidden />
      </Button>
    </div>
  );
}

const HeaderSearch = memo(function HeaderSearch() {
  const searchQuery = useUIStore((s) => s.searchQuery);
  const setSearchQuery = useUIStore((s) => s.setSearchQuery);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  const debouncedSearch = useMemo(
    () => debounce((query: string) => setSearchQuery(query), 300),
    [setSearchQuery]
  );

  useEffect(() => {
    import('react-dom').then(({ flushSync }) => {
      flushSync(() => setLocalSearchQuery(searchQuery));
    });
  }, [searchQuery]);

  const handleSearchChange = (value: string) => {
    setLocalSearchQuery(value);
    debouncedSearch(value);
  };

  return (
    <div className="flex-1 max-w-full items-center justify-center">
      <div className="relative flex items-center justify-center border border-muted-foreground/50 dark:border-primary/30 rounded-full px-2 gap-2 focus-within:ring-4 focus-within:ring-primary/20">
        <label htmlFor="header-search" className="text-muted-foreground cursor-pointer">
          <Search className="h-4 w-4" aria-hidden />
        </label>
        <Input
          id="header-search"
          placeholder="Search"
          value={localSearchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          className={`h-8 p-0 w-full border-none ${isSearchFocused ? 'ring-0!' : ''}`}
          aria-label="Search bookmarks"
        />
      </div>
    </div>
  );
});

function HeaderTagsFilter() {
  const selectedTags = useUIStore((s) => s.selectedTags);
  const setSelectedTags = useUIStore((s) => s.setSelectedTags);
  const clearFilters = useUIStore((s) => s.clearFilters);
  const { data: tagsData = {} } = useTags();
  const tags = Object.keys(tagsData);

  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      {tags.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="sm" aria-label="Filter by tags">
              <Tag className='size-4' size={16} strokeWidth={1.5} aria-hidden />
              <span>Tags</span>
              {selectedTags.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {selectedTags.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" side="top" className="mb-2 max-h-100 overflow-y-auto w-64">
            <DropdownMenuLabel>Tags</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {tags.slice(0, 50).map((tag) => (
              <DropdownMenuItem
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={selectedTags.includes(tag) ? 'bg-primary text-primary-foreground' : ''}
              >
                <span className="flex-1">{tag}</span>
                {selectedTags.includes(tag) && <span className="ml-2">✓</span>}
              </DropdownMenuItem>
            ))}
            {tags.length > 50 && (
              <DropdownMenuItem disabled className="text-muted-foreground text-xs">
                +{tags.length - 50} more tags
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {selectedTags.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="rounded-full"
          aria-label="Clear filters"
        >
          <Filter className='size-4' size={16} strokeWidth={1.5} aria-hidden />
          Clear
        </Button>
      )}
    </div>
  );
}

function HeaderSortDropdown() {
  const { sortBy, setSortBy, sortOrder, setSortOrder } = useUIStore();

  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'title', label: 'Title' },
    { value: 'url', label: 'URL' }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="sm" aria-label="Sort bookmarks" className="gap-1">
          {sortOrder === 'asc' ? <SortAsc className='size-4' size={16} strokeWidth={1.5} aria-hidden /> : <SortDesc className='size-4' size={16} strokeWidth={1.5} aria-hidden />}
          <span className="capitalize">{sortBy}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" className="mb-2 w-48">
        <DropdownMenuLabel>Sort By</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {sortOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => setSortBy(option.value as 'date' | 'title' | 'url')}
            className={cn(sortBy === option.value && 'bg-primary text-primary-foreground')}
          >
            <span className="flex-1">{option.label}</span>
            {sortBy === option.value && <span className="ml-2">✓</span>}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
          {sortOrder === 'asc' ? <SortAsc className="mr-2 h-4 w-4" /> : <SortDesc className="mr-2 h-4 w-4" />}
          <span>{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function HeaderAddButton({ onAddBookmark }: { onAddBookmark: () => void }) {
  const prefersReducedMotion = useReducedMotion();

  const content = (
    <Button
      variant="default"
      size="sm"
      onClick={onAddBookmark}
      className="flex items-center px-4"
      aria-label="Add bookmark"
    >
      <Plus className='size-4' size={16} strokeWidth={1.5} aria-hidden />
      <span>Add</span>
    </Button>
  );

  if (prefersReducedMotion) return content;

  return (
    <motion.div whileHover="hover" whileTap="tap" variants={buttonHover}>
      <Button
        variant="default"
        size="sm"
        onClick={onAddBookmark}
        className="flex items-center px-4"
        aria-label="Add bookmark"
      >
        <Plus className='size-4' size={16} strokeWidth={1.5} aria-hidden />
        <span>Add</span>
      </Button>
    </motion.div>
  );
}

interface HeaderProps {
  onAddBookmark?: () => void;
}

export function Header({ onAddBookmark }: HeaderProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const prefersReducedMotion = useReducedMotion();

  const headerContent = (
    <header className="relative w-full max-w-160 mx-auto z-50 gap-2 py-8">
      <div className="container flex h-full flex-col items-center justify-center gap-8">
        <div className="flex items-center w-full justify-between py-4">
          <HeaderLogo />
          <HeaderUserActions />
        </div>

        <div className="flex items-center gap-2 w-full justify-between">
          {onAddBookmark && <HeaderAddButton onAddBookmark={onAddBookmark} />}

          <div className="flex items-center justify-end gap-2">
            {isAuthenticated && <HeaderSearch />}
            {isAuthenticated && <HeaderTagsFilter />}
            {isAuthenticated && <HeaderSortDropdown />}
          </div>
        </div>
      </div>
    </header>
  );

  if (prefersReducedMotion) return headerContent;

  return (
    <motion.header
      className="relative w-full max-w-160 mx-auto z-50 gap-2 py-8"
      initial="hidden"
      animate="visible"
      variants={fadeInDown}
    >
      <StaggerContainer className="container flex h-full flex-col items-center justify-center gap-8" speed="fast">
        <div className="flex items-center w-full justify-between py-4">
          <HeaderLogo />
          <HeaderUserActions />
        </div>

        <div className="flex items-center gap-2 w-full justify-between">
          {onAddBookmark && <HeaderAddButton onAddBookmark={onAddBookmark} />}

          <div className="flex items-center justify-end gap-2">
            {isAuthenticated && <HeaderSearch />}
            {isAuthenticated && <HeaderTagsFilter />}
            {isAuthenticated && <HeaderSortDropdown />}
          </div>
        </div>
      </StaggerContainer>
    </motion.header>
  );
}
