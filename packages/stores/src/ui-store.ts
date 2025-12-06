import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UIStore, UIStoreState } from './types';

/**
 * Default UI state values
 */
export const defaultUIState: UIStoreState = {
  sidebarCollapsed: false,
  sidebarWidth: 280,
  createTaskDialogOpen: false,
  createProjectDialogOpen: false,
  createWorkspaceDialogOpen: false,
  settingsDialogOpen: false,
  shortcutsDialogOpen: false,
  aboutDialogOpen: false,
  taskDetailPanelOpen: false,
  selectedTaskId: null,
  quickActionsOpen: false,
  quickTaskInputOpen: false,
  tasksViewMode: 'list',
  projectsViewMode: 'list',
  dashboardLayout: 'expanded',
  tasksSortBy: 'priority',
  tasksSortOrder: 'asc',
  showCompletedTasks: true,
};

/**
 * Shared UI store for managing UI state across platforms.
 *
 * Handles sidebar, dialogs, panels, view preferences, and sort/filter settings.
 *
 * @example
 * ```tsx
 * import { useUIStore } from '@ordo-todo/stores';
 *
 * function Sidebar() {
 *   const { sidebarCollapsed, toggleSidebar } = useUIStore();
 *
 *   return (
 *     <aside className={sidebarCollapsed ? 'collapsed' : ''}>
 *       <button onClick={toggleSidebar}>Toggle</button>
 *     </aside>
 *   );
 * }
 * ```
 */
export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      ...defaultUIState,

      // Sidebar actions
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setSidebarWidth: (width) => set({ sidebarWidth: width }),

      // Dialog actions
      openCreateTaskDialog: () => set({ createTaskDialogOpen: true }),
      closeCreateTaskDialog: () => set({ createTaskDialogOpen: false }),
      openCreateProjectDialog: () => set({ createProjectDialogOpen: true }),
      closeCreateProjectDialog: () => set({ createProjectDialogOpen: false }),
      openCreateWorkspaceDialog: () => set({ createWorkspaceDialogOpen: true }),
      closeCreateWorkspaceDialog: () => set({ createWorkspaceDialogOpen: false }),
      openSettingsDialog: () => set({ settingsDialogOpen: true }),
      closeSettingsDialog: () => set({ settingsDialogOpen: false }),
      openShortcutsDialog: () => set({ shortcutsDialogOpen: true }),
      closeShortcutsDialog: () => set({ shortcutsDialogOpen: false }),
      openAboutDialog: () => set({ aboutDialogOpen: true }),
      closeAboutDialog: () => set({ aboutDialogOpen: false }),

      // Panel actions
      openTaskDetailPanel: (taskId) =>
        set({
          taskDetailPanelOpen: true,
          selectedTaskId: taskId,
        }),
      closeTaskDetailPanel: () =>
        set({
          taskDetailPanelOpen: false,
          selectedTaskId: null,
        }),

      // Quick actions
      toggleQuickActions: () =>
        set((state) => ({
          quickActionsOpen: !state.quickActionsOpen,
        })),
      openQuickTaskInput: () =>
        set({
          quickTaskInputOpen: true,
          quickActionsOpen: false,
        }),
      closeQuickTaskInput: () => set({ quickTaskInputOpen: false }),

      // View actions
      setTasksViewMode: (mode) => set({ tasksViewMode: mode }),
      setProjectsViewMode: (mode) => set({ projectsViewMode: mode }),
      setDashboardLayout: (layout) => set({ dashboardLayout: layout }),

      // Sort actions
      setTasksSort: (sortBy, order) =>
        set((state) => ({
          tasksSortBy: sortBy,
          tasksSortOrder:
            order ?? (state.tasksSortBy === sortBy ? (state.tasksSortOrder === 'asc' ? 'desc' : 'asc') : 'asc'),
        })),

      // Filter actions
      toggleShowCompletedTasks: () =>
        set((state) => ({
          showCompletedTasks: !state.showCompletedTasks,
        })),
      setShowCompletedTasks: (show) => set({ showCompletedTasks: show }),

      // Reset
      resetUI: () => set(defaultUIState),
    }),
    {
      name: 'ordo-ui-store',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        sidebarWidth: state.sidebarWidth,
        tasksViewMode: state.tasksViewMode,
        projectsViewMode: state.projectsViewMode,
        dashboardLayout: state.dashboardLayout,
        tasksSortBy: state.tasksSortBy,
        tasksSortOrder: state.tasksSortOrder,
        showCompletedTasks: state.showCompletedTasks,
      }),
    }
  )
);
