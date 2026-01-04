import { type ReactNode } from 'react';
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

export interface ConfirmDeleteProps {
  children?: ReactNode;
  onConfirm: () => void;
  onCancel?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  isLoading?: boolean;
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
  onCancel,
  open,
  onOpenChange,
  isLoading = false,
  title,
  description,
  confirmText,
  cancelText,
  deletingText,
  disabled = false,
}: ConfirmDeleteProps) {
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && (
        // @ts-expect-error - React 18/19 type compatibility: bigint in ReactNode
        <DialogTrigger asChild disabled={disabled}>
          {children}
        </DialogTrigger>
      )}
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
            onClick={() => {
              if (onCancel) onCancel();
              if (onOpenChange) onOpenChange(false);
            }}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {cancelText || DEFAULT_LABELS.cancel}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => onConfirm()}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading
              ? deletingText || DEFAULT_LABELS.deleting
              : confirmText || DEFAULT_LABELS.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
