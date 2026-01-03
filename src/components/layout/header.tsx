'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Settings, LogOut, Paperclip, Plus, Moon, Sun, Monitor, Menu, Tag, Filter } from 'lucide-react';
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

interface HeaderProps {
  onSearch: (query: string) => void;
  searchQuery: string;
  onAddBookmark?: () => void;
}

export function Header({ onSearch, searchQuery, onAddBookmark }: HeaderProps) {
  const { isAuthenticated, username, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  
  const { 
    selectedTags, 
    setSelectedTags, 
    clearFilters 
  } = useUIStore();
  
  const { data: tagsData = {} } = useTags();
  const tags = Object.keys(tagsData);

  // Debounced search callback
  const debouncedSearch = useMemo(
    () => debounce((query: string) => onSearch(query), 300),
    [onSearch]
  );

  // Sync local state when external searchQuery changes (e.g., cleared by filters)
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  const handleSearchChange = (value: string) => {
    setLocalSearchQuery(value);
    debouncedSearch(value);
  };

  const handleLogout = () => {
    logout();
  };

  const handleSettings = () => {
    router.push('/settings');
  };

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
    <header className="hidden sticky top-0 w-full max-w-[720px] mx-auto h-24 sm:flex items-center z-50 gap-2 border-b border-primary/15 mb-4 bg-background">
      <div className="container flex h-fit items-center justify-between gap-2 px-4">
        {/* Logo and Title */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
              <button onClick={handleClearFilters} className="flex items-center space-x-1 cursor-pointer">
                <Paperclip className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold text-primary tracking-tight">Pinbook</h1>
              </button>
          </div>
        </div>

        {/* Navigation: Tags */}
        {isAuthenticated && (
          <div className="flex items-center flex-1 justify-end gap-2">
            {/* Tags Dropdown */}
            {tags.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant={selectedTags.length > 0 ? "default" : "ghost"}
                    size="sm"
                    className="rounded-full"
                  >
                    <Tag className="h-4 w-4" />
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

            {/* Clear Filters */}
            {selectedTags.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="rounded-full"
              >
                <Filter className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        )}

        {/* User Actions */}
        <div className="flex items-center gap-2">
          {onAddBookmark && (
            <Button
              variant="default"
              size="sm"
              onClick={onAddBookmark}
              className="flex items-center space-x-1 rounded-full px-4! h-full py-2! bg-accent text-white dark:bg-accent dark:text-primary hover:bg-primary/90 dark:hover:bg-primary/50"
            >
              <Plus className="h-4 w-4 text-white m-0!" />
              <span>Add</span>
            </Button>
          )}

          <div className="flex w-fit items-center justify-between group">
            {/* Search Bar */}
            {isAuthenticated && (
              <div className="flex-1 max-w-full items-center justify-center">
                <div className="relative flex items-center justify-center border border-primary dark:border-primary/30 rounded-full px-4 gap-2 focus-within:ring-4 focus-within:ring-primary/20">
                  <label htmlFor="search" className="text-muted-foreground cursor-pointer"><Search className="h-4 w-4" /></label>
                  <Input
                    id="search"
                    placeholder="Search"
                    value={localSearchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className={`h-10 p-0 w-full border-none ${isSearchFocused ? 'ring-0!' : ''
                      }`}
                  />
                </div>
              </div>
            )}
          </div>
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-transparent hover:text-primary">
                  <Menu className="h-6! w-6!" />
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="top" className="mb-2">
                <DropdownMenuLabel>{username}</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Theme Toggle */}
                <DropdownMenuLabel className="text-xs text-muted-foreground">Theme</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setTheme('light')} className="hover:*:text-white!">
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light</span>
                  {theme === 'light' && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')} className="hover:*:text-white!">
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark</span>
                  {theme === 'dark' && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')} className="hover:*:text-white!">
                  <Monitor className="mr-2 h-4 w-4" />
                  <span>System</span>
                  {(theme === 'system' || !theme) && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Settings */}
                <DropdownMenuItem onClick={handleSettings} className="hover:*:text-white!">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>

                {/* Logout */}
                <DropdownMenuItem onClick={handleLogout} variant="destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="default" size="sm">
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
