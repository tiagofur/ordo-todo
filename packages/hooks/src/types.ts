/**
 * Types for the hooks package
 */

import type {
  OrdoApiClient,
  Notification,
  UnreadCountResponse,
  PublicTaskResponse,
  TaskShareResponse,
  Attachment,
  // Creator OS
  CreateSocialPostDto,
  UpdateSocialPostDto,
  BulkScheduleDto,
  SocialPost,
  SocialPostsListResponse,
  ContentPlatform,
  Idea,
  CreateIdeaDto,
  UpdateIdeaDto,
  ContentPiece,
  CreateContentPieceDto,
  UpdateContentPieceDto
} from '@ordo-todo/api-client';

export type {
  Idea,
  CreateIdeaDto,
  UpdateIdeaDto,
  ContentPiece,
  CreateContentPieceDto,
  UpdateContentPieceDto,
  CreateSocialPostDto,
  UpdateSocialPostDto,
  BulkScheduleDto,
  SocialPost,
  ContentPlatform
};

/**
 * API Client interface that the hooks expect.
 * This allows both OrdoApiClient class instances and plain object clients.
 */
export type ApiClient = (OrdoApiClient & { [key: string]: any }) | {
  [key: string]: any;
  // Auth
  register: OrdoApiClient['register'];
  login: OrdoApiClient['login'];
  logout: OrdoApiClient['logout'];

  // User
  getCurrentUser: OrdoApiClient['getCurrentUser'];
  getFullProfile: OrdoApiClient['getFullProfile'];
  updateProfile: OrdoApiClient['updateProfile'];
  getPreferences: OrdoApiClient['getPreferences'];
  updatePreferences: OrdoApiClient['updatePreferences'];
  getIntegrations: OrdoApiClient['getIntegrations'];
  exportData: OrdoApiClient['exportData'];
  deleteAccount: OrdoApiClient['deleteAccount'];

  // Workspace
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

  // Extended workspace methods
  getWorkspaceMembers: OrdoApiClient['getWorkspaceMembers'];
  getWorkspaceInvitations: OrdoApiClient['getWorkspaceInvitations'];
  inviteWorkspaceMember: OrdoApiClient['inviteWorkspaceMember'];
  acceptWorkspaceInvitation: OrdoApiClient['acceptWorkspaceInvitation'];
  getWorkspaceSettings: OrdoApiClient['getWorkspaceSettings'];
  updateWorkspaceSettings: OrdoApiClient['updateWorkspaceSettings'];
  getWorkspaceAuditLogs: OrdoApiClient['getWorkspaceAuditLogs'];
  createAuditLog: OrdoApiClient['createAuditLog'];
  archiveWorkspace: OrdoApiClient['archiveWorkspace'];

  // Workflow
  getWorkflows: OrdoApiClient['getWorkflows'];
  createWorkflow: OrdoApiClient['createWorkflow'];
  updateWorkflow: OrdoApiClient['updateWorkflow'];
  deleteWorkflow: OrdoApiClient['deleteWorkflow'];

  // Project
  getProjects: OrdoApiClient['getProjects'];
  getAllProjects: OrdoApiClient['getAllProjects'];
  getProject: OrdoApiClient['getProject'];
  getProjectBySlugs: OrdoApiClient['getProjectBySlugs'];
  createProject: OrdoApiClient['createProject'];
  updateProject: OrdoApiClient['updateProject'];
  archiveProject: OrdoApiClient['archiveProject'];
  completeProject: OrdoApiClient['completeProject'];
  deleteProject: OrdoApiClient['deleteProject'];

  // Task
  getTasks: OrdoApiClient['getTasks'];
  getTask: OrdoApiClient['getTask'];
  getTaskDetails: OrdoApiClient['getTaskDetails'];
  createTask: OrdoApiClient['createTask'];
  updateTask: OrdoApiClient['updateTask'];
  completeTask: OrdoApiClient['completeTask'];
  deleteTask: OrdoApiClient['deleteTask'];
  createSubtask: OrdoApiClient['createSubtask'];

  // Task sharing
  generatePublicToken: OrdoApiClient['generatePublicToken'];
  getTaskByPublicToken: OrdoApiClient['getTaskByPublicToken'];

  // Time Blocking
  getTimeBlocks: OrdoApiClient['getTimeBlocks'];

  // Tag
  getTags: OrdoApiClient['getTags'];
  getTaskTags: OrdoApiClient['getTaskTags'];
  createTag: OrdoApiClient['createTag'];
  assignTagToTask: OrdoApiClient['assignTagToTask'];
  removeTagFromTask: OrdoApiClient['removeTagFromTask'];
  deleteTag: OrdoApiClient['deleteTag'];

  // Extended tag methods
  updateTag: OrdoApiClient['updateTag'];

  // Timer
  startTimer: OrdoApiClient['startTimer'];
  stopTimer: OrdoApiClient['stopTimer'];
  getActiveTimer: OrdoApiClient['getActiveTimer'];
  pauseTimer: OrdoApiClient['pauseTimer'];
  resumeTimer: OrdoApiClient['resumeTimer'];
  switchTask: OrdoApiClient['switchTask'];
  getSessionHistory: OrdoApiClient['getSessionHistory'];
  getTimerStats: OrdoApiClient['getTimerStats'];
  getTaskTimeSessions: OrdoApiClient['getTaskTimeSessions'];

  // Analytics
  getDailyMetrics: OrdoApiClient['getDailyMetrics'];
  getWeeklyMetrics: OrdoApiClient['getWeeklyMetrics'];
  getDashboardStats: OrdoApiClient['getDashboardStats'];
  getHeatmapData: OrdoApiClient['getHeatmapData'];
  getProjectDistribution: OrdoApiClient['getProjectDistribution'];
  getTaskStatusDistribution: OrdoApiClient['getTaskStatusDistribution'];

  // Extended analytics
  getMonthlyMetrics: OrdoApiClient['getMonthlyMetrics'];
  getDateRangeMetrics: OrdoApiClient['getDateRangeMetrics'];

  // AI
  getAIProfile: OrdoApiClient['getAIProfile'];
  getOptimalSchedule: OrdoApiClient['getOptimalSchedule'];
  predictTaskDuration: OrdoApiClient['predictTaskDuration'];
  generateWeeklyReport: OrdoApiClient['generateWeeklyReport'];
  getReports: OrdoApiClient['getReports'];
  getReport: OrdoApiClient['getReport'];
  deleteReport: OrdoApiClient['deleteReport'];

  // Comments
  getTaskComments: OrdoApiClient['getTaskComments'];
  createComment: OrdoApiClient['createComment'];
  updateComment: OrdoApiClient['updateComment'];
  deleteComment: OrdoApiClient['deleteComment'];

  // Attachments
  getTaskAttachments: OrdoApiClient['getTaskAttachments'];
  createAttachment: OrdoApiClient['createAttachment'];
  deleteAttachment: OrdoApiClient['deleteAttachment'];

  // Extended attachments
  getProjectAttachments: OrdoApiClient['getProjectAttachments'];

  // Notifications
  getNotifications: OrdoApiClient['getNotifications'];
  getUnreadNotificationsCount: OrdoApiClient['getUnreadNotificationsCount'];
  markNotificationAsRead: OrdoApiClient['markNotificationAsRead'];
  markAllNotificationsAsRead: OrdoApiClient['markAllNotificationsAsRead'];

  // Habits
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

  // Objectives (OKRs)
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

  // Notes
  getNotes: OrdoApiClient['getNotes'];
  getNote: OrdoApiClient['getNote'];
  createNote: OrdoApiClient['createNote'];
  updateNote: OrdoApiClient['updateNote'];
  deleteNote: OrdoApiClient['deleteNote'];

  // Custom Fields

  getProjectCustomFields: OrdoApiClient['getProjectCustomFields'];
  createCustomField: OrdoApiClient['createCustomField'];
  updateCustomField: OrdoApiClient['updateCustomField'];
  deleteCustomField: OrdoApiClient['deleteCustomField'];
  getTaskCustomValues: OrdoApiClient['getTaskCustomValues'];
  setTaskCustomValues: OrdoApiClient['setTaskCustomValues'];

  // Creator OS - Ideas
  getIdeas: (params?: { status?: string; search?: string; page?: number; limit?: number }) =>
    Promise<{ data: Idea[]; total: number; page: number; limit: number }>;
  getIdea: (id: string) => Promise<Idea>;
  createIdea: (data: CreateIdeaDto) => Promise<Idea>;
  updateIdea: (id: string, data: UpdateIdeaDto) => Promise<Idea>;
  deleteIdea: (id: string) => Promise<void>;
  archiveIdea: (id: string) => Promise<Idea>;

  // Creator OS - Content Pieces
  getContentPieces: (params?: {
    status?: string;
    seriesId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => Promise<{ data: ContentPiece[]; total: number; page: number; limit: number }>;
  getContentPiece: (id: string) => Promise<ContentPiece>;
  getContentPipeline: () => Promise<{
    scripting: ContentPiece[];
    filming: ContentPiece[];
    editing: ContentPiece[];
    scheduled: ContentPiece[];
    published: ContentPiece[];
  }>;
  createContentPiece: (data: CreateContentPieceDto) => Promise<ContentPiece>;
  promoteFromIdea: (ideaId: string, data: CreateContentPieceDto) => Promise<ContentPiece>;
  updateContentPiece: (id: string, data: UpdateContentPieceDto) => Promise<ContentPiece>;
  updateContentStatus: (id: string, status: string) => Promise<ContentPiece>;
  deleteContentPiece: (id: string) => Promise<void>;

  // Creator OS - Series
  getSeries: () => Promise<any[]>;
  getSeriesById: (id: string) => Promise<any>;
  createSeries: (data: any) => Promise<any>;

  // Creator OS - Publishing
  createSocialPost: (data: CreateSocialPostDto) => Promise<SocialPost>;
  bulkSchedulePosts: (data: BulkScheduleDto) => Promise<SocialPost[]>;
  getScheduledPosts: (params: {
    from?: string;
    to?: string;
    platform?: ContentPlatform;
    page?: number;
    limit?: number;
  }) => Promise<SocialPostsListResponse>;
  getPublishingCalendar: (startDate: string, endDate: string) => Promise<SocialPost[]>;
  getPostsByContentPiece: (contentPieceId: string) => Promise<SocialPost[]>;
  getSocialPost: (id: string) => Promise<SocialPost>;
  updateSocialPost: (id: string, data: UpdateSocialPostDto) => Promise<SocialPost>;
  schedulePost: (id: string, scheduledAt: string) => Promise<SocialPost>;
  unschedulePost: (id: string) => Promise<SocialPost>;
  deleteSocialPost: (id: string) => Promise<void>;
};

/**
 * Creator OS Types
 */



/**
 * Configuration for creating hooks
 */
export interface CreateHooksConfig {
  /**
   * The API client instance to use for all requests
   */
  apiClient: ApiClient;
}
