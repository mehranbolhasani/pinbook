'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/lib/stores/auth';
import { useBookmarkStore } from '@/lib/stores/bookmarks';
import { getPinboardAPI } from '@/lib/api/pinboard';
import { useToast } from '@/hooks/useToast';

export function useBookmarkLoader() {
  const { isAuthenticated, apiToken } = useAuthStore();
  const { 
    setBookmarks, 
    setTags, 
    setLoading, 
    setError,
    setIsInitialized
  } = useBookmarkStore();
  const toast = useToast();
  const isInitializedRef = useRef(false);
  const isLoadingRef = useRef(false);

  const loadBookmarks = useCallback(async () => {
    if (!isAuthenticated || !apiToken || isInitializedRef.current || isLoadingRef.current) {
      return;
    }

    // Prevent multiple simultaneous calls
    isLoadingRef.current = true;
    isInitializedRef.current = true;

    setLoading(true);
    setError(null);

    try {
      const api = getPinboardAPI(apiToken);
      if (!api) throw new Error('Failed to initialize API');

      console.log('Loading bookmarks and tags...');
      const [bookmarks, tags] = await Promise.all([
        api.getAllBookmarks(),
        api.getTags()
      ]);

      console.log('Loaded bookmarks:', bookmarks.length);
      console.log('Loaded tags:', Object.keys(tags).length);
      console.log('Sample bookmark:', bookmarks[0]);

      setBookmarks(bookmarks);
      setTags(Object.keys(tags));
      setIsInitialized(true);

      // Only show success toast on initial load
      if (bookmarks.length > 0) {
        toast.showSuccess('Bookmarks loaded successfully', `${bookmarks.length} bookmarks found`);
      }
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load bookmarks';
      setError(errorMessage);
      toast.showError('Failed to load bookmarks', errorMessage);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [isAuthenticated, apiToken, setBookmarks, setTags, setLoading, setError, setIsInitialized, toast]);

  useEffect(() => {
    if (isAuthenticated && apiToken) {
      loadBookmarks();
    }
  }, [isAuthenticated, apiToken, loadBookmarks]);

  return {
    loadBookmarks,
    isInitialized: isInitializedRef.current
  };
}
