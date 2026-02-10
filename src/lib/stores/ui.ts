'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  // Search & Filter
  searchQuery: string;
  selectedTags: string[];
  
  // Sorting
  sortBy: 'date' | 'title' | 'url';
  sortOrder: 'asc' | 'desc';
  
  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedTags: (tags: string[]) => void;
  setSortBy: (sortBy: 'date' | 'title' | 'url') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  clearFilters: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      searchQuery: '',
      selectedTags: [],
      sortBy: 'date',
      sortOrder: 'desc',

      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSelectedTags: (selectedTags) => set({ selectedTags }),
      setSortBy: (sortBy) => set({ sortBy }),
      setSortOrder: (sortOrder) => set({ sortOrder }),

      clearFilters: () => set({ 
        searchQuery: '', 
        selectedTags: []
      }),
    }),
    {
      name: 'pinbook-ui-preferences',
      version: 1,
      migrate: (persistedState: unknown) => {
        const state = persistedState as { sortBy?: string; sortOrder?: string };
        return { ...state };
      },
      partialize: (state) => ({
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
      }),
    }
  )
);
