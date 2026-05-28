import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, cleanupRateLimitStore } from '@/lib/security/rate-limit';

const PINBOARD_API_BASE = 'https://api.pinboard.in/v1';

const ALLOWED_ENDPOINTS = [
  '/posts/all',
  '/posts/recent',
  '/posts/add',
  '/posts/delete',
  '/tags/get',
  '/posts/search',
];

function isAllowedEndpoint(endpoint: string): boolean {
  return ALLOWED_ENDPOINTS.includes(endpoint);
}

function getAuthToken(request: NextRequest): string | null {
  return request.headers.get('x-pinboard-token')?.trim() || null;
}

function sanitizeErrorResponse(status: number): NextResponse {
  const messages: Record<number, string> = {
    400: 'Bad request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not found',
    429: 'Too many requests',
    502: 'Bad gateway',
    503: 'Service unavailable',
  };
  return NextResponse.json(
    { error: messages[status] || 'An error occurred' },
    { status }
  );
}

export async function GET(request: NextRequest) {
  cleanupRateLimitStore();
  const limit = rateLimit(request, { windowMs: 60000, maxRequests: 60 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
    );
  }

  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  const authToken = getAuthToken(request);

  if (!endpoint || !authToken) {
    return NextResponse.json(
      { error: 'Missing endpoint or auth token' },
      { status: 400 }
    );
  }

  if (!isAllowedEndpoint(endpoint)) {
    return NextResponse.json(
      { error: 'Invalid endpoint' },
      { status: 400 }
    );
  }

  try {
    const pinboardUrl = new URL(`${PINBOARD_API_BASE}${endpoint}`);

    searchParams.forEach((value, key) => {
      if (key !== 'endpoint') {
        pinboardUrl.searchParams.set(key, value);
      }
    });

    pinboardUrl.searchParams.set('auth_token', authToken);
    pinboardUrl.searchParams.set('format', 'json');

    const response = await fetch(pinboardUrl.toString(), {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Pinbook/1.0'
      }
    });

    if (!response.ok) {
      console.error('Pinboard API error:', response.status, endpoint);
      return sanitizeErrorResponse(response.status);
    }

    const contentType = response.headers.get('content-type') || '';
    const responseText = await response.text();

    if (contentType.includes('application/json') || contentType.includes('text/json')) {
      const data = JSON.parse(responseText);
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        { error: 'Unexpected response format' },
        { status: 502 }
      );
    }

  } catch (error) {
    console.error('Pinboard proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from Pinboard API' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  cleanupRateLimitStore();
  const limit = rateLimit(request, { windowMs: 60000, maxRequests: 60 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
    );
  }

  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  const authToken = getAuthToken(request);

  if (!endpoint || !authToken) {
    return NextResponse.json(
      { error: 'Missing endpoint or auth token' },
      { status: 400 }
    );
  }

  if (!isAllowedEndpoint(endpoint)) {
    return NextResponse.json(
      { error: 'Invalid endpoint' },
      { status: 400 }
    );
  }

  try {
    const pinboardUrl = new URL(`${PINBOARD_API_BASE}${endpoint}`);
    pinboardUrl.searchParams.set('auth_token', authToken);
    pinboardUrl.searchParams.set('format', 'json');

    const body = await request.text();

    const response = await fetch(pinboardUrl.toString(), {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Pinbook/1.0'
      },
      body: body
    });

    if (!response.ok) {
      console.error('Pinboard API error:', response.status, endpoint);
      return sanitizeErrorResponse(response.status);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Pinboard proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from Pinboard API' },
      { status: 500 }
    );
  }
}
