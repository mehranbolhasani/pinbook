'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/lib/stores/auth';
import { getPinboardAPI } from '@/lib/api/pinboard';
import { testPinboardConnection } from '@/lib/api/test-connection';

export function LoginForm() {
  const [apiToken, setApiToken] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Basic validation
      if (!apiToken.trim() || !username.trim()) {
        throw new Error('Please enter both username and API token');
      }

      // Check token format (should be username:token)
      if (!apiToken.includes(':')) {
        throw new Error('API token should be in format: username:token');
      }

      // Test API connection first
      console.log('Testing API connection...');
      const testResult = await testPinboardConnection(apiToken);
      if (!testResult.success) {
        throw new Error(`API connection failed: ${testResult.error}`);
      }

      // Validate API token
      const api = getPinboardAPI(apiToken);
      if (!api) {
        throw new Error('Failed to initialize API client');
      }

      const isValid = await api.validateToken();
      if (!isValid) {
        throw new Error('Invalid API token. Please check your credentials in Pinboard settings.');
      }

      // Store credentials and redirect
      login(apiToken, username);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to Pinbook</CardTitle>
          <CardDescription>
            Enter your Pinboard API credentials to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Your Pinboard username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setError('')}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="apiToken">API Token</Label>
              <Input
                id="apiToken"
                type="password"
                placeholder="Your Pinboard API token"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                onFocus={() => setError('')}
                required
              />
              <p className="text-xs text-muted-foreground">
                You can find your API token in your Pinboard settings. 
                <br />
                Format: <code className="bg-muted px-1 rounded">username:token</code>
              </p>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have a Pinboard account?{' '}
              <a 
                href="https://pinboard.in/signup/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Sign up for Pinboard
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
