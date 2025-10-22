'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth';
import { useBookmarkStore } from '@/lib/stores/bookmarks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, User, Settings, LogOut, Save, RefreshCw, Palette } from 'lucide-react';
import Link from 'next/link';
import { ThemeCustomizer } from '@/components/theme/theme-customizer';
import { SettingsErrorBoundary } from '@/components/error-boundary';

export default function SettingsPage() {
  const { 
    username, 
    apiToken, 
    logout, 
    setUsername, 
    setApiToken 
  } = useAuthStore();
  
  const { 
    layout, 
    setLayout, 
    sortBy, 
    setSortBy, 
    sortOrder, 
    setSortOrder 
  } = useBookmarkStore();

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
    } catch (error) {
      console.error('Failed to save settings:', error);
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
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Bookmarks
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your Pinbook preferences and account</p>
          </div>
        </div>

        <SettingsErrorBoundary>
          <Tabs defaultValue="pinboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pinboard" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Pinboard</span>
            </TabsTrigger>
            <TabsTrigger value="app" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>App Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pinboard" className="space-y-6">
            {/* Pinboard Account Settings */}
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

                  <div className="flex items-center space-x-2">
                    {!isEditing ? (
                      <Button onClick={() => setIsEditing(true)}>
                        <Settings className="h-4 w-4 mr-2" />
                        Edit Account
                      </Button>
                    ) : (
                      <div className="flex space-x-2">
                        <Button onClick={handleSave} disabled={isSaving}>
                          {isSaving ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                      </div>
                    )}
                    
                    <Button variant="destructive" onClick={handleLogout}>
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
          </TabsContent>

          <TabsContent value="app" className="space-y-6">
            {/* App Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>App Preferences</span>
                </CardTitle>
                <CardDescription>
                  Customize your Pinbook experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Layout Preference */}
                <div className="space-y-3">
                  <Label>Default Layout</Label>
                  <div className="flex space-x-2">
                    {[
                      { value: 'card', label: 'Masonry Cards', description: 'Pinterest-style grid' },
                      { value: 'list', label: 'List View', description: 'Compact horizontal list' },
                      { value: 'minimal', label: 'Minimal List', description: 'Ultra-compact view' }
                    ].map((option) => (
                      <Button
                        key={option.value}
                        variant={layout === option.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setLayout(option.value as 'card' | 'list' | 'minimal')}
                        className="flex flex-col h-auto p-3"
                      >
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Sort Preferences */}
                <div className="space-y-3">
                  <Label>Default Sort</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sortBy">Sort By</Label>
                      <div className="flex space-x-2">
                        {[
                          { value: 'date', label: 'Date' },
                          { value: 'title', label: 'Title' },
                          { value: 'url', label: 'URL' }
                        ].map((option) => (
                          <Button
                            key={option.value}
                            variant={sortBy === option.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSortBy(option.value as 'date' | 'title' | 'url')}
                          >
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="sortOrder">Order</Label>
                      <div className="flex space-x-2">
                        {[
                          { value: 'desc', label: 'Newest First' },
                          { value: 'asc', label: 'Oldest First' }
                        ].map((option) => (
                          <Button
                            key={option.value}
                            variant={sortOrder === option.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSortOrder(option.value as 'asc' | 'desc')}
                          >
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Theme Customization */}
            <ThemeCustomizer />
          </TabsContent>
        </Tabs>
        </SettingsErrorBoundary>
      </div>
    </div>
  );
}
