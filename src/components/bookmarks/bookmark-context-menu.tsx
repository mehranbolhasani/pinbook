'use client';

import { useState } from 'react';
import { Bookmark } from '@/types/pinboard';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  ExternalLink, 
  Edit, 
  Trash2, 
  Share, 
  Share2, 
  Copy,
  Tag
} from 'lucide-react';
import { useBookmarkStore } from '@/lib/stores/bookmarks';
import { getPinboardAPI } from '@/lib/api/pinboard';
import { useAuthStore } from '@/lib/stores/auth';

interface BookmarkContextMenuProps {
  bookmark: Bookmark;
  onEdit?: (bookmark: Bookmark) => void;
  onDelete?: (bookmark: Bookmark) => void;
  children: React.ReactNode;
}

export function BookmarkContextMenu({ bookmark, onEdit, onDelete, children }: BookmarkContextMenuProps) {
  const { updateBookmark } = useBookmarkStore();
  const { apiToken } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  

  const handleToggleShared = async () => {
    const newSharedStatus = !bookmark.isShared;
    
    // Update local state immediately for responsive UI
    updateBookmark(bookmark.id, { isShared: newSharedStatus });
    
    // Sync with Pinboard API
    if (apiToken) {
      try {
        const api = getPinboardAPI(apiToken);
        if (api) {
          await api.updateBookmarkShareStatus(bookmark.hash, newSharedStatus);
          console.log(`Bookmark "${bookmark.title}" marked as ${newSharedStatus ? 'shared' : 'private'}.`);
        }
      } catch (error) {
        console.error('Failed to update bookmark share status:', error);
        // Revert local state on error
        updateBookmark(bookmark.id, { isShared: !newSharedStatus });
      }
    }
    setIsOpen(false);
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(bookmark.url);
      console.log('URL copied to clipboard');
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
    setIsOpen(false);
  };

  const handleOpenLink = () => {
    window.open(bookmark.url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const handleEdit = () => {
    onEdit?.(bookmark);
    setIsOpen(false);
  };

  const handleDelete = () => {
    onDelete?.(bookmark);
    setIsOpen(false);
  };

  const handleAddTag = () => {
    // TODO: Implement inline tag editing
    console.log('Add tag to bookmark:', bookmark.id);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleOpenLink}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Open Link
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleCopyUrl}>
          <Copy className="h-4 w-4 mr-2" />
          Copy URL
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleToggleShared}>
          {bookmark.isShared ? (
            <>
              <Share2 className="h-4 w-4 mr-2" />
              Make Private
            </>
          ) : (
            <>
              <Share className="h-4 w-4 mr-2" />
              Make Public
            </>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleAddTag}>
          <Tag className="h-4 w-4 mr-2" />
          Add Tag
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={handleDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
