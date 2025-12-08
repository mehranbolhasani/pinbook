'use client';

import { useState, useRef, useEffect } from 'react';
import { Bookmark } from '@/types/pinboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { useBookmarkStore } from '@/lib/stores/bookmarks';
import { getPinboardAPI } from '@/lib/api/pinboard';
import { useAuthStore } from '@/lib/stores/auth';

interface InlineTagEditorProps {
  bookmark: Bookmark;
  onClose: () => void;
}

export function InlineTagEditor({ bookmark, onClose }: InlineTagEditorProps) {
  const { updateBookmark } = useBookmarkStore();
  const { apiToken } = useAuthStore();
  const [newTag, setNewTag] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleAddTag = async () => {
    if (!newTag.trim()) return;

    const tagToAdd = newTag.trim().toLowerCase();
    const updatedTags = [...bookmark.tags, tagToAdd];
    
    // Update local state immediately
    updateBookmark(bookmark.id, { tags: updatedTags });
    
    // Sync with Pinboard API
    if (apiToken) {
      try {
        const api = getPinboardAPI(apiToken);
        if (api) {
          await api.addBookmark({
            url: bookmark.url,
            description: bookmark.title,
            extended: bookmark.extended,
            tags: updatedTags.join(' '),
            toread: bookmark.isRead ? 'no' : 'yes',
            shared: bookmark.isShared ? 'yes' : 'no',
            replace: 'yes'
          });
        }
      } catch (error) {
        // Revert local state on error
        updateBookmark(bookmark.id, { tags: bookmark.tags });
      }
    }
    
    setNewTag('');
    setIsEditing(false);
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    const updatedTags = bookmark.tags.filter(tag => tag !== tagToRemove);
    
    // Update local state immediately
    updateBookmark(bookmark.id, { tags: updatedTags });
    
    // Sync with Pinboard API
    if (apiToken) {
      try {
        const api = getPinboardAPI(apiToken);
        if (api) {
          await api.addBookmark({
            url: bookmark.url,
            description: bookmark.title,
            extended: bookmark.extended,
            tags: updatedTags.join(' '),
            toread: bookmark.isRead ? 'no' : 'yes',
            shared: bookmark.isShared ? 'yes' : 'no',
            replace: 'yes'
          });
        }
      } catch (error) {
        // Revert local state on error
        updateBookmark(bookmark.id, { tags: bookmark.tags });
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTag();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setNewTag('');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        {bookmark.tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs">
            {tag}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => handleRemoveTag(tag)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
        
        {isEditing ? (
          <div className="flex items-center gap-1">
            <Input
              ref={inputRef}
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Enter tag..."
              className="h-6 text-xs w-24"
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleAddTag}
            >
              <Plus className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => {
                setIsEditing(false);
                setNewTag('');
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => setIsEditing(true)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Tag
          </Button>
        )}
      </div>
      
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  );
}
