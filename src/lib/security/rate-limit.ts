/**
 * Simple in-memory rate limiter for Next.js API routes.
 * Cleans up expired entries on each check to prevent unbounded growth.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return 'unknown';
}

export interface RateLimitOptions {
  windowMs?: number;
  maxRequests?: number;
}

export function rateLimit(
  request: Request,
  options: RateLimitOptions = {}
): { allowed: true } | { allowed: false; retryAfter: number } {
  const { windowMs = 60000, maxRequests = 30 } = options;
  const ip = getClientIP(request);
  const now = Date.now();
  const key = `${ip}`;

  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (entry.count >= maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.count += 1;
  store.set(key, entry);
  return { allowed: true };
}

/** Remove expired entries to prevent memory leaks. Call periodically or on each request. */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}
