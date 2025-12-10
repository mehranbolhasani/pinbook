'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  // Search & Filter
  searchQuery: string;
  selectedTags: string[];
  selectedFolderId: string | null;
  
  // Sorting
  sortBy: 'date' | 'title' | 'url';
  sortOrder: 'asc' | 'desc';
  
  // Layout
  layout: 'card' | 'list' | 'minimal';
  
  // Selection
  selectedBookmarks: Set<string>;
  isSelectionMode: boolean;
  
  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedTags: (tags: string[]) => void;
  setSelectedFolderId: (folderId: string | null) => void;
  setSortBy: (sortBy: 'date' | 'title' | 'url') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  setLayout: (layout: 'card' | 'list' | 'minimal') => void;
  
  // Selection Actions
  toggleBookmarkSelection: (id: string) => void;
  selectAllBookmarks: (allIds: string[]) => void;
  deselectAllBookmarks: () => void;
  toggleSelectionMode: () => void;
  clearFilters: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      searchQuery: '',
      selectedTags: [],
      selectedFolderId: null,
      sortBy: 'date',
      sortOrder: 'desc',
      layout: 'list',
      selectedBookmarks: new Set<string>(),
      isSelectionMode: false,

      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSelectedTags: (selectedTags) => set({ selectedTags }),
      setSelectedFolderId: (selectedFolderId) => set({ selectedFolderId }),
      setSortBy: (sortBy) => set({ sortBy }),
      setSortOrder: (sortOrder) => set({ sortOrder }),
      setLayout: (layout) => set({ layout }),

      toggleBookmarkSelection: (id) => set((state) => {
        const newSelected = new Set(state.selectedBookmarks);
        if (newSelected.has(id)) {
          newSelected.delete(id);
        } else {
          newSelected.add(id);
        }
        return { selectedBookmarks: newSelected };
      }),

      selectAllBookmarks: (allIds) => set({ selectedBookmarks: new Set(allIds) }),
      deselectAllBookmarks: () => set({ selectedBookmarks: new Set<string>() }),

      toggleSelectionMode: () => set((state) => {
        const newMode = !state.isSelectionMode;
        return { 
          isSelectionMode: newMode,
          selectedBookmarks: newMode ? state.selectedBookmarks : new Set<string>()
        };
      }),

      clearFilters: () => set({ 
        searchQuery: '', 
        selectedTags: [],
        selectedFolderId: null
      }),
    }),
    {
      name: 'pinbook-ui-preferences',
      partialize: (state) => ({
        layout: state.layout,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
      }),
    }
  )
);
