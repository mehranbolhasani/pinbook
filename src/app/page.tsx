'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { BookmarkList } from '@/components/bookmarks/bookmark-list';
import { EditBookmarkDialog } from '@/components/bookmarks/edit-bookmark-dialog';
import { AddBookmarkDialog } from '@/components/bookmarks/add-bookmark-dialog';
import { LoginForm } from '@/components/auth/login-form';
import { useAuthStore } from '@/lib/stores/auth';
import { useBookmarkStore } from '@/lib/stores/bookmarks';
import { getPinboardAPI } from '@/lib/api/pinboard';
import { Bookmark } from '@/types/pinboard';

export default function Home() {
  const { isAuthenticated, apiToken } = useAuthStore();
  const { 
    setBookmarks, 
    setTags, 
    setLoading, 
    setError,
    searchQuery,
    setSearchQuery,
    updateBookmark
  } = useBookmarkStore();
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Load bookmarks when authenticated
  useEffect(() => {
    if (isAuthenticated && apiToken && !isInitialized) {
      loadBookmarks();
    }
  }, [isAuthenticated, apiToken, isInitialized, loadBookmarks]);

  const loadBookmarks = async () => {
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
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
      setError(error instanceof Error ? error.message : 'Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  };

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
    // TODO: Implement delete bookmark
    console.log('Delete bookmark:', bookmark);
  };

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={handleSearch} searchQuery={searchQuery} />
      
      <div className="flex">
        <Sidebar onAddBookmark={handleAddBookmark} />
        
        <main className="flex-1 p-6">
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
    </div>
  );
}