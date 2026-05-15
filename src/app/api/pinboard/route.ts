import { NextRequest, NextResponse } from 'next/server';

const PINBOARD_API_BASE = 'https://api.pinboard.in/v1';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  const authToken = searchParams.get('auth_token');

  if (!endpoint || !authToken) {
    return NextResponse.json(
      { error: 'Missing endpoint or auth_token parameter' },
      { status: 400 }
    );
  }

  try {
    const pinboardUrl = new URL(`${PINBOARD_API_BASE}${endpoint}`);

    searchParams.forEach((value, key) => {
      if (key !== 'endpoint' && key !== 'auth_token') {
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
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Pinboard API error: ${response.status} ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type') || '';
    const responseText = await response.text();

    if (contentType.includes('application/json') || contentType.includes('text/json')) {
      const data = JSON.parse(responseText);
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        {
          error: 'Pinboard API returned unexpected format',
          details: 'Expected JSON but got: ' + contentType,
          response: responseText.substring(0, 200)
        },
        { status: 400 }
      );
    }

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch from Pinboard API', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  const authToken = searchParams.get('auth_token');

  if (!endpoint || !authToken) {
    return NextResponse.json(
      { error: 'Missing endpoint or auth_token parameter' },
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
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Pinboard API error: ${response.status} ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch from Pinboard API', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
