// Test script to verify Pinboard API connection
export async function testPinboardConnection(apiToken: string) {
  try {
    console.log('Testing API token:', apiToken);
    
    // Use our test endpoint that provides more debugging info
    const url = new URL('/api/test-pinboard', window.location.origin);
    url.searchParams.set('auth_token', apiToken);
    
    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json'
      }
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', errorData);
      return { success: false, error: errorData.error || `HTTP ${response.status}` };
    }

    const data = await response.json();
    console.log('API Response:', data);
    
    return { success: true, data };
  } catch (error) {
    console.error('Connection test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
