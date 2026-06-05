'use client';

import { memo } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { Settings02Icon, Logout01Icon, Bookmark01Icon, Add01Icon, Tag01Icon, FilterIcon, SortByUp01Icon, SortDescendingIcon, ChevronDownIcon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/stores/auth';
import { ThemeToggle } from '@/components/theme-toggle';
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
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { fadeInDown, buttonHover } from '@/lib/animations';
import { StaggerContainer } from '@/components/ui/stagger-container';
import { SearchInput } from '@/components/ui/search-input';

// Subcomponents with minimal store subscriptions

function HeaderLogo() {
  const clearFilters = useUIStore((s) => s.clearFilters);
  const prefersReducedMotion = useReducedMotion();
  const { username } = useAuthStore();

  const content = (
    <div className="flex items-center">
      <button
        type="button"
        onClick={clearFilters}
        className="flex items-center space-x-1 cursor-pointer text-primary"
        aria-label="Pinbook – clear filters"
      >
        <HugeiconsIcon icon={Bookmark01Icon} size={32} strokeWidth={1.5} />
        <div className="flex flex-col items-start">
          <h1 className="text-lg font-book tracking-tight leading-4">Pinbook</h1>
          <span className="text-xs text-primary/50 leading-3">{username}</span>
        </div>
      </button>
    </div>
  );

  if (prefersReducedMotion) return content;

  return (
      <motion.button
      type="button"
      onClick={clearFilters}
      className="flex items-center space-x-1 cursor-pointer text-primary"
      aria-label="Pinbook – clear filters"
      whileHover={{ scale: 1 }}
      whileTap={{ scale: 0.95 }}
    >
      <HugeiconsIcon icon={Bookmark01Icon} size={32} strokeWidth={1.5} />
      <div className="flex flex-col items-start">
        <h1 className="text-lg font-book tracking-tight leading-4">Pinbook</h1>
        <span className="text-xs text-primary/50 leading-3">{username}</span>
      </div>
    </motion.button>
  );
}

function HeaderUserActions() {
  const { logout } = useAuthStore();

  return (
    <div className="flex items-center gap-1">
      <ThemeToggle variant="icon" />
      <Button variant="icon" size="icon-sm" className="h-8 w-8 bg-transparent text-primary" asChild aria-label="Settings">
        <Link href="/settings">
          <HugeiconsIcon icon={Settings02Icon} size={16} strokeWidth={1.5} aria-hidden />
        </Link>
      </Button>
      <Button
        variant="icon"
        size="icon-sm"
        className="h-8 w-8 bg-transparent hover:text-destructive"
        onClick={logout}
        aria-label="Logout"
      >
        <HugeiconsIcon icon={Logout01Icon} size={16} strokeWidth={1.5} aria-hidden />
      </Button>
    </div>
  );
}

const HeaderSearch = memo(function HeaderSearch() {
  const searchQuery = useUIStore((s) => s.searchQuery);
  const setSearchQuery = useUIStore((s) => s.setSearchQuery);

  return (
    <div className="flex-1 max-w-full items-center justify-center w-full min-w-48">
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search"
        className="justify-center border-x border-x-primary/20 rounded-none px-2 gap-2 focus-within:ring-4 focus-within:ring-primary/20 h-10"
        inputClassName="h-10 w-full border-none focus-visible:ring-0 pl-8"
        id="header-search"
      />
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
    <div className="flex items-center justify-end gap-0">
      {tags.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="default" aria-label="Filter by tags" className="border-0 border-r border-primary/20">
              <HugeiconsIcon icon={Tag01Icon} size={16} strokeWidth={1.5} aria-hidden />
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
          size="default"
          onClick={clearFilters}
          className="rounded-none"
          aria-label="Clear filters"
        >
          <HugeiconsIcon icon={FilterIcon} size={16} strokeWidth={1.5} aria-hidden />
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
        <Button variant="outline" size="default" aria-label="Sort bookmarks" className="gap-1 border-none">
          {sortOrder === 'asc' ? <HugeiconsIcon icon={SortByUp01Icon} size={16} strokeWidth={1.5} aria-hidden /> : <HugeiconsIcon icon={SortDescendingIcon} size={16} strokeWidth={1.5} aria-hidden />}
          <span className="capitalize">{sortBy}</span>
          <HugeiconsIcon icon={ChevronDownIcon} size={12} className="opacity-50" />
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
          {sortOrder === 'asc' ? <HugeiconsIcon icon={SortByUp01Icon} size={16} className="mr-2" /> : <HugeiconsIcon icon={SortDescendingIcon} size={16} className="mr-2" />}
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
      <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={1.5} aria-hidden />
      <span>Add</span>
    </Button>
  );

  if (prefersReducedMotion) return content;

  return (
    <motion.div whileHover="hover" whileTap="tap" variants={buttonHover}>
      <Button
        variant="default"
        size="default"
        onClick={onAddBookmark}
        className="flex items-center px-4"
        aria-label="Add bookmark"
      >
        <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={1.5} aria-hidden />
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
    <header className="relative w-full max-w-160 mx-auto z-50 gap-0 border-x border-x-primary/20 bg-card h-50">
      <div className="container flex h-full flex-col items-center justify-center">
        <div className="flex items-center w-full justify-between border-b border-primary/40 p-4">
          <HeaderLogo />
          <HeaderUserActions />
        </div>

        <div className="flex items-center gap-0 w-full justify-between border-b border-primary/20">
          {onAddBookmark && <HeaderAddButton onAddBookmark={onAddBookmark} />}

          <div className="flex items-center justify-end gap-0">
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
      className="relative w-full max-w-160 mx-auto z-50 gap-0 border-x border-x-primary/20 bg-card h-50 flex flex-col"
      initial="hidden"
      animate="visible"
      variants={fadeInDown}
    >
      <div className="w-full h-full border-y border-y-(--pattern-fg) bg-[image:repeating-linear-gradient(315deg,_var(--pattern-fg)_0,_var(--pattern-fg)_1px,_transparent_0,_transparent_50%)] bg-[size:10px_10px] bg-fixed [--pattern-fg:var(--color-blue-energy-600)]/15 max-lg:hidden dark:[--pattern-fg:var(--color-white)]/10"></div>
      <StaggerContainer className="container flex h-fit flex-col items-center justify-end" speed="fast">
        <div className="flex items-center w-full justify-between border-b border-primary/50 p-4">
          <HeaderLogo />
          <HeaderUserActions />
        </div>

        <div className="flex items-center gap-0 w-full justify-between border-b border-primary/50">
          {onAddBookmark && <HeaderAddButton onAddBookmark={onAddBookmark} />}

          <div className="w-full h-full border-y-0 border-y-(--pattern-fg) bg-[image:repeating-linear-gradient(315deg,_var(--pattern-fg)_0,_var(--pattern-fg)_1px,_transparent_0,_transparent_50%)] bg-[size:10px_10px] bg-fixed [--pattern-fg:var(--color-blue-energy-600)]/15 max-lg:hidden dark:[--pattern-fg:var(--color-white)]/10"></div>

          <div className="flex items-center justify-end gap-0 flex-1 w-full">
            {isAuthenticated && <HeaderSearch />}
            {isAuthenticated && <HeaderTagsFilter />}
            {isAuthenticated && <HeaderSortDropdown />}
          </div>
        </div>
      </StaggerContainer>
    </motion.header>
  );
}
