'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
 
import { MobileNav } from '@/components/layout/mobile-nav';
import { BookmarkList } from '@/components/bookmarks/bookmark-list';
import { EditBookmarkDialog } from '@/components/bookmarks/edit-bookmark-dialog';
import { AddBookmarkDialog } from '@/components/bookmarks/add-bookmark-dialog';
import { LoginForm } from '@/components/auth/login-form';
import { KeyboardShortcutsModal } from '@/components/ui/keyboard-shortcuts-modal';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useAuthStore } from '@/lib/stores/auth';
import { useUIStore } from '@/lib/stores/ui';
import { Bookmark } from '@/types/pinboard';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useToast } from '@/hooks/useToast';
import { ErrorBoundary, BookmarkListErrorBoundary } from '@/components/error-boundary';
import { useBookmarks, useDeleteBookmark, useUpdateBookmark } from '@/hooks/usePinboard';
import { Header } from '@/components/layout/header';

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

  // Compute filtered and sorted bookmarks (same logic as BookmarkList)
  const filteredAndSortedBookmarks = useMemo(() => {
    let filtered = [...bookmarks];

    // Filter by folder
    if (selectedFolderId !== null) {
      filtered = filtered.filter(bookmark => bookmark.folderId === selectedFolderId);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(bookmark => 
        bookmark.title.toLowerCase().includes(query) ||
        bookmark.description.toLowerCase().includes(query) ||
        bookmark.url.toLowerCase().includes(query) ||
        bookmark.extended.toLowerCase().includes(query)
      );
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(bookmark => 
        selectedTags.some(tag => bookmark.tags.includes(tag))
      );
    }

    // Sort bookmarks
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'url':
          comparison = a.url.localeCompare(b.url);
          break;
        case 'date':
        default:
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [bookmarks, searchQuery, selectedTags, selectedFolderId, sortBy, sortOrder]);

  const selectedBookmark = selectedBookmarkIndex !== null && selectedBookmarkIndex >= 0 && selectedBookmarkIndex < filteredAndSortedBookmarks.length
    ? filteredAndSortedBookmarks[selectedBookmarkIndex]
    : null;
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
                  onEditBookmark={handleEditBookmark}
                  onDeleteBookmark={handleDeleteBookmark}
                  selectedBookmarkId={selectedBookmarkId}
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
