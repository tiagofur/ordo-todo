"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Settings, Trash2, Plus, List, LayoutGrid, Briefcase, FolderKanban, CheckSquare, MoreHorizontal } from "lucide-react";
import { useWorkspace, useAllProjects, useDeleteWorkspace } from "@/lib/api-hooks";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateProjectDialog } from "@/components/project/create-project-dialog";
import { ProjectCard } from "@/components/project/project-card";
import { WorkspaceSettingsDialog } from "@/components/workspace/workspace-settings-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type ViewMode = "list" | "grid";

const typeConfig = {
  PERSONAL: { label: "Personal", color: "cyan", hexColor: "#06b6d4", icon: Briefcase },
  WORK: { label: "Trabajo", color: "purple", hexColor: "#a855f7", icon: FolderKanban },
  TEAM: { label: "Equipo", color: "pink", hexColor: "#ec4899", icon: CheckSquare },
};

export default function WorkspaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.workspaceId as string;
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const { data: workspace, isLoading: isLoadingWorkspace } = useWorkspace(workspaceId);
  const { data: allProjects, isLoading: isLoadingProjects } = useAllProjects();
  
  // Filter projects by workspace
  const projects = allProjects?.filter((p: any) => p.workspaceId === workspaceId) || [];

  const deleteWorkspace = useDeleteWorkspace();

  const handleDelete = () => {
    if (confirm(`¿Estás seguro de eliminar este workspace? Se eliminarán ${projects.length} proyectos. Esta acción no se puede deshacer.`)) {
      deleteWorkspace.mutate(workspaceId, {
        onSuccess: () => {
          toast.success("Workspace eliminado");
          router.push("/workspaces");
        }
      });
    }
  };

  if (isLoadingWorkspace) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="h-32 animate-pulse rounded-lg bg-muted" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h2 className="text-2xl font-bold">Workspace no encontrado</h2>
        <p className="mt-2 text-muted-foreground">El workspace que buscas no existe o fue eliminado.</p>
        <Button onClick={() => router.push("/workspaces")} className="mt-4">
          Volver a Workspaces
        </Button>
      </div>
    );
  }

  const typeInfo = typeConfig[workspace.type as keyof typeof typeConfig];
  const TypeIcon = typeInfo.icon;

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Workspaces", href: "/workspaces" },
          { label: workspace.name },
        ]}
      />

      {/* Workspace Header */}
      <div
        className="rounded-xl border p-6"
        style={{
          borderLeftWidth: "4px",
          borderLeftColor: typeInfo.hexColor,
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/workspaces")}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                {/* Icon */}
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm"
                  style={{
                    backgroundColor: `${typeInfo.hexColor}15`,
                    color: typeInfo.hexColor,
                  }}
                >
                  <TypeIcon className="h-7 w-7" />
                </div>

                <div>
                  <h1 className="text-3xl font-bold truncate">{workspace.name}</h1>
                  <span 
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mt-1"
                    style={{
                      backgroundColor: `${typeInfo.hexColor}20`,
                      color: typeInfo.hexColor,
                    }}
                  >
                    {typeInfo.label}
                  </span>
                </div>
              </div>

              {workspace.description && (
                <p className="mt-3 text-muted-foreground">{workspace.description}</p>
              )}

              <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  <span className="font-medium text-foreground">{projects.length}</span>{" "}
                  {projects.length === 1 ? "proyecto" : "proyectos"}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowCreateProject(true)}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:scale-105"
              style={{ 
                backgroundColor: typeInfo.hexColor,
                boxShadow: `0 10px 15px -3px ${typeInfo.hexColor}20, 0 4px 6px -4px ${typeInfo.hexColor}20`
              }}
            >
              <Plus className="h-4 w-4" />
              Nuevo Proyecto
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowSettings(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configuraciones
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Proyectos</h2>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Projects */}
      {isLoadingProjects ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-muted/50" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center py-16 px-4 text-center"
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted/50 mb-6">
            <FolderKanban className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No hay proyectos</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Crea tu primer proyecto para empezar a organizar tus tareas en este workspace
          </p>
          <button
            onClick={() => setShowCreateProject(true)}
            className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:scale-105"
            style={{ 
              backgroundColor: typeInfo.hexColor,
              boxShadow: `0 10px 15px -3px ${typeInfo.hexColor}20, 0 4px 6px -4px ${typeInfo.hexColor}20`
            }}
          >
            <Plus className="h-4 w-4" />
            Nuevo Proyecto
          </button>
        </motion.div>
      ) : (
        <div className={cn(
          viewMode === "grid" 
            ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            : "space-y-4"
        )}>
          {projects.map((project: any, index: number) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      )}

      <CreateProjectDialog
        open={showCreateProject}
        onOpenChange={setShowCreateProject}
        workspaceId={workspaceId}
      />

      <WorkspaceSettingsDialog
        workspaceId={workspaceId}
        open={showSettings}
        onOpenChange={setShowSettings}
      />
    </div>
  );
}
