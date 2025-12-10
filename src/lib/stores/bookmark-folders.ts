'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Store for mapping bookmarks to folders
 * Since Pinboard doesn't support folders, we store this mapping locally
 * Key: bookmark URL (unique identifier)
 * Value: folder ID
 */
interface BookmarkFolderState {
  bookmarkFolders: Record<string, string>; // url -> folderId
  assignBookmarkToFolder: (bookmarkUrl: string, folderId: string | null) => void;
  getBookmarkFolder: (bookmarkUrl: string) => string | undefined;
  removeBookmarkFromFolder: (bookmarkUrl: string) => void;
  removeFolderAssignments: (folderId: string) => void;
  clearAll: () => void;
}

export const useBookmarkFolderStore = create<BookmarkFolderState>()(
  persist(
    (set) => ({
      bookmarkFolders: {},

      assignBookmarkToFolder: (bookmarkUrl: string, folderId: string | null) => {
        set((state) => {
          if (folderId === null) {
            const { [bookmarkUrl]: _, ...rest } = state.bookmarkFolders;
            return { bookmarkFolders: rest };
          }
          return {
            bookmarkFolders: {
              ...state.bookmarkFolders,
              [bookmarkUrl]: folderId,
            },
          };
        });
      },

      getBookmarkFolder: (bookmarkUrl: string) => {
        return useBookmarkFolderStore.getState().bookmarkFolders[bookmarkUrl];
      },

      removeBookmarkFromFolder: (bookmarkUrl: string) => {
        set((state) => {
          const { [bookmarkUrl]: _, ...rest } = state.bookmarkFolders;
          return { bookmarkFolders: rest };
        });
      },

      removeFolderAssignments: (folderId: string) => {
        set((state) => {
          const updated = { ...state.bookmarkFolders };
          Object.keys(updated).forEach((url) => {
            if (updated[url] === folderId) {
              delete updated[url];
            }
          });
          return { bookmarkFolders: updated };
        });
      },

      clearAll: () => set({ bookmarkFolders: {} }),
    }),
    {
      name: 'pinbook-bookmark-folders',
    }
  )
);



