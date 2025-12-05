import { Outlet, Navigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useAuth } from "../providers/auth-provider";
import { useElectron } from "@/hooks/use-electron";
import { useTimerStore, startTimerInterval, stopTimerInterval } from "@/stores/timer-store";
import { useUIStore } from "@/stores/ui-store";
import { useEffect } from "react";
import { ShortcutsDialog, AboutDialog } from "@/components/dialogs";
import { FAB } from "@/components/FAB";
import { CreateTaskDialog } from "@/components/task/create-task-dialog";
import { CreateProjectDialog } from "@/components/project/create-project-dialog";
import { TaskDetailPanel } from "@/components/task/task-detail-panel";
import { SkipLinks } from "@/components/ui/SkipLinks";
import { skipLinkTargets } from "@/utils/accessibility";

export function AppLayout() {
  const { user, isLoading } = useAuth();
  
  // Initialize Electron features (tray, shortcuts, menu handlers)
  useElectron();
  
  // Manage timer interval
  const { isRunning, isPaused } = useTimerStore();
  
  // UI Store state for global dialogs
  const { 
    createTaskDialogOpen, 
    closeCreateTaskDialog,
    createProjectDialogOpen, 
    closeCreateProjectDialog,
    taskDetailPanelOpen, 
    closeTaskDetailPanel, 
    selectedTaskId 
  } = useUIStore();
  
  useEffect(() => {
    if (isRunning && !isPaused) {
      startTimerInterval();
    } else {
      stopTimerInterval();
    }
    return () => stopTimerInterval();
  }, [isRunning, isPaused]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center" role="status" aria-label="Loading application">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <>
      {/* Skip Links for Keyboard Navigation */}
      <SkipLinks />
      
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Sidebar */}
        <nav id={skipLinkTargets.navigation} aria-label="Main navigation">
          <Sidebar />
        </nav>

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden pl-64">
          <TopBar />
          <main 
            id={skipLinkTargets.mainContent}
            className="flex-1 overflow-y-auto p-6"
            role="main"
            aria-label="Main content"
          >
            <Outlet />
          </main>
        </div>
      </div>
      
      {/* Floating Action Button */}
      <FAB />
      
      {/* Global Dialogs */}
      <ShortcutsDialog />
      <AboutDialog />
      <CreateTaskDialog 
        open={createTaskDialogOpen} 
        onOpenChange={(open) => !open && closeCreateTaskDialog()} 
      />
      <CreateProjectDialog 
        open={createProjectDialogOpen} 
        onOpenChange={(open) => !open && closeCreateProjectDialog()} 
      />
      <TaskDetailPanel 
        taskId={selectedTaskId}
        open={taskDetailPanelOpen}
        onOpenChange={(open) => !open && closeTaskDetailPanel()}
      />
    </>
  );
}
