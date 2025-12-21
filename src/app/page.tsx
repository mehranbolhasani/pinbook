'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
 
import dynamic from 'next/dynamic';
import { BookmarkList } from '@/components/bookmarks/bookmark-list';
import { LoginForm } from '@/components/auth/login-form';

// Lazy load dialogs and modals
const EditBookmarkDialog = dynamic(
  () => import('@/components/bookmarks/edit-bookmark-dialog').then(mod => ({ default: mod.EditBookmarkDialog })),
  { ssr: false }
);

const AddBookmarkDialog = dynamic(
  () => import('@/components/bookmarks/add-bookmark-dialog').then(mod => ({ default: mod.AddBookmarkDialog })),
  { ssr: false }
);

const KeyboardShortcutsModal = dynamic(
  () => import('@/components/ui/keyboard-shortcuts-modal').then(mod => ({ default: mod.KeyboardShortcutsModal })),
  { ssr: false }
);

// Lazy load layout components
const MobileNav = dynamic(
  () => import('@/components/layout/mobile-nav').then(mod => ({ default: mod.MobileNav })),
  { ssr: false }
);

const Header = dynamic(
  () => import('@/components/layout/header').then(mod => ({ default: mod.Header })),
  { ssr: false }
);

const ConfirmationDialog = dynamic(
  () => import('@/components/ui/confirmation-dialog').then(mod => ({ default: mod.ConfirmationDialog })),
  { ssr: false }
);

import { useAuthStore } from '@/lib/stores/auth';
import { useUIStore } from '@/lib/stores/ui';
import { Bookmark } from '@/types/pinboard';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useToast } from '@/hooks/useToast';
import { ErrorBoundary, BookmarkListErrorBoundary } from '@/components/error-boundary';
import { useBookmarks, useDeleteBookmark, useUpdateBookmark } from '@/hooks/usePinboard';

import { useFilteredBookmarks } from '@/hooks/useFilteredBookmarks';

export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const { setSearchQuery, searchQuery, selectedTags, selectedFolderId, sortBy, sortOrder } = useUIStore();
  
  // React Query Hooks
  const { data: bookmarks = [], isLoading: isBookmarksLoading, error: bookmarksError } = useBookmarks();
  const { mutate: deleteBookmark } = useDeleteBookmark();
  const { mutate: updateBookmark } = useUpdateBookmark();

  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [selectedBookmarkIndex, setSelectedBookmarkIndex] = useState<number | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    bookmark: Bookmark | null;
  }>({ isOpen: false, bookmark: null });
  
  const toast = useToast();

  // Compute filtered and sorted bookmarks using shared hook
  const filteredAndSortedBookmarks = useFilteredBookmarks(bookmarks);

  const selectedBookmark = useMemo(() => {
    if (selectedBookmarkIndex === null || selectedBookmarkIndex < 0 || selectedBookmarkIndex >= filteredAndSortedBookmarks.length) {
      return null;
    }
    return filteredAndSortedBookmarks[selectedBookmarkIndex];
  }, [selectedBookmarkIndex, filteredAndSortedBookmarks]);

  const selectedBookmarkId = selectedBookmark?.id || null;

  // Reset selected index when filters change
  useEffect(() => {
    setSelectedBookmarkIndex(null);
  }, [searchQuery, selectedTags, selectedFolderId, sortBy, sortOrder]);

  // Sidebar search removed; bookmarks list contains its own search input.

  const handleAddBookmark = () => {
    setIsAddDialogOpen(true);
  };

  const handleEditBookmark = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
    setIsEditDialogOpen(true);
  };

  const handleSaveBookmark = (updatedBookmark: Bookmark) => {
    updateBookmark({ id: updatedBookmark.id, updates: updatedBookmark }, {
      onSuccess: () => {
        toast.showSuccess('Bookmark updated', `"${updatedBookmark.title}" has been updated`);
        setEditingBookmark(null);
        setIsEditDialogOpen(false);
      },
      onError: (error) => {
        toast.showError('Failed to update bookmark', error instanceof Error ? error.message : 'Unknown error');
      }
    });
  };

  const handleCloseEditDialog = () => {
    setEditingBookmark(null);
    setIsEditDialogOpen(false);
  };

  const handleDeleteBookmark = (bookmark: Bookmark) => {
    setDeleteConfirmation({ isOpen: true, bookmark });
  };

  const handleConfirmDelete = () => {
    const bookmark = deleteConfirmation.bookmark;
    if (!bookmark) return;

    deleteBookmark(bookmark.url, {
      onSuccess: () => {
        toast.showSuccess('Bookmark deleted', `"${bookmark.title}" has been deleted`);
        setDeleteConfirmation({ isOpen: false, bookmark: null });
      },
      onError: (error) => {
        toast.showError('Failed to delete bookmark', error instanceof Error ? error.message : 'Unknown error');
      }
    });
  };

  // Keyboard shortcuts handlers
  const handleFocusSearch = useCallback(() => {
    // Optionally clear query to make the list search visible
    setSearchQuery('');
  }, [setSearchQuery]);

  const handleCloseDialogs = useCallback(() => {
    setIsEditDialogOpen(false);
    setIsAddDialogOpen(false);
    setIsShortcutsModalOpen(false);
    setEditingBookmark(null);
  }, []);

  const handleShowShortcuts = useCallback(() => {
    setIsShortcutsModalOpen(true);
  }, []);

  const handleNavigate = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (filteredAndSortedBookmarks.length === 0) return;

    setSelectedBookmarkIndex((currentIndex) => {
      // If no bookmark is selected, start at the first one
      if (currentIndex === null) {
        return 0;
      }

      let newIndex = currentIndex;

      switch (direction) {
        case 'up':
          newIndex = Math.max(0, currentIndex - 1);
          break;
        case 'down':
          newIndex = Math.min(filteredAndSortedBookmarks.length - 1, currentIndex + 1);
          break;
        case 'left':
        case 'right':
          // Left/right navigation not implemented for list view
          // Could be used for grid layouts in the future
          break;
      }

      return newIndex;
    });
  }, [filteredAndSortedBookmarks.length]);

  const handleOpenSelected = useCallback(() => {
    if (selectedBookmark) {
      window.open(selectedBookmark.url, '_blank', 'noopener,noreferrer');
    }
  }, [selectedBookmark]);

  const handleEditSelected = useCallback(() => {
    if (selectedBookmark) {
      handleEditBookmark(selectedBookmark);
    }
  }, [selectedBookmark]);

  const handleEditBookmarkMemo = useCallback((bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
    setIsEditDialogOpen(true);
  }, []);

  const handleDeleteBookmarkMemo = useCallback((bookmark: Bookmark) => {
    setDeleteConfirmation({ isOpen: true, bookmark });
  }, []);

  
  // Set up keyboard shortcuts
  useKeyboardShortcuts({
    onSearch: handleFocusSearch,
    onAddBookmark: handleAddBookmark,
    onCloseDialog: handleCloseDialogs,
    onNavigate: handleNavigate,
    onOpenSelected: handleOpenSelected,
    onEditSelected: handleEditSelected,
    
    onShowHelp: handleShowShortcuts,
    isDialogOpen: isEditDialogOpen || isAddDialogOpen || isShortcutsModalOpen
  });

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  if (bookmarksError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-destructive">Error loading bookmarks</h2>
          <p className="text-muted-foreground">{bookmarksError instanceof Error ? bookmarksError.message : 'Unknown error'}</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="max-h-screen">

        <div className="bg-background dark:bg-background h-screen w-screen fixed top-0 left-0 -z-10"></div>

        <div className="skeleton fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[720px] h-screen -z-10">
          <span className="absolute top-0 left-0 w-px h-full bg-primary/15"></span>
          <span className="absolute top-0 right-0 w-px h-full bg-primary/15"></span>
        </div>

        <div className="flex items-center justify-center fixed -top-20 left-1/2 -translate-x-1/2 w-full max-w-[720px] h-1/5 -z-10 blur-3xl opacity-30">
          <span className="relative w-full h-full bg-primary/15 aspect-square rounded-full blur-2xl -right-12"></span>
          <span className="relative w-full h-full bg-primary/35 aspect-square rounded-full blur-2xl"></span>
          <span className="relative w-full h-full bg-primary/15 aspect-square rounded-full blur-2xl -left-12"></span>
        </div>
        
        {/* Mobile Navigation */}
        <MobileNav />
        
        {/* Desktop Header */}
        <Header onSearch={setSearchQuery} searchQuery={searchQuery} searchRef={undefined} onAddBookmark={handleAddBookmark} />
        
        <div className="flex w-full max-w-[720px] mx-auto h-full items-start px-4 gap-4">
          {/* Main Content */}
          <main className="flex-1 min-w-0 py-6 w-full">
            <div className="max-w-full mx-auto">
              <BookmarkListErrorBoundary>
              <BookmarkList 
                bookmarks={bookmarks}
                isLoading={isBookmarksLoading}
                onEditBookmark={handleEditBookmarkMemo}
                onDeleteBookmark={handleDeleteBookmarkMemo}
              />
              </BookmarkListErrorBoundary>
            </div>
          </main>
        </div>
        
        {/* Edit Bookmark Dialog */}
        <EditBookmarkDialog
          bookmark={editingBookmark}
          isOpen={isEditDialogOpen}
          onClose={handleCloseEditDialog}
          onSave={handleSaveBookmark}
        />
        
        {/* Add Bookmark Dialog */}
        <AddBookmarkDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
        />
        
        {/* Keyboard Shortcuts Modal */}
        <KeyboardShortcutsModal
          isOpen={isShortcutsModalOpen}
          onClose={() => setIsShortcutsModalOpen(false)}
        />

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={deleteConfirmation.isOpen}
          onClose={() => setDeleteConfirmation({ isOpen: false, bookmark: null })}
          onConfirm={handleConfirmDelete}
          title="Delete Bookmark"
          description={`Are you sure you want to delete "${deleteConfirmation.bookmark?.title}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
        />
      </div>
    </ErrorBoundary>
  );
}
