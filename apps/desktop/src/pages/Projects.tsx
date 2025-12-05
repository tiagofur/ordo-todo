import { useState } from "react";
import { Plus, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/project/project-card";
import { CreateProjectDialog } from "@/components/project/create-project-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useProjects } from "@/hooks/api/use-projects";

export function Projects() {
  const [showCreateProject, setShowCreateProject] = useState(false);
  const { selectedWorkspaceId } = useWorkspaceStore();
  const { data: projects, isLoading } = useProjects(selectedWorkspaceId || undefined);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Proyectos</h1>
          <p className="text-muted-foreground">Organiza tus tareas en proyectos</p>
        </div>
        <Button onClick={() => setShowCreateProject(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Proyecto
        </Button>
      </div>

      {isLoading ? (
        <div>Cargando proyectos...</div>
      ) : !projects || projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No hay proyectos"
          description="Crea tu primer proyecto para empezar a organizar tus tareas."
          actionLabel="Crear Proyecto"
          onAction={() => setShowCreateProject(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project: any) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <CreateProjectDialog 
        open={showCreateProject} 
        onOpenChange={setShowCreateProject} 
        workspaceId={selectedWorkspaceId || undefined}
      />
    </div>
  );
}
