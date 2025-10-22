import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Bookmark } from '@/types/pinboard';

interface PinbookDB extends DBSchema {
  bookmarks: {
    key: string;
    value: Bookmark;
    indexes: { 'by-url': string; 'by-date': number; 'by-tags': string };
  };
  metadata: {
    key: string;
    value: {
      lastSync: number;
      version: string;
      totalCount: number;
    };
  };
  cache: {
    key: string;
    value: {
      data: unknown;
      timestamp: number;
      expires: number;
    };
  };
}

class IndexedDBManager {
  private db: IDBPDatabase<PinbookDB> | null = null;
  private dbName = 'PinbookDB';
  private version = 1;

  async init(): Promise<void> {
    if (this.db) return;

    this.db = await openDB<PinbookDB>(this.dbName, this.version, {
      upgrade(db) {
        // Bookmarks store
        if (!db.objectStoreNames.contains('bookmarks')) {
          const bookmarkStore = db.createObjectStore('bookmarks', { keyPath: 'id' });
          bookmarkStore.createIndex('by-url', 'url', { unique: false });
          bookmarkStore.createIndex('by-date', 'createdAt', { unique: false });
          bookmarkStore.createIndex('by-tags', 'tags', { unique: false, multiEntry: true });
        }

        // Metadata store
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }

        // Cache store for API responses
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }
      },
    });
  }

  // Bookmark operations
  async saveBookmarks(bookmarks: Bookmark[]): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction('bookmarks', 'readwrite');
    const store = tx.objectStore('bookmarks');

    // Clear existing bookmarks
    await store.clear();

    // Add new bookmarks
    for (const bookmark of bookmarks) {
      await store.add(bookmark);
    }

    // Update metadata
    await this.updateMetadata({
      lastSync: Date.now(),
      version: '1.0',
      totalCount: bookmarks.length,
    });

    await tx.done;
  }

  async getBookmarks(): Promise<Bookmark[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction('bookmarks', 'readonly');
    const store = tx.objectStore('bookmarks');
    const bookmarks = await store.getAll();
    await tx.done;

    return bookmarks;
  }

  async getBookmarkById(id: string): Promise<Bookmark | undefined> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction('bookmarks', 'readonly');
    const store = tx.objectStore('bookmarks');
    const bookmark = await store.get(id);
    await tx.done;

    return bookmark;
  }

  async addBookmark(bookmark: Bookmark): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction('bookmarks', 'readwrite');
    const store = tx.objectStore('bookmarks');
    await store.add(bookmark);
    await tx.done;

    // Update metadata
    const metadata = await this.getMetadata();
    if (metadata) {
      await this.updateMetadata({
        ...metadata,
        totalCount: metadata.totalCount + 1,
      });
    }
  }

  async updateBookmark(bookmark: Bookmark): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction('bookmarks', 'readwrite');
    const store = tx.objectStore('bookmarks');
    await store.put(bookmark);
    await tx.done;
  }

  async deleteBookmark(id: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction('bookmarks', 'readwrite');
    const store = tx.objectStore('bookmarks');
    await store.delete(id);
    await tx.done;

    // Update metadata
    const metadata = await this.getMetadata();
    if (metadata) {
      await this.updateMetadata({
        ...metadata,
        totalCount: Math.max(0, metadata.totalCount - 1),
      });
    }
  }

  // Search operations
  async searchBookmarks(query: string): Promise<Bookmark[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction('bookmarks', 'readonly');
    const store = tx.objectStore('bookmarks');
    const allBookmarks = await store.getAll();
    await tx.done;

    const lowercaseQuery = query.toLowerCase();
    return allBookmarks.filter(bookmark => 
      bookmark.title.toLowerCase().includes(lowercaseQuery) ||
      bookmark.url.toLowerCase().includes(lowercaseQuery) ||
      bookmark.description?.toLowerCase().includes(lowercaseQuery) ||
      bookmark.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  async getBookmarksByTag(tag: string): Promise<Bookmark[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction('bookmarks', 'readonly');
    const store = tx.objectStore('bookmarks');
    const index = store.index('by-tags');
    const bookmarks = await index.getAll(tag);
    await tx.done;

    return bookmarks;
  }

  // Cache operations
  async setCache(key: string, data: unknown, ttl: number = 3600000): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction('cache', 'readwrite');
    const store = tx.objectStore('cache');
    
    await store.put({
      key,
      value: {
        data,
        timestamp: Date.now(),
        expires: Date.now() + ttl,
      }
    });
    
    await tx.done;
  }

  async getCache(key: string): Promise<unknown | null> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction('cache', 'readonly');
    const store = tx.objectStore('cache');
    const cached = await store.get(key);
    await tx.done;

    if (!cached) return null;

    // Check if expired
    if (Date.now() > cached.value.expires) {
      await this.deleteCache(key);
      return null;
    }

    return cached.value.data;
  }

  async deleteCache(key: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction('cache', 'readwrite');
    const store = tx.objectStore('cache');
    await store.delete(key);
    await tx.done;
  }

  async clearExpiredCache(): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction('cache', 'readwrite');
    const store = tx.objectStore('cache');
    const allCache = await store.getAll();
    
    const now = Date.now();
    for (const item of allCache) {
      if (now > item.expires) {
        await store.delete(item.key);
      }
    }
    
    await tx.done;
  }

  // Metadata operations
  async updateMetadata(metadata: { lastSync: number; version: string; totalCount: number }): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction('metadata', 'readwrite');
    const store = tx.objectStore('metadata');
    await store.put({ key: 'app', ...metadata });
    await tx.done;
  }

  async getMetadata(): Promise<{ lastSync: number; version: string; totalCount: number } | null> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction('metadata', 'readonly');
    const store = tx.objectStore('metadata');
    const metadata = await store.get('app');
    await tx.done;

    return metadata || null;
  }

  // Utility methods
  async getCacheSize(): Promise<number> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction('cache', 'readonly');
    const store = tx.objectStore('cache');
    const allCache = await store.getAll();
    await tx.done;

    return allCache.length;
  }

  async getStorageUsage(): Promise<{ bookmarks: number; cache: number; total: number }> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction(['bookmarks', 'cache'], 'readonly');
    const bookmarkStore = tx.objectStore('bookmarks');
    const cacheStore = tx.objectStore('cache');
    
    const bookmarks = await bookmarkStore.getAll();
    const cache = await cacheStore.getAll();
    await tx.done;

    return {
      bookmarks: bookmarks.length,
      cache: cache.length,
      total: bookmarks.length + cache.length,
    };
  }

  async clearAll(): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction(['bookmarks', 'cache', 'metadata'], 'readwrite');
    
    await tx.objectStore('bookmarks').clear();
    await tx.objectStore('cache').clear();
    await tx.objectStore('metadata').clear();
    
    await tx.done;
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Export singleton instance
export const indexedDBManager = new IndexedDBManager();
