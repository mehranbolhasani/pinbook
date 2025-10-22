'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Palette, RotateCcw } from 'lucide-react';
import { useTheme } from 'next-themes';

interface AccentColor {
  name: string;
  value: string;
  description: string;
}

const accentColors: AccentColor[] = [
  { name: 'Default', value: 'hsl(210, 40%, 50%)', description: 'Blue' },
  { name: 'Red', value: 'hsl(0, 84%, 60%)', description: 'Red' },
  { name: 'Rose', value: 'hsl(346, 87%, 43%)', description: 'Rose' },
  { name: 'Orange', value: 'hsl(24, 95%, 53%)', description: 'Orange' },
  { name: 'Green', value: 'hsl(142, 76%, 36%)', description: 'Green' },
  { name: 'Blue', value: 'hsl(221, 83%, 53%)', description: 'Blue' },
  { name: 'Yellow', value: 'hsl(45, 93%, 47%)', description: 'Yellow' },
  { name: 'Violet', value: 'hsl(262, 83%, 58%)', description: 'Violet' },
];

export function ThemeCustomizer() {
  const { theme, setTheme } = useTheme();
  const [selectedAccent, setSelectedAccent] = useState<string>('Default');
  const [customAccent, setCustomAccent] = useState<string>('#3b82f6');

  useEffect(() => {
    // Load saved accent color from localStorage
    const savedAccent = localStorage.getItem('pinbook-accent-color');
    if (savedAccent) {
      setCustomAccent(savedAccent);
      // Check if it matches any preset
      const preset = accentColors.find(p => p.value === savedAccent);
      if (preset) {
        setSelectedAccent(preset.name);
      } else {
        setSelectedAccent('Custom');
      }
    }
  }, []);

  const applyAccentColor = (color: string) => {
    // Apply the accent color to CSS custom properties
    document.documentElement.style.setProperty('--primary', color);
    document.documentElement.style.setProperty('--primary-foreground', 'hsl(0, 0%, 98%)');
    
    // Save to localStorage
    localStorage.setItem('pinbook-accent-color', color);
  };

  const handleAccentSelect = (accent: AccentColor) => {
    setSelectedAccent(accent.name);
    setCustomAccent(accent.value);
    applyAccentColor(accent.value);
  };

  const handleCustomAccentChange = (color: string) => {
    setCustomAccent(color);
    setSelectedAccent('Custom');
    applyAccentColor(color);
  };

  const resetToDefault = () => {
    const defaultAccent = accentColors[0];
    setSelectedAccent(defaultAccent.name);
    setCustomAccent(defaultAccent.value);
    applyAccentColor(defaultAccent.value);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Theme Customization
        </CardTitle>
        <CardDescription>
          Customize your app&apos;s accent color and appearance
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="theme-mode">Dark Mode</Label>
          <Switch
            id="theme-mode"
            checked={theme === 'dark'}
            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Accent Color</h4>
          <div className="grid grid-cols-4 gap-2">
            {accentColors.map((accent) => (
              <Button
                key={accent.name}
                variant={selectedAccent === accent.name ? 'default' : 'outline'}
                onClick={() => handleAccentSelect(accent)}
                className="flex flex-col h-auto p-3"
              >
                <div
                  className="w-6 h-6 rounded-full mb-2 border-2 border-white shadow-sm"
                  style={{ backgroundColor: accent.value }}
                />
                <span className="text-xs font-medium">{accent.name}</span>
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Custom Accent Color</h4>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Label htmlFor="custom-accent">Choose a custom color</Label>
              <input
                id="custom-accent"
                type="color"
                value={customAccent}
                onChange={(e) => handleCustomAccentChange(e.target.value)}
                className="w-full h-10 rounded border border-input bg-background"
              />
            </div>
            <div
              className="w-12 h-12 rounded border-2 border-border shadow-sm"
              style={{ backgroundColor: customAccent }}
            />
          </div>
        </div>

        <Separator />

        <Button variant="outline" onClick={resetToDefault} className="w-full flex items-center gap-2">
          <RotateCcw className="h-4 w-4" />
          Reset to Default
        </Button>
      </CardContent>
    </Card>
  );
}