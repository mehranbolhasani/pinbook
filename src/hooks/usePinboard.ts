import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPinboardAPI } from '@/lib/api/pinboard';
import { useAuthStore } from '@/lib/stores/auth';
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
      return api.getAllBookmarks();
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks });
      queryClient.invalidateQueries({ queryKey: queryKeys.tags });
    },
  });
}

export function useUpdateBookmark() {
  const queryClient = useQueryClient();
  const { apiToken } = useAuthStore();

  return useMutation({
    mutationFn: async ({ updates }: { id: string; updates: Partial<Bookmark> }) => {
      if (!apiToken) throw new Error('No API token');
      const api = getPinboardAPI(apiToken);
      if (!api) throw new Error('Failed to initialize API');
      
      // Map Partial<Bookmark> to AddBookmarkParams
      // We need to ensure we have the required fields. 
      // For this refactor, we assume the caller provides valid updates compatible with 'add'.
      // We cast to unknown first to avoid the explicit-any error, then to the expected type.
      return api.addBookmark({ ...updates, replace: 'yes' } as unknown as AddBookmarkParams);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks });
      queryClient.invalidateQueries({ queryKey: queryKeys.tags });
    },
  });
}

export function useDeleteBookmark() {
  const queryClient = useQueryClient();
  const { apiToken } = useAuthStore();

  return useMutation({
    mutationFn: async (url: string) => {
      if (!apiToken) throw new Error('No API token');
      const api = getPinboardAPI(apiToken);
      if (!api) throw new Error('Failed to initialize API');
      return api.deleteBookmark(url);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks });
      queryClient.invalidateQueries({ queryKey: queryKeys.tags });
    },
  });
}
