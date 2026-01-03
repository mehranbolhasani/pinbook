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
import { X } from 'lucide-react';

interface EditBookmarkDialogProps {
  bookmark: Bookmark | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookmark: Bookmark) => void;
}

export function EditBookmarkDialog({ bookmark, isOpen, onClose, onSave }: EditBookmarkDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    extended: '',
    tags: [] as string[],
    isShared: false
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (bookmark) {
      setFormData({
        title: bookmark.title,
        url: bookmark.url,
        description: bookmark.description,
        extended: bookmark.extended,
        tags: bookmark.tags,
        isShared: bookmark.isShared
      });
    }
  }, [bookmark]);

  const handleSave = () => {
    if (!bookmark) return;
    
    const updatedBookmark: Bookmark = {
      ...bookmark,
      ...formData
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

  if (!bookmark) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <DialogHeader>
            <DialogTitle>Edit Bookmark</DialogTitle>
            <DialogDescription>
              Update the bookmark details below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Bookmark title"
                autoComplete="off"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://example.com"
                type="url"
                required
                autoComplete="off"
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
                autoComplete="off"
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
                autoComplete="off"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex space-x-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Add a tag"
                  autoComplete="off"
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
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
