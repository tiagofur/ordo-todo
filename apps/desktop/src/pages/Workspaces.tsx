import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Briefcase, Building2 } from "lucide-react";
import { useWorkspaces, useCreateWorkspace } from "@/hooks/api";
import { PageTransition, SlideIn, FadeIn } from "@/components/motion";
import { CreateWorkspaceDialog } from "@/components/workspace/CreateWorkspaceDialog";
import { WorkspaceCard } from "@/components/workspace/WorkspaceCard";
import { useUIStore } from "@/stores/ui-store";

export function Workspaces() {
  const { t } = (useTranslation as any)();
  const { createWorkspaceDialogOpen, openCreateWorkspaceDialog, closeCreateWorkspaceDialog } = useUIStore();
  const { data: workspaces, isLoading } = useWorkspaces();
  
  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header - Standard Iconic Design */}
        <SlideIn direction="top">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-workspaces text-white shadow-lg shadow-workspaces/25 shrink-0"
              >
                <Briefcase className="h-7 w-7" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold tracking-tight truncate">
                  {t("Workspaces.title") || "Workspaces"}
                </h1>
                <p className="text-muted-foreground mt-1 line-clamp-1">
                  {t("Workspaces.subtitle") || "Gestiona tus espacios de trabajo"}
                </p>
              </div>
            </div>
            <button
              onClick={openCreateWorkspaceDialog}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium bg-workspaces text-white shadow-lg shadow-workspaces/25 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-workspaces/30"
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
                className="h-48 rounded-2xl bg-muted/50 animate-pulse border border-border/20"
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
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-muted/10 rounded-3xl border-2 border-dashed border-border/50">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-workspaces/10 text-workspaces mb-6">
                <Briefcase className="h-12 w-12" />
              </div>
              <h3 className="text-2xl font-bold mb-2 tracking-tight">
                {t("Workspaces.noWorkspaces") || "No tienes workspaces"}
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md text-balance">
                {t("Workspaces.noWorkspacesDescription") || "Crea tu primer espacio de trabajo para empezar."}
              </p>
              <button
                onClick={openCreateWorkspaceDialog}
                className="flex items-center gap-2 rounded-xl px-8 py-3.5 text-base font-semibold bg-workspaces text-white shadow-xl shadow-workspaces/25 transition-all duration-200 hover:scale-105"
              >
                <Plus className="h-5 w-5" />
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
