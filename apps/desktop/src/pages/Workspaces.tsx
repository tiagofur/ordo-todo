import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Briefcase, Building2 } from "lucide-react";
import { useWorkspaces } from "@/hooks/api/use-workspaces";
import { PageTransition, SlideIn, FadeIn } from "@/components/motion";
import { CreateWorkspaceDialog } from "@/components/workspace/CreateWorkspaceDialog";
import { WorkspaceCard } from "@/components/workspace/WorkspaceCard";
import { useUIStore } from "@/stores/ui-store";

export function Workspaces() {
  const { t } = useTranslation();
  const { createWorkspaceDialogOpen, openCreateWorkspaceDialog, closeCreateWorkspaceDialog } = useUIStore();
  const { data: workspaces, isLoading } = useWorkspaces();

  // Accent color (orange like Web)
  const accentColor = "#f97316"; // Orange-500

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
                  <Briefcase className="h-6 w-6" />
                </div>
                {t("Workspaces.title") || "Workspaces"}
              </h1>
              <p className="text-muted-foreground mt-2">
                {t("Workspaces.subtitle") || "Gestiona tus espacios de trabajo"}
              </p>
            </div>
            <button
              onClick={openCreateWorkspaceDialog}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
              style={{
                backgroundColor: accentColor,
                boxShadow: `0 10px 15px -3px ${accentColor}40, 0 4px 6px -4px ${accentColor}40`,
              }}
            >
              <Plus className="h-4 w-4" />
              {t("Workspaces.newWorkspace") || "Nuevo Workspace"}
            </button>
          </div>
        </SlideIn>

        {/* Workspaces Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-48 rounded-2xl bg-muted/50 animate-pulse"
              />
            ))}
          </div>
        ) : workspaces && workspaces.length > 0 ? (
          <FadeIn delay={0.1}>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {workspaces.map((workspace: any, index: number) => (
                <WorkspaceCard 
                  key={workspace.id} 
                  workspace={workspace} 
                  index={index}
                />
              ))}
            </div>
          </FadeIn>
        ) : (
          <FadeIn delay={0.1}>
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted/50 mb-6">
                <Briefcase className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t("Workspaces.noWorkspaces") || "No tienes workspaces"}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                {t("Workspaces.noWorkspacesDescription") || "Crea tu primer espacio de trabajo para empezar."}
              </p>
              <button
                onClick={openCreateWorkspaceDialog}
                className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: accentColor,
                  boxShadow: `0 10px 15px -3px ${accentColor}40, 0 4px 6px -4px ${accentColor}40`,
                }}
              >
                <Plus className="h-4 w-4" />
                {t("Workspaces.createWorkspace") || "Crear Workspace"}
              </button>
            </div>
          </FadeIn>
        )}
        
        {/* We use the global global dialog from AppLayout, but this is here just in case local state was preferred, 
            but we are using the UI Store one accessed via button */}
      </div>
    </PageTransition>
  );
}
