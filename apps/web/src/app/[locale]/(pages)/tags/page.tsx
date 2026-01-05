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
  
  const accentColor = "#22c55e"; // Green

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
                initial={{ rotate: -10, scale: 0.9 }}
                animate={{ rotate: 0, scale: 1 }}
                className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl text-white shadow-lg"
                style={{ backgroundColor: accentColor, boxShadow: `0 10px 15px -3px ${accentColor}40, 0 4px 6px -4px ${accentColor}40` }}
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
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpenCreateDialog}
            style={{ backgroundColor: accentColor, boxShadow: `0 10px 15px -3px ${accentColor}40, 0 4px 6px -4px ${accentColor}40` }}
            className="flex items-center gap-2 rounded-xl px-2.5 sm:px-4 py-2.5 text-sm font-medium text-white transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t('newTag')}</span>
          </motion.button>
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
            {tags.map((tag: any, index: number) => {
              const taskCount = getTaskCount(tag.id);
              return (
                <motion.div
                  key={tag.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  onClick={() => handleTagClick(tag.id)}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 cursor-pointer",
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
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <button className={cn("opacity-0 group-hover:opacity-100 transition-opacity duration-200", "rounded-full p-2 hover:bg-muted")}>
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
                    <div className="mt-auto pt-4 border-t border-dashed border-border/50">
                      <div className="flex items-center gap-1.5 text-sm">
                        <CheckSquare className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium" style={{ color: tag.color || accentColor }}>
                          {taskCount}
                        </span>
                        <span className="text-muted-foreground">
                          {taskCount === 1 ? t('task') : t('tasks')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-5 pointer-events-none"
                    style={{ backgroundColor: tag.color || accentColor }}
                  />
                </motion.div>
              );
            })}
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
            <h3 className="text-xl font-semibold mb-2">{t('noTags')}</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              {t('noTagsDescription')}
            </p>
            <button
              onClick={handleOpenCreateDialog}
              style={{ backgroundColor: accentColor, boxShadow: `0 10px 15px -3px ${accentColor}40, 0 4px 6px -4px ${accentColor}40` }}
              className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              {t('createTag')}
            </button>
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
          } catch (error: any) {
            notify.error(error.message || t('saveError'));
          }
        }}
      />
    </AppLayout>
  );
}
