import { Outlet, Navigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useAuth } from "../providers/auth-provider";
import { useElectron } from "@/hooks/use-electron";
import { useNotificationsSocket } from "@/hooks/use-notifications-socket";
import { useTimerStore, startTimerInterval, stopTimerInterval } from "@/stores/timer-store";
import { useUIStore } from "@/stores/ui-store";
import { useEffect, useState } from "react";
import { ShortcutsDialog, AboutDialog } from "@/components/dialogs";
import { FAB } from "@/components/FAB";
import { CreateTaskDialog } from "@/components/task/create-task-dialog";
import { CreateProjectDialog } from "@/components/project/create-project-dialog";
import { CreateWorkspaceDialog } from "@/components/workspace/CreateWorkspaceDialog";
import { TaskDetailPanel } from "@/components/task/task-detail-panel";
import { AIAssistantSidebar } from "@/components/ai/ai-assistant-sidebar";
import { SkipLinks } from "@/components/ui/SkipLinks";
import { skipLinkTargets } from "@/utils/accessibility";
import { Button } from "@ordo-todo/ui";
import { Sparkles } from "lucide-react";

export function AppLayout() {
  const { user, isLoading } = useAuth();
  
  // Initialize Electron features
  useElectron();
  
  // Initialize Real-time Notifications
  useNotificationsSocket();
  
  // Manage timer interval
  const { isRunning, isPaused } = useTimerStore();
  
  const [isAIOpen, setAIOpen] = useState(false);
  
  // UI Store state for global dialogs
  const { 
    createTaskDialogOpen, 
    closeCreateTaskDialog,
    createProjectDialogOpen, 
    closeCreateProjectDialog,
    createWorkspaceDialogOpen,
    closeCreateWorkspaceDialog,
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
          {/* Pass toggle function to sidebar or render button separately? 
              Web put it in TopBar, but let's check Sidebar.tsx design. 
              Actually, let's keep it simple and just put the logic here, 
              but we need a trigger. 
              The user asked to replicate web. In web it was in InternalPage header?
              Web TopBar has a toggle. Desktop TopBar is separate.
          */}
          <Sidebar />
        </nav>

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden pl-64 relative">
          <TopBar />
          
          {/* AI Toggle Button - Absolute positioned or valid in TopBar? 
              Web put it in TopBar. Let's see if we can perform a quick floating action or modify Sidebar/TopBar.
              For now, let's add a fixed floating button if Sidebar doesn't have it, 
              OR better: Modify TopBar to accept the toggle. 
              But TopBar is imported. 
              Let's put a Floating Trigger for now to be safe and visible.
          */}
           <div className="absolute right-6 top-4 z-50">
               <Button
                variant="outline"
                size="icon"
                className="bg-background/50 backdrop-blur-sm shadow-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800"
                onClick={() => setAIOpen(!isAIOpen)}
              >
                <Sparkles className="h-4 w-4 text-indigo-500" />
              </Button>
           </div>

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
      
      {/* AI Sidebar */}
      <AIAssistantSidebar isOpen={isAIOpen} onClose={() => setAIOpen(false)} />
      
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
      <CreateWorkspaceDialog
        open={createWorkspaceDialogOpen}
        onOpenChange={(open) => !open && closeCreateWorkspaceDialog()}
      />
      <TaskDetailPanel 
        taskId={selectedTaskId}
        open={taskDetailPanelOpen}
        onOpenChange={(open) => !open && closeTaskDetailPanel()}
      />
    </>
  );
}
