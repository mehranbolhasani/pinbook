'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Palette, RotateCcw } from 'lucide-react';
import { useTheme } from 'next-themes';

interface ThemePalette {
  name: string;
  description: string;
  colors: {
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    accent: string;
    accentForeground: string;
    muted: string;
    mutedForeground: string;
    ring: string;
  };
  swatch: string[];
}

const palettes: ThemePalette[] = [
  {
    name: 'Default',
    description: 'Clean blue',
    colors: {
      primary: 'hsl(210, 40%, 50%)',
      primaryForeground: 'hsl(0, 0%, 98%)',
      secondary: 'hsl(210, 20%, 96%)',
      secondaryForeground: 'hsl(210, 20%, 20%)',
      accent: 'hsl(210, 20%, 96%)',
      accentForeground: 'hsl(210, 20%, 20%)',
      muted: 'hsl(210, 20%, 96%)',
      mutedForeground: 'hsl(210, 15%, 40%)',
      ring: 'hsl(210, 50%, 60%)',
    },
    swatch: ['#2F6FEB', '#111827', '#E5E7EB', '#93C5FD'],
  },
  {
    name: 'Sunset',
    description: 'Warm coral',
    colors: {
      primary: 'hsl(12, 85%, 62%)',
      primaryForeground: 'hsl(0, 0%, 98%)',
      secondary: 'hsl(20, 75%, 92%)',
      secondaryForeground: 'hsl(20, 30%, 20%)',
      accent: 'hsl(345, 80%, 90%)',
      accentForeground: 'hsl(345, 30%, 20%)',
      muted: 'hsl(15, 40%, 95%)',
      mutedForeground: 'hsl(15, 20%, 35%)',
      ring: 'hsl(12, 85%, 62%)',
    },
    swatch: ['#FF6B6B', '#1F2937', '#FCE7F3', '#FDBA74'],
  },
  {
    name: 'Forest',
    description: 'Fresh green',
    colors: {
      primary: 'hsl(142, 76%, 36%)',
      primaryForeground: 'hsl(0, 0%, 98%)',
      secondary: 'hsl(142, 30%, 92%)',
      secondaryForeground: 'hsl(142, 20%, 20%)',
      accent: 'hsl(142, 30%, 92%)',
      accentForeground: 'hsl(142, 20%, 20%)',
      muted: 'hsl(142, 25%, 95%)',
      mutedForeground: 'hsl(142, 15%, 35%)',
      ring: 'hsl(142, 60%, 45%)',
    },
    swatch: ['#16A34A', '#0F172A', '#DCFCE7', '#86EFAC'],
  },
  {
    name: 'Ocean',
    description: 'Deep blue',
    colors: {
      primary: 'hsl(221, 83%, 53%)',
      primaryForeground: 'hsl(0, 0%, 98%)',
      secondary: 'hsl(221, 30%, 92%)',
      secondaryForeground: 'hsl(221, 20%, 20%)',
      accent: 'hsl(221, 30%, 92%)',
      accentForeground: 'hsl(221, 20%, 20%)',
      muted: 'hsl(221, 25%, 95%)',
      mutedForeground: 'hsl(221, 15%, 35%)',
      ring: 'hsl(221, 60%, 55%)',
    },
    swatch: ['#3B82F6', '#0F172A', '#DBEAFE', '#93C5FD'],
  },
  {
    name: 'Plum',
    description: 'Violet mix',
    colors: {
      primary: 'hsl(262, 83%, 58%)',
      primaryForeground: 'hsl(0, 0%, 98%)',
      secondary: 'hsl(262, 30%, 92%)',
      secondaryForeground: 'hsl(262, 20%, 20%)',
      accent: 'hsl(280, 30%, 92%)',
      accentForeground: 'hsl(280, 20%, 20%)',
      muted: 'hsl(280, 25%, 95%)',
      mutedForeground: 'hsl(280, 15%, 35%)',
      ring: 'hsl(262, 60%, 58%)',
    },
    swatch: ['#8B5CF6', '#111827', '#EDE9FE', '#C4B5FD'],
  },
  {
    name: 'Sand',
    description: 'Neutral warm',
    colors: {
      primary: 'hsl(35, 84%, 57%)',
      primaryForeground: 'hsl(0, 0%, 98%)',
      secondary: 'hsl(40, 35%, 92%)',
      secondaryForeground: 'hsl(40, 30%, 20%)',
      accent: 'hsl(45, 35%, 92%)',
      accentForeground: 'hsl(45, 30%, 20%)',
      muted: 'hsl(45, 20%, 95%)',
      mutedForeground: 'hsl(45, 15%, 35%)',
      ring: 'hsl(35, 84%, 57%)',
    },
    swatch: ['#F59E0B', '#1F2937', '#FEF3C7', '#FDE68A'],
  },
  {
    name: 'Mint',
    description: 'Cool mint',
    colors: {
      primary: 'hsl(160, 84%, 39%)',
      primaryForeground: 'hsl(0, 0%, 98%)',
      secondary: 'hsl(160, 30%, 92%)',
      secondaryForeground: 'hsl(160, 20%, 20%)',
      accent: 'hsl(160, 35%, 92%)',
      accentForeground: 'hsl(160, 20%, 20%)',
      muted: 'hsl(160, 25%, 95%)',
      mutedForeground: 'hsl(160, 15%, 35%)',
      ring: 'hsl(160, 70%, 45%)',
    },
    swatch: ['#10B981', '#0F172A', '#D1FAE5', '#6EE7B7'],
  },
  {
    name: 'Crimson',
    description: 'Bold red',
    colors: {
      primary: 'hsl(0, 72%, 51%)',
      primaryForeground: 'hsl(0, 0%, 98%)',
      secondary: 'hsl(0, 30%, 92%)',
      secondaryForeground: 'hsl(0, 20%, 20%)',
      accent: 'hsl(350, 35%, 92%)',
      accentForeground: 'hsl(350, 20%, 20%)',
      muted: 'hsl(0, 25%, 95%)',
      mutedForeground: 'hsl(0, 15%, 35%)',
      ring: 'hsl(0, 70%, 51%)',
    },
    swatch: ['#EF4444', '#111827', '#FEE2E2', '#FCA5A5'],
  },
  {
    name: 'Slate',
    description: 'Cool neutral',
    colors: {
      primary: 'hsl(215, 20%, 35%)',
      primaryForeground: 'hsl(0, 0%, 98%)',
      secondary: 'hsl(215, 25%, 92%)',
      secondaryForeground: 'hsl(215, 25%, 20%)',
      accent: 'hsl(215, 20%, 92%)',
      accentForeground: 'hsl(215, 20%, 20%)',
      muted: 'hsl(215, 15%, 95%)',
      mutedForeground: 'hsl(215, 15%, 35%)',
      ring: 'hsl(215, 20%, 45%)',
    },
    swatch: ['#475569', '#0F172A', '#E2E8F0', '#CBD5E1'],
  },
  {
    name: 'Rose Pine',
    description: 'Soft purple',
    colors: {
      primary: 'hsl(330, 55%, 55%)',
      primaryForeground: 'hsl(0, 0%, 98%)',
      secondary: 'hsl(280, 20%, 92%)',
      secondaryForeground: 'hsl(280, 20%, 20%)',
      accent: 'hsl(330, 20%, 92%)',
      accentForeground: 'hsl(330, 20%, 20%)',
      muted: 'hsl(280, 18%, 95%)',
      mutedForeground: 'hsl(280, 15%, 35%)',
      ring: 'hsl(330, 55%, 55%)',
    },
    swatch: ['#E879F9', '#1F2937', '#F5EAFE', '#C7A0D7'],
  },
];

export function ThemeCustomizer() {
  const { theme, setTheme } = useTheme();
  const [selectedPalette, setSelectedPalette] = useState<string>('Default');

  useEffect(() => {
    const savedPalette = localStorage.getItem('pinbook-theme-palette');
    if (savedPalette) {
      const found = palettes.find(p => p.name === savedPalette);
      if (found) {
        setSelectedPalette(found.name);
        applyPalette(found);
      }
    } else {
      applyPalette(palettes[0]);
    }
  }, []);

  const applyPalette = (palette: ThemePalette) => {
    const { colors } = palette;
    document.documentElement.style.setProperty('--primary', colors.primary);
    document.documentElement.style.setProperty('--primary-foreground', colors.primaryForeground);
    document.documentElement.style.setProperty('--secondary', colors.secondary);
    document.documentElement.style.setProperty('--secondary-foreground', colors.secondaryForeground);
    document.documentElement.style.setProperty('--accent', colors.accent);
    document.documentElement.style.setProperty('--accent-foreground', colors.accentForeground);
    document.documentElement.style.setProperty('--muted', colors.muted);
    document.documentElement.style.setProperty('--muted-foreground', colors.mutedForeground);
    document.documentElement.style.setProperty('--ring', colors.ring);

    localStorage.setItem('pinbook-theme-palette', palette.name);
    localStorage.setItem('pinbook-theme-vars', JSON.stringify(colors));
  };

  const handlePaletteSelect = (palette: ThemePalette) => {
    setSelectedPalette(palette.name);
    applyPalette(palette);
  };

  const resetToDefault = () => {
    const defaultPalette = palettes[0];
    setSelectedPalette(defaultPalette.name);
    applyPalette(defaultPalette);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Theme Customization
        </CardTitle>
        <CardDescription>
          Customize your app&apos;s theme colors and appearance
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
          <h4 className="text-sm font-medium">Theme Palettes</h4>
          <div className="grid grid-cols-3 gap-3">
            {palettes.map((palette) => (
              <Button
                key={palette.name}
                variant={selectedPalette === palette.name ? 'default' : 'outline'}
                onClick={() => handlePaletteSelect(palette)}
                className="flex h-auto p-3 items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1">
                    {palette.swatch.map((c, i) => (
                      <span key={i} className="inline-block size-4 rounded-full border border-white" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <span className="text-xs font-medium">{palette.name}</span>
                </div>
                <span className="text-[10px] text-muted-foreground">{palette.description}</span>
              </Button>
            ))}
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
