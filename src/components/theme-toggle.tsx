'use client';

import * as React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Moon01Icon, Sun01Icon, ComputerIcon } from '@hugeicons/core-free-icons';
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
              <HugeiconsIcon icon={Moon01Icon} size={16} strokeWidth={1.5} aria-hidden />
            ) : theme === 'light' ? (
              <HugeiconsIcon icon={Sun01Icon} size={16} strokeWidth={1.5} aria-hidden />
            ) : (
              <HugeiconsIcon icon={ComputerIcon} size={16} strokeWidth={1.5} aria-hidden />
            )}
          </Button>
        ) : (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <HugeiconsIcon icon={Sun01Icon} size={16} className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <HugeiconsIcon icon={Moon01Icon} size={16} className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <HugeiconsIcon icon={Sun01Icon} size={16} className="mr-2" />
          <span>Light</span>
          {theme === 'light' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <HugeiconsIcon icon={Moon01Icon} size={16} className="mr-2" />
          <span>Dark</span>
          {theme === 'dark' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <HugeiconsIcon icon={ComputerIcon} size={16} className="mr-2" />
          <span>System</span>
          {(theme === 'system' || !theme) && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
