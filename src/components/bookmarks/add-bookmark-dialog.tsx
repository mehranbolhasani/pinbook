'use client';

import { useState, useMemo } from 'react';
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
import { X, Plus } from 'lucide-react';
import { useAddBookmark, useTags } from '@/hooks/usePinboard';
import { useToast } from '@/hooks/useToast';

interface AddBookmarkDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddBookmarkDialog({ isOpen, onClose }: AddBookmarkDialogProps) {
  const { mutate: addBookmark, isPending: isSubmitting } = useAddBookmark();
  const { data: tagsData = {} } = useTags();
  const toast = useToast();

  const allTagNames = useMemo(() => Object.keys(tagsData).sort(), [tagsData]);

  const [formData, setFormData] = useState({
    url: '',
    title: '',
    description: '',
    extended: '',
    tags: [] as string[],
    isShared: false
  });
  const [tagInput, setTagInput] = useState('');

  const handleSave = () => {
    if (!formData.url.trim()) {
      toast.showError('Validation Error', 'URL is required');
      return;
    }

    addBookmark({
      url: formData.url,
      description: formData.title || formData.description,
      extended: formData.extended,
      tags: formData.tags.join(' '),
      shared: formData.isShared ? 'yes' : 'no'
    }, {
      onSuccess: (newBookmark) => {
        toast.showSuccess('Bookmark added successfully', `"${newBookmark.title}" has been saved`);
        
        // Reset form
        setFormData({
          url: '',
          title: '',
          description: '',
          extended: '',
          tags: [],
          isShared: false
        });
        setTagInput('');
        
        onClose();
      },
      onError: (error) => {
        const errorMessage = error instanceof Error ? error.message : 'Failed to add bookmark';
        toast.showError('Failed to add bookmark', errorMessage);
      }
    });
  };

  const addTag = (tag?: string) => {
    const toAdd = (tag ?? tagInput).trim();
    if (toAdd && !formData.tags.includes(toAdd)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, toAdd]
      }));
      setTagInput('');
    }
  };

  const tagSuggestions = useMemo(() => {
    const q = tagInput.trim().toLowerCase();
    if (!q) return [];
    return allTagNames.filter(
      (name) =>
        name.toLowerCase().startsWith(q) && !formData.tags.includes(name)
    ).slice(0, 8);
  }, [tagInput, allTagNames, formData.tags]);

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (tagSuggestions.length > 0) {
        addTag(tagSuggestions[0]);
      } else {
        addTag();
      }
    }
  };

  const handleUrlChange = async (url: string) => {
    setFormData(prev => ({ ...prev, url }));
    
    // Auto-fetch title if URL looks valid and we don't have a title yet
    if (url.startsWith('http') && !formData.title) {
      try {
        const response = await fetch(`/api/meta?url=${encodeURIComponent(url)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.title) {
            setFormData(prev => ({ ...prev, title: data.title }));
          }
        }
      } catch {
        // Silently fail - user can still add bookmark manually
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Bookmark</DialogTitle>
          <DialogDescription>
            Save a new bookmark to your Pinboard account.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              value={formData.url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://example.com"
              type="url"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Bookmark title (optional)"
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
            <div className="relative flex space-x-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Add a tag"
              />
              <Button type="button" onClick={() => addTag()} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
              {tagSuggestions.length > 0 && (
                <ul
                  className="absolute top-full left-0 z-10 mt-1 w-[calc(100%-2.5rem)] rounded-md border bg-popover py-1 shadow-md"
                  role="listbox"
                >
                  {tagSuggestions.map((tag) => (
                    <li key={tag}>
                      <button
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                        onClick={() => addTag(tag)}
                        role="option"
                        aria-selected={false}
                      >
                        {tag}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
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
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting || !formData.url.trim()}>
            {isSubmitting ? 'Adding...' : 'Add Bookmark'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
