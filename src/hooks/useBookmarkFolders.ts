import { useMemo } from 'react';
import { Bookmark } from '@/types/pinboard';
import { useFolderStore } from '@/lib/stores/folders';

/**
 * Hook to manage bookmark-folder relationships
 * Since Pinboard doesn't support folders, we store folderId in bookmark metadata
 * and manage it locally
 */
export function useBookmarkFolders() {
  const { folders, getFolder } = useFolderStore();

  /**
   * Get all bookmarks in a specific folder
   */
  const getBookmarksInFolder = (bookmarks: Bookmark[], folderId: string): Bookmark[] => {
    return bookmarks.filter((bookmark) => bookmark.folderId === folderId);
  };

  /**
   * Get bookmark count for a folder
   */
  const getFolderBookmarkCount = (bookmarks: Bookmark[], folderId: string): number => {
    return getBookmarksInFolder(bookmarks, folderId).length;
  };

  /**
   * Get all bookmarks without a folder
   */
  const getUnfolderedBookmarks = (bookmarks: Bookmark[]): Bookmark[] => {
    return bookmarks.filter((bookmark) => !bookmark.folderId);
  };

  /**
   * Get folders with their bookmark counts
   */
  const getFoldersWithCounts = (bookmarks: Bookmark[]) => {
    return folders.map((folder) => ({
      ...folder,
      count: getFolderBookmarkCount(bookmarks, folder.id),
    }));
  };

  /**
   * Assign a bookmark to a folder
   * Note: This updates the bookmark locally, but doesn't sync to Pinboard
   */
  const assignBookmarkToFolder = (bookmark: Bookmark, folderId: string | null): Bookmark => {
    return {
      ...bookmark,
      folderId: folderId || undefined,
    };
  };

  return {
    folders,
    getFolder,
    getBookmarksInFolder,
    getFolderBookmarkCount,
    getUnfolderedBookmarks,
    getFoldersWithCounts,
    assignBookmarkToFolder,
  };
}



