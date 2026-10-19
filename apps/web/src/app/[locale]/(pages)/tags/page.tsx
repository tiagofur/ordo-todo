"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/shared/app-layout";
import {
  Plus,
  Tag as TagIcon,
  Trash2,
  MoreVertical,
  Edit,
  CheckSquare,
  Sparkles,
  ChevronDown,
  Flame,
  Hash,
  Search,
  X,
} from "lucide-react";
import {
  useTags,
  useDeleteTag,
  useTasks,
  useCreateTag,
  useUpdateTag,
  useWorkspaces,
} from "@/lib/api-hooks";
import { CreateTagDialog } from "@/components/tag/create-tag-dialog";
import { notify } from "@/lib/notify";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Button,
} from "@/components/ui";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useTranslations } from "next-intl";
import { useConfirm } from "@/components/shared/confirm-dialog";

export default function TagsPage() {
  const t = useTranslations("Tags");
  const router = useRouter();
  const { selectedWorkspaceId, setSelectedWorkspaceId } = useWorkspaceStore();
  const { data: workspaces = [] } = useWorkspaces();
  const { confirm, ConfirmModal } = useConfirm();

  const [showCreateTag, setShowCreateTag] = useState(false);
  const [editingTag, setEditingTag] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const activeWorkspaceId =
    selectedWorkspaceId || (workspaces.length > 0 ? workspaces[0].id : null);

  useEffect(() => {
    if (workspaces.length > 0 && !selectedWorkspaceId) {
      setSelectedWorkspaceId(workspaces[0].id);
    }
  }, [workspaces, selectedWorkspaceId, setSelectedWorkspaceId]);

  const { data: tags = [], isLoading } = useTags(activeWorkspaceId || "");
  const { data: allTasks = [] } = useTasks();
  const deleteTag = useDeleteTag();
  const { mutateAsync: createTag } = useCreateTag();
  const { mutateAsync: updateTag } = useUpdateTag();

  // Task count map for fast lookup
  const taskCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    if (!allTasks) return map;
    allTasks.forEach((task: any) => {
      task.tags?.forEach((tag: any) => {
        map[tag.id] = (map[tag.id] || 0) + 1;
      });
    });
    return map;
  }, [allTasks]);

  const getTaskCount = (tagId: string) => taskCountMap[tagId] || 0;

  // KPI Calculations
  const totalTags = tags.length;

  const taggedTasksCount = useMemo(() => {
    return allTasks.filter((task: any) => task.tags && task.tags.length > 0)
      .length;
  }, [allTasks]);

  const mostUsedTag = useMemo(() => {
    if (tags.length === 0 || allTasks.length === 0) return null;
    let topTag: any = null;
    let maxCount = 0;
    tags.forEach((tItem: any) => {
      const count = taskCountMap[tItem.id] || 0;
      if (count > maxCount) {
        maxCount = count;
        topTag = { tag: tItem, count };
      }
    });
    return topTag;
  }, [tags, allTasks, taskCountMap]);

  const avgTagsPerTask = useMemo(() => {
    if (allTasks.length === 0) return "0.0";
    const totalApplications = allTasks.reduce(
      (sum: number, task: any) => sum + (task.tags?.length || 0),
      0
    );
    return (totalApplications / allTasks.length).toFixed(1);
  }, [allTasks]);

  // Filtered tags by search
  const filteredTags = useMemo(() => {
    if (!searchQuery.trim()) return tags;
    const q = searchQuery.toLowerCase().trim();
    return tags.filter((tag: any) => tag.name.toLowerCase().includes(q));
  }, [tags, searchQuery]);

  const handleDelete = async (tagId: string | number | undefined) => {
    if (!tagId) return;
    const confirmed = await confirm({
      description: t("confirmDelete"),
      variant: "destructive",
    });
    if (confirmed) {
      deleteTag.mutate(String(tagId), {
        onSuccess: () => notify.success(t("tagDeleted")),
        onError: (error: any) =>
          notify.error(error.message || t("deleteError")),
      });
    }
  };

  const handleEdit = (tag: any) => {
    setEditingTag(tag);
    setShowCreateTag(true);
  };

  const handleOpenCreateDialog = () => {
    if (!activeWorkspaceId) {
      notify.error(t("selectWorkspaceFirst") || "Por favor selecciona un espacio de trabajo primero");
      return;
    }
    setEditingTag(null);
    setShowCreateTag(true);
  };

  const handleTagClick = (tagId: string) => {
    router.push(`/tasks?tag=${tagId}`);
  };

  return (
    <AppLayout>
      <div className="space-y-6 pb-12">
        {/* Apple Style Unified Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-sm shadow-emerald-500/25 shrink-0">
              <TagIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground m-0 leading-tight truncate">
                {t("title") || "Etiquetas"}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 truncate flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>{t("subtitle") || "Organiza y filtra tus tareas con etiquetas personalizadas"}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Workspace Selector */}
            {workspaces.length > 0 && (
              <div className="relative inline-flex items-center">
                <select
                  aria-label="Seleccionar espacio de trabajo"
                  value={activeWorkspaceId || ""}
                  onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                  className="appearance-none bg-card border border-border/60 rounded-xl pl-3 pr-8 py-2 text-sm font-medium text-foreground hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors cursor-pointer shadow-xs"
                >
                  {workspaces.map((ws: any) => (
                    <option key={ws.id} value={ws.id}>
                      {ws.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="h-4 w-4 text-muted-foreground absolute right-2.5 pointer-events-none" />
              </div>
            )}

            {/* Create Tag Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleOpenCreateDialog}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/25 transition-all duration-200 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{t("newTag") || "Nueva Etiqueta"}</span>
            </motion.button>
          </div>
        </div>

        {/* 4 Apple-grade KPI Cards with Micro-Halo Hover Effects */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Total Etiquetas */}
          <div
            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-default"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#10b98170";
              e.currentTarget.style.boxShadow =
                "0 10px 25px -5px rgba(16, 185, 129, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "";
              e.currentTarget.style.boxShadow = "";
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                Total Etiquetas
              </span>
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 transition-transform duration-300 group-hover:scale-110">
                <TagIcon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </div>
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {totalTags}
            </p>
            <p className="mt-1 text-xs text-muted-foreground truncate">
              Etiquetas en este workspace
            </p>
          </div>

          {/* Card 2: Tareas Etiquetadas */}
          <div
            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-default"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#3b82f670";
              e.currentTarget.style.boxShadow =
                "0 10px 25px -5px rgba(59, 130, 246, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "";
              e.currentTarget.style.boxShadow = "";
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                Tareas Etiquetadas
              </span>
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 transition-transform duration-300 group-hover:scale-110">
                <CheckSquare className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </div>
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {taggedTasksCount}
            </p>
            <p className="mt-1 text-xs text-muted-foreground truncate">
              {allTasks.length > 0
                ? `${Math.round((taggedTasksCount / allTasks.length) * 100)}% de tus tareas`
                : "Tareas organizadas"}
            </p>
          </div>

          {/* Card 3: Etiqueta Más Usada */}
          <div
            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-default"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#8b5cf670";
              e.currentTarget.style.boxShadow =
                "0 10px 25px -5px rgba(139, 92, 246, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "";
              e.currentTarget.style.boxShadow = "";
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                Más Utilizada
              </span>
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 transition-transform duration-300 group-hover:scale-110">
                <Flame className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </div>
            </div>
            <p className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
              {mostUsedTag ? mostUsedTag.tag.name : "N/A"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground truncate">
              {mostUsedTag
                ? `${mostUsedTag.count} tareas asociadas`
                : "Sin tareas etiquetadas"}
            </p>
          </div>

          {/* Card 4: Densidad de Tags */}
          <div
            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-default"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#f59e0b70";
              e.currentTarget.style.boxShadow =
                "0 10px 25px -5px rgba(245, 158, 11, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "";
              e.currentTarget.style.boxShadow = "";
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                Densidad
              </span>
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 transition-transform duration-300 group-hover:scale-110">
                <Hash className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </div>
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {avgTagsPerTask}
            </p>
            <p className="mt-1 text-xs text-muted-foreground truncate">
              Promedio tags / tarea
            </p>
          </div>
        </div>

        {/* Search Toolbar */}
        {tags.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 bg-card border border-border/60 rounded-2xl shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="h-4 w-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar etiqueta por nombre..."
                className="w-full bg-muted/40 border-0 rounded-xl pl-9 pr-8 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="text-xs text-muted-foreground px-2">
              Mostrando <span className="font-semibold text-foreground">{filteredTags.length}</span> de{" "}
              <span className="font-semibold text-foreground">{tags.length}</span> etiquetas
            </div>
          </div>
        )}

        {/* Tags Grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-36 rounded-2xl border border-border/60 bg-card/60 p-5 animate-pulse"
              />
            ))}
          </div>
        ) : filteredTags.length > 0 ? (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTags.map((tag: any, index: number) => {
              const taskCount = getTaskCount(tag.id);
              const tagColor = tag.color || "#10b981";
              return (
                <motion.div
                  key={tag.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.03 }}
                  onClick={() => handleTagClick(tag.id)}
                  className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer flex flex-col justify-between"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${tagColor}80`;
                    e.currentTarget.style.boxShadow = `0 10px 25px -5px ${tagColor}30`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "";
                    e.currentTarget.style.boxShadow = "";
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105"
                        style={{
                          backgroundColor: `${tagColor}15`,
                          color: tagColor,
                        }}
                      >
                        <TagIcon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-base leading-tight truncate text-foreground">
                          {tag.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                          {tagColor}
                        </p>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          aria-label={t("edit") || "Opciones"}
                          className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200 rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-muted/60 cursor-pointer"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-44 rounded-xl"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenuItem
                          onClick={() => handleEdit(tag)}
                          className="gap-2 cursor-pointer"
                        >
                          <Edit className="h-4 w-4 text-muted-foreground" />
                          <span>{t("edit") || "Editar"}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(tag.id)}
                          className="gap-2 text-rose-600 focus:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>{t("delete") || "Eliminar"}</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-border/50 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <CheckSquare className="h-3.5 w-3.5" />
                      <span>
                        <strong className="text-foreground font-semibold">
                          {taskCount}
                        </strong>{" "}
                        {taskCount === 1 ? t("task") : t("tasks")}
                      </span>
                    </div>

                    <span
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                      style={{
                        backgroundColor: `${tagColor}15`,
                        color: tagColor,
                      }}
                    >
                      Ver tareas →
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-border/80 bg-card/50"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 mb-4 shadow-xs">
              <TagIcon className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold mb-1">
              {searchQuery ? "Sin resultados para tu búsqueda" : t("noTags") || "No hay etiquetas"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm text-sm">
              {searchQuery
                ? `No encontramos ninguna etiqueta que coincida con "${searchQuery}".`
                : t("noTagsDescription") ||
                  "Crea tu primera etiqueta para empezar a organizar tus tareas."}
            </p>
            {searchQuery ? (
              <Button
                variant="outline"
                onClick={() => setSearchQuery("")}
                className="rounded-xl"
              >
                Limpiar búsqueda
              </Button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleOpenCreateDialog}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/25 transition-all duration-200 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>{t("createTag") || "Crear Etiqueta"}</span>
              </motion.button>
            )}
          </motion.div>
        )}
      </div>

      <CreateTagDialog
        open={showCreateTag}
        onOpenChange={(open) => {
          setShowCreateTag(open);
          if (!open) setEditingTag(null);
        }}
        workspaceId={activeWorkspaceId || undefined}
        tagToEdit={editingTag}
        labels={{
          titleCreate: t("dialog.titleCreate"),
          titleEdit: t("dialog.titleEdit"),
          descriptionCreate: t("dialog.descriptionCreate"),
          descriptionEdit: t("dialog.descriptionEdit"),
          colorLabel: t("dialog.colorLabel"),
          nameLabel: t("dialog.nameLabel"),
          namePlaceholder: t("dialog.namePlaceholder"),
          nameRequired: t("dialog.nameRequired"),
          previewLabel: t("dialog.previewLabel"),
          cancel: t("dialog.cancel"),
          save: t("dialog.save"),
          saving: t("dialog.saving"),
          create: t("dialog.create"),
          creating: t("dialog.creating"),
        }}
        onSubmit={async (data, isEdit) => {
          try {
            if (isEdit) {
              await updateTag({ tagId: editingTag.id, data });
              notify.success(t("tagUpdated") || "Etiqueta actualizada");
            } else {
              await createTag(data as any);
              notify.success(t("tagCreated") || "Etiqueta creada");
            }
            setShowCreateTag(false);
            setEditingTag(null);
          } catch (error: unknown) {
            notify.error(
              error instanceof Error ? error.message : t("saveError") || "Error al guardar"
            );
          }
        }}
      />
      <ConfirmModal />
    </AppLayout>
  );
}
