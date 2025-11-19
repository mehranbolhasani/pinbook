'use client';

import { useState, useRef } from 'react';
import { useDrag } from '@use-gesture/react';
import { Bookmark } from '@/types/pinboard';
import { Button } from '@/components/ui/button';
import { ExternalLink, Copy, Edit, Trash2 } from 'lucide-react';

interface SwipeableBookmarkItemProps {
  bookmark: Bookmark;
  onEdit?: (bookmark: Bookmark) => void;
  onDelete?: (bookmark: Bookmark) => void;
  children: React.ReactNode;
}

export function SwipeableBookmarkItem({
  bookmark,
  onEdit,
  onDelete,
  children,
}: SwipeableBookmarkItemProps) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const actionWidth = 70; // Width per action button
  const maxSwipeLeft = actionWidth * 2; // Open, Copy
  const maxSwipeRight = actionWidth * 2; // Edit, Delete
  const threshold = 30; // Minimum swipe to reveal

  const handleOpenUrl = () => {
    window.open(bookmark.url, '_blank', 'noopener,noreferrer');
    resetSwipe();
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(bookmark.url);
    resetSwipe();
  };

  const handleEdit = () => {
    onEdit?.(bookmark);
    resetSwipe();
  };

  const handleDelete = () => {
    onDelete?.(bookmark);
    resetSwipe();
  };

  const resetSwipe = () => {
    setSwipeOffset(0);
    setIsRevealed(false);
  };

  const bind = useDrag(
    ({ movement: [mx], last, velocity: [vx] }) => {
      // Prevent vertical scroll interference
      if (Math.abs(mx) < 10) {
        return;
      }

      if (!last) {
        // During drag
        if (mx < 0) {
          // Swipe left - reveal right actions (Open, Copy)
          setSwipeOffset(Math.max(mx, -maxSwipeLeft));
        } else {
          // Swipe right - reveal left actions (Edit, Delete)
          setSwipeOffset(Math.min(mx, maxSwipeRight));
        }
      } else {
        // On release
        const absOffset = Math.abs(mx);
        const shouldReveal = absOffset > threshold || Math.abs(vx) > 0.5;

        if (shouldReveal) {
          if (mx < 0) {
            // Snap to left reveal
            setSwipeOffset(-maxSwipeLeft);
            setIsRevealed(true);
          } else {
            // Snap to right reveal
            setSwipeOffset(maxSwipeRight);
            setIsRevealed(true);
          }
        } else {
          // Reset
          resetSwipe();
        }
      }
    },
    {
      axis: 'x',
      filterTaps: true,
      pointer: { touch: true },
    }
  );

  return (
    <div className="relative overflow-hidden lg:overflow-visible" ref={containerRef}>
      {/* Left Actions (Edit, Delete) - revealed on swipe right */}
      <div
        className="absolute left-0 top-0 bottom-0 flex items-center justify-start lg:hidden gap-1"
        style={{
          width: maxSwipeRight,
        }}
      >
        {onEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="h-full w-[65px] rounded-lg bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Edit className="h-5 w-5" />
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="h-full w-[65px] rounded-lg bg-destructive hover:bg-destructive/90 text-white"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Right Actions (Open, Copy) - revealed on swipe left */}
      <div
        className="absolute right-0 top-0 bottom-0 flex items-center justify-end lg:hidden gap-2"
        style={{
          width: maxSwipeLeft,
        }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyUrl}
          className="h-full w-[65px] rounded-lg bg-gray-500 hover:bg-gray-600 text-white"
        >
          <Copy className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleOpenUrl}
          className="h-full w-[65px] rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <ExternalLink className="h-5 w-5" />
        </Button>
      </div>

      {/* Main Content */}
      <div
        {...bind()}
        className="relative z-10 bg-background transition-transform touch-pan-y"
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: isRevealed ? 'transform 0.2s ease-out' : 'none',
        }}
        onClick={(e) => {
          if (isRevealed) {
            e.preventDefault();
            resetSwipe();
          }
        }}
      >
        {children}
      </div>
    </div>
  );
}
