'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Add01Icon } from '@hugeicons/core-free-icons';
import type { BookmarkFormData } from '@/hooks/useBookmarkForm';

interface BookmarkFormFieldsProps {
  formData: BookmarkFormData;
  tagInput: string;
  setTagInput: (value: string) => void;
  tagSuggestions: string[];
  onUrlChange: (url: string) => void;
  onFieldChange: <K extends keyof BookmarkFormData>(field: K, value: BookmarkFormData[K]) => void;
  onAddTag: (tag?: string) => void;
  onRemoveTag: (tag: string) => void;
  onTagKeyDown: (e: React.KeyboardEvent) => void;
  autoCompleteOff?: boolean;
  urlRequired?: boolean;
}

export function BookmarkFormFields({
  formData,
  tagInput,
  setTagInput,
  tagSuggestions,
  onUrlChange,
  onFieldChange,
  onAddTag,
  onRemoveTag,
  onTagKeyDown,
  autoCompleteOff = false,
  urlRequired = false,
}: BookmarkFormFieldsProps) {
  const ac = autoCompleteOff ? { autoComplete: 'off' } : {};

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="url">URL *</Label>
        <Input
          id="url"
          value={formData.url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="https://example.com"
          type="url"
          required={urlRequired}
          {...ac}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => onFieldChange('title', e.target.value)}
          placeholder="Bookmark title (optional)"
          {...ac}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onFieldChange('description', e.target.value)}
          placeholder="Brief description"
          rows={2}
          {...ac}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="extended">Extended Notes</Label>
        <Textarea
          id="extended"
          value={formData.extended}
          onChange={(e) => onFieldChange('extended', e.target.value)}
          placeholder="Additional notes"
          rows={3}
          {...ac}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <div className="relative flex space-x-2">
          <Input
            id="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={onTagKeyDown}
            placeholder="Add a tag"
            {...ac}
          />
          <Button type="button" onClick={() => onAddTag()} size="default">
            <HugeiconsIcon icon={Add01Icon} size={16} />
          </Button>
          {tagSuggestions.length > 0 && (
            <ul
              className="absolute top-full left-0 z-10 mt-1 w-[calc(100%-2.5rem)] rounded-md border bg-popover py-1 shadow-md"
              role="listbox"
            >
              {tagSuggestions.map((tag) => (
                <li key={tag}>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                    onClick={() => onAddTag(tag)}
                    role="option"
                    aria-selected={false}
                  >
                    {tag}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              {tag}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemoveTag(tag)}
                className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={12} />
              </Button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="isShared"
            checked={formData.isShared}
            onCheckedChange={(checked) => onFieldChange('isShared', checked)}
          />
          <Label htmlFor="isShared">Share publicly</Label>
        </div>
      </div>
    </div>
  );
}
