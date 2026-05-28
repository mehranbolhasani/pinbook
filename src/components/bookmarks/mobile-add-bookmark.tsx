'use client';

import { Button } from '@/components/ui/button';
import { SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { BookmarkFormFields } from './bookmark-form-fields';
import { useBookmarkForm } from '@/hooks/useBookmarkForm';

interface MobileAddBookmarkProps {
  onClose: () => void;
}

export function MobileAddBookmark({ onClose }: MobileAddBookmarkProps) {
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
    <form
      className="flex h-full flex-col bg-background"
      onSubmit={(e) => {
        e.preventDefault();
        handleSave();
      }}
    >
      <SheetHeader className="p-4 pb-0">
        <SheetTitle>Add New Bookmark</SheetTitle>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto p-4">
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
          autoCompleteOff
          urlRequired
        />
      </div>

      <Separator />

      <div className="p-4 flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !canSubmit}
          className="flex-1"
        >
          {isSubmitting ? 'Adding...' : 'Add Bookmark'}
        </Button>
      </div>
    </form>
  );
}
