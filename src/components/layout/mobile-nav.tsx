'use client';

import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { 
  Paperclip as BookmarkIcon, 
  Plus, 
  Search, 
  Filter,
  Grid3X3,
  List,
  Minus,
  Settings
} from 'lucide-react';
import { useUIStore } from '@/lib/stores/ui';
import { useAuthStore } from '@/lib/stores/auth';
import { ThemeToggle } from '@/components/theme-toggle';
import { debounce } from '@/lib/utils/debounce';

// Lazy load heavy sheet components
const MobileSidebar = dynamic(
  () => import('./mobile-sidebar').then(m => ({ default: m.MobileSidebar })),
  { ssr: false }
);

const MobileAddBookmark = dynamic(
  () => import('@/components/bookmarks/mobile-add-bookmark').then(m => ({ default: m.MobileAddBookmark })),
  { ssr: false }
);

export function MobileNav() {
  const { isAuthenticated } = useAuthStore();
  const { 
    layout, 
    setLayout,
    searchQuery,
    setSearchQuery
  } = useUIStore();
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddBookmarkOpen, setIsAddBookmarkOpen] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Debounced search callback
  const debouncedSearch = useMemo(
    () => debounce((query: string) => setSearchQuery(query), 300),
    [setSearchQuery]
  );

  // Sync local state when external searchQuery changes (e.g., cleared by filters)
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  const handleSearchChange = (value: string) => {
    setLocalSearchQuery(value);
    debouncedSearch(value);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="lg:hidden">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4 gap-3">
          {/* Left: Logo */}
          <div className="flex items-center space-x-2 shrink-0">
            <BookmarkIcon className="h-5 w-5 text-primary" />
            <span className="font-semibold hidden min-[380px]:inline">Pinbook</span>
          </div>

          {/* Center: Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={localSearchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 h-9"
            />
          </div>

          {/* Right: Settings & Theme Toggle */}
          <div className="flex items-center space-x-1 shrink-0">
            <Link href="/settings">
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
        <div className="flex h-14 items-center justify-between px-2">
          {/* Layout Toggle - Left */}
          <div className="flex items-center space-x-1">
            <Button
              variant={layout === 'card' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setLayout('card')}
              className="h-10 w-10 p-0"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={layout === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setLayout('list')}
              className="h-10 w-10 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={layout === 'minimal' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setLayout('minimal')}
              className="h-10 w-10 p-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>

          {/* Sort/Filter Combined - Center */}
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 px-2"
              >
                <Filter className="h-4 w-4 min-[380px]:mr-2" />
                <span className="text-md hidden min-[380px]:inline">Sort/Filter</span>
                <span className="text-md inline min-[380px]:hidden">Filter</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] p-0">
              <MobileSidebar />
            </SheetContent>
          </Sheet>

          {/* Add Bookmark - Right */}
          <Button
            variant="default"
            size="default"
            onClick={() => setIsAddBookmarkOpen(true)}
            className="h-10 px-3 min-[380px]:px-4!"
          >
            <Plus className="h-4 w-4 min-[380px]:mr-1" />
            <span className="text-md">Add</span>
          </Button>
        </div>
      </div>

      {/* Add Bookmark Sheet */}
      <Sheet open={isAddBookmarkOpen} onOpenChange={setIsAddBookmarkOpen}>
        <SheetContent side="bottom" className="h-[90vh] p-0">
          <MobileAddBookmark onClose={() => setIsAddBookmarkOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
