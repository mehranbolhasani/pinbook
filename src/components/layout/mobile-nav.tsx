'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, 
  Bookmark, 
  Plus, 
  Search, 
  Settings,
  Filter,
  Grid3X3,
  List,
  Minus
} from 'lucide-react';
import { useBookmarkStore } from '@/lib/stores/bookmarks';
import { useAuthStore } from '@/lib/stores/auth';
import { MobileSidebar } from './mobile-sidebar';

interface MobileNavProps {
  onAddBookmark: () => void;
}

export function MobileNav({ onAddBookmark }: MobileNavProps) {
  const { isAuthenticated } = useAuthStore();
  const { bookmarks, layout, setLayout } = useBookmarkStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!isAuthenticated) return null;

  const unreadCount = bookmarks.filter(bookmark => !bookmark.isRead).length;

  return (
    <div className="lg:hidden">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4">
          {/* Left: Menu & Logo */}
          <div className="flex items-center space-x-2">
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <MobileSidebar onAddBookmark={onAddBookmark} onClose={() => setIsSidebarOpen(false)} />
              </SheetContent>
            </Sheet>
            
            <div className="flex items-center space-x-2">
              <Bookmark className="h-5 w-5 text-primary" />
              <span className="font-semibold">Pinbook</span>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {unreadCount}
                </Badge>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddBookmark}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-around px-4">
          {/* Layout Toggle */}
          <div className="flex items-center space-x-1">
            <Button
              variant={layout === 'card' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setLayout('card')}
              className="h-8 w-8 p-0"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={layout === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setLayout('list')}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={layout === 'minimal' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setLayout('minimal')}
              className="h-8 w-8 p-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>

          {/* Filter Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <Filter className="h-4 w-4" />
          </Button>

          {/* Settings */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
