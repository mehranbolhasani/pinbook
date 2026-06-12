'use client';

import * as React from 'react';
import { DarkMode, LightMode, Computer } from '@nine-thirty-five/material-symbols-react/rounded/300';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ThemeToggleProps {
  variant?: 'default' | 'icon';
}

export function ThemeToggle({ variant = 'default' }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === 'icon' ? (
          <Button
            variant="icon"
            size="icon-sm"
            aria-label="Theme"
            className="bg-transparent text-primary"
            title="Theme"
          >
            {theme === 'dark' ? (
              <DarkMode size={16} aria-hidden />
            ) : theme === 'light' ? (
              <LightMode size={16} aria-hidden />
            ) : (
              <Computer size={16} aria-hidden />
            )}
          </Button>
        ) : (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <LightMode size={16} className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <DarkMode size={16} className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <LightMode size={16} className="mr-2" />
          <span>Light</span>
          {theme === 'light' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <DarkMode size={16} className="mr-2" />
          <span>Dark</span>
          {theme === 'dark' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Computer size={16} className="mr-2" />
          <span>System</span>
          {(theme === 'system' || !theme) && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
