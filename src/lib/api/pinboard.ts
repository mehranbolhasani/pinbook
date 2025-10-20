import { 
  PinboardBookmark, 
  PinboardBookmarksResponse, 
  PinboardTagsResponse,
  AddBookmarkParams,
  SearchParams,
  Bookmark 
} from '@/types/pinboard';

export class PinboardAPI {
  private apiToken: string;

  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }

  private async makeRequest<T>(
    endpoint: string, 
    params: Record<string, string | number | boolean> = {}
  ): Promise<T> {
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

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.status === 'error') {
      throw new Error(data.error_message || 'API error');
    }

    return data;
  }

  // Get all bookmarks
  async getAllBookmarks(params: SearchParams = {}): Promise<Bookmark[]> {
    // Filter out undefined values
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined)
    ) as Record<string, string | number | boolean>;
    
    const response = await this.makeRequest<PinboardBookmark[]>('/posts/all', filteredParams);
    
    if (!Array.isArray(response)) {
      console.error('Expected array but got:', response);
      return [];
    }

    return response.map(this.transformBookmark);
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
  async updateBookmarkReadStatus(hash: string, isRead: boolean): Promise<void> {
    // For Pinboard API v1, we need to use /posts/add with replace=yes
    // But we need the URL, so let's get the bookmark first
    const bookmarks = await this.getAllBookmarks();
    const bookmark = bookmarks.find(b => b.hash === hash);
    
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
  async updateBookmarkShareStatus(hash: string, isShared: boolean): Promise<void> {
    // For Pinboard API v1, we need to use /posts/add with replace=yes
    // But we need the URL, so let's get the bookmark first
    const bookmarks = await this.getAllBookmarks();
    const bookmark = bookmarks.find(b => b.hash === hash);
    
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
}

// Create a singleton instance
let apiInstance: PinboardAPI | null = null;

export const getPinboardAPI = (apiToken?: string): PinboardAPI | null => {
  if (apiToken) {
    apiInstance = new PinboardAPI(apiToken);
  }
  return apiInstance;
};
