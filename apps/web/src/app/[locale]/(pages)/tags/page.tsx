"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/shared/app-layout";
import { Plus, Tag as TagIcon, Trash2, MoreVertical, Edit, CheckSquare } from "lucide-react";
import { useTags, useDeleteTag, useTasks, useCreateTag, useUpdateTag } from "@/lib/api-hooks";
import { CreateTagDialog } from "@/components/tag/create-tag-dialog";
import { notify } from "@/lib/notify";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useTranslations } from "next-intl";

export default function TagsPage() {
  const t = useTranslations('Tags');
  const router = useRouter();
  const { selectedWorkspaceId } = useWorkspaceStore();
  const [showCreateTag, setShowCreateTag] = useState(false);
  const [editingTag, setEditingTag] = useState<any>(null);
  
  const { data: tags, isLoading } = useTags(selectedWorkspaceId || "");
  const { data: allTasks } = useTasks();
  const deleteTag = useDeleteTag();
  const { mutateAsync: createTag } = useCreateTag();
  const { mutateAsync: updateTag } = useUpdateTag();

  // Calculate task count for each tag
  const getTaskCount = (tagId: string) => {
    if (!allTasks) return 0;
    return allTasks.filter((task: any) => 
      task.tags?.some((tag: any) => tag.id === tagId)
    ).length;
  };

  const handleDelete = (tagId: string | number | undefined) => {
    if (!tagId) return;
    if (confirm(t('confirmDelete'))) {
      deleteTag.mutate(String(tagId), {
        onSuccess: () => notify.success(t('tagDeleted')),
        onError: (error: any) => notify.error(error.message || t('deleteError')),
      });
    }
  };

  const handleEdit = (tag: any) => {
    setEditingTag(tag);
    setShowCreateTag(true);
  };

  const handleOpenCreateDialog = () => {
    if (!selectedWorkspaceId) {
      notify.error(t('selectWorkspaceFirst') || 'Please select a workspace first');
      return;
    }
    setShowCreateTag(true);
  };

  const handleTagClick = (tagId: string) => {
    router.push(`/tasks?tag=${tagId}`);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
              <motion.div
                initial={{ rotate: -8, scale: 0.92 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ duration: 0.25 }}
                className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-sm shadow-emerald-500/25"
              >
                <TagIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </motion.div>
              {t('title')}
            </h1>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
              {t('subtitle')}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleOpenCreateDialog}
            className="flex items-center gap-2 rounded-xl px-3 sm:px-4 py-2.5 text-sm font-medium bg-emerald-500 text-white shadow-sm shadow-emerald-500/25 hover:bg-emerald-600 transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t('newTag')}</span>
          </motion.button>
        </div>

        {/* Tags Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-40 rounded-2xl border border-border bg-card/60 p-6 animate-pulse" />
            ))}
          </div>
        ) : tags && tags.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tags.map((tag: any, index: number) => {
              const taskCount = getTaskCount(tag.id);
              const tagColor = tag.color || "#10b981";
              return (
                <motion.div
                  key={tag.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.04 }}
                  whileHover={{ y: -4 }}
                  onClick={() => handleTagClick(tag.id)}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:border-border/80"
                  )}
                >
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
                          style={{ backgroundColor: `${tagColor}15`, color: tagColor }}
                        >
                          <TagIcon className="h-6 w-6" />
                        </div>
                        <h3 className="font-semibold text-lg leading-tight truncate">
                          {tag.name}
                        </h3>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            aria-label={t('edit')}
                            className={cn(
                              "opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200",
                              "rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted"
                            )}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenuItem onClick={() => handleEdit(tag)}>
                            <Edit className="mr-2 h-4 w-4" />
                            {t('edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(tag.id)} className="text-red-600 focus:text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="mt-auto pt-4 border-t border-border/60">
                      <div className="flex items-center gap-1.5 text-sm">
                        <CheckSquare className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium" style={{ color: tagColor }}>
                          {taskCount}
                        </span>
                        <span className="text-muted-foreground">
                          {taskCount === 1 ? t('task') : t('tasks')}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-border bg-card/50"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 mb-4 shadow-xs">
              <TagIcon className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold mb-1">{t('noTags')}</h3>
            <p className="text-muted-foreground mb-6 max-w-sm text-sm">
              {t('noTagsDescription')}
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleOpenCreateDialog}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium bg-emerald-500 text-white shadow-sm shadow-emerald-500/25 hover:bg-emerald-600 transition-all duration-200"
            >
              <Plus className="h-4 w-4" />
              {t('createTag')}
            </motion.button>
          </motion.div>
        )}
      </div>

      <CreateTagDialog
        open={showCreateTag}
        onOpenChange={(open) => {
          setShowCreateTag(open);
          if (!open) setEditingTag(null);
        }}
        workspaceId={selectedWorkspaceId || undefined}
        tagToEdit={editingTag}
        labels={{
          titleCreate: t('dialog.titleCreate'),
          titleEdit: t('dialog.titleEdit'),
          descriptionCreate: t('dialog.descriptionCreate'),
          descriptionEdit: t('dialog.descriptionEdit'),
          colorLabel: t('dialog.colorLabel'),
          nameLabel: t('dialog.nameLabel'),
          namePlaceholder: t('dialog.namePlaceholder'),
          nameRequired: t('dialog.nameRequired'),
          previewLabel: t('dialog.previewLabel'),
          cancel: t('dialog.cancel'),
          save: t('dialog.save'),
          saving: t('dialog.saving'),
          create: t('dialog.create'),
          creating: t('dialog.creating'),
        }}
        onSubmit={async (data, isEdit) => {
          try {
            if (isEdit) {
              await updateTag({ tagId: editingTag.id, data });
              notify.success(t('tagUpdated'));
            } else {
              await createTag(data as any);
              notify.success(t('tagCreated'));
            }
            setShowCreateTag(false);
            setEditingTag(null);
          } catch (error: unknown) {
            notify.error(error instanceof Error ? error.message : t('saveError'));
          }
        }}
      />
    </AppLayout>
  );
}

