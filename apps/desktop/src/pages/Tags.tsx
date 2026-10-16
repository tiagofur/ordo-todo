import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Plus, Tag as TagIcon, Trash2, MoreVertical, Edit, CheckSquare } from "lucide-react";
import { CreateTagDialog } from "@/components/tag/create-tag-dialog";
import { toast } from "sonner";
import { useTags, useCreateTag, useDeleteTag, useUpdateTag } from "@/hooks/api";
import { useTasks } from "@/hooks/api";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { motion } from "framer-motion";
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
  const { mutateAsync: createTag } = useCreateTag();
  const { mutateAsync: updateTag } = useUpdateTag();

  // Accent color (Indigo)
  const accentColor = "#6366f1";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12
      },
    },
  };

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
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 p-8 h-full overflow-y-auto bg-background/50"
    >
      {/* Premium Iconic Header */}
      <motion.div 
        variants={itemVariants}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card p-8 rounded-[2.5rem] border border-border/50 shadow-sm relative overflow-hidden group shrink-0"
      >
        {/* Background Decorations */}
        <div 
          className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" 
          style={{ backgroundColor: `${accentColor}10` }}
        />
        <div 
          className="absolute bottom-0 left-0 w-24 h-24 rounded-full -ml-12 -mb-12 transition-transform group-hover:scale-110" 
          style={{ backgroundColor: `${accentColor}10` }}
        />

        <div className="flex items-center gap-6 relative z-10">
          <motion.div
            initial={{ rotate: -10, scale: 0.9 }}
            animate={{ rotate: 3, scale: 1 }}
            whileHover={{ rotate: 0, scale: 1.05 }}
            className="flex h-20 w-20 items-center justify-center rounded-[2rem] text-white shadow-xl shrink-0 transition-transform duration-500"
            style={{ backgroundColor: accentColor, boxShadow: `0 20px 25px -5px ${accentColor}40` }}
          >
            <TagIcon className="h-10 w-10" />
          </motion.div>

          <div className="flex-1 min-w-0">
            <h1 className="text-4xl font-black tracking-tight text-foreground truncate">
              {t("Tags.title") || "Etiquetas"}
            </h1>
            <p className="text-muted-foreground text-lg mt-1 font-medium line-clamp-1">
              {t("Tags.subtitle") || "Organiza tus tareas con etiquetas"}
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateTag(true)}
          style={{ backgroundColor: accentColor, boxShadow: `0 10px 15px -3px ${accentColor}40` }}
          className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-all duration-200 shadow-lg relative z-10"
        >
          <Plus className="h-5 w-5" />
          <span>{t("Tags.newTag") || "Nueva Etiqueta"}</span>
        </motion.button>
      </motion.div>

      {/* Tags Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-muted/50 animate-pulse" />
          ))}
        </div>
      ) : tags && tags.length > 0 ? (
        <motion.div 
          variants={containerVariants}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-8"
        >
          {tags.map((tag: any) => {
            const taskCount = getTaskCount(tag.id);
            return (
              <motion.div
                key={tag.id}
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={() => handleTagClick(tag.id)}
                className={cn(
                  "group relative overflow-hidden rounded-[2rem] border border-border/50 bg-card p-6 transition-all duration-300 cursor-pointer",
                  "hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20"
                )}
                style={{ borderLeftWidth: "6px", borderLeftColor: tag.color || accentColor }}
              >
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                        style={{
                          backgroundColor: `${tag.color || accentColor}15`,
                          color: tag.color || accentColor,
                        }}
                      >
                        <TagIcon className="h-7 w-7" />
                      </div>
                      <div>
                          <h3 className="font-bold text-xl leading-tight truncate max-w-[150px]">
                            {tag.name}
                          </h3>
                      </div>
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
                    <div className="flex items-center gap-2 text-sm justify-between">
                      <div className="flex items-center gap-2">
                           <CheckSquare className="h-4 w-4 text-muted-foreground" />
                           <span className="text-muted-foreground font-medium">
                             {taskCount} {taskCount === 1 ? t("Tags.task") || "tarea" : t("Tags.tasks") || "tareas"}
                           </span>
                      </div>
                      {tag.description && (
                          <span className="text-xs text-muted-foreground truncate max-w-[100px] opacity-70">
                              {tag.description}
                          </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Decorative blur */}
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-5 pointer-events-none transition-opacity group-hover:opacity-10"
                  style={{ backgroundColor: tag.color || accentColor }}
                />
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <motion.div
           variants={itemVariants}
           className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-[2.5rem] bg-muted/20 border-2 border-dashed border-border/50"
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-muted/50 mb-6 group">
            <TagIcon className="h-12 w-12 text-muted-foreground transition-transform group-hover:rotate-12 duration-300" />
          </div>
          <h3 className="text-xl font-bold mb-2">
            {t("Tags.noTags") || "No hay etiquetas"}
          </h3>
          <p className="text-muted-foreground mb-8 max-w-md text-lg leading-relaxed">
            {t("Tags.noTagsDescription") || "Crea etiquetas para categorizar tus tareas."}
          </p>
          <button
            onClick={() => setShowCreateTag(true)}
            className="flex items-center gap-2 rounded-xl px-8 py-4 text-base font-bold text-white transition-all duration-200 hover:scale-105 hover:shadow-xl"
            style={{
              backgroundColor: accentColor,
              boxShadow: `0 10px 15px -3px ${accentColor}40`,
            }}
          >
            <Plus className="h-5 w-5" />
            {t("Tags.createTag") || "Crear Etiqueta"}
          </button>
        </motion.div>
      )}

      <CreateTagDialog
        open={showCreateTag}
        onOpenChange={(open) => {
          setShowCreateTag(open);
          if (!open) setEditingTag(null);
        }}
        workspaceId={selectedWorkspaceId || undefined}
        tagToEdit={editingTag}
        onSubmit={async (data, isEdit) => {
          try {
            if (isEdit) {
              await updateTag({ tagId: editingTag.id, data });
              toast.success(t("Tags.tagUpdated") || "Etiqueta actualizada"); // Using toast for consistency
            } else {
              await createTag(data as any);
              toast.success(t("Tags.tagCreated") || "Etiqueta creada"); // Using toast for consistency
            }
            setShowCreateTag(false);
            setEditingTag(null);
          } catch (error: any) {
            toast.error(error.message || t("Tags.saveError") || "Error al guardar");
          }
        }}
      />
    </motion.div>
  );
}
