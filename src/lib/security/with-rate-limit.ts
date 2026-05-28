/**
 * Apply rate limiting to an API route handler.
 * Returns a 429 response if the limit is exceeded.
 */
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, cleanupRateLimitStore, RateLimitOptions } from '@/lib/security/rate-limit';

export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse> | NextResponse,
  options?: RateLimitOptions
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    cleanupRateLimitStore();
    const limit = rateLimit(request, options);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
      );
    }
    return handler(request);
  };
}
