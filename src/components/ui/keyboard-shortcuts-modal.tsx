'use client';

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Keyboard, Search, Plus, Edit, Trash2, ArrowUp, CornerDownLeft, X } from 'lucide-react';

interface KeyboardShortcut {
  keys: string[];
  description: string;
  icon?: React.ReactNode;
  category: string;
}

const shortcuts: KeyboardShortcut[] = [
  {
    keys: ['Cmd', 'K'],
    description: 'Focus search bar',
    icon: <Search className="h-4 w-4" />,
    category: 'Navigation'
  },
  {
    keys: ['Cmd', 'N'],
    description: 'Open add bookmark dialog',
    icon: <Plus className="h-4 w-4" />,
    category: 'Actions'
  },
  {
    keys: ['Escape'],
    description: 'Close dialogs and modals',
    icon: <X className="h-4 w-4" />,
    category: 'Navigation'
  },
  {
    keys: ['Arrow Up', 'Arrow Down'],
    description: 'Navigate between bookmarks',
    icon: <ArrowUp className="h-4 w-4" />,
    category: 'Navigation'
  },
  {
    keys: ['Enter'],
    description: 'Open selected bookmark',
    icon: <CornerDownLeft className="h-4 w-4" />,
    category: 'Actions'
  },
  {
    keys: ['E'],
    description: 'Edit selected bookmark',
    icon: <Edit className="h-4 w-4" />,
    category: 'Actions'
  },
  {
    keys: ['Delete'],
    description: 'Delete selected bookmark',
    icon: <Trash2 className="h-4 w-4" />,
    category: 'Actions'
  },
  {
    keys: ['?'],
    description: 'Show this keyboard shortcuts modal',
    icon: <Keyboard className="h-4 w-4" />,
    category: 'Help'
  }
];

const categories = ['Navigation', 'Actions', 'Help'];

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const getKeyDisplay = (key: string) => {
    const keyMap: Record<string, string> = {
      'Cmd': '⌘',
      'Ctrl': 'Ctrl',
      'Shift': '⇧',
      'Alt': '⌥',
      'Enter': '↵',
      'Escape': '⎋',
      'Delete': '⌫',
      'Arrow Up': '↑',
      'Arrow Down': '↓',
      'Space': '␣'
    };
    return keyMap[key] || key;
  };

  const renderKey = (key: string) => (
    <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
      {getKeyDisplay(key)}
    </kbd>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to navigate and interact with your bookmarks more efficiently.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category} className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {category}
              </h3>
              <div className="space-y-2">
                {shortcuts
                  .filter(shortcut => shortcut.category === category)
                  .map((shortcut, index) => (
                    <div
                      key={`${category}-${index}`}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {shortcut.icon && (
                          <div className="text-muted-foreground">
                            {shortcut.icon}
                          </div>
                        )}
                        <span className="text-sm font-medium">
                          {shortcut.description}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <React.Fragment key={keyIndex}>
                            {renderKey(key)}
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="text-muted-foreground mx-1">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
              {category !== categories[categories.length - 1] && (
                <Separator className="my-4" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-muted-foreground mt-0.5">
              <Keyboard className="h-4 w-4" />
            </div>
            <div className="text-sm">
              <p className="font-medium mb-1">Pro Tips:</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• Use <kbd className="px-1 py-0.5 text-xs bg-muted rounded">Cmd/Ctrl + K</kbd> to quickly search</li>
                <li>• Press <kbd className="px-1 py-0.5 text-xs bg-muted rounded">?</kbd> anytime to see this help</li>
                <li>• Keyboard shortcuts work in all views (list, card, minimal)</li>
                <li>• Some shortcuts require a bookmark to be selected first</li>
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
