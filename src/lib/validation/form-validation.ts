import { z } from 'zod';
import { 
  validateUrl,
  validateAndNormalizeTags 
} from './schemas';

// Form validation hooks and utilities
export interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors?: Record<string, string>;
}

// Real-time validation for form fields
export function useFieldValidation<T>(
  schema: z.ZodSchema<T>,
  value: unknown
): ValidationResult<T> {
  try {
    const data = schema.parse(value);
    return { isValid: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { general: 'Validation failed' } };
  }
}

// URL validation with real-time feedback
export function validateUrlField(url: string): {
  isValid: boolean;
  error?: string;
  normalizedUrl?: string;
} {
  if (!url.trim()) {
    return { isValid: false, error: 'URL is required' };
  }

  const result = validateUrl(url);
  if (!result.isValid) {
    return { isValid: false, error: result.error };
  }

  // Normalize the URL
  try {
    const normalizedUrl = new URL(url).toString();
    return { isValid: true, normalizedUrl };
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
}

// Tag validation and normalization
export function validateTagsField(tags: string): {
  isValid: boolean;
  normalizedTags: string[];
  error?: string;
} {
  if (!tags.trim()) {
    return { isValid: true, normalizedTags: [] };
  }

  try {
    const normalizedTags = validateAndNormalizeTags(tags);
    
    if (normalizedTags.length > 20) {
      return { 
        isValid: false, 
        normalizedTags: normalizedTags.slice(0, 20),
        error: 'Maximum 20 tags allowed' 
      };
    }

    return { isValid: true, normalizedTags };
  } catch {
    return { 
      isValid: false, 
      normalizedTags: [],
      error: 'Invalid tag format' 
    };
  }
}

// API token validation
export function validateApiTokenField(token: string): {
  isValid: boolean;
  error?: string;
  username?: string;
} {
  if (!token.trim()) {
    return { isValid: false, error: 'API token is required' };
  }

  const result = validateApiToken(token);
  if (!result.isValid) {
    return { isValid: false, error: result.error };
  }

  // Extract username from token
  const username = token.split(':')[0];
  return { isValid: true, username };
}

// Username validation
export function validateUsernameField(username: string): {
  isValid: boolean;
  error?: string;
} {
  if (!username.trim()) {
    return { isValid: false, error: 'Username is required' };
  }

  return validateUsername(username);
}

// Bookmark form validation
export function validateBookmarkForm(data: {
  url: string;
  title: string;
  description?: string;
  extended?: string;
  tags?: string;
}): ValidationResult<{
  url: string;
  title: string;
  description: string;
  extended: string;
  tags: string;
}> {
  const errors: Record<string, string> = {};

  // Validate URL
  const urlResult = validateUrlField(data.url);
  if (!urlResult.isValid) {
    errors.url = urlResult.error || 'Invalid URL';
  }

  // Validate title
  if (!data.title.trim()) {
    errors.title = 'Title is required';
  } else if (data.title.length > 200) {
    errors.title = 'Title must be less than 200 characters';
  }

  // Validate description
  if (data.description && data.description.length > 500) {
    errors.description = 'Description must be less than 500 characters';
  }

  // Validate extended
  if (data.extended && data.extended.length > 2000) {
    errors.extended = 'Extended description must be less than 2000 characters';
  }

  // Validate tags
  const tagsResult = validateTagsField(data.tags || '');
  if (!tagsResult.isValid) {
    errors.tags = tagsResult.error || 'Invalid tags';
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    data: {
      url: urlResult.normalizedUrl || data.url,
      title: data.title.trim(),
      description: data.description?.trim() || '',
      extended: data.extended?.trim() || '',
      tags: tagsResult.normalizedTags.join(' '),
    },
  };
}

// Duplicate detection
export function detectDuplicateBookmark(
  newBookmark: { url: string; title: string },
  existingBookmarks: Array<{ url: string; title: string; id: string }>
): {
  isDuplicate: boolean;
  duplicate?: { id: string; title: string; url: string };
  similarity?: number;
} {
  const normalizedNewUrl = newBookmark.url.toLowerCase().replace(/\/$/, '');
  
  for (const bookmark of existingBookmarks) {
    const normalizedExistingUrl = bookmark.url.toLowerCase().replace(/\/$/, '');
    
    // Exact URL match
    if (normalizedNewUrl === normalizedExistingUrl) {
      return {
        isDuplicate: true,
        duplicate: bookmark,
        similarity: 1.0,
      };
    }

    // Similar title check (basic fuzzy matching)
    const titleSimilarity = calculateSimilarity(
      newBookmark.title.toLowerCase(),
      bookmark.title.toLowerCase()
    );

    if (titleSimilarity > 0.8) {
      return {
        isDuplicate: true,
        duplicate: bookmark,
        similarity: titleSimilarity,
      };
    }
  }

  return { isDuplicate: false };
}

// Calculate string similarity (Levenshtein distance)
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) {
    return 1.0;
  }
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }
  
  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

// Form validation state management
export class FormValidationManager {
  private errors: Record<string, string> = {};
  private touched: Set<string> = new Set();

  setFieldError(field: string, error: string): void {
    this.errors[field] = error;
  }

  clearFieldError(field: string): void {
    delete this.errors[field];
  }

  setFieldTouched(field: string): void {
    this.touched.add(field);
  }

  getFieldError(field: string): string | undefined {
    return this.errors[field];
  }

  isFieldTouched(field: string): boolean {
    return this.touched.has(field);
  }

  hasErrors(): boolean {
    return Object.keys(this.errors).length > 0;
  }

  getErrors(): Record<string, string> {
    return { ...this.errors };
  }

  clearAll(): void {
    this.errors = {};
    this.touched.clear();
  }

  validateField<T>(
    field: string,
    value: T,
    validator: (value: T) => { isValid: boolean; error?: string }
  ): boolean {
    const result = validator(value);
    
    if (result.isValid) {
      this.clearFieldError(field);
    } else {
      this.setFieldError(field, result.error || 'Invalid value');
    }
    
    return result.isValid;
  }
}
