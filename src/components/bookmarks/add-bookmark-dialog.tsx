'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BookmarkFormFields } from './bookmark-form-fields';
import { useBookmarkForm } from '@/hooks/useBookmarkForm';

interface AddBookmarkDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddBookmarkDialog({ isOpen, onClose }: AddBookmarkDialogProps) {
  const {
    formData,
    tagInput,
    setTagInput,
    tagSuggestions,
    isSubmitting,
    canSubmit,
    handleSave,
    addTag,
    removeTag,
    handleTagKeyDown,
    handleUrlChange,
    updateField,
  } = useBookmarkForm({ onSuccess: onClose });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-150">
        <DialogHeader>
          <DialogTitle>Add New Bookmark</DialogTitle>
          <DialogDescription>
            Save a new bookmark to your Pinboard account.
          </DialogDescription>
        </DialogHeader>

        <BookmarkFormFields
          formData={formData}
          tagInput={tagInput}
          setTagInput={setTagInput}
          tagSuggestions={tagSuggestions}
          onUrlChange={handleUrlChange}
          onFieldChange={updateField}
          onAddTag={addTag}
          onRemoveTag={removeTag}
          onTagKeyDown={handleTagKeyDown}
        />

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting || !canSubmit}>
            {isSubmitting ? 'Adding...' : 'Add Bookmark'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
