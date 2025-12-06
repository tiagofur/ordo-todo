import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { useTags, useAssignTagToTask, useRemoveTagFromTask } from "@/hooks/api/use-tags";
import { useQueryClient } from "@tanstack/react-query";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TagBadge } from "./tag-badge";
import { toast } from "sonner";

interface TagSelectorProps {
  taskId: string;
  selectedTags?: Array<{ id?: string | number; name: string; color: string }>;
  workspaceId?: string;
  onTagsChange?: () => void;
}

export function TagSelector({ taskId, selectedTags = [], workspaceId = "default", onTagsChange }: TagSelectorProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: availableTags, isLoading } = useTags(workspaceId);

  const assignTagMutation = useAssignTagToTask();

  const removeTagMutation = useRemoveTagFromTask();

  const isTagSelected = (tagId: string | number | undefined) => {
    return selectedTags.some((t) => t.id === tagId);
  };

  const handleToggleTag = (tag: { id?: string | number; name: string; color: string }) => {
    if (!tag.id) return;

    if (isTagSelected(tag.id)) {
      removeTagMutation.mutate({ tagId: String(tag.id), taskId }, {
        onSuccess: () => { toast.success("Etiqueta removida"); onTagsChange?.(); },
        onError: () => toast.error("Error al remover etiqueta")
      });
    } else {
      assignTagMutation.mutate({ tagId: String(tag.id), taskId }, {
        onSuccess: () => { toast.success("Etiqueta asignada"); onTagsChange?.(); },
        onError: () => toast.error("Error al asignar etiqueta")
      });
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Selected Tags */}
      {selectedTags.map((tag) => (
        <TagBadge
          key={tag.id}
          tag={tag}
          removable
          onRemove={() => tag.id && removeTagMutation.mutate({ tagId: String(tag.id), taskId }, { 
            onSuccess: () => onTagsChange?.() 
          })}
        />
      ))}

      {/* Add Tag Button */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className="inline-flex items-center gap-1 rounded-full border border-dashed px-2.5 py-0.5 text-xs font-medium hover:bg-accent">
            <Plus className="h-3 w-3" />
            Etiqueta
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="start">
          <div className="space-y-1">
            {isLoading ? (
              <div className="p-2 text-sm text-muted-foreground">Cargando...</div>
            ) : availableTags && availableTags.length > 0 ? (
              availableTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleToggleTag(tag)}
                  disabled={assignTagMutation.isPending || removeTagMutation.isPending}
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent disabled:opacity-50"
                >
                  <span
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: `${tag.color}20`,
                      color: tag.color,
                    }}
                  >
                    {tag.name}
                  </span>
                  {isTagSelected(tag.id) && <Check className="h-4 w-4 text-primary" />}
                </button>
              ))
            ) : (
              <div className="p-2 text-sm text-muted-foreground">
                No hay etiquetas disponibles
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
