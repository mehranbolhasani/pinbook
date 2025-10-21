import { create } from 'zustand';
import { Bookmark, AppState } from '@/types/pinboard';

interface BookmarkStore extends AppState {
  selectedBookmarks: Set<string>;
  isSelectionMode: boolean;
  setBookmarks: (bookmarks: Bookmark[]) => void;
  addBookmark: (bookmark: Bookmark) => void;
  updateBookmark: (id: string, updates: Partial<Bookmark>) => void;
  removeBookmark: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedTags: (tags: string[]) => void;
  setSortBy: (sortBy: 'date' | 'title' | 'url') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  setTags: (tags: string[]) => void;
  setLayout: (layout: 'card' | 'list' | 'minimal') => void;
  clearFilters: () => void;
  toggleBookmarkSelection: (id: string) => void;
  selectAllBookmarks: () => void;
  deselectAllBookmarks: () => void;
  toggleSelectionMode: () => void;
  bulkUpdateBookmarks: (ids: string[], updates: Partial<Bookmark>) => void;
  bulkDeleteBookmarks: (ids: string[]) => void;
}

export const useBookmarkStore = create<BookmarkStore>((set) => ({
  bookmarks: [],
  tags: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  selectedTags: [],
  sortBy: 'date',
  sortOrder: 'desc',
  layout: 'card',
  selectedBookmarks: new Set<string>(),
  isSelectionMode: false,

  setBookmarks: (bookmarks) => set({ bookmarks }),
  
  addBookmark: (bookmark) => 
    set((state) => ({ 
      bookmarks: [bookmark, ...state.bookmarks] 
    })),
  
  updateBookmark: (id, updates) =>
    set((state) => ({
      bookmarks: state.bookmarks.map(bookmark =>
        bookmark.id === id ? { ...bookmark, ...updates } : bookmark
      )
    })),
  
  removeBookmark: (id) =>
    set((state) => ({
      bookmarks: state.bookmarks.filter(bookmark => bookmark.id !== id)
    })),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  
  setSelectedTags: (selectedTags) => set({ selectedTags }),
  
  setSortBy: (sortBy) => set({ sortBy }),
  
  setSortOrder: (sortOrder) => set({ sortOrder }),
  
  setTags: (tags) => set({ tags }),
  
  setLayout: (layout) => set({ layout }),
  
  clearFilters: () => set({ 
    searchQuery: '', 
    selectedTags: [] 
  }),

  toggleBookmarkSelection: (id) => set((state) => {
    const newSelected = new Set(state.selectedBookmarks);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    return { selectedBookmarks: newSelected };
  }),

  selectAllBookmarks: () => set((state) => {
    const allIds = state.bookmarks.map(bookmark => bookmark.id);
    return { selectedBookmarks: new Set(allIds) };
  }),

  deselectAllBookmarks: () => set({ selectedBookmarks: new Set<string>() }),

  toggleSelectionMode: () => set((state) => {
    const newMode = !state.isSelectionMode;
    return { 
      isSelectionMode: newMode,
      selectedBookmarks: newMode ? state.selectedBookmarks : new Set<string>()
    };
  }),

  bulkUpdateBookmarks: (ids, updates) => set((state) => ({
    bookmarks: state.bookmarks.map(bookmark => 
      ids.includes(bookmark.id) 
        ? { ...bookmark, ...updates }
        : bookmark
    )
  })),

  bulkDeleteBookmarks: (ids) => set((state) => ({
    bookmarks: state.bookmarks.filter(bookmark => !ids.includes(bookmark.id)),
    selectedBookmarks: new Set<string>()
  })),
}));
