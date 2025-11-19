'use client';

import { useState, useCallback } from 'react';
 
import { Sidebar } from '@/components/layout/sidebar';
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

export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const { setSearchQuery } = useUIStore();
  
  // React Query Hooks
  const { data: bookmarks = [], isLoading: isBookmarksLoading, error: bookmarksError } = useBookmarks();
  const { mutate: deleteBookmark } = useDeleteBookmark();
  const { mutate: updateBookmark } = useUpdateBookmark();

  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [selectedBookmarkId] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    bookmark: Bookmark | null;
  }>({ isOpen: false, bookmark: null });
  
  const toast = useToast();

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
    // TODO: Implement bookmark navigation
    if (process.env.NODE_ENV === 'development') {
      console.log('Navigate:', direction);
    }
  }, []);

  const handleOpenSelected = useCallback(() => {
    if (selectedBookmarkId) {
      // TODO: Open selected bookmark
      if (process.env.NODE_ENV === 'development') {
        console.log('Open bookmark:', selectedBookmarkId);
      }
    }
  }, [selectedBookmarkId]);

  const handleEditSelected = useCallback(() => {
    if (selectedBookmarkId) {
      // TODO: Edit selected bookmark
      if (process.env.NODE_ENV === 'development') {
        console.log('Edit bookmark:', selectedBookmarkId);
      }
    }
  }, [selectedBookmarkId]);

  
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
      <div className="max-h-screen bg-primary/1 dark:bg-primary/5">
        
        {/* Mobile Navigation */}
        <MobileNav />
        
        <div className="flex max-w-[1024px] mx-auto h-full items-top">
          {/* Desktop Sidebar */}
          <div className="hidden lg:flex items-center h-screen sticky top-2">
            <Sidebar 
              onAddBookmark={handleAddBookmark}
            />
          </div>
          
          {/* Main Content */}
          <main className="flex-1 px-4 lg:px-6 pb-20 lg:pb-6 mt-2 min-w-0">
            <div className="max-w-full mx-auto">
              <BookmarkListErrorBoundary>
                <BookmarkList 
                  bookmarks={bookmarks}
                  isLoading={isBookmarksLoading}
                  onEditBookmark={handleEditBookmark}
                  onDeleteBookmark={handleDeleteBookmark}
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
