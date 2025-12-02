"use client";

import { useState } from "react";
import { AppLayout } from "@/components/shared/app-layout";
import { FolderKanban, Plus } from "lucide-react";
import { useProjects } from "@/lib/api-hooks";
import { ProjectCard } from "@/components/project/project-card";
import { CreateProjectDialog } from "@/components/project/create-project-dialog";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function ProjectsPage() {
  const t = useTranslations('Projects');
  const [showCreateProject, setShowCreateProject] = useState(false);
  const { selectedWorkspaceId } = useWorkspaceStore();

  const { data: projects, isLoading } = useProjects(selectedWorkspaceId as string);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-500 text-white shadow-lg shadow-pink-500/20">
                <FolderKanban className="h-6 w-6" />
              </div>
              {t('title')}
            </h1>
            <p className="text-muted-foreground mt-2">
              {t('subtitle')}
            </p>
          </div>
          <button
            onClick={() => setShowCreateProject(true)}
            className="flex items-center gap-2 rounded-xl bg-pink-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-pink-500/20 transition-all duration-200 hover:bg-pink-600 hover:scale-105 hover:shadow-xl hover:shadow-pink-500/30"
          >
            <Plus className="h-4 w-4" />
            {t('newProject')}
          </button>
        </div>

        {/* Projects Grid */}
        {!selectedWorkspaceId ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-16 px-4 text-center"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted/50 mb-6">
              <FolderKanban className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('selectWorkspace')}</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              {t('selectWorkspaceDescription')}
            </p>
          </motion.div>
        ) : isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-48 rounded-2xl bg-muted/50 animate-pulse"
              />
            ))}
          </div>
        ) : projects && projects.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {projects.map((project: any, index: number) => (
              <ProjectCard
                key={project.id}
                project={project}
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
              <FolderKanban className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('noProjects')}</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              {t('noProjectsDescription')}
            </p>
            <button
              onClick={() => setShowCreateProject(true)}
              className="flex items-center gap-2 rounded-xl bg-pink-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-pink-500/20 transition-all duration-200 hover:bg-pink-600 hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              {t('createProject')}
            </button>
          </motion.div>
        )}

        <CreateProjectDialog
          open={showCreateProject}
          onOpenChange={setShowCreateProject}
          workspaceId={selectedWorkspaceId || undefined}
        />
      </div>
    </AppLayout>
  );
}
