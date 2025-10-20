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
    // Build the Pinboard API URL
    const pinboardUrl = new URL(`${PINBOARD_API_BASE}${endpoint}`);
    
    // Copy all search parameters except our custom ones
    searchParams.forEach((value, key) => {
      if (key !== 'endpoint' && key !== 'auth_token') {
        pinboardUrl.searchParams.set(key, value);
      }
    });
    
    // Add the auth token
    pinboardUrl.searchParams.set('auth_token', authToken);
    
    // Force JSON format to avoid XML responses
    pinboardUrl.searchParams.set('format', 'json');

    console.log('Proxying request to:', pinboardUrl.toString());

    // Make the request to Pinboard API
    const response = await fetch(pinboardUrl.toString(), {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Pinbook/1.0'
      }
    });

    console.log('Pinboard API response status:', response.status);
    console.log('Pinboard API response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pinboard API error response:', errorText);
      return NextResponse.json(
        { error: `Pinboard API error: ${response.status} ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    // Check response content type and handle accordingly
    const contentType = response.headers.get('content-type') || '';
    const responseText = await response.text();
    
    console.log('Response content-type:', contentType);
    console.log('Response text (first 200 chars):', responseText.substring(0, 200));

    if (contentType.includes('application/json') || contentType.includes('text/json')) {
      const data = JSON.parse(responseText);
      return NextResponse.json(data);
    } else {
      console.error('Unexpected response format:', responseText.substring(0, 500));
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
    console.error('API proxy error:', error);
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
    // Build the Pinboard API URL
    const pinboardUrl = new URL(`${PINBOARD_API_BASE}${endpoint}`);
    pinboardUrl.searchParams.set('auth_token', authToken);
    pinboardUrl.searchParams.set('format', 'json');

    // Get the request body
    const body = await request.text();

    // Make the request to Pinboard API
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
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from Pinboard API', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
