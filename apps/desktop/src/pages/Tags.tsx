import { useState } from "react";
import { Plus, Tag as TagIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/utils/api";
import { TagBadge } from "@/components/tag/tag-badge";
import { CreateTagDialog } from "@/components/tag/create-tag-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";

export function Tags() {
  const [showCreateTag, setShowCreateTag] = useState(false);
  const utils = api.useUtils();
  const { data: tags, isLoading } = api.tag.list.useQuery({ workspaceId: "default" });

  const deleteTag = api.tag.delete.useMutation({
    onSuccess: () => {
      toast.success("Etiqueta eliminada");
      utils.tag.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Error al eliminar etiqueta");
    },
  });

  const handleDeleteTag = (tagId: string | number) => {
    if (confirm("¿Estás seguro de eliminar esta etiqueta?")) {
      deleteTag.mutate({ id: String(tagId) });
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
          {tags.map((tag) => (
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
