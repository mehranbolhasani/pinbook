'use client';

import { useState } from 'react';
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
import { useBookmarkStore } from '@/lib/stores/bookmarks';
import { getPinboardAPI } from '@/lib/api/pinboard';
import { useAuthStore } from '@/lib/stores/auth';

interface AddBookmarkDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddBookmarkDialog({ isOpen, onClose }: AddBookmarkDialogProps) {
  const { apiToken } = useAuthStore();
  const { addBookmark, setLoading, setError } = useBookmarkStore();
  
  const [formData, setFormData] = useState({
    url: '',
    title: '',
    description: '',
    extended: '',
    tags: [] as string[],
    isRead: false,
    isShared: false
  });
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!formData.url.trim()) {
      setError('URL is required');
      return;
    }

    if (!apiToken) {
      setError('Not authenticated');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const api = getPinboardAPI(apiToken);
      if (!api) throw new Error('Failed to initialize API');

      // Create the bookmark via Pinboard API
      const newBookmark = await api.addBookmark({
        url: formData.url,
        description: formData.title || formData.description,
        extended: formData.extended,
        tags: formData.tags.join(' '),
        toread: formData.isRead ? 'no' : 'yes',
        shared: formData.isShared ? 'yes' : 'no'
      });

      // Add to local store
      addBookmark(newBookmark);
      
      // Reset form
      setFormData({
        url: '',
        title: '',
        description: '',
        extended: '',
        tags: [],
        isRead: false,
        isShared: false
      });
      setTagInput('');
      
      onClose();
    } catch (error) {
      console.error('Failed to add bookmark:', error);
      setError(error instanceof Error ? error.message : 'Failed to add bookmark');
    } finally {
      setIsSubmitting(false);
    }
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
      } catch (error) {
        console.log('Could not fetch title:', error);
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
            <div className="flex space-x-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a tag"
              />
              <Button type="button" onClick={addTag} size="sm">
                <Plus className="h-4 w-4" />
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
                id="isRead"
                checked={formData.isRead}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isRead: checked }))}
              />
              <Label htmlFor="isRead">Mark as read</Label>
            </div>
            
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
