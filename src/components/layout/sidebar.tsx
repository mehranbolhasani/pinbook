'use client';

import { useState } from 'react';
import { 
  Plus, 
  Filter,
  ChevronDown,
  ChevronRight,
  Folder as FolderIcon,
  FolderOpen,
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUIStore } from '@/lib/stores/ui';
import { useBookmarks, useTags } from '@/hooks/usePinboard';
import { useBookmarkFolders } from '@/hooks/useBookmarkFolders';
import { useFolderStore } from '@/lib/stores/folders';
import type { Folder } from '@/lib/stores/folders';
import { useBookmarkFolderStore } from '@/lib/stores/bookmark-folders';
import { Settings, LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/auth';
import { FolderDialog } from '@/components/bookmarks/folder-dialog';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

interface SidebarProps {
  onAddBookmark: () => void;
}

export function Sidebar({ onAddBookmark }: SidebarProps) {
  const { 
    selectedTags, 
    setSelectedTags, 
    selectedFolderId,
    setSelectedFolderId,
    clearFilters 
  } = useUIStore();
  
  const { data: bookmarks = [] } = useBookmarks();
  const { data: tagsData = {} } = useTags();
  const tags = Object.keys(tagsData);
  const { getFoldersWithCounts } = useBookmarkFolders();
  const { deleteFolder } = useFolderStore();

  const { isAuthenticated, username, logout } = useAuthStore();
  
  const [isTagsExpanded, setIsTagsExpanded] = useState(false);
  const [isFoldersExpanded, setIsFoldersExpanded] = useState(true);
  const [folderDialog, setFolderDialog] = useState<{
    isOpen: boolean;
    folder: Folder | null;
  }>({ isOpen: false, folder: null });
  const [deleteFolderDialog, setDeleteFolderDialog] = useState<{
    isOpen: boolean;
    folder: Folder | null;
  }>({ isOpen: false, folder: null });

  const foldersWithCounts = getFoldersWithCounts(bookmarks);
  const unfolderedCount = bookmarks.filter(b => !b.folderId).length;

  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleFolderClick = (folderId: string | null) => {
    if (selectedFolderId === folderId) {
      setSelectedFolderId(null);
    } else {
      setSelectedFolderId(folderId);
      // Clear tag filters when selecting a folder
      setSelectedTags([]);
    }
  };

  const handleClearFilters = () => {
    clearFilters();
  };

  const handleCreateFolder = () => {
    setFolderDialog({ isOpen: true, folder: null });
  };

  const handleEditFolder = (folder: Folder) => {
    setFolderDialog({ isOpen: true, folder });
  };

  const handleDeleteFolder = (folder: Folder) => {
    setDeleteFolderDialog({ isOpen: true, folder });
  };

  const handleConfirmDeleteFolder = () => {
    const folder = deleteFolderDialog.folder;
    if (!folder) return;
    
    // Remove folder assignments from bookmarks
    const { removeFolderAssignments } = useBookmarkFolderStore.getState();
    removeFolderAssignments(folder.id);
    
    deleteFolder(folder.id);
    
    // Clear folder selection if the deleted folder was selected
    if (selectedFolderId === folder.id) {
      setSelectedFolderId(null);
    }
    
    setDeleteFolderDialog({ isOpen: false, folder: null });
  };

  return (
    <aside className="w-72 sticky top-6 flex flex-col justify-between overflow-hidden bg-background shadow-lg shadow-primary/10 rounded-2xl border border-primary/10">
      <div className="space-y-4">
        <nav>
          <div className="p-2">
            <Button 
              variant={selectedFolderId === null && selectedTags.length === 0 ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={handleClearFilters}
            >
              <span className="flex items-center">
                All Bookmarks
              </span>
              <Badge variant="outline" className="ml-auto">
                {bookmarks.length}
              </Badge>
            </Button>
          </div>

          <span className="block relative h-px w-full mx-auto bg-foreground/15 left-1/2 -translate-x-1/2"></span>

          {/* Folders Section */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center">
                Folders
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-fit w-fit px-2 py-2 text-sm rounded-full gap-1"
                onClick={handleCreateFolder}
                title="New folder"
              >
                <Plus className="h-4 w-4" />
                <span>New Folder</span>
              </Button>
            </div>

            {isFoldersExpanded && (
              <div className="space-y-1">
                {foldersWithCounts.map((folder) => (
                  <div
                    key={folder.id}
                    className="flex items-center group"
                  >
                    <Button
                      variant={selectedFolderId === folder.id ? "default" : "ghost"}
                      size="sm"
                      className="flex-1 justify-start text-sm"
                      onClick={() => handleFolderClick(folder.id)}
                    >
                      {selectedFolderId === folder.id ? (
                        <FolderOpen className="h-4 w-4 mr-1" />
                      ) : (
                        <FolderIcon className="h-4 w-4 mr-1" />
                      )}
                      <span className="flex-1 text-left truncate">{folder.name}</span>
                      <Badge variant="secondary" className="ml-0 shrink-0">
                        {folder.count}
                      </Badge>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditFolder(folder)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteFolder(folder)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
                {foldersWithCounts.length === 0 && (
                  <p className="text-xs text-muted-foreground px-2 py-1">
                    No folders yet. Create one to organize your bookmarks.
                  </p>
                )}
              </div>
            )}
          </div>

          
        {tags.length > 0 && (
          <div className="px-2 py-2">
            <Button
              variant="ghost"
              className="w-full justify-between"
              onClick={() => setIsTagsExpanded(!isTagsExpanded)}
            >
              <span className="flex items-center gap-2">
                Tags
              </span>
              {isTagsExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>

            {isTagsExpanded && (
              <div className="space-y-1">
                {tags.slice(0, 20).map((tag) => (
                  <Button
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-start text-sm"
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag}
                  </Button>
                ))}
                {tags.length > 20 && (
                  <p className="text-xs text-muted-foreground">
                    +{tags.length - 20} more tags
                  </p>
                )}
              </div>
            )}
          </div>
        )}
        </nav>


        {(selectedTags.length > 0 || selectedFolderId !== null) && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleClearFilters}
          >
            <Filter className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Folder Dialog */}
      <FolderDialog
        folder={folderDialog.folder}
        isOpen={folderDialog.isOpen}
        onClose={() => setFolderDialog({ isOpen: false, folder: null })}
      />

      {/* Delete Folder Confirmation */}
      <ConfirmationDialog
        isOpen={deleteFolderDialog.isOpen}
        onClose={() => setDeleteFolderDialog({ isOpen: false, folder: null })}
        onConfirm={handleConfirmDeleteFolder}
        title="Delete Folder"
        description={`Are you sure you want to delete "${deleteFolderDialog.folder?.name}"? This will not delete the bookmarks in this folder, but they will be moved out of the folder.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </aside>
  );
}
