'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Keyboard, Search, Plus, X, ArrowUp, CornerDownLeft, Edit, Eye, HelpCircle } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  {
    category: 'Navigation',
    items: [
      { keys: ['↑', '↓', '←', '→'], description: 'Navigate between bookmarks', icon: ArrowUp },
      { keys: ['Enter'], description: 'Open selected bookmark', icon: CornerDownLeft },
    ]
  },
  {
    category: 'Actions',
    items: [
      { keys: ['E'], description: 'Edit selected bookmark', icon: Edit },
      { keys: ['R'], description: 'Toggle read/unread status', icon: Eye },
    ]
  },
  {
    category: 'Global',
    items: [
      { keys: ['Cmd/Ctrl', 'K'], description: 'Focus search bar', icon: Search },
      { keys: ['Cmd/Ctrl', 'N'], description: 'Add new bookmark', icon: Plus },
      { keys: ['Esc'], description: 'Close dialogs', icon: X },
      { keys: ['?'], description: 'Show this help', icon: HelpCircle },
    ]
  }
];

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {shortcuts.map((category) => (
            <div key={category.category}>
              <h3 className="font-semibold text-sm text-muted-foreground mb-3">
                {category.category}
              </h3>
              <div className="space-y-2">
                {category.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{item.description}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {item.keys.map((key, keyIndex) => (
                        <div key={keyIndex} className="flex items-center gap-1">
                          <Badge variant="secondary" className="font-mono text-xs">
                            {key}
                          </Badge>
                          {keyIndex < item.keys.length - 1 && (
                            <span className="text-muted-foreground text-xs">+</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Shortcuts don&apos;t work when typing in input fields or text areas.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
