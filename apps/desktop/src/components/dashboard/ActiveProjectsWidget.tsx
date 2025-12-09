import { FolderKanban, ChevronRight } from "lucide-react";
import { cn, Progress } from "@ordo-todo/ui";

interface Project {
  id: string;
  name: string;
  color: string;
  completedTasks: number;
  totalTasks: number;
}

interface ActiveProjectsWidgetProps {
  projects: Project[];
  onProjectClick?: (projectId: string) => void;
  onViewAll?: () => void;
}

export function ActiveProjectsWidget({
  projects,
  onProjectClick,
  onViewAll,
}: ActiveProjectsWidgetProps) {
  const displayProjects = projects.slice(0, 4);

  if (projects.length === 0) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
            <FolderKanban className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold">Proyectos Activos</h3>
        </div>
        <p className="text-sm text-muted-foreground text-center py-8">
          No hay proyectos activos
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
            <FolderKanban className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold">Proyectos Activos</h3>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
          >
            Ver todos
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {displayProjects.map((project) => {
          const progress = project.totalTasks > 0
            ? Math.round((project.completedTasks / project.totalTasks) * 100)
            : 0;

          return (
            <div
              key={project.id}
              className={cn(
                "p-3 rounded-lg border transition-all duration-200",
                "hover:bg-accent/50 hover:border-primary/20 cursor-pointer"
              )}
              onClick={() => onProjectClick?.(project.id)}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                <span className="font-medium flex-1 truncate">{project.name}</span>
                <span className="text-xs text-muted-foreground">
                  {project.completedTasks}/{project.totalTasks}
                </span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
