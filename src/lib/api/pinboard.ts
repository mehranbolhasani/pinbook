import { 
  PinboardBookmark, 
  PinboardBookmarksResponse, 
  PinboardTagsResponse,
  AddBookmarkParams,
  SearchParams,
  Bookmark 
} from '@/types/pinboard';
import { retry, retryConfigs } from '@/lib/utils/retry';

// Enhanced error types
export class PinboardAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string,
    public isNetworkError?: boolean,
    public isOffline?: boolean
  ) {
    super(message);
    this.name = 'PinboardAPIError';
  }
}

export class NetworkError extends PinboardAPIError {
  constructor(message: string = 'Network error') {
    super(message, undefined, undefined, true);
    this.name = 'NetworkError';
  }
}

export class OfflineError extends PinboardAPIError {
  constructor(message: string = 'You are offline') {
    super(message, undefined, undefined, false, true);
    this.name = 'OfflineError';
  }
}

export class PinboardAPI {
  private apiToken: string;

  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }

  private async makeRequest<T>(
    endpoint: string, 
    params: Record<string, string | number | boolean> = {},
    options: { timeout?: number } = {}
  ): Promise<T> {
    const { timeout = 10000 } = options;
    
    // Check if offline
    if (!navigator.onLine) {
      throw new OfflineError();
    }

    const url = new URL('/api/pinboard', window.location.origin);
    
    // Add endpoint and auth token
    url.searchParams.set('endpoint', endpoint);
    url.searchParams.set('auth_token', this.apiToken);
    
    // Add other parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.error_message || errorMessage;
        } catch {
          // If we can't parse the error response, use the default message
        }

        // Handle specific HTTP status codes
        if (response.status === 401) {
          throw new PinboardAPIError('Invalid API token. Please check your credentials.', 401, endpoint);
        } else if (response.status === 403) {
          throw new PinboardAPIError('Access forbidden. Please check your API permissions.', 403, endpoint);
        } else if (response.status === 429) {
          throw new PinboardAPIError('Rate limit exceeded. Please try again later.', 429, endpoint);
        } else if (response.status >= 500) {
          throw new PinboardAPIError('Server error. Please try again later.', response.status, endpoint);
        } else {
          throw new PinboardAPIError(errorMessage, response.status, endpoint);
        }
      }

      const data = await response.json();
      
      if (data.status === 'error') {
        throw new PinboardAPIError(data.error_message || 'API error', undefined, endpoint);
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof PinboardAPIError) {
        throw error;
      }
      
      if (error.name === 'AbortError') {
        throw new PinboardAPIError('Request timeout', undefined, endpoint);
      }
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new NetworkError('Network connection failed');
      }
      
      throw new PinboardAPIError(error.message || 'Unknown error', undefined, endpoint);
    }
  }

  // Get all bookmarks
  async getAllBookmarks(params: SearchParams = {}): Promise<Bookmark[]> {
    // Filter out undefined values
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined)
    ) as Record<string, string | number | boolean>;
    
    try {
      const response = await retry(
        () => this.makeRequest<PinboardBookmark[]>('/posts/all', filteredParams, { 
          timeout: 15000, 
          retryConfig: retryConfigs.network 
        }),
        retryConfigs.network
      );
      
      if (!Array.isArray(response)) {
        console.error('Expected array but got:', response);
        return [];
      }
      
      // Cache the bookmarks for offline use
      this.cacheBookmarks(response.map(this.transformBookmark));
      
      return response.map(this.transformBookmark);
    } catch (error) {
      if (error instanceof OfflineError) {
        // Try to load from cache when offline
        const cachedBookmarks = this.getCachedBookmarks();
        if (cachedBookmarks.length > 0) {
          console.warn('Using cached bookmarks due to offline status');
          return cachedBookmarks;
        }
      }
      throw error;
    }
  }

  // Get recent bookmarks
  async getRecentBookmarks(count: number = 10): Promise<Bookmark[]> {
    const response = await this.makeRequest<PinboardBookmarksResponse>('/posts/recent', { count });
    
    if (!response.posts) {
      return [];
    }

    return response.posts.map(this.transformBookmark);
  }


  // Delete a bookmark
  async deleteBookmark(url: string): Promise<boolean> {
    const response = await this.makeRequest<{ status: string }>('/posts/delete', { url });
    return response.status === 'ok';
  }

  // Get all tags
  async getTags(): Promise<Record<string, number>> {
    const response = await this.makeRequest<PinboardTagsResponse>('/tags/get');
    return response.tags || {};
  }

  // Search bookmarks
  async searchBookmarks(query: string, params: SearchParams = {}): Promise<Bookmark[]> {
    const searchParams = { ...params, q: query };
    // Filter out undefined values
    const filteredParams = Object.fromEntries(
      Object.entries(searchParams).filter(([, value]) => value !== undefined)
    ) as Record<string, string | number | boolean>;
    
    const response = await this.makeRequest<PinboardBookmarksResponse>('/posts/search', filteredParams);
    
    if (!response.posts) {
      return [];
    }

    return response.posts.map(this.transformBookmark);
  }

  // Transform Pinboard bookmark to our Bookmark type
  private transformBookmark(pb: PinboardBookmark): Bookmark {
    let domain = '';
    try {
      domain = new URL(pb.href).hostname;
    } catch {
      console.warn('Invalid URL:', pb.href);
      domain = pb.href;
    }

    return {
      id: pb.hash,
      title: pb.description,
      url: pb.href,
      description: pb.description,
      extended: pb.extended,
      tags: pb.tags ? pb.tags.split(' ').filter(tag => tag.trim()) : [],
      createdAt: new Date(pb.time),
      isRead: pb.toread === 'no',
      isShared: pb.shared === 'yes',
      domain,
      hash: pb.hash,
      meta: pb.meta,
      href: pb.href,
      shared: pb.shared,
      toread: pb.toread
    };
  }

  // Add a new bookmark
  async addBookmark(params: AddBookmarkParams): Promise<Bookmark> {
    // Filter out undefined values
    const requestParams = Object.fromEntries(
      Object.entries({
        url: params.url,
        description: params.description,
        extended: params.extended,
        tags: params.tags,
        toread: params.toread,
        shared: params.shared,
        dt: params.dt,
        replace: params.replace
      }).filter(([, value]) => value !== undefined)
    ) as Record<string, string | number | boolean>;
    
    const response = await this.makeRequest<{ result_code: string }>('/posts/add', requestParams);

    if (response.result_code !== 'done') {
      throw new Error('Failed to add bookmark');
    }

    // Return a basic bookmark object - in a real app you might want to fetch the full bookmark
    return {
      id: `temp-${Date.now()}`,
      title: params.description,
      url: params.url,
      description: params.description,
      extended: params.extended || '',
      tags: params.tags ? params.tags.split(' ').filter(tag => tag.trim()) : [],
      createdAt: new Date(),
      isRead: params.toread === 'no',
      isShared: params.shared === 'yes',
      domain: new URL(params.url).hostname,
      hash: `temp-${Date.now()}`,
      meta: '',
      href: params.url,
      shared: params.shared || 'no',
      toread: params.toread || 'no'
    };
  }

  // Update bookmark read status
  async updateBookmarkReadStatus(hash: string, isRead: boolean, bookmarkData?: Bookmark): Promise<void> {
    // Use provided bookmark data or fetch it
    let bookmark = bookmarkData;
    if (!bookmark) {
      const bookmarks = await this.getAllBookmarks();
      bookmark = bookmarks.find(b => b.hash === hash);
    }
    
    if (!bookmark) {
      throw new Error('Bookmark not found');
    }

    const response = await this.makeRequest<{ result_code: string }>('/posts/add', {
      url: bookmark.url,
      description: bookmark.title,
      extended: bookmark.extended,
      tags: bookmark.tags.join(' '),
      toread: isRead ? 'no' : 'yes',
      shared: bookmark.isShared ? 'yes' : 'no',
      replace: 'yes'
    });

    if (response.result_code !== 'done') {
      throw new Error('Failed to update bookmark');
    }
  }

  // Update bookmark share status  
  async updateBookmarkShareStatus(hash: string, isShared: boolean, bookmarkData?: Bookmark): Promise<void> {
    // Use provided bookmark data or fetch it
    let bookmark = bookmarkData;
    if (!bookmark) {
      const bookmarks = await this.getAllBookmarks();
      bookmark = bookmarks.find(b => b.hash === hash);
    }
    
    if (!bookmark) {
      throw new Error('Bookmark not found');
    }

    const response = await this.makeRequest<{ result_code: string }>('/posts/add', {
      url: bookmark.url,
      description: bookmark.title,
      extended: bookmark.extended,
      tags: bookmark.tags.join(' '),
      toread: bookmark.isRead ? 'no' : 'yes',
      shared: isShared ? 'yes' : 'no',
      replace: 'yes'
    });

    if (response.result_code !== 'done') {
      throw new Error('Failed to update bookmark');
    }
  }

  // Validate API token
  async validateToken(): Promise<boolean> {
    try {
      // Use a simple endpoint that requires authentication
      const response = await this.makeRequest<{ user?: string; posts?: unknown[] }>('/posts/recent', { count: 1 });
      // If we get a response with user field, the token is valid
      return !!response.user;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }

  // Cache management methods
  private cacheBookmarks(bookmarks: Bookmark[]): void {
    try {
      const cacheData = {
        bookmarks,
        timestamp: Date.now(),
        version: '1.0'
      };
      localStorage.setItem('pinbook-cache', JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to cache bookmarks:', error);
    }
  }

  private getCachedBookmarks(): Bookmark[] {
    try {
      const cacheData = localStorage.getItem('pinbook-cache');
      if (!cacheData) return [];

      const parsed = JSON.parse(cacheData);
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (Date.now() - parsed.timestamp > maxAge) {
        // Cache is too old, clear it
        localStorage.removeItem('pinbook-cache');
        return [];
      }

      return parsed.bookmarks || [];
    } catch (error) {
      console.warn('Failed to load cached bookmarks:', error);
      return [];
    }
  }

  // Clear cache
  clearCache(): void {
    try {
      localStorage.removeItem('pinbook-cache');
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  // Get cache info
  getCacheInfo(): { hasCache: boolean; age?: number; count?: number } {
    try {
      const cacheData = localStorage.getItem('pinbook-cache');
      if (!cacheData) return { hasCache: false };

      const parsed = JSON.parse(cacheData);
      return {
        hasCache: true,
        age: Date.now() - parsed.timestamp,
        count: parsed.bookmarks?.length || 0
      };
    } catch (error) {
      console.warn('Failed to get cache info:', error);
      return { hasCache: false };
    }
  }
}

// Create a singleton instance
let apiInstance: PinboardAPI | null = null;

export const getPinboardAPI = (apiToken?: string): PinboardAPI | null => {
  if (apiToken) {
    apiInstance = new PinboardAPI(apiToken);
  }
  return apiInstance;
};
