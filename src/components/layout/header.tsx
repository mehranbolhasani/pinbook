'use client';

import { useState, forwardRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Settings, LogOut, Paperclip, Plus, Moon, Sun, Monitor, Menu, Folder as FolderIcon, FolderOpen, Tag, Filter, ChevronDown, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/stores/auth';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUIStore } from '@/lib/stores/ui';
import { useBookmarks, useTags } from '@/hooks/usePinboard';
import { useBookmarkFolders } from '@/hooks/useBookmarkFolders';
import { useFolderStore } from '@/lib/stores/folders';
import type { Folder } from '@/lib/stores/folders';
import { useBookmarkFolderStore } from '@/lib/stores/bookmark-folders';
import { FolderDialog } from '@/components/bookmarks/folder-dialog';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

interface HeaderProps {
  onSearch: (query: string) => void;
  searchQuery: string;
  searchRef?: React.RefObject<HTMLInputElement | null>;
  onAddBookmark?: () => void;
}

export const Header = forwardRef<HTMLInputElement, HeaderProps>(({ onSearch, searchQuery, searchRef, onAddBookmark }, ref) => {
  const { isAuthenticated, username, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
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
  
  const [folderDialog, setFolderDialog] = useState<{
    isOpen: boolean;
    folder: Folder | null;
  }>({ isOpen: false, folder: null });
  const [deleteFolderDialog, setDeleteFolderDialog] = useState<{
    isOpen: boolean;
    folder: Folder | null;
  }>({ isOpen: false, folder: null });

  const foldersWithCounts = getFoldersWithCounts(bookmarks);

  const handleLogout = () => {
    logout();
  };

  const handleSettings = () => {
    router.push('/settings');
  };

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
    <>
      <header className="hidden fixed bottom-0 left-1/2 -translate-x-1/2 max-w-5xl mx-auto h-36 sm:flex items-center z-50">
        <div className="fake-shadow absolute rounded-full w-full h-18">
          <div className="absolute rounded-full w-full h-full bg-primary/15 -top-2 left-1/2 -translate-x-1/2 blur-3xl"></div>
        </div>
        <div className="container flex h-fit min-h-[66px] items-center justify-between px-4 py-2 bg-white/90 dark:bg-primary/15 rounded-full border border-white dark:border-primary/10 backdrop-blur-lg shadow-xl">
          {/* Logo and Title */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Paperclip className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-primary tracking-tight">Pinbook</h1>
            </div>
          </div>

          {/* Navigation: All Bookmarks, Folders, Tags */}
          {isAuthenticated && (
            <div className="flex items-center flex-1 justify-end">
              {/* All Bookmarks */}
              <Button 
                variant={selectedFolderId === null && selectedTags.length === 0 ? "default" : "ghost"}
                size="sm"
                onClick={handleClearFilters}
                className="rounded-full"
              >
                <span className="flex items-center gap-2">
                  <span>All</span>
                  <span>{bookmarks.length}</span>
                </span>
              </Button>

              {/* Folders Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant={selectedFolderId !== null ? "default" : "ghost"}
                    size="sm"
                    className="rounded-full"
                  >
                    <FolderIcon className="h-4 w-4" />
                    {selectedFolderId !== null && <ChevronDown className="h-3 w-3 ml-1" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" side="top" className="mb-2 max-h-[400px] overflow-y-auto">
                  <DropdownMenuLabel className="flex items-center justify-between px-2">
                    <span>Folders</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreateFolder();
                      }}
                      title="New folder"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {foldersWithCounts.map((folder) => (
                    <DropdownMenuItem
                      key={folder.id}
                      onClick={() => handleFolderClick(folder.id)}
                      className={selectedFolderId === folder.id ? 'bg-primary text-primary-foreground' : ''}
                    >
                      {selectedFolderId === folder.id ? (
                        <FolderOpen className="h-4 w-4 mr-2" />
                      ) : (
                        <FolderIcon className="h-4 w-4 mr-2" />
                      )}
                      <span className="flex-1 truncate">{folder.name}</span>
                      <Badge variant="secondary" className="ml-2 shrink-0">
                        {folder.count}
                      </Badge>
                    </DropdownMenuItem>
                  ))}
                  {foldersWithCounts.length === 0 && (
                    <DropdownMenuItem disabled className="text-muted-foreground text-xs">
                      No folders yet. Create one to organize your bookmarks.
                    </DropdownMenuItem>
                  )}
                  {selectedFolderId !== null && foldersWithCounts.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-xs text-muted-foreground">Manage Selected Folder</DropdownMenuLabel>
                      {(() => {
                        const selectedFolder = foldersWithCounts.find(f => f.id === selectedFolderId);
                        if (!selectedFolder) return null;
                        return (
                          <>
                            <DropdownMenuItem onClick={() => handleEditFolder(selectedFolder)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Rename &quot;{selectedFolder.name}&quot;
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteFolder(selectedFolder)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete &quot;{selectedFolder.name}&quot;
                            </DropdownMenuItem>
                          </>
                        );
                      })()}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Tags Dropdown */}
              {tags.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant={selectedTags.length > 0 ? "default" : "ghost"}
                      size="sm"
                      className="rounded-full"
                    >
                      <Tag className="h-4 w-4" />
                      {selectedTags.length > 0 && (
                        <Badge variant="secondary" className="ml-1">
                          {selectedTags.length}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" side="top" className="mb-2 max-h-[400px] overflow-y-auto w-64">
                    <DropdownMenuLabel>Tags</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {tags.slice(0, 50).map((tag) => (
                      <DropdownMenuItem
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        className={selectedTags.includes(tag) ? 'bg-primary text-primary-foreground' : ''}
                      >
                        <span className="flex-1">{tag}</span>
                        {selectedTags.includes(tag) && <span className="ml-2">✓</span>}
                      </DropdownMenuItem>
                    ))}
                    {tags.length > 50 && (
                      <DropdownMenuItem disabled className="text-muted-foreground text-xs">
                        +{tags.length - 50} more tags
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Clear Filters */}
              {(selectedTags.length > 0 || selectedFolderId !== null) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="rounded-full"
                >
                  <Filter className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          )}

          {/* User Actions */}
          <div className="flex items-center space-x-2">
            {onAddBookmark && (
              <Button
                variant="default"
                size="sm"
                onClick={onAddBookmark}
                className="flex items-center space-x-1 rounded-full px-4! h-full py-3! bg-primary text-white dark:bg-primary/30 dark:text-primary hover:bg-primary/90 dark:hover:bg-primary/50"
              >
                <Plus className="h-4 w-4 text-white m-0!" />
                <span>Add</span>
              </Button>
            )}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-transparent hover:text-primary">
                    <Menu className="h-6! w-6!" />
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="top" className="mb-2">
                  <DropdownMenuLabel>{username}</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {/* Theme Toggle */}
                  <DropdownMenuLabel className="text-xs text-muted-foreground">Theme</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setTheme('light')} className="hover:*:text-white!">
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Light</span>
                    {theme === 'light' && <span className="ml-auto">✓</span>}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('dark')} className="hover:*:text-white!">
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Dark</span>
                    {theme === 'dark' && <span className="ml-auto">✓</span>}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('system')} className="hover:*:text-white!">
                    <Monitor className="mr-2 h-4 w-4" />
                    <span>System</span>
                    {(theme === 'system' || !theme) && <span className="ml-auto">✓</span>}
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* Settings */}
                  <DropdownMenuItem onClick={handleSettings} className="hover:*:text-white!">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>

                  {/* Logout */}
                  <DropdownMenuItem onClick={handleLogout} variant="destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="default" size="sm">
                Login
              </Button>
            )}
          </div>
        </div>

        <div className="container flex w-48 h-fit min-h-[66px] items-center justify-between px-2 py-2 bg-white/90 dark:bg-primary/15 rounded-full border border-white dark:border-primary/10 backdrop-blur-lg shadow-xl ml-2 ring-1 ring-transparent focus-within:ring-1 focus-within:ring-primary focus-within:w-72 transition-all duration-200">
          {/* Search Bar */}
          {isAuthenticated && (
            <div className="flex-1 max-w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={searchRef || ref}
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className={`pl-10 transition-all duration-200 w-full border-none ${isSearchFocused ? 'ring-0!' : ''
                    }`}
                />
              </div>
            </div>
          )}
        </div>
      </header>

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
    </>
  );
});

Header.displayName = 'Header';
