import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const authToken = searchParams.get('auth_token');

  if (!authToken) {
    return NextResponse.json({ error: 'Missing auth_token parameter' }, { status: 400 });
  }

  try {
    // Test with a simple endpoint
    const testUrl = `https://api.pinboard.in/v1/posts/recent?auth_token=${authToken}&count=1&format=json`;
    
    console.log('Testing Pinboard API directly:', testUrl);
    
    const response = await fetch(testUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Pinbook/1.0'
      }
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('Response text (first 500 chars):', responseText.substring(0, 500));

    if (!response.ok) {
      return NextResponse.json({
        error: `HTTP ${response.status}: ${response.statusText}`,
        details: responseText,
        url: testUrl
      }, { status: response.status });
    }

    // Try to parse as JSON
    try {
      const data = JSON.parse(responseText);
      return NextResponse.json({ success: true, data, url: testUrl });
    } catch (parseError) {
      return NextResponse.json({
        error: 'Response is not valid JSON',
        details: responseText,
        parseError: parseError instanceof Error ? parseError.message : 'Unknown parse error',
        url: testUrl
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({
      error: 'Failed to test Pinboard API',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
