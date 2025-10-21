'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
// import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Palette, RotateCcw } from 'lucide-react';
import { useTheme } from 'next-themes';

interface ColorPreset {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
}

const colorPresets: ColorPreset[] = [
  {
    name: 'Default',
    primary: 'hsl(210, 40%, 98%)',
    secondary: 'hsl(210, 40%, 96%)',
    accent: 'hsl(210, 40%, 94%)',
    background: 'hsl(0, 0%, 100%)',
    foreground: 'hsl(222.2, 84%, 4.9%)',
  },
  {
    name: 'Blue',
    primary: 'hsl(214, 95%, 93%)',
    secondary: 'hsl(214, 95%, 90%)',
    accent: 'hsl(214, 95%, 87%)',
    background: 'hsl(0, 0%, 100%)',
    foreground: 'hsl(222.2, 84%, 4.9%)',
  },
  {
    name: 'Green',
    primary: 'hsl(142, 76%, 93%)',
    secondary: 'hsl(142, 76%, 90%)',
    accent: 'hsl(142, 76%, 87%)',
    background: 'hsl(0, 0%, 100%)',
    foreground: 'hsl(222.2, 84%, 4.9%)',
  },
  {
    name: 'Purple',
    primary: 'hsl(262, 83%, 93%)',
    secondary: 'hsl(262, 83%, 90%)',
    accent: 'hsl(262, 83%, 87%)',
    background: 'hsl(0, 0%, 100%)',
    foreground: 'hsl(222.2, 84%, 4.9%)',
  },
  {
    name: 'Orange',
    primary: 'hsl(24, 95%, 93%)',
    secondary: 'hsl(24, 95%, 90%)',
    accent: 'hsl(24, 95%, 87%)',
    background: 'hsl(0, 0%, 100%)',
    foreground: 'hsl(222.2, 84%, 4.9%)',
  },
  {
    name: 'Dark Blue',
    primary: 'hsl(214, 95%, 15%)',
    secondary: 'hsl(214, 95%, 20%)',
    accent: 'hsl(214, 95%, 25%)',
    background: 'hsl(222.2, 84%, 4.9%)',
    foreground: 'hsl(210, 40%, 98%)',
  },
];

export function ThemeCustomizer() {
  const { theme, setTheme } = useTheme();
  const [customColors, setCustomColors] = useState({
    primary: 'hsl(210, 40%, 98%)',
    secondary: 'hsl(210, 40%, 96%)',
    accent: 'hsl(210, 40%, 94%)',
    background: 'hsl(0, 0%, 100%)',
    foreground: 'hsl(222.2, 84%, 4.9%)',
  });
  const [useCustomColors, setUseCustomColors] = useState(false);

  const applyPreset = (preset: ColorPreset) => {
    setCustomColors(preset);
    applyCustomColors(preset);
  };

  const applyCustomColors = (colors: typeof customColors) => {
    const root = document.documentElement;
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--secondary', colors.secondary);
    root.style.setProperty('--accent', colors.accent);
    root.style.setProperty('--background', colors.background);
    root.style.setProperty('--foreground', colors.foreground);
    
    // Store in localStorage
    localStorage.setItem('custom-theme-colors', JSON.stringify(colors));
  };

  const resetToDefault = () => {
    const defaultPreset = colorPresets[0];
    setCustomColors(defaultPreset);
    applyCustomColors(defaultPreset);
    setUseCustomColors(false);
    localStorage.removeItem('custom-theme-colors');
  };

  const handleColorChange = (colorKey: keyof typeof customColors, value: string) => {
    const newColors = { ...customColors, [colorKey]: value };
    setCustomColors(newColors);
    if (useCustomColors) {
      applyCustomColors(newColors);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Theme Customization
        </CardTitle>
        <CardDescription>
          Customize your app&apos;s color scheme and appearance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Theme Mode */}
        <div className="space-y-2">
          <Label>Theme Mode</Label>
          <div className="flex gap-2">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('light')}
            >
              Light
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('dark')}
            >
              Dark
            </Button>
            <Button
              variant={theme === 'system' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('system')}
            >
              System
            </Button>
          </div>
        </div>

        <Separator />

        {/* Color Presets */}
        <div className="space-y-3">
          <Label>Color Presets</Label>
          <div className="grid grid-cols-2 gap-2">
            {colorPresets.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                size="sm"
                onClick={() => applyPreset(preset)}
                className="justify-start"
              >
                <div
                  className="w-4 h-4 rounded-full mr-2"
                  style={{ backgroundColor: preset.primary }}
                />
                {preset.name}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Custom Colors */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Custom Colors</Label>
            <Switch
              checked={useCustomColors}
              onCheckedChange={setUseCustomColors}
            />
          </div>
          
          {useCustomColors && (
            <div className="space-y-4">
              {Object.entries(customColors).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label className="capitalize">{key}</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={value}
                      onChange={(e) => handleColorChange(key as keyof typeof customColors, e.target.value)}
                      className="w-8 h-8 rounded border"
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleColorChange(key as keyof typeof customColors, e.target.value)}
                      className="flex-1 px-2 py-1 text-sm border rounded"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Reset Button */}
        <Button
          variant="outline"
          onClick={resetToDefault}
          className="w-full"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Default
        </Button>
      </CardContent>
    </Card>
  );
}
