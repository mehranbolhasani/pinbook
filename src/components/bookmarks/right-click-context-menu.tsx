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
import { useUpdateBookmark } from '@/hooks/usePinboard';
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
  const updateBookmarkMutation = useUpdateBookmark();
  const toast = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleToggleShared = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    const newSharedStatus = !bookmark.isShared;

    // Mutation handles optimistic updates and rollback on error
    updateBookmarkMutation.mutate(
      {
        id: bookmark.id,
        updates: {
          url: bookmark.url,
          title: bookmark.title,
          extended: bookmark.extended,
          tags: bookmark.tags,
          isRead: bookmark.isRead,
          isShared: newSharedStatus,
          createdAt: bookmark.createdAt,
        }
      },
      {
        onSuccess: () => {
          toast.showSuccess(
            newSharedStatus ? 'Made public' : 'Made private',
            `"${bookmark.title}"`
          );
          setIsProcessing(false);
        },
        onError: () => {
          toast.showError('Failed to update bookmark', 'Please try again');
          setIsProcessing(false);
        }
      }
    );
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
