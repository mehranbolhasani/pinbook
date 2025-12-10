'use client';

import { useState, forwardRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Settings, LogOut, Paperclip, Plus, Moon, Sun, Monitor, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

interface HeaderProps {
  onSearch: (query: string) => void;
  searchQuery: string;
  searchRef?: React.RefObject<HTMLInputElement | null>;
  onAddBookmark?: () => void;
}

export const Header = forwardRef<HTMLInputElement, HeaderProps>(({ onSearch, searchQuery, searchRef, onAddBookmark }, ref) => {
  const { isAuthenticated, username, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  return (
    <header className="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-5xl mx-auto h-36 flex items-center z-50">
      <div className="fake-shadow absolute rounded-full w-full h-18">
        <div className="absolute rounded-full w-full h-full bg-primary/15 -top-2 left-1/2 -translate-x-1/2 blur-3xl"></div>
      </div>
      <div className="container flex h-fit items-center justify-between px-4 py-2 bg-white/90 dark:bg-primary/5 rounded-full border border-white backdrop-blur-lg shadow-xl">
        {/* Logo and Title with Add Bookmark */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Paperclip className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-primary tracking-tight">Pinbook</h1>
          </div>
        </div>

        {/* Search Bar */}
        {isAuthenticated && (
          <div className="flex-1 max-w-md mx-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchRef || ref}
                placeholder="Search bookmarks..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={`pl-10 transition-all duration-200 ${isSearchFocused ? 'ring-2 ring-primary' : ''
                  }`}
              />
            </div>
          </div>
        )}

        {/* User Actions */}
        <div className="flex items-center space-x-2">
          {onAddBookmark && (
            <Button
              variant="default"
              size="sm"
              onClick={onAddBookmark}
              className="flex items-center space-x-1 rounded-full px-4! h-full py-3! bg-primary text-white"
            >
              <Plus className="h-4 w-4 text-white m-0!" />
              <span>Add</span>
            </Button>
          )}
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
});

Header.displayName = 'Header';
