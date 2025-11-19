'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Bookmark, AppState } from '@/types/pinboard';
import { performanceMonitor } from '@/lib/utils/performance-monitor';
import { getPinboardAPI } from '@/lib/api/pinboard';

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
  setIsInitialized: (initialized: boolean) => void;
  clearFilters: () => void;
  toggleBookmarkSelection: (id: string) => void;
  selectAllBookmarks: () => void;
  deselectAllBookmarks: () => void;
  toggleSelectionMode: () => void;
  bulkUpdateBookmarks: (ids: string[], updates: Partial<Bookmark>) => void;
  bulkDeleteBookmarks: (ids: string[]) => void;
  loadBookmarksFromCache: (apiToken: string) => Promise<void>;
  searchBookmarksCached: (query: string, apiToken: string) => Promise<Bookmark[]>;
  getBookmarksByTagCached: (tag: string, apiToken: string) => Promise<Bookmark[]>;
}

export const useBookmarkStore = create<BookmarkStore>()(
  persist(
    (set) => ({
      bookmarks: [],
      tags: [],
      isLoading: false,
      error: null,
      searchQuery: '',
      selectedTags: [],
      sortBy: 'date',
      sortOrder: 'desc',
      layout: 'list',
      isInitialized: false,
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
      setIsInitialized: (initialized) => set({ isInitialized: initialized }),
  
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
  
      // Cache-optimized methods
      loadBookmarksFromCache: async (apiToken) => {
        performanceMonitor.mark('load-bookmarks-start');
        
        try {
          set({ isLoading: true, error: null });
          
          const api = getPinboardAPI(apiToken);
          if (!api) throw new Error('Failed to initialize API');
          const bookmarks = await api.getAllBookmarks();
          const tags = Array.from(new Set(bookmarks.flatMap(b => b.tags)));
          
          set({ 
            bookmarks, 
            tags, 
            isLoading: false,
            isInitialized: true 
          });
          
          performanceMonitor.measure('load-bookmarks', 'load-bookmarks-start');
        } catch (error) {
          console.error('Failed to load bookmarks from cache:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load bookmarks',
            isLoading: false 
          });
        }
      },
  
      searchBookmarksCached: async (query, apiToken) => {
        performanceMonitor.mark('search-bookmarks-start');
        
        try {
          const api = getPinboardAPI(apiToken);
          if (!api) throw new Error('Failed to initialize API');
          const results = await api.searchBookmarks(query);
          performanceMonitor.measure('search-bookmarks', 'search-bookmarks-start');
          return results;
        } catch (error) {
          console.error('Failed to search bookmarks:', error);
          return [];
        }
      },
  
      getBookmarksByTagCached: async (tag, apiToken) => {
        performanceMonitor.mark('get-bookmarks-by-tag-start');
        
        try {
          const api = getPinboardAPI(apiToken);
          if (!api) throw new Error('Failed to initialize API');
          const results = await api.searchBookmarks(tag);
          performanceMonitor.measure('get-bookmarks-by-tag', 'get-bookmarks-by-tag-start');
          return results;
        } catch (error) {
          console.error('Failed to get bookmarks by tag:', error);
          return [];
        }
      },
    }),
    {
      name: 'pinbook-preferences',
      partialize: (state) => ({
        layout: state.layout,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
      }),
    }
  )
);
