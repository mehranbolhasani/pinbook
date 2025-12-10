'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Folder {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

interface FolderState {
  folders: Folder[];
  createFolder: (name: string) => Folder;
  updateFolder: (id: string, name: string) => void;
  deleteFolder: (id: string) => void;
  getFolder: (id: string) => Folder | undefined;
  getAllFolders: () => Folder[];
}

export const useFolderStore = create<FolderState>()(
  persist(
    (set, get) => ({
      folders: [],

      createFolder: (name: string) => {
        const newFolder: Folder = {
          id: `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: name.trim(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set((state) => ({
          folders: [...state.folders, newFolder],
        }));
        
        return newFolder;
      },

      updateFolder: (id: string, name: string) => {
        set((state) => ({
          folders: state.folders.map((folder) =>
            folder.id === id
              ? { ...folder, name: name.trim(), updatedAt: new Date() }
              : folder
          ),
        }));
      },

      deleteFolder: (id: string) => {
        set((state) => ({
          folders: state.folders.filter((folder) => folder.id !== id),
        }));
      },

      getFolder: (id: string) => {
        return get().folders.find((folder) => folder.id === id);
      },

      getAllFolders: () => {
        return get().folders;
      },
    }),
    {
      name: 'pinbook-folders',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          // Convert ISO strings back to Date objects
          if (parsed?.state?.folders) {
            parsed.state.folders = parsed.state.folders.map((folder: { createdAt: string; updatedAt: string; [key: string]: unknown }) => ({
              ...folder,
              createdAt: new Date(folder.createdAt),
              updatedAt: new Date(folder.updatedAt),
            }));
          }
          return parsed;
        },
        setItem: (name, value) => {
          // Convert Date objects to ISO strings
          if (value?.state?.folders) {
            value.state.folders = value.state.folders.map((folder: Folder) => ({
              ...folder,
              createdAt: folder.createdAt.toISOString(),
              updatedAt: folder.updatedAt.toISOString(),
            }));
          }
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);

