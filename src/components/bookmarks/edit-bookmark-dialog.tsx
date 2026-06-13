'use client';

import * as React from 'react';
import { useState, useMemo, useCallback } from 'react';
import { Bookmark } from '@/types/pinboard';
import { Button } from '@/components/ui/button';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { BookmarkFormFields } from './bookmark-form-fields';
import { BookmarkFormData } from '@/hooks/useBookmarkForm';
import { useTags } from '@/hooks/usePinboard';

interface EditBookmarkDialogProps {
  bookmark: Bookmark | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookmark: Bookmark) => void;
}

export function EditBookmarkDialog({ bookmark, isOpen, onClose, onSave }: EditBookmarkDialogProps) {
  const formId = React.useId();
  const [formData, setFormData] = useState<BookmarkFormData>(() => ({
    title: bookmark?.title ?? '',
    url: bookmark?.url ?? '',
    description: bookmark?.description ?? '',
    extended: bookmark?.extended ?? '',
    tags: bookmark?.tags ?? [],
    isShared: bookmark?.isShared ?? false,
  }));
  const [tagInput, setTagInput] = useState('');

  const { data: tagsData = {} } = useTags();
  const allTagNames = useMemo(() => Object.keys(tagsData).sort(), [tagsData]);

  const handleSave = () => {
    if (!bookmark) return;

    const updatedBookmark: Bookmark = {
      ...bookmark,
      ...formData,
    };

    onSave(updatedBookmark);
    onClose();
  };

  const addTag = useCallback(
    (tag?: string) => {
      const toAdd = (tag ?? tagInput).trim();
      if (toAdd && !formData.tags.includes(toAdd)) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, toAdd],
        }));
        setTagInput('');
      }
    },
    [tagInput, formData.tags]
  );

  const removeTag = useCallback((tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  }, []);

  const tagSuggestions = useMemo(() => {
    const q = tagInput.trim().toLowerCase();
    if (!q) return [];
    return allTagNames
      .filter((name) => name.toLowerCase().startsWith(q) && !formData.tags.includes(name))
      .slice(0, 8);
  }, [tagInput, allTagNames, formData.tags]);

  const handleTagKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (tagSuggestions.length > 0) {
          addTag(tagSuggestions[0]);
        } else {
          addTag();
        }
      }
    },
    [tagSuggestions, addTag]
  );

  const updateField = useCallback(<K extends keyof BookmarkFormData>(field: K, value: BookmarkFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  if (!bookmark) return null;

  return (
    <ResponsiveDialog
      open={isOpen}
      onOpenChange={onClose}
      title="Edit Bookmark"
      description="Update the bookmark details below."
      footer={
        <div className="flex w-full gap-2 sm:w-auto sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 sm:flex-initial"
          >
            Cancel
          </Button>
          <Button type="submit" form={formId} className="flex-1 sm:flex-initial">
            Save Changes
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
          onUrlChange={(url) => setFormData((prev) => ({ ...prev, url }))}
          onFieldChange={updateField}
          onAddTag={addTag}
          onRemoveTag={removeTag}
          onTagKeyDown={handleTagKeyDown}
          autoCompleteOff
          urlRequired
        />
      </form>
    </ResponsiveDialog>
  );
}
