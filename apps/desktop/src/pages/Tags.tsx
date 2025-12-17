import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Plus, Tag as TagIcon, Trash2, MoreVertical, Edit, CheckSquare } from "lucide-react";
import { CreateTagDialog } from "@/components/tag/create-tag-dialog";
import { PageTransition, SlideIn, FadeIn } from "@/components/motion";
import { toast } from "sonner";
import { useTags, useDeleteTag } from "@/hooks/api/use-tags";
import { useTasks } from "@/hooks/api/use-tasks";
import { useWorkspaceStore } from "@/stores/workspace-store";
import {
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ordo-todo/ui";

export function Tags() {
  const { t } = (useTranslation as any)();
  const navigate = useNavigate();
  const { selectedWorkspaceId } = useWorkspaceStore();
  const [showCreateTag, setShowCreateTag] = useState(false);
  const [editingTag, setEditingTag] = useState<any>(null);

  const { data: tags, isLoading } = useTags(selectedWorkspaceId || "");
  const { data: allTasks } = useTasks(selectedWorkspaceId || undefined);
  const deleteTagMutation = useDeleteTag();

  // Accent color (green like Web)
  const accentColor = "#22c55e";

  // Calculate task count for each tag
  const getTaskCount = (tagId: string) => {
    if (!allTasks) return 0;
    return allTasks.filter((task: any) =>
      task.tags?.some((tag: any) => tag.id === tagId)
    ).length;
  };

  const handleDelete = (tagId: string | number | undefined) => {
    if (!tagId) return;
    if (confirm(t("Tags.confirmDelete") || "¿Estás seguro de eliminar esta etiqueta?")) {
      deleteTagMutation.mutate(String(tagId), {
        onSuccess: () => toast.success(t("Tags.tagDeleted") || "Etiqueta eliminada"),
        onError: (error: any) => toast.error(error.message || t("Tags.deleteError") || "Error al eliminar"),
      });
    }
  };

  const handleEdit = (tag: any) => {
    setEditingTag(tag);
    setShowCreateTag(true);
  };

  const handleTagClick = (tagId: string) => {
    navigate(`/tasks?tag=${tagId}`);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header - Styled like Web */}
        <SlideIn direction="top">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg"
                  style={{
                    backgroundColor: accentColor,
                    boxShadow: `0 10px 15px -3px ${accentColor}40, 0 4px 6px -4px ${accentColor}40`,
                  }}
                >
                  <TagIcon className="h-6 w-6" />
                </div>
                {t("Tags.title") || "Etiquetas"}
              </h1>
              <p className="text-muted-foreground mt-2">
                {t("Tags.subtitle") || "Organiza tus tareas con etiquetas"}
              </p>
            </div>
            <button
              onClick={() => setShowCreateTag(true)}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
              style={{
                backgroundColor: accentColor,
                boxShadow: `0 10px 15px -3px ${accentColor}40, 0 4px 6px -4px ${accentColor}40`,
              }}
            >
              <Plus className="h-4 w-4" />
              {t("Tags.newTag") || "Nueva Etiqueta"}
            </button>
          </div>
        </SlideIn>

        {/* Tags Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-muted/50 animate-pulse" />
            ))}
          </div>
        ) : tags && tags.length > 0 ? (
          <FadeIn delay={0.1}>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {tags.map((tag: any) => {
                const taskCount = getTaskCount(tag.id);
                return (
                  <div
                    key={tag.id}
                    onClick={() => handleTagClick(tag.id)}
                    className={cn(
                      "group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 cursor-pointer",
                      "hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20 hover:-translate-y-1"
                    )}
                    style={{ borderLeftWidth: "4px", borderLeftColor: tag.color || accentColor }}
                  >
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                            style={{
                              backgroundColor: `${tag.color || accentColor}15`,
                              color: tag.color || accentColor,
                            }}
                          >
                            <TagIcon className="h-7 w-7" />
                          </div>
                          <h3 className="font-bold text-xl leading-tight truncate max-w-[150px]">
                            {tag.name}
                          </h3>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <button
                              className={cn(
                                "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                                "rounded-full p-2 hover:bg-muted"
                              )}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuItem onClick={() => handleEdit(tag)}>
                              <Edit className="mr-2 h-4 w-4" />
                              {t("Tags.edit") || "Editar"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(tag.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t("Tags.delete") || "Eliminar"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="mt-auto pt-4 border-t border-dashed border-border/50">
                        <div className="flex items-center gap-1.5 text-sm">
                          <CheckSquare className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium" style={{ color: tag.color || accentColor }}>
                            {taskCount}
                          </span>
                          <span className="text-muted-foreground">
                            {taskCount === 1 ? t("Tags.task") || "tarea" : t("Tags.tasks") || "tareas"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Decorative blur */}
                    <div
                      className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-5 pointer-events-none"
                      style={{ backgroundColor: tag.color || accentColor }}
                    />
                  </div>
                );
              })}
            </div>
          </FadeIn>
        ) : (
          <FadeIn delay={0.1}>
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted/50 mb-6">
                <TagIcon className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t("Tags.noTags") || "No hay etiquetas"}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                {t("Tags.noTagsDescription") || "Crea etiquetas para categorizar tus tareas."}
              </p>
              <button
                onClick={() => setShowCreateTag(true)}
                className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: accentColor,
                  boxShadow: `0 10px 15px -3px ${accentColor}40, 0 4px 6px -4px ${accentColor}40`,
                }}
              >
                <Plus className="h-4 w-4" />
                {t("Tags.createTag") || "Crear Etiqueta"}
              </button>
            </div>
          </FadeIn>
        )}

        <CreateTagDialog
          open={showCreateTag}
          onOpenChange={(open) => {
            setShowCreateTag(open);
            if (!open) setEditingTag(null);
          }}
          workspaceId={selectedWorkspaceId || undefined}
        />
      </div>
    </PageTransition>
  );
}
