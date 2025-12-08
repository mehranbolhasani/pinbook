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
        }
      } catch {
        // Revert local state on error
        updateBookmark(bookmark.id, { isShared: !newSharedStatus });
      }
    }
    setIsOpen(false);
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(bookmark.url);
    } catch {
      // Silently fail
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
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleOpenLink} className="group">
          <ExternalLink className="h-4 w-4 mr-2 text-foreground group-hover:text-accent" />
          Open Link
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleCopyUrl} className="group">
          <Copy className="h-4 w-4 mr-2 text-foreground group-hover:text-accent" />
          Copy URL
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleToggleShared} className="group">
          {bookmark.isShared ? (
            <>
              <Share2 className="h-4 w-4 mr-2 text-foreground group-hover:text-accent" />
              Make Private
            </>
          ) : (
            <>
              <Share className="h-4 w-4 mr-2 text-foreground group-hover:text-accent" />
              Make Public
            </>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleAddTag} className="group">
          <Tag className="h-4 w-4 mr-2 text-foreground group-hover:text-accent" />
          Add Tag
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleEdit} className="group">
          <Edit className="h-4 w-4 mr-2 text-foreground group-hover:text-accent" />
          Edit
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={handleDelete}
          className="text-destructive focus:text-accent group hover:text-accent"
        >
          <Trash2 className="h-4 w-4 mr-2 text-destructive group-hover:text-accent" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
