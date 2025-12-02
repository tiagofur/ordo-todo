"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/shared/app-layout";
import { Plus, CheckSquare, Tag as TagIcon, X } from "lucide-react";
import { useTasks, useTags } from "@/lib/api-hooks";
import { TaskCard } from "@/components/task/task-card";
import { CreateTaskDialog } from "@/components/task/create-task-dialog";
import { motion } from "framer-motion";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useTranslations } from "next-intl";

export default function TasksPage() {
  const t = useTranslations('Tasks');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedWorkspaceId } = useWorkspaceStore();
  const [showCreateTask, setShowCreateTask] = useState(false);
  
  const tagId = searchParams.get('tag');
  const { data: tasks, isLoading } = useTasks();
  const { data: tags } = useTags(selectedWorkspaceId || "");

  // Filter tasks by tag if tagId is present
  const filteredTasks = tagId && tasks
    ? tasks.filter((task: any) => 
        task.tags?.some((tag: any) => tag.id === tagId)
      )
    : tasks;

  // Get the current tag info
  const currentTag = tagId && tags 
    ? tags.find((tag: any) => tag.id === tagId)
    : null;

  const clearTagFilter = () => {
    router.push('/tasks');
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500 text-white shadow-lg shadow-purple-500/20">
                <CheckSquare className="h-6 w-6" />
              </div>
              {t('title')}
            </h1>
            <p className="text-muted-foreground mt-2">
              {t('subtitle')}
            </p>
            
            {/* Active tag filter indicator */}
            {currentTag && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm"
                style={{ 
                  borderColor: currentTag.color,
                  backgroundColor: `${currentTag.color}10`
                }}
              >
                <TagIcon className="h-4 w-4" style={{ color: currentTag.color }} />
                <span className="font-medium" style={{ color: currentTag.color }}>
                  {currentTag.name}
                </span>
                <button
                  onClick={clearTagFilter}
                  className="ml-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 p-0.5"
                >
                  <X className="h-3.5 w-3.5" style={{ color: currentTag.color }} />
                </button>
              </motion.div>
            )}
          </div>
          <button
            onClick={() => setShowCreateTask(true)}
            className="flex items-center gap-2 rounded-xl bg-purple-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-purple-500/20 transition-all duration-200 hover:bg-purple-600 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/30"
          >
            <Plus className="h-4 w-4" />
            {t('newTask')}
          </button>
        </div>

        {/* Tasks Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-48 rounded-2xl bg-muted/50 animate-pulse"
              />
            ))}
          </div>
        ) : filteredTasks && filteredTasks.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filteredTasks.map((task: any, index: number) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-16 px-4 text-center"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted/50 mb-6">
              <CheckSquare className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {currentTag ? t('noTasksWithTag') : t('allClear')}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              {currentTag 
                ? t('noTasksWithTagDescription', { tagName: currentTag.name })
                : t('noPendingTasks')
              }
            </p>
            <button
              onClick={() => setShowCreateTask(true)}
              className="flex items-center gap-2 rounded-xl bg-purple-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-purple-500/20 transition-all duration-200 hover:bg-purple-600 hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              {t('newTask')}
            </button>
          </motion.div>
        )}
      </div>

      <CreateTaskDialog
        open={showCreateTask}
        onOpenChange={setShowCreateTask}
      />
    </AppLayout>
  );
}
