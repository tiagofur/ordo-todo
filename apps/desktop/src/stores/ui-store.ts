import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UIState {
  // Sidebar
  sidebarCollapsed: boolean
  sidebarWidth: number

  // Dialogs
  createTaskDialogOpen: boolean
  createProjectDialogOpen: boolean
  createWorkspaceDialogOpen: boolean
  settingsDialogOpen: boolean
  shortcutsDialogOpen: boolean
  aboutDialogOpen: boolean

  // Panels
  taskDetailPanelOpen: boolean
  selectedTaskId: string | null

  // Quick Actions
  quickActionsOpen: boolean
  quickTaskInputOpen: boolean

  // View preferences
  tasksViewMode: 'list' | 'grid'
  projectsViewMode: 'list' | 'grid' | 'kanban'
  dashboardLayout: 'compact' | 'expanded'

  // Sort preferences
  tasksSortBy: 'priority' | 'dueDate' | 'createdAt' | 'title'
  tasksSortOrder: 'asc' | 'desc'

  // Filter preferences
  showCompletedTasks: boolean

  // Actions
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setSidebarWidth: (width: number) => void

  // Dialog actions
  openCreateTaskDialog: () => void
  closeCreateTaskDialog: () => void
  openCreateProjectDialog: () => void
  closeCreateProjectDialog: () => void
  openCreateWorkspaceDialog: () => void
  closeCreateWorkspaceDialog: () => void
  openSettingsDialog: () => void
  closeSettingsDialog: () => void
  openShortcutsDialog: () => void
  closeShortcutsDialog: () => void
  openAboutDialog: () => void
  closeAboutDialog: () => void

  // Panel actions
  openTaskDetailPanel: (taskId: string) => void
  closeTaskDetailPanel: () => void

  // Quick actions
  toggleQuickActions: () => void
  openQuickTaskInput: () => void
  closeQuickTaskInput: () => void

  // View actions
  setTasksViewMode: (mode: 'list' | 'grid') => void
  setProjectsViewMode: (mode: 'list' | 'grid' | 'kanban') => void
  setDashboardLayout: (layout: 'compact' | 'expanded') => void

  // Sort actions
  setTasksSort: (sortBy: UIState['tasksSortBy'], order?: UIState['tasksSortOrder']) => void

  // Filter actions
  toggleShowCompletedTasks: () => void
  setShowCompletedTasks: (show: boolean) => void

  // Reset
  resetUI: () => void
}

const defaultState = {
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
  tasksViewMode: 'list' as const,
  projectsViewMode: 'list' as const,
  dashboardLayout: 'expanded' as const,
  tasksSortBy: 'priority' as const,
  tasksSortOrder: 'asc' as const,
  showCompletedTasks: true,
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      ...defaultState,

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
      openTaskDetailPanel: (taskId) => set({
        taskDetailPanelOpen: true,
        selectedTaskId: taskId
      }),
      closeTaskDetailPanel: () => set({
        taskDetailPanelOpen: false,
        selectedTaskId: null
      }),

      // Quick actions
      toggleQuickActions: () => set((state) => ({
        quickActionsOpen: !state.quickActionsOpen
      })),
      openQuickTaskInput: () => set({
        quickTaskInputOpen: true,
        quickActionsOpen: false
      }),
      closeQuickTaskInput: () => set({ quickTaskInputOpen: false }),

      // View actions
      setTasksViewMode: (mode) => set({ tasksViewMode: mode }),
      setProjectsViewMode: (mode) => set({ projectsViewMode: mode }),
      setDashboardLayout: (layout) => set({ dashboardLayout: layout }),

      // Sort actions
      setTasksSort: (sortBy, order) => set((state) => ({
        tasksSortBy: sortBy,
        tasksSortOrder: order ?? (state.tasksSortBy === sortBy
          ? (state.tasksSortOrder === 'asc' ? 'desc' : 'asc')
          : 'asc'),
      })),

      // Filter actions
      toggleShowCompletedTasks: () => set((state) => ({
        showCompletedTasks: !state.showCompletedTasks
      })),
      setShowCompletedTasks: (show) => set({ showCompletedTasks: show }),

      // Reset
      resetUI: () => set(defaultState),
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
)
