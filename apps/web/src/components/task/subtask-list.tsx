"use client";

import { useState } from "react";
import { Plus, GripVertical, Check, X, Trash2, ArrowRight } from "lucide-react";
import { useCreateSubtask, useCompleteTask, useDeleteTask } from "@/lib/api-hooks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslations } from "next-intl";

interface SubtaskListProps {
  taskId: string;
  subtasks?: Array<{
    id: string | number;
    title: string;
    status: string;
    position?: number;
    parentTaskId?: string | number | null;
  }>;
}

export function SubtaskList({ taskId, subtasks = [] }: SubtaskListProps) {
  const t = useTranslations('SubtaskList');
  const [isAdding, setIsAdding] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  // Create subtask mutation
  const createSubtask = useCreateSubtask();

  // Complete subtask mutation
  const completeSubtask = useCompleteTask();

  // Delete subtask mutation
  const deleteSubtask = useDeleteTask();

  const handleCreateSubtask = () => {
    if (!newSubtaskTitle.trim()) return;

    createSubtask.mutate({
      parentTaskId: taskId,
      data: {
        title: newSubtaskTitle,
      }
    }, {
      onSuccess: () => {
        toast.success(t('toast.created'));
        setNewSubtaskTitle("");
        setIsAdding(false);
      },
      onError: (error: any) => {
        toast.error(error.message || t('toast.createError'));
      }
    });
  };

  const handleToggleComplete = (subtaskId: string, currentStatus: string) => {
    if (currentStatus !== "COMPLETED") {
      completeSubtask.mutate(subtaskId, {
        onSuccess: () => {
          toast.success(t('toast.completed'));
        },
        onError: (error: any) => {
          toast.error(error.message || t('toast.completeError'));
        }
      });
    }
  };

  const handleDelete = (subtaskId: string) => {
    if (confirm(t('confirmDelete'))) {
      deleteSubtask.mutate(subtaskId, {
        onSuccess: () => {
          toast.success(t('toast.deleted'));
        },
        onError: (error: any) => {
          toast.error(error.message || t('toast.deleteError'));
        }
      });
    }
  };

  const completedCount = subtasks.filter((st: any) => st.status === "COMPLETED").length;
  const totalCount = subtasks.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-3">
      {/* Header with Progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">{t('title')}</h3>
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
            <span className="text-xs text-muted-foreground">
              {Math.round(progressPercentage)}%
            </span>
          </div>
        )}
      </div>

      {/* Subtasks List */}
      <div className="space-y-2">
        {subtasks.map((subtask: any) => (
          <div
            key={subtask.id}
            className={cn(
              "group flex items-start gap-2 rounded-lg border p-3 transition-all",
              "hover:bg-accent/50",
              subtask.status === "COMPLETED" && "opacity-60"
            )}
          >
            {/* Drag Handle */}
            <button
              className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing mt-0.5"
              title={t('tooltips.drag')}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </button>

            {/* Checkbox */}
            <Checkbox
              checked={subtask.status === "COMPLETED"}
              onCheckedChange={() => handleToggleComplete(String(subtask.id), subtask.status)}
              className="mt-0.5"
            />

            {/* Title */}
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-sm",
                  subtask.status === "COMPLETED" && "line-through text-muted-foreground"
                )}
              >
                {subtask.title}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleDelete(String(subtask.id))}
                title={t('tooltips.delete')}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {subtasks.length === 0 && !isAdding && (
          <div className="text-center py-6 text-sm text-muted-foreground">
            {t('empty')}
          </div>
        )}
      </div>

      {/* Add Subtask Form */}
      {isAdding ? (
        <div className="flex items-center gap-2 rounded-lg border p-3 bg-accent/20">
          <Input
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            placeholder={t('placeholder')}
            className="flex-1"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCreateSubtask();
              } else if (e.key === "Escape") {
                setIsAdding(false);
                setNewSubtaskTitle("");
              }
            }}
          />
          <Button
            size="sm"
            onClick={handleCreateSubtask}
            disabled={!newSubtaskTitle.trim() || createSubtask.isPending}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setIsAdding(false);
              setNewSubtaskTitle("");
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAdding(true)}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('add')}
        </Button>
      )}

      {/* Future: Nested Subtasks Indicator */}
      {subtasks.some((st: any) => st.parentTaskId) && (
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <ArrowRight className="h-3 w-3" />
          {t('nested')}
        </div>
      )}
    </div>
  );
}
