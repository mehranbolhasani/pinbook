import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPinboardAPI } from '@/lib/api/pinboard';
import { useAuthStore } from '@/lib/stores/auth';
import { useBookmarkFolderStore } from '@/lib/stores/bookmark-folders';
import { Bookmark, AddBookmarkParams } from '@/types/pinboard';

// Query Keys
export const queryKeys = {
  bookmarks: ['bookmarks'] as const,
  tags: ['tags'] as const,
  recent: (count: number) => ['bookmarks', 'recent', count] as const,
  search: (query: string) => ['bookmarks', 'search', query] as const,
};

// Hooks
export function useBookmarks() {
  const { apiToken } = useAuthStore();
  
  return useQuery({
    queryKey: queryKeys.bookmarks,
    queryFn: async () => {
      if (!apiToken) throw new Error('No API token');
      const api = getPinboardAPI(apiToken);
      if (!api) throw new Error('Failed to initialize API');
      const bookmarks = await api.getAllBookmarks();
      
      // Inject folderId from local store
      const { bookmarkFolders } = useBookmarkFolderStore.getState();
      return bookmarks.map(bookmark => ({
        ...bookmark,
        folderId: bookmarkFolders[bookmark.url]
      }));
    },
    enabled: !!apiToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTags() {
  const { apiToken } = useAuthStore();
  
  return useQuery({
    queryKey: queryKeys.tags,
    queryFn: async () => {
      if (!apiToken) throw new Error('No API token');
      const api = getPinboardAPI(apiToken);
      if (!api) throw new Error('Failed to initialize API');
      return api.getTags();
    },
    enabled: !!apiToken,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useAddBookmark() {
  const queryClient = useQueryClient();
  const { apiToken } = useAuthStore();

  return useMutation({
    mutationFn: async (params: AddBookmarkParams) => {
      if (!apiToken) throw new Error('No API token');
      const api = getPinboardAPI(apiToken);
      if (!api) throw new Error('Failed to initialize API');
      return api.addBookmark(params);
    },
    // Optimistic Update
    onMutate: async (newBookmarkParams) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: queryKeys.bookmarks });

      // Snapshot the previous value
      const previousBookmarks = queryClient.getQueryData<Bookmark[]>(queryKeys.bookmarks);

      // Optimistically update to the new value
      if (previousBookmarks) {
        const optimisticBookmark: Bookmark = {
          id: `temp-${Date.now()}`,
          title: newBookmarkParams.description,
          url: newBookmarkParams.url,
          description: newBookmarkParams.description,
          extended: newBookmarkParams.extended || '',
          tags: newBookmarkParams.tags ? newBookmarkParams.tags.split(' ').filter(tag => tag.trim()) : [],
          createdAt: new Date(),
          isRead: newBookmarkParams.toread === 'no',
          isShared: newBookmarkParams.shared === 'yes',
          domain: new URL(newBookmarkParams.url).hostname,
          hash: `temp-${Date.now()}`,
          meta: '',
          href: newBookmarkParams.url,
          shared: newBookmarkParams.shared || 'no',
          toread: newBookmarkParams.toread || 'no'
        };

        queryClient.setQueryData<Bookmark[]>(queryKeys.bookmarks, [
          optimisticBookmark,
          ...previousBookmarks,
        ]);
      }

      return { previousBookmarks };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, newBookmark, context) => {
      if (context?.previousBookmarks) {
        queryClient.setQueryData(queryKeys.bookmarks, context.previousBookmarks);
      }
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks });
      queryClient.invalidateQueries({ queryKey: queryKeys.tags });
    },
  });
}

// Helper function to map Bookmark fields to AddBookmarkParams
function mapBookmarkToAddParams(bookmark: Partial<Bookmark>): AddBookmarkParams {
  if (!bookmark.url) {
    throw new Error('URL is required to update a bookmark');
  }
  // Pinboard uses 'description' for title and 'extended' for description
  return {
    url: bookmark.url,
    description: bookmark.title || bookmark.description || '',
    extended: bookmark.extended || '',
    tags: bookmark.tags ? bookmark.tags.join(' ') : undefined,
    shared: bookmark.isShared !== undefined ? (bookmark.isShared ? 'yes' : 'no') : undefined,
    toread: bookmark.isRead !== undefined ? (bookmark.isRead ? 'no' : 'yes') : undefined,
    dt: bookmark.createdAt ? bookmark.createdAt.toISOString() : undefined,
    replace: 'yes'
  };
}

export function useUpdateBookmark() {
  const queryClient = useQueryClient();
  const { apiToken } = useAuthStore();

  return useMutation({
    mutationFn: async ({ updates }: { id: string; updates: Partial<Bookmark> }) => {
      if (!apiToken) throw new Error('No API token');
      const api = getPinboardAPI(apiToken);
      if (!api) throw new Error('Failed to initialize API');
      
      const params = mapBookmarkToAddParams(updates);
      return api.addBookmark(params);
    },
    // Optimistic Update
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.bookmarks });
      const previousBookmarks = queryClient.getQueryData<Bookmark[]>(queryKeys.bookmarks);

      if (previousBookmarks) {
        queryClient.setQueryData<Bookmark[]>(queryKeys.bookmarks, 
          previousBookmarks.map(b => b.id === id ? { ...b, ...updates } : b)
        );
      }

      return { previousBookmarks };
    },
    onError: (err, variables, context) => {
      if (context?.previousBookmarks) {
        queryClient.setQueryData(queryKeys.bookmarks, context.previousBookmarks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks });
      queryClient.invalidateQueries({ queryKey: queryKeys.tags });
    },
  });
}

export function useDeleteBookmark() {
  const queryClient = useQueryClient();
  const { apiToken } = useAuthStore();
  const { removeBookmarkFromFolder } = useBookmarkFolderStore();

  return useMutation({
    mutationFn: async (url: string) => {
      if (!apiToken) throw new Error('No API token');
      const api = getPinboardAPI(apiToken);
      if (!api) throw new Error('Failed to initialize API');
      return api.deleteBookmark(url);
    },
    // Optimistic Update
    onMutate: async (url) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.bookmarks });
      const previousBookmarks = queryClient.getQueryData<Bookmark[]>(queryKeys.bookmarks);

      if (previousBookmarks) {
        queryClient.setQueryData<Bookmark[]>(queryKeys.bookmarks, 
          previousBookmarks.filter(b => b.url !== url)
        );
      }

      return { previousBookmarks };
    },
    onError: (err, url, context) => {
      if (context?.previousBookmarks) {
        queryClient.setQueryData(queryKeys.bookmarks, context.previousBookmarks);
      }
    },
    onSuccess: (_, url) => {
      // Remove bookmark from folder mapping
      removeBookmarkFromFolder(url);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks });
      queryClient.invalidateQueries({ queryKey: queryKeys.tags });
    },
  });
}

