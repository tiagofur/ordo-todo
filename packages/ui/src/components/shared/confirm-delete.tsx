'use client';

import { useState, type ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog.js';
import { Button } from '../ui/button.js';

interface ConfirmDeleteProps {
  children: ReactNode;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  deletingText?: string;
  disabled?: boolean;
}

const DEFAULT_LABELS = {
  title: 'Confirm Delete',
  description: 'Are you sure you want to delete this item? This action cannot be undone.',
  confirm: 'Delete',
  cancel: 'Cancel',
  deleting: 'Deleting...',
};

export function ConfirmDelete({
  children,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  deletingText,
  disabled = false,
}: ConfirmDeleteProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
      setOpen(false);
    } catch (error) {
      console.error('Error deleting:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (!loading) {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild disabled={disabled}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-left">
            {title || DEFAULT_LABELS.title}
          </DialogTitle>
          <DialogDescription className="text-left">
            {description || DEFAULT_LABELS.description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {cancelText || DEFAULT_LABELS.cancel}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading
              ? deletingText || DEFAULT_LABELS.deleting
              : confirmText || DEFAULT_LABELS.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
