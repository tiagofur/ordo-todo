'use client';

import { useState } from 'react';
import { Plus, GripVertical, Check, X, Trash2, ArrowRight, Pencil } from 'lucide-react';
import { cn, Button, Input, Checkbox } from '@ordo-todo/ui';

export interface Subtask {
  id: string | number;
  title: string;
  status: string;
  position?: number;
  parentTaskId?: string | number | null;
}

interface SubtaskListProps {
  /** Subtasks to display */
  subtasks: Subtask[];
  /** Whether create operation is pending */
  isCreating?: boolean;
  /** Whether update operation is pending */
  isUpdating?: boolean;
  /** Called when a subtask should be created */
  onCreate?: (title: string) => void;
  /** Called when a subtask status should be toggled */
  onToggleComplete?: (subtaskId: string, currentStatus: string) => void;
  /** Called when a subtask should be deleted */
  onDelete?: (subtaskId: string) => void;
  /** Called when a subtask should be updated */
  onUpdate?: (subtaskId: string, title: string) => void;
  /** Custom labels for i18n */
  labels?: {
    title?: string;
    add?: string;
    placeholder?: string;
    empty?: string;
    nested?: string;
    confirmDelete?: string;
    tooltipDrag?: string;
    tooltipEdit?: string;
    tooltipDelete?: string;
  };
  className?: string;
}

/**
 * SubtaskList - Platform-agnostic subtask management component
 * 
 * All CRUD operations handled via props.
 * 
 * @example
 * const createSubtask = useCreateSubtask();
 * const completeTask = useCompleteTask();
 * 
 * <SubtaskList
 *   subtasks={task.subtasks || []}
 *   isCreating={createSubtask.isPending}
 *   onCreate={(title) => createSubtask.mutate({ parentTaskId, data: { title } })}
 *   onToggleComplete={(id, status) => {
 *     if (status === 'COMPLETED') updateTask.mutate({ taskId: id, data: { status: 'TODO' } });
 *     else completeTask.mutate(id);
 *   }}
 *   onDelete={(id) => deleteTask.mutate(id)}
 *   onUpdate={(id, title) => updateTask.mutate({ taskId: id, data: { title } })}
 *   labels={{ title: t('title'), add: t('add') }}
 * />
 */
export function SubtaskList({
  subtasks = [],
  isCreating = false,
  isUpdating = false,
  onCreate,
  onToggleComplete,
  onDelete,
  onUpdate,
  labels = {},
  className = '',
}: SubtaskListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const {
    title = 'Subtasks',
    add = 'Add Subtask',
    placeholder = 'Subtask title...',
    empty = 'No subtasks yet',
    nested = 'Contains nested subtasks',
    confirmDelete = 'Are you sure you want to delete this subtask?',
    tooltipDrag = 'Drag to reorder',
    tooltipEdit = 'Edit',
    tooltipDelete = 'Delete',
  } = labels;

  const handleCreateSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    onCreate?.(newSubtaskTitle.trim());
    setNewSubtaskTitle('');
    setIsAdding(false);
  };

  const handleToggleComplete = (subtaskId: string, currentStatus: string) => {
    onToggleComplete?.(subtaskId, currentStatus);
  };

  const handleDelete = (subtaskId: string) => {
    if (confirm(confirmDelete)) {
      onDelete?.(subtaskId);
    }
  };

  const handleStartEdit = (subtaskId: string, currentTitle: string) => {
    setEditingId(subtaskId);
    setEditingTitle(currentTitle);
  };

  const handleSaveEdit = (subtaskId: string) => {
    if (!editingTitle.trim()) {
      handleCancelEdit();
      return;
    }
    onUpdate?.(subtaskId, editingTitle.trim());
    setEditingId(null);
    setEditingTitle('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const completedCount = subtasks.filter((st) => st.status === 'COMPLETED').length;
  const totalCount = subtasks.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header with Progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">{title}</h3>
          {totalCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {completedCount}/{totalCount}
            </span>
          )}
        </div>

        {totalCount > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{Math.round(progressPercentage)}%</span>
          </div>
        )}
      </div>

      {/* Subtasks List */}
      <div className="space-y-2">
        {subtasks.map((subtask) => (
          <div
            key={subtask.id}
            className={cn(
              'group flex items-start gap-2 rounded-lg border p-3 transition-all',
              'hover:bg-accent/50',
              subtask.status === 'COMPLETED' && 'opacity-60'
            )}
          >
            {/* Drag Handle */}
            <button
              className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing mt-0.5"
              title={tooltipDrag}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </button>

            {/* Checkbox */}
            <Checkbox
              checked={subtask.status === 'COMPLETED'}
              onCheckedChange={() => handleToggleComplete(String(subtask.id), subtask.status)}
              className="mt-0.5"
            />

            {/* Title - Editable */}
            <div className="flex-1 min-w-0">
              {editingId === String(subtask.id) ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    className="h-7 text-sm"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveEdit(String(subtask.id));
                      } else if (e.key === 'Escape') {
                        handleCancelEdit();
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => handleSaveEdit(String(subtask.id))}
                    disabled={isUpdating}
                  >
                    <Check className="h-3 w-3 text-green-600" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleCancelEdit}>
                    <X className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </div>
              ) : (
                <p
                  className={cn(
                    'text-sm cursor-text',
                    subtask.status === 'COMPLETED' && 'line-through text-muted-foreground'
                  )}
                  onDoubleClick={() => handleStartEdit(String(subtask.id), subtask.title)}
                >
                  {subtask.title}
                </p>
              )}
            </div>

            {/* Actions */}
            {editingId !== String(subtask.id) && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleStartEdit(String(subtask.id), subtask.title)}
                  title={tooltipEdit}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleDelete(String(subtask.id))}
                  title={tooltipDelete}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        ))}

        {/* Empty State */}
        {subtasks.length === 0 && !isAdding && (
          <div className="text-center py-6 text-sm text-muted-foreground">{empty}</div>
        )}
      </div>

      {/* Add Subtask Form */}
      {isAdding ? (
        <div className="flex items-center gap-2 rounded-lg border p-3 bg-accent/20">
          <Input
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            placeholder={placeholder}
            className="flex-1"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreateSubtask();
              } else if (e.key === 'Escape') {
                setIsAdding(false);
                setNewSubtaskTitle('');
              }
            }}
          />
          <Button
            size="sm"
            onClick={handleCreateSubtask}
            disabled={!newSubtaskTitle.trim() || isCreating}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setIsAdding(false);
              setNewSubtaskTitle('');
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setIsAdding(true)} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          {add}
        </Button>
      )}

      {/* Nested Subtasks Indicator */}
      {subtasks.some((st) => st.parentTaskId) && (
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <ArrowRight className="h-3 w-3" />
          {nested}
        </div>
      )}
    </div>
  );
}
