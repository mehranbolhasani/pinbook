// Pinboard API Types
export interface PinboardBookmark {
  href: string;
  description: string;
  extended: string;
  meta: string;
  hash: string;
  time: string;
  shared: 'yes' | 'no';
  toread: 'yes' | 'no';
  tags: string;
}

export interface PinboardResponse {
  status: 'ok' | 'error';
  error_code?: string;
  error_message?: string;
}

export interface PinboardBookmarksResponse extends PinboardResponse {
  posts?: PinboardBookmark[];
}

export interface PinboardTagsResponse extends PinboardResponse {
  tags?: Record<string, number>;
}

export interface AddBookmarkParams {
  url: string;
  description: string;
  extended?: string;
  tags?: string;
  dt?: string;
  replace?: 'yes' | 'no';
  shared?: 'yes' | 'no';
  toread?: 'yes' | 'no';
}

export interface SearchParams {
  tag?: string;
  start?: number;
  results?: number;
  fromdt?: string;
  todt?: string;
  meta?: 'yes' | 'no';
}

// App-specific types
export interface Bookmark extends Omit<PinboardBookmark, 'time' | 'tags'> {
  id: string;
  title: string;
  url: string;
  description: string;
  extended: string;
  tags: string[];
  createdAt: Date;
  isRead: boolean;
  isShared: boolean;
  domain: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  apiToken: string | null;
  username: string | null;
}

export interface AppState {
  bookmarks: Bookmark[];
  tags: string[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  selectedTags: string[];
  sortBy: 'date' | 'title' | 'url';
  sortOrder: 'asc' | 'desc';
  layout: 'card' | 'list' | 'minimal';
}
