'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { HugeiconsIcon } from '@hugeicons/react';
import { Bookmark01Icon, Add01Icon, FilterIcon, Settings02Icon } from '@hugeicons/core-free-icons';
import { useUIStore } from '@/lib/stores/ui';
import { useAuthStore } from '@/lib/stores/auth';
import { ThemeToggle } from '@/components/theme-toggle';
import { SearchInput } from '@/components/ui/search-input';

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
    searchQuery,
    setSearchQuery
  } = useUIStore();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddBookmarkOpen, setIsAddBookmarkOpen] = useState(false);

  if (!isAuthenticated) return null;

  return (
    <div className="lg:hidden">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4 gap-3">
          {/* Left: Logo */}
          <div className="flex items-center space-x-2 shrink-0">
            <HugeiconsIcon icon={Bookmark01Icon} size={20} className="text-primary" />
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
                <HugeiconsIcon icon={Settings02Icon} size={16} />
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
        <div className="flex h-14 items-center justify-between px-2">
          <div className="flex-1" />

          {/* Sort/Filter Combined - Center */}
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 px-2"
              >
                <HugeiconsIcon icon={FilterIcon} size={16} className="min-[380px]:mr-2" />
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
            <HugeiconsIcon icon={Add01Icon} size={16} className="min-[380px]:mr-1" />
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
