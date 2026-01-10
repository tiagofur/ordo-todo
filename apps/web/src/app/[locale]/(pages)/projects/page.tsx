"use client";

import { useState } from "react";
import { AppLayout } from "@/components/shared/app-layout";
import { FolderKanban, Plus } from "lucide-react";
import { useProjects, useCreateProject, useWorkflows, useCreateWorkflow } from "@/lib/api-hooks";
import { ProjectCard } from "@/components/project/project-card";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";

const CreateProjectDialog = dynamic(
  () =>
    import("@/components/project/create-project-dialog").then(
      (mod) => mod.CreateProjectDialog
    ),
  { ssr: false }
);

export default function ProjectsPage() {
  const t = useTranslations('Projects');
  const [showCreateProject, setShowCreateProject] = useState(false);
  const { selectedWorkspaceId } = useWorkspaceStore();
  const accentColor = "#ec4899"; // Pink

  const { data: projects, isLoading } = useProjects(selectedWorkspaceId as string);
  const { mutateAsync: createProject } = useCreateProject();

  const { data: workflows } = useWorkflows(selectedWorkspaceId || "");
  const { mutateAsync: createWorkflow } = useCreateWorkflow();

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
                style={{
                  backgroundColor: accentColor,
                  boxShadow: `0 10px 15px -3px ${accentColor}40, 0 4px 6px -4px ${accentColor}40`,
                }}
              >
                <FolderKanban className="h-5 w-5 sm:h-6 sm:w-6" />
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
            onClick={() => setShowCreateProject(true)}
            className="flex items-center gap-2 rounded-xl px-2.5 sm:px-4 py-2.5 text-sm font-medium text-white transition-all duration-200"
            style={{
              backgroundColor: accentColor,
              boxShadow: `0 10px 15px -3px ${accentColor}40, 0 4px 6px -4px ${accentColor}40`,
            }}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t('newProject')}</span>
          </motion.button>
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
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateProject(true)}
              className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-white transition-all duration-200"
              style={{
                backgroundColor: accentColor,
                boxShadow: `0 10px 15px -3px ${accentColor}40, 0 4px 6px -4px ${accentColor}40`,
              }}
            >
              <Plus className="h-4 w-4" />
              {t('createProject')}
            </motion.button>
          </motion.div>
        )}

        <CreateProjectDialog
          open={showCreateProject}
          onOpenChange={setShowCreateProject}
          workspaceId={selectedWorkspaceId || undefined}
          workflows={workflows?.map(w => ({ id: w.id, name: w.name })) || []}
          onSubmit={async (data) => {
            let workflowId = data.workflowId;

            if (!workflowId || workflowId === "NEW") {
               if (workflows && workflows.length > 0) {
                  workflowId = workflows[0].id;
               } else if (selectedWorkspaceId) {
                  const newWorkflow = await createWorkflow({
                    name: "Default Workflow",
                    workspaceId: selectedWorkspaceId,
                  });
                  workflowId = newWorkflow.id;
               }
            }

            await createProject({
              name: data.name,
              description: data.description,
              color: data.color,
              workspaceId: data.workspaceId,
              workflowId: workflowId || "", // Should be valid now
            });
            setShowCreateProject(false);
          }}
          onCreateWorkflow={async (wsId) => {
             const newWorkflow = await createWorkflow({
               name: "Default Workflow",
               workspaceId: wsId,
             });
             return newWorkflow.id;
          }}
        />
      </div>
    </AppLayout>
  );
}
