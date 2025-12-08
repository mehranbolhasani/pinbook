'use client';

import { useState } from 'react';
import { Bookmark } from '@/types/pinboard';
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { 
  ExternalLink, 
  Edit, 
  Trash2, 
  Share, 
  Share2, 
  Copy
} from 'lucide-react';
import { useBookmarkStore } from '@/lib/stores/bookmarks';
import { getPinboardAPI } from '@/lib/api/pinboard';
import { useAuthStore } from '@/lib/stores/auth';
import { useToast } from '@/hooks/useToast';

interface RightClickContextMenuProps {
  bookmark: Bookmark;
  children: React.ReactNode;
  onEdit?: (bookmark: Bookmark) => void;
  onDelete?: (bookmark: Bookmark) => void;
}

export function RightClickContextMenu({ 
  bookmark, 
  children, 
  onEdit, 
  onDelete 
}: RightClickContextMenuProps) {
  const { updateBookmark } = useBookmarkStore();
  const { apiToken } = useAuthStore();
  const toast = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  

  const handleToggleShared = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    const newSharedStatus = !bookmark.isShared;

    // Update local state immediately for responsive UI
    updateBookmark(bookmark.id, { isShared: newSharedStatus });

    // Sync with Pinboard API
    if (apiToken) {
      try {
        const api = getPinboardAPI(apiToken);
        if (api) {
          await api.updateBookmarkShareStatus(bookmark.hash, newSharedStatus);
          toast.showSuccess(
            newSharedStatus ? 'Made public' : 'Made private',
            `"${bookmark.title}"`
          );
        }
      } catch (error) {
        // Revert local state on error
        updateBookmark(bookmark.id, { isShared: bookmark.isShared });
        toast.showError('Failed to update bookmark', 'Please try again');
      }
    }
    setIsProcessing(false);
  };

  const handleOpenUrl = () => {
    window.open(bookmark.url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(bookmark.url);
    toast.showSuccess('URL copied to clipboard');
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(bookmark);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(bookmark);
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={handleOpenUrl}>
          <ExternalLink className="mr-2 h-4 w-4" />
          Open Link
        </ContextMenuItem>
        
        <ContextMenuItem onClick={handleCopyUrl}>
          <Copy className="mr-2 h-4 w-4" />
          Copy URL
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        <ContextMenuItem onClick={handleEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Bookmark
        </ContextMenuItem>
        
        
        
        <ContextMenuItem onClick={handleToggleShared}>
          {bookmark.isShared ? (
            <>
              <Share2 className="mr-2 h-4 w-4" />
              Make Private
            </>
          ) : (
            <>
              <Share className="mr-2 h-4 w-4" />
              Make Public
            </>
          )}
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        <ContextMenuItem 
          onClick={handleDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Bookmark
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
