'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Square, 
  Trash2, 
  Eye, 
  EyeOff, 
  Share, 
  Share2, 
  MoreHorizontal,
  X
} from 'lucide-react';
import { useBookmarkStore } from '@/lib/stores/bookmarks';

interface BulkActionsToolbarProps {
  selectedCount: number;
  onClose: () => void;
}

export function BulkActionsToolbar({ selectedCount, onClose }: BulkActionsToolbarProps) {
  const { 
    selectedBookmarks, 
    bulkUpdateBookmarks, 
    bulkDeleteBookmarks,
    deselectAllBookmarks 
  } = useBookmarkStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedIds = Array.from(selectedBookmarks);

  const handleBulkMarkAsRead = async () => {
    setIsProcessing(true);
    try {
      bulkUpdateBookmarks(selectedIds, { isRead: true });
      // TODO: Sync with Pinboard API
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkMarkAsUnread = async () => {
    setIsProcessing(true);
    try {
      bulkUpdateBookmarks(selectedIds, { isRead: false });
      // TODO: Sync with Pinboard API
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkShare = async () => {
    setIsProcessing(true);
    try {
      bulkUpdateBookmarks(selectedIds, { isShared: true });
      // TODO: Sync with Pinboard API
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkUnshare = async () => {
    setIsProcessing(true);
    try {
      bulkUpdateBookmarks(selectedIds, { isShared: false });
      // TODO: Sync with Pinboard API
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (confirm(`Are you sure you want to delete ${selectedCount} bookmark${selectedCount > 1 ? 's' : ''}?`)) {
      setIsProcessing(true);
      try {
        bulkDeleteBookmarks(selectedIds);
        // TODO: Sync with Pinboard API
      } finally {
        setIsProcessing(false);
        onClose();
      }
    }
  };

  const handleDeselectAll = () => {
    deselectAllBookmarks();
    onClose();
  };

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-background border rounded-lg shadow-lg p-4 flex items-center gap-3 min-w-96">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {selectedCount} selected
          </Badge>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkMarkAsRead}
            disabled={isProcessing}
          >
            <Eye className="h-4 w-4 mr-1" />
            Mark Read
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkMarkAsUnread}
            disabled={isProcessing}
          >
            <EyeOff className="h-4 w-4 mr-1" />
            Mark Unread
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isProcessing}>
                <MoreHorizontal className="h-4 w-4 mr-1" />
                More
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleBulkShare}>
                <Share className="h-4 w-4 mr-2" />
                Make Public
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleBulkUnshare}>
                <Share2 className="h-4 w-4 mr-2" />
                Make Private
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleBulkDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDeselectAll}
            disabled={isProcessing}
          >
            <Square className="h-4 w-4 mr-1" />
            Deselect All
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isProcessing}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
