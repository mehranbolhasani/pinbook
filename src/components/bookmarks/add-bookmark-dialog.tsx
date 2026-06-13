'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { BookmarkFormFields } from './bookmark-form-fields';
import { useBookmarkForm } from '@/hooks/useBookmarkForm';

interface AddBookmarkDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddBookmarkDialog({ isOpen, onClose }: AddBookmarkDialogProps) {
  const formId = React.useId();
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
    <ResponsiveDialog
      open={isOpen}
      onOpenChange={onClose}
      title="Add New Bookmark"
      description="Save a new bookmark to your Pinboard account."
      footer={
        <div className="flex w-full gap-2 sm:w-auto sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 sm:flex-initial"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form={formId}
            disabled={isSubmitting || !canSubmit}
            className="flex-1 sm:flex-initial"
          >
            {isSubmitting ? 'Adding...' : 'Add Bookmark'}
          </Button>
        </div>
      }
    >
      <form
        id={formId}
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
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
      </form>
    </ResponsiveDialog>
  );
}
