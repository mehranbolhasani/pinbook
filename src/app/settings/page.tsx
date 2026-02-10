'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Settings, LogOut, Save, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { SettingsErrorBoundary } from '@/components/error-boundary';

export default function SettingsPage() {
  const {
    username,
    apiToken,
    logout,
    setUsername,
    setApiToken
  } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(username || '');
  const [newApiToken, setNewApiToken] = useState(apiToken || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update auth store
      setUsername(newUsername);
      setApiToken(newApiToken);
      setIsEditing(false);
    } catch {
      // Silently fail
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-start space-x-4 mb-8 flex-col">
          <Link href="/" className="mr-0! mb-4">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Back to Bookmarks
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your Pinboard account</p>
          </div>
        </div>

        <SettingsErrorBoundary>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Pinboard Account</span>
                </CardTitle>
                <CardDescription>
                  Manage your Pinboard account connection and credentials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Current Account</p>
                    <p className="text-sm text-muted-foreground">
                      {username ? `Connected as ${username}` : 'Not connected'}
                    </p>
                  </div>
                  <Badge variant={username ? 'default' : 'secondary'}>
                    {username ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="Your Pinboard username"
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apiToken">API Token</Label>
                    <Input
                      id="apiToken"
                      type="password"
                      value={newApiToken}
                      onChange={(e) => setNewApiToken(e.target.value)}
                      placeholder="username:token"
                      disabled={!isEditing}
                    />
                    <p className="text-xs text-muted-foreground">
                      Get your API token from{' '}
                      <a 
                        href="https://pinboard.in/settings/password" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Pinboard settings
                      </a>
                    </p>
                  </div>

                  <div className="flex flex-col md:flex-row items-stretch md:items-center space-y-2 md:space-y-0 md:space-x-2">
                    {!isEditing ? (
                      <Button onClick={() => setIsEditing(true)} className="w-full md:w-auto">
                        <Settings className="h-4 w-4 mr-2" />
                        Edit Account
                      </Button>
                    ) : (
                      <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                        <Button onClick={handleSave} disabled={isSaving} className="w-full md:w-auto">
                          {isSaving ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)} className="w-full md:w-auto">
                          Cancel
                        </Button>
                      </div>
                    )}
                    
                    <Button variant="destructive" onClick={handleLogout} className="w-full md:w-auto">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* App Info */}
            <Card>
              <CardHeader>
                <CardTitle>About Pinbook</CardTitle>
                <CardDescription>
                  A modern, minimal Pinboard client
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>Version:</strong> 1.0.0</p>
                  <p><strong>Built with:</strong> Next.js, TypeScript, Tailwind CSS</p>
                  <p><strong>Data source:</strong> Pinboard.in API</p>
                  <p className="text-muted-foreground">
                    Pinbook is a personal project to create a better interface for managing Pinboard bookmarks.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </SettingsErrorBoundary>
      </div>
    </div>
  );
}
