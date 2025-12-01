"use client";

import { useState } from "react";
import { AppLayout } from "@/components/shared/app-layout";
import { Plus, Tag as TagIcon, Trash2, MoreVertical } from "lucide-react";
import { useTags, useDeleteTag } from "@/lib/api-hooks";
import { CreateTagDialog } from "@/components/tag/create-tag-dialog";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TagsPage() {
  const [showCreateTag, setShowCreateTag] = useState(false);
  const workspaceId = "default-workspace-id";
  const { data: tags, isLoading } = useTags(workspaceId);
  const deleteTag = useDeleteTag();
  const accentColor = "#22c55e"; // Green

  const handleDelete = (tagId: string | number | undefined) => {
    if (!tagId) return;
    if (confirm("¿Estás seguro de eliminar esta etiqueta?")) {
      deleteTag.mutate(String(tagId), {
        onSuccess: () => toast.success("Etiqueta eliminada"),
        onError: (error: any) => toast.error(error.message || "Error al eliminar"),
      });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg"
                style={{ backgroundColor: accentColor, boxShadow: `0 10px 15px -3px ${accentColor}40, 0 4px 6px -4px ${accentColor}40` }}
              >
                <TagIcon className="h-6 w-6" />
              </div>
              Etiquetas
            </h1>
            <p className="text-muted-foreground mt-2">
              Organiza y filtra tus tareas con etiquetas personalizadas.
            </p>
          </div>
          <button
            onClick={() => setShowCreateTag(true)}
            style={{ backgroundColor: accentColor, boxShadow: `0 10px 15px -3px ${accentColor}40, 0 4px 6px -4px ${accentColor}40` }}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            Nueva Etiqueta
          </button>
        </div>

        {/* Tags Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-muted/50 animate-pulse" />
            ))}
          </div>
        ) : tags && tags.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tags.map((tag: any, index: number) => (
              <motion.div
                key={tag.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300",
                  "hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20"
                )}
                style={{ borderLeftWidth: "4px", borderLeftColor: tag.color || accentColor }}
              >
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                        style={{ backgroundColor: `${tag.color || accentColor}15`, color: tag.color || accentColor }}
                      >
                        <TagIcon className="h-7 w-7" />
                      </div>
                      <h3 className="font-bold text-xl leading-tight truncate max-w-[150px]">
                        {tag.name}
                      </h3>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className={cn("opacity-0 group-hover:opacity-100 transition-opacity duration-200", "rounded-full p-2 hover:bg-muted")}>
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => handleDelete(tag.id)} className="text-red-600 focus:text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="mt-auto pt-4 border-t border-dashed border-border/50">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <span>0 tareas</span>
                    </div>
                  </div>
                </div>
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-5 pointer-events-none"
                  style={{ backgroundColor: tag.color || accentColor }}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 px-4 text-center"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted/50 mb-6">
              <TagIcon className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No hay etiquetas</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Crea tu primera etiqueta para empezar a organizar tus tareas.
            </p>
            <button
              onClick={() => setShowCreateTag(true)}
              style={{ backgroundColor: accentColor, boxShadow: `0 10px 15px -3px ${accentColor}40, 0 4px 6px -4px ${accentColor}40` }}
              className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              Crear Etiqueta
            </button>
          </motion.div>
        )}
      </div>

      <CreateTagDialog
        open={showCreateTag}
        onOpenChange={setShowCreateTag}
        workspaceId={workspaceId}
      />
    </AppLayout>
  );
}
