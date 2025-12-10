'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useFolderStore, Folder } from '@/lib/stores/folders';

interface FolderDialogProps {
  folder: Folder | null;
  isOpen: boolean;
  onClose: () => void;
}

export function FolderDialog({ folder, isOpen, onClose }: FolderDialogProps) {
  const { createFolder, updateFolder } = useFolderStore();
  const [name, setName] = useState('');

  useEffect(() => {
    if (folder) {
      setName(folder.name);
    } else {
      setName('');
    }
  }, [folder, isOpen]);

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }

    if (folder) {
      updateFolder(folder.id, trimmedName);
    } else {
      createFolder(trimmedName);
    }
    
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{folder ? 'Edit Folder' : 'Create Folder'}</DialogTitle>
          <DialogDescription>
            {folder ? 'Update the folder name below.' : 'Create a new folder to organize your bookmarks.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input
              id="folder-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="My Folder"
              autoFocus
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {folder ? 'Save Changes' : 'Create Folder'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



