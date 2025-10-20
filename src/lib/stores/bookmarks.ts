import { create } from 'zustand';
import { Bookmark, AppState } from '@/types/pinboard';

interface BookmarkStore extends AppState {
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
}

export const useBookmarkStore = create<BookmarkStore>((set, get) => ({
  bookmarks: [],
  tags: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  selectedTags: [],
  sortBy: 'date',
  sortOrder: 'desc',
  layout: 'card',

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
}));
