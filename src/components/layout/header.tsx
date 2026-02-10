'use client';

import { useState, useMemo, useEffect, memo } from 'react';
import Link from 'next/link';
import { Search, Settings, LogOut, Paperclip, Plus, Moon, Sun, Monitor, Tag, Filter } from 'lucide-react';
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

// Subcomponents with minimal store subscriptions

function HeaderLogo() {
  const clearFilters = useUIStore((s) => s.clearFilters);
  return (
    <div className="flex items-center space-x-1">
      <button
        type="button"
        onClick={clearFilters}
        className="flex items-center space-x-1 cursor-pointer"
        aria-label="Pinbook – clear filters"
      >
        <Paperclip className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold text-primary tracking-tight">Pinbook</h1>
      </button>
    </div>
  );
}

function HeaderUserActions() {
  const { username, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1">
      <span className="text-sm text-muted-foreground mr-2 hidden sm:inline">{username}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            aria-label="Theme"
            title="Theme"
          >
            {theme === 'dark' ? (
              <Moon className="h-4 w-4" />
            ) : theme === 'light' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Monitor className="h-4 w-4" />
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
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild aria-label="Settings">
        <Link href="/settings">
          <Settings className="h-4 w-4" />
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-destructive hover:text-white hover:bg-destructive"
        onClick={logout}
        aria-label="Logout"
      >
        <LogOut className="h-4 w-4" />
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
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  const handleSearchChange = (value: string) => {
    setLocalSearchQuery(value);
    debouncedSearch(value);
  };

  return (
    <div className="flex-1 max-w-full items-center justify-center">
      <div className="relative flex items-center justify-center border border-primary dark:border-primary/30 rounded-lg px-4 gap-2 focus-within:ring-4 focus-within:ring-primary/20">
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
          className={`h-10 p-0 w-full border-none ${isSearchFocused ? 'ring-0!' : ''}`}
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
            <Button variant="default" size="sm" aria-label="Filter by tags">
              <Tag className="h-4 w-4" aria-hidden />
              <span>Tags</span>
              {selectedTags.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {selectedTags.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" side="top" className="mb-2 max-h-[400px] overflow-y-auto w-64">
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
          <Filter className="h-4 w-4 mr-1" aria-hidden />
          Clear
        </Button>
      )}
    </div>
  );
}

function HeaderAddButton({ onAddBookmark }: { onAddBookmark: () => void }) {
  return (
    <Button
      variant="default"
      size="sm"
      onClick={onAddBookmark}
      className="flex items-center space-x-1 px-4! h-full py-2! bg-accent text-white dark:bg-accent dark:text-primary hover:bg-primary/90 dark:hover:bg-primary/50"
      aria-label="Add bookmark"
    >
      <Plus className="h-4 w-4 text-white m-0!" aria-hidden />
      <span>Add</span>
    </Button>
  );
}

interface HeaderProps {
  onAddBookmark?: () => void;
}

export function Header({ onAddBookmark }: HeaderProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <header className="hidden relative w-full max-w-[720px] mx-auto h-36 lg:flex items-center z-50 gap-2 mb-4 bg-background">
      <div className="container flex h-full flex-col items-center justify-center gap-8 px-4">
        <div className="flex items-center space-x-2 w-full justify-between">
          <HeaderLogo />
          <HeaderUserActions />
        </div>

        <div className="flex items-center gap-2 w-full justify-between">
          {onAddBookmark && <HeaderAddButton onAddBookmark={onAddBookmark} />}

          <div className="flex items-center justify-end gap-2">
            <div className="flex w-fit items-center justify-between group">
              {isAuthenticated && <HeaderSearch />}
            </div>
            {isAuthenticated && <HeaderTagsFilter />}
          </div>
        </div>
      </div>
    </header>
  );
}
