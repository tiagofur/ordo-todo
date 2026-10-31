'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  ColorSwatchPicker,
  FORM_COLORS,
} from '@/components/ui';
import { Label } from '@/components/ui';
import { Input } from '@/components/ui';
import { Button } from '@/components/ui';

export interface TagFormData {
  name: string;
  color: string;
  workspaceId?: string;
}

interface CreateTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId?: string;
  tagToEdit?: { id: string; name: string; color?: string; workspaceId: string };
  /** Called when form is submitted */
  onSubmit: (data: TagFormData, isEdit: boolean) => void;
  /** Whether submission is in progress */
  isPending?: boolean;
  /** Custom labels for i18n */
  labels?: {
    titleCreate?: string;
    titleEdit?: string;
    descriptionCreate?: string;
    descriptionEdit?: string;
    colorLabel?: string;
    nameLabel?: string;
    namePlaceholder?: string;
    nameRequired?: string;
    previewLabel?: string;
    previewDefault?: string;
    cancel?: string;
    save?: string;
    saving?: string;
    create?: string;
    creating?: string;
  };
}

/**
 * CreateTagDialog - Platform-agnostic tag creation/edit dialog
 * 
 * Color via shared ColorSwatchPicker (ODD 025 canonical palette).
 * Form submission and API calls are handled externally via onSubmit.
 * 
 * @example
 * const createTag = useCreateTag();
 * 
 * <CreateTagDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   workspaceId={workspaceId}
 *   onSubmit={(data, isEdit) => {
 *     if (isEdit) {
 *       updateTag.mutate({ tagId, data });
 *     } else {
 *       createTag.mutate(data);
 *     }
 *   }}
 *   isPending={createTag.isPending}
 *   labels={{ titleCreate: t('title.create'), ... }}
 * />
 */
export function CreateTagDialog({
  open,
  onOpenChange,
  workspaceId,
  tagToEdit,
  onSubmit,
  isPending = false,
  labels = {},
}: CreateTagDialogProps) {
  const [name, setName] = useState(tagToEdit?.name || '');
  const [selectedColor, setSelectedColor] = useState<string>(tagToEdit?.color || FORM_COLORS[0]);
  const [error, setError] = useState('');

  const {
    titleCreate = 'Create Tag',
    titleEdit = 'Edit Tag',
    descriptionCreate = 'Create a new tag to organize your tasks.',
    descriptionEdit = 'Modify tag name or color.',
    colorLabel = 'Color',
    nameLabel = 'Name',
    namePlaceholder = 'Tag name',
    nameRequired = 'Name is required',
    previewLabel = 'Preview',
    previewDefault = 'Tag name',
    cancel = 'Cancel',
    save = 'Save',
    saving = 'Saving...',
    create = 'Create',
    creating = 'Creating...',
  } = labels;

  // Reset form when dialog opens/closes or tagToEdit changes
  useEffect(() => {
    if (open) {
      setName(tagToEdit?.name || '');
      setSelectedColor(tagToEdit?.color || FORM_COLORS[0]);
      setError('');
    }
  }, [open, tagToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError(nameRequired);
      return;
    }

    const data: TagFormData = {
      name: name.trim(),
      color: selectedColor,
      workspaceId: workspaceId || tagToEdit?.workspaceId,
    };

    onSubmit(data, !!tagToEdit);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{tagToEdit ? titleEdit : titleCreate}</DialogTitle>
          <DialogDescription>
            {tagToEdit ? descriptionEdit : descriptionCreate}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Color Picker — ODD 025: picker canónico */}
          <div className="space-y-2">
            <Label>{colorLabel}</Label>
            <ColorSwatchPicker
              value={selectedColor}
              onChange={setSelectedColor}
            />
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="tag-name">{nameLabel}</Label>
            <Input
              id="tag-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder={namePlaceholder}
              autoFocus
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>{previewLabel}</Label>
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium"
                style={{
                  backgroundColor: `${selectedColor}20`,
                  color: selectedColor,
                }}
              >
                {name || previewDefault}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {cancel}
            </Button>
            <Button
              type="submit"
              disabled={isPending}
            >
              {tagToEdit
                ? (isPending ? saving : save)
                : (isPending ? creating : create)
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
