/**
 * Types for the hooks package
 */
import type { OrdoApiClient, Notification, UnreadCountResponse, PublicTaskResponse, TaskShareResponse, Attachment } from '@ordo-todo/api-client';
/**
 * API Client interface that the hooks expect.
 * This allows both OrdoApiClient class instances and plain object clients.
 */
export type ApiClient = OrdoApiClient | {
    register: OrdoApiClient['register'];
    login: OrdoApiClient['login'];
    logout: OrdoApiClient['logout'];
    getCurrentUser: OrdoApiClient['getCurrentUser'];
    getFullProfile: OrdoApiClient['getFullProfile'];
    updateProfile: OrdoApiClient['updateProfile'];
    getPreferences: OrdoApiClient['getPreferences'];
    updatePreferences: OrdoApiClient['updatePreferences'];
    getIntegrations: OrdoApiClient['getIntegrations'];
    exportData: OrdoApiClient['exportData'];
    deleteAccount: OrdoApiClient['deleteAccount'];
    getWorkspaces: OrdoApiClient['getWorkspaces'];
    getWorkspace: OrdoApiClient['getWorkspace'];
    getWorkspaceBySlug: OrdoApiClient['getWorkspaceBySlug'];
    createWorkspace: OrdoApiClient['createWorkspace'];
    updateWorkspace: OrdoApiClient['updateWorkspace'];
    deleteWorkspace: OrdoApiClient['deleteWorkspace'];
    getDeletedWorkspaces: OrdoApiClient['getDeletedWorkspaces'];
    restoreWorkspace: OrdoApiClient['restoreWorkspace'];
    permanentDeleteWorkspace: OrdoApiClient['permanentDeleteWorkspace'];
    addWorkspaceMember: OrdoApiClient['addWorkspaceMember'];
    removeWorkspaceMember: OrdoApiClient['removeWorkspaceMember'];
    getWorkspaceMembers?: OrdoApiClient['getWorkspaceMembers'];
    getWorkspaceInvitations?: OrdoApiClient['getWorkspaceInvitations'];
    inviteWorkspaceMember?: OrdoApiClient['inviteWorkspaceMember'];
    acceptWorkspaceInvitation?: OrdoApiClient['acceptWorkspaceInvitation'];
    getWorkspaceSettings?: OrdoApiClient['getWorkspaceSettings'];
    updateWorkspaceSettings?: OrdoApiClient['updateWorkspaceSettings'];
    getWorkspaceAuditLogs?: OrdoApiClient['getWorkspaceAuditLogs'];
    createAuditLog?: OrdoApiClient['createAuditLog'];
    archiveWorkspace?: OrdoApiClient['archiveWorkspace'];
    getWorkflows: OrdoApiClient['getWorkflows'];
    createWorkflow: OrdoApiClient['createWorkflow'];
    updateWorkflow: OrdoApiClient['updateWorkflow'];
    deleteWorkflow: OrdoApiClient['deleteWorkflow'];
    getProjects: OrdoApiClient['getProjects'];
    getAllProjects: OrdoApiClient['getAllProjects'];
    getProject: OrdoApiClient['getProject'];
    getProjectBySlugs: OrdoApiClient['getProjectBySlugs'];
    createProject: OrdoApiClient['createProject'];
    updateProject: OrdoApiClient['updateProject'];
    archiveProject: OrdoApiClient['archiveProject'];
    completeProject: OrdoApiClient['completeProject'];
    deleteProject: OrdoApiClient['deleteProject'];
    getTasks: OrdoApiClient['getTasks'];
    getTask: OrdoApiClient['getTask'];
    getTaskDetails: OrdoApiClient['getTaskDetails'];
    createTask: OrdoApiClient['createTask'];
    updateTask: OrdoApiClient['updateTask'];
    completeTask: OrdoApiClient['completeTask'];
    deleteTask: OrdoApiClient['deleteTask'];
    createSubtask: OrdoApiClient['createSubtask'];
    generatePublicToken?: (taskId: string) => Promise<TaskShareResponse>;
    getTaskByPublicToken?: (token: string) => Promise<PublicTaskResponse>;
    getTimeBlocks?: OrdoApiClient['getTimeBlocks'];
    getTags: OrdoApiClient['getTags'];
    getTaskTags: OrdoApiClient['getTaskTags'];
    createTag: OrdoApiClient['createTag'];
    assignTagToTask: OrdoApiClient['assignTagToTask'];
    removeTagFromTask: OrdoApiClient['removeTagFromTask'];
    deleteTag: OrdoApiClient['deleteTag'];
    updateTag?: (id: string, data: unknown) => Promise<unknown>;
    startTimer: OrdoApiClient['startTimer'];
    stopTimer: OrdoApiClient['stopTimer'];
    getActiveTimer: OrdoApiClient['getActiveTimer'];
    pauseTimer: OrdoApiClient['pauseTimer'];
    resumeTimer: OrdoApiClient['resumeTimer'];
    switchTask: OrdoApiClient['switchTask'];
    getSessionHistory: OrdoApiClient['getSessionHistory'];
    getTimerStats: OrdoApiClient['getTimerStats'];
    getTaskTimeSessions: OrdoApiClient['getTaskTimeSessions'];
    getDailyMetrics: OrdoApiClient['getDailyMetrics'];
    getWeeklyMetrics: OrdoApiClient['getWeeklyMetrics'];
    getDashboardStats: OrdoApiClient['getDashboardStats'];
    getHeatmapData: OrdoApiClient['getHeatmapData'];
    getProjectDistribution: OrdoApiClient['getProjectDistribution'];
    getTaskStatusDistribution: OrdoApiClient['getTaskStatusDistribution'];
    getMonthlyMetrics?: (params?: unknown) => Promise<unknown>;
    getDateRangeMetrics?: (startDate: string, endDate: string) => Promise<unknown>;
    getAIProfile: OrdoApiClient['getAIProfile'];
    getOptimalSchedule: OrdoApiClient['getOptimalSchedule'];
    predictTaskDuration: OrdoApiClient['predictTaskDuration'];
    generateWeeklyReport: OrdoApiClient['generateWeeklyReport'];
    getReports: OrdoApiClient['getReports'];
    getReport: OrdoApiClient['getReport'];
    deleteReport: OrdoApiClient['deleteReport'];
    getTaskComments: OrdoApiClient['getTaskComments'];
    createComment: OrdoApiClient['createComment'];
    updateComment: OrdoApiClient['updateComment'];
    deleteComment: OrdoApiClient['deleteComment'];
    getTaskAttachments: OrdoApiClient['getTaskAttachments'];
    createAttachment: OrdoApiClient['createAttachment'];
    deleteAttachment: OrdoApiClient['deleteAttachment'];
    getProjectAttachments?: (projectId: string) => Promise<Attachment[]>;
    getNotifications?: () => Promise<Notification[]>;
    getUnreadNotificationsCount?: () => Promise<UnreadCountResponse>;
    markNotificationAsRead?: (id: string) => Promise<Notification>;
    markAllNotificationsAsRead?: () => Promise<any>;
    getHabits: OrdoApiClient['getHabits'];
    getTodayHabits: OrdoApiClient['getTodayHabits'];
    getHabit: OrdoApiClient['getHabit'];
    getHabitStats: OrdoApiClient['getHabitStats'];
    createHabit: OrdoApiClient['createHabit'];
    updateHabit: OrdoApiClient['updateHabit'];
    deleteHabit: OrdoApiClient['deleteHabit'];
    completeHabit: OrdoApiClient['completeHabit'];
    uncompleteHabit: OrdoApiClient['uncompleteHabit'];
    pauseHabit: OrdoApiClient['pauseHabit'];
    resumeHabit: OrdoApiClient['resumeHabit'];
    getObjectives: OrdoApiClient['getObjectives'];
    getCurrentPeriodObjectives: OrdoApiClient['getCurrentPeriodObjectives'];
    getObjectivesDashboardSummary: OrdoApiClient['getObjectivesDashboardSummary'];
    getObjective: OrdoApiClient['getObjective'];
    createObjective: OrdoApiClient['createObjective'];
    updateObjective: OrdoApiClient['updateObjective'];
    deleteObjective: OrdoApiClient['deleteObjective'];
    addKeyResult: OrdoApiClient['addKeyResult'];
    updateKeyResult: OrdoApiClient['updateKeyResult'];
    deleteKeyResult: OrdoApiClient['deleteKeyResult'];
    linkTaskToKeyResult: OrdoApiClient['linkTaskToKeyResult'];
    unlinkTaskFromKeyResult: OrdoApiClient['unlinkTaskFromKeyResult'];
    getNotes: OrdoApiClient['getNotes'];
    getNote: OrdoApiClient['getNote'];
    createNote: OrdoApiClient['createNote'];
    updateNote: OrdoApiClient['updateNote'];
    deleteNote: OrdoApiClient['deleteNote'];
    getProjectCustomFields: OrdoApiClient['getProjectCustomFields'];
    createCustomField: OrdoApiClient['createCustomField'];
    updateCustomField: OrdoApiClient['updateCustomField'];
    deleteCustomField: OrdoApiClient['deleteCustomField'];
    getTaskCustomValues: OrdoApiClient['getTaskCustomValues'];
    setTaskCustomValues: OrdoApiClient['setTaskCustomValues'];
};
/**
 * Configuration for creating hooks
 */
export interface CreateHooksConfig {
    /**
     * The API client instance to use for all requests
     */
    apiClient: ApiClient;
}
//# sourceMappingURL=types.d.ts.map