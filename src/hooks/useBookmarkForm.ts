'use client';

import { useState, useMemo, useCallback } from 'react';
import { useAddBookmark, useTags } from '@/hooks/usePinboard';
import { useToast } from '@/hooks/useToast';
import { validateAddBookmark } from '@/lib/validation/schemas';

export interface BookmarkFormData {
  url: string;
  title: string;
  description: string;
  extended: string;
  tags: string[];
  isShared: boolean;
}

export interface UseBookmarkFormOptions {
  onSuccess?: () => void;
}

export function useBookmarkForm({ onSuccess }: UseBookmarkFormOptions = {}) {
  const { mutate: addBookmark, isPending: isSubmitting } = useAddBookmark();
  const { data: tagsData = {} } = useTags();
  const toast = useToast();

  const allTagNames = useMemo(() => Object.keys(tagsData).sort(), [tagsData]);

  const [formData, setFormData] = useState<BookmarkFormData>({
    url: '',
    title: '',
    description: '',
    extended: '',
    tags: [],
    isShared: false,
  });
  const [tagInput, setTagInput] = useState('');

  const resetForm = useCallback(() => {
    setFormData({
      url: '',
      title: '',
      description: '',
      extended: '',
      tags: [],
      isShared: false,
    });
    setTagInput('');
  }, []);

  const handleSave = useCallback(() => {
    const validation = validateAddBookmark({
      url: formData.url,
      title: formData.title,
      description: formData.description,
      extended: formData.extended,
      tags: formData.tags.join(' '),
      shared: formData.isShared ? 'yes' : 'no',
    });

    if (!validation.isValid) {
      toast.showError('Validation Error', validation.error || 'Invalid bookmark data');
      return;
    }

    addBookmark(
      {
        url: formData.url,
        description: formData.title || formData.description,
        extended: formData.extended,
        tags: formData.tags.join(' '),
        shared: formData.isShared ? 'yes' : 'no',
      },
      {
        onSuccess: (newBookmark) => {
          toast.showSuccess(
            'Bookmark added successfully',
            `"${newBookmark.title}" has been saved`
          );
          resetForm();
          onSuccess?.();
        },
        onError: (error) => {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to add bookmark';
          toast.showError('Failed to add bookmark', errorMessage);
        },
      }
    );
  }, [formData, addBookmark, toast, resetForm, onSuccess]);

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
      .filter(
        (name) =>
          name.toLowerCase().startsWith(q) && !formData.tags.includes(name)
      )
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

  const handleUrlChange = useCallback(
    async (url: string) => {
      setFormData((prev) => ({ ...prev, url }));

      if (url.startsWith('http') && !formData.title) {
        try {
          const response = await fetch(
            `/api/meta?url=${encodeURIComponent(url)}`
          );
          if (response.ok) {
            const data = await response.json();
            if (data.title) {
              setFormData((prev) => ({ ...prev, title: data.title }));
            }
          }
        } catch {
          // Silently fail
        }
      }
    },
    [formData.title]
  );

  const updateField = useCallback(
    <K extends keyof BookmarkFormData>(field: K, value: BookmarkFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  return {
    formData,
    tagInput,
    setTagInput,
    tagSuggestions,
    isSubmitting,
    canSubmit: formData.url.trim().length > 0,
    handleSave,
    addTag,
    removeTag,
    handleTagKeyDown,
    handleUrlChange,
    updateField,
    resetForm,
  };
}
