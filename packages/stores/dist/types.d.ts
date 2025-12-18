/**
 * Shared store types for Ordo-Todo applications
 */
export interface WorkspaceStoreState {
    selectedWorkspaceId: string | null;
}
export interface WorkspaceStoreActions {
    setSelectedWorkspaceId: (id: string | null) => void;
}
export type WorkspaceStore = WorkspaceStoreState & WorkspaceStoreActions;
export interface UIStoreState {
    sidebarCollapsed: boolean;
    sidebarWidth: number;
    createTaskDialogOpen: boolean;
    createProjectDialogOpen: boolean;
    createWorkspaceDialogOpen: boolean;
    settingsDialogOpen: boolean;
    shortcutsDialogOpen: boolean;
    aboutDialogOpen: boolean;
    taskDetailPanelOpen: boolean;
    selectedTaskId: string | null;
    quickActionsOpen: boolean;
    quickTaskInputOpen: boolean;
    tasksViewMode: 'list' | 'grid';
    projectsViewMode: 'list' | 'grid' | 'kanban';
    dashboardLayout: 'compact' | 'expanded';
    tasksSortBy: 'priority' | 'dueDate' | 'createdAt' | 'title';
    tasksSortOrder: 'asc' | 'desc';
    showCompletedTasks: boolean;
}
export interface UIStoreActions {
    toggleSidebar: () => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
    setSidebarWidth: (width: number) => void;
    openCreateTaskDialog: () => void;
    closeCreateTaskDialog: () => void;
    openCreateProjectDialog: () => void;
    closeCreateProjectDialog: () => void;
    openCreateWorkspaceDialog: () => void;
    closeCreateWorkspaceDialog: () => void;
    openSettingsDialog: () => void;
    closeSettingsDialog: () => void;
    openShortcutsDialog: () => void;
    closeShortcutsDialog: () => void;
    openAboutDialog: () => void;
    closeAboutDialog: () => void;
    openTaskDetailPanel: (taskId: string) => void;
    closeTaskDetailPanel: () => void;
    toggleQuickActions: () => void;
    openQuickTaskInput: () => void;
    closeQuickTaskInput: () => void;
    setTasksViewMode: (mode: 'list' | 'grid') => void;
    setProjectsViewMode: (mode: 'list' | 'grid' | 'kanban') => void;
    setDashboardLayout: (layout: 'compact' | 'expanded') => void;
    setTasksSort: (sortBy: UIStoreState['tasksSortBy'], order?: UIStoreState['tasksSortOrder']) => void;
    toggleShowCompletedTasks: () => void;
    setShowCompletedTasks: (show: boolean) => void;
    resetUI: () => void;
}
export type UIStore = UIStoreState & UIStoreActions;
export type TimerMode = 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK' | 'IDLE';
export interface TimerConfig {
    workDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    pomodorosUntilLongBreak: number;
    autoStartBreaks: boolean;
    autoStartPomodoros: boolean;
    soundEnabled: boolean;
    notificationsEnabled: boolean;
}
export interface TimerStoreState {
    mode: TimerMode;
    isRunning: boolean;
    isPaused: boolean;
    timeLeft: number;
    completedPomodoros: number;
    pauseCount: number;
    selectedTaskId: string | null;
    selectedTaskTitle: string | null;
    config: TimerConfig;
}
export interface TimerStoreActions {
    start: () => void;
    pause: () => void;
    resume: () => void;
    stop: () => void;
    skip: () => void;
    reset: () => void;
    tick: () => void;
    setMode: (mode: TimerMode) => void;
    setSelectedTask: (taskId: string | null, taskTitle: string | null) => void;
    updateConfig: (config: Partial<TimerConfig>) => void;
    getTimeFormatted: () => string;
    getProgress: () => number;
}
export type TimerStore = TimerStoreState & TimerStoreActions;
export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';
export interface PendingAction {
    id: string;
    type: string;
    url: string;
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    data: Record<string, unknown>;
    entityType: 'task' | 'project' | 'comment' | 'timer';
    entityId?: string;
    createdAt: number;
    retryCount: number;
}
export interface SyncStoreState {
    status: SyncStatus;
    isOnline: boolean;
    pendingCount: number;
    lastSyncTime: number | null;
    error: string | null;
    isSyncing: boolean;
    currentAction: string | null;
    syncProgress: number;
}
export interface SyncStoreActions {
    setStatus: (status: SyncStatus) => void;
    setOnline: (online: boolean) => void;
    setPendingCount: (count: number) => void;
    setLastSyncTime: (time: number | null) => void;
    setError: (error: string | null) => void;
    setSyncing: (syncing: boolean, currentAction?: string) => void;
    setSyncProgress: (progress: number) => void;
}
export type SyncStore = SyncStoreState & SyncStoreActions;
//# sourceMappingURL=types.d.ts.map