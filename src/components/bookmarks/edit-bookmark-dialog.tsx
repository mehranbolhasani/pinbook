'use client';

import { useState, useEffect } from 'react';
import { Bookmark } from '@/types/pinboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';
import { useBookmarkFolders } from '@/hooks/useBookmarkFolders';
import { useBookmarkFolderStore } from '@/lib/stores/bookmark-folders';

interface EditBookmarkDialogProps {
  bookmark: Bookmark | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookmark: Bookmark) => void;
}

export function EditBookmarkDialog({ bookmark, isOpen, onClose, onSave }: EditBookmarkDialogProps) {
  const { folders } = useBookmarkFolders();
  const { assignBookmarkToFolder, getBookmarkFolder } = useBookmarkFolderStore();
  
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    extended: '',
    tags: [] as string[],
    isShared: false,
    folderId: '' as string | undefined
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (bookmark) {
      const folderId = bookmark.folderId || getBookmarkFolder(bookmark.url);
      setFormData({
        title: bookmark.title,
        url: bookmark.url,
        description: bookmark.description,
        extended: bookmark.extended,
        tags: bookmark.tags,
        isShared: bookmark.isShared,
        folderId: folderId
      });
    }
  }, [bookmark, getBookmarkFolder]);

  const handleSave = () => {
    if (!bookmark) return;
    
    // Update folder assignment
    if (formData.folderId !== (bookmark.folderId || getBookmarkFolder(bookmark.url))) {
      assignBookmarkToFolder(bookmark.url, formData.folderId || null);
    }
    
    const updatedBookmark: Bookmark = {
      ...bookmark,
      ...formData,
      folderId: formData.folderId
    };
    
    onSave(updatedBookmark);
    onClose();
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  if (!bookmark) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Bookmark</DialogTitle>
          <DialogDescription>
            Update the bookmark details below.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Bookmark title"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://example.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description"
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="extended">Extended Notes</Label>
            <Textarea
              id="extended"
              value={formData.extended}
              onChange={(e) => setFormData(prev => ({ ...prev, extended: e.target.value }))}
              placeholder="Additional notes"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex space-x-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a tag"
              />
              <Button type="button" onClick={addTag} size="sm">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTag(tag)}
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="folder">Folder</Label>
            <Select
              value={formData.folderId || 'none'}
              onValueChange={(value) => setFormData(prev => ({ ...prev, folderId: value === 'none' ? undefined : value }))}
            >
              <SelectTrigger id="folder">
                <SelectValue placeholder="Select a folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Folder</SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-4">
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isShared"
                checked={formData.isShared}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isShared: checked }))}
              />
              <Label htmlFor="isShared">Share publicly</Label>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
