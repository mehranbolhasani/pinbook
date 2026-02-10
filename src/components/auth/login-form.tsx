'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/lib/stores/auth';
import { getPinboardAPI } from '@/lib/api/pinboard';
import { testPinboardConnection } from '@/lib/api/test-connection';
import { ThemeToggle } from '@/components/theme-toggle';
import { Paperclip } from 'lucide-react';

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
    <div className="min-h-svh h-svh flex items-center justify-center bg-background">
      <div className="skeleton fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[720px] h-screen z-10">
        <span className="absolute top-0 left-0 w-px h-full bg-primary/5"></span>
        <span className="absolute top-0 right-0 w-px h-full bg-primary/5"></span>
      </div>
        
      <div className="w-full max-w-md z-20 h-screen flex flex-col items-center justify-between py-20">
        <div className="absolute top-4 right-4 z-30">
          <ThemeToggle />
        </div>
        <div className="text-center">
          <div className="flex flex-col items-center justify-center gap-2">
            <Paperclip className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold tracking-tighter">Pinbook</h2>
          </div>
          <p className="text-muted-foreground w-2/4 mx-auto mt-4 text-sm">
            Enter your Pinboard API credentials to get started
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 w-2/3 px-8 sm:px-0">
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
            className="w-fit mx-auto mt-4 px-4" 
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground flex flex-col items-center justify-center">
            <span>Don&apos;t have a Pinboard account?{' '}</span>
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
      </div>
    </div>
  );
}
