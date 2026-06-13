'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Bookmark, Add, FilterList, Settings } from '@nine-thirty-five/material-symbols-react/rounded/300';
import { useUIStore } from '@/lib/stores/ui';
import { useAuthStore } from '@/lib/stores/auth';
import { ThemeToggle } from '@/components/theme-toggle';
import { SearchInput } from '@/components/ui/search-input';

// Lazy load heavy sheet components
const MobileSidebar = dynamic(
  () => import('./mobile-sidebar').then(m => ({ default: m.MobileSidebar })),
  { ssr: false }
);

interface MobileNavProps {
  onAddBookmark?: () => void;
}

export function MobileNav({ onAddBookmark }: MobileNavProps) {
  const { isAuthenticated } = useAuthStore();
  const {
    searchQuery,
    setSearchQuery
  } = useUIStore();

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  if (!isAuthenticated) return null;

  return (
    <div className="lg:hidden">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 pt-[env(safe-area-inset-top)]">
        <div className="flex h-14 items-center justify-between gap-3">
          {/* Left: Logo */}
          <div className="flex items-center space-x-2 shrink-0">
            <Bookmark size={20} className="text-primary" />
            <span className="font-semibold hidden min-[380px]:inline">Pinbook</span>
          </div>

          {/* Center: Search */}
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search..."
            className="flex-1"
            inputClassName="h-9"
            id="mobile-search"
          />

          {/* Right: Settings & Theme Toggle */}
          <div className="flex items-center space-x-1 shrink-0">
            <Link href="/settings">
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <Settings size={16} />
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 pb-[env(safe-area-inset-bottom)]">
        <div className="flex h-14 items-center justify-between px-2">
          <div className="flex-1" />

          {/* Filter */}
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 px-2"
              >
                <FilterList size={16} className="min-[380px]:mr-2" />
                <span className="text-md">Filter</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] p-0">
              <SheetHeader className="p-4 pb-0">
                <SheetTitle>Filter</SheetTitle>
                <SheetDescription className="sr-only">
                  Filter bookmarks by tags
                </SheetDescription>
              </SheetHeader>
              <MobileSidebar />
            </SheetContent>
          </Sheet>

          {/* Add Bookmark - Right */}
          <Button
            variant="default"
            size="default"
            onClick={onAddBookmark}
            className="h-10 px-3 min-[380px]:px-4!"
          >
            <Add size={16} className="min-[380px]:mr-1" />
            <span className="text-md">Add</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
