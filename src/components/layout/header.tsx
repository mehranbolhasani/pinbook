'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Settings, LogOut, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/stores/auth';
import { useBookmarkStore } from '@/lib/stores/bookmarks';

interface HeaderProps {
  onSearch: (query: string) => void;
  searchQuery: string;
}

export function Header({ onSearch, searchQuery }: HeaderProps) {
  const { isAuthenticated, username, logout } = useAuthStore();
  const { bookmarks } = useBookmarkStore();
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo and Title */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Bookmark className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Pinbook</h1>
          </div>
          {isAuthenticated && (
            <Badge variant="secondary" className="text-xs">
              {bookmarks.length} bookmarks
            </Badge>
          )}
        </div>

        {/* Search Bar */}
        {isAuthenticated && (
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search bookmarks..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={`pl-10 transition-all duration-200 ${
                  isSearchFocused ? 'ring-2 ring-primary' : ''
                }`}
              />
            </div>
          </div>
        )}

        {/* User Actions */}
        <div className="flex items-center space-x-2">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-muted-foreground">
                {username}
              </span>
              <Link href="/settings">
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
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
