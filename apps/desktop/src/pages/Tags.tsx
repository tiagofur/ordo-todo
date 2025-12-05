import { useState } from "react";
import { Plus, Tag as TagIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TagBadge } from "@/components/tag/tag-badge";
import { CreateTagDialog } from "@/components/tag/create-tag-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";
import { useTags, useDeleteTag } from "@/hooks/api/use-tags";
import { useWorkspaces } from "@/hooks/api/use-workspaces";

export function Tags() {
  const [showCreateTag, setShowCreateTag] = useState(false);
  
  // TODO: Get actual workspace ID from context
  const { data: workspaces } = useWorkspaces();
  const workspaceId = workspaces?.[0]?.id || "default";

  const { data: tags, isLoading } = useTags(workspaceId);
  const deleteTagMutation = useDeleteTag();

  const handleDeleteTag = async (tagId: string | number) => {
    if (confirm("¿Estás seguro de eliminar esta etiqueta?")) {
      try {
        await deleteTagMutation.mutateAsync(String(tagId));
        toast.success("Etiqueta eliminada");
      } catch (error: any) {
        toast.error(error.message || "Error al eliminar etiqueta");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Etiquetas</h1>
          <p className="text-muted-foreground">Organiza tus tareas con etiquetas</p>
        </div>
        <Button onClick={() => setShowCreateTag(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Etiqueta
        </Button>
      </div>

      {isLoading ? (
        <div>Cargando etiquetas...</div>
      ) : !tags || tags.length === 0 ? (
        <EmptyState
          icon={TagIcon}
          title="No hay etiquetas"
          description="Crea etiquetas para categorizar tus tareas."
          actionLabel="Crear Etiqueta"
          onAction={() => setShowCreateTag(true)}
        />
      ) : (
        <div className="flex flex-wrap gap-3">
          {tags.map((tag: any) => (
            <div key={tag.id} className="group relative">
              <TagBadge 
                tag={tag} 
                removable 
                onRemove={() => tag.id && handleDeleteTag(tag.id)} 
              />
            </div>
          ))}
        </div>
      )}

      <CreateTagDialog 
        open={showCreateTag} 
        onOpenChange={setShowCreateTag} 
      />
    </div>
  );
}
