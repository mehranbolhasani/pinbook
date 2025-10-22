import { z } from 'zod';

// URL validation schema
export const urlSchema = z.string().url('Invalid URL format');

// Bookmark validation schemas
export const bookmarkSchema = z.object({
  id: z.string(),
  url: urlSchema,
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  extended: z.string().optional(),
  tags: z.array(z.string()).default([]),
  time: z.string().datetime().optional(),
  hash: z.string().min(1, 'Hash is required'),
  isRead: z.boolean().default(false),
  isShared: z.boolean().default(false),
  href: z.string().optional(),
});

// Add bookmark validation schema
export const addBookmarkSchema = z.object({
  url: urlSchema,
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  extended: z.string().optional(),
  tags: z.string().optional(),
  toread: z.enum(['yes', 'no']).optional(),
  shared: z.enum(['yes', 'no']).optional(),
});

// Edit bookmark validation schema
export const editBookmarkSchema = z.object({
  url: urlSchema.optional(),
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  extended: z.string().optional(),
  tags: z.string().optional(),
});

// Search parameters validation schema
export const searchParamsSchema = z.object({
  tag: z.string().optional(),
  start: z.number().int().min(0).optional(),
  results: z.number().int().min(1).max(100).optional(),
  fromdt: z.string().datetime().optional(),
  todt: z.string().datetime().optional(),
  meta: z.enum(['yes', 'no']).optional(),
});

// API token validation schema
export const apiTokenSchema = z.string()
  .min(1, 'API token is required')
  .regex(/^[a-zA-Z0-9]+:[a-f0-9]+$/, 'Invalid API token format (expected username:token)');

// Username validation schema
export const usernameSchema = z.string()
  .min(1, 'Username is required')
  .max(50, 'Username too long')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username contains invalid characters');

// Settings validation schema
export const settingsSchema = z.object({
  layout: z.enum(['card', 'list', 'minimal']).default('list'),
  sortBy: z.enum(['date', 'title', 'url']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  accentColor: z.string().optional(),
});

// Form validation helpers
export function validateUrl(url: string): { isValid: boolean; error?: string } {
  try {
    urlSchema.parse(url);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0].message };
    }
    return { isValid: false, error: 'Invalid URL' };
  }
}

export function validateBookmark(bookmark: unknown): { isValid: boolean; data?: any; error?: string } {
  try {
    const data = bookmarkSchema.parse(bookmark);
    return { isValid: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0].message };
    }
    return { isValid: false, error: 'Invalid bookmark data' };
  }
}

export function validateAddBookmark(data: unknown): { isValid: boolean; data?: any; error?: string } {
  try {
    const validated = addBookmarkSchema.parse(data);
    return { isValid: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0].message };
    }
    return { isValid: false, error: 'Invalid bookmark data' };
  }
}

export function validateApiToken(token: string): { isValid: boolean; error?: string } {
  try {
    apiTokenSchema.parse(token);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0].message };
    }
    return { isValid: false, error: 'Invalid API token format' };
  }
}

export function validateUsername(username: string): { isValid: boolean; error?: string } {
  try {
    usernameSchema.parse(username);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0].message };
    }
    return { isValid: false, error: 'Invalid username format' };
  }
}

// Duplicate detection
export function detectDuplicateBookmarks(bookmarks: any[]): { duplicates: any[]; unique: any[] } {
  const seen = new Set<string>();
  const duplicates: any[] = [];
  const unique: any[] = [];

  for (const bookmark of bookmarks) {
    const key = bookmark.url?.toLowerCase() || bookmark.href?.toLowerCase();
    if (key && seen.has(key)) {
      duplicates.push(bookmark);
    } else {
      if (key) seen.add(key);
      unique.push(bookmark);
    }
  }

  return { duplicates, unique };
}

// URL normalization
export function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Remove trailing slash and normalize protocol
    return urlObj.toString().replace(/\/$/, '');
  } catch {
    return url;
  }
}

// Tag validation and normalization
export function validateAndNormalizeTags(tags: string): string[] {
  return tags
    .split(/\s+/)
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => tag.length > 0)
    .filter(tag => /^[a-zA-Z0-9_-]+$/.test(tag)) // Only alphanumeric, underscore, and hyphen
    .slice(0, 20); // Limit to 20 tags
}
