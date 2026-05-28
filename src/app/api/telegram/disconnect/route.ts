import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, cleanupRateLimitStore } from '@/lib/security/rate-limit';
import { disconnectByApiToken } from '@/lib/telegram/store';

export async function POST(request: NextRequest) {
  cleanupRateLimitStore();
  const limit = rateLimit(request, { windowMs: 60000, maxRequests: 10 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
    );
  }

  try {
    const body = await request.json();
    const apiToken = typeof body?.apiToken === 'string' ? body.apiToken.trim() : null;
    if (!apiToken) {
      return NextResponse.json(
        { error: 'Missing apiToken' },
        { status: 400 }
      );
    }
    const removed = await disconnectByApiToken(apiToken);
    return NextResponse.json({ disconnected: removed });
  } catch (error) {
    console.error('Telegram disconnect error:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect' },
      { status: 500 }
    );
  }
}
