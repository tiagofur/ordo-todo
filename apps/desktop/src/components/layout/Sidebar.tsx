import { useState } from "react";
import { Home, CheckSquare, FolderKanban, Tags, BarChart3, Settings, Calendar } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import { WorkspaceSelector } from "../workspace/WorkspaceSelector";
import { CreateWorkspaceDialog } from "../workspace/CreateWorkspaceDialog";
import { TimerWidget } from "../timer/TimerWidget";

const navigation = [
  { name: "Hoy", href: "/dashboard", icon: Home },
  { name: "Tareas", href: "/tasks", icon: CheckSquare },
  { name: "Calendario", href: "/calendar", icon: Calendar },
  { name: "Proyectos", href: "/projects", icon: FolderKanban },
  { name: "Etiquetas", href: "/tags", icon: Tags },
  { name: "Analíticas", href: "/analytics", icon: BarChart3 },
];

export function Sidebar() {
  const location = useLocation();
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);

  return (
    <>
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-6">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <CheckSquare className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold">Ordo</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Timer Widget */}
          <div className="border-t p-3">
            <TimerWidget />
          </div>

          {/* Workspace Selector */}
          <div className="border-t p-3">
            <WorkspaceSelector onCreateClick={() => setShowCreateWorkspace(true)} />
          </div>

          {/* Settings */}
          <div className="border-t p-3 space-y-1">
            <Link
              to="/settings"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                location.pathname === "/settings"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Settings className="h-5 w-5" />
              Configuración
            </Link>
          </div>
        </div>
      </aside>

      <CreateWorkspaceDialog
        open={showCreateWorkspace}
        onOpenChange={setShowCreateWorkspace}
      />
    </>
  );
}
