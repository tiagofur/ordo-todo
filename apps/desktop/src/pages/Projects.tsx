import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, FolderKanban } from "lucide-react";
import { ProjectCard } from "@/components/project/project-card";
import { CreateProjectDialog } from "@/components/project/create-project-dialog";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useProjects } from "@/hooks/api/use-projects";
import { PageTransition, SlideIn, FadeIn } from "@/components/motion";

export function Projects() {
  const { t } = useTranslation();
  const [showCreateProject, setShowCreateProject] = useState(false);
  const { selectedWorkspaceId } = useWorkspaceStore();
  const { data: projects, isLoading } = useProjects(selectedWorkspaceId || undefined);

  // Accent color (pink like Web)
  const accentColor = "#ec4899"; // Pink-500

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
                  <FolderKanban className="h-6 w-6" />
                </div>
                {t("projects.title")}
              </h1>
              <p className="text-muted-foreground mt-2">
                {t("projects.subtitle") || "Organiza tus tareas en proyectos"}
              </p>
            </div>
            <button
              onClick={() => setShowCreateProject(true)}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
              style={{
                backgroundColor: accentColor,
                boxShadow: `0 10px 15px -3px ${accentColor}40, 0 4px 6px -4px ${accentColor}40`,
              }}
            >
              <Plus className="h-4 w-4" />
              {t("projects.newProject") || "Nuevo Proyecto"}
            </button>
          </div>
        </SlideIn>

        {/* Projects Grid */}
        {!selectedWorkspaceId ? (
          <FadeIn delay={0.1}>
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted/50 mb-6">
                <FolderKanban className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t("projects.selectWorkspace") || "Selecciona un workspace"}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                {t("projects.selectWorkspaceDescription") || "Selecciona o crea un workspace para ver tus proyectos"}
              </p>
            </div>
          </FadeIn>
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
          <FadeIn delay={0.1}>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {projects.map((project: any) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                />
              ))}
            </div>
          </FadeIn>
        ) : (
          <FadeIn delay={0.1}>
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted/50 mb-6">
                <FolderKanban className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t("projects.noProjects") || "No hay proyectos"}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                {t("projects.noProjectsDescription") || "Crea tu primer proyecto para empezar a organizar tus tareas."}
              </p>
              <button
                onClick={() => setShowCreateProject(true)}
                className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: accentColor,
                  boxShadow: `0 10px 15px -3px ${accentColor}40, 0 4px 6px -4px ${accentColor}40`,
                }}
              >
                <Plus className="h-4 w-4" />
                {t("projects.createProject") || "Crear Proyecto"}
              </button>
            </div>
          </FadeIn>
        )}

        <CreateProjectDialog 
          open={showCreateProject} 
          onOpenChange={setShowCreateProject} 
          workspaceId={selectedWorkspaceId || undefined}
        />
      </div>
    </PageTransition>
  );
}
