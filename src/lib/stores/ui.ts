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

  // Pagination
  page: number;

  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedTags: (tags: string[]) => void;
  setSortBy: (sortBy: 'date' | 'title' | 'url') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  setPage: (page: number) => void;
  clearFilters: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      searchQuery: '',
      selectedTags: [],
      sortBy: 'date',
      sortOrder: 'desc',
      page: 1,

      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSelectedTags: (selectedTags) => set({ selectedTags }),
      setSortBy: (sortBy) => set({ sortBy }),
      setSortOrder: (sortOrder) => set({ sortOrder }),
      setPage: (page) => set({ page }),

      clearFilters: () => set({
        searchQuery: '',
        selectedTags: [],
        page: 1,
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
