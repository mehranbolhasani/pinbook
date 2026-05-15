'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { useAuthStore } from '@/lib/stores/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Settings, LogOut, Save, RefreshCw, Send, Unplug } from 'lucide-react';
import Link from 'next/link';
import { SettingsErrorBoundary } from '@/components/error-boundary';
import { useReducedMotion } from '@/hooks/useReducedMotion';

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

  // Telegram link state
  const [telegramConnected, setTelegramConnected] = useState<boolean | null>(null);
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [telegramCode, setTelegramCode] = useState<{ code: string; botUsername: string } | null>(null);

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

  const fetchTelegramStatus = useCallback(async () => {
    const token = apiToken ?? newApiToken;
    if (!token) {
      setTelegramConnected(false);
      return;
    }
    try {
      const res = await fetch('/api/telegram/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiToken: token })
      });
      const data = await res.json();
      setTelegramConnected(!!data?.connected);
    } catch {
      setTelegramConnected(false);
    }
  }, [apiToken, newApiToken]);

  useEffect(() => {
    import('react-dom').then(({ flushSync }) => {
      if (apiToken ?? newApiToken) {
        flushSync(() => fetchTelegramStatus());
      } else {
        flushSync(() => setTelegramConnected(false));
      }
    });
  }, [apiToken, newApiToken, fetchTelegramStatus]);

  const handleConnectTelegram = async () => {
    const token = apiToken ?? newApiToken;
    if (!token) return;
    setTelegramLoading(true);
    setTelegramCode(null);
    try {
      const res = await fetch('/api/telegram/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiToken: token })
      });
      const data = await res.json();
      if (data?.code && data?.botUsername) {
        setTelegramCode({ code: data.code, botUsername: data.botUsername });
      }
    } catch {
      // Silent fail
    } finally {
      setTelegramLoading(false);
    }
  };

  const handleDisconnectTelegram = async () => {
    const token = apiToken ?? newApiToken;
    if (!token) return;
    setTelegramLoading(true);
    try {
      await fetch('/api/telegram/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiToken: token })
      });
      setTelegramCode(null);
      await fetchTelegramStatus();
    } catch {
      // Silent fail
    } finally {
      setTelegramLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          className="flex items-start space-x-4 mb-8 flex-col"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
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
        </motion.div>

        <SettingsErrorBoundary>
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, type: 'spring', stiffness: 300, damping: 25 }}
            >
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

                <div className="space-y-4">

                  <div className={`flex items-start gap-4 ${isEditing ? 'opacity-100' : 'opacity-50'}`}>
                    <div className="space-y-2 flex-1">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder={`${username}`}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="space-y-2 flex-1">
                      <Label htmlFor="apiToken">API Token</Label>
                      <Input
                        id="apiToken"
                        type="password"
                        value={newApiToken}
                        onChange={(e) => setNewApiToken(e.target.value)}
                        placeholder="•••••••••••••••••••••••"
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

                  </div>


                  <div className="flex flex-col md:flex-row items-stretch md:items-center md:justify-between space-y-2">
                    <div className="flex flex-col md:flex-row items-stretch md:items-center m-0">
                      {!isEditing ? (
                        <Button variant="secondary" onClick={() => setIsEditing(true)} className="w-full md:w-auto">
                          <Settings className="size-5" size={16} strokeWidth={1.5} />
                          Edit Account
                        </Button>
                      ) : (
                        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                          <Button onClick={handleSave} disabled={isSaving} className="w-full md:w-auto">
                            {isSaving ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
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
                    </div>

                    <Button variant="destructive_secondary" onClick={handleLogout} className="w-full md:w-auto">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            </motion.div>

            {/* Telegram */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 25 }}
            >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Send className="h-5 w-5" />
                  <span>Telegram</span>
                </CardTitle>
                <CardDescription>
                  Save links to Pinboard by sending them to the bot. Connect once, then send any URL in Telegram.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Bot connection</p>
                    <p className="text-sm text-muted-foreground">
                      {telegramConnected === null
                        ? 'Checking…'
                        : telegramConnected
                          ? 'This account is linked to Telegram'
                          : 'Not linked'}
                    </p>
                  </div>
                  <Badge variant={telegramConnected ? 'default' : 'secondary'}>
                    {telegramConnected === null ? '…' : telegramConnected ? 'Connected' : 'Not connected'}
                  </Badge>
                </div>

                {telegramCode ? (
                  <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                    <p className="text-sm font-medium">Send this in Telegram:</p>
                    <p className="font-mono text-sm break-all">
                      /start {telegramCode.code}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Open Telegram and send the line above to @{telegramCode.botUsername}. The code expires in 10 minutes.
                    </p>
                    <Button variant="outline" size="sm" onClick={() => setTelegramCode(null)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2">
                    {!telegramConnected ? (
                      <Button
                        onClick={handleConnectTelegram}
                        disabled={telegramLoading || !(apiToken ?? newApiToken)}
                      >
                        {telegramLoading ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        Connect Telegram
                      </Button>
                    ) : (
                      <Button
                        variant="destructive"
                        onClick={handleDisconnectTelegram}
                        disabled={telegramLoading}
                      >
                        {telegramLoading ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Unplug className="h-4 w-4 mr-2" />
                        )}
                        Disconnect
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            </motion.div>

            {/* App Info */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, type: 'spring', stiffness: 300, damping: 25 }}
            >
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
            </motion.div>
          </div>
        </SettingsErrorBoundary>
      </div>
    </div>
  );
}
