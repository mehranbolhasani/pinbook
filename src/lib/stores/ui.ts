'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  searchQuery: string;
  selectedTags: string[];
  page: number;

  setSearchQuery: (query: string) => void;
  setSelectedTags: (tags: string[]) => void;
  setPage: (page: number) => void;
  clearFilters: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      searchQuery: '',
      selectedTags: [],
      page: 1,

      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSelectedTags: (selectedTags) => set({ selectedTags }),
      setPage: (page) => set({ page }),

      clearFilters: () => set({
        searchQuery: '',
        selectedTags: [],
        page: 1,
      }),
    }),
    {
      name: 'pinbook-ui-preferences',
      version: 2,
      partialize: () => ({}),
    }
  )
);
