'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { BookmarkList } from '@/components/bookmarks/bookmark-list';
import { EditBookmarkDialog } from '@/components/bookmarks/edit-bookmark-dialog';
import { AddBookmarkDialog } from '@/components/bookmarks/add-bookmark-dialog';
import { LoginForm } from '@/components/auth/login-form';
import { KeyboardShortcutsModal } from '@/components/ui/keyboard-shortcuts-modal';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useAuthStore } from '@/lib/stores/auth';
import { useBookmarkStore } from '@/lib/stores/bookmarks';
import { getPinboardAPI } from '@/lib/api/pinboard';
import { Bookmark } from '@/types/pinboard';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useToast } from '@/hooks/useToast';

export default function Home() {
  const { isAuthenticated, apiToken } = useAuthStore();
  const { 
    setBookmarks, 
    setTags, 
    setLoading, 
    setError,
    searchQuery,
    setSearchQuery,
    updateBookmark,
    removeBookmark
  } = useBookmarkStore();
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [selectedBookmarkId] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    bookmark: Bookmark | null;
  }>({ isOpen: false, bookmark: null });
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const loadBookmarks = useCallback(async () => {
    if (!apiToken) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const api = getPinboardAPI(apiToken);
      if (!api) throw new Error('Failed to initialize API');
      
      console.log('Loading bookmarks and tags...');
      const [bookmarks, tags] = await Promise.all([
        api.getAllBookmarks(),
        api.getTags()
      ]);
      
      console.log('Loaded bookmarks:', bookmarks.length);
      console.log('Loaded tags:', Object.keys(tags).length);
      console.log('Sample bookmark:', bookmarks[0]);
      
      setBookmarks(bookmarks);
      setTags(Object.keys(tags));
      setIsInitialized(true);
      // Only show success toast on initial load, not on refreshes
      if (bookmarks.length > 0 && !isInitialized) {
        toast.showSuccess('Bookmarks loaded successfully', `${bookmarks.length} bookmarks found`);
      }
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load bookmarks';
      setError(errorMessage);
      toast.showError('Failed to load bookmarks', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [apiToken, setLoading, setError, setBookmarks, setTags, setIsInitialized, isInitialized, toast]);

  // Load bookmarks when authenticated
  useEffect(() => {
    if (isAuthenticated && apiToken && !isInitialized) {
      loadBookmarks();
    }
  }, [isAuthenticated, apiToken, isInitialized, loadBookmarks]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleAddBookmark = () => {
    setIsAddDialogOpen(true);
  };

  const handleEditBookmark = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
    setIsEditDialogOpen(true);
  };

  const handleSaveBookmark = (updatedBookmark: Bookmark) => {
    updateBookmark(updatedBookmark.id, updatedBookmark);
    setEditingBookmark(null);
    setIsEditDialogOpen(false);
  };

  const handleCloseEditDialog = () => {
    setEditingBookmark(null);
    setIsEditDialogOpen(false);
  };

  const handleDeleteBookmark = (bookmark: Bookmark) => {
    setDeleteConfirmation({ isOpen: true, bookmark });
  };

  const handleConfirmDelete = async () => {
    const bookmark = deleteConfirmation.bookmark;
    if (!bookmark || !apiToken) return;

    setLoading(true);
    setError(null);

    try {
      const api = getPinboardAPI(apiToken);
      if (!api) throw new Error('Failed to initialize API');

      await api.deleteBookmark(bookmark.url);
      removeBookmark(bookmark.id);
      toast.showSuccess('Bookmark deleted', `"${bookmark.title}" has been deleted`);
    } catch (error) {
      console.error('Failed to delete bookmark:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete bookmark';
      setError(errorMessage);
      toast.showError('Failed to delete bookmark', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Keyboard shortcuts handlers
  const handleFocusSearch = useCallback(() => {
    searchInputRef.current?.focus();
  }, []);

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
    console.log('Navigate:', direction);
  }, []);

  const handleOpenSelected = useCallback(() => {
    if (selectedBookmarkId) {
      // TODO: Open selected bookmark
      console.log('Open bookmark:', selectedBookmarkId);
    }
  }, [selectedBookmarkId]);

  const handleEditSelected = useCallback(() => {
    if (selectedBookmarkId) {
      // TODO: Edit selected bookmark
      console.log('Edit bookmark:', selectedBookmarkId);
    }
  }, [selectedBookmarkId]);

  const handleToggleSelectedRead = useCallback(() => {
    if (selectedBookmarkId) {
      // TODO: Toggle read status of selected bookmark
      console.log('Toggle read status:', selectedBookmarkId);
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
    onToggleRead: handleToggleSelectedRead,
    onShowHelp: handleShowShortcuts,
    isDialogOpen: isEditDialogOpen || isAddDialogOpen || isShortcutsModalOpen
  });

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Header */}
      <div className="hidden lg:block">
        <Header onSearch={handleSearch} searchQuery={searchQuery} searchRef={searchInputRef} />
      </div>
      
      {/* Mobile Navigation */}
      <MobileNav 
        onAddBookmark={handleAddBookmark}
      />
      
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar onAddBookmark={handleAddBookmark} />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
          <div className="max-w-4xl mx-auto">
            <BookmarkList 
              onEditBookmark={handleEditBookmark}
              onDeleteBookmark={handleDeleteBookmark}
            />
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
  );
}