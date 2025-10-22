import { indexedDBManager } from './indexeddb-manager';
import { Bookmark } from '@/types/pinboard';
import { getPinboardAPI } from '@/lib/api/pinboard';

export interface CacheConfig {
  maxAge: number; // Maximum age in milliseconds
  staleWhileRevalidate: number; // Serve stale data while revalidating
  backgroundSync: boolean; // Enable background sync
  maxRetries: number; // Maximum retry attempts
}

export const defaultCacheConfig: CacheConfig = {
  maxAge: 5 * 60 * 1000, // 5 minutes
  staleWhileRevalidate: 30 * 60 * 1000, // 30 minutes
  backgroundSync: true,
  maxRetries: 3,
};

export class CacheStrategy {
  private config: CacheConfig;
  private syncInProgress = false;
  private lastSyncTime = 0;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...defaultCacheConfig, ...config };
  }

  // Get bookmarks with cache-first strategy
  async getBookmarks(apiToken: string, forceRefresh = false): Promise<Bookmark[]> {
    const cacheKey = `bookmarks_${apiToken}`;
    
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = await indexedDBManager.getCache(cacheKey);
      if (cached) {
        // Check if data is still fresh
        const age = Date.now() - cached.timestamp;
        if (age < this.config.maxAge) {
          console.log('Serving fresh data from cache');
          return cached.data;
        }

        // Data is stale but still usable
        if (age < this.config.staleWhileRevalidate) {
          console.log('Serving stale data from cache, revalidating in background');
          this.backgroundSync(apiToken);
          return cached.data;
        }
      }
    }

    // Cache miss or expired, fetch from API
    console.log('Fetching fresh data from API');
    return this.fetchAndCache(apiToken, cacheKey);
  }

  // Fetch from API and cache the result
  private async fetchAndCache(apiToken: string, cacheKey: string): Promise<Bookmark[]> {
    try {
      const api = getPinboardAPI(apiToken);
      if (!api) throw new Error('Failed to initialize API');

      const bookmarks = await api.getAllBookmarks();
      
      // Cache the result
      await indexedDBManager.setCache(cacheKey, bookmarks, this.config.maxAge);
      
      // Also save to IndexedDB for offline access
      await indexedDBManager.saveBookmarks(bookmarks);
      
      this.lastSyncTime = Date.now();
      return bookmarks;
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error);
      
      // Try to serve from IndexedDB as fallback
      const fallbackBookmarks = await indexedDBManager.getBookmarks();
      if (fallbackBookmarks.length > 0) {
        console.log('Serving fallback data from IndexedDB');
        return fallbackBookmarks;
      }
      
      throw error;
    }
  }

  // Background sync for stale-while-revalidate
  private async backgroundSync(apiToken: string): Promise<void> {
    if (this.syncInProgress) return;
    
    this.syncInProgress = true;
    
    try {
      const api = getPinboardAPI(apiToken);
      if (!api) return;

      const bookmarks = await api.getAllBookmarks();
      const cacheKey = `bookmarks_${apiToken}`;
      
      // Update cache
      await indexedDBManager.setCache(cacheKey, bookmarks, this.config.maxAge);
      await indexedDBManager.saveBookmarks(bookmarks);
      
      this.lastSyncTime = Date.now();
      console.log('Background sync completed');
    } catch (error) {
      console.error('Background sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  // Add bookmark with optimistic update
  async addBookmark(bookmark: Bookmark, apiToken: string): Promise<void> {
    // Optimistic update - add to cache immediately
    const cacheKey = `bookmarks_${apiToken}`;
    const cached = await indexedDBManager.getCache(cacheKey);
    
    if (cached) {
      const updatedBookmarks = [bookmark, ...cached.data];
      await indexedDBManager.setCache(cacheKey, updatedBookmarks, this.config.maxAge);
    }

    // Add to IndexedDB
    await indexedDBManager.addBookmark(bookmark);

    // Sync with API in background
    this.backgroundSync(apiToken);
  }

  // Update bookmark with optimistic update
  async updateBookmark(bookmark: Bookmark, apiToken: string): Promise<void> {
    // Optimistic update
    const cacheKey = `bookmarks_${apiToken}`;
    const cached = await indexedDBManager.getCache(cacheKey);
    
    if (cached) {
      const updatedBookmarks = cached.data.map((b: Bookmark) => 
        b.id === bookmark.id ? bookmark : b
      );
      await indexedDBManager.setCache(cacheKey, updatedBookmarks, this.config.maxAge);
    }

    // Update IndexedDB
    await indexedDBManager.updateBookmark(bookmark);

    // Sync with API in background
    this.backgroundSync(apiToken);
  }

  // Delete bookmark with optimistic update
  async deleteBookmark(bookmarkId: string, apiToken: string): Promise<void> {
    // Optimistic update
    const cacheKey = `bookmarks_${apiToken}`;
    const cached = await indexedDBManager.getCache(cacheKey);
    
    if (cached) {
      const updatedBookmarks = cached.data.filter((b: Bookmark) => b.id !== bookmarkId);
      await indexedDBManager.setCache(cacheKey, updatedBookmarks, this.config.maxAge);
    }

    // Delete from IndexedDB
    await indexedDBManager.deleteBookmark(bookmarkId);

    // Sync with API in background
    this.backgroundSync(apiToken);
  }

  // Search with cache-first strategy
  async searchBookmarks(query: string, apiToken: string): Promise<Bookmark[]> {
    // Try IndexedDB search first (faster)
    const indexedResults = await indexedDBManager.searchBookmarks(query);
    
    if (indexedResults.length > 0) {
      console.log(`Found ${indexedResults.length} results in IndexedDB`);
      return indexedResults;
    }

    // Fallback to API search
    try {
      const api = getPinboardAPI(apiToken);
      if (!api) throw new Error('Failed to initialize API');

      const results = await api.getAllBookmarks({ tag: query });
      return results;
    } catch (error) {
      console.error('API search failed:', error);
      return indexedResults; // Return IndexedDB results even if empty
    }
  }

  // Get bookmarks by tag with cache
  async getBookmarksByTag(tag: string, apiToken: string): Promise<Bookmark[]> {
    // Try IndexedDB first
    const indexedResults = await indexedDBManager.getBookmarksByTag(tag);
    
    if (indexedResults.length > 0) {
      console.log(`Found ${indexedResults.length} bookmarks for tag "${tag}" in IndexedDB`);
      return indexedResults;
    }

    // Fallback to API
    try {
      const api = getPinboardAPI(apiToken);
      if (!api) throw new Error('Failed to initialize API');

      const results = await api.getAllBookmarks({ tag });
      return results;
    } catch (error) {
      console.error('API tag search failed:', error);
      return indexedResults;
    }
  }

  // Cache management
  async clearCache(): Promise<void> {
    await indexedDBManager.clearAll();
  }

  async getCacheStats(): Promise<{
    lastSync: number;
    cacheSize: number;
    storageUsage: { bookmarks: number; cache: number; total: number };
  }> {
    const metadata = await indexedDBManager.getMetadata();
    const cacheSize = await indexedDBManager.getCacheSize();
    const storageUsage = await indexedDBManager.getStorageUsage();

    return {
      lastSync: metadata?.lastSync || 0,
      cacheSize,
      storageUsage,
    };
  }

  // Cleanup expired cache
  async cleanup(): Promise<void> {
    await indexedDBManager.clearExpiredCache();
  }

  // Check if data is fresh
  isDataFresh(lastSync: number): boolean {
    return Date.now() - lastSync < this.config.maxAge;
  }

  // Check if data is stale but usable
  isDataStale(lastSync: number): boolean {
    const age = Date.now() - lastSync;
    return age >= this.config.maxAge && age < this.config.staleWhileRevalidate;
  }
}

// Export singleton instance
export const cacheStrategy = new CacheStrategy();
