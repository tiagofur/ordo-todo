"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  AIProfile: () => AIProfile,
  AcceptInvitationUseCase: () => AcceptInvitationUseCase,
  Account: () => Account,
  Achievement: () => Achievement,
  ActionItem: () => ActionItem,
  Activity: () => Activity,
  ActivityType: () => ActivityType,
  AddMemberToWorkspaceUseCase: () => AddMemberToWorkspaceUseCase,
  AddMentionUseCase: () => AddMentionUseCase,
  AdminUser: () => AdminUser,
  AmbientTrack: () => AmbientTrack,
  AnalyzeTranscriptUseCase: () => AnalyzeTranscriptUseCase,
  ArchiveProjectUseCase: () => ArchiveProjectUseCase,
  ArchiveWorkspaceUseCase: () => ArchiveWorkspaceUseCase,
  AskQuestionUseCase: () => AskQuestionUseCase,
  AssignTagToTaskUseCase: () => AssignTagToTaskUseCase,
  Attachment: () => Attachment,
  BlogComment: () => BlogComment,
  BlogPost: () => BlogPost,
  COMMENT_LIMITS: () => COMMENT_LIMITS,
  CalculateFocusScoreUseCase: () => CalculateFocusScoreUseCase,
  ChangeUserName: () => ChangeUserName,
  ChangelogEntry: () => ChangelogEntry,
  ChatConversation: () => ChatConversation,
  ChatMessage: () => ChatMessage,
  Comment: () => Comment,
  CompleteTaskUseCase: () => CompleteTaskUseCase,
  ContactSubmission: () => ContactSubmission,
  CountUnreadNotificationsUseCase: () => CountUnreadNotificationsUseCase,
  CreateAttachmentUseCase: () => CreateAttachmentUseCase,
  CreateAuditLogUseCase: () => CreateAuditLogUseCase,
  CreateCommentUseCase: () => CreateCommentUseCase,
  CreateMeetingUseCase: () => CreateMeetingUseCase,
  CreateNoteUseCase: () => CreateNoteUseCase,
  CreateNotificationUseCase: () => CreateNotificationUseCase,
  CreateProjectUseCase: () => CreateProjectUseCase,
  CreateRecurrenceUseCase: () => CreateRecurrenceUseCase,
  CreateTagUseCase: () => CreateTagUseCase,
  CreateTaskUseCase: () => CreateTaskUseCase,
  CreateWorkflowUseCase: () => CreateWorkflowUseCase,
  CreateWorkspaceUseCase: () => CreateWorkspaceUseCase,
  CustomField: () => CustomField,
  CustomFieldType: () => CustomFieldType,
  CustomFieldValue: () => CustomFieldValue,
  DEFAULT_POMODORO_SETTINGS: () => DEFAULT_POMODORO_SETTINGS,
  DailyMetrics: () => DailyMetrics,
  DeleteAttachmentUseCase: () => DeleteAttachmentUseCase,
  DeleteCommentUseCase: () => DeleteCommentUseCase,
  DeleteNoteUseCase: () => DeleteNoteUseCase,
  DeleteNotificationUseCase: () => DeleteNotificationUseCase,
  DeleteProjectUseCase: () => DeleteProjectUseCase,
  DeleteWorkflowUseCase: () => DeleteWorkflowUseCase,
  Email: () => Email,
  Entity: () => Entity,
  ExecuteSearchUseCase: () => ExecuteSearchUseCase,
  ExtractActionItemsUseCase: () => ExtractActionItemsUseCase,
  FAQ: () => FAQ,
  FILE_LIMITS: () => FILE_LIMITS,
  FindAllNotesUseCase: () => FindAllNotesUseCase,
  FindNoteUseCase: () => FindNoteUseCase,
  FocusMode: () => FocusMode,
  FocusPreferences: () => FocusPreferences,
  FocusStats: () => FocusStats,
  GenerateSummaryUseCase: () => GenerateSummaryUseCase,
  GenerateWeeklyReportUseCase: () => GenerateWeeklyReportUseCase,
  GetAttachmentByIdUseCase: () => GetAttachmentByIdUseCase,
  GetAttachmentsByTaskUseCase: () => GetAttachmentsByTaskUseCase,
  GetAttachmentsByUserUseCase: () => GetAttachmentsByUserUseCase,
  GetCommentsByTaskUseCase: () => GetCommentsByTaskUseCase,
  GetCommentsByUserUseCase: () => GetCommentsByUserUseCase,
  GetDailyMetricsUseCase: () => GetDailyMetricsUseCase,
  GetDeletedProjectsUseCase: () => GetDeletedProjectsUseCase,
  GetDeletedTasksUseCase: () => GetDeletedTasksUseCase,
  GetDeletedWorkspacesUseCase: () => GetDeletedWorkspacesUseCase,
  GetFocusStatsUseCase: () => GetFocusStatsUseCase,
  GetMeetingUseCase: () => GetMeetingUseCase,
  GetNextOccurrenceUseCase: () => GetNextOccurrenceUseCase,
  GetNotificationByIdUseCase: () => GetNotificationByIdUseCase,
  GetNotificationsByTypeUseCase: () => GetNotificationsByTypeUseCase,
  GetOptimalScheduleUseCase: () => GetOptimalScheduleUseCase,
  GetRecommendedTracksUseCase: () => GetRecommendedTracksUseCase,
  GetSuggestionsUseCase: () => GetSuggestionsUseCase,
  GetTaskActivitiesUseCase: () => GetTaskActivitiesUseCase,
  GetUnreadNotificationsUseCase: () => GetUnreadNotificationsUseCase,
  GetUserPreferencesUseCase: () => GetUserPreferencesUseCase,
  GetUserSubscriptionUseCase: () => GetUserSubscriptionUseCase,
  GetWorkspaceAuditLogsUseCase: () => GetWorkspaceAuditLogsUseCase,
  GetWorkspaceSettingsUseCase: () => GetWorkspaceSettingsUseCase,
  Habit: () => Habit,
  HashPassword: () => HashPassword,
  Id: () => Id,
  ImageSpecs: () => ImageSpecs,
  IntegrationProvider: () => IntegrationProvider,
  InviteMemberUseCase: () => InviteMemberUseCase,
  KBArticle: () => KBArticle,
  KBCategory: () => KBCategory,
  KeyDecision: () => KeyDecision,
  KeyResult: () => KeyResult,
  KeyResultTask: () => KeyResultTask,
  LearnFromSessionUseCase: () => LearnFromSessionUseCase,
  ListMeetingsUseCase: () => ListMeetingsUseCase,
  ListWorkflowsUseCase: () => ListWorkflowsUseCase,
  LogActivityUseCase: () => LogActivityUseCase,
  MEMBER_ROLES: () => MEMBER_ROLES,
  MarkAllAsReadUseCase: () => MarkAllAsReadUseCase,
  MarkAsReadUseCase: () => MarkAsReadUseCase,
  MarkAsUnreadUseCase: () => MarkAsUnreadUseCase,
  MarkAsUploadedUseCase: () => MarkAsUploadedUseCase,
  Meeting: () => Meeting,
  MeetingAnalysis: () => MeetingAnalysis,
  MeetingParticipant: () => MeetingParticipant,
  MeetingTopic: () => MeetingTopic,
  MemberRole: () => MemberRole,
  MockAIService: () => MockAIService,
  NOTIFICATION_LIMITS: () => NOTIFICATION_LIMITS,
  NewsletterSubscriber: () => NewsletterSubscriber,
  Note: () => Note,
  Notification: () => Notification,
  NotificationType: () => NotificationType,
  Objective: () => Objective,
  PAGINATION_LIMITS: () => PAGINATION_LIMITS,
  PRIORITY_VALUES: () => PRIORITY_VALUES,
  PROJECT_COLORS: () => PROJECT_COLORS,
  PROJECT_LIMITS: () => PROJECT_LIMITS,
  PROJECT_STATUS: () => PROJECT_STATUS,
  PROJECT_STATUS_VALUES: () => PROJECT_STATUS_VALUES,
  PauseTimerUseCase: () => PauseTimerUseCase,
  PermanentDeleteProjectUseCase: () => PermanentDeleteProjectUseCase,
  PermanentDeleteTaskUseCase: () => PermanentDeleteTaskUseCase,
  PermanentDeleteWorkspaceUseCase: () => PermanentDeleteWorkspaceUseCase,
  PersonName: () => PersonName,
  PredictTaskDurationUseCase: () => PredictTaskDurationUseCase,
  ProcessedImage: () => ProcessedImage,
  ProductivityReport: () => ProductivityReport,
  Project: () => Project,
  RecordTrackUsageUseCase: () => RecordTrackUsageUseCase,
  Recurrence: () => Recurrence,
  RecurrencePattern: () => RecurrencePattern,
  RegisterUser: () => RegisterUser,
  RemoveMemberFromWorkspaceUseCase: () => RemoveMemberFromWorkspaceUseCase,
  RemoveMentionUseCase: () => RemoveMentionUseCase,
  RemoveTagFromTaskUseCase: () => RemoveTagFromTaskUseCase,
  RequiredString: () => RequiredString,
  ResourceType: () => ResourceType,
  RestoreProjectUseCase: () => RestoreProjectUseCase,
  RestoreTaskUseCase: () => RestoreTaskUseCase,
  RestoreWorkspaceUseCase: () => RestoreWorkspaceUseCase,
  ResumeTimerUseCase: () => ResumeTimerUseCase,
  RoadmapItem: () => RoadmapItem,
  RoadmapVote: () => RoadmapVote,
  SearchQuery: () => SearchQuery,
  SearchResult: () => SearchResult,
  SearchResults: () => SearchResults,
  Session: () => Session,
  SoftDeleteProjectUseCase: () => SoftDeleteProjectUseCase,
  SoftDeleteTaskUseCase: () => SoftDeleteTaskUseCase,
  SoftDeleteWorkspaceUseCase: () => SoftDeleteWorkspaceUseCase,
  StartTimerUseCase: () => StartTimerUseCase,
  StopTimerUseCase: () => StopTimerUseCase,
  Subscription: () => Subscription,
  SubscriptionPlan: () => SubscriptionPlan,
  SubscriptionStatus: () => SubscriptionStatus,
  SwitchTaskUseCase: () => SwitchTaskUseCase,
  TAG_COLORS: () => TAG_COLORS,
  TAG_LIMITS: () => TAG_LIMITS,
  TASK_LIMITS: () => TASK_LIMITS,
  TASK_PRIORITIES: () => TASK_PRIORITIES,
  TASK_STATUS: () => TASK_STATUS,
  TASK_STATUS_VALUES: () => TASK_STATUS_VALUES,
  TIMER_LIMITS: () => TIMER_LIMITS,
  TIMER_MODES: () => TIMER_MODES,
  TIMER_MODE_VALUES: () => TIMER_MODE_VALUES,
  Tag: () => Tag,
  Task: () => Task,
  TaskDependency: () => TaskDependency,
  TaskTemplate: () => TaskTemplate,
  TimeSession: () => TimeSession,
  ToggleFavoriteTrackUseCase: () => ToggleFavoriteTrackUseCase,
  USER_LIMITS: () => USER_LIMITS,
  UpdateCommentUseCase: () => UpdateCommentUseCase,
  UpdateDailyMetricsUseCase: () => UpdateDailyMetricsUseCase,
  UpdateMeetingAnalysisUseCase: () => UpdateMeetingAnalysisUseCase,
  UpdateNoteUseCase: () => UpdateNoteUseCase,
  UpdateProjectUseCase: () => UpdateProjectUseCase,
  UpdateTagUseCase: () => UpdateTagUseCase,
  UpdateUserPreferencesUseCase: () => UpdateUserPreferencesUseCase,
  UpdateWorkflowUseCase: () => UpdateWorkflowUseCase,
  UpdateWorkspaceSettingsUseCase: () => UpdateWorkspaceSettingsUseCase,
  UpgradePlanUseCase: () => UpgradePlanUseCase,
  User: () => User,
  UserAchievement: () => UserAchievement,
  UserByEmail: () => UserByEmail,
  UserIntegration: () => UserIntegration,
  UserLogin: () => UserLogin,
  WORKSPACE_COLORS: () => WORKSPACE_COLORS,
  WORKSPACE_LIMITS: () => WORKSPACE_LIMITS,
  WORKSPACE_TYPES: () => WORKSPACE_TYPES,
  Workflow: () => Workflow,
  Workspace: () => Workspace,
  WorkspaceAuditLog: () => WorkspaceAuditLog,
  WorkspaceInvitation: () => WorkspaceInvitation,
  WorkspaceMember: () => WorkspaceMember,
  WorkspaceSettings: () => WorkspaceSettings,
  acceptInvitationSchema: () => acceptInvitationSchema,
  addAlpha: () => addAlpha,
  addDays: () => addDays,
  addHours: () => addHours,
  addMinutes: () => addMinutes,
  aiService: () => aiService,
  archiveProjectSchema: () => archiveProjectSchema,
  assignTagsSchema: () => assignTagsSchema,
  bulkUpdateTasksSchema: () => bulkUpdateTasksSchema,
  calculateAverageCompletionTime: () => calculateAverageCompletionTime,
  calculateAverageTime: () => calculateAverageTime,
  calculateBurndownRate: () => calculateBurndownRate,
  calculateCompletionRate: () => calculateCompletionRate,
  calculateEfficiency: () => calculateEfficiency,
  calculateEstimatedCompletion: () => calculateEstimatedCompletion,
  calculateFocusScore: () => calculateFocusScore,
  calculatePercentile: () => calculatePercentile,
  calculateProductivityScore: () => calculateProductivityScore,
  calculateProgress: () => calculateProgress,
  calculateProjectHealth: () => calculateProjectHealth,
  calculateStreak: () => calculateStreak,
  calculateTimeUtilization: () => calculateTimeUtilization,
  calculateTotalTimeWorked: () => calculateTotalTimeWorked,
  calculateVelocity: () => calculateVelocity,
  calculateVoteWeight: () => calculateVoteWeight,
  calculateWeightedAverage: () => calculateWeightedAverage,
  camelToTitle: () => camelToTitle,
  capitalize: () => capitalize,
  capitalizeWords: () => capitalizeWords,
  categorizeTasksByAvailability: () => categorizeTasksByAvailability,
  changePasswordSchema: () => changePasswordSchema,
  commentBaseSchema: () => commentBaseSchema,
  commentFilterSchema: () => commentFilterSchema,
  countWords: () => countWords,
  createCommentSchema: () => createCommentSchema,
  createProjectSchema: () => createProjectSchema,
  createTagSchema: () => createTagSchema,
  createTaskSchema: () => createTaskSchema,
  createWorkspaceSchema: () => createWorkspaceSchema,
  darkenColor: () => darkenColor,
  duplicateProjectSchema: () => duplicateProjectSchema,
  endOfDay: () => endOfDay,
  endOfWeek: () => endOfWeek,
  formatDate: () => formatDate,
  formatDateShort: () => formatDateShort,
  formatDuration: () => formatDuration,
  formatDurationFromSeconds: () => formatDurationFromSeconds,
  formatFileSize: () => formatFileSize,
  formatNumber: () => formatNumber,
  formatRelativeTime: () => formatRelativeTime,
  formatScheduledDateTime: () => formatScheduledDateTime,
  formatTimeOfDay: () => formatTimeOfDay,
  formatTimerDisplay: () => formatTimerDisplay,
  formatTimerDisplayExtended: () => formatTimerDisplayExtended,
  generateId: () => generateId,
  generatePalette: () => generatePalette,
  generateRandomString: () => generateRandomString,
  generateSlug: () => generateSlug,
  generateUuid: () => generateUuid,
  getColorWithOpacity: () => getColorWithOpacity,
  getContrastColor: () => getContrastColor,
  getCurrentTime: () => getCurrentTime,
  getDaysDiff: () => getDaysDiff,
  getInitials: () => getInitials,
  getPriorityColor: () => getPriorityColor,
  getPriorityConfig: () => getPriorityConfig,
  getPriorityLabel: () => getPriorityLabel,
  getTaskStatusColor: () => getTaskStatusColor,
  getTaskStatusConfig: () => getTaskStatusConfig,
  getTaskStatusLabel: () => getTaskStatusLabel,
  getTimerModeColor: () => getTimerModeColor,
  getTimerModeConfig: () => getTimerModeConfig,
  getTimerModeDefaultDuration: () => getTimerModeDefaultDuration,
  getTimerModeLabel: () => getTimerModeLabel,
  getWorkableTasks: () => getWorkableTasks,
  hexToRgb: () => hexToRgb,
  hexToRgba: () => hexToRgba,
  highlightSearchTerms: () => highlightSearchTerms,
  hoursToMinutes: () => hoursToMinutes,
  inviteMemberSchema: () => inviteMemberSchema,
  isAfter: () => isAfter,
  isAllowedFileType: () => isAllowedFileType,
  isAlphanumeric: () => isAlphanumeric,
  isBefore: () => isBefore,
  isDarkColor: () => isDarkColor,
  isDueToday: () => isDueToday,
  isFuture: () => isFuture,
  isImageFile: () => isImageFile,
  isLightColor: () => isLightColor,
  isOverdue: () => isOverdue,
  isPast: () => isPast,
  isScheduledForToday: () => isScheduledForToday,
  isTaskAvailable: () => isTaskAvailable,
  isTaskCompleted: () => isTaskCompleted,
  isTaskInProgress: () => isTaskInProgress,
  isToday: () => isToday,
  isValidEmail: () => isValidEmail,
  isValidUrl: () => isValidUrl,
  isValidUuid: () => isValidUuid,
  isWorkingHours: () => isWorkingHours,
  lightenColor: () => lightenColor,
  loginUserSchema: () => loginUserSchema,
  minutesToHours: () => minutesToHours,
  minutesToSeconds: () => minutesToSeconds,
  mixColors: () => mixColors,
  normalizeWhitespace: () => normalizeWhitespace,
  parseDuration: () => parseDuration,
  pluralize: () => pluralize,
  projectBaseSchema: () => projectBaseSchema,
  projectFilterSchema: () => projectFilterSchema,
  randomColor: () => randomColor,
  registerUserSchema: () => registerUserSchema,
  reorderTasksSchema: () => reorderTasksSchema,
  resetPasswordRequestSchema: () => resetPasswordRequestSchema,
  resetPasswordSchema: () => resetPasswordSchema,
  rgbToHex: () => rgbToHex,
  sanitizeHtml: () => sanitizeHtml,
  secondsToMinutes: () => secondsToMinutes,
  shouldTakeLongBreak: () => shouldTakeLongBreak,
  snakeToTitle: () => snakeToTitle,
  startOfDay: () => startOfDay,
  startOfToday: () => startOfToday,
  startOfWeek: () => startOfWeek,
  stripHtmlTags: () => stripHtmlTags,
  tagBaseSchema: () => tagBaseSchema,
  tagFilterSchema: () => tagFilterSchema,
  taskBaseSchema: () => taskBaseSchema,
  taskDatesSchema: () => taskDatesSchema,
  taskFilterSchema: () => taskFilterSchema,
  transferOwnershipSchema: () => transferOwnershipSchema,
  truncate: () => truncate,
  updateCommentSchema: () => updateCommentSchema,
  updateMemberRoleSchema: () => updateMemberRoleSchema,
  updateProjectSchema: () => updateProjectSchema,
  updateTagSchema: () => updateTagSchema,
  updateTaskSchema: () => updateTaskSchema,
  updateUserProfileSchema: () => updateUserProfileSchema,
  updateWorkspaceSchema: () => updateWorkspaceSchema,
  userPreferencesSchema: () => userPreferencesSchema,
  usernameValidationSchema: () => usernameValidationSchema,
  workspaceBaseSchema: () => workspaceBaseSchema,
  workspaceFilterSchema: () => workspaceFilterSchema,
  workspaceSettingsSchema: () => workspaceSettingsSchema
});
module.exports = __toCommonJS(index_exports);

// src/shared/email.vo.ts
var Email = class _Email {
  _value;
  constructor(value) {
    this._value = value;
  }
  static create(email3) {
    const finalEmail = email3?.trim?.().toLowerCase();
    this.validate(finalEmail);
    return new _Email(finalEmail);
  }
  static validate(email3) {
    if (!email3 || typeof email3 !== "string") {
      throw new Error("O email n\xE3o pode estar vazio");
    }
    if (email3.length > 254) {
      throw new Error("O email deve ter no m\xE1ximo 254 caracteres");
    }
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-\u00A0-\uFFFF]+@[a-zA-Z0-9\u00A0-\uFFFF](?:[a-zA-Z0-9\u00A0-\uFFFF-]{0,61}[a-zA-Z0-9\u00A0-\uFFFF])?(?:\.[a-zA-Z0-9\u00A0-\uFFFF](?:[a-zA-Z0-9\u00A0-\uFFFF-]{0,61}[a-zA-Z0-9\u00A0-\uFFFF])?)*$/;
    if (!emailRegex.test(email3)) {
      throw new Error("O formato do email \xE9 inv\xE1lido");
    }
    const [localPart, domainPart] = email3.split("@");
    if (localPart && localPart.includes("..")) {
      throw new Error(
        "O email n\xE3o pode conter pontos consecutivos na parte local"
      );
    }
    if (localPart && (localPart.startsWith(".") || localPart.endsWith("."))) {
      throw new Error(
        "O email n\xE3o pode come\xE7ar ou terminar com ponto na parte local"
      );
    }
  }
  get value() {
    return this._value;
  }
  get localPart() {
    return this._value.split("@")[0];
  }
  get domain() {
    return this._value.split("@")[1];
  }
  equals(other) {
    if (!(other instanceof _Email)) {
      return false;
    }
    return this._value === other._value;
  }
  toString() {
    return this._value;
  }
  toJSON() {
    return this._value;
  }
};

// src/shared/hash-password.vo.ts
var HashPassword = class _HashPassword {
  _value;
  constructor(value) {
    this._value = value;
  }
  static create(hashPassword) {
    this.validate(hashPassword);
    return new _HashPassword(hashPassword.trim());
  }
  static validate(hashPassword) {
    if (!hashPassword || typeof hashPassword !== "string") {
      throw new Error("O hash da senha n\xE3o pode estar vazio");
    }
    const trimmedHash = hashPassword.trim();
    if (trimmedHash.length === 0) {
      throw new Error("O hash da senha n\xE3o pode estar vazio");
    }
    const bcryptRegex = /^\$2[abxy]\$\d{2}\$[A-Za-z0-9.\/]{53}$/;
    if (!bcryptRegex.test(trimmedHash)) {
      throw new Error("A senha deve estar criptografada");
    }
  }
  get value() {
    return this._value;
  }
  get algorithm() {
    return this._value.split("$")[1];
  }
  get cost() {
    return parseInt(this._value.split("$")[2], 10);
  }
  equals(other) {
    if (!(other instanceof _HashPassword)) {
      return false;
    }
    return this._value === other._value;
  }
  toString() {
    return this._value;
  }
  toJSON() {
    return this._value;
  }
};

// src/shared/person-name.vo.ts
var PersonName = class _PersonName {
  _value;
  constructor(value) {
    this._value = value;
  }
  static create(name) {
    this.validate(name);
    return new _PersonName(name.trim());
  }
  static validate(name) {
    if (!name || typeof name !== "string") {
      throw new Error("O nome \xE9 obrigat\xF3rio e deve ser uma string");
    }
    const trimmedName = name.trim();
    if (trimmedName.length < 3) {
      throw new Error("O nome deve ter pelo menos 3 caracteres");
    }
    if (trimmedName.length > 120) {
      throw new Error("O nome deve ter no m\xE1ximo 120 caracteres");
    }
    const validNameRegex = /^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\s'-]+$/;
    if (!validNameRegex.test(trimmedName)) {
      throw new Error(
        "O nome cont\xE9m caracteres inv\xE1lidos. Apenas letras, espa\xE7os, ap\xF3strofes e h\xEDfens s\xE3o permitidos"
      );
    }
    const nameParts = trimmedName.split(/\s+/).filter((part) => part.length > 0);
    if (nameParts.length < 2) {
      throw new Error("O nome deve conter pelo menos um nome e um sobrenome");
    }
    if (/\s{2,}/.test(trimmedName)) {
      throw new Error("O nome n\xE3o pode conter espa\xE7os m\xFAltiplos consecutivos");
    }
    if (/^[-'\s]|[-'\s]$/.test(trimmedName)) {
      throw new Error(
        "O nome n\xE3o pode come\xE7ar ou terminar com espa\xE7os, h\xEDfens ou ap\xF3strofes"
      );
    }
  }
  get value() {
    return this._value;
  }
  get firstName() {
    const firstName = this._value.split(" ")[0];
    return firstName;
  }
  get lastName() {
    const parts = this._value.split(" ");
    const lastName = parts[parts.length - 1];
    return lastName;
  }
  get fullName() {
    return this._value;
  }
  get initials() {
    const nameParts = this.value.trim().split(/\s+/).filter((part) => part.length > 0);
    return (this.firstName.charAt(0) + this.lastName.charAt(0)).toUpperCase();
  }
  equals(other) {
    if (!(other instanceof _PersonName)) {
      return false;
    }
    return this._value.toLowerCase() === other._value.toLowerCase();
  }
  toString() {
    return this._value;
  }
  toJSON() {
    return this._value;
  }
  toFormattedString() {
    return this._value.split(" ").map((name) => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()).join(" ");
  }
};

// src/shared/uuid.util.ts
function generateUuid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
}
function isValidUuid(uuid3) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid3);
}

// src/shared/id.vo.ts
var Id = class _Id {
  _value;
  constructor(value) {
    this._value = value;
  }
  static create(id) {
    const value = id?.trim().toLowerCase() ?? generateUuid();
    this.validate(value);
    return new _Id(value);
  }
  static validate(id) {
    if (!isValidUuid(id)) {
      throw new Error("O id fornecido n\xE3o \xE9 um UUID v\xE1lido.");
    }
  }
  get value() {
    return this._value;
  }
  equals(other) {
    return other instanceof _Id && this._value === other._value;
  }
  toString() {
    return this._value;
  }
  toJSON() {
    return this._value;
  }
};

// src/shared/entity.ts
var Entity = class _Entity {
  props;
  mode = "valid";
  id;
  constructor(props, mode = "valid") {
    this.props = Object.freeze({
      ...props,
      id: props.id ? props.id : Id.create().value
    });
    this.mode = mode;
    this.id = this.props.id;
    if ("props" in props) {
      throw new Error("Props should not contain 'props' property");
    }
  }
  get data() {
    return this.props;
  }
  isDraft() {
    return this.mode === "draft";
  }
  isValid() {
    return this.mode === "valid";
  }
  equals(entity) {
    if (entity == null) return false;
    if (!(entity instanceof _Entity)) return false;
    if (this === entity) return true;
    if (this.constructor !== entity.constructor) return false;
    return this.sameId(entity);
  }
  notEquals(entity) {
    return !this.equals(entity);
  }
  sameId(other) {
    return this.id === other.id;
  }
  asDraft() {
    return this.clone(this.props, "draft");
  }
  asValid() {
    return this.clone(this.props, "valid");
  }
  clone(newProps, newMode = this.mode) {
    const Self = this.constructor;
    return new Self(
      {
        ...this.props,
        ...newProps
      },
      newMode
    );
  }
};

// src/shared/required-string.vo.ts
var RequiredString = class _RequiredString {
  _value;
  constructor(value) {
    this._value = value;
  }
  static create(value, options) {
    this.validate(value, options);
    return new _RequiredString(value.trim());
  }
  static validate(value, options) {
    const errorMessage = options?.errorMessage || `${options?.attributeName ?? "Valor"} \xE9 obrigat\xF3rio`;
    if (!value || typeof value !== "string") {
      throw new Error(errorMessage);
    }
    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
      throw new Error(errorMessage);
    }
    if (options?.minLength && trimmedValue.length < options.minLength) {
      throw new Error(
        `${options.attributeName ?? `"${value}"`} deve ter pelo menos ${options.minLength} caracteres`
      );
    }
    if (options?.maxLength && trimmedValue.length > options.maxLength) {
      throw new Error(
        `${options.attributeName ?? `"${value}"`} deve ter no m\xE1ximo ${options.maxLength} caracteres`
      );
    }
  }
  get value() {
    return this._value;
  }
  equals(other) {
    return other instanceof _RequiredString && this._value === other._value;
  }
  toString() {
    return this._value;
  }
  toJSON() {
    return this._value;
  }
};

// src/shared/constants/colors.constants.ts
var PROJECT_COLORS = [
  "#EF4444",
  // red
  "#F59E0B",
  // amber
  "#10B981",
  // emerald
  "#3B82F6",
  // blue
  "#8B5CF6",
  // violet
  "#EC4899",
  // pink
  "#6B7280"
  // gray
];
var TAG_COLORS = [
  "#EF4444",
  // red
  "#F59E0B",
  // amber
  "#10B981",
  // emerald
  "#3B82F6",
  // blue
  "#8B5CF6",
  // violet
  "#EC4899",
  // pink
  "#06B6D4",
  // cyan
  "#F43F5E",
  // rose
  "#84CC16",
  // lime
  "#6366F1"
  // indigo
];
var WORKSPACE_COLORS = {
  PERSONAL: "#06B6D4",
  // cyan
  WORK: "#8B5CF6",
  // violet/purple
  TEAM: "#EC4899"
  // pink
};

// src/shared/constants/priorities.constants.ts
var TASK_PRIORITIES = {
  LOW: {
    value: "LOW",
    label: "Low",
    color: "#10B981",
    // emerald
    order: 1
  },
  MEDIUM: {
    value: "MEDIUM",
    label: "Medium",
    color: "#F59E0B",
    // amber
    order: 2
  },
  HIGH: {
    value: "HIGH",
    label: "High",
    color: "#EF4444",
    // red
    order: 3
  }
};
var PRIORITY_VALUES = ["LOW", "MEDIUM", "HIGH"];
function getPriorityConfig(priority) {
  return TASK_PRIORITIES[priority];
}
function getPriorityColor(priority) {
  return TASK_PRIORITIES[priority].color;
}
function getPriorityLabel(priority) {
  return TASK_PRIORITIES[priority].label;
}

// src/shared/constants/status.constants.ts
var TASK_STATUS = {
  TODO: {
    value: "TODO",
    label: "To Do",
    color: "#6B7280",
    // gray
    order: 1
  },
  IN_PROGRESS: {
    value: "IN_PROGRESS",
    label: "In Progress",
    color: "#3B82F6",
    // blue
    order: 2
  },
  IN_REVIEW: {
    value: "IN_REVIEW",
    label: "In Review",
    color: "#F59E0B",
    // amber
    order: 3
  },
  DONE: {
    value: "DONE",
    label: "Done",
    color: "#10B981",
    // emerald
    order: 4
  },
  CANCELLED: {
    value: "CANCELLED",
    label: "Cancelled",
    color: "#EF4444",
    // red
    order: 5
  }
};
var TASK_STATUS_VALUES = [
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
  "CANCELLED"
];
var PROJECT_STATUS = {
  ACTIVE: {
    value: "ACTIVE",
    label: "Active",
    color: "#10B981"
    // emerald
  },
  ARCHIVED: {
    value: "ARCHIVED",
    label: "Archived",
    color: "#6B7280"
    // gray
  },
  ON_HOLD: {
    value: "ON_HOLD",
    label: "On Hold",
    color: "#F59E0B"
    // amber
  }
};
var PROJECT_STATUS_VALUES = ["ACTIVE", "ARCHIVED", "ON_HOLD"];
function getTaskStatusConfig(status) {
  return TASK_STATUS[status];
}
function getTaskStatusColor(status) {
  return TASK_STATUS[status].color;
}
function getTaskStatusLabel(status) {
  return TASK_STATUS[status].label;
}
function isTaskCompleted(status) {
  return status === "DONE";
}
function isTaskInProgress(status) {
  return status === "IN_PROGRESS" || status === "IN_REVIEW";
}

// src/shared/constants/timer.constants.ts
var TIMER_MODES = {
  WORK: {
    value: "WORK",
    label: "Work",
    color: "#EF4444",
    // red
    defaultDuration: 25
    // minutes
  },
  SHORT_BREAK: {
    value: "SHORT_BREAK",
    label: "Short Break",
    color: "#10B981",
    // light green
    defaultDuration: 5
    // minutes
  },
  LONG_BREAK: {
    value: "LONG_BREAK",
    label: "Long Break",
    color: "#059669",
    // dark green
    defaultDuration: 15
    // minutes
  },
  CONTINUOUS: {
    value: "CONTINUOUS",
    label: "Continuous",
    color: "#3B82F6",
    // blue
    defaultDuration: 0
    // no limit
  }
};
var TIMER_MODE_VALUES = [
  "WORK",
  "SHORT_BREAK",
  "LONG_BREAK",
  "CONTINUOUS"
];
var DEFAULT_POMODORO_SETTINGS = {
  workDuration: 25,
  // minutes
  shortBreakDuration: 5,
  // minutes
  longBreakDuration: 15,
  // minutes
  pomodorosUntilLongBreak: 4,
  // number of work sessions
  autoStartBreaks: false,
  autoStartPomodoros: false,
  soundEnabled: true,
  notificationsEnabled: true
};
var TIMER_LIMITS = {
  MIN_DURATION: 1,
  // minutes
  MAX_DURATION: 120,
  // minutes
  MIN_POMODOROS_UNTIL_LONG_BREAK: 2,
  MAX_POMODOROS_UNTIL_LONG_BREAK: 10
};
function getTimerModeConfig(mode) {
  return TIMER_MODES[mode];
}
function getTimerModeColor(mode) {
  return TIMER_MODES[mode].color;
}
function getTimerModeLabel(mode) {
  return TIMER_MODES[mode].label;
}
function getTimerModeDefaultDuration(mode) {
  return TIMER_MODES[mode].defaultDuration;
}
function shouldTakeLongBreak(completedPomodoros, pomodorosUntilLongBreak = DEFAULT_POMODORO_SETTINGS.pomodorosUntilLongBreak) {
  return completedPomodoros > 0 && completedPomodoros % pomodorosUntilLongBreak === 0;
}

// src/shared/constants/limits.constants.ts
var TASK_LIMITS = {
  TITLE_MIN_LENGTH: 1,
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 5e3,
  MIN_ESTIMATED_MINUTES: 1,
  MAX_ESTIMATED_MINUTES: 480,
  // 8 hours
  MAX_SUBTASKS: 50,
  MAX_TAGS_PER_TASK: 10,
  MAX_ATTACHMENTS_PER_TASK: 20
};
var PROJECT_LIMITS = {
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 2e3,
  MAX_PROJECTS_PER_WORKSPACE: 100,
  MAX_TASKS_PER_PROJECT: 1e3
};
var WORKSPACE_LIMITS = {
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  MAX_MEMBERS: 50,
  MAX_WORKSPACES_PER_USER: 20,
  SLUG_MIN_LENGTH: 3,
  SLUG_MAX_LENGTH: 50
};
var TAG_LIMITS = {
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 30,
  MAX_TAGS_PER_WORKSPACE: 100
};
var COMMENT_LIMITS = {
  CONTENT_MIN_LENGTH: 1,
  CONTENT_MAX_LENGTH: 2e3,
  MAX_COMMENTS_PER_TASK: 500
};
var FILE_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  // 10 MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024,
  // 5 MB
  MAX_TOTAL_STORAGE_PER_WORKSPACE: 1024 * 1024 * 1024,
  // 1 GB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  ALLOWED_DOCUMENT_TYPES: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ]
};
var USER_LIMITS = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  BIO_MAX_LENGTH: 500
};
var PAGINATION_LIMITS = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 5
};
function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}
function isAllowedFileType(mimeType) {
  const allowedTypes = [
    ...FILE_LIMITS.ALLOWED_IMAGE_TYPES,
    ...FILE_LIMITS.ALLOWED_DOCUMENT_TYPES
  ];
  return allowedTypes.includes(mimeType);
}
function isImageFile(mimeType) {
  return FILE_LIMITS.ALLOWED_IMAGE_TYPES.includes(mimeType);
}
var NOTIFICATION_LIMITS = {
  TITLE_MIN_LENGTH: 1,
  TITLE_MAX_LENGTH: 200,
  MESSAGE_MAX_LENGTH: 1e3,
  ACTION_LABEL_MAX_LENGTH: 50,
  ACTION_URL_MAX_LENGTH: 2048,
  MAX_NOTIFICATIONS_PER_USER: 500
};

// src/shared/utils/date.utils.ts
function formatDate(date5, locale = "en-US") {
  const d = typeof date5 === "string" ? new Date(date5) : date5;
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}
function formatDateShort(date5, locale = "en-US") {
  const d = typeof date5 === "string" ? new Date(date5) : date5;
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
function formatRelativeTime(date5, locale = "en-US") {
  const d = typeof date5 === "string" ? new Date(date5) : date5;
  const now = /* @__PURE__ */ new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffSec = Math.round(diffMs / 1e3);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);
  if (Math.abs(diffSec) < 60) {
    return diffSec >= 0 ? "in a few seconds" : "a few seconds ago";
  } else if (Math.abs(diffMin) < 60) {
    return diffMin >= 0 ? `in ${diffMin} minute${diffMin !== 1 ? "s" : ""}` : `${Math.abs(diffMin)} minute${Math.abs(diffMin) !== 1 ? "s" : ""} ago`;
  } else if (Math.abs(diffHour) < 24) {
    return diffHour >= 0 ? `in ${diffHour} hour${diffHour !== 1 ? "s" : ""}` : `${Math.abs(diffHour)} hour${Math.abs(diffHour) !== 1 ? "s" : ""} ago`;
  } else if (Math.abs(diffDay) < 30) {
    return diffDay >= 0 ? `in ${diffDay} day${diffDay !== 1 ? "s" : ""}` : `${Math.abs(diffDay)} day${Math.abs(diffDay) !== 1 ? "s" : ""} ago`;
  } else {
    return formatDateShort(d, locale);
  }
}
function isToday(date5) {
  const d = typeof date5 === "string" ? new Date(date5) : date5;
  const today = /* @__PURE__ */ new Date();
  return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
}
function isPast(date5) {
  const d = typeof date5 === "string" ? new Date(date5) : date5;
  return d.getTime() < (/* @__PURE__ */ new Date()).getTime();
}
function isFuture(date5) {
  const d = typeof date5 === "string" ? new Date(date5) : date5;
  return d.getTime() > (/* @__PURE__ */ new Date()).getTime();
}
function isOverdue(dueDate) {
  if (!dueDate) return false;
  const d = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
  return isPast(d) && !isToday(d);
}
function getDaysDiff(date1, date22) {
  const d1 = typeof date1 === "string" ? new Date(date1) : date1;
  const d2 = typeof date22 === "string" ? new Date(date22) : date22;
  const diffMs = d2.getTime() - d1.getTime();
  return Math.floor(diffMs / (1e3 * 60 * 60 * 24));
}
function startOfDay(date5) {
  const d = typeof date5 === "string" ? new Date(date5) : new Date(date5);
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfDay(date5) {
  const d = typeof date5 === "string" ? new Date(date5) : new Date(date5);
  d.setHours(23, 59, 59, 999);
  return d;
}
function startOfWeek(date5) {
  const d = typeof date5 === "string" ? new Date(date5) : new Date(date5);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const startDate = new Date(d.setDate(diff));
  startDate.setHours(0, 0, 0, 0);
  return startDate;
}
function endOfWeek(date5) {
  const d = typeof date5 === "string" ? new Date(date5) : new Date(date5);
  const day = d.getDay();
  const diff = d.getDate() + (day === 0 ? 0 : 7 - day);
  const endDate = new Date(d.setDate(diff));
  endDate.setHours(23, 59, 59, 999);
  return endDate;
}
function addDays(date5, days) {
  const d = typeof date5 === "string" ? new Date(date5) : new Date(date5);
  d.setDate(d.getDate() + days);
  return d;
}
function addHours(date5, hours) {
  const d = typeof date5 === "string" ? new Date(date5) : new Date(date5);
  d.setHours(d.getHours() + hours);
  return d;
}
function addMinutes(date5, minutes) {
  const d = typeof date5 === "string" ? new Date(date5) : new Date(date5);
  d.setMinutes(d.getMinutes() + minutes);
  return d;
}
function startOfToday() {
  return startOfDay(/* @__PURE__ */ new Date());
}
function isBefore(date1, date22) {
  const d1 = typeof date1 === "string" ? new Date(date1) : date1;
  const d2 = typeof date22 === "string" ? new Date(date22) : date22;
  return d1.getTime() < d2.getTime();
}
function isAfter(date1, date22) {
  const d1 = typeof date1 === "string" ? new Date(date1) : date1;
  const d2 = typeof date22 === "string" ? new Date(date22) : date22;
  return d1.getTime() > d2.getTime();
}
function isTaskAvailable(task) {
  if (!task.startDate) return true;
  const startDate = typeof task.startDate === "string" ? new Date(task.startDate) : task.startDate;
  return startDate <= /* @__PURE__ */ new Date();
}
function isScheduledForToday(task) {
  if (!task.scheduledDate) return false;
  return isToday(task.scheduledDate);
}
function isDueToday(task) {
  if (!task.dueDate) return false;
  return isToday(task.dueDate);
}
function categorizeTasksByAvailability(tasks) {
  const today = startOfToday();
  return {
    overdue: tasks.filter(
      (t) => t.dueDate && isBefore(t.dueDate, today) && t.status !== "COMPLETED"
    ),
    dueToday: tasks.filter(
      (t) => t.dueDate && isToday(t.dueDate)
    ),
    scheduledToday: tasks.filter(
      (t) => t.scheduledDate && isToday(t.scheduledDate)
    ),
    available: tasks.filter(
      (t) => isTaskAvailable(t) && !isScheduledForToday(t) && t.status !== "COMPLETED"
    ),
    notYetAvailable: tasks.filter(
      (t) => !isTaskAvailable(t)
    )
  };
}
function getWorkableTasks(tasks) {
  return tasks.filter(
    (t) => isTaskAvailable(t) && t.status !== "COMPLETED" && t.status !== "CANCELLED"
  );
}
function formatScheduledDateTime(scheduledDate, scheduledTime, locale = "en-US") {
  if (!scheduledDate) return null;
  const dateStr = formatDateShort(scheduledDate, locale);
  if (scheduledTime) {
    return `${dateStr} at ${scheduledTime}`;
  }
  return dateStr;
}

// src/shared/utils/time.utils.ts
function formatDuration(minutes) {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
function formatDurationFromSeconds(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds % 3600 / 60);
  const secs = seconds % 60;
  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  return parts.join(" ");
}
function formatTimerDisplay(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}
function formatTimerDisplayExtended(seconds) {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor(seconds % 3600 / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}
function minutesToHours(minutes) {
  return Math.round(minutes / 60 * 100) / 100;
}
function hoursToMinutes(hours) {
  return Math.round(hours * 60);
}
function secondsToMinutes(seconds) {
  return Math.round(seconds / 60);
}
function minutesToSeconds(minutes) {
  return minutes * 60;
}
function parseDuration(duration3) {
  const hourMatch = duration3.match(/(\d+)h/);
  const minMatch = duration3.match(/(\d+)m/);
  const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
  const minutes = minMatch ? parseInt(minMatch[1], 10) : 0;
  return hours * 60 + minutes;
}
function calculateTotalTimeWorked(timeEntries) {
  return timeEntries.reduce((total, entry) => total + entry.duration, 0);
}
function calculateAverageTime(totalMinutes, taskCount) {
  if (taskCount === 0) return 0;
  return Math.round(totalMinutes / taskCount);
}
function formatTimeOfDay(time3, use24Hour = false) {
  const [hours, minutes] = time3.split(":").map(Number);
  if (use24Hour) {
    return `${(hours || 0).toString().padStart(2, "0")}:${(minutes || 0).toString().padStart(2, "0")}`;
  }
  const period = (hours || 0) >= 12 ? "PM" : "AM";
  const displayHours = (hours || 0) % 12 || 12;
  return `${displayHours}:${(minutes || 0).toString().padStart(2, "0")} ${period}`;
}
function getCurrentTime() {
  const now = /* @__PURE__ */ new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
}
function isWorkingHours(date5 = /* @__PURE__ */ new Date(), startHour = 9, endHour = 18) {
  const hour = date5.getHours();
  return hour >= startHour && hour < endHour;
}

// src/shared/utils/string.utils.ts
function generateSlug(text) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
function truncate(text, maxLength, ellipsis = "...") {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - ellipsis.length) + ellipsis;
}
function capitalize(text) {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}
function capitalizeWords(text) {
  return text.split(" ").map((word) => capitalize(word)).join(" ");
}
function camelToTitle(text) {
  const result = text.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
}
function snakeToTitle(text) {
  return text.split("_").map((word) => capitalize(word)).join(" ");
}
function getInitials(name, maxLength = 2) {
  const words = name.trim().split(/\s+/);
  const initials = words.map((word) => word.charAt(0).toUpperCase()).join("");
  return initials.slice(0, maxLength);
}
function generateRandomString(length) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
function isValidEmail(email3) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email3);
}
function isValidUrl(url2) {
  try {
    new URL(url2);
    return true;
  } catch {
    return false;
  }
}
function sanitizeHtml(text) {
  const map2 = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;"
  };
  return text.replace(/[&<>"'/]/g, (char) => map2[char] || char);
}
function normalizeWhitespace(text) {
  return text.replace(/\s+/g, " ").trim();
}
function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
function pluralize(word, count, plural) {
  if (count === 1) return word;
  return plural || `${word}s`;
}
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
function isAlphanumeric(text) {
  return /^[a-zA-Z0-9]+$/.test(text);
}
function stripHtmlTags(html) {
  return html.replace(/<[^>]*>/g, "");
}
function highlightSearchTerms(text, searchTerm) {
  if (!searchTerm) return text;
  const regex = new RegExp(`(${searchTerm})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}

// src/shared/utils/calculation.utils.ts
function calculateProgress(completed, total) {
  if (total === 0) return 0;
  return Math.round(completed / total * 100);
}
function calculateCompletionRate(completed, total) {
  if (total === 0) return 0;
  return Math.round(completed / total * 100 * 10) / 10;
}
function calculateProductivityScore(completedTasks, totalTasks, focusMinutes, targetFocusMinutes = 240) {
  if (totalTasks === 0 && focusMinutes === 0) return 0;
  const taskScore = totalTasks > 0 ? completedTasks / totalTasks * 50 : 0;
  const focusScore = Math.min(focusMinutes / targetFocusMinutes * 50, 50);
  return Math.round(taskScore + focusScore);
}
function calculateFocusScore(completedPomodoros, targetPomodoros = 8) {
  if (targetPomodoros === 0) return 0;
  return Math.min(Math.round(completedPomodoros / targetPomodoros * 100), 100);
}
function calculateAverageCompletionTime(tasks) {
  const completedTasks = tasks.filter((t) => t.completedAt != null);
  if (completedTasks.length === 0) return 0;
  const totalTime = completedTasks.reduce((sum, task) => {
    if (!task.completedAt) return sum;
    const created = typeof task.createdAt === "string" ? new Date(task.createdAt) : task.createdAt;
    const completed = typeof task.completedAt === "string" ? new Date(task.completedAt) : task.completedAt;
    return sum + (completed.getTime() - created.getTime());
  }, 0);
  return Math.round(totalTime / completedTasks.length / (1e3 * 60));
}
function calculateVelocity(completedTasks, days) {
  if (days === 0) return 0;
  return Math.round(completedTasks / days * 10) / 10;
}
function calculateEstimatedCompletion(remainingTasks, velocity) {
  if (velocity === 0) return null;
  const daysNeeded = Math.ceil(remainingTasks / velocity);
  const completionDate = /* @__PURE__ */ new Date();
  completionDate.setDate(completionDate.getDate() + daysNeeded);
  return completionDate;
}
function calculateBurndownRate(initialTasks, remainingTasks, elapsedDays) {
  if (elapsedDays === 0) return 0;
  const completedTasks = initialTasks - remainingTasks;
  return Math.round(completedTasks / elapsedDays * 10) / 10;
}
function calculateProjectHealth(completedTasks, totalTasks, overdueTasks, velocity, targetVelocity = 2) {
  if (totalTasks === 0) return 100;
  const progressScore = completedTasks / totalTasks * 40;
  const overdueScore = Math.max(0, 30 - overdueTasks / totalTasks * 30);
  const velocityScore = Math.min(velocity / targetVelocity * 30, 30);
  return Math.round(progressScore + overdueScore + velocityScore);
}
function calculateTimeUtilization(actualMinutes, estimatedMinutes) {
  if (estimatedMinutes === 0) return 0;
  return Math.round(actualMinutes / estimatedMinutes * 100);
}
function calculateEfficiency(completedTasks, totalMinutesWorked) {
  if (totalMinutesWorked === 0) return 0;
  const tasksPerHour = completedTasks / totalMinutesWorked * 60;
  return Math.round(tasksPerHour * 100) / 100;
}
function calculateStreak(activityDates) {
  if (activityDates.length === 0) return 0;
  const sortedDates = activityDates.map((d) => typeof d === "string" ? new Date(d) : d).sort((a, b) => b.getTime() - a.getTime());
  let streak = 1;
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const mostRecent = new Date(sortedDates[0]);
  mostRecent.setHours(0, 0, 0, 0);
  const daysDiff = Math.floor((today.getTime() - mostRecent.getTime()) / (1e3 * 60 * 60 * 24));
  if (daysDiff > 1) return 0;
  for (let i = 1; i < sortedDates.length; i++) {
    const current = new Date(sortedDates[i]);
    current.setHours(0, 0, 0, 0);
    const previous = new Date(sortedDates[i - 1]);
    previous.setHours(0, 0, 0, 0);
    const diff = Math.floor((previous.getTime() - current.getTime()) / (1e3 * 60 * 60 * 24));
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
function calculatePercentile(value, values) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = sorted.findIndex((v) => v >= value);
  if (index === -1) return 100;
  return Math.round(index / sorted.length * 100);
}
function calculateWeightedAverage(values) {
  if (values.length === 0) return 0;
  const totalWeight = values.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight === 0) return 0;
  const weightedSum = values.reduce((sum, item) => sum + item.value * item.weight, 0);
  return Math.round(weightedSum / totalWeight * 100) / 100;
}

// src/shared/utils/color.utils.ts
function hexToRgb(hex3) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex3);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}
function rgbToHex(r, g, b) {
  const toHex = (x) => {
    const hex3 = x.toString(16);
    return hex3.length === 1 ? "0" + hex3 : hex3;
  };
  return "#" + toHex(r) + toHex(g) + toHex(b);
}
function getContrastColor(hexColor) {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return "#000000";
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}
function lightenColor(hexColor, percent) {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return hexColor;
  const amount = Math.round(2.55 * percent);
  const r = Math.min(255, rgb.r + amount);
  const g = Math.min(255, rgb.g + amount);
  const b = Math.min(255, rgb.b + amount);
  return rgbToHex(r, g, b);
}
function darkenColor(hexColor, percent) {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return hexColor;
  const amount = Math.round(2.55 * percent);
  const r = Math.max(0, rgb.r - amount);
  const g = Math.max(0, rgb.g - amount);
  const b = Math.max(0, rgb.b - amount);
  return rgbToHex(r, g, b);
}
function addAlpha(hexColor, alpha) {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return hexColor;
  const a = Math.round(Math.min(Math.max(alpha, 0), 1) * 255);
  return `${hexColor}${a.toString(16).padStart(2, "0")}`;
}
function hexToRgba(hexColor, alpha = 1) {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return `rgba(0, 0, 0, ${alpha})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}
function randomColor() {
  return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
}
function isLightColor(hexColor) {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return false;
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5;
}
function isDarkColor(hexColor) {
  return !isLightColor(hexColor);
}
function mixColors(color1, color2, weight = 0.5) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  if (!rgb1 || !rgb2) return color1;
  const w = Math.max(0, Math.min(1, weight));
  const r = Math.round(rgb1.r * (1 - w) + rgb2.r * w);
  const g = Math.round(rgb1.g * (1 - w) + rgb2.g * w);
  const b = Math.round(rgb1.b * (1 - w) + rgb2.b * w);
  return rgbToHex(r, g, b);
}
function generatePalette(baseColor) {
  return {
    lighter: lightenColor(baseColor, 40),
    light: lightenColor(baseColor, 20),
    base: baseColor,
    dark: darkenColor(baseColor, 20),
    darker: darkenColor(baseColor, 40)
  };
}
function getColorWithOpacity(hexColor, opacity = 0.1) {
  return hexToRgba(hexColor, opacity);
}

// ../../node_modules/zod/v4/classic/external.js
var external_exports = {};
__export(external_exports, {
  $brand: () => $brand,
  $input: () => $input,
  $output: () => $output,
  NEVER: () => NEVER,
  TimePrecision: () => TimePrecision,
  ZodAny: () => ZodAny,
  ZodArray: () => ZodArray,
  ZodBase64: () => ZodBase64,
  ZodBase64URL: () => ZodBase64URL,
  ZodBigInt: () => ZodBigInt,
  ZodBigIntFormat: () => ZodBigIntFormat,
  ZodBoolean: () => ZodBoolean,
  ZodCIDRv4: () => ZodCIDRv4,
  ZodCIDRv6: () => ZodCIDRv6,
  ZodCUID: () => ZodCUID,
  ZodCUID2: () => ZodCUID2,
  ZodCatch: () => ZodCatch,
  ZodCodec: () => ZodCodec,
  ZodCustom: () => ZodCustom,
  ZodCustomStringFormat: () => ZodCustomStringFormat,
  ZodDate: () => ZodDate,
  ZodDefault: () => ZodDefault,
  ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
  ZodE164: () => ZodE164,
  ZodEmail: () => ZodEmail,
  ZodEmoji: () => ZodEmoji,
  ZodEnum: () => ZodEnum,
  ZodError: () => ZodError,
  ZodExactOptional: () => ZodExactOptional,
  ZodFile: () => ZodFile,
  ZodFirstPartyTypeKind: () => ZodFirstPartyTypeKind,
  ZodFunction: () => ZodFunction,
  ZodGUID: () => ZodGUID,
  ZodIPv4: () => ZodIPv4,
  ZodIPv6: () => ZodIPv6,
  ZodISODate: () => ZodISODate,
  ZodISODateTime: () => ZodISODateTime,
  ZodISODuration: () => ZodISODuration,
  ZodISOTime: () => ZodISOTime,
  ZodIntersection: () => ZodIntersection,
  ZodIssueCode: () => ZodIssueCode,
  ZodJWT: () => ZodJWT,
  ZodKSUID: () => ZodKSUID,
  ZodLazy: () => ZodLazy,
  ZodLiteral: () => ZodLiteral,
  ZodMAC: () => ZodMAC,
  ZodMap: () => ZodMap,
  ZodNaN: () => ZodNaN,
  ZodNanoID: () => ZodNanoID,
  ZodNever: () => ZodNever,
  ZodNonOptional: () => ZodNonOptional,
  ZodNull: () => ZodNull,
  ZodNullable: () => ZodNullable,
  ZodNumber: () => ZodNumber,
  ZodNumberFormat: () => ZodNumberFormat,
  ZodObject: () => ZodObject,
  ZodOptional: () => ZodOptional,
  ZodPipe: () => ZodPipe,
  ZodPrefault: () => ZodPrefault,
  ZodPromise: () => ZodPromise,
  ZodReadonly: () => ZodReadonly,
  ZodRealError: () => ZodRealError,
  ZodRecord: () => ZodRecord,
  ZodSet: () => ZodSet,
  ZodString: () => ZodString,
  ZodStringFormat: () => ZodStringFormat,
  ZodSuccess: () => ZodSuccess,
  ZodSymbol: () => ZodSymbol,
  ZodTemplateLiteral: () => ZodTemplateLiteral,
  ZodTransform: () => ZodTransform,
  ZodTuple: () => ZodTuple,
  ZodType: () => ZodType,
  ZodULID: () => ZodULID,
  ZodURL: () => ZodURL,
  ZodUUID: () => ZodUUID,
  ZodUndefined: () => ZodUndefined,
  ZodUnion: () => ZodUnion,
  ZodUnknown: () => ZodUnknown,
  ZodVoid: () => ZodVoid,
  ZodXID: () => ZodXID,
  ZodXor: () => ZodXor,
  _ZodString: () => _ZodString,
  _default: () => _default2,
  _function: () => _function,
  any: () => any,
  array: () => array,
  base64: () => base642,
  base64url: () => base64url2,
  bigint: () => bigint2,
  boolean: () => boolean2,
  catch: () => _catch2,
  check: () => check,
  cidrv4: () => cidrv42,
  cidrv6: () => cidrv62,
  clone: () => clone,
  codec: () => codec,
  coerce: () => coerce_exports,
  config: () => config,
  core: () => core_exports2,
  cuid: () => cuid3,
  cuid2: () => cuid22,
  custom: () => custom,
  date: () => date3,
  decode: () => decode2,
  decodeAsync: () => decodeAsync2,
  describe: () => describe2,
  discriminatedUnion: () => discriminatedUnion,
  e164: () => e1642,
  email: () => email2,
  emoji: () => emoji2,
  encode: () => encode2,
  encodeAsync: () => encodeAsync2,
  endsWith: () => _endsWith,
  enum: () => _enum2,
  exactOptional: () => exactOptional,
  file: () => file,
  flattenError: () => flattenError,
  float32: () => float32,
  float64: () => float64,
  formatError: () => formatError,
  fromJSONSchema: () => fromJSONSchema,
  function: () => _function,
  getErrorMap: () => getErrorMap,
  globalRegistry: () => globalRegistry,
  gt: () => _gt,
  gte: () => _gte,
  guid: () => guid2,
  hash: () => hash,
  hex: () => hex2,
  hostname: () => hostname2,
  httpUrl: () => httpUrl,
  includes: () => _includes,
  instanceof: () => _instanceof,
  int: () => int,
  int32: () => int32,
  int64: () => int64,
  intersection: () => intersection,
  ipv4: () => ipv42,
  ipv6: () => ipv62,
  iso: () => iso_exports,
  json: () => json,
  jwt: () => jwt,
  keyof: () => keyof,
  ksuid: () => ksuid2,
  lazy: () => lazy,
  length: () => _length,
  literal: () => literal,
  locales: () => locales_exports,
  looseObject: () => looseObject,
  looseRecord: () => looseRecord,
  lowercase: () => _lowercase,
  lt: () => _lt,
  lte: () => _lte,
  mac: () => mac2,
  map: () => map,
  maxLength: () => _maxLength,
  maxSize: () => _maxSize,
  meta: () => meta2,
  mime: () => _mime,
  minLength: () => _minLength,
  minSize: () => _minSize,
  multipleOf: () => _multipleOf,
  nan: () => nan,
  nanoid: () => nanoid2,
  nativeEnum: () => nativeEnum,
  negative: () => _negative,
  never: () => never,
  nonnegative: () => _nonnegative,
  nonoptional: () => nonoptional,
  nonpositive: () => _nonpositive,
  normalize: () => _normalize,
  null: () => _null3,
  nullable: () => nullable,
  nullish: () => nullish2,
  number: () => number2,
  object: () => object,
  optional: () => optional,
  overwrite: () => _overwrite,
  parse: () => parse2,
  parseAsync: () => parseAsync2,
  partialRecord: () => partialRecord,
  pipe: () => pipe,
  positive: () => _positive,
  prefault: () => prefault,
  preprocess: () => preprocess,
  prettifyError: () => prettifyError,
  promise: () => promise,
  property: () => _property,
  readonly: () => readonly,
  record: () => record,
  refine: () => refine,
  regex: () => _regex,
  regexes: () => regexes_exports,
  registry: () => registry,
  safeDecode: () => safeDecode2,
  safeDecodeAsync: () => safeDecodeAsync2,
  safeEncode: () => safeEncode2,
  safeEncodeAsync: () => safeEncodeAsync2,
  safeParse: () => safeParse2,
  safeParseAsync: () => safeParseAsync2,
  set: () => set,
  setErrorMap: () => setErrorMap,
  size: () => _size,
  slugify: () => _slugify,
  startsWith: () => _startsWith,
  strictObject: () => strictObject,
  string: () => string2,
  stringFormat: () => stringFormat,
  stringbool: () => stringbool,
  success: () => success,
  superRefine: () => superRefine,
  symbol: () => symbol,
  templateLiteral: () => templateLiteral,
  toJSONSchema: () => toJSONSchema,
  toLowerCase: () => _toLowerCase,
  toUpperCase: () => _toUpperCase,
  transform: () => transform,
  treeifyError: () => treeifyError,
  trim: () => _trim,
  tuple: () => tuple,
  uint32: () => uint32,
  uint64: () => uint64,
  ulid: () => ulid2,
  undefined: () => _undefined3,
  union: () => union,
  unknown: () => unknown,
  uppercase: () => _uppercase,
  url: () => url,
  util: () => util_exports,
  uuid: () => uuid2,
  uuidv4: () => uuidv4,
  uuidv6: () => uuidv6,
  uuidv7: () => uuidv7,
  void: () => _void2,
  xid: () => xid2,
  xor: () => xor
});

// ../../node_modules/zod/v4/core/index.js
var core_exports2 = {};
__export(core_exports2, {
  $ZodAny: () => $ZodAny,
  $ZodArray: () => $ZodArray,
  $ZodAsyncError: () => $ZodAsyncError,
  $ZodBase64: () => $ZodBase64,
  $ZodBase64URL: () => $ZodBase64URL,
  $ZodBigInt: () => $ZodBigInt,
  $ZodBigIntFormat: () => $ZodBigIntFormat,
  $ZodBoolean: () => $ZodBoolean,
  $ZodCIDRv4: () => $ZodCIDRv4,
  $ZodCIDRv6: () => $ZodCIDRv6,
  $ZodCUID: () => $ZodCUID,
  $ZodCUID2: () => $ZodCUID2,
  $ZodCatch: () => $ZodCatch,
  $ZodCheck: () => $ZodCheck,
  $ZodCheckBigIntFormat: () => $ZodCheckBigIntFormat,
  $ZodCheckEndsWith: () => $ZodCheckEndsWith,
  $ZodCheckGreaterThan: () => $ZodCheckGreaterThan,
  $ZodCheckIncludes: () => $ZodCheckIncludes,
  $ZodCheckLengthEquals: () => $ZodCheckLengthEquals,
  $ZodCheckLessThan: () => $ZodCheckLessThan,
  $ZodCheckLowerCase: () => $ZodCheckLowerCase,
  $ZodCheckMaxLength: () => $ZodCheckMaxLength,
  $ZodCheckMaxSize: () => $ZodCheckMaxSize,
  $ZodCheckMimeType: () => $ZodCheckMimeType,
  $ZodCheckMinLength: () => $ZodCheckMinLength,
  $ZodCheckMinSize: () => $ZodCheckMinSize,
  $ZodCheckMultipleOf: () => $ZodCheckMultipleOf,
  $ZodCheckNumberFormat: () => $ZodCheckNumberFormat,
  $ZodCheckOverwrite: () => $ZodCheckOverwrite,
  $ZodCheckProperty: () => $ZodCheckProperty,
  $ZodCheckRegex: () => $ZodCheckRegex,
  $ZodCheckSizeEquals: () => $ZodCheckSizeEquals,
  $ZodCheckStartsWith: () => $ZodCheckStartsWith,
  $ZodCheckStringFormat: () => $ZodCheckStringFormat,
  $ZodCheckUpperCase: () => $ZodCheckUpperCase,
  $ZodCodec: () => $ZodCodec,
  $ZodCustom: () => $ZodCustom,
  $ZodCustomStringFormat: () => $ZodCustomStringFormat,
  $ZodDate: () => $ZodDate,
  $ZodDefault: () => $ZodDefault,
  $ZodDiscriminatedUnion: () => $ZodDiscriminatedUnion,
  $ZodE164: () => $ZodE164,
  $ZodEmail: () => $ZodEmail,
  $ZodEmoji: () => $ZodEmoji,
  $ZodEncodeError: () => $ZodEncodeError,
  $ZodEnum: () => $ZodEnum,
  $ZodError: () => $ZodError,
  $ZodExactOptional: () => $ZodExactOptional,
  $ZodFile: () => $ZodFile,
  $ZodFunction: () => $ZodFunction,
  $ZodGUID: () => $ZodGUID,
  $ZodIPv4: () => $ZodIPv4,
  $ZodIPv6: () => $ZodIPv6,
  $ZodISODate: () => $ZodISODate,
  $ZodISODateTime: () => $ZodISODateTime,
  $ZodISODuration: () => $ZodISODuration,
  $ZodISOTime: () => $ZodISOTime,
  $ZodIntersection: () => $ZodIntersection,
  $ZodJWT: () => $ZodJWT,
  $ZodKSUID: () => $ZodKSUID,
  $ZodLazy: () => $ZodLazy,
  $ZodLiteral: () => $ZodLiteral,
  $ZodMAC: () => $ZodMAC,
  $ZodMap: () => $ZodMap,
  $ZodNaN: () => $ZodNaN,
  $ZodNanoID: () => $ZodNanoID,
  $ZodNever: () => $ZodNever,
  $ZodNonOptional: () => $ZodNonOptional,
  $ZodNull: () => $ZodNull,
  $ZodNullable: () => $ZodNullable,
  $ZodNumber: () => $ZodNumber,
  $ZodNumberFormat: () => $ZodNumberFormat,
  $ZodObject: () => $ZodObject,
  $ZodObjectJIT: () => $ZodObjectJIT,
  $ZodOptional: () => $ZodOptional,
  $ZodPipe: () => $ZodPipe,
  $ZodPrefault: () => $ZodPrefault,
  $ZodPromise: () => $ZodPromise,
  $ZodReadonly: () => $ZodReadonly,
  $ZodRealError: () => $ZodRealError,
  $ZodRecord: () => $ZodRecord,
  $ZodRegistry: () => $ZodRegistry,
  $ZodSet: () => $ZodSet,
  $ZodString: () => $ZodString,
  $ZodStringFormat: () => $ZodStringFormat,
  $ZodSuccess: () => $ZodSuccess,
  $ZodSymbol: () => $ZodSymbol,
  $ZodTemplateLiteral: () => $ZodTemplateLiteral,
  $ZodTransform: () => $ZodTransform,
  $ZodTuple: () => $ZodTuple,
  $ZodType: () => $ZodType,
  $ZodULID: () => $ZodULID,
  $ZodURL: () => $ZodURL,
  $ZodUUID: () => $ZodUUID,
  $ZodUndefined: () => $ZodUndefined,
  $ZodUnion: () => $ZodUnion,
  $ZodUnknown: () => $ZodUnknown,
  $ZodVoid: () => $ZodVoid,
  $ZodXID: () => $ZodXID,
  $ZodXor: () => $ZodXor,
  $brand: () => $brand,
  $constructor: () => $constructor,
  $input: () => $input,
  $output: () => $output,
  Doc: () => Doc,
  JSONSchema: () => json_schema_exports,
  JSONSchemaGenerator: () => JSONSchemaGenerator,
  NEVER: () => NEVER,
  TimePrecision: () => TimePrecision,
  _any: () => _any,
  _array: () => _array,
  _base64: () => _base64,
  _base64url: () => _base64url,
  _bigint: () => _bigint,
  _boolean: () => _boolean,
  _catch: () => _catch,
  _check: () => _check,
  _cidrv4: () => _cidrv4,
  _cidrv6: () => _cidrv6,
  _coercedBigint: () => _coercedBigint,
  _coercedBoolean: () => _coercedBoolean,
  _coercedDate: () => _coercedDate,
  _coercedNumber: () => _coercedNumber,
  _coercedString: () => _coercedString,
  _cuid: () => _cuid,
  _cuid2: () => _cuid2,
  _custom: () => _custom,
  _date: () => _date,
  _decode: () => _decode,
  _decodeAsync: () => _decodeAsync,
  _default: () => _default,
  _discriminatedUnion: () => _discriminatedUnion,
  _e164: () => _e164,
  _email: () => _email,
  _emoji: () => _emoji2,
  _encode: () => _encode,
  _encodeAsync: () => _encodeAsync,
  _endsWith: () => _endsWith,
  _enum: () => _enum,
  _file: () => _file,
  _float32: () => _float32,
  _float64: () => _float64,
  _gt: () => _gt,
  _gte: () => _gte,
  _guid: () => _guid,
  _includes: () => _includes,
  _int: () => _int,
  _int32: () => _int32,
  _int64: () => _int64,
  _intersection: () => _intersection,
  _ipv4: () => _ipv4,
  _ipv6: () => _ipv6,
  _isoDate: () => _isoDate,
  _isoDateTime: () => _isoDateTime,
  _isoDuration: () => _isoDuration,
  _isoTime: () => _isoTime,
  _jwt: () => _jwt,
  _ksuid: () => _ksuid,
  _lazy: () => _lazy,
  _length: () => _length,
  _literal: () => _literal,
  _lowercase: () => _lowercase,
  _lt: () => _lt,
  _lte: () => _lte,
  _mac: () => _mac,
  _map: () => _map,
  _max: () => _lte,
  _maxLength: () => _maxLength,
  _maxSize: () => _maxSize,
  _mime: () => _mime,
  _min: () => _gte,
  _minLength: () => _minLength,
  _minSize: () => _minSize,
  _multipleOf: () => _multipleOf,
  _nan: () => _nan,
  _nanoid: () => _nanoid,
  _nativeEnum: () => _nativeEnum,
  _negative: () => _negative,
  _never: () => _never,
  _nonnegative: () => _nonnegative,
  _nonoptional: () => _nonoptional,
  _nonpositive: () => _nonpositive,
  _normalize: () => _normalize,
  _null: () => _null2,
  _nullable: () => _nullable,
  _number: () => _number,
  _optional: () => _optional,
  _overwrite: () => _overwrite,
  _parse: () => _parse,
  _parseAsync: () => _parseAsync,
  _pipe: () => _pipe,
  _positive: () => _positive,
  _promise: () => _promise,
  _property: () => _property,
  _readonly: () => _readonly,
  _record: () => _record,
  _refine: () => _refine,
  _regex: () => _regex,
  _safeDecode: () => _safeDecode,
  _safeDecodeAsync: () => _safeDecodeAsync,
  _safeEncode: () => _safeEncode,
  _safeEncodeAsync: () => _safeEncodeAsync,
  _safeParse: () => _safeParse,
  _safeParseAsync: () => _safeParseAsync,
  _set: () => _set,
  _size: () => _size,
  _slugify: () => _slugify,
  _startsWith: () => _startsWith,
  _string: () => _string,
  _stringFormat: () => _stringFormat,
  _stringbool: () => _stringbool,
  _success: () => _success,
  _superRefine: () => _superRefine,
  _symbol: () => _symbol,
  _templateLiteral: () => _templateLiteral,
  _toLowerCase: () => _toLowerCase,
  _toUpperCase: () => _toUpperCase,
  _transform: () => _transform,
  _trim: () => _trim,
  _tuple: () => _tuple,
  _uint32: () => _uint32,
  _uint64: () => _uint64,
  _ulid: () => _ulid,
  _undefined: () => _undefined2,
  _union: () => _union,
  _unknown: () => _unknown,
  _uppercase: () => _uppercase,
  _url: () => _url,
  _uuid: () => _uuid,
  _uuidv4: () => _uuidv4,
  _uuidv6: () => _uuidv6,
  _uuidv7: () => _uuidv7,
  _void: () => _void,
  _xid: () => _xid,
  _xor: () => _xor,
  clone: () => clone,
  config: () => config,
  createStandardJSONSchemaMethod: () => createStandardJSONSchemaMethod,
  createToJSONSchemaMethod: () => createToJSONSchemaMethod,
  decode: () => decode,
  decodeAsync: () => decodeAsync,
  describe: () => describe,
  encode: () => encode,
  encodeAsync: () => encodeAsync,
  extractDefs: () => extractDefs,
  finalize: () => finalize,
  flattenError: () => flattenError,
  formatError: () => formatError,
  globalConfig: () => globalConfig,
  globalRegistry: () => globalRegistry,
  initializeContext: () => initializeContext,
  isValidBase64: () => isValidBase64,
  isValidBase64URL: () => isValidBase64URL,
  isValidJWT: () => isValidJWT,
  locales: () => locales_exports,
  meta: () => meta,
  parse: () => parse,
  parseAsync: () => parseAsync,
  prettifyError: () => prettifyError,
  process: () => process,
  regexes: () => regexes_exports,
  registry: () => registry,
  safeDecode: () => safeDecode,
  safeDecodeAsync: () => safeDecodeAsync,
  safeEncode: () => safeEncode,
  safeEncodeAsync: () => safeEncodeAsync,
  safeParse: () => safeParse,
  safeParseAsync: () => safeParseAsync,
  toDotPath: () => toDotPath,
  toJSONSchema: () => toJSONSchema,
  treeifyError: () => treeifyError,
  util: () => util_exports,
  version: () => version
});

// ../../node_modules/zod/v4/core/core.js
var NEVER = Object.freeze({
  status: "aborted"
});
// @__NO_SIDE_EFFECTS__
function $constructor(name, initializer3, params) {
  function init(inst, def) {
    if (!inst._zod) {
      Object.defineProperty(inst, "_zod", {
        value: {
          def,
          constr: _,
          traits: /* @__PURE__ */ new Set()
        },
        enumerable: false
      });
    }
    if (inst._zod.traits.has(name)) {
      return;
    }
    inst._zod.traits.add(name);
    initializer3(inst, def);
    const proto = _.prototype;
    const keys = Object.keys(proto);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (!(k in inst)) {
        inst[k] = proto[k].bind(inst);
      }
    }
  }
  const Parent = params?.Parent ?? Object;
  class Definition extends Parent {
  }
  Object.defineProperty(Definition, "name", { value: name });
  function _(def) {
    var _a2;
    const inst = params?.Parent ? new Definition() : this;
    init(inst, def);
    (_a2 = inst._zod).deferred ?? (_a2.deferred = []);
    for (const fn of inst._zod.deferred) {
      fn();
    }
    return inst;
  }
  Object.defineProperty(_, "init", { value: init });
  Object.defineProperty(_, Symbol.hasInstance, {
    value: (inst) => {
      if (params?.Parent && inst instanceof params.Parent)
        return true;
      return inst?._zod?.traits?.has(name);
    }
  });
  Object.defineProperty(_, "name", { value: name });
  return _;
}
var $brand = Symbol("zod_brand");
var $ZodAsyncError = class extends Error {
  constructor() {
    super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
  }
};
var $ZodEncodeError = class extends Error {
  constructor(name) {
    super(`Encountered unidirectional transform during encode: ${name}`);
    this.name = "ZodEncodeError";
  }
};
var globalConfig = {};
function config(newConfig) {
  if (newConfig)
    Object.assign(globalConfig, newConfig);
  return globalConfig;
}

// ../../node_modules/zod/v4/core/util.js
var util_exports = {};
__export(util_exports, {
  BIGINT_FORMAT_RANGES: () => BIGINT_FORMAT_RANGES,
  Class: () => Class,
  NUMBER_FORMAT_RANGES: () => NUMBER_FORMAT_RANGES,
  aborted: () => aborted,
  allowsEval: () => allowsEval,
  assert: () => assert,
  assertEqual: () => assertEqual,
  assertIs: () => assertIs,
  assertNever: () => assertNever,
  assertNotEqual: () => assertNotEqual,
  assignProp: () => assignProp,
  base64ToUint8Array: () => base64ToUint8Array,
  base64urlToUint8Array: () => base64urlToUint8Array,
  cached: () => cached,
  captureStackTrace: () => captureStackTrace,
  cleanEnum: () => cleanEnum,
  cleanRegex: () => cleanRegex,
  clone: () => clone,
  cloneDef: () => cloneDef,
  createTransparentProxy: () => createTransparentProxy,
  defineLazy: () => defineLazy,
  esc: () => esc,
  escapeRegex: () => escapeRegex,
  extend: () => extend,
  finalizeIssue: () => finalizeIssue,
  floatSafeRemainder: () => floatSafeRemainder,
  getElementAtPath: () => getElementAtPath,
  getEnumValues: () => getEnumValues,
  getLengthableOrigin: () => getLengthableOrigin,
  getParsedType: () => getParsedType,
  getSizableOrigin: () => getSizableOrigin,
  hexToUint8Array: () => hexToUint8Array,
  isObject: () => isObject,
  isPlainObject: () => isPlainObject,
  issue: () => issue,
  joinValues: () => joinValues,
  jsonStringifyReplacer: () => jsonStringifyReplacer,
  merge: () => merge,
  mergeDefs: () => mergeDefs,
  normalizeParams: () => normalizeParams,
  nullish: () => nullish,
  numKeys: () => numKeys,
  objectClone: () => objectClone,
  omit: () => omit,
  optionalKeys: () => optionalKeys,
  parsedType: () => parsedType,
  partial: () => partial,
  pick: () => pick,
  prefixIssues: () => prefixIssues,
  primitiveTypes: () => primitiveTypes,
  promiseAllObject: () => promiseAllObject,
  propertyKeyTypes: () => propertyKeyTypes,
  randomString: () => randomString,
  required: () => required,
  safeExtend: () => safeExtend,
  shallowClone: () => shallowClone,
  slugify: () => slugify,
  stringifyPrimitive: () => stringifyPrimitive,
  uint8ArrayToBase64: () => uint8ArrayToBase64,
  uint8ArrayToBase64url: () => uint8ArrayToBase64url,
  uint8ArrayToHex: () => uint8ArrayToHex,
  unwrapMessage: () => unwrapMessage
});
function assertEqual(val) {
  return val;
}
function assertNotEqual(val) {
  return val;
}
function assertIs(_arg) {
}
function assertNever(_x) {
  throw new Error("Unexpected value in exhaustive check");
}
function assert(_) {
}
function getEnumValues(entries) {
  const numericValues = Object.values(entries).filter((v) => typeof v === "number");
  const values = Object.entries(entries).filter(([k, _]) => numericValues.indexOf(+k) === -1).map(([_, v]) => v);
  return values;
}
function joinValues(array2, separator = "|") {
  return array2.map((val) => stringifyPrimitive(val)).join(separator);
}
function jsonStringifyReplacer(_, value) {
  if (typeof value === "bigint")
    return value.toString();
  return value;
}
function cached(getter) {
  const set2 = false;
  return {
    get value() {
      if (!set2) {
        const value = getter();
        Object.defineProperty(this, "value", { value });
        return value;
      }
      throw new Error("cached value already set");
    }
  };
}
function nullish(input) {
  return input === null || input === void 0;
}
function cleanRegex(source) {
  const start = source.startsWith("^") ? 1 : 0;
  const end = source.endsWith("$") ? source.length - 1 : source.length;
  return source.slice(start, end);
}
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepString = step.toString();
  let stepDecCount = (stepString.split(".")[1] || "").length;
  if (stepDecCount === 0 && /\d?e-\d?/.test(stepString)) {
    const match = stepString.match(/\d?e-(\d?)/);
    if (match?.[1]) {
      stepDecCount = Number.parseInt(match[1]);
    }
  }
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / 10 ** decCount;
}
var EVALUATING = Symbol("evaluating");
function defineLazy(object2, key, getter) {
  let value = void 0;
  Object.defineProperty(object2, key, {
    get() {
      if (value === EVALUATING) {
        return void 0;
      }
      if (value === void 0) {
        value = EVALUATING;
        value = getter();
      }
      return value;
    },
    set(v) {
      Object.defineProperty(object2, key, {
        value: v
        // configurable: true,
      });
    },
    configurable: true
  });
}
function objectClone(obj) {
  return Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj));
}
function assignProp(target, prop, value) {
  Object.defineProperty(target, prop, {
    value,
    writable: true,
    enumerable: true,
    configurable: true
  });
}
function mergeDefs(...defs) {
  const mergedDescriptors = {};
  for (const def of defs) {
    const descriptors = Object.getOwnPropertyDescriptors(def);
    Object.assign(mergedDescriptors, descriptors);
  }
  return Object.defineProperties({}, mergedDescriptors);
}
function cloneDef(schema) {
  return mergeDefs(schema._zod.def);
}
function getElementAtPath(obj, path) {
  if (!path)
    return obj;
  return path.reduce((acc, key) => acc?.[key], obj);
}
function promiseAllObject(promisesObj) {
  const keys = Object.keys(promisesObj);
  const promises = keys.map((key) => promisesObj[key]);
  return Promise.all(promises).then((results) => {
    const resolvedObj = {};
    for (let i = 0; i < keys.length; i++) {
      resolvedObj[keys[i]] = results[i];
    }
    return resolvedObj;
  });
}
function randomString(length = 10) {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  let str = "";
  for (let i = 0; i < length; i++) {
    str += chars[Math.floor(Math.random() * chars.length)];
  }
  return str;
}
function esc(str) {
  return JSON.stringify(str);
}
function slugify(input) {
  return input.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
var captureStackTrace = "captureStackTrace" in Error ? Error.captureStackTrace : (..._args) => {
};
function isObject(data) {
  return typeof data === "object" && data !== null && !Array.isArray(data);
}
var allowsEval = cached(() => {
  if (typeof navigator !== "undefined" && navigator?.userAgent?.includes("Cloudflare")) {
    return false;
  }
  try {
    const F = Function;
    new F("");
    return true;
  } catch (_) {
    return false;
  }
});
function isPlainObject(o) {
  if (isObject(o) === false)
    return false;
  const ctor = o.constructor;
  if (ctor === void 0)
    return true;
  if (typeof ctor !== "function")
    return true;
  const prot = ctor.prototype;
  if (isObject(prot) === false)
    return false;
  if (Object.prototype.hasOwnProperty.call(prot, "isPrototypeOf") === false) {
    return false;
  }
  return true;
}
function shallowClone(o) {
  if (isPlainObject(o))
    return { ...o };
  if (Array.isArray(o))
    return [...o];
  return o;
}
function numKeys(data) {
  let keyCount = 0;
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      keyCount++;
    }
  }
  return keyCount;
}
var getParsedType = (data) => {
  const t = typeof data;
  switch (t) {
    case "undefined":
      return "undefined";
    case "string":
      return "string";
    case "number":
      return Number.isNaN(data) ? "nan" : "number";
    case "boolean":
      return "boolean";
    case "function":
      return "function";
    case "bigint":
      return "bigint";
    case "symbol":
      return "symbol";
    case "object":
      if (Array.isArray(data)) {
        return "array";
      }
      if (data === null) {
        return "null";
      }
      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
        return "promise";
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return "map";
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return "set";
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return "date";
      }
      if (typeof File !== "undefined" && data instanceof File) {
        return "file";
      }
      return "object";
    default:
      throw new Error(`Unknown data type: ${t}`);
  }
};
var propertyKeyTypes = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
var primitiveTypes = /* @__PURE__ */ new Set(["string", "number", "bigint", "boolean", "symbol", "undefined"]);
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function clone(inst, def, params) {
  const cl = new inst._zod.constr(def ?? inst._zod.def);
  if (!def || params?.parent)
    cl._zod.parent = inst;
  return cl;
}
function normalizeParams(_params) {
  const params = _params;
  if (!params)
    return {};
  if (typeof params === "string")
    return { error: () => params };
  if (params?.message !== void 0) {
    if (params?.error !== void 0)
      throw new Error("Cannot specify both `message` and `error` params");
    params.error = params.message;
  }
  delete params.message;
  if (typeof params.error === "string")
    return { ...params, error: () => params.error };
  return params;
}
function createTransparentProxy(getter) {
  let target;
  return new Proxy({}, {
    get(_, prop, receiver) {
      target ?? (target = getter());
      return Reflect.get(target, prop, receiver);
    },
    set(_, prop, value, receiver) {
      target ?? (target = getter());
      return Reflect.set(target, prop, value, receiver);
    },
    has(_, prop) {
      target ?? (target = getter());
      return Reflect.has(target, prop);
    },
    deleteProperty(_, prop) {
      target ?? (target = getter());
      return Reflect.deleteProperty(target, prop);
    },
    ownKeys(_) {
      target ?? (target = getter());
      return Reflect.ownKeys(target);
    },
    getOwnPropertyDescriptor(_, prop) {
      target ?? (target = getter());
      return Reflect.getOwnPropertyDescriptor(target, prop);
    },
    defineProperty(_, prop, descriptor) {
      target ?? (target = getter());
      return Reflect.defineProperty(target, prop, descriptor);
    }
  });
}
function stringifyPrimitive(value) {
  if (typeof value === "bigint")
    return value.toString() + "n";
  if (typeof value === "string")
    return `"${value}"`;
  return `${value}`;
}
function optionalKeys(shape) {
  return Object.keys(shape).filter((k) => {
    return shape[k]._zod.optin === "optional" && shape[k]._zod.optout === "optional";
  });
}
var NUMBER_FORMAT_RANGES = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-34028234663852886e22, 34028234663852886e22],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
};
var BIGINT_FORMAT_RANGES = {
  int64: [/* @__PURE__ */ BigInt("-9223372036854775808"), /* @__PURE__ */ BigInt("9223372036854775807")],
  uint64: [/* @__PURE__ */ BigInt(0), /* @__PURE__ */ BigInt("18446744073709551615")]
};
function pick(schema, mask) {
  const currDef = schema._zod.def;
  const checks = currDef.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    throw new Error(".pick() cannot be used on object schemas containing refinements");
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const newShape = {};
      for (const key in mask) {
        if (!(key in currDef.shape)) {
          throw new Error(`Unrecognized key: "${key}"`);
        }
        if (!mask[key])
          continue;
        newShape[key] = currDef.shape[key];
      }
      assignProp(this, "shape", newShape);
      return newShape;
    },
    checks: []
  });
  return clone(schema, def);
}
function omit(schema, mask) {
  const currDef = schema._zod.def;
  const checks = currDef.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    throw new Error(".omit() cannot be used on object schemas containing refinements");
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const newShape = { ...schema._zod.def.shape };
      for (const key in mask) {
        if (!(key in currDef.shape)) {
          throw new Error(`Unrecognized key: "${key}"`);
        }
        if (!mask[key])
          continue;
        delete newShape[key];
      }
      assignProp(this, "shape", newShape);
      return newShape;
    },
    checks: []
  });
  return clone(schema, def);
}
function extend(schema, shape) {
  if (!isPlainObject(shape)) {
    throw new Error("Invalid input to extend: expected a plain object");
  }
  const checks = schema._zod.def.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    const existingShape = schema._zod.def.shape;
    for (const key in shape) {
      if (Object.getOwnPropertyDescriptor(existingShape, key) !== void 0) {
        throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
      }
    }
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const _shape = { ...schema._zod.def.shape, ...shape };
      assignProp(this, "shape", _shape);
      return _shape;
    }
  });
  return clone(schema, def);
}
function safeExtend(schema, shape) {
  if (!isPlainObject(shape)) {
    throw new Error("Invalid input to safeExtend: expected a plain object");
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const _shape = { ...schema._zod.def.shape, ...shape };
      assignProp(this, "shape", _shape);
      return _shape;
    }
  });
  return clone(schema, def);
}
function merge(a, b) {
  const def = mergeDefs(a._zod.def, {
    get shape() {
      const _shape = { ...a._zod.def.shape, ...b._zod.def.shape };
      assignProp(this, "shape", _shape);
      return _shape;
    },
    get catchall() {
      return b._zod.def.catchall;
    },
    checks: []
    // delete existing checks
  });
  return clone(a, def);
}
function partial(Class2, schema, mask) {
  const currDef = schema._zod.def;
  const checks = currDef.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    throw new Error(".partial() cannot be used on object schemas containing refinements");
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const oldShape = schema._zod.def.shape;
      const shape = { ...oldShape };
      if (mask) {
        for (const key in mask) {
          if (!(key in oldShape)) {
            throw new Error(`Unrecognized key: "${key}"`);
          }
          if (!mask[key])
            continue;
          shape[key] = Class2 ? new Class2({
            type: "optional",
            innerType: oldShape[key]
          }) : oldShape[key];
        }
      } else {
        for (const key in oldShape) {
          shape[key] = Class2 ? new Class2({
            type: "optional",
            innerType: oldShape[key]
          }) : oldShape[key];
        }
      }
      assignProp(this, "shape", shape);
      return shape;
    },
    checks: []
  });
  return clone(schema, def);
}
function required(Class2, schema, mask) {
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const oldShape = schema._zod.def.shape;
      const shape = { ...oldShape };
      if (mask) {
        for (const key in mask) {
          if (!(key in shape)) {
            throw new Error(`Unrecognized key: "${key}"`);
          }
          if (!mask[key])
            continue;
          shape[key] = new Class2({
            type: "nonoptional",
            innerType: oldShape[key]
          });
        }
      } else {
        for (const key in oldShape) {
          shape[key] = new Class2({
            type: "nonoptional",
            innerType: oldShape[key]
          });
        }
      }
      assignProp(this, "shape", shape);
      return shape;
    }
  });
  return clone(schema, def);
}
function aborted(x, startIndex = 0) {
  if (x.aborted === true)
    return true;
  for (let i = startIndex; i < x.issues.length; i++) {
    if (x.issues[i]?.continue !== true) {
      return true;
    }
  }
  return false;
}
function prefixIssues(path, issues) {
  return issues.map((iss) => {
    var _a2;
    (_a2 = iss).path ?? (_a2.path = []);
    iss.path.unshift(path);
    return iss;
  });
}
function unwrapMessage(message) {
  return typeof message === "string" ? message : message?.message;
}
function finalizeIssue(iss, ctx, config2) {
  const full = { ...iss, path: iss.path ?? [] };
  if (!iss.message) {
    const message = unwrapMessage(iss.inst?._zod.def?.error?.(iss)) ?? unwrapMessage(ctx?.error?.(iss)) ?? unwrapMessage(config2.customError?.(iss)) ?? unwrapMessage(config2.localeError?.(iss)) ?? "Invalid input";
    full.message = message;
  }
  delete full.inst;
  delete full.continue;
  if (!ctx?.reportInput) {
    delete full.input;
  }
  return full;
}
function getSizableOrigin(input) {
  if (input instanceof Set)
    return "set";
  if (input instanceof Map)
    return "map";
  if (input instanceof File)
    return "file";
  return "unknown";
}
function getLengthableOrigin(input) {
  if (Array.isArray(input))
    return "array";
  if (typeof input === "string")
    return "string";
  return "unknown";
}
function parsedType(data) {
  const t = typeof data;
  switch (t) {
    case "number": {
      return Number.isNaN(data) ? "nan" : "number";
    }
    case "object": {
      if (data === null) {
        return "null";
      }
      if (Array.isArray(data)) {
        return "array";
      }
      const obj = data;
      if (obj && Object.getPrototypeOf(obj) !== Object.prototype && "constructor" in obj && obj.constructor) {
        return obj.constructor.name;
      }
    }
  }
  return t;
}
function issue(...args) {
  const [iss, input, inst] = args;
  if (typeof iss === "string") {
    return {
      message: iss,
      code: "custom",
      input,
      inst
    };
  }
  return { ...iss };
}
function cleanEnum(obj) {
  return Object.entries(obj).filter(([k, _]) => {
    return Number.isNaN(Number.parseInt(k, 10));
  }).map((el) => el[1]);
}
function base64ToUint8Array(base643) {
  const binaryString = atob(base643);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
function uint8ArrayToBase64(bytes) {
  let binaryString = "";
  for (let i = 0; i < bytes.length; i++) {
    binaryString += String.fromCharCode(bytes[i]);
  }
  return btoa(binaryString);
}
function base64urlToUint8Array(base64url3) {
  const base643 = base64url3.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - base643.length % 4) % 4);
  return base64ToUint8Array(base643 + padding);
}
function uint8ArrayToBase64url(bytes) {
  return uint8ArrayToBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
function hexToUint8Array(hex3) {
  const cleanHex = hex3.replace(/^0x/, "");
  if (cleanHex.length % 2 !== 0) {
    throw new Error("Invalid hex string length");
  }
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = Number.parseInt(cleanHex.slice(i, i + 2), 16);
  }
  return bytes;
}
function uint8ArrayToHex(bytes) {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}
var Class = class {
  constructor(..._args) {
  }
};

// ../../node_modules/zod/v4/core/errors.js
var initializer = (inst, def) => {
  inst.name = "$ZodError";
  Object.defineProperty(inst, "_zod", {
    value: inst._zod,
    enumerable: false
  });
  Object.defineProperty(inst, "issues", {
    value: def,
    enumerable: false
  });
  inst.message = JSON.stringify(def, jsonStringifyReplacer, 2);
  Object.defineProperty(inst, "toString", {
    value: () => inst.message,
    enumerable: false
  });
};
var $ZodError = $constructor("$ZodError", initializer);
var $ZodRealError = $constructor("$ZodError", initializer, { Parent: Error });
function flattenError(error48, mapper = (issue2) => issue2.message) {
  const fieldErrors = {};
  const formErrors = [];
  for (const sub of error48.issues) {
    if (sub.path.length > 0) {
      fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
      fieldErrors[sub.path[0]].push(mapper(sub));
    } else {
      formErrors.push(mapper(sub));
    }
  }
  return { formErrors, fieldErrors };
}
function formatError(error48, mapper = (issue2) => issue2.message) {
  const fieldErrors = { _errors: [] };
  const processError = (error49) => {
    for (const issue2 of error49.issues) {
      if (issue2.code === "invalid_union" && issue2.errors.length) {
        issue2.errors.map((issues) => processError({ issues }));
      } else if (issue2.code === "invalid_key") {
        processError({ issues: issue2.issues });
      } else if (issue2.code === "invalid_element") {
        processError({ issues: issue2.issues });
      } else if (issue2.path.length === 0) {
        fieldErrors._errors.push(mapper(issue2));
      } else {
        let curr = fieldErrors;
        let i = 0;
        while (i < issue2.path.length) {
          const el = issue2.path[i];
          const terminal = i === issue2.path.length - 1;
          if (!terminal) {
            curr[el] = curr[el] || { _errors: [] };
          } else {
            curr[el] = curr[el] || { _errors: [] };
            curr[el]._errors.push(mapper(issue2));
          }
          curr = curr[el];
          i++;
        }
      }
    }
  };
  processError(error48);
  return fieldErrors;
}
function treeifyError(error48, mapper = (issue2) => issue2.message) {
  const result = { errors: [] };
  const processError = (error49, path = []) => {
    var _a2, _b;
    for (const issue2 of error49.issues) {
      if (issue2.code === "invalid_union" && issue2.errors.length) {
        issue2.errors.map((issues) => processError({ issues }, issue2.path));
      } else if (issue2.code === "invalid_key") {
        processError({ issues: issue2.issues }, issue2.path);
      } else if (issue2.code === "invalid_element") {
        processError({ issues: issue2.issues }, issue2.path);
      } else {
        const fullpath = [...path, ...issue2.path];
        if (fullpath.length === 0) {
          result.errors.push(mapper(issue2));
          continue;
        }
        let curr = result;
        let i = 0;
        while (i < fullpath.length) {
          const el = fullpath[i];
          const terminal = i === fullpath.length - 1;
          if (typeof el === "string") {
            curr.properties ?? (curr.properties = {});
            (_a2 = curr.properties)[el] ?? (_a2[el] = { errors: [] });
            curr = curr.properties[el];
          } else {
            curr.items ?? (curr.items = []);
            (_b = curr.items)[el] ?? (_b[el] = { errors: [] });
            curr = curr.items[el];
          }
          if (terminal) {
            curr.errors.push(mapper(issue2));
          }
          i++;
        }
      }
    }
  };
  processError(error48);
  return result;
}
function toDotPath(_path) {
  const segs = [];
  const path = _path.map((seg) => typeof seg === "object" ? seg.key : seg);
  for (const seg of path) {
    if (typeof seg === "number")
      segs.push(`[${seg}]`);
    else if (typeof seg === "symbol")
      segs.push(`[${JSON.stringify(String(seg))}]`);
    else if (/[^\w$]/.test(seg))
      segs.push(`[${JSON.stringify(seg)}]`);
    else {
      if (segs.length)
        segs.push(".");
      segs.push(seg);
    }
  }
  return segs.join("");
}
function prettifyError(error48) {
  const lines = [];
  const issues = [...error48.issues].sort((a, b) => (a.path ?? []).length - (b.path ?? []).length);
  for (const issue2 of issues) {
    lines.push(`\u2716 ${issue2.message}`);
    if (issue2.path?.length)
      lines.push(`  \u2192 at ${toDotPath(issue2.path)}`);
  }
  return lines.join("\n");
}

// ../../node_modules/zod/v4/core/parse.js
var _parse = (_Err) => (schema, value, _ctx, _params) => {
  const ctx = _ctx ? Object.assign(_ctx, { async: false }) : { async: false };
  const result = schema._zod.run({ value, issues: [] }, ctx);
  if (result instanceof Promise) {
    throw new $ZodAsyncError();
  }
  if (result.issues.length) {
    const e = new (_params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
    captureStackTrace(e, _params?.callee);
    throw e;
  }
  return result.value;
};
var parse = /* @__PURE__ */ _parse($ZodRealError);
var _parseAsync = (_Err) => async (schema, value, _ctx, params) => {
  const ctx = _ctx ? Object.assign(_ctx, { async: true }) : { async: true };
  let result = schema._zod.run({ value, issues: [] }, ctx);
  if (result instanceof Promise)
    result = await result;
  if (result.issues.length) {
    const e = new (params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
    captureStackTrace(e, params?.callee);
    throw e;
  }
  return result.value;
};
var parseAsync = /* @__PURE__ */ _parseAsync($ZodRealError);
var _safeParse = (_Err) => (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, async: false } : { async: false };
  const result = schema._zod.run({ value, issues: [] }, ctx);
  if (result instanceof Promise) {
    throw new $ZodAsyncError();
  }
  return result.issues.length ? {
    success: false,
    error: new (_Err ?? $ZodError)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
  } : { success: true, data: result.value };
};
var safeParse = /* @__PURE__ */ _safeParse($ZodRealError);
var _safeParseAsync = (_Err) => async (schema, value, _ctx) => {
  const ctx = _ctx ? Object.assign(_ctx, { async: true }) : { async: true };
  let result = schema._zod.run({ value, issues: [] }, ctx);
  if (result instanceof Promise)
    result = await result;
  return result.issues.length ? {
    success: false,
    error: new _Err(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
  } : { success: true, data: result.value };
};
var safeParseAsync = /* @__PURE__ */ _safeParseAsync($ZodRealError);
var _encode = (_Err) => (schema, value, _ctx) => {
  const ctx = _ctx ? Object.assign(_ctx, { direction: "backward" }) : { direction: "backward" };
  return _parse(_Err)(schema, value, ctx);
};
var encode = /* @__PURE__ */ _encode($ZodRealError);
var _decode = (_Err) => (schema, value, _ctx) => {
  return _parse(_Err)(schema, value, _ctx);
};
var decode = /* @__PURE__ */ _decode($ZodRealError);
var _encodeAsync = (_Err) => async (schema, value, _ctx) => {
  const ctx = _ctx ? Object.assign(_ctx, { direction: "backward" }) : { direction: "backward" };
  return _parseAsync(_Err)(schema, value, ctx);
};
var encodeAsync = /* @__PURE__ */ _encodeAsync($ZodRealError);
var _decodeAsync = (_Err) => async (schema, value, _ctx) => {
  return _parseAsync(_Err)(schema, value, _ctx);
};
var decodeAsync = /* @__PURE__ */ _decodeAsync($ZodRealError);
var _safeEncode = (_Err) => (schema, value, _ctx) => {
  const ctx = _ctx ? Object.assign(_ctx, { direction: "backward" }) : { direction: "backward" };
  return _safeParse(_Err)(schema, value, ctx);
};
var safeEncode = /* @__PURE__ */ _safeEncode($ZodRealError);
var _safeDecode = (_Err) => (schema, value, _ctx) => {
  return _safeParse(_Err)(schema, value, _ctx);
};
var safeDecode = /* @__PURE__ */ _safeDecode($ZodRealError);
var _safeEncodeAsync = (_Err) => async (schema, value, _ctx) => {
  const ctx = _ctx ? Object.assign(_ctx, { direction: "backward" }) : { direction: "backward" };
  return _safeParseAsync(_Err)(schema, value, ctx);
};
var safeEncodeAsync = /* @__PURE__ */ _safeEncodeAsync($ZodRealError);
var _safeDecodeAsync = (_Err) => async (schema, value, _ctx) => {
  return _safeParseAsync(_Err)(schema, value, _ctx);
};
var safeDecodeAsync = /* @__PURE__ */ _safeDecodeAsync($ZodRealError);

// ../../node_modules/zod/v4/core/regexes.js
var regexes_exports = {};
__export(regexes_exports, {
  base64: () => base64,
  base64url: () => base64url,
  bigint: () => bigint,
  boolean: () => boolean,
  browserEmail: () => browserEmail,
  cidrv4: () => cidrv4,
  cidrv6: () => cidrv6,
  cuid: () => cuid,
  cuid2: () => cuid2,
  date: () => date,
  datetime: () => datetime,
  domain: () => domain,
  duration: () => duration,
  e164: () => e164,
  email: () => email,
  emoji: () => emoji,
  extendedDuration: () => extendedDuration,
  guid: () => guid,
  hex: () => hex,
  hostname: () => hostname,
  html5Email: () => html5Email,
  idnEmail: () => idnEmail,
  integer: () => integer,
  ipv4: () => ipv4,
  ipv6: () => ipv6,
  ksuid: () => ksuid,
  lowercase: () => lowercase,
  mac: () => mac,
  md5_base64: () => md5_base64,
  md5_base64url: () => md5_base64url,
  md5_hex: () => md5_hex,
  nanoid: () => nanoid,
  null: () => _null,
  number: () => number,
  rfc5322Email: () => rfc5322Email,
  sha1_base64: () => sha1_base64,
  sha1_base64url: () => sha1_base64url,
  sha1_hex: () => sha1_hex,
  sha256_base64: () => sha256_base64,
  sha256_base64url: () => sha256_base64url,
  sha256_hex: () => sha256_hex,
  sha384_base64: () => sha384_base64,
  sha384_base64url: () => sha384_base64url,
  sha384_hex: () => sha384_hex,
  sha512_base64: () => sha512_base64,
  sha512_base64url: () => sha512_base64url,
  sha512_hex: () => sha512_hex,
  string: () => string,
  time: () => time,
  ulid: () => ulid,
  undefined: () => _undefined,
  unicodeEmail: () => unicodeEmail,
  uppercase: () => uppercase,
  uuid: () => uuid,
  uuid4: () => uuid4,
  uuid6: () => uuid6,
  uuid7: () => uuid7,
  xid: () => xid
});
var cuid = /^[cC][^\s-]{8,}$/;
var cuid2 = /^[0-9a-z]+$/;
var ulid = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/;
var xid = /^[0-9a-vA-V]{20}$/;
var ksuid = /^[A-Za-z0-9]{27}$/;
var nanoid = /^[a-zA-Z0-9_-]{21}$/;
var duration = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/;
var extendedDuration = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
var guid = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
var uuid = (version2) => {
  if (!version2)
    return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;
  return new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version2}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`);
};
var uuid4 = /* @__PURE__ */ uuid(4);
var uuid6 = /* @__PURE__ */ uuid(6);
var uuid7 = /* @__PURE__ */ uuid(7);
var email = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
var html5Email = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
var rfc5322Email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
var unicodeEmail = /^[^\s@"]{1,64}@[^\s@]{1,255}$/u;
var idnEmail = unicodeEmail;
var browserEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
var _emoji = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
function emoji() {
  return new RegExp(_emoji, "u");
}
var ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
var mac = (delimiter) => {
  const escapedDelim = escapeRegex(delimiter ?? ":");
  return new RegExp(`^(?:[0-9A-F]{2}${escapedDelim}){5}[0-9A-F]{2}$|^(?:[0-9a-f]{2}${escapedDelim}){5}[0-9a-f]{2}$`);
};
var cidrv4 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/;
var cidrv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/;
var base64url = /^[A-Za-z0-9_-]*$/;
var hostname = /^(?=.{1,253}\.?$)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[-0-9a-zA-Z]{0,61}[0-9a-zA-Z])?)*\.?$/;
var domain = /^([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
var e164 = /^\+[1-9]\d{6,14}$/;
var dateSource = `(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`;
var date = /* @__PURE__ */ new RegExp(`^${dateSource}$`);
function timeSource(args) {
  const hhmm = `(?:[01]\\d|2[0-3]):[0-5]\\d`;
  const regex = typeof args.precision === "number" ? args.precision === -1 ? `${hhmm}` : args.precision === 0 ? `${hhmm}:[0-5]\\d` : `${hhmm}:[0-5]\\d\\.\\d{${args.precision}}` : `${hhmm}(?::[0-5]\\d(?:\\.\\d+)?)?`;
  return regex;
}
function time(args) {
  return new RegExp(`^${timeSource(args)}$`);
}
function datetime(args) {
  const time3 = timeSource({ precision: args.precision });
  const opts = ["Z"];
  if (args.local)
    opts.push("");
  if (args.offset)
    opts.push(`([+-](?:[01]\\d|2[0-3]):[0-5]\\d)`);
  const timeRegex = `${time3}(?:${opts.join("|")})`;
  return new RegExp(`^${dateSource}T(?:${timeRegex})$`);
}
var string = (params) => {
  const regex = params ? `[\\s\\S]{${params?.minimum ?? 0},${params?.maximum ?? ""}}` : `[\\s\\S]*`;
  return new RegExp(`^${regex}$`);
};
var bigint = /^-?\d+n?$/;
var integer = /^-?\d+$/;
var number = /^-?\d+(?:\.\d+)?$/;
var boolean = /^(?:true|false)$/i;
var _null = /^null$/i;
var _undefined = /^undefined$/i;
var lowercase = /^[^A-Z]*$/;
var uppercase = /^[^a-z]*$/;
var hex = /^[0-9a-fA-F]*$/;
function fixedBase64(bodyLength, padding) {
  return new RegExp(`^[A-Za-z0-9+/]{${bodyLength}}${padding}$`);
}
function fixedBase64url(length) {
  return new RegExp(`^[A-Za-z0-9_-]{${length}}$`);
}
var md5_hex = /^[0-9a-fA-F]{32}$/;
var md5_base64 = /* @__PURE__ */ fixedBase64(22, "==");
var md5_base64url = /* @__PURE__ */ fixedBase64url(22);
var sha1_hex = /^[0-9a-fA-F]{40}$/;
var sha1_base64 = /* @__PURE__ */ fixedBase64(27, "=");
var sha1_base64url = /* @__PURE__ */ fixedBase64url(27);
var sha256_hex = /^[0-9a-fA-F]{64}$/;
var sha256_base64 = /* @__PURE__ */ fixedBase64(43, "=");
var sha256_base64url = /* @__PURE__ */ fixedBase64url(43);
var sha384_hex = /^[0-9a-fA-F]{96}$/;
var sha384_base64 = /* @__PURE__ */ fixedBase64(64, "");
var sha384_base64url = /* @__PURE__ */ fixedBase64url(64);
var sha512_hex = /^[0-9a-fA-F]{128}$/;
var sha512_base64 = /* @__PURE__ */ fixedBase64(86, "==");
var sha512_base64url = /* @__PURE__ */ fixedBase64url(86);

// ../../node_modules/zod/v4/core/checks.js
var $ZodCheck = /* @__PURE__ */ $constructor("$ZodCheck", (inst, def) => {
  var _a2;
  inst._zod ?? (inst._zod = {});
  inst._zod.def = def;
  (_a2 = inst._zod).onattach ?? (_a2.onattach = []);
});
var numericOriginMap = {
  number: "number",
  bigint: "bigint",
  object: "date"
};
var $ZodCheckLessThan = /* @__PURE__ */ $constructor("$ZodCheckLessThan", (inst, def) => {
  $ZodCheck.init(inst, def);
  const origin = numericOriginMap[typeof def.value];
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    const curr = (def.inclusive ? bag.maximum : bag.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
    if (def.value < curr) {
      if (def.inclusive)
        bag.maximum = def.value;
      else
        bag.exclusiveMaximum = def.value;
    }
  });
  inst._zod.check = (payload) => {
    if (def.inclusive ? payload.value <= def.value : payload.value < def.value) {
      return;
    }
    payload.issues.push({
      origin,
      code: "too_big",
      maximum: typeof def.value === "object" ? def.value.getTime() : def.value,
      input: payload.value,
      inclusive: def.inclusive,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckGreaterThan = /* @__PURE__ */ $constructor("$ZodCheckGreaterThan", (inst, def) => {
  $ZodCheck.init(inst, def);
  const origin = numericOriginMap[typeof def.value];
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    const curr = (def.inclusive ? bag.minimum : bag.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
    if (def.value > curr) {
      if (def.inclusive)
        bag.minimum = def.value;
      else
        bag.exclusiveMinimum = def.value;
    }
  });
  inst._zod.check = (payload) => {
    if (def.inclusive ? payload.value >= def.value : payload.value > def.value) {
      return;
    }
    payload.issues.push({
      origin,
      code: "too_small",
      minimum: typeof def.value === "object" ? def.value.getTime() : def.value,
      input: payload.value,
      inclusive: def.inclusive,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckMultipleOf = /* @__PURE__ */ $constructor("$ZodCheckMultipleOf", (inst, def) => {
  $ZodCheck.init(inst, def);
  inst._zod.onattach.push((inst2) => {
    var _a2;
    (_a2 = inst2._zod.bag).multipleOf ?? (_a2.multipleOf = def.value);
  });
  inst._zod.check = (payload) => {
    if (typeof payload.value !== typeof def.value)
      throw new Error("Cannot mix number and bigint in multiple_of check.");
    const isMultiple = typeof payload.value === "bigint" ? payload.value % def.value === BigInt(0) : floatSafeRemainder(payload.value, def.value) === 0;
    if (isMultiple)
      return;
    payload.issues.push({
      origin: typeof payload.value,
      code: "not_multiple_of",
      divisor: def.value,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckNumberFormat = /* @__PURE__ */ $constructor("$ZodCheckNumberFormat", (inst, def) => {
  $ZodCheck.init(inst, def);
  def.format = def.format || "float64";
  const isInt = def.format?.includes("int");
  const origin = isInt ? "int" : "number";
  const [minimum, maximum] = NUMBER_FORMAT_RANGES[def.format];
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    bag.format = def.format;
    bag.minimum = minimum;
    bag.maximum = maximum;
    if (isInt)
      bag.pattern = integer;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    if (isInt) {
      if (!Number.isInteger(input)) {
        payload.issues.push({
          expected: origin,
          format: def.format,
          code: "invalid_type",
          continue: false,
          input,
          inst
        });
        return;
      }
      if (!Number.isSafeInteger(input)) {
        if (input > 0) {
          payload.issues.push({
            input,
            code: "too_big",
            maximum: Number.MAX_SAFE_INTEGER,
            note: "Integers must be within the safe integer range.",
            inst,
            origin,
            inclusive: true,
            continue: !def.abort
          });
        } else {
          payload.issues.push({
            input,
            code: "too_small",
            minimum: Number.MIN_SAFE_INTEGER,
            note: "Integers must be within the safe integer range.",
            inst,
            origin,
            inclusive: true,
            continue: !def.abort
          });
        }
        return;
      }
    }
    if (input < minimum) {
      payload.issues.push({
        origin: "number",
        input,
        code: "too_small",
        minimum,
        inclusive: true,
        inst,
        continue: !def.abort
      });
    }
    if (input > maximum) {
      payload.issues.push({
        origin: "number",
        input,
        code: "too_big",
        maximum,
        inclusive: true,
        inst,
        continue: !def.abort
      });
    }
  };
});
var $ZodCheckBigIntFormat = /* @__PURE__ */ $constructor("$ZodCheckBigIntFormat", (inst, def) => {
  $ZodCheck.init(inst, def);
  const [minimum, maximum] = BIGINT_FORMAT_RANGES[def.format];
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    bag.format = def.format;
    bag.minimum = minimum;
    bag.maximum = maximum;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    if (input < minimum) {
      payload.issues.push({
        origin: "bigint",
        input,
        code: "too_small",
        minimum,
        inclusive: true,
        inst,
        continue: !def.abort
      });
    }
    if (input > maximum) {
      payload.issues.push({
        origin: "bigint",
        input,
        code: "too_big",
        maximum,
        inclusive: true,
        inst,
        continue: !def.abort
      });
    }
  };
});
var $ZodCheckMaxSize = /* @__PURE__ */ $constructor("$ZodCheckMaxSize", (inst, def) => {
  var _a2;
  $ZodCheck.init(inst, def);
  (_a2 = inst._zod.def).when ?? (_a2.when = (payload) => {
    const val = payload.value;
    return !nullish(val) && val.size !== void 0;
  });
  inst._zod.onattach.push((inst2) => {
    const curr = inst2._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
    if (def.maximum < curr)
      inst2._zod.bag.maximum = def.maximum;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    const size = input.size;
    if (size <= def.maximum)
      return;
    payload.issues.push({
      origin: getSizableOrigin(input),
      code: "too_big",
      maximum: def.maximum,
      inclusive: true,
      input,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckMinSize = /* @__PURE__ */ $constructor("$ZodCheckMinSize", (inst, def) => {
  var _a2;
  $ZodCheck.init(inst, def);
  (_a2 = inst._zod.def).when ?? (_a2.when = (payload) => {
    const val = payload.value;
    return !nullish(val) && val.size !== void 0;
  });
  inst._zod.onattach.push((inst2) => {
    const curr = inst2._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
    if (def.minimum > curr)
      inst2._zod.bag.minimum = def.minimum;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    const size = input.size;
    if (size >= def.minimum)
      return;
    payload.issues.push({
      origin: getSizableOrigin(input),
      code: "too_small",
      minimum: def.minimum,
      inclusive: true,
      input,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckSizeEquals = /* @__PURE__ */ $constructor("$ZodCheckSizeEquals", (inst, def) => {
  var _a2;
  $ZodCheck.init(inst, def);
  (_a2 = inst._zod.def).when ?? (_a2.when = (payload) => {
    const val = payload.value;
    return !nullish(val) && val.size !== void 0;
  });
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    bag.minimum = def.size;
    bag.maximum = def.size;
    bag.size = def.size;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    const size = input.size;
    if (size === def.size)
      return;
    const tooBig = size > def.size;
    payload.issues.push({
      origin: getSizableOrigin(input),
      ...tooBig ? { code: "too_big", maximum: def.size } : { code: "too_small", minimum: def.size },
      inclusive: true,
      exact: true,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckMaxLength = /* @__PURE__ */ $constructor("$ZodCheckMaxLength", (inst, def) => {
  var _a2;
  $ZodCheck.init(inst, def);
  (_a2 = inst._zod.def).when ?? (_a2.when = (payload) => {
    const val = payload.value;
    return !nullish(val) && val.length !== void 0;
  });
  inst._zod.onattach.push((inst2) => {
    const curr = inst2._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
    if (def.maximum < curr)
      inst2._zod.bag.maximum = def.maximum;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    const length = input.length;
    if (length <= def.maximum)
      return;
    const origin = getLengthableOrigin(input);
    payload.issues.push({
      origin,
      code: "too_big",
      maximum: def.maximum,
      inclusive: true,
      input,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckMinLength = /* @__PURE__ */ $constructor("$ZodCheckMinLength", (inst, def) => {
  var _a2;
  $ZodCheck.init(inst, def);
  (_a2 = inst._zod.def).when ?? (_a2.when = (payload) => {
    const val = payload.value;
    return !nullish(val) && val.length !== void 0;
  });
  inst._zod.onattach.push((inst2) => {
    const curr = inst2._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
    if (def.minimum > curr)
      inst2._zod.bag.minimum = def.minimum;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    const length = input.length;
    if (length >= def.minimum)
      return;
    const origin = getLengthableOrigin(input);
    payload.issues.push({
      origin,
      code: "too_small",
      minimum: def.minimum,
      inclusive: true,
      input,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckLengthEquals = /* @__PURE__ */ $constructor("$ZodCheckLengthEquals", (inst, def) => {
  var _a2;
  $ZodCheck.init(inst, def);
  (_a2 = inst._zod.def).when ?? (_a2.when = (payload) => {
    const val = payload.value;
    return !nullish(val) && val.length !== void 0;
  });
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    bag.minimum = def.length;
    bag.maximum = def.length;
    bag.length = def.length;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    const length = input.length;
    if (length === def.length)
      return;
    const origin = getLengthableOrigin(input);
    const tooBig = length > def.length;
    payload.issues.push({
      origin,
      ...tooBig ? { code: "too_big", maximum: def.length } : { code: "too_small", minimum: def.length },
      inclusive: true,
      exact: true,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckStringFormat = /* @__PURE__ */ $constructor("$ZodCheckStringFormat", (inst, def) => {
  var _a2, _b;
  $ZodCheck.init(inst, def);
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    bag.format = def.format;
    if (def.pattern) {
      bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
      bag.patterns.add(def.pattern);
    }
  });
  if (def.pattern)
    (_a2 = inst._zod).check ?? (_a2.check = (payload) => {
      def.pattern.lastIndex = 0;
      if (def.pattern.test(payload.value))
        return;
      payload.issues.push({
        origin: "string",
        code: "invalid_format",
        format: def.format,
        input: payload.value,
        ...def.pattern ? { pattern: def.pattern.toString() } : {},
        inst,
        continue: !def.abort
      });
    });
  else
    (_b = inst._zod).check ?? (_b.check = () => {
    });
});
var $ZodCheckRegex = /* @__PURE__ */ $constructor("$ZodCheckRegex", (inst, def) => {
  $ZodCheckStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    def.pattern.lastIndex = 0;
    if (def.pattern.test(payload.value))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "regex",
      input: payload.value,
      pattern: def.pattern.toString(),
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckLowerCase = /* @__PURE__ */ $constructor("$ZodCheckLowerCase", (inst, def) => {
  def.pattern ?? (def.pattern = lowercase);
  $ZodCheckStringFormat.init(inst, def);
});
var $ZodCheckUpperCase = /* @__PURE__ */ $constructor("$ZodCheckUpperCase", (inst, def) => {
  def.pattern ?? (def.pattern = uppercase);
  $ZodCheckStringFormat.init(inst, def);
});
var $ZodCheckIncludes = /* @__PURE__ */ $constructor("$ZodCheckIncludes", (inst, def) => {
  $ZodCheck.init(inst, def);
  const escapedRegex = escapeRegex(def.includes);
  const pattern = new RegExp(typeof def.position === "number" ? `^.{${def.position}}${escapedRegex}` : escapedRegex);
  def.pattern = pattern;
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
    bag.patterns.add(pattern);
  });
  inst._zod.check = (payload) => {
    if (payload.value.includes(def.includes, def.position))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "includes",
      includes: def.includes,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckStartsWith = /* @__PURE__ */ $constructor("$ZodCheckStartsWith", (inst, def) => {
  $ZodCheck.init(inst, def);
  const pattern = new RegExp(`^${escapeRegex(def.prefix)}.*`);
  def.pattern ?? (def.pattern = pattern);
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
    bag.patterns.add(pattern);
  });
  inst._zod.check = (payload) => {
    if (payload.value.startsWith(def.prefix))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "starts_with",
      prefix: def.prefix,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckEndsWith = /* @__PURE__ */ $constructor("$ZodCheckEndsWith", (inst, def) => {
  $ZodCheck.init(inst, def);
  const pattern = new RegExp(`.*${escapeRegex(def.suffix)}$`);
  def.pattern ?? (def.pattern = pattern);
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
    bag.patterns.add(pattern);
  });
  inst._zod.check = (payload) => {
    if (payload.value.endsWith(def.suffix))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "ends_with",
      suffix: def.suffix,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
function handleCheckPropertyResult(result, payload, property) {
  if (result.issues.length) {
    payload.issues.push(...prefixIssues(property, result.issues));
  }
}
var $ZodCheckProperty = /* @__PURE__ */ $constructor("$ZodCheckProperty", (inst, def) => {
  $ZodCheck.init(inst, def);
  inst._zod.check = (payload) => {
    const result = def.schema._zod.run({
      value: payload.value[def.property],
      issues: []
    }, {});
    if (result instanceof Promise) {
      return result.then((result2) => handleCheckPropertyResult(result2, payload, def.property));
    }
    handleCheckPropertyResult(result, payload, def.property);
    return;
  };
});
var $ZodCheckMimeType = /* @__PURE__ */ $constructor("$ZodCheckMimeType", (inst, def) => {
  $ZodCheck.init(inst, def);
  const mimeSet = new Set(def.mime);
  inst._zod.onattach.push((inst2) => {
    inst2._zod.bag.mime = def.mime;
  });
  inst._zod.check = (payload) => {
    if (mimeSet.has(payload.value.type))
      return;
    payload.issues.push({
      code: "invalid_value",
      values: def.mime,
      input: payload.value.type,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckOverwrite = /* @__PURE__ */ $constructor("$ZodCheckOverwrite", (inst, def) => {
  $ZodCheck.init(inst, def);
  inst._zod.check = (payload) => {
    payload.value = def.tx(payload.value);
  };
});

// ../../node_modules/zod/v4/core/doc.js
var Doc = class {
  constructor(args = []) {
    this.content = [];
    this.indent = 0;
    if (this)
      this.args = args;
  }
  indented(fn) {
    this.indent += 1;
    fn(this);
    this.indent -= 1;
  }
  write(arg) {
    if (typeof arg === "function") {
      arg(this, { execution: "sync" });
      arg(this, { execution: "async" });
      return;
    }
    const content = arg;
    const lines = content.split("\n").filter((x) => x);
    const minIndent = Math.min(...lines.map((x) => x.length - x.trimStart().length));
    const dedented = lines.map((x) => x.slice(minIndent)).map((x) => " ".repeat(this.indent * 2) + x);
    for (const line of dedented) {
      this.content.push(line);
    }
  }
  compile() {
    const F = Function;
    const args = this?.args;
    const content = this?.content ?? [``];
    const lines = [...content.map((x) => `  ${x}`)];
    return new F(...args, lines.join("\n"));
  }
};

// ../../node_modules/zod/v4/core/versions.js
var version = {
  major: 4,
  minor: 3,
  patch: 5
};

// ../../node_modules/zod/v4/core/schemas.js
var $ZodType = /* @__PURE__ */ $constructor("$ZodType", (inst, def) => {
  var _a2;
  inst ?? (inst = {});
  inst._zod.def = def;
  inst._zod.bag = inst._zod.bag || {};
  inst._zod.version = version;
  const checks = [...inst._zod.def.checks ?? []];
  if (inst._zod.traits.has("$ZodCheck")) {
    checks.unshift(inst);
  }
  for (const ch of checks) {
    for (const fn of ch._zod.onattach) {
      fn(inst);
    }
  }
  if (checks.length === 0) {
    (_a2 = inst._zod).deferred ?? (_a2.deferred = []);
    inst._zod.deferred?.push(() => {
      inst._zod.run = inst._zod.parse;
    });
  } else {
    const runChecks = (payload, checks2, ctx) => {
      let isAborted = aborted(payload);
      let asyncResult;
      for (const ch of checks2) {
        if (ch._zod.def.when) {
          const shouldRun = ch._zod.def.when(payload);
          if (!shouldRun)
            continue;
        } else if (isAborted) {
          continue;
        }
        const currLen = payload.issues.length;
        const _ = ch._zod.check(payload);
        if (_ instanceof Promise && ctx?.async === false) {
          throw new $ZodAsyncError();
        }
        if (asyncResult || _ instanceof Promise) {
          asyncResult = (asyncResult ?? Promise.resolve()).then(async () => {
            await _;
            const nextLen = payload.issues.length;
            if (nextLen === currLen)
              return;
            if (!isAborted)
              isAborted = aborted(payload, currLen);
          });
        } else {
          const nextLen = payload.issues.length;
          if (nextLen === currLen)
            continue;
          if (!isAborted)
            isAborted = aborted(payload, currLen);
        }
      }
      if (asyncResult) {
        return asyncResult.then(() => {
          return payload;
        });
      }
      return payload;
    };
    const handleCanaryResult = (canary, payload, ctx) => {
      if (aborted(canary)) {
        canary.aborted = true;
        return canary;
      }
      const checkResult = runChecks(payload, checks, ctx);
      if (checkResult instanceof Promise) {
        if (ctx.async === false)
          throw new $ZodAsyncError();
        return checkResult.then((checkResult2) => inst._zod.parse(checkResult2, ctx));
      }
      return inst._zod.parse(checkResult, ctx);
    };
    inst._zod.run = (payload, ctx) => {
      if (ctx.skipChecks) {
        return inst._zod.parse(payload, ctx);
      }
      if (ctx.direction === "backward") {
        const canary = inst._zod.parse({ value: payload.value, issues: [] }, { ...ctx, skipChecks: true });
        if (canary instanceof Promise) {
          return canary.then((canary2) => {
            return handleCanaryResult(canary2, payload, ctx);
          });
        }
        return handleCanaryResult(canary, payload, ctx);
      }
      const result = inst._zod.parse(payload, ctx);
      if (result instanceof Promise) {
        if (ctx.async === false)
          throw new $ZodAsyncError();
        return result.then((result2) => runChecks(result2, checks, ctx));
      }
      return runChecks(result, checks, ctx);
    };
  }
  defineLazy(inst, "~standard", () => ({
    validate: (value) => {
      try {
        const r = safeParse(inst, value);
        return r.success ? { value: r.data } : { issues: r.error?.issues };
      } catch (_) {
        return safeParseAsync(inst, value).then((r) => r.success ? { value: r.data } : { issues: r.error?.issues });
      }
    },
    vendor: "zod",
    version: 1
  }));
});
var $ZodString = /* @__PURE__ */ $constructor("$ZodString", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.pattern = [...inst?._zod.bag?.patterns ?? []].pop() ?? string(inst._zod.bag);
  inst._zod.parse = (payload, _) => {
    if (def.coerce)
      try {
        payload.value = String(payload.value);
      } catch (_2) {
      }
    if (typeof payload.value === "string")
      return payload;
    payload.issues.push({
      expected: "string",
      code: "invalid_type",
      input: payload.value,
      inst
    });
    return payload;
  };
});
var $ZodStringFormat = /* @__PURE__ */ $constructor("$ZodStringFormat", (inst, def) => {
  $ZodCheckStringFormat.init(inst, def);
  $ZodString.init(inst, def);
});
var $ZodGUID = /* @__PURE__ */ $constructor("$ZodGUID", (inst, def) => {
  def.pattern ?? (def.pattern = guid);
  $ZodStringFormat.init(inst, def);
});
var $ZodUUID = /* @__PURE__ */ $constructor("$ZodUUID", (inst, def) => {
  if (def.version) {
    const versionMap = {
      v1: 1,
      v2: 2,
      v3: 3,
      v4: 4,
      v5: 5,
      v6: 6,
      v7: 7,
      v8: 8
    };
    const v = versionMap[def.version];
    if (v === void 0)
      throw new Error(`Invalid UUID version: "${def.version}"`);
    def.pattern ?? (def.pattern = uuid(v));
  } else
    def.pattern ?? (def.pattern = uuid());
  $ZodStringFormat.init(inst, def);
});
var $ZodEmail = /* @__PURE__ */ $constructor("$ZodEmail", (inst, def) => {
  def.pattern ?? (def.pattern = email);
  $ZodStringFormat.init(inst, def);
});
var $ZodURL = /* @__PURE__ */ $constructor("$ZodURL", (inst, def) => {
  $ZodStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    try {
      const trimmed = payload.value.trim();
      const url2 = new URL(trimmed);
      if (def.hostname) {
        def.hostname.lastIndex = 0;
        if (!def.hostname.test(url2.hostname)) {
          payload.issues.push({
            code: "invalid_format",
            format: "url",
            note: "Invalid hostname",
            pattern: def.hostname.source,
            input: payload.value,
            inst,
            continue: !def.abort
          });
        }
      }
      if (def.protocol) {
        def.protocol.lastIndex = 0;
        if (!def.protocol.test(url2.protocol.endsWith(":") ? url2.protocol.slice(0, -1) : url2.protocol)) {
          payload.issues.push({
            code: "invalid_format",
            format: "url",
            note: "Invalid protocol",
            pattern: def.protocol.source,
            input: payload.value,
            inst,
            continue: !def.abort
          });
        }
      }
      if (def.normalize) {
        payload.value = url2.href;
      } else {
        payload.value = trimmed;
      }
      return;
    } catch (_) {
      payload.issues.push({
        code: "invalid_format",
        format: "url",
        input: payload.value,
        inst,
        continue: !def.abort
      });
    }
  };
});
var $ZodEmoji = /* @__PURE__ */ $constructor("$ZodEmoji", (inst, def) => {
  def.pattern ?? (def.pattern = emoji());
  $ZodStringFormat.init(inst, def);
});
var $ZodNanoID = /* @__PURE__ */ $constructor("$ZodNanoID", (inst, def) => {
  def.pattern ?? (def.pattern = nanoid);
  $ZodStringFormat.init(inst, def);
});
var $ZodCUID = /* @__PURE__ */ $constructor("$ZodCUID", (inst, def) => {
  def.pattern ?? (def.pattern = cuid);
  $ZodStringFormat.init(inst, def);
});
var $ZodCUID2 = /* @__PURE__ */ $constructor("$ZodCUID2", (inst, def) => {
  def.pattern ?? (def.pattern = cuid2);
  $ZodStringFormat.init(inst, def);
});
var $ZodULID = /* @__PURE__ */ $constructor("$ZodULID", (inst, def) => {
  def.pattern ?? (def.pattern = ulid);
  $ZodStringFormat.init(inst, def);
});
var $ZodXID = /* @__PURE__ */ $constructor("$ZodXID", (inst, def) => {
  def.pattern ?? (def.pattern = xid);
  $ZodStringFormat.init(inst, def);
});
var $ZodKSUID = /* @__PURE__ */ $constructor("$ZodKSUID", (inst, def) => {
  def.pattern ?? (def.pattern = ksuid);
  $ZodStringFormat.init(inst, def);
});
var $ZodISODateTime = /* @__PURE__ */ $constructor("$ZodISODateTime", (inst, def) => {
  def.pattern ?? (def.pattern = datetime(def));
  $ZodStringFormat.init(inst, def);
});
var $ZodISODate = /* @__PURE__ */ $constructor("$ZodISODate", (inst, def) => {
  def.pattern ?? (def.pattern = date);
  $ZodStringFormat.init(inst, def);
});
var $ZodISOTime = /* @__PURE__ */ $constructor("$ZodISOTime", (inst, def) => {
  def.pattern ?? (def.pattern = time(def));
  $ZodStringFormat.init(inst, def);
});
var $ZodISODuration = /* @__PURE__ */ $constructor("$ZodISODuration", (inst, def) => {
  def.pattern ?? (def.pattern = duration);
  $ZodStringFormat.init(inst, def);
});
var $ZodIPv4 = /* @__PURE__ */ $constructor("$ZodIPv4", (inst, def) => {
  def.pattern ?? (def.pattern = ipv4);
  $ZodStringFormat.init(inst, def);
  inst._zod.bag.format = `ipv4`;
});
var $ZodIPv6 = /* @__PURE__ */ $constructor("$ZodIPv6", (inst, def) => {
  def.pattern ?? (def.pattern = ipv6);
  $ZodStringFormat.init(inst, def);
  inst._zod.bag.format = `ipv6`;
  inst._zod.check = (payload) => {
    try {
      new URL(`http://[${payload.value}]`);
    } catch {
      payload.issues.push({
        code: "invalid_format",
        format: "ipv6",
        input: payload.value,
        inst,
        continue: !def.abort
      });
    }
  };
});
var $ZodMAC = /* @__PURE__ */ $constructor("$ZodMAC", (inst, def) => {
  def.pattern ?? (def.pattern = mac(def.delimiter));
  $ZodStringFormat.init(inst, def);
  inst._zod.bag.format = `mac`;
});
var $ZodCIDRv4 = /* @__PURE__ */ $constructor("$ZodCIDRv4", (inst, def) => {
  def.pattern ?? (def.pattern = cidrv4);
  $ZodStringFormat.init(inst, def);
});
var $ZodCIDRv6 = /* @__PURE__ */ $constructor("$ZodCIDRv6", (inst, def) => {
  def.pattern ?? (def.pattern = cidrv6);
  $ZodStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    const parts = payload.value.split("/");
    try {
      if (parts.length !== 2)
        throw new Error();
      const [address, prefix] = parts;
      if (!prefix)
        throw new Error();
      const prefixNum = Number(prefix);
      if (`${prefixNum}` !== prefix)
        throw new Error();
      if (prefixNum < 0 || prefixNum > 128)
        throw new Error();
      new URL(`http://[${address}]`);
    } catch {
      payload.issues.push({
        code: "invalid_format",
        format: "cidrv6",
        input: payload.value,
        inst,
        continue: !def.abort
      });
    }
  };
});
function isValidBase64(data) {
  if (data === "")
    return true;
  if (data.length % 4 !== 0)
    return false;
  try {
    atob(data);
    return true;
  } catch {
    return false;
  }
}
var $ZodBase64 = /* @__PURE__ */ $constructor("$ZodBase64", (inst, def) => {
  def.pattern ?? (def.pattern = base64);
  $ZodStringFormat.init(inst, def);
  inst._zod.bag.contentEncoding = "base64";
  inst._zod.check = (payload) => {
    if (isValidBase64(payload.value))
      return;
    payload.issues.push({
      code: "invalid_format",
      format: "base64",
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
function isValidBase64URL(data) {
  if (!base64url.test(data))
    return false;
  const base643 = data.replace(/[-_]/g, (c) => c === "-" ? "+" : "/");
  const padded = base643.padEnd(Math.ceil(base643.length / 4) * 4, "=");
  return isValidBase64(padded);
}
var $ZodBase64URL = /* @__PURE__ */ $constructor("$ZodBase64URL", (inst, def) => {
  def.pattern ?? (def.pattern = base64url);
  $ZodStringFormat.init(inst, def);
  inst._zod.bag.contentEncoding = "base64url";
  inst._zod.check = (payload) => {
    if (isValidBase64URL(payload.value))
      return;
    payload.issues.push({
      code: "invalid_format",
      format: "base64url",
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodE164 = /* @__PURE__ */ $constructor("$ZodE164", (inst, def) => {
  def.pattern ?? (def.pattern = e164);
  $ZodStringFormat.init(inst, def);
});
function isValidJWT(token, algorithm = null) {
  try {
    const tokensParts = token.split(".");
    if (tokensParts.length !== 3)
      return false;
    const [header] = tokensParts;
    if (!header)
      return false;
    const parsedHeader = JSON.parse(atob(header));
    if ("typ" in parsedHeader && parsedHeader?.typ !== "JWT")
      return false;
    if (!parsedHeader.alg)
      return false;
    if (algorithm && (!("alg" in parsedHeader) || parsedHeader.alg !== algorithm))
      return false;
    return true;
  } catch {
    return false;
  }
}
var $ZodJWT = /* @__PURE__ */ $constructor("$ZodJWT", (inst, def) => {
  $ZodStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    if (isValidJWT(payload.value, def.alg))
      return;
    payload.issues.push({
      code: "invalid_format",
      format: "jwt",
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCustomStringFormat = /* @__PURE__ */ $constructor("$ZodCustomStringFormat", (inst, def) => {
  $ZodStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    if (def.fn(payload.value))
      return;
    payload.issues.push({
      code: "invalid_format",
      format: def.format,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodNumber = /* @__PURE__ */ $constructor("$ZodNumber", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.pattern = inst._zod.bag.pattern ?? number;
  inst._zod.parse = (payload, _ctx) => {
    if (def.coerce)
      try {
        payload.value = Number(payload.value);
      } catch (_) {
      }
    const input = payload.value;
    if (typeof input === "number" && !Number.isNaN(input) && Number.isFinite(input)) {
      return payload;
    }
    const received = typeof input === "number" ? Number.isNaN(input) ? "NaN" : !Number.isFinite(input) ? "Infinity" : void 0 : void 0;
    payload.issues.push({
      expected: "number",
      code: "invalid_type",
      input,
      inst,
      ...received ? { received } : {}
    });
    return payload;
  };
});
var $ZodNumberFormat = /* @__PURE__ */ $constructor("$ZodNumberFormat", (inst, def) => {
  $ZodCheckNumberFormat.init(inst, def);
  $ZodNumber.init(inst, def);
});
var $ZodBoolean = /* @__PURE__ */ $constructor("$ZodBoolean", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.pattern = boolean;
  inst._zod.parse = (payload, _ctx) => {
    if (def.coerce)
      try {
        payload.value = Boolean(payload.value);
      } catch (_) {
      }
    const input = payload.value;
    if (typeof input === "boolean")
      return payload;
    payload.issues.push({
      expected: "boolean",
      code: "invalid_type",
      input,
      inst
    });
    return payload;
  };
});
var $ZodBigInt = /* @__PURE__ */ $constructor("$ZodBigInt", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.pattern = bigint;
  inst._zod.parse = (payload, _ctx) => {
    if (def.coerce)
      try {
        payload.value = BigInt(payload.value);
      } catch (_) {
      }
    if (typeof payload.value === "bigint")
      return payload;
    payload.issues.push({
      expected: "bigint",
      code: "invalid_type",
      input: payload.value,
      inst
    });
    return payload;
  };
});
var $ZodBigIntFormat = /* @__PURE__ */ $constructor("$ZodBigIntFormat", (inst, def) => {
  $ZodCheckBigIntFormat.init(inst, def);
  $ZodBigInt.init(inst, def);
});
var $ZodSymbol = /* @__PURE__ */ $constructor("$ZodSymbol", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, _ctx) => {
    const input = payload.value;
    if (typeof input === "symbol")
      return payload;
    payload.issues.push({
      expected: "symbol",
      code: "invalid_type",
      input,
      inst
    });
    return payload;
  };
});
var $ZodUndefined = /* @__PURE__ */ $constructor("$ZodUndefined", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.pattern = _undefined;
  inst._zod.values = /* @__PURE__ */ new Set([void 0]);
  inst._zod.optin = "optional";
  inst._zod.optout = "optional";
  inst._zod.parse = (payload, _ctx) => {
    const input = payload.value;
    if (typeof input === "undefined")
      return payload;
    payload.issues.push({
      expected: "undefined",
      code: "invalid_type",
      input,
      inst
    });
    return payload;
  };
});
var $ZodNull = /* @__PURE__ */ $constructor("$ZodNull", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.pattern = _null;
  inst._zod.values = /* @__PURE__ */ new Set([null]);
  inst._zod.parse = (payload, _ctx) => {
    const input = payload.value;
    if (input === null)
      return payload;
    payload.issues.push({
      expected: "null",
      code: "invalid_type",
      input,
      inst
    });
    return payload;
  };
});
var $ZodAny = /* @__PURE__ */ $constructor("$ZodAny", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload) => payload;
});
var $ZodUnknown = /* @__PURE__ */ $constructor("$ZodUnknown", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload) => payload;
});
var $ZodNever = /* @__PURE__ */ $constructor("$ZodNever", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, _ctx) => {
    payload.issues.push({
      expected: "never",
      code: "invalid_type",
      input: payload.value,
      inst
    });
    return payload;
  };
});
var $ZodVoid = /* @__PURE__ */ $constructor("$ZodVoid", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, _ctx) => {
    const input = payload.value;
    if (typeof input === "undefined")
      return payload;
    payload.issues.push({
      expected: "void",
      code: "invalid_type",
      input,
      inst
    });
    return payload;
  };
});
var $ZodDate = /* @__PURE__ */ $constructor("$ZodDate", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, _ctx) => {
    if (def.coerce) {
      try {
        payload.value = new Date(payload.value);
      } catch (_err) {
      }
    }
    const input = payload.value;
    const isDate = input instanceof Date;
    const isValidDate = isDate && !Number.isNaN(input.getTime());
    if (isValidDate)
      return payload;
    payload.issues.push({
      expected: "date",
      code: "invalid_type",
      input,
      ...isDate ? { received: "Invalid Date" } : {},
      inst
    });
    return payload;
  };
});
function handleArrayResult(result, final, index) {
  if (result.issues.length) {
    final.issues.push(...prefixIssues(index, result.issues));
  }
  final.value[index] = result.value;
}
var $ZodArray = /* @__PURE__ */ $constructor("$ZodArray", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, ctx) => {
    const input = payload.value;
    if (!Array.isArray(input)) {
      payload.issues.push({
        expected: "array",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    }
    payload.value = Array(input.length);
    const proms = [];
    for (let i = 0; i < input.length; i++) {
      const item = input[i];
      const result = def.element._zod.run({
        value: item,
        issues: []
      }, ctx);
      if (result instanceof Promise) {
        proms.push(result.then((result2) => handleArrayResult(result2, payload, i)));
      } else {
        handleArrayResult(result, payload, i);
      }
    }
    if (proms.length) {
      return Promise.all(proms).then(() => payload);
    }
    return payload;
  };
});
function handlePropertyResult(result, final, key, input, isOptionalOut) {
  if (result.issues.length) {
    if (isOptionalOut && !(key in input)) {
      return;
    }
    final.issues.push(...prefixIssues(key, result.issues));
  }
  if (result.value === void 0) {
    if (key in input) {
      final.value[key] = void 0;
    }
  } else {
    final.value[key] = result.value;
  }
}
function normalizeDef(def) {
  const keys = Object.keys(def.shape);
  for (const k of keys) {
    if (!def.shape?.[k]?._zod?.traits?.has("$ZodType")) {
      throw new Error(`Invalid element at key "${k}": expected a Zod schema`);
    }
  }
  const okeys = optionalKeys(def.shape);
  return {
    ...def,
    keys,
    keySet: new Set(keys),
    numKeys: keys.length,
    optionalKeys: new Set(okeys)
  };
}
function handleCatchall(proms, input, payload, ctx, def, inst) {
  const unrecognized = [];
  const keySet = def.keySet;
  const _catchall = def.catchall._zod;
  const t = _catchall.def.type;
  const isOptionalOut = _catchall.optout === "optional";
  for (const key in input) {
    if (keySet.has(key))
      continue;
    if (t === "never") {
      unrecognized.push(key);
      continue;
    }
    const r = _catchall.run({ value: input[key], issues: [] }, ctx);
    if (r instanceof Promise) {
      proms.push(r.then((r2) => handlePropertyResult(r2, payload, key, input, isOptionalOut)));
    } else {
      handlePropertyResult(r, payload, key, input, isOptionalOut);
    }
  }
  if (unrecognized.length) {
    payload.issues.push({
      code: "unrecognized_keys",
      keys: unrecognized,
      input,
      inst
    });
  }
  if (!proms.length)
    return payload;
  return Promise.all(proms).then(() => {
    return payload;
  });
}
var $ZodObject = /* @__PURE__ */ $constructor("$ZodObject", (inst, def) => {
  $ZodType.init(inst, def);
  const desc = Object.getOwnPropertyDescriptor(def, "shape");
  if (!desc?.get) {
    const sh = def.shape;
    Object.defineProperty(def, "shape", {
      get: () => {
        const newSh = { ...sh };
        Object.defineProperty(def, "shape", {
          value: newSh
        });
        return newSh;
      }
    });
  }
  const _normalized = cached(() => normalizeDef(def));
  defineLazy(inst._zod, "propValues", () => {
    const shape = def.shape;
    const propValues = {};
    for (const key in shape) {
      const field = shape[key]._zod;
      if (field.values) {
        propValues[key] ?? (propValues[key] = /* @__PURE__ */ new Set());
        for (const v of field.values)
          propValues[key].add(v);
      }
    }
    return propValues;
  });
  const isObject2 = isObject;
  const catchall = def.catchall;
  let value;
  inst._zod.parse = (payload, ctx) => {
    value ?? (value = _normalized.value);
    const input = payload.value;
    if (!isObject2(input)) {
      payload.issues.push({
        expected: "object",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    }
    payload.value = {};
    const proms = [];
    const shape = value.shape;
    for (const key of value.keys) {
      const el = shape[key];
      const isOptionalOut = el._zod.optout === "optional";
      const r = el._zod.run({ value: input[key], issues: [] }, ctx);
      if (r instanceof Promise) {
        proms.push(r.then((r2) => handlePropertyResult(r2, payload, key, input, isOptionalOut)));
      } else {
        handlePropertyResult(r, payload, key, input, isOptionalOut);
      }
    }
    if (!catchall) {
      return proms.length ? Promise.all(proms).then(() => payload) : payload;
    }
    return handleCatchall(proms, input, payload, ctx, _normalized.value, inst);
  };
});
var $ZodObjectJIT = /* @__PURE__ */ $constructor("$ZodObjectJIT", (inst, def) => {
  $ZodObject.init(inst, def);
  const superParse = inst._zod.parse;
  const _normalized = cached(() => normalizeDef(def));
  const generateFastpass = (shape) => {
    const doc = new Doc(["shape", "payload", "ctx"]);
    const normalized = _normalized.value;
    const parseStr = (key) => {
      const k = esc(key);
      return `shape[${k}]._zod.run({ value: input[${k}], issues: [] }, ctx)`;
    };
    doc.write(`const input = payload.value;`);
    const ids = /* @__PURE__ */ Object.create(null);
    let counter = 0;
    for (const key of normalized.keys) {
      ids[key] = `key_${counter++}`;
    }
    doc.write(`const newResult = {};`);
    for (const key of normalized.keys) {
      const id = ids[key];
      const k = esc(key);
      const schema = shape[key];
      const isOptionalOut = schema?._zod?.optout === "optional";
      doc.write(`const ${id} = ${parseStr(key)};`);
      if (isOptionalOut) {
        doc.write(`
        if (${id}.issues.length) {
          if (${k} in input) {
            payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${k}, ...iss.path] : [${k}]
            })));
          }
        }
        
        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }
        
      `);
      } else {
        doc.write(`
        if (${id}.issues.length) {
          payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${k}, ...iss.path] : [${k}]
          })));
        }
        
        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }
        
      `);
      }
    }
    doc.write(`payload.value = newResult;`);
    doc.write(`return payload;`);
    const fn = doc.compile();
    return (payload, ctx) => fn(shape, payload, ctx);
  };
  let fastpass;
  const isObject2 = isObject;
  const jit = !globalConfig.jitless;
  const allowsEval2 = allowsEval;
  const fastEnabled = jit && allowsEval2.value;
  const catchall = def.catchall;
  let value;
  inst._zod.parse = (payload, ctx) => {
    value ?? (value = _normalized.value);
    const input = payload.value;
    if (!isObject2(input)) {
      payload.issues.push({
        expected: "object",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    }
    if (jit && fastEnabled && ctx?.async === false && ctx.jitless !== true) {
      if (!fastpass)
        fastpass = generateFastpass(def.shape);
      payload = fastpass(payload, ctx);
      if (!catchall)
        return payload;
      return handleCatchall([], input, payload, ctx, value, inst);
    }
    return superParse(payload, ctx);
  };
});
function handleUnionResults(results, final, inst, ctx) {
  for (const result of results) {
    if (result.issues.length === 0) {
      final.value = result.value;
      return final;
    }
  }
  const nonaborted = results.filter((r) => !aborted(r));
  if (nonaborted.length === 1) {
    final.value = nonaborted[0].value;
    return nonaborted[0];
  }
  final.issues.push({
    code: "invalid_union",
    input: final.value,
    inst,
    errors: results.map((result) => result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
  });
  return final;
}
var $ZodUnion = /* @__PURE__ */ $constructor("$ZodUnion", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "optin", () => def.options.some((o) => o._zod.optin === "optional") ? "optional" : void 0);
  defineLazy(inst._zod, "optout", () => def.options.some((o) => o._zod.optout === "optional") ? "optional" : void 0);
  defineLazy(inst._zod, "values", () => {
    if (def.options.every((o) => o._zod.values)) {
      return new Set(def.options.flatMap((option) => Array.from(option._zod.values)));
    }
    return void 0;
  });
  defineLazy(inst._zod, "pattern", () => {
    if (def.options.every((o) => o._zod.pattern)) {
      const patterns = def.options.map((o) => o._zod.pattern);
      return new RegExp(`^(${patterns.map((p) => cleanRegex(p.source)).join("|")})$`);
    }
    return void 0;
  });
  const single = def.options.length === 1;
  const first = def.options[0]._zod.run;
  inst._zod.parse = (payload, ctx) => {
    if (single) {
      return first(payload, ctx);
    }
    let async = false;
    const results = [];
    for (const option of def.options) {
      const result = option._zod.run({
        value: payload.value,
        issues: []
      }, ctx);
      if (result instanceof Promise) {
        results.push(result);
        async = true;
      } else {
        if (result.issues.length === 0)
          return result;
        results.push(result);
      }
    }
    if (!async)
      return handleUnionResults(results, payload, inst, ctx);
    return Promise.all(results).then((results2) => {
      return handleUnionResults(results2, payload, inst, ctx);
    });
  };
});
function handleExclusiveUnionResults(results, final, inst, ctx) {
  const successes = results.filter((r) => r.issues.length === 0);
  if (successes.length === 1) {
    final.value = successes[0].value;
    return final;
  }
  if (successes.length === 0) {
    final.issues.push({
      code: "invalid_union",
      input: final.value,
      inst,
      errors: results.map((result) => result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
    });
  } else {
    final.issues.push({
      code: "invalid_union",
      input: final.value,
      inst,
      errors: [],
      inclusive: false
    });
  }
  return final;
}
var $ZodXor = /* @__PURE__ */ $constructor("$ZodXor", (inst, def) => {
  $ZodUnion.init(inst, def);
  def.inclusive = false;
  const single = def.options.length === 1;
  const first = def.options[0]._zod.run;
  inst._zod.parse = (payload, ctx) => {
    if (single) {
      return first(payload, ctx);
    }
    let async = false;
    const results = [];
    for (const option of def.options) {
      const result = option._zod.run({
        value: payload.value,
        issues: []
      }, ctx);
      if (result instanceof Promise) {
        results.push(result);
        async = true;
      } else {
        results.push(result);
      }
    }
    if (!async)
      return handleExclusiveUnionResults(results, payload, inst, ctx);
    return Promise.all(results).then((results2) => {
      return handleExclusiveUnionResults(results2, payload, inst, ctx);
    });
  };
});
var $ZodDiscriminatedUnion = /* @__PURE__ */ $constructor("$ZodDiscriminatedUnion", (inst, def) => {
  def.inclusive = false;
  $ZodUnion.init(inst, def);
  const _super = inst._zod.parse;
  defineLazy(inst._zod, "propValues", () => {
    const propValues = {};
    for (const option of def.options) {
      const pv = option._zod.propValues;
      if (!pv || Object.keys(pv).length === 0)
        throw new Error(`Invalid discriminated union option at index "${def.options.indexOf(option)}"`);
      for (const [k, v] of Object.entries(pv)) {
        if (!propValues[k])
          propValues[k] = /* @__PURE__ */ new Set();
        for (const val of v) {
          propValues[k].add(val);
        }
      }
    }
    return propValues;
  });
  const disc = cached(() => {
    const opts = def.options;
    const map2 = /* @__PURE__ */ new Map();
    for (const o of opts) {
      const values = o._zod.propValues?.[def.discriminator];
      if (!values || values.size === 0)
        throw new Error(`Invalid discriminated union option at index "${def.options.indexOf(o)}"`);
      for (const v of values) {
        if (map2.has(v)) {
          throw new Error(`Duplicate discriminator value "${String(v)}"`);
        }
        map2.set(v, o);
      }
    }
    return map2;
  });
  inst._zod.parse = (payload, ctx) => {
    const input = payload.value;
    if (!isObject(input)) {
      payload.issues.push({
        code: "invalid_type",
        expected: "object",
        input,
        inst
      });
      return payload;
    }
    const opt = disc.value.get(input?.[def.discriminator]);
    if (opt) {
      return opt._zod.run(payload, ctx);
    }
    if (def.unionFallback) {
      return _super(payload, ctx);
    }
    payload.issues.push({
      code: "invalid_union",
      errors: [],
      note: "No matching discriminator",
      discriminator: def.discriminator,
      input,
      path: [def.discriminator],
      inst
    });
    return payload;
  };
});
var $ZodIntersection = /* @__PURE__ */ $constructor("$ZodIntersection", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, ctx) => {
    const input = payload.value;
    const left = def.left._zod.run({ value: input, issues: [] }, ctx);
    const right = def.right._zod.run({ value: input, issues: [] }, ctx);
    const async = left instanceof Promise || right instanceof Promise;
    if (async) {
      return Promise.all([left, right]).then(([left2, right2]) => {
        return handleIntersectionResults(payload, left2, right2);
      });
    }
    return handleIntersectionResults(payload, left, right);
  };
});
function mergeValues(a, b) {
  if (a === b) {
    return { valid: true, data: a };
  }
  if (a instanceof Date && b instanceof Date && +a === +b) {
    return { valid: true, data: a };
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    const bKeys = Object.keys(b);
    const sharedKeys = Object.keys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return {
          valid: false,
          mergeErrorPath: [key, ...sharedValue.mergeErrorPath]
        };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return { valid: false, mergeErrorPath: [] };
    }
    const newArray = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return {
          valid: false,
          mergeErrorPath: [index, ...sharedValue.mergeErrorPath]
        };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  }
  return { valid: false, mergeErrorPath: [] };
}
function handleIntersectionResults(result, left, right) {
  const unrecKeys = /* @__PURE__ */ new Map();
  let unrecIssue;
  for (const iss of left.issues) {
    if (iss.code === "unrecognized_keys") {
      unrecIssue ?? (unrecIssue = iss);
      for (const k of iss.keys) {
        if (!unrecKeys.has(k))
          unrecKeys.set(k, {});
        unrecKeys.get(k).l = true;
      }
    } else {
      result.issues.push(iss);
    }
  }
  for (const iss of right.issues) {
    if (iss.code === "unrecognized_keys") {
      for (const k of iss.keys) {
        if (!unrecKeys.has(k))
          unrecKeys.set(k, {});
        unrecKeys.get(k).r = true;
      }
    } else {
      result.issues.push(iss);
    }
  }
  const bothKeys = [...unrecKeys].filter(([, f]) => f.l && f.r).map(([k]) => k);
  if (bothKeys.length && unrecIssue) {
    result.issues.push({ ...unrecIssue, keys: bothKeys });
  }
  if (aborted(result))
    return result;
  const merged = mergeValues(left.value, right.value);
  if (!merged.valid) {
    throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(merged.mergeErrorPath)}`);
  }
  result.value = merged.data;
  return result;
}
var $ZodTuple = /* @__PURE__ */ $constructor("$ZodTuple", (inst, def) => {
  $ZodType.init(inst, def);
  const items = def.items;
  inst._zod.parse = (payload, ctx) => {
    const input = payload.value;
    if (!Array.isArray(input)) {
      payload.issues.push({
        input,
        inst,
        expected: "tuple",
        code: "invalid_type"
      });
      return payload;
    }
    payload.value = [];
    const proms = [];
    const reversedIndex = [...items].reverse().findIndex((item) => item._zod.optin !== "optional");
    const optStart = reversedIndex === -1 ? 0 : items.length - reversedIndex;
    if (!def.rest) {
      const tooBig = input.length > items.length;
      const tooSmall = input.length < optStart - 1;
      if (tooBig || tooSmall) {
        payload.issues.push({
          ...tooBig ? { code: "too_big", maximum: items.length, inclusive: true } : { code: "too_small", minimum: items.length },
          input,
          inst,
          origin: "array"
        });
        return payload;
      }
    }
    let i = -1;
    for (const item of items) {
      i++;
      if (i >= input.length) {
        if (i >= optStart)
          continue;
      }
      const result = item._zod.run({
        value: input[i],
        issues: []
      }, ctx);
      if (result instanceof Promise) {
        proms.push(result.then((result2) => handleTupleResult(result2, payload, i)));
      } else {
        handleTupleResult(result, payload, i);
      }
    }
    if (def.rest) {
      const rest = input.slice(items.length);
      for (const el of rest) {
        i++;
        const result = def.rest._zod.run({
          value: el,
          issues: []
        }, ctx);
        if (result instanceof Promise) {
          proms.push(result.then((result2) => handleTupleResult(result2, payload, i)));
        } else {
          handleTupleResult(result, payload, i);
        }
      }
    }
    if (proms.length)
      return Promise.all(proms).then(() => payload);
    return payload;
  };
});
function handleTupleResult(result, final, index) {
  if (result.issues.length) {
    final.issues.push(...prefixIssues(index, result.issues));
  }
  final.value[index] = result.value;
}
var $ZodRecord = /* @__PURE__ */ $constructor("$ZodRecord", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, ctx) => {
    const input = payload.value;
    if (!isPlainObject(input)) {
      payload.issues.push({
        expected: "record",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    }
    const proms = [];
    const values = def.keyType._zod.values;
    if (values) {
      payload.value = {};
      const recordKeys = /* @__PURE__ */ new Set();
      for (const key of values) {
        if (typeof key === "string" || typeof key === "number" || typeof key === "symbol") {
          recordKeys.add(typeof key === "number" ? key.toString() : key);
          const result = def.valueType._zod.run({ value: input[key], issues: [] }, ctx);
          if (result instanceof Promise) {
            proms.push(result.then((result2) => {
              if (result2.issues.length) {
                payload.issues.push(...prefixIssues(key, result2.issues));
              }
              payload.value[key] = result2.value;
            }));
          } else {
            if (result.issues.length) {
              payload.issues.push(...prefixIssues(key, result.issues));
            }
            payload.value[key] = result.value;
          }
        }
      }
      let unrecognized;
      for (const key in input) {
        if (!recordKeys.has(key)) {
          unrecognized = unrecognized ?? [];
          unrecognized.push(key);
        }
      }
      if (unrecognized && unrecognized.length > 0) {
        payload.issues.push({
          code: "unrecognized_keys",
          input,
          inst,
          keys: unrecognized
        });
      }
    } else {
      payload.value = {};
      for (const key of Reflect.ownKeys(input)) {
        if (key === "__proto__")
          continue;
        let keyResult = def.keyType._zod.run({ value: key, issues: [] }, ctx);
        if (keyResult instanceof Promise) {
          throw new Error("Async schemas not supported in object keys currently");
        }
        const checkNumericKey = typeof key === "string" && number.test(key) && keyResult.issues.length && keyResult.issues.some((iss) => iss.code === "invalid_type" && iss.expected === "number");
        if (checkNumericKey) {
          const retryResult = def.keyType._zod.run({ value: Number(key), issues: [] }, ctx);
          if (retryResult instanceof Promise) {
            throw new Error("Async schemas not supported in object keys currently");
          }
          if (retryResult.issues.length === 0) {
            keyResult = retryResult;
          }
        }
        if (keyResult.issues.length) {
          if (def.mode === "loose") {
            payload.value[key] = input[key];
          } else {
            payload.issues.push({
              code: "invalid_key",
              origin: "record",
              issues: keyResult.issues.map((iss) => finalizeIssue(iss, ctx, config())),
              input: key,
              path: [key],
              inst
            });
          }
          continue;
        }
        const result = def.valueType._zod.run({ value: input[key], issues: [] }, ctx);
        if (result instanceof Promise) {
          proms.push(result.then((result2) => {
            if (result2.issues.length) {
              payload.issues.push(...prefixIssues(key, result2.issues));
            }
            payload.value[keyResult.value] = result2.value;
          }));
        } else {
          if (result.issues.length) {
            payload.issues.push(...prefixIssues(key, result.issues));
          }
          payload.value[keyResult.value] = result.value;
        }
      }
    }
    if (proms.length) {
      return Promise.all(proms).then(() => payload);
    }
    return payload;
  };
});
var $ZodMap = /* @__PURE__ */ $constructor("$ZodMap", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, ctx) => {
    const input = payload.value;
    if (!(input instanceof Map)) {
      payload.issues.push({
        expected: "map",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    }
    const proms = [];
    payload.value = /* @__PURE__ */ new Map();
    for (const [key, value] of input) {
      const keyResult = def.keyType._zod.run({ value: key, issues: [] }, ctx);
      const valueResult = def.valueType._zod.run({ value, issues: [] }, ctx);
      if (keyResult instanceof Promise || valueResult instanceof Promise) {
        proms.push(Promise.all([keyResult, valueResult]).then(([keyResult2, valueResult2]) => {
          handleMapResult(keyResult2, valueResult2, payload, key, input, inst, ctx);
        }));
      } else {
        handleMapResult(keyResult, valueResult, payload, key, input, inst, ctx);
      }
    }
    if (proms.length)
      return Promise.all(proms).then(() => payload);
    return payload;
  };
});
function handleMapResult(keyResult, valueResult, final, key, input, inst, ctx) {
  if (keyResult.issues.length) {
    if (propertyKeyTypes.has(typeof key)) {
      final.issues.push(...prefixIssues(key, keyResult.issues));
    } else {
      final.issues.push({
        code: "invalid_key",
        origin: "map",
        input,
        inst,
        issues: keyResult.issues.map((iss) => finalizeIssue(iss, ctx, config()))
      });
    }
  }
  if (valueResult.issues.length) {
    if (propertyKeyTypes.has(typeof key)) {
      final.issues.push(...prefixIssues(key, valueResult.issues));
    } else {
      final.issues.push({
        origin: "map",
        code: "invalid_element",
        input,
        inst,
        key,
        issues: valueResult.issues.map((iss) => finalizeIssue(iss, ctx, config()))
      });
    }
  }
  final.value.set(keyResult.value, valueResult.value);
}
var $ZodSet = /* @__PURE__ */ $constructor("$ZodSet", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, ctx) => {
    const input = payload.value;
    if (!(input instanceof Set)) {
      payload.issues.push({
        input,
        inst,
        expected: "set",
        code: "invalid_type"
      });
      return payload;
    }
    const proms = [];
    payload.value = /* @__PURE__ */ new Set();
    for (const item of input) {
      const result = def.valueType._zod.run({ value: item, issues: [] }, ctx);
      if (result instanceof Promise) {
        proms.push(result.then((result2) => handleSetResult(result2, payload)));
      } else
        handleSetResult(result, payload);
    }
    if (proms.length)
      return Promise.all(proms).then(() => payload);
    return payload;
  };
});
function handleSetResult(result, final) {
  if (result.issues.length) {
    final.issues.push(...result.issues);
  }
  final.value.add(result.value);
}
var $ZodEnum = /* @__PURE__ */ $constructor("$ZodEnum", (inst, def) => {
  $ZodType.init(inst, def);
  const values = getEnumValues(def.entries);
  const valuesSet = new Set(values);
  inst._zod.values = valuesSet;
  inst._zod.pattern = new RegExp(`^(${values.filter((k) => propertyKeyTypes.has(typeof k)).map((o) => typeof o === "string" ? escapeRegex(o) : o.toString()).join("|")})$`);
  inst._zod.parse = (payload, _ctx) => {
    const input = payload.value;
    if (valuesSet.has(input)) {
      return payload;
    }
    payload.issues.push({
      code: "invalid_value",
      values,
      input,
      inst
    });
    return payload;
  };
});
var $ZodLiteral = /* @__PURE__ */ $constructor("$ZodLiteral", (inst, def) => {
  $ZodType.init(inst, def);
  if (def.values.length === 0) {
    throw new Error("Cannot create literal schema with no valid values");
  }
  const values = new Set(def.values);
  inst._zod.values = values;
  inst._zod.pattern = new RegExp(`^(${def.values.map((o) => typeof o === "string" ? escapeRegex(o) : o ? escapeRegex(o.toString()) : String(o)).join("|")})$`);
  inst._zod.parse = (payload, _ctx) => {
    const input = payload.value;
    if (values.has(input)) {
      return payload;
    }
    payload.issues.push({
      code: "invalid_value",
      values: def.values,
      input,
      inst
    });
    return payload;
  };
});
var $ZodFile = /* @__PURE__ */ $constructor("$ZodFile", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, _ctx) => {
    const input = payload.value;
    if (input instanceof File)
      return payload;
    payload.issues.push({
      expected: "file",
      code: "invalid_type",
      input,
      inst
    });
    return payload;
  };
});
var $ZodTransform = /* @__PURE__ */ $constructor("$ZodTransform", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      throw new $ZodEncodeError(inst.constructor.name);
    }
    const _out = def.transform(payload.value, payload);
    if (ctx.async) {
      const output = _out instanceof Promise ? _out : Promise.resolve(_out);
      return output.then((output2) => {
        payload.value = output2;
        return payload;
      });
    }
    if (_out instanceof Promise) {
      throw new $ZodAsyncError();
    }
    payload.value = _out;
    return payload;
  };
});
function handleOptionalResult(result, input) {
  if (result.issues.length && input === void 0) {
    return { issues: [], value: void 0 };
  }
  return result;
}
var $ZodOptional = /* @__PURE__ */ $constructor("$ZodOptional", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "optional";
  inst._zod.optout = "optional";
  defineLazy(inst._zod, "values", () => {
    return def.innerType._zod.values ? /* @__PURE__ */ new Set([...def.innerType._zod.values, void 0]) : void 0;
  });
  defineLazy(inst._zod, "pattern", () => {
    const pattern = def.innerType._zod.pattern;
    return pattern ? new RegExp(`^(${cleanRegex(pattern.source)})?$`) : void 0;
  });
  inst._zod.parse = (payload, ctx) => {
    if (def.innerType._zod.optin === "optional") {
      const result = def.innerType._zod.run(payload, ctx);
      if (result instanceof Promise)
        return result.then((r) => handleOptionalResult(r, payload.value));
      return handleOptionalResult(result, payload.value);
    }
    if (payload.value === void 0) {
      return payload;
    }
    return def.innerType._zod.run(payload, ctx);
  };
});
var $ZodExactOptional = /* @__PURE__ */ $constructor("$ZodExactOptional", (inst, def) => {
  $ZodOptional.init(inst, def);
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  defineLazy(inst._zod, "pattern", () => def.innerType._zod.pattern);
  inst._zod.parse = (payload, ctx) => {
    return def.innerType._zod.run(payload, ctx);
  };
});
var $ZodNullable = /* @__PURE__ */ $constructor("$ZodNullable", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "optin", () => def.innerType._zod.optin);
  defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
  defineLazy(inst._zod, "pattern", () => {
    const pattern = def.innerType._zod.pattern;
    return pattern ? new RegExp(`^(${cleanRegex(pattern.source)}|null)$`) : void 0;
  });
  defineLazy(inst._zod, "values", () => {
    return def.innerType._zod.values ? /* @__PURE__ */ new Set([...def.innerType._zod.values, null]) : void 0;
  });
  inst._zod.parse = (payload, ctx) => {
    if (payload.value === null)
      return payload;
    return def.innerType._zod.run(payload, ctx);
  };
});
var $ZodDefault = /* @__PURE__ */ $constructor("$ZodDefault", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "optional";
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    if (payload.value === void 0) {
      payload.value = def.defaultValue;
      return payload;
    }
    const result = def.innerType._zod.run(payload, ctx);
    if (result instanceof Promise) {
      return result.then((result2) => handleDefaultResult(result2, def));
    }
    return handleDefaultResult(result, def);
  };
});
function handleDefaultResult(payload, def) {
  if (payload.value === void 0) {
    payload.value = def.defaultValue;
  }
  return payload;
}
var $ZodPrefault = /* @__PURE__ */ $constructor("$ZodPrefault", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "optional";
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    if (payload.value === void 0) {
      payload.value = def.defaultValue;
    }
    return def.innerType._zod.run(payload, ctx);
  };
});
var $ZodNonOptional = /* @__PURE__ */ $constructor("$ZodNonOptional", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "values", () => {
    const v = def.innerType._zod.values;
    return v ? new Set([...v].filter((x) => x !== void 0)) : void 0;
  });
  inst._zod.parse = (payload, ctx) => {
    const result = def.innerType._zod.run(payload, ctx);
    if (result instanceof Promise) {
      return result.then((result2) => handleNonOptionalResult(result2, inst));
    }
    return handleNonOptionalResult(result, inst);
  };
});
function handleNonOptionalResult(payload, inst) {
  if (!payload.issues.length && payload.value === void 0) {
    payload.issues.push({
      code: "invalid_type",
      expected: "nonoptional",
      input: payload.value,
      inst
    });
  }
  return payload;
}
var $ZodSuccess = /* @__PURE__ */ $constructor("$ZodSuccess", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      throw new $ZodEncodeError("ZodSuccess");
    }
    const result = def.innerType._zod.run(payload, ctx);
    if (result instanceof Promise) {
      return result.then((result2) => {
        payload.value = result2.issues.length === 0;
        return payload;
      });
    }
    payload.value = result.issues.length === 0;
    return payload;
  };
});
var $ZodCatch = /* @__PURE__ */ $constructor("$ZodCatch", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "optin", () => def.innerType._zod.optin);
  defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    const result = def.innerType._zod.run(payload, ctx);
    if (result instanceof Promise) {
      return result.then((result2) => {
        payload.value = result2.value;
        if (result2.issues.length) {
          payload.value = def.catchValue({
            ...payload,
            error: {
              issues: result2.issues.map((iss) => finalizeIssue(iss, ctx, config()))
            },
            input: payload.value
          });
          payload.issues = [];
        }
        return payload;
      });
    }
    payload.value = result.value;
    if (result.issues.length) {
      payload.value = def.catchValue({
        ...payload,
        error: {
          issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config()))
        },
        input: payload.value
      });
      payload.issues = [];
    }
    return payload;
  };
});
var $ZodNaN = /* @__PURE__ */ $constructor("$ZodNaN", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, _ctx) => {
    if (typeof payload.value !== "number" || !Number.isNaN(payload.value)) {
      payload.issues.push({
        input: payload.value,
        inst,
        expected: "nan",
        code: "invalid_type"
      });
      return payload;
    }
    return payload;
  };
});
var $ZodPipe = /* @__PURE__ */ $constructor("$ZodPipe", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "values", () => def.in._zod.values);
  defineLazy(inst._zod, "optin", () => def.in._zod.optin);
  defineLazy(inst._zod, "optout", () => def.out._zod.optout);
  defineLazy(inst._zod, "propValues", () => def.in._zod.propValues);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      const right = def.out._zod.run(payload, ctx);
      if (right instanceof Promise) {
        return right.then((right2) => handlePipeResult(right2, def.in, ctx));
      }
      return handlePipeResult(right, def.in, ctx);
    }
    const left = def.in._zod.run(payload, ctx);
    if (left instanceof Promise) {
      return left.then((left2) => handlePipeResult(left2, def.out, ctx));
    }
    return handlePipeResult(left, def.out, ctx);
  };
});
function handlePipeResult(left, next, ctx) {
  if (left.issues.length) {
    left.aborted = true;
    return left;
  }
  return next._zod.run({ value: left.value, issues: left.issues }, ctx);
}
var $ZodCodec = /* @__PURE__ */ $constructor("$ZodCodec", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "values", () => def.in._zod.values);
  defineLazy(inst._zod, "optin", () => def.in._zod.optin);
  defineLazy(inst._zod, "optout", () => def.out._zod.optout);
  defineLazy(inst._zod, "propValues", () => def.in._zod.propValues);
  inst._zod.parse = (payload, ctx) => {
    const direction = ctx.direction || "forward";
    if (direction === "forward") {
      const left = def.in._zod.run(payload, ctx);
      if (left instanceof Promise) {
        return left.then((left2) => handleCodecAResult(left2, def, ctx));
      }
      return handleCodecAResult(left, def, ctx);
    } else {
      const right = def.out._zod.run(payload, ctx);
      if (right instanceof Promise) {
        return right.then((right2) => handleCodecAResult(right2, def, ctx));
      }
      return handleCodecAResult(right, def, ctx);
    }
  };
});
function handleCodecAResult(result, def, ctx) {
  if (result.issues.length) {
    result.aborted = true;
    return result;
  }
  const direction = ctx.direction || "forward";
  if (direction === "forward") {
    const transformed = def.transform(result.value, result);
    if (transformed instanceof Promise) {
      return transformed.then((value) => handleCodecTxResult(result, value, def.out, ctx));
    }
    return handleCodecTxResult(result, transformed, def.out, ctx);
  } else {
    const transformed = def.reverseTransform(result.value, result);
    if (transformed instanceof Promise) {
      return transformed.then((value) => handleCodecTxResult(result, value, def.in, ctx));
    }
    return handleCodecTxResult(result, transformed, def.in, ctx);
  }
}
function handleCodecTxResult(left, value, nextSchema, ctx) {
  if (left.issues.length) {
    left.aborted = true;
    return left;
  }
  return nextSchema._zod.run({ value, issues: left.issues }, ctx);
}
var $ZodReadonly = /* @__PURE__ */ $constructor("$ZodReadonly", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "propValues", () => def.innerType._zod.propValues);
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  defineLazy(inst._zod, "optin", () => def.innerType?._zod?.optin);
  defineLazy(inst._zod, "optout", () => def.innerType?._zod?.optout);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    const result = def.innerType._zod.run(payload, ctx);
    if (result instanceof Promise) {
      return result.then(handleReadonlyResult);
    }
    return handleReadonlyResult(result);
  };
});
function handleReadonlyResult(payload) {
  payload.value = Object.freeze(payload.value);
  return payload;
}
var $ZodTemplateLiteral = /* @__PURE__ */ $constructor("$ZodTemplateLiteral", (inst, def) => {
  $ZodType.init(inst, def);
  const regexParts = [];
  for (const part of def.parts) {
    if (typeof part === "object" && part !== null) {
      if (!part._zod.pattern) {
        throw new Error(`Invalid template literal part, no pattern found: ${[...part._zod.traits].shift()}`);
      }
      const source = part._zod.pattern instanceof RegExp ? part._zod.pattern.source : part._zod.pattern;
      if (!source)
        throw new Error(`Invalid template literal part: ${part._zod.traits}`);
      const start = source.startsWith("^") ? 1 : 0;
      const end = source.endsWith("$") ? source.length - 1 : source.length;
      regexParts.push(source.slice(start, end));
    } else if (part === null || primitiveTypes.has(typeof part)) {
      regexParts.push(escapeRegex(`${part}`));
    } else {
      throw new Error(`Invalid template literal part: ${part}`);
    }
  }
  inst._zod.pattern = new RegExp(`^${regexParts.join("")}$`);
  inst._zod.parse = (payload, _ctx) => {
    if (typeof payload.value !== "string") {
      payload.issues.push({
        input: payload.value,
        inst,
        expected: "string",
        code: "invalid_type"
      });
      return payload;
    }
    inst._zod.pattern.lastIndex = 0;
    if (!inst._zod.pattern.test(payload.value)) {
      payload.issues.push({
        input: payload.value,
        inst,
        code: "invalid_format",
        format: def.format ?? "template_literal",
        pattern: inst._zod.pattern.source
      });
      return payload;
    }
    return payload;
  };
});
var $ZodFunction = /* @__PURE__ */ $constructor("$ZodFunction", (inst, def) => {
  $ZodType.init(inst, def);
  inst._def = def;
  inst._zod.def = def;
  inst.implement = (func) => {
    if (typeof func !== "function") {
      throw new Error("implement() must be called with a function");
    }
    return function(...args) {
      const parsedArgs = inst._def.input ? parse(inst._def.input, args) : args;
      const result = Reflect.apply(func, this, parsedArgs);
      if (inst._def.output) {
        return parse(inst._def.output, result);
      }
      return result;
    };
  };
  inst.implementAsync = (func) => {
    if (typeof func !== "function") {
      throw new Error("implementAsync() must be called with a function");
    }
    return async function(...args) {
      const parsedArgs = inst._def.input ? await parseAsync(inst._def.input, args) : args;
      const result = await Reflect.apply(func, this, parsedArgs);
      if (inst._def.output) {
        return await parseAsync(inst._def.output, result);
      }
      return result;
    };
  };
  inst._zod.parse = (payload, _ctx) => {
    if (typeof payload.value !== "function") {
      payload.issues.push({
        code: "invalid_type",
        expected: "function",
        input: payload.value,
        inst
      });
      return payload;
    }
    const hasPromiseOutput = inst._def.output && inst._def.output._zod.def.type === "promise";
    if (hasPromiseOutput) {
      payload.value = inst.implementAsync(payload.value);
    } else {
      payload.value = inst.implement(payload.value);
    }
    return payload;
  };
  inst.input = (...args) => {
    const F = inst.constructor;
    if (Array.isArray(args[0])) {
      return new F({
        type: "function",
        input: new $ZodTuple({
          type: "tuple",
          items: args[0],
          rest: args[1]
        }),
        output: inst._def.output
      });
    }
    return new F({
      type: "function",
      input: args[0],
      output: inst._def.output
    });
  };
  inst.output = (output) => {
    const F = inst.constructor;
    return new F({
      type: "function",
      input: inst._def.input,
      output
    });
  };
  return inst;
});
var $ZodPromise = /* @__PURE__ */ $constructor("$ZodPromise", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, ctx) => {
    return Promise.resolve(payload.value).then((inner) => def.innerType._zod.run({ value: inner, issues: [] }, ctx));
  };
});
var $ZodLazy = /* @__PURE__ */ $constructor("$ZodLazy", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "innerType", () => def.getter());
  defineLazy(inst._zod, "pattern", () => inst._zod.innerType?._zod?.pattern);
  defineLazy(inst._zod, "propValues", () => inst._zod.innerType?._zod?.propValues);
  defineLazy(inst._zod, "optin", () => inst._zod.innerType?._zod?.optin ?? void 0);
  defineLazy(inst._zod, "optout", () => inst._zod.innerType?._zod?.optout ?? void 0);
  inst._zod.parse = (payload, ctx) => {
    const inner = inst._zod.innerType;
    return inner._zod.run(payload, ctx);
  };
});
var $ZodCustom = /* @__PURE__ */ $constructor("$ZodCustom", (inst, def) => {
  $ZodCheck.init(inst, def);
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, _) => {
    return payload;
  };
  inst._zod.check = (payload) => {
    const input = payload.value;
    const r = def.fn(input);
    if (r instanceof Promise) {
      return r.then((r2) => handleRefineResult(r2, payload, input, inst));
    }
    handleRefineResult(r, payload, input, inst);
    return;
  };
});
function handleRefineResult(result, payload, input, inst) {
  if (!result) {
    const _iss = {
      code: "custom",
      input,
      inst,
      // incorporates params.error into issue reporting
      path: [...inst._zod.def.path ?? []],
      // incorporates params.error into issue reporting
      continue: !inst._zod.def.abort
      // params: inst._zod.def.params,
    };
    if (inst._zod.def.params)
      _iss.params = inst._zod.def.params;
    payload.issues.push(issue(_iss));
  }
}

// ../../node_modules/zod/v4/locales/index.js
var locales_exports = {};
__export(locales_exports, {
  ar: () => ar_default,
  az: () => az_default,
  be: () => be_default,
  bg: () => bg_default,
  ca: () => ca_default,
  cs: () => cs_default,
  da: () => da_default,
  de: () => de_default,
  en: () => en_default,
  eo: () => eo_default,
  es: () => es_default,
  fa: () => fa_default,
  fi: () => fi_default,
  fr: () => fr_default,
  frCA: () => fr_CA_default,
  he: () => he_default,
  hu: () => hu_default,
  hy: () => hy_default,
  id: () => id_default,
  is: () => is_default,
  it: () => it_default,
  ja: () => ja_default,
  ka: () => ka_default,
  kh: () => kh_default,
  km: () => km_default,
  ko: () => ko_default,
  lt: () => lt_default,
  mk: () => mk_default,
  ms: () => ms_default,
  nl: () => nl_default,
  no: () => no_default,
  ota: () => ota_default,
  pl: () => pl_default,
  ps: () => ps_default,
  pt: () => pt_default,
  ru: () => ru_default,
  sl: () => sl_default,
  sv: () => sv_default,
  ta: () => ta_default,
  th: () => th_default,
  tr: () => tr_default,
  ua: () => ua_default,
  uk: () => uk_default,
  ur: () => ur_default,
  uz: () => uz_default,
  vi: () => vi_default,
  yo: () => yo_default,
  zhCN: () => zh_CN_default,
  zhTW: () => zh_TW_default
});

// ../../node_modules/zod/v4/locales/ar.js
var error = () => {
  const Sizable = {
    string: { unit: "\u062D\u0631\u0641", verb: "\u0623\u0646 \u064A\u062D\u0648\u064A" },
    file: { unit: "\u0628\u0627\u064A\u062A", verb: "\u0623\u0646 \u064A\u062D\u0648\u064A" },
    array: { unit: "\u0639\u0646\u0635\u0631", verb: "\u0623\u0646 \u064A\u062D\u0648\u064A" },
    set: { unit: "\u0639\u0646\u0635\u0631", verb: "\u0623\u0646 \u064A\u062D\u0648\u064A" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "\u0645\u062F\u062E\u0644",
    email: "\u0628\u0631\u064A\u062F \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A",
    url: "\u0631\u0627\u0628\u0637",
    emoji: "\u0625\u064A\u0645\u0648\u062C\u064A",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "\u062A\u0627\u0631\u064A\u062E \u0648\u0648\u0642\u062A \u0628\u0645\u0639\u064A\u0627\u0631 ISO",
    date: "\u062A\u0627\u0631\u064A\u062E \u0628\u0645\u0639\u064A\u0627\u0631 ISO",
    time: "\u0648\u0642\u062A \u0628\u0645\u0639\u064A\u0627\u0631 ISO",
    duration: "\u0645\u062F\u0629 \u0628\u0645\u0639\u064A\u0627\u0631 ISO",
    ipv4: "\u0639\u0646\u0648\u0627\u0646 IPv4",
    ipv6: "\u0639\u0646\u0648\u0627\u0646 IPv6",
    cidrv4: "\u0645\u062F\u0649 \u0639\u0646\u0627\u0648\u064A\u0646 \u0628\u0635\u064A\u063A\u0629 IPv4",
    cidrv6: "\u0645\u062F\u0649 \u0639\u0646\u0627\u0648\u064A\u0646 \u0628\u0635\u064A\u063A\u0629 IPv6",
    base64: "\u0646\u064E\u0635 \u0628\u062A\u0631\u0645\u064A\u0632 base64-encoded",
    base64url: "\u0646\u064E\u0635 \u0628\u062A\u0631\u0645\u064A\u0632 base64url-encoded",
    json_string: "\u0646\u064E\u0635 \u0639\u0644\u0649 \u0647\u064A\u0626\u0629 JSON",
    e164: "\u0631\u0642\u0645 \u0647\u0627\u062A\u0641 \u0628\u0645\u0639\u064A\u0627\u0631 E.164",
    jwt: "JWT",
    template_literal: "\u0645\u062F\u062E\u0644"
  };
  const TypeDictionary = {
    nan: "NaN"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        if (/^[A-Z]/.test(issue2.expected)) {
          return `\u0645\u062F\u062E\u0644\u0627\u062A \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644\u0629: \u064A\u0641\u062A\u0631\u0636 \u0625\u062F\u062E\u0627\u0644 instanceof ${issue2.expected}\u060C \u0648\u0644\u0643\u0646 \u062A\u0645 \u0625\u062F\u062E\u0627\u0644 ${received}`;
        }
        return `\u0645\u062F\u062E\u0644\u0627\u062A \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644\u0629: \u064A\u0641\u062A\u0631\u0636 \u0625\u062F\u062E\u0627\u0644 ${expected}\u060C \u0648\u0644\u0643\u0646 \u062A\u0645 \u0625\u062F\u062E\u0627\u0644 ${received}`;
      }
      case "invalid_value":
        if (issue2.values.length === 1)
          return `\u0645\u062F\u062E\u0644\u0627\u062A \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644\u0629: \u064A\u0641\u062A\u0631\u0636 \u0625\u062F\u062E\u0627\u0644 ${stringifyPrimitive(issue2.values[0])}`;
        return `\u0627\u062E\u062A\u064A\u0627\u0631 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062A\u0648\u0642\u0639 \u0627\u0646\u062A\u0642\u0627\u0621 \u0623\u062D\u062F \u0647\u0630\u0647 \u0627\u0644\u062E\u064A\u0627\u0631\u0627\u062A: ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return ` \u0623\u0643\u0628\u0631 \u0645\u0646 \u0627\u0644\u0644\u0627\u0632\u0645: \u064A\u0641\u062A\u0631\u0636 \u0623\u0646 \u062A\u0643\u0648\u0646 ${issue2.origin ?? "\u0627\u0644\u0642\u064A\u0645\u0629"} ${adj} ${issue2.maximum.toString()} ${sizing.unit ?? "\u0639\u0646\u0635\u0631"}`;
        return `\u0623\u0643\u0628\u0631 \u0645\u0646 \u0627\u0644\u0644\u0627\u0632\u0645: \u064A\u0641\u062A\u0631\u0636 \u0623\u0646 \u062A\u0643\u0648\u0646 ${issue2.origin ?? "\u0627\u0644\u0642\u064A\u0645\u0629"} ${adj} ${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `\u0623\u0635\u063A\u0631 \u0645\u0646 \u0627\u0644\u0644\u0627\u0632\u0645: \u064A\u0641\u062A\u0631\u0636 \u0644\u0640 ${issue2.origin} \u0623\u0646 \u064A\u0643\u0648\u0646 ${adj} ${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `\u0623\u0635\u063A\u0631 \u0645\u0646 \u0627\u0644\u0644\u0627\u0632\u0645: \u064A\u0641\u062A\u0631\u0636 \u0644\u0640 ${issue2.origin} \u0623\u0646 \u064A\u0643\u0648\u0646 ${adj} ${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `\u0646\u064E\u0635 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062C\u0628 \u0623\u0646 \u064A\u0628\u062F\u0623 \u0628\u0640 "${issue2.prefix}"`;
        if (_issue.format === "ends_with")
          return `\u0646\u064E\u0635 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062C\u0628 \u0623\u0646 \u064A\u0646\u062A\u0647\u064A \u0628\u0640 "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `\u0646\u064E\u0635 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062C\u0628 \u0623\u0646 \u064A\u062A\u0636\u0645\u0651\u064E\u0646 "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `\u0646\u064E\u0635 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062C\u0628 \u0623\u0646 \u064A\u0637\u0627\u0628\u0642 \u0627\u0644\u0646\u0645\u0637 ${_issue.pattern}`;
        return `${FormatDictionary[_issue.format] ?? issue2.format} \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644`;
      }
      case "not_multiple_of":
        return `\u0631\u0642\u0645 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0645\u0646 \u0645\u0636\u0627\u0639\u0641\u0627\u062A ${issue2.divisor}`;
      case "unrecognized_keys":
        return `\u0645\u0639\u0631\u0641${issue2.keys.length > 1 ? "\u0627\u062A" : ""} \u063A\u0631\u064A\u0628${issue2.keys.length > 1 ? "\u0629" : ""}: ${joinValues(issue2.keys, "\u060C ")}`;
      case "invalid_key":
        return `\u0645\u0639\u0631\u0641 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644 \u0641\u064A ${issue2.origin}`;
      case "invalid_union":
        return "\u0645\u062F\u062E\u0644 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644";
      case "invalid_element":
        return `\u0645\u062F\u062E\u0644 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644 \u0641\u064A ${issue2.origin}`;
      default:
        return "\u0645\u062F\u062E\u0644 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644";
    }
  };
};
function ar_default() {
  return {
    localeError: error()
  };
}

// ../../node_modules/zod/v4/locales/az.js
var error2 = () => {
  const Sizable = {
    string: { unit: "simvol", verb: "olmal\u0131d\u0131r" },
    file: { unit: "bayt", verb: "olmal\u0131d\u0131r" },
    array: { unit: "element", verb: "olmal\u0131d\u0131r" },
    set: { unit: "element", verb: "olmal\u0131d\u0131r" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "input",
    email: "email address",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO datetime",
    date: "ISO date",
    time: "ISO time",
    duration: "ISO duration",
    ipv4: "IPv4 address",
    ipv6: "IPv6 address",
    cidrv4: "IPv4 range",
    cidrv6: "IPv6 range",
    base64: "base64-encoded string",
    base64url: "base64url-encoded string",
    json_string: "JSON string",
    e164: "E.164 number",
    jwt: "JWT",
    template_literal: "input"
  };
  const TypeDictionary = {
    nan: "NaN"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        if (/^[A-Z]/.test(issue2.expected)) {
          return `Yanl\u0131\u015F d\u0259y\u0259r: g\xF6zl\u0259nil\u0259n instanceof ${issue2.expected}, daxil olan ${received}`;
        }
        return `Yanl\u0131\u015F d\u0259y\u0259r: g\xF6zl\u0259nil\u0259n ${expected}, daxil olan ${received}`;
      }
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Yanl\u0131\u015F d\u0259y\u0259r: g\xF6zl\u0259nil\u0259n ${stringifyPrimitive(issue2.values[0])}`;
        return `Yanl\u0131\u015F se\xE7im: a\u015Fa\u011F\u0131dak\u0131lardan biri olmal\u0131d\u0131r: ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `\xC7ox b\xF6y\xFCk: g\xF6zl\u0259nil\u0259n ${issue2.origin ?? "d\u0259y\u0259r"} ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "element"}`;
        return `\xC7ox b\xF6y\xFCk: g\xF6zl\u0259nil\u0259n ${issue2.origin ?? "d\u0259y\u0259r"} ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `\xC7ox ki\xE7ik: g\xF6zl\u0259nil\u0259n ${issue2.origin} ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        return `\xC7ox ki\xE7ik: g\xF6zl\u0259nil\u0259n ${issue2.origin} ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `Yanl\u0131\u015F m\u0259tn: "${_issue.prefix}" il\u0259 ba\u015Flamal\u0131d\u0131r`;
        if (_issue.format === "ends_with")
          return `Yanl\u0131\u015F m\u0259tn: "${_issue.suffix}" il\u0259 bitm\u0259lidir`;
        if (_issue.format === "includes")
          return `Yanl\u0131\u015F m\u0259tn: "${_issue.includes}" daxil olmal\u0131d\u0131r`;
        if (_issue.format === "regex")
          return `Yanl\u0131\u015F m\u0259tn: ${_issue.pattern} \u015Fablonuna uy\u011Fun olmal\u0131d\u0131r`;
        return `Yanl\u0131\u015F ${FormatDictionary[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `Yanl\u0131\u015F \u0259d\u0259d: ${issue2.divisor} il\u0259 b\xF6l\xFCn\u0259 bil\u0259n olmal\u0131d\u0131r`;
      case "unrecognized_keys":
        return `Tan\u0131nmayan a\xE7ar${issue2.keys.length > 1 ? "lar" : ""}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `${issue2.origin} daxilind\u0259 yanl\u0131\u015F a\xE7ar`;
      case "invalid_union":
        return "Yanl\u0131\u015F d\u0259y\u0259r";
      case "invalid_element":
        return `${issue2.origin} daxilind\u0259 yanl\u0131\u015F d\u0259y\u0259r`;
      default:
        return `Yanl\u0131\u015F d\u0259y\u0259r`;
    }
  };
};
function az_default() {
  return {
    localeError: error2()
  };
}

// ../../node_modules/zod/v4/locales/be.js
function getBelarusianPlural(count, one, few, many) {
  const absCount = Math.abs(count);
  const lastDigit = absCount % 10;
  const lastTwoDigits = absCount % 100;
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return many;
  }
  if (lastDigit === 1) {
    return one;
  }
  if (lastDigit >= 2 && lastDigit <= 4) {
    return few;
  }
  return many;
}
var error3 = () => {
  const Sizable = {
    string: {
      unit: {
        one: "\u0441\u0456\u043C\u0432\u0430\u043B",
        few: "\u0441\u0456\u043C\u0432\u0430\u043B\u044B",
        many: "\u0441\u0456\u043C\u0432\u0430\u043B\u0430\u045E"
      },
      verb: "\u043C\u0435\u0446\u044C"
    },
    array: {
      unit: {
        one: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442",
        few: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u044B",
        many: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u0430\u045E"
      },
      verb: "\u043C\u0435\u0446\u044C"
    },
    set: {
      unit: {
        one: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442",
        few: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u044B",
        many: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u0430\u045E"
      },
      verb: "\u043C\u0435\u0446\u044C"
    },
    file: {
      unit: {
        one: "\u0431\u0430\u0439\u0442",
        few: "\u0431\u0430\u0439\u0442\u044B",
        many: "\u0431\u0430\u0439\u0442\u0430\u045E"
      },
      verb: "\u043C\u0435\u0446\u044C"
    }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "\u0443\u0432\u043E\u0434",
    email: "email \u0430\u0434\u0440\u0430\u0441",
    url: "URL",
    emoji: "\u044D\u043C\u043E\u0434\u0437\u0456",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO \u0434\u0430\u0442\u0430 \u0456 \u0447\u0430\u0441",
    date: "ISO \u0434\u0430\u0442\u0430",
    time: "ISO \u0447\u0430\u0441",
    duration: "ISO \u043F\u0440\u0430\u0446\u044F\u0433\u043B\u0430\u0441\u0446\u044C",
    ipv4: "IPv4 \u0430\u0434\u0440\u0430\u0441",
    ipv6: "IPv6 \u0430\u0434\u0440\u0430\u0441",
    cidrv4: "IPv4 \u0434\u044B\u044F\u043F\u0430\u0437\u043E\u043D",
    cidrv6: "IPv6 \u0434\u044B\u044F\u043F\u0430\u0437\u043E\u043D",
    base64: "\u0440\u0430\u0434\u043E\u043A \u0443 \u0444\u0430\u0440\u043C\u0430\u0446\u0435 base64",
    base64url: "\u0440\u0430\u0434\u043E\u043A \u0443 \u0444\u0430\u0440\u043C\u0430\u0446\u0435 base64url",
    json_string: "JSON \u0440\u0430\u0434\u043E\u043A",
    e164: "\u043D\u0443\u043C\u0430\u0440 E.164",
    jwt: "JWT",
    template_literal: "\u0443\u0432\u043E\u0434"
  };
  const TypeDictionary = {
    nan: "NaN",
    number: "\u043B\u0456\u043A",
    array: "\u043C\u0430\u0441\u0456\u045E"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        if (/^[A-Z]/.test(issue2.expected)) {
          return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u045E\u0432\u043E\u0434: \u0447\u0430\u043A\u0430\u045E\u0441\u044F instanceof ${issue2.expected}, \u0430\u0442\u0440\u044B\u043C\u0430\u043D\u0430 ${received}`;
        }
        return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u045E\u0432\u043E\u0434: \u0447\u0430\u043A\u0430\u045E\u0441\u044F ${expected}, \u0430\u0442\u0440\u044B\u043C\u0430\u043D\u0430 ${received}`;
      }
      case "invalid_value":
        if (issue2.values.length === 1)
          return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u045E\u0432\u043E\u0434: \u0447\u0430\u043A\u0430\u043B\u0430\u0441\u044F ${stringifyPrimitive(issue2.values[0])}`;
        return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u0432\u0430\u0440\u044B\u044F\u043D\u0442: \u0447\u0430\u043A\u0430\u045E\u0441\u044F \u0430\u0434\u0437\u0456\u043D \u0437 ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          const maxValue = Number(issue2.maximum);
          const unit = getBelarusianPlural(maxValue, sizing.unit.one, sizing.unit.few, sizing.unit.many);
          return `\u0417\u0430\u043D\u0430\u0434\u0442\u0430 \u0432\u044F\u043B\u0456\u043A\u0456: \u0447\u0430\u043A\u0430\u043B\u0430\u0441\u044F, \u0448\u0442\u043E ${issue2.origin ?? "\u0437\u043D\u0430\u0447\u044D\u043D\u043D\u0435"} \u043F\u0430\u0432\u0456\u043D\u043D\u0430 ${sizing.verb} ${adj}${issue2.maximum.toString()} ${unit}`;
        }
        return `\u0417\u0430\u043D\u0430\u0434\u0442\u0430 \u0432\u044F\u043B\u0456\u043A\u0456: \u0447\u0430\u043A\u0430\u043B\u0430\u0441\u044F, \u0448\u0442\u043E ${issue2.origin ?? "\u0437\u043D\u0430\u0447\u044D\u043D\u043D\u0435"} \u043F\u0430\u0432\u0456\u043D\u043D\u0430 \u0431\u044B\u0446\u044C ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          const minValue = Number(issue2.minimum);
          const unit = getBelarusianPlural(minValue, sizing.unit.one, sizing.unit.few, sizing.unit.many);
          return `\u0417\u0430\u043D\u0430\u0434\u0442\u0430 \u043C\u0430\u043B\u044B: \u0447\u0430\u043A\u0430\u043B\u0430\u0441\u044F, \u0448\u0442\u043E ${issue2.origin} \u043F\u0430\u0432\u0456\u043D\u043D\u0430 ${sizing.verb} ${adj}${issue2.minimum.toString()} ${unit}`;
        }
        return `\u0417\u0430\u043D\u0430\u0434\u0442\u0430 \u043C\u0430\u043B\u044B: \u0447\u0430\u043A\u0430\u043B\u0430\u0441\u044F, \u0448\u0442\u043E ${issue2.origin} \u043F\u0430\u0432\u0456\u043D\u043D\u0430 \u0431\u044B\u0446\u044C ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u0440\u0430\u0434\u043E\u043A: \u043F\u0430\u0432\u0456\u043D\u0435\u043D \u043F\u0430\u0447\u044B\u043D\u0430\u0446\u0446\u0430 \u0437 "${_issue.prefix}"`;
        if (_issue.format === "ends_with")
          return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u0440\u0430\u0434\u043E\u043A: \u043F\u0430\u0432\u0456\u043D\u0435\u043D \u0437\u0430\u043A\u0430\u043D\u0447\u0432\u0430\u0446\u0446\u0430 \u043D\u0430 "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u0440\u0430\u0434\u043E\u043A: \u043F\u0430\u0432\u0456\u043D\u0435\u043D \u0437\u043C\u044F\u0448\u0447\u0430\u0446\u044C "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u0440\u0430\u0434\u043E\u043A: \u043F\u0430\u0432\u0456\u043D\u0435\u043D \u0430\u0434\u043F\u0430\u0432\u044F\u0434\u0430\u0446\u044C \u0448\u0430\u0431\u043B\u043E\u043D\u0443 ${_issue.pattern}`;
        return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B ${FormatDictionary[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u043B\u0456\u043A: \u043F\u0430\u0432\u0456\u043D\u0435\u043D \u0431\u044B\u0446\u044C \u043A\u0440\u0430\u0442\u043D\u044B\u043C ${issue2.divisor}`;
      case "unrecognized_keys":
        return `\u041D\u0435\u0440\u0430\u0441\u043F\u0430\u0437\u043D\u0430\u043D\u044B ${issue2.keys.length > 1 ? "\u043A\u043B\u044E\u0447\u044B" : "\u043A\u043B\u044E\u0447"}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u043A\u043B\u044E\u0447 \u0443 ${issue2.origin}`;
      case "invalid_union":
        return "\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u045E\u0432\u043E\u0434";
      case "invalid_element":
        return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u0430\u0435 \u0437\u043D\u0430\u0447\u044D\u043D\u043D\u0435 \u045E ${issue2.origin}`;
      default:
        return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u045E\u0432\u043E\u0434`;
    }
  };
};
function be_default() {
  return {
    localeError: error3()
  };
}

// ../../node_modules/zod/v4/locales/bg.js
var error4 = () => {
  const Sizable = {
    string: { unit: "\u0441\u0438\u043C\u0432\u043E\u043B\u0430", verb: "\u0434\u0430 \u0441\u044A\u0434\u044A\u0440\u0436\u0430" },
    file: { unit: "\u0431\u0430\u0439\u0442\u0430", verb: "\u0434\u0430 \u0441\u044A\u0434\u044A\u0440\u0436\u0430" },
    array: { unit: "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0430", verb: "\u0434\u0430 \u0441\u044A\u0434\u044A\u0440\u0436\u0430" },
    set: { unit: "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0430", verb: "\u0434\u0430 \u0441\u044A\u0434\u044A\u0440\u0436\u0430" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "\u0432\u0445\u043E\u0434",
    email: "\u0438\u043C\u0435\u0439\u043B \u0430\u0434\u0440\u0435\u0441",
    url: "URL",
    emoji: "\u0435\u043C\u043E\u0434\u0436\u0438",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO \u0432\u0440\u0435\u043C\u0435",
    date: "ISO \u0434\u0430\u0442\u0430",
    time: "ISO \u0432\u0440\u0435\u043C\u0435",
    duration: "ISO \u043F\u0440\u043E\u0434\u044A\u043B\u0436\u0438\u0442\u0435\u043B\u043D\u043E\u0441\u0442",
    ipv4: "IPv4 \u0430\u0434\u0440\u0435\u0441",
    ipv6: "IPv6 \u0430\u0434\u0440\u0435\u0441",
    cidrv4: "IPv4 \u0434\u0438\u0430\u043F\u0430\u0437\u043E\u043D",
    cidrv6: "IPv6 \u0434\u0438\u0430\u043F\u0430\u0437\u043E\u043D",
    base64: "base64-\u043A\u043E\u0434\u0438\u0440\u0430\u043D \u043D\u0438\u0437",
    base64url: "base64url-\u043A\u043E\u0434\u0438\u0440\u0430\u043D \u043D\u0438\u0437",
    json_string: "JSON \u043D\u0438\u0437",
    e164: "E.164 \u043D\u043E\u043C\u0435\u0440",
    jwt: "JWT",
    template_literal: "\u0432\u0445\u043E\u0434"
  };
  const TypeDictionary = {
    nan: "NaN",
    number: "\u0447\u0438\u0441\u043B\u043E",
    array: "\u043C\u0430\u0441\u0438\u0432"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        if (/^[A-Z]/.test(issue2.expected)) {
          return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u0432\u0445\u043E\u0434: \u043E\u0447\u0430\u043A\u0432\u0430\u043D instanceof ${issue2.expected}, \u043F\u043E\u043B\u0443\u0447\u0435\u043D ${received}`;
        }
        return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u0432\u0445\u043E\u0434: \u043E\u0447\u0430\u043A\u0432\u0430\u043D ${expected}, \u043F\u043E\u043B\u0443\u0447\u0435\u043D ${received}`;
      }
      case "invalid_value":
        if (issue2.values.length === 1)
          return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u0432\u0445\u043E\u0434: \u043E\u0447\u0430\u043A\u0432\u0430\u043D ${stringifyPrimitive(issue2.values[0])}`;
        return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u0430 \u043E\u043F\u0446\u0438\u044F: \u043E\u0447\u0430\u043A\u0432\u0430\u043D\u043E \u0435\u0434\u043D\u043E \u043E\u0442 ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `\u0422\u0432\u044A\u0440\u0434\u0435 \u0433\u043E\u043B\u044F\u043C\u043E: \u043E\u0447\u0430\u043A\u0432\u0430 \u0441\u0435 ${issue2.origin ?? "\u0441\u0442\u043E\u0439\u043D\u043E\u0441\u0442"} \u0434\u0430 \u0441\u044A\u0434\u044A\u0440\u0436\u0430 ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0430"}`;
        return `\u0422\u0432\u044A\u0440\u0434\u0435 \u0433\u043E\u043B\u044F\u043C\u043E: \u043E\u0447\u0430\u043A\u0432\u0430 \u0441\u0435 ${issue2.origin ?? "\u0441\u0442\u043E\u0439\u043D\u043E\u0441\u0442"} \u0434\u0430 \u0431\u044A\u0434\u0435 ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `\u0422\u0432\u044A\u0440\u0434\u0435 \u043C\u0430\u043B\u043A\u043E: \u043E\u0447\u0430\u043A\u0432\u0430 \u0441\u0435 ${issue2.origin} \u0434\u0430 \u0441\u044A\u0434\u044A\u0440\u0436\u0430 ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `\u0422\u0432\u044A\u0440\u0434\u0435 \u043C\u0430\u043B\u043A\u043E: \u043E\u0447\u0430\u043A\u0432\u0430 \u0441\u0435 ${issue2.origin} \u0434\u0430 \u0431\u044A\u0434\u0435 ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with") {
          return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u043D\u0438\u0437: \u0442\u0440\u044F\u0431\u0432\u0430 \u0434\u0430 \u0437\u0430\u043F\u043E\u0447\u0432\u0430 \u0441 "${_issue.prefix}"`;
        }
        if (_issue.format === "ends_with")
          return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u043D\u0438\u0437: \u0442\u0440\u044F\u0431\u0432\u0430 \u0434\u0430 \u0437\u0430\u0432\u044A\u0440\u0448\u0432\u0430 \u0441 "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u043D\u0438\u0437: \u0442\u0440\u044F\u0431\u0432\u0430 \u0434\u0430 \u0432\u043A\u043B\u044E\u0447\u0432\u0430 "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u043D\u0438\u0437: \u0442\u0440\u044F\u0431\u0432\u0430 \u0434\u0430 \u0441\u044A\u0432\u043F\u0430\u0434\u0430 \u0441 ${_issue.pattern}`;
        let invalid_adj = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D";
        if (_issue.format === "emoji")
          invalid_adj = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u043E";
        if (_issue.format === "datetime")
          invalid_adj = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u043E";
        if (_issue.format === "date")
          invalid_adj = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u0430";
        if (_issue.format === "time")
          invalid_adj = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u043E";
        if (_issue.format === "duration")
          invalid_adj = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u0430";
        return `${invalid_adj} ${FormatDictionary[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u043E \u0447\u0438\u0441\u043B\u043E: \u0442\u0440\u044F\u0431\u0432\u0430 \u0434\u0430 \u0431\u044A\u0434\u0435 \u043A\u0440\u0430\u0442\u043D\u043E \u043D\u0430 ${issue2.divisor}`;
      case "unrecognized_keys":
        return `\u041D\u0435\u0440\u0430\u0437\u043F\u043E\u0437\u043D\u0430\u0442${issue2.keys.length > 1 ? "\u0438" : ""} \u043A\u043B\u044E\u0447${issue2.keys.length > 1 ? "\u043E\u0432\u0435" : ""}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u043A\u043B\u044E\u0447 \u0432 ${issue2.origin}`;
      case "invalid_union":
        return "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u0432\u0445\u043E\u0434";
      case "invalid_element":
        return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u0430 \u0441\u0442\u043E\u0439\u043D\u043E\u0441\u0442 \u0432 ${issue2.origin}`;
      default:
        return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u0432\u0445\u043E\u0434`;
    }
  };
};
function bg_default() {
  return {
    localeError: error4()
  };
}

// ../../node_modules/zod/v4/locales/ca.js
var error5 = () => {
  const Sizable = {
    string: { unit: "car\xE0cters", verb: "contenir" },
    file: { unit: "bytes", verb: "contenir" },
    array: { unit: "elements", verb: "contenir" },
    set: { unit: "elements", verb: "contenir" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "entrada",
    email: "adre\xE7a electr\xF2nica",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "data i hora ISO",
    date: "data ISO",
    time: "hora ISO",
    duration: "durada ISO",
    ipv4: "adre\xE7a IPv4",
    ipv6: "adre\xE7a IPv6",
    cidrv4: "rang IPv4",
    cidrv6: "rang IPv6",
    base64: "cadena codificada en base64",
    base64url: "cadena codificada en base64url",
    json_string: "cadena JSON",
    e164: "n\xFAmero E.164",
    jwt: "JWT",
    template_literal: "entrada"
  };
  const TypeDictionary = {
    nan: "NaN"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        if (/^[A-Z]/.test(issue2.expected)) {
          return `Tipus inv\xE0lid: s'esperava instanceof ${issue2.expected}, s'ha rebut ${received}`;
        }
        return `Tipus inv\xE0lid: s'esperava ${expected}, s'ha rebut ${received}`;
      }
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Valor inv\xE0lid: s'esperava ${stringifyPrimitive(issue2.values[0])}`;
        return `Opci\xF3 inv\xE0lida: s'esperava una de ${joinValues(issue2.values, " o ")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "com a m\xE0xim" : "menys de";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `Massa gran: s'esperava que ${issue2.origin ?? "el valor"} contingu\xE9s ${adj} ${issue2.maximum.toString()} ${sizing.unit ?? "elements"}`;
        return `Massa gran: s'esperava que ${issue2.origin ?? "el valor"} fos ${adj} ${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? "com a m\xEDnim" : "m\xE9s de";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `Massa petit: s'esperava que ${issue2.origin} contingu\xE9s ${adj} ${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `Massa petit: s'esperava que ${issue2.origin} fos ${adj} ${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with") {
          return `Format inv\xE0lid: ha de comen\xE7ar amb "${_issue.prefix}"`;
        }
        if (_issue.format === "ends_with")
          return `Format inv\xE0lid: ha d'acabar amb "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `Format inv\xE0lid: ha d'incloure "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `Format inv\xE0lid: ha de coincidir amb el patr\xF3 ${_issue.pattern}`;
        return `Format inv\xE0lid per a ${FormatDictionary[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `N\xFAmero inv\xE0lid: ha de ser m\xFAltiple de ${issue2.divisor}`;
      case "unrecognized_keys":
        return `Clau${issue2.keys.length > 1 ? "s" : ""} no reconeguda${issue2.keys.length > 1 ? "s" : ""}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `Clau inv\xE0lida a ${issue2.origin}`;
      case "invalid_union":
        return "Entrada inv\xE0lida";
      // Could also be "Tipus d'unió invàlid" but "Entrada invàlida" is more general
      case "invalid_element":
        return `Element inv\xE0lid a ${issue2.origin}`;
      default:
        return `Entrada inv\xE0lida`;
    }
  };
};
function ca_default() {
  return {
    localeError: error5()
  };
}

// ../../node_modules/zod/v4/locales/cs.js
var error6 = () => {
  const Sizable = {
    string: { unit: "znak\u016F", verb: "m\xEDt" },
    file: { unit: "bajt\u016F", verb: "m\xEDt" },
    array: { unit: "prvk\u016F", verb: "m\xEDt" },
    set: { unit: "prvk\u016F", verb: "m\xEDt" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "regul\xE1rn\xED v\xFDraz",
    email: "e-mailov\xE1 adresa",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "datum a \u010Das ve form\xE1tu ISO",
    date: "datum ve form\xE1tu ISO",
    time: "\u010Das ve form\xE1tu ISO",
    duration: "doba trv\xE1n\xED ISO",
    ipv4: "IPv4 adresa",
    ipv6: "IPv6 adresa",
    cidrv4: "rozsah IPv4",
    cidrv6: "rozsah IPv6",
    base64: "\u0159et\u011Bzec zak\xF3dovan\xFD ve form\xE1tu base64",
    base64url: "\u0159et\u011Bzec zak\xF3dovan\xFD ve form\xE1tu base64url",
    json_string: "\u0159et\u011Bzec ve form\xE1tu JSON",
    e164: "\u010D\xEDslo E.164",
    jwt: "JWT",
    template_literal: "vstup"
  };
  const TypeDictionary = {
    nan: "NaN",
    number: "\u010D\xEDslo",
    string: "\u0159et\u011Bzec",
    function: "funkce",
    array: "pole"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        if (/^[A-Z]/.test(issue2.expected)) {
          return `Neplatn\xFD vstup: o\u010Dek\xE1v\xE1no instanceof ${issue2.expected}, obdr\u017Eeno ${received}`;
        }
        return `Neplatn\xFD vstup: o\u010Dek\xE1v\xE1no ${expected}, obdr\u017Eeno ${received}`;
      }
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Neplatn\xFD vstup: o\u010Dek\xE1v\xE1no ${stringifyPrimitive(issue2.values[0])}`;
        return `Neplatn\xE1 mo\u017Enost: o\u010Dek\xE1v\xE1na jedna z hodnot ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `Hodnota je p\u0159\xEDli\u0161 velk\xE1: ${issue2.origin ?? "hodnota"} mus\xED m\xEDt ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "prvk\u016F"}`;
        }
        return `Hodnota je p\u0159\xEDli\u0161 velk\xE1: ${issue2.origin ?? "hodnota"} mus\xED b\xFDt ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `Hodnota je p\u0159\xEDli\u0161 mal\xE1: ${issue2.origin ?? "hodnota"} mus\xED m\xEDt ${adj}${issue2.minimum.toString()} ${sizing.unit ?? "prvk\u016F"}`;
        }
        return `Hodnota je p\u0159\xEDli\u0161 mal\xE1: ${issue2.origin ?? "hodnota"} mus\xED b\xFDt ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `Neplatn\xFD \u0159et\u011Bzec: mus\xED za\u010D\xEDnat na "${_issue.prefix}"`;
        if (_issue.format === "ends_with")
          return `Neplatn\xFD \u0159et\u011Bzec: mus\xED kon\u010Dit na "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `Neplatn\xFD \u0159et\u011Bzec: mus\xED obsahovat "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `Neplatn\xFD \u0159et\u011Bzec: mus\xED odpov\xEDdat vzoru ${_issue.pattern}`;
        return `Neplatn\xFD form\xE1t ${FormatDictionary[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `Neplatn\xE9 \u010D\xEDslo: mus\xED b\xFDt n\xE1sobkem ${issue2.divisor}`;
      case "unrecognized_keys":
        return `Nezn\xE1m\xE9 kl\xED\u010De: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `Neplatn\xFD kl\xED\u010D v ${issue2.origin}`;
      case "invalid_union":
        return "Neplatn\xFD vstup";
      case "invalid_element":
        return `Neplatn\xE1 hodnota v ${issue2.origin}`;
      default:
        return `Neplatn\xFD vstup`;
    }
  };
};
function cs_default() {
  return {
    localeError: error6()
  };
}

// ../../node_modules/zod/v4/locales/da.js
var error7 = () => {
  const Sizable = {
    string: { unit: "tegn", verb: "havde" },
    file: { unit: "bytes", verb: "havde" },
    array: { unit: "elementer", verb: "indeholdt" },
    set: { unit: "elementer", verb: "indeholdt" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "input",
    email: "e-mailadresse",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO dato- og klokkesl\xE6t",
    date: "ISO-dato",
    time: "ISO-klokkesl\xE6t",
    duration: "ISO-varighed",
    ipv4: "IPv4-omr\xE5de",
    ipv6: "IPv6-omr\xE5de",
    cidrv4: "IPv4-spektrum",
    cidrv6: "IPv6-spektrum",
    base64: "base64-kodet streng",
    base64url: "base64url-kodet streng",
    json_string: "JSON-streng",
    e164: "E.164-nummer",
    jwt: "JWT",
    template_literal: "input"
  };
  const TypeDictionary = {
    nan: "NaN",
    string: "streng",
    number: "tal",
    boolean: "boolean",
    array: "liste",
    object: "objekt",
    set: "s\xE6t",
    file: "fil"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        if (/^[A-Z]/.test(issue2.expected)) {
          return `Ugyldigt input: forventede instanceof ${issue2.expected}, fik ${received}`;
        }
        return `Ugyldigt input: forventede ${expected}, fik ${received}`;
      }
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Ugyldig v\xE6rdi: forventede ${stringifyPrimitive(issue2.values[0])}`;
        return `Ugyldigt valg: forventede en af f\xF8lgende ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        const origin = TypeDictionary[issue2.origin] ?? issue2.origin;
        if (sizing)
          return `For stor: forventede ${origin ?? "value"} ${sizing.verb} ${adj} ${issue2.maximum.toString()} ${sizing.unit ?? "elementer"}`;
        return `For stor: forventede ${origin ?? "value"} havde ${adj} ${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        const origin = TypeDictionary[issue2.origin] ?? issue2.origin;
        if (sizing) {
          return `For lille: forventede ${origin} ${sizing.verb} ${adj} ${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `For lille: forventede ${origin} havde ${adj} ${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `Ugyldig streng: skal starte med "${_issue.prefix}"`;
        if (_issue.format === "ends_with")
          return `Ugyldig streng: skal ende med "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `Ugyldig streng: skal indeholde "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `Ugyldig streng: skal matche m\xF8nsteret ${_issue.pattern}`;
        return `Ugyldig ${FormatDictionary[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `Ugyldigt tal: skal v\xE6re deleligt med ${issue2.divisor}`;
      case "unrecognized_keys":
        return `${issue2.keys.length > 1 ? "Ukendte n\xF8gler" : "Ukendt n\xF8gle"}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `Ugyldig n\xF8gle i ${issue2.origin}`;
      case "invalid_union":
        return "Ugyldigt input: matcher ingen af de tilladte typer";
      case "invalid_element":
        return `Ugyldig v\xE6rdi i ${issue2.origin}`;
      default:
        return `Ugyldigt input`;
    }
  };
};
function da_default() {
  return {
    localeError: error7()
  };
}

// ../../node_modules/zod/v4/locales/de.js
var error8 = () => {
  const Sizable = {
    string: { unit: "Zeichen", verb: "zu haben" },
    file: { unit: "Bytes", verb: "zu haben" },
    array: { unit: "Elemente", verb: "zu haben" },
    set: { unit: "Elemente", verb: "zu haben" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "Eingabe",
    email: "E-Mail-Adresse",
    url: "URL",
    emoji: "Emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO-Datum und -Uhrzeit",
    date: "ISO-Datum",
    time: "ISO-Uhrzeit",
    duration: "ISO-Dauer",
    ipv4: "IPv4-Adresse",
    ipv6: "IPv6-Adresse",
    cidrv4: "IPv4-Bereich",
    cidrv6: "IPv6-Bereich",
    base64: "Base64-codierter String",
    base64url: "Base64-URL-codierter String",
    json_string: "JSON-String",
    e164: "E.164-Nummer",
    jwt: "JWT",
    template_literal: "Eingabe"
  };
  const TypeDictionary = {
    nan: "NaN",
    number: "Zahl",
    array: "Array"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        if (/^[A-Z]/.test(issue2.expected)) {
          return `Ung\xFCltige Eingabe: erwartet instanceof ${issue2.expected}, erhalten ${received}`;
        }
        return `Ung\xFCltige Eingabe: erwartet ${expected}, erhalten ${received}`;
      }
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Ung\xFCltige Eingabe: erwartet ${stringifyPrimitive(issue2.values[0])}`;
        return `Ung\xFCltige Option: erwartet eine von ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `Zu gro\xDF: erwartet, dass ${issue2.origin ?? "Wert"} ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "Elemente"} hat`;
        return `Zu gro\xDF: erwartet, dass ${issue2.origin ?? "Wert"} ${adj}${issue2.maximum.toString()} ist`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `Zu klein: erwartet, dass ${issue2.origin} ${adj}${issue2.minimum.toString()} ${sizing.unit} hat`;
        }
        return `Zu klein: erwartet, dass ${issue2.origin} ${adj}${issue2.minimum.toString()} ist`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `Ung\xFCltiger String: muss mit "${_issue.prefix}" beginnen`;
        if (_issue.format === "ends_with")
          return `Ung\xFCltiger String: muss mit "${_issue.suffix}" enden`;
        if (_issue.format === "includes")
          return `Ung\xFCltiger String: muss "${_issue.includes}" enthalten`;
        if (_issue.format === "regex")
          return `Ung\xFCltiger String: muss dem Muster ${_issue.pattern} entsprechen`;
        return `Ung\xFCltig: ${FormatDictionary[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `Ung\xFCltige Zahl: muss ein Vielfaches von ${issue2.divisor} sein`;
      case "unrecognized_keys":
        return `${issue2.keys.length > 1 ? "Unbekannte Schl\xFCssel" : "Unbekannter Schl\xFCssel"}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `Ung\xFCltiger Schl\xFCssel in ${issue2.origin}`;
      case "invalid_union":
        return "Ung\xFCltige Eingabe";
      case "invalid_element":
        return `Ung\xFCltiger Wert in ${issue2.origin}`;
      default:
        return `Ung\xFCltige Eingabe`;
    }
  };
};
function de_default() {
  return {
    localeError: error8()
  };
}

// ../../node_modules/zod/v4/locales/en.js
var error9 = () => {
  const Sizable = {
    string: { unit: "characters", verb: "to have" },
    file: { unit: "bytes", verb: "to have" },
    array: { unit: "items", verb: "to have" },
    set: { unit: "items", verb: "to have" },
    map: { unit: "entries", verb: "to have" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "input",
    email: "email address",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO datetime",
    date: "ISO date",
    time: "ISO time",
    duration: "ISO duration",
    ipv4: "IPv4 address",
    ipv6: "IPv6 address",
    mac: "MAC address",
    cidrv4: "IPv4 range",
    cidrv6: "IPv6 range",
    base64: "base64-encoded string",
    base64url: "base64url-encoded string",
    json_string: "JSON string",
    e164: "E.164 number",
    jwt: "JWT",
    template_literal: "input"
  };
  const TypeDictionary = {
    // Compatibility: "nan" -> "NaN" for display
    nan: "NaN"
    // All other type names omitted - they fall back to raw values via ?? operator
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        return `Invalid input: expected ${expected}, received ${received}`;
      }
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Invalid input: expected ${stringifyPrimitive(issue2.values[0])}`;
        return `Invalid option: expected one of ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `Too big: expected ${issue2.origin ?? "value"} to have ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elements"}`;
        return `Too big: expected ${issue2.origin ?? "value"} to be ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `Too small: expected ${issue2.origin} to have ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `Too small: expected ${issue2.origin} to be ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with") {
          return `Invalid string: must start with "${_issue.prefix}"`;
        }
        if (_issue.format === "ends_with")
          return `Invalid string: must end with "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `Invalid string: must include "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `Invalid string: must match pattern ${_issue.pattern}`;
        return `Invalid ${FormatDictionary[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `Invalid number: must be a multiple of ${issue2.divisor}`;
      case "unrecognized_keys":
        return `Unrecognized key${issue2.keys.length > 1 ? "s" : ""}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `Invalid key in ${issue2.origin}`;
      case "invalid_union":
        return "Invalid input";
      case "invalid_element":
        return `Invalid value in ${issue2.origin}`;
      default:
        return `Invalid input`;
    }
  };
};
function en_default() {
  return {
    localeError: error9()
  };
}

// ../../node_modules/zod/v4/locales/eo.js
var error10 = () => {
  const Sizable = {
    string: { unit: "karaktrojn", verb: "havi" },
    file: { unit: "bajtojn", verb: "havi" },
    array: { unit: "elementojn", verb: "havi" },
    set: { unit: "elementojn", verb: "havi" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "enigo",
    email: "retadreso",
    url: "URL",
    emoji: "emo\u011Dio",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO-datotempo",
    date: "ISO-dato",
    time: "ISO-tempo",
    duration: "ISO-da\u016Dro",
    ipv4: "IPv4-adreso",
    ipv6: "IPv6-adreso",
    cidrv4: "IPv4-rango",
    cidrv6: "IPv6-rango",
    base64: "64-ume kodita karaktraro",
    base64url: "URL-64-ume kodita karaktraro",
    json_string: "JSON-karaktraro",
    e164: "E.164-nombro",
    jwt: "JWT",
    template_literal: "enigo"
  };
  const TypeDictionary = {
    nan: "NaN",
    number: "nombro",
    array: "tabelo",
    null: "senvalora"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        if (/^[A-Z]/.test(issue2.expected)) {
          return `Nevalida enigo: atendi\u011Dis instanceof ${issue2.expected}, ricevi\u011Dis ${received}`;
        }
        return `Nevalida enigo: atendi\u011Dis ${expected}, ricevi\u011Dis ${received}`;
      }
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Nevalida enigo: atendi\u011Dis ${stringifyPrimitive(issue2.values[0])}`;
        return `Nevalida opcio: atendi\u011Dis unu el ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `Tro granda: atendi\u011Dis ke ${issue2.origin ?? "valoro"} havu ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elementojn"}`;
        return `Tro granda: atendi\u011Dis ke ${issue2.origin ?? "valoro"} havu ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `Tro malgranda: atendi\u011Dis ke ${issue2.origin} havu ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `Tro malgranda: atendi\u011Dis ke ${issue2.origin} estu ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `Nevalida karaktraro: devas komenci\u011Di per "${_issue.prefix}"`;
        if (_issue.format === "ends_with")
          return `Nevalida karaktraro: devas fini\u011Di per "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `Nevalida karaktraro: devas inkluzivi "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `Nevalida karaktraro: devas kongrui kun la modelo ${_issue.pattern}`;
        return `Nevalida ${FormatDictionary[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `Nevalida nombro: devas esti oblo de ${issue2.divisor}`;
      case "unrecognized_keys":
        return `Nekonata${issue2.keys.length > 1 ? "j" : ""} \u015Dlosilo${issue2.keys.length > 1 ? "j" : ""}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `Nevalida \u015Dlosilo en ${issue2.origin}`;
      case "invalid_union":
        return "Nevalida enigo";
      case "invalid_element":
        return `Nevalida valoro en ${issue2.origin}`;
      default:
        return `Nevalida enigo`;
    }
  };
};
function eo_default() {
  return {
    localeError: error10()
  };
}

// ../../node_modules/zod/v4/locales/es.js
var error11 = () => {
  const Sizable = {
    string: { unit: "caracteres", verb: "tener" },
    file: { unit: "bytes", verb: "tener" },
    array: { unit: "elementos", verb: "tener" },
    set: { unit: "elementos", verb: "tener" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "entrada",
    email: "direcci\xF3n de correo electr\xF3nico",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "fecha y hora ISO",
    date: "fecha ISO",
    time: "hora ISO",
    duration: "duraci\xF3n ISO",
    ipv4: "direcci\xF3n IPv4",
    ipv6: "direcci\xF3n IPv6",
    cidrv4: "rango IPv4",
    cidrv6: "rango IPv6",
    base64: "cadena codificada en base64",
    base64url: "URL codificada en base64",
    json_string: "cadena JSON",
    e164: "n\xFAmero E.164",
    jwt: "JWT",
    template_literal: "entrada"
  };
  const TypeDictionary = {
    nan: "NaN",
    string: "texto",
    number: "n\xFAmero",
    boolean: "booleano",
    array: "arreglo",
    object: "objeto",
    set: "conjunto",
    file: "archivo",
    date: "fecha",
    bigint: "n\xFAmero grande",
    symbol: "s\xEDmbolo",
    undefined: "indefinido",
    null: "nulo",
    function: "funci\xF3n",
    map: "mapa",
    record: "registro",
    tuple: "tupla",
    enum: "enumeraci\xF3n",
    union: "uni\xF3n",
    literal: "literal",
    promise: "promesa",
    void: "vac\xEDo",
    never: "nunca",
    unknown: "desconocido",
    any: "cualquiera"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        if (/^[A-Z]/.test(issue2.expected)) {
          return `Entrada inv\xE1lida: se esperaba instanceof ${issue2.expected}, recibido ${received}`;
        }
        return `Entrada inv\xE1lida: se esperaba ${expected}, recibido ${received}`;
      }
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Entrada inv\xE1lida: se esperaba ${stringifyPrimitive(issue2.values[0])}`;
        return `Opci\xF3n inv\xE1lida: se esperaba una de ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        const origin = TypeDictionary[issue2.origin] ?? issue2.origin;
        if (sizing)
          return `Demasiado grande: se esperaba que ${origin ?? "valor"} tuviera ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elementos"}`;
        return `Demasiado grande: se esperaba que ${origin ?? "valor"} fuera ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        const origin = TypeDictionary[issue2.origin] ?? issue2.origin;
        if (sizing) {
          return `Demasiado peque\xF1o: se esperaba que ${origin} tuviera ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `Demasiado peque\xF1o: se esperaba que ${origin} fuera ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `Cadena inv\xE1lida: debe comenzar con "${_issue.prefix}"`;
        if (_issue.format === "ends_with")
          return `Cadena inv\xE1lida: debe terminar en "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `Cadena inv\xE1lida: debe incluir "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `Cadena inv\xE1lida: debe coincidir con el patr\xF3n ${_issue.pattern}`;
        return `Inv\xE1lido ${FormatDictionary[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `N\xFAmero inv\xE1lido: debe ser m\xFAltiplo de ${issue2.divisor}`;
      case "unrecognized_keys":
        return `Llave${issue2.keys.length > 1 ? "s" : ""} desconocida${issue2.keys.length > 1 ? "s" : ""}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `Llave inv\xE1lida en ${TypeDictionary[issue2.origin] ?? issue2.origin}`;
      case "invalid_union":
        return "Entrada inv\xE1lida";
      case "invalid_element":
        return `Valor inv\xE1lido en ${TypeDictionary[issue2.origin] ?? issue2.origin}`;
      default:
        return `Entrada inv\xE1lida`;
    }
  };
};
function es_default() {
  return {
    localeError: error11()
  };
}

// ../../node_modules/zod/v4/locales/fa.js
var error12 = () => {
  const Sizable = {
    string: { unit: "\u06A9\u0627\u0631\u0627\u06A9\u062A\u0631", verb: "\u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u062F" },
    file: { unit: "\u0628\u0627\u06CC\u062A", verb: "\u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u062F" },
    array: { unit: "\u0622\u06CC\u062A\u0645", verb: "\u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u062F" },
    set: { unit: "\u0622\u06CC\u062A\u0645", verb: "\u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u062F" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "\u0648\u0631\u0648\u062F\u06CC",
    email: "\u0622\u062F\u0631\u0633 \u0627\u06CC\u0645\u06CC\u0644",
    url: "URL",
    emoji: "\u0627\u06CC\u0645\u0648\u062C\u06CC",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "\u062A\u0627\u0631\u06CC\u062E \u0648 \u0632\u0645\u0627\u0646 \u0627\u06CC\u0632\u0648",
    date: "\u062A\u0627\u0631\u06CC\u062E \u0627\u06CC\u0632\u0648",
    time: "\u0632\u0645\u0627\u0646 \u0627\u06CC\u0632\u0648",
    duration: "\u0645\u062F\u062A \u0632\u0645\u0627\u0646 \u0627\u06CC\u0632\u0648",
    ipv4: "IPv4 \u0622\u062F\u0631\u0633",
    ipv6: "IPv6 \u0622\u062F\u0631\u0633",
    cidrv4: "IPv4 \u062F\u0627\u0645\u0646\u0647",
    cidrv6: "IPv6 \u062F\u0627\u0645\u0646\u0647",
    base64: "base64-encoded \u0631\u0634\u062A\u0647",
    base64url: "base64url-encoded \u0631\u0634\u062A\u0647",
    json_string: "JSON \u0631\u0634\u062A\u0647",
    e164: "E.164 \u0639\u062F\u062F",
    jwt: "JWT",
    template_literal: "\u0648\u0631\u0648\u062F\u06CC"
  };
  const TypeDictionary = {
    nan: "NaN",
    number: "\u0639\u062F\u062F",
    array: "\u0622\u0631\u0627\u06CC\u0647"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        if (/^[A-Z]/.test(issue2.expected)) {
          return `\u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0645\u06CC\u200C\u0628\u0627\u06CC\u0633\u062A instanceof ${issue2.expected} \u0645\u06CC\u200C\u0628\u0648\u062F\u060C ${received} \u062F\u0631\u06CC\u0627\u0641\u062A \u0634\u062F`;
        }
        return `\u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0645\u06CC\u200C\u0628\u0627\u06CC\u0633\u062A ${expected} \u0645\u06CC\u200C\u0628\u0648\u062F\u060C ${received} \u062F\u0631\u06CC\u0627\u0641\u062A \u0634\u062F`;
      }
      case "invalid_value":
        if (issue2.values.length === 1) {
          return `\u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0645\u06CC\u200C\u0628\u0627\u06CC\u0633\u062A ${stringifyPrimitive(issue2.values[0])} \u0645\u06CC\u200C\u0628\u0648\u062F`;
        }
        return `\u06AF\u0632\u06CC\u0646\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0645\u06CC\u200C\u0628\u0627\u06CC\u0633\u062A \u06CC\u06A9\u06CC \u0627\u0632 ${joinValues(issue2.values, "|")} \u0645\u06CC\u200C\u0628\u0648\u062F`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `\u062E\u06CC\u0644\u06CC \u0628\u0632\u0631\u06AF: ${issue2.origin ?? "\u0645\u0642\u062F\u0627\u0631"} \u0628\u0627\u06CC\u062F ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "\u0639\u0646\u0635\u0631"} \u0628\u0627\u0634\u062F`;
        }
        return `\u062E\u06CC\u0644\u06CC \u0628\u0632\u0631\u06AF: ${issue2.origin ?? "\u0645\u0642\u062F\u0627\u0631"} \u0628\u0627\u06CC\u062F ${adj}${issue2.maximum.toString()} \u0628\u0627\u0634\u062F`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `\u062E\u06CC\u0644\u06CC \u06A9\u0648\u0686\u06A9: ${issue2.origin} \u0628\u0627\u06CC\u062F ${adj}${issue2.minimum.toString()} ${sizing.unit} \u0628\u0627\u0634\u062F`;
        }
        return `\u062E\u06CC\u0644\u06CC \u06A9\u0648\u0686\u06A9: ${issue2.origin} \u0628\u0627\u06CC\u062F ${adj}${issue2.minimum.toString()} \u0628\u0627\u0634\u062F`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with") {
          return `\u0631\u0634\u062A\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0628\u0627\u06CC\u062F \u0628\u0627 "${_issue.prefix}" \u0634\u0631\u0648\u0639 \u0634\u0648\u062F`;
        }
        if (_issue.format === "ends_with") {
          return `\u0631\u0634\u062A\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0628\u0627\u06CC\u062F \u0628\u0627 "${_issue.suffix}" \u062A\u0645\u0627\u0645 \u0634\u0648\u062F`;
        }
        if (_issue.format === "includes") {
          return `\u0631\u0634\u062A\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0628\u0627\u06CC\u062F \u0634\u0627\u0645\u0644 "${_issue.includes}" \u0628\u0627\u0634\u062F`;
        }
        if (_issue.format === "regex") {
          return `\u0631\u0634\u062A\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0628\u0627\u06CC\u062F \u0628\u0627 \u0627\u0644\u06AF\u0648\u06CC ${_issue.pattern} \u0645\u0637\u0627\u0628\u0642\u062A \u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u062F`;
        }
        return `${FormatDictionary[_issue.format] ?? issue2.format} \u0646\u0627\u0645\u0639\u062A\u0628\u0631`;
      }
      case "not_multiple_of":
        return `\u0639\u062F\u062F \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0628\u0627\u06CC\u062F \u0645\u0636\u0631\u0628 ${issue2.divisor} \u0628\u0627\u0634\u062F`;
      case "unrecognized_keys":
        return `\u06A9\u0644\u06CC\u062F${issue2.keys.length > 1 ? "\u0647\u0627\u06CC" : ""} \u0646\u0627\u0634\u0646\u0627\u0633: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `\u06A9\u0644\u06CC\u062F \u0646\u0627\u0634\u0646\u0627\u0633 \u062F\u0631 ${issue2.origin}`;
      case "invalid_union":
        return `\u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631`;
      case "invalid_element":
        return `\u0645\u0642\u062F\u0627\u0631 \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u062F\u0631 ${issue2.origin}`;
      default:
        return `\u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631`;
    }
  };
};
function fa_default() {
  return {
    localeError: error12()
  };
}

// ../../node_modules/zod/v4/locales/fi.js
var error13 = () => {
  const Sizable = {
    string: { unit: "merkki\xE4", subject: "merkkijonon" },
    file: { unit: "tavua", subject: "tiedoston" },
    array: { unit: "alkiota", subject: "listan" },
    set: { unit: "alkiota", subject: "joukon" },
    number: { unit: "", subject: "luvun" },
    bigint: { unit: "", subject: "suuren kokonaisluvun" },
    int: { unit: "", subject: "kokonaisluvun" },
    date: { unit: "", subject: "p\xE4iv\xE4m\xE4\xE4r\xE4n" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "s\xE4\xE4nn\xF6llinen lauseke",
    email: "s\xE4hk\xF6postiosoite",
    url: "URL-osoite",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO-aikaleima",
    date: "ISO-p\xE4iv\xE4m\xE4\xE4r\xE4",
    time: "ISO-aika",
    duration: "ISO-kesto",
    ipv4: "IPv4-osoite",
    ipv6: "IPv6-osoite",
    cidrv4: "IPv4-alue",
    cidrv6: "IPv6-alue",
    base64: "base64-koodattu merkkijono",
    base64url: "base64url-koodattu merkkijono",
    json_string: "JSON-merkkijono",
    e164: "E.164-luku",
    jwt: "JWT",
    template_literal: "templaattimerkkijono"
  };
  const TypeDictionary = {
    nan: "NaN"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        if (/^[A-Z]/.test(issue2.expected)) {
          return `Virheellinen tyyppi: odotettiin instanceof ${issue2.expected}, oli ${received}`;
        }
        return `Virheellinen tyyppi: odotettiin ${expected}, oli ${received}`;
      }
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Virheellinen sy\xF6te: t\xE4ytyy olla ${stringifyPrimitive(issue2.values[0])}`;
        return `Virheellinen valinta: t\xE4ytyy olla yksi seuraavista: ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `Liian suuri: ${sizing.subject} t\xE4ytyy olla ${adj}${issue2.maximum.toString()} ${sizing.unit}`.trim();
        }
        return `Liian suuri: arvon t\xE4ytyy olla ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `Liian pieni: ${sizing.subject} t\xE4ytyy olla ${adj}${issue2.minimum.toString()} ${sizing.unit}`.trim();
        }
        return `Liian pieni: arvon t\xE4ytyy olla ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `Virheellinen sy\xF6te: t\xE4ytyy alkaa "${_issue.prefix}"`;
        if (_issue.format === "ends_with")
          return `Virheellinen sy\xF6te: t\xE4ytyy loppua "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `Virheellinen sy\xF6te: t\xE4ytyy sis\xE4lt\xE4\xE4 "${_issue.includes}"`;
        if (_issue.format === "regex") {
          return `Virheellinen sy\xF6te: t\xE4ytyy vastata s\xE4\xE4nn\xF6llist\xE4 lauseketta ${_issue.pattern}`;
        }
        return `Virheellinen ${FormatDictionary[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `Virheellinen luku: t\xE4ytyy olla luvun ${issue2.divisor} monikerta`;
      case "unrecognized_keys":
        return `${issue2.keys.length > 1 ? "Tuntemattomat avaimet" : "Tuntematon avain"}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return "Virheellinen avain tietueessa";
      case "invalid_union":
        return "Virheellinen unioni";
      case "invalid_element":
        return "Virheellinen arvo joukossa";
      default:
        return `Virheellinen sy\xF6te`;
    }
  };
};
function fi_default() {
  return {
    localeError: error13()
  };
}

// ../../node_modules/zod/v4/locales/fr.js
var error14 = () => {
  const Sizable = {
    string: { unit: "caract\xE8res", verb: "avoir" },
    file: { unit: "octets", verb: "avoir" },
    array: { unit: "\xE9l\xE9ments", verb: "avoir" },
    set: { unit: "\xE9l\xE9ments", verb: "avoir" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "entr\xE9e",
    email: "adresse e-mail",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "date et heure ISO",
    date: "date ISO",
    time: "heure ISO",
    duration: "dur\xE9e ISO",
    ipv4: "adresse IPv4",
    ipv6: "adresse IPv6",
    cidrv4: "plage IPv4",
    cidrv6: "plage IPv6",
    base64: "cha\xEEne encod\xE9e en base64",
    base64url: "cha\xEEne encod\xE9e en base64url",
    json_string: "cha\xEEne JSON",
    e164: "num\xE9ro E.164",
    jwt: "JWT",
    template_literal: "entr\xE9e"
  };
  const TypeDictionary = {
    nan: "NaN",
    number: "nombre",
    array: "tableau"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        if (/^[A-Z]/.test(issue2.expected)) {
          return `Entr\xE9e invalide : instanceof ${issue2.expected} attendu, ${received} re\xE7u`;
        }
        return `Entr\xE9e invalide : ${expected} attendu, ${received} re\xE7u`;
      }
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Entr\xE9e invalide : ${stringifyPrimitive(issue2.values[0])} attendu`;
        return `Option invalide : une valeur parmi ${joinValues(issue2.values, "|")} attendue`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `Trop grand : ${issue2.origin ?? "valeur"} doit ${sizing.verb} ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "\xE9l\xE9ment(s)"}`;
        return `Trop grand : ${issue2.origin ?? "valeur"} doit \xEAtre ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `Trop petit : ${issue2.origin} doit ${sizing.verb} ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `Trop petit : ${issue2.origin} doit \xEAtre ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `Cha\xEEne invalide : doit commencer par "${_issue.prefix}"`;
        if (_issue.format === "ends_with")
          return `Cha\xEEne invalide : doit se terminer par "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `Cha\xEEne invalide : doit inclure "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `Cha\xEEne invalide : doit correspondre au mod\xE8le ${_issue.pattern}`;
        return `${FormatDictionary[_issue.format] ?? issue2.format} invalide`;
      }
      case "not_multiple_of":
        return `Nombre invalide : doit \xEAtre un multiple de ${issue2.divisor}`;
      case "unrecognized_keys":
        return `Cl\xE9${issue2.keys.length > 1 ? "s" : ""} non reconnue${issue2.keys.length > 1 ? "s" : ""} : ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `Cl\xE9 invalide dans ${issue2.origin}`;
      case "invalid_union":
        return "Entr\xE9e invalide";
      case "invalid_element":
        return `Valeur invalide dans ${issue2.origin}`;
      default:
        return `Entr\xE9e invalide`;
    }
  };
};
function fr_default() {
  return {
    localeError: error14()
  };
}

// ../../node_modules/zod/v4/locales/fr-CA.js
var error15 = () => {
  const Sizable = {
    string: { unit: "caract\xE8res", verb: "avoir" },
    file: { unit: "octets", verb: "avoir" },
    array: { unit: "\xE9l\xE9ments", verb: "avoir" },
    set: { unit: "\xE9l\xE9ments", verb: "avoir" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "entr\xE9e",
    email: "adresse courriel",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "date-heure ISO",
    date: "date ISO",
    time: "heure ISO",
    duration: "dur\xE9e ISO",
    ipv4: "adresse IPv4",
    ipv6: "adresse IPv6",
    cidrv4: "plage IPv4",
    cidrv6: "plage IPv6",
    base64: "cha\xEEne encod\xE9e en base64",
    base64url: "cha\xEEne encod\xE9e en base64url",
    json_string: "cha\xEEne JSON",
    e164: "num\xE9ro E.164",
    jwt: "JWT",
    template_literal: "entr\xE9e"
  };
  const TypeDictionary = {
    nan: "NaN"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        if (/^[A-Z]/.test(issue2.expected)) {
          return `Entr\xE9e invalide : attendu instanceof ${issue2.expected}, re\xE7u ${received}`;
        }
        return `Entr\xE9e invalide : attendu ${expected}, re\xE7u ${received}`;
      }
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Entr\xE9e invalide : attendu ${stringifyPrimitive(issue2.values[0])}`;
        return `Option invalide : attendu l'une des valeurs suivantes ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "\u2264" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `Trop grand : attendu que ${issue2.origin ?? "la valeur"} ait ${adj}${issue2.maximum.toString()} ${sizing.unit}`;
        return `Trop grand : attendu que ${issue2.origin ?? "la valeur"} soit ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? "\u2265" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `Trop petit : attendu que ${issue2.origin} ait ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `Trop petit : attendu que ${issue2.origin} soit ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with") {
          return `Cha\xEEne invalide : doit commencer par "${_issue.prefix}"`;
        }
        if (_issue.format === "ends_with")
          return `Cha\xEEne invalide : doit se terminer par "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `Cha\xEEne invalide : doit inclure "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `Cha\xEEne invalide : doit correspondre au motif ${_issue.pattern}`;
        return `${FormatDictionary[_issue.format] ?? issue2.format} invalide`;
      }
      case "not_multiple_of":
        return `Nombre invalide : doit \xEAtre un multiple de ${issue2.divisor}`;
      case "unrecognized_keys":
        return `Cl\xE9${issue2.keys.length > 1 ? "s" : ""} non reconnue${issue2.keys.length > 1 ? "s" : ""} : ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `Cl\xE9 invalide dans ${issue2.origin}`;
      case "invalid_union":
        return "Entr\xE9e invalide";
      case "invalid_element":
        return `Valeur invalide dans ${issue2.origin}`;
      default:
        return `Entr\xE9e invalide`;
    }
  };
};
function fr_CA_default() {
  return {
    localeError: error15()
  };
}

// ../../node_modules/zod/v4/locales/he.js
var error16 = () => {
  const TypeNames = {
    string: { label: "\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA", gender: "f" },
    number: { label: "\u05DE\u05E1\u05E4\u05E8", gender: "m" },
    boolean: { label: "\u05E2\u05E8\u05DA \u05D1\u05D5\u05DC\u05D9\u05D0\u05E0\u05D9", gender: "m" },
    bigint: { label: "BigInt", gender: "m" },
    date: { label: "\u05EA\u05D0\u05E8\u05D9\u05DA", gender: "m" },
    array: { label: "\u05DE\u05E2\u05E8\u05DA", gender: "m" },
    object: { label: "\u05D0\u05D5\u05D1\u05D9\u05D9\u05E7\u05D8", gender: "m" },
    null: { label: "\u05E2\u05E8\u05DA \u05E8\u05D9\u05E7 (null)", gender: "m" },
    undefined: { label: "\u05E2\u05E8\u05DA \u05DC\u05D0 \u05DE\u05D5\u05D2\u05D3\u05E8 (undefined)", gender: "m" },
    symbol: { label: "\u05E1\u05D9\u05DE\u05D1\u05D5\u05DC (Symbol)", gender: "m" },
    function: { label: "\u05E4\u05D5\u05E0\u05E7\u05E6\u05D9\u05D4", gender: "f" },
    map: { label: "\u05DE\u05E4\u05D4 (Map)", gender: "f" },
    set: { label: "\u05E7\u05D1\u05D5\u05E6\u05D4 (Set)", gender: "f" },
    file: { label: "\u05E7\u05D5\u05D1\u05E5", gender: "m" },
    promise: { label: "Promise", gender: "m" },
    NaN: { label: "NaN", gender: "m" },
    unknown: { label: "\u05E2\u05E8\u05DA \u05DC\u05D0 \u05D9\u05D3\u05D5\u05E2", gender: "m" },
    value: { label: "\u05E2\u05E8\u05DA", gender: "m" }
  };
  const Sizable = {
    string: { unit: "\u05EA\u05D5\u05D5\u05D9\u05DD", shortLabel: "\u05E7\u05E6\u05E8", longLabel: "\u05D0\u05E8\u05D5\u05DA" },
    file: { unit: "\u05D1\u05D9\u05D9\u05D8\u05D9\u05DD", shortLabel: "\u05E7\u05D8\u05DF", longLabel: "\u05D2\u05D3\u05D5\u05DC" },
    array: { unit: "\u05E4\u05E8\u05D9\u05D8\u05D9\u05DD", shortLabel: "\u05E7\u05D8\u05DF", longLabel: "\u05D2\u05D3\u05D5\u05DC" },
    set: { unit: "\u05E4\u05E8\u05D9\u05D8\u05D9\u05DD", shortLabel: "\u05E7\u05D8\u05DF", longLabel: "\u05D2\u05D3\u05D5\u05DC" },
    number: { unit: "", shortLabel: "\u05E7\u05D8\u05DF", longLabel: "\u05D2\u05D3\u05D5\u05DC" }
    // no unit
  };
  const typeEntry = (t) => t ? TypeNames[t] : void 0;
  const typeLabel = (t) => {
    const e = typeEntry(t);
    if (e)
      return e.label;
    return t ?? TypeNames.unknown.label;
  };
  const withDefinite = (t) => `\u05D4${typeLabel(t)}`;
  const verbFor = (t) => {
    const e = typeEntry(t);
    const gender = e?.gender ?? "m";
    return gender === "f" ? "\u05E6\u05E8\u05D9\u05DB\u05D4 \u05DC\u05D4\u05D9\u05D5\u05EA" : "\u05E6\u05E8\u05D9\u05DA \u05DC\u05D4\u05D9\u05D5\u05EA";
  };
  const getSizing = (origin) => {
    if (!origin)
      return null;
    return Sizable[origin] ?? null;
  };
  const FormatDictionary = {
    regex: { label: "\u05E7\u05DC\u05D8", gender: "m" },
    email: { label: "\u05DB\u05EA\u05D5\u05D1\u05EA \u05D0\u05D9\u05DE\u05D9\u05D9\u05DC", gender: "f" },
    url: { label: "\u05DB\u05EA\u05D5\u05D1\u05EA \u05E8\u05E9\u05EA", gender: "f" },
    emoji: { label: "\u05D0\u05D9\u05DE\u05D5\u05D2'\u05D9", gender: "m" },
    uuid: { label: "UUID", gender: "m" },
    nanoid: { label: "nanoid", gender: "m" },
    guid: { label: "GUID", gender: "m" },
    cuid: { label: "cuid", gender: "m" },
    cuid2: { label: "cuid2", gender: "m" },
    ulid: { label: "ULID", gender: "m" },
    xid: { label: "XID", gender: "m" },
    ksuid: { label: "KSUID", gender: "m" },
    datetime: { label: "\u05EA\u05D0\u05E8\u05D9\u05DA \u05D5\u05D6\u05DE\u05DF ISO", gender: "m" },
    date: { label: "\u05EA\u05D0\u05E8\u05D9\u05DA ISO", gender: "m" },
    time: { label: "\u05D6\u05DE\u05DF ISO", gender: "m" },
    duration: { label: "\u05DE\u05E9\u05DA \u05D6\u05DE\u05DF ISO", gender: "m" },
    ipv4: { label: "\u05DB\u05EA\u05D5\u05D1\u05EA IPv4", gender: "f" },
    ipv6: { label: "\u05DB\u05EA\u05D5\u05D1\u05EA IPv6", gender: "f" },
    cidrv4: { label: "\u05D8\u05D5\u05D5\u05D7 IPv4", gender: "m" },
    cidrv6: { label: "\u05D8\u05D5\u05D5\u05D7 IPv6", gender: "m" },
    base64: { label: "\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D1\u05D1\u05E1\u05D9\u05E1 64", gender: "f" },
    base64url: { label: "\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D1\u05D1\u05E1\u05D9\u05E1 64 \u05DC\u05DB\u05EA\u05D5\u05D1\u05D5\u05EA \u05E8\u05E9\u05EA", gender: "f" },
    json_string: { label: "\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA JSON", gender: "f" },
    e164: { label: "\u05DE\u05E1\u05E4\u05E8 E.164", gender: "m" },
    jwt: { label: "JWT", gender: "m" },
    ends_with: { label: "\u05E7\u05DC\u05D8", gender: "m" },
    includes: { label: "\u05E7\u05DC\u05D8", gender: "m" },
    lowercase: { label: "\u05E7\u05DC\u05D8", gender: "m" },
    starts_with: { label: "\u05E7\u05DC\u05D8", gender: "m" },
    uppercase: { label: "\u05E7\u05DC\u05D8", gender: "m" }
  };
  const TypeDictionary = {
    nan: "NaN"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expectedKey = issue2.expected;
        const expected = TypeDictionary[expectedKey ?? ""] ?? typeLabel(expectedKey);
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? TypeNames[receivedType]?.label ?? receivedType;
        if (/^[A-Z]/.test(issue2.expected)) {
          return `\u05E7\u05DC\u05D8 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05E6\u05E8\u05D9\u05DA \u05DC\u05D4\u05D9\u05D5\u05EA instanceof ${issue2.expected}, \u05D4\u05EA\u05E7\u05D1\u05DC ${received}`;
        }
        return `\u05E7\u05DC\u05D8 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05E6\u05E8\u05D9\u05DA \u05DC\u05D4\u05D9\u05D5\u05EA ${expected}, \u05D4\u05EA\u05E7\u05D1\u05DC ${received}`;
      }
      case "invalid_value": {
        if (issue2.values.length === 1) {
          return `\u05E2\u05E8\u05DA \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05D4\u05E2\u05E8\u05DA \u05D7\u05D9\u05D9\u05D1 \u05DC\u05D4\u05D9\u05D5\u05EA ${stringifyPrimitive(issue2.values[0])}`;
        }
        const stringified = issue2.values.map((v) => stringifyPrimitive(v));
        if (issue2.values.length === 2) {
          return `\u05E2\u05E8\u05DA \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05D4\u05D0\u05E4\u05E9\u05E8\u05D5\u05D9\u05D5\u05EA \u05D4\u05DE\u05EA\u05D0\u05D9\u05DE\u05D5\u05EA \u05D4\u05DF ${stringified[0]} \u05D0\u05D5 ${stringified[1]}`;
        }
        const lastValue = stringified[stringified.length - 1];
        const restValues = stringified.slice(0, -1).join(", ");
        return `\u05E2\u05E8\u05DA \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05D4\u05D0\u05E4\u05E9\u05E8\u05D5\u05D9\u05D5\u05EA \u05D4\u05DE\u05EA\u05D0\u05D9\u05DE\u05D5\u05EA \u05D4\u05DF ${restValues} \u05D0\u05D5 ${lastValue}`;
      }
      case "too_big": {
        const sizing = getSizing(issue2.origin);
        const subject = withDefinite(issue2.origin ?? "value");
        if (issue2.origin === "string") {
          return `${sizing?.longLabel ?? "\u05D0\u05E8\u05D5\u05DA"} \u05DE\u05D3\u05D9: ${subject} \u05E6\u05E8\u05D9\u05DB\u05D4 \u05DC\u05D4\u05DB\u05D9\u05DC ${issue2.maximum.toString()} ${sizing?.unit ?? ""} ${issue2.inclusive ? "\u05D0\u05D5 \u05E4\u05D7\u05D5\u05EA" : "\u05DC\u05DB\u05DC \u05D4\u05D9\u05D5\u05EA\u05E8"}`.trim();
        }
        if (issue2.origin === "number") {
          const comparison = issue2.inclusive ? `\u05E7\u05D8\u05DF \u05D0\u05D5 \u05E9\u05D5\u05D5\u05D4 \u05DC-${issue2.maximum}` : `\u05E7\u05D8\u05DF \u05DE-${issue2.maximum}`;
          return `\u05D2\u05D3\u05D5\u05DC \u05DE\u05D3\u05D9: ${subject} \u05E6\u05E8\u05D9\u05DA \u05DC\u05D4\u05D9\u05D5\u05EA ${comparison}`;
        }
        if (issue2.origin === "array" || issue2.origin === "set") {
          const verb = issue2.origin === "set" ? "\u05E6\u05E8\u05D9\u05DB\u05D4" : "\u05E6\u05E8\u05D9\u05DA";
          const comparison = issue2.inclusive ? `${issue2.maximum} ${sizing?.unit ?? ""} \u05D0\u05D5 \u05E4\u05D7\u05D5\u05EA` : `\u05E4\u05D7\u05D5\u05EA \u05DE-${issue2.maximum} ${sizing?.unit ?? ""}`;
          return `\u05D2\u05D3\u05D5\u05DC \u05DE\u05D3\u05D9: ${subject} ${verb} \u05DC\u05D4\u05DB\u05D9\u05DC ${comparison}`.trim();
        }
        const adj = issue2.inclusive ? "<=" : "<";
        const be = verbFor(issue2.origin ?? "value");
        if (sizing?.unit) {
          return `${sizing.longLabel} \u05DE\u05D3\u05D9: ${subject} ${be} ${adj}${issue2.maximum.toString()} ${sizing.unit}`;
        }
        return `${sizing?.longLabel ?? "\u05D2\u05D3\u05D5\u05DC"} \u05DE\u05D3\u05D9: ${subject} ${be} ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const sizing = getSizing(issue2.origin);
        const subject = withDefinite(issue2.origin ?? "value");
        if (issue2.origin === "string") {
          return `${sizing?.shortLabel ?? "\u05E7\u05E6\u05E8"} \u05DE\u05D3\u05D9: ${subject} \u05E6\u05E8\u05D9\u05DB\u05D4 \u05DC\u05D4\u05DB\u05D9\u05DC ${issue2.minimum.toString()} ${sizing?.unit ?? ""} ${issue2.inclusive ? "\u05D0\u05D5 \u05D9\u05D5\u05EA\u05E8" : "\u05DC\u05E4\u05D7\u05D5\u05EA"}`.trim();
        }
        if (issue2.origin === "number") {
          const comparison = issue2.inclusive ? `\u05D2\u05D3\u05D5\u05DC \u05D0\u05D5 \u05E9\u05D5\u05D5\u05D4 \u05DC-${issue2.minimum}` : `\u05D2\u05D3\u05D5\u05DC \u05DE-${issue2.minimum}`;
          return `\u05E7\u05D8\u05DF \u05DE\u05D3\u05D9: ${subject} \u05E6\u05E8\u05D9\u05DA \u05DC\u05D4\u05D9\u05D5\u05EA ${comparison}`;
        }
        if (issue2.origin === "array" || issue2.origin === "set") {
          const verb = issue2.origin === "set" ? "\u05E6\u05E8\u05D9\u05DB\u05D4" : "\u05E6\u05E8\u05D9\u05DA";
          if (issue2.minimum === 1 && issue2.inclusive) {
            const singularPhrase = issue2.origin === "set" ? "\u05DC\u05E4\u05D7\u05D5\u05EA \u05E4\u05E8\u05D9\u05D8 \u05D0\u05D7\u05D3" : "\u05DC\u05E4\u05D7\u05D5\u05EA \u05E4\u05E8\u05D9\u05D8 \u05D0\u05D7\u05D3";
            return `\u05E7\u05D8\u05DF \u05DE\u05D3\u05D9: ${subject} ${verb} \u05DC\u05D4\u05DB\u05D9\u05DC ${singularPhrase}`;
          }
          const comparison = issue2.inclusive ? `${issue2.minimum} ${sizing?.unit ?? ""} \u05D0\u05D5 \u05D9\u05D5\u05EA\u05E8` : `\u05D9\u05D5\u05EA\u05E8 \u05DE-${issue2.minimum} ${sizing?.unit ?? ""}`;
          return `\u05E7\u05D8\u05DF \u05DE\u05D3\u05D9: ${subject} ${verb} \u05DC\u05D4\u05DB\u05D9\u05DC ${comparison}`.trim();
        }
        const adj = issue2.inclusive ? ">=" : ">";
        const be = verbFor(issue2.origin ?? "value");
        if (sizing?.unit) {
          return `${sizing.shortLabel} \u05DE\u05D3\u05D9: ${subject} ${be} ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `${sizing?.shortLabel ?? "\u05E7\u05D8\u05DF"} \u05DE\u05D3\u05D9: ${subject} ${be} ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `\u05D4\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D7\u05D9\u05D9\u05D1\u05EA \u05DC\u05D4\u05EA\u05D7\u05D9\u05DC \u05D1 "${_issue.prefix}"`;
        if (_issue.format === "ends_with")
          return `\u05D4\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D7\u05D9\u05D9\u05D1\u05EA \u05DC\u05D4\u05E1\u05EA\u05D9\u05D9\u05DD \u05D1 "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `\u05D4\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D7\u05D9\u05D9\u05D1\u05EA \u05DC\u05DB\u05DC\u05D5\u05DC "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `\u05D4\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D7\u05D9\u05D9\u05D1\u05EA \u05DC\u05D4\u05EA\u05D0\u05D9\u05DD \u05DC\u05EA\u05D1\u05E0\u05D9\u05EA ${_issue.pattern}`;
        const nounEntry = FormatDictionary[_issue.format];
        const noun = nounEntry?.label ?? _issue.format;
        const gender = nounEntry?.gender ?? "m";
        const adjective = gender === "f" ? "\u05EA\u05E7\u05D9\u05E0\u05D4" : "\u05EA\u05E7\u05D9\u05DF";
        return `${noun} \u05DC\u05D0 ${adjective}`;
      }
      case "not_multiple_of":
        return `\u05DE\u05E1\u05E4\u05E8 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05D7\u05D9\u05D9\u05D1 \u05DC\u05D4\u05D9\u05D5\u05EA \u05DE\u05DB\u05E4\u05DC\u05D4 \u05E9\u05DC ${issue2.divisor}`;
      case "unrecognized_keys":
        return `\u05DE\u05E4\u05EA\u05D7${issue2.keys.length > 1 ? "\u05D5\u05EA" : ""} \u05DC\u05D0 \u05DE\u05D6\u05D5\u05D4${issue2.keys.length > 1 ? "\u05D9\u05DD" : "\u05D4"}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key": {
        return `\u05E9\u05D3\u05D4 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF \u05D1\u05D0\u05D5\u05D1\u05D9\u05D9\u05E7\u05D8`;
      }
      case "invalid_union":
        return "\u05E7\u05DC\u05D8 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF";
      case "invalid_element": {
        const place = withDefinite(issue2.origin ?? "array");
        return `\u05E2\u05E8\u05DA \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF \u05D1${place}`;
      }
      default:
        return `\u05E7\u05DC\u05D8 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF`;
    }
  };
};
function he_default() {
  return {
    localeError: error16()
  };
}

// ../../node_modules/zod/v4/locales/hu.js
var error17 = () => {
  const Sizable = {
    string: { unit: "karakter", verb: "legyen" },
    file: { unit: "byte", verb: "legyen" },
    array: { unit: "elem", verb: "legyen" },
    set: { unit: "elem", verb: "legyen" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "bemenet",
    email: "email c\xEDm",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO id\u0151b\xE9lyeg",
    date: "ISO d\xE1tum",
    time: "ISO id\u0151",
    duration: "ISO id\u0151intervallum",
    ipv4: "IPv4 c\xEDm",
    ipv6: "IPv6 c\xEDm",
    cidrv4: "IPv4 tartom\xE1ny",
    cidrv6: "IPv6 tartom\xE1ny",
    base64: "base64-k\xF3dolt string",
    base64url: "base64url-k\xF3dolt string",
    json_string: "JSON string",
    e164: "E.164 sz\xE1m",
    jwt: "JWT",
    template_literal: "bemenet"
  };
  const TypeDictionary = {
    nan: "NaN",
    number: "sz\xE1m",
    array: "t\xF6mb"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        if (/^[A-Z]/.test(issue2.expected)) {
          return `\xC9rv\xE9nytelen bemenet: a v\xE1rt \xE9rt\xE9k instanceof ${issue2.expected}, a kapott \xE9rt\xE9k ${received}`;
        }
        return `\xC9rv\xE9nytelen bemenet: a v\xE1rt \xE9rt\xE9k ${expected}, a kapott \xE9rt\xE9k ${received}`;
      }
      case "invalid_value":
        if (issue2.values.length === 1)
          return `\xC9rv\xE9nytelen bemenet: a v\xE1rt \xE9rt\xE9k ${stringifyPrimitive(issue2.values[0])}`;
        return `\xC9rv\xE9nytelen opci\xF3: valamelyik \xE9rt\xE9k v\xE1rt ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `T\xFAl nagy: ${issue2.origin ?? "\xE9rt\xE9k"} m\xE9rete t\xFAl nagy ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elem"}`;
        return `T\xFAl nagy: a bemeneti \xE9rt\xE9k ${issue2.origin ?? "\xE9rt\xE9k"} t\xFAl nagy: ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `T\xFAl kicsi: a bemeneti \xE9rt\xE9k ${issue2.origin} m\xE9rete t\xFAl kicsi ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `T\xFAl kicsi: a bemeneti \xE9rt\xE9k ${issue2.origin} t\xFAl kicsi ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `\xC9rv\xE9nytelen string: "${_issue.prefix}" \xE9rt\xE9kkel kell kezd\u0151dnie`;
        if (_issue.format === "ends_with")
          return `\xC9rv\xE9nytelen string: "${_issue.suffix}" \xE9rt\xE9kkel kell v\xE9gz\u0151dnie`;
        if (_issue.format === "includes")
          return `\xC9rv\xE9nytelen string: "${_issue.includes}" \xE9rt\xE9ket kell tartalmaznia`;
        if (_issue.format === "regex")
          return `\xC9rv\xE9nytelen string: ${_issue.pattern} mint\xE1nak kell megfelelnie`;
        return `\xC9rv\xE9nytelen ${FormatDictionary[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `\xC9rv\xE9nytelen sz\xE1m: ${issue2.divisor} t\xF6bbsz\xF6r\xF6s\xE9nek kell lennie`;
      case "unrecognized_keys":
        return `Ismeretlen kulcs${issue2.keys.length > 1 ? "s" : ""}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `\xC9rv\xE9nytelen kulcs ${issue2.origin}`;
      case "invalid_union":
        return "\xC9rv\xE9nytelen bemenet";
      case "invalid_element":
        return `\xC9rv\xE9nytelen \xE9rt\xE9k: ${issue2.origin}`;
      default:
        return `\xC9rv\xE9nytelen bemenet`;
    }
  };
};
function hu_default() {
  return {
    localeError: error17()
  };
}

// ../../node_modules/zod/v4/locales/hy.js
function getArmenianPlural(count, one, many) {
  return Math.abs(count) === 1 ? one : many;
}
function withDefiniteArticle(word) {
  if (!word)
    return "";
  const vowels = ["\u0561", "\u0565", "\u0568", "\u056B", "\u0578", "\u0578\u0582", "\u0585"];
  const lastChar = word[word.length - 1];
  return word + (vowels.includes(lastChar) ? "\u0576" : "\u0568");
}
var error18 = () => {
  const Sizable = {
    string: {
      unit: {
        one: "\u0576\u0577\u0561\u0576",
        many: "\u0576\u0577\u0561\u0576\u0576\u0565\u0580"
      },
      verb: "\u0578\u0582\u0576\u0565\u0576\u0561\u056C"
    },
    file: {
      unit: {
        one: "\u0562\u0561\u0575\u0569",
        many: "\u0562\u0561\u0575\u0569\u0565\u0580"
      },
      verb: "\u0578\u0582\u0576\u0565\u0576\u0561\u056C"
    },
    array: {
      unit: {
        one: "\u057F\u0561\u0580\u0580",
        many: "\u057F\u0561\u0580\u0580\u0565\u0580"
      },
      verb: "\u0578\u0582\u0576\u0565\u0576\u0561\u056C"
    },
    set: {
      unit: {
        one: "\u057F\u0561\u0580\u0580",
        many: "\u057F\u0561\u0580\u0580\u0565\u0580"
      },
      verb: "\u0578\u0582\u0576\u0565\u0576\u0561\u056C"
    }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "\u0574\u0578\u0582\u057F\u0584",
    email: "\u0567\u056C. \u0570\u0561\u057D\u0581\u0565",
    url: "URL",
    emoji: "\u0567\u0574\u0578\u057B\u056B",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO \u0561\u0574\u057D\u0561\u0569\u056B\u057E \u0587 \u056A\u0561\u0574",
    date: "ISO \u0561\u0574\u057D\u0561\u0569\u056B\u057E",
    time: "ISO \u056A\u0561\u0574",
    duration: "ISO \u057F\u0587\u0578\u0572\u0578\u0582\u0569\u0575\u0578\u0582\u0576",
    ipv4: "IPv4 \u0570\u0561\u057D\u0581\u0565",
    ipv6: "IPv6 \u0570\u0561\u057D\u0581\u0565",
    cidrv4: "IPv4 \u0574\u056B\u057B\u0561\u056F\u0561\u0575\u0584",
    cidrv6: "IPv6 \u0574\u056B\u057B\u0561\u056F\u0561\u0575\u0584",
    base64: "base64 \u0571\u0587\u0561\u0579\u0561\u0583\u0578\u057E \u057F\u0578\u0572",
    base64url: "base64url \u0571\u0587\u0561\u0579\u0561\u0583\u0578\u057E \u057F\u0578\u0572",
    json_string: "JSON \u057F\u0578\u0572",
    e164: "E.164 \u0570\u0561\u0574\u0561\u0580",
    jwt: "JWT",
    template_literal: "\u0574\u0578\u0582\u057F\u0584"
  };
  const TypeDictionary = {
    nan: "NaN",
    number: "\u0569\u056B\u057E",
    array: "\u0566\u0561\u0576\u0563\u057E\u0561\u056E"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        if (/^[A-Z]/.test(issue2.expected)) {
          return `\u054D\u056D\u0561\u056C \u0574\u0578\u0582\u057F\u0584\u0561\u0563\u0580\u0578\u0582\u0574\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567\u0580 instanceof ${issue2.expected}, \u057D\u057F\u0561\u0581\u057E\u0565\u056C \u0567 ${received}`;
        }
        return `\u054D\u056D\u0561\u056C \u0574\u0578\u0582\u057F\u0584\u0561\u0563\u0580\u0578\u0582\u0574\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567\u0580 ${expected}, \u057D\u057F\u0561\u0581\u057E\u0565\u056C \u0567 ${received}`;
      }
      case "invalid_value":
        if (issue2.values.length === 1)
          return `\u054D\u056D\u0561\u056C \u0574\u0578\u0582\u057F\u0584\u0561\u0563\u0580\u0578\u0582\u0574\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567\u0580 ${stringifyPrimitive(issue2.values[1])}`;
        return `\u054D\u056D\u0561\u056C \u057F\u0561\u0580\u0562\u0565\u0580\u0561\u056F\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567\u0580 \u0570\u0565\u057F\u0587\u0575\u0561\u056C\u0576\u0565\u0580\u056B\u0581 \u0574\u0565\u056F\u0568\u055D ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          const maxValue = Number(issue2.maximum);
          const unit = getArmenianPlural(maxValue, sizing.unit.one, sizing.unit.many);
          return `\u0549\u0561\u0583\u0561\u0566\u0561\u0576\u0581 \u0574\u0565\u056E \u0561\u0580\u056A\u0565\u0584\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567, \u0578\u0580 ${withDefiniteArticle(issue2.origin ?? "\u0561\u0580\u056A\u0565\u0584")} \u056F\u0578\u0582\u0576\u0565\u0576\u0561 ${adj}${issue2.maximum.toString()} ${unit}`;
        }
        return `\u0549\u0561\u0583\u0561\u0566\u0561\u0576\u0581 \u0574\u0565\u056E \u0561\u0580\u056A\u0565\u0584\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567, \u0578\u0580 ${withDefiniteArticle(issue2.origin ?? "\u0561\u0580\u056A\u0565\u0584")} \u056C\u056B\u0576\u056B ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          const minValue = Number(issue2.minimum);
          const unit = getArmenianPlural(minValue, sizing.unit.one, sizing.unit.many);
          return `\u0549\u0561\u0583\u0561\u0566\u0561\u0576\u0581 \u0583\u0578\u0584\u0580 \u0561\u0580\u056A\u0565\u0584\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567, \u0578\u0580 ${withDefiniteArticle(issue2.origin)} \u056F\u0578\u0582\u0576\u0565\u0576\u0561 ${adj}${issue2.minimum.toString()} ${unit}`;
        }
        return `\u0549\u0561\u0583\u0561\u0566\u0561\u0576\u0581 \u0583\u0578\u0584\u0580 \u0561\u0580\u056A\u0565\u0584\u2024 \u057D\u057A\u0561\u057D\u057E\u0578\u0582\u0574 \u0567, \u0578\u0580 ${withDefiniteArticle(issue2.origin)} \u056C\u056B\u0576\u056B ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `\u054D\u056D\u0561\u056C \u057F\u0578\u0572\u2024 \u057A\u0565\u057F\u0584 \u0567 \u057D\u056F\u057D\u057E\u056B "${_issue.prefix}"-\u0578\u057E`;
        if (_issue.format === "ends_with")
          return `\u054D\u056D\u0561\u056C \u057F\u0578\u0572\u2024 \u057A\u0565\u057F\u0584 \u0567 \u0561\u057E\u0561\u0580\u057F\u057E\u056B "${_issue.suffix}"-\u0578\u057E`;
        if (_issue.format === "includes")
          return `\u054D\u056D\u0561\u056C \u057F\u0578\u0572\u2024 \u057A\u0565\u057F\u0584 \u0567 \u057A\u0561\u0580\u0578\u0582\u0576\u0561\u056F\u056B "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `\u054D\u056D\u0561\u056C \u057F\u0578\u0572\u2024 \u057A\u0565\u057F\u0584 \u0567 \u0570\u0561\u0574\u0561\u057A\u0561\u057F\u0561\u057D\u056D\u0561\u0576\u056B ${_issue.pattern} \u0571\u0587\u0561\u0579\u0561\u0583\u056B\u0576`;
        return `\u054D\u056D\u0561\u056C ${FormatDictionary[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `\u054D\u056D\u0561\u056C \u0569\u056B\u057E\u2024 \u057A\u0565\u057F\u0584 \u0567 \u0562\u0561\u0566\u0574\u0561\u057A\u0561\u057F\u056B\u056F \u056C\u056B\u0576\u056B ${issue2.divisor}-\u056B`;
      case "unrecognized_keys":
        return `\u0549\u0573\u0561\u0576\u0561\u0579\u057E\u0561\u056E \u0562\u0561\u0576\u0561\u056C\u056B${issue2.keys.length > 1 ? "\u0576\u0565\u0580" : ""}. ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `\u054D\u056D\u0561\u056C \u0562\u0561\u0576\u0561\u056C\u056B ${withDefiniteArticle(issue2.origin)}-\u0578\u0582\u0574`;
      case "invalid_union":
        return "\u054D\u056D\u0561\u056C \u0574\u0578\u0582\u057F\u0584\u0561\u0563\u0580\u0578\u0582\u0574";
      case "invalid_element":
        return `\u054D\u056D\u0561\u056C \u0561\u0580\u056A\u0565\u0584 ${withDefiniteArticle(issue2.origin)}-\u0578\u0582\u0574`;
      default:
        return `\u054D\u056D\u0561\u056C \u0574\u0578\u0582\u057F\u0584\u0561\u0563\u0580\u0578\u0582\u0574`;
    }
  };
};
function hy_default() {
  return {
    localeError: error18()
  };
}

// ../../node_modules/zod/v4/locales/id.js
var error19 = () => {
  const Sizable = {
    string: { unit: "karakter", verb: "memiliki" },
    file: { unit: "byte", verb: "memiliki" },
    array: { unit: "item", verb: "memiliki" },
    set: { unit: "item", verb: "memiliki" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "input",
    email: "alamat email",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "tanggal dan waktu format ISO",
    date: "tanggal format ISO",
    time: "jam format ISO",
    duration: "durasi format ISO",
    ipv4: "alamat IPv4",
    ipv6: "alamat IPv6",
    cidrv4: "rentang alamat IPv4",
    cidrv6: "rentang alamat IPv6",
    base64: "string dengan enkode base64",
    base64url: "string dengan enkode base64url",
    json_string: "string JSON",
    e164: "angka E.164",
    jwt: "JWT",
    template_literal: "input"
  };
  const TypeDictionary = {
    nan: "NaN"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        if (/^[A-Z]/.test(issue2.expected)) {
          return `Input tidak valid: diharapkan instanceof ${issue2.expected}, diterima ${received}`;
        }
        return `Input tidak valid: diharapkan ${expected}, diterima ${received}`;
      }
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Input tidak valid: diharapkan ${stringifyPrimitive(issue2.values[0])}`;
        return `Pilihan tidak valid: diharapkan salah satu dari ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `Terlalu besar: diharapkan ${issue2.origin ?? "value"} memiliki ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elemen"}`;
        return `Terlalu besar: diharapkan ${issue2.origin ?? "value"} menjadi ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `Terlalu kecil: diharapkan ${issue2.origin} memiliki ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `Terlalu kecil: diharapkan ${issue2.origin} menjadi ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `String tidak valid: harus dimulai dengan "${_issue.prefix}"`;
        if (_issue.format === "ends_with")
          return `String tidak valid: harus berakhir dengan "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `String tidak valid: harus menyertakan "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `String tidak valid: harus sesuai pola ${_issue.pattern}`;
        return `${FormatDictionary[_issue.format] ?? issue2.format} tidak valid`;
      }
      case "not_multiple_of":
        return `Angka tidak valid: harus kelipatan dari ${issue2.divisor}`;
      case "unrecognized_keys":
        return `Kunci tidak dikenali ${issue2.keys.length > 1 ? "s" : ""}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `Kunci tidak valid di ${issue2.origin}`;
      case "invalid_union":
        return "Input tidak valid";
      case "invalid_element":
        return `Nilai tidak valid di ${issue2.origin}`;
      default:
        return `Input tidak valid`;
    }
  };
};
function id_default() {
  return {
    localeError: error19()
  };
}

// ../../node_modules/zod/v4/locales/is.js
var error20 = () => {
  const Sizable = {
    string: { unit: "stafi", verb: "a\xF0 hafa" },
    file: { unit: "b\xE6ti", verb: "a\xF0 hafa" },
    array: { unit: "hluti", verb: "a\xF0 hafa" },
    set: { unit: "hluti", verb: "a\xF0 hafa" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "gildi",
    email: "netfang",
    url: "vefsl\xF3\xF0",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO dagsetning og t\xEDmi",
    date: "ISO dagsetning",
    time: "ISO t\xEDmi",
    duration: "ISO t\xEDmalengd",
    ipv4: "IPv4 address",
    ipv6: "IPv6 address",
    cidrv4: "IPv4 range",
    cidrv6: "IPv6 range",
    base64: "base64-encoded strengur",
    base64url: "base64url-encoded strengur",
    json_string: "JSON strengur",
    e164: "E.164 t\xF6lugildi",
    jwt: "JWT",
    template_literal: "gildi"
  };
  const TypeDictionary = {
    nan: "NaN",
    number: "n\xFAmer",
    array: "fylki"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        if (/^[A-Z]/.test(issue2.expected)) {
          return `Rangt gildi: \xDE\xFA sl\xF3st inn ${received} \xFEar sem \xE1 a\xF0 vera instanceof ${issue2.expected}`;
        }
        return `Rangt gildi: \xDE\xFA sl\xF3st inn ${received} \xFEar sem \xE1 a\xF0 vera ${expected}`;
      }
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Rangt gildi: gert r\xE1\xF0 fyrir ${stringifyPrimitive(issue2.values[0])}`;
        return `\xD3gilt val: m\xE1 vera eitt af eftirfarandi ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `Of st\xF3rt: gert er r\xE1\xF0 fyrir a\xF0 ${issue2.origin ?? "gildi"} hafi ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "hluti"}`;
        return `Of st\xF3rt: gert er r\xE1\xF0 fyrir a\xF0 ${issue2.origin ?? "gildi"} s\xE9 ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `Of l\xEDti\xF0: gert er r\xE1\xF0 fyrir a\xF0 ${issue2.origin} hafi ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `Of l\xEDti\xF0: gert er r\xE1\xF0 fyrir a\xF0 ${issue2.origin} s\xE9 ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with") {
          return `\xD3gildur strengur: ver\xF0ur a\xF0 byrja \xE1 "${_issue.prefix}"`;
        }
        if (_issue.format === "ends_with")
          return `\xD3gildur strengur: ver\xF0ur a\xF0 enda \xE1 "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `\xD3gildur strengur: ver\xF0ur a\xF0 innihalda "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `\xD3gildur strengur: ver\xF0ur a\xF0 fylgja mynstri ${_issue.pattern}`;
        return `Rangt ${FormatDictionary[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `R\xF6ng tala: ver\xF0ur a\xF0 vera margfeldi af ${issue2.divisor}`;
      case "unrecognized_keys":
        return `\xD3\xFEekkt ${issue2.keys.length > 1 ? "ir lyklar" : "ur lykill"}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `Rangur lykill \xED ${issue2.origin}`;
      case "invalid_union":
        return "Rangt gildi";
      case "invalid_element":
        return `Rangt gildi \xED ${issue2.origin}`;
      default:
        return `Rangt gildi`;
    }
  };
};
function is_default() {
  return {
    localeError: error20()
  };
}

// ../../node_modules/zod/v4/locales/it.js
var error21 = () => {
  const Sizable = {
    string: { unit: "caratteri", verb: "avere" },
    file: { unit: "byte", verb: "avere" },
    array: { unit: "elementi", verb: "avere" },
    set: { unit: "elementi", verb: "avere" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "input",
    email: "indirizzo email",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "data e ora ISO",
    date: "data ISO",
    time: "ora ISO",
    duration: "durata ISO",
    ipv4: "indirizzo IPv4",
    ipv6: "indirizzo IPv6",
    cidrv4: "intervallo IPv4",
    cidrv6: "intervallo IPv6",
    base64: "stringa codificata in base64",
    base64url: "URL codificata in base64",
    json_string: "stringa JSON",
    e164: "numero E.164",
    jwt: "JWT",
    template_literal: "input"
  };
  const TypeDictionary = {
    nan: "NaN",
    number: "numero",
    array: "vettore"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        if (/^[A-Z]/.test(issue2.expected)) {
          return `Input non valido: atteso instanceof ${issue2.expected}, ricevuto ${received}`;
        }
        return `Input non valido: atteso ${expected}, ricevuto ${received}`;
      }
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Input non valido: atteso ${stringifyPrimitive(issue2.values[0])}`;
        return `Opzione non valida: atteso uno tra ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `Troppo grande: ${issue2.origin ?? "valore"} deve avere ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elementi"}`;
        return `Troppo grande: ${issue2.origin ?? "valore"} deve essere ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `Troppo piccolo: ${issue2.origin} deve avere ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `Troppo piccolo: ${issue2.origin} deve essere ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `Stringa non valida: deve iniziare con "${_issue.prefix}"`;
        if (_issue.format === "ends_with")
          return `Stringa non valida: deve terminare con "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `Stringa non valida: deve includere "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `Stringa non valida: deve corrispondere al pattern ${_issue.pattern}`;
        return `Invalid ${FormatDictionary[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `Numero non valido: deve essere un multiplo di ${issue2.divisor}`;
      case "unrecognized_keys":
        return `Chiav${issue2.keys.length > 1 ? "i" : "e"} non riconosciut${issue2.keys.length > 1 ? "e" : "a"}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `Chiave non valida in ${issue2.origin}`;
      case "invalid_union":
        return "Input non valido";
      case "invalid_element":
        return `Valore non valido in ${issue2.origin}`;
      default:
        return `Input non valido`;
    }
  };
};
function it_default() {
  return {
    localeError: error21()
  };
}

// ../../node_modules/zod/v4/locales/ja.js
var error22 = () => {
  const Sizable = {
    string: { unit: "\u6587\u5B57", verb: "\u3067\u3042\u308B" },
    file: { unit: "\u30D0\u30A4\u30C8", verb: "\u3067\u3042\u308B" },
    array: { unit: "\u8981\u7D20", verb: "\u3067\u3042\u308B" },
    set: { unit: "\u8981\u7D20", verb: "\u3067\u3042\u308B" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "\u5165\u529B\u5024",
    email: "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9",
    url: "URL",
    emoji: "\u7D75\u6587\u5B57",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO\u65E5\u6642",
    date: "ISO\u65E5\u4ED8",
    time: "ISO\u6642\u523B",
    duration: "ISO\u671F\u9593",
    ipv4: "IPv4\u30A2\u30C9\u30EC\u30B9",
    ipv6: "IPv6\u30A2\u30C9\u30EC\u30B9",
    cidrv4: "IPv4\u7BC4\u56F2",
    cidrv6: "IPv6\u7BC4\u56F2",
    base64: "base64\u30A8\u30F3\u30B3\u30FC\u30C9\u6587\u5B57\u5217",
    base64url: "base64url\u30A8\u30F3\u30B3\u30FC\u30C9\u6587\u5B57\u5217",
    json_string: "JSON\u6587\u5B57\u5217",
    e164: "E.164\u756A\u53F7",
    jwt: "JWT",
    template_literal: "\u5165\u529B\u5024"
  };
  const TypeDictionary = {
    nan: "NaN",
    number: "\u6570\u5024",
    array: "\u914D\u5217"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        if (/^[A-Z]/.test(issue2.expected)) {
          return `\u7121\u52B9\u306A\u5165\u529B: instanceof ${issue2.expected}\u304C\u671F\u5F85\u3055\u308C\u307E\u3057\u305F\u304C\u3001${received}\u304C\u5165\u529B\u3055\u308C\u307E\u3057\u305F`;
        }
        return `\u7121\u52B9\u306A\u5165\u529B: ${expected}\u304C\u671F\u5F85\u3055\u308C\u307E\u3057\u305F\u304C\u3001${received}\u304C\u5165\u529B\u3055\u308C\u307E\u3057\u305F`;
      }
      case "invalid_value":
        if (issue2.values.length === 1)
          return `\u7121\u52B9\u306A\u5165\u529B: ${stringifyPrimitive(issue2.values[0])}\u304C\u671F\u5F85\u3055\u308C\u307E\u3057\u305F`;
        return `\u7121\u52B9\u306A\u9078\u629E: ${joinValues(issue2.values, "\u3001")}\u306E\u3044\u305A\u308C\u304B\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
      case "too_big": {
        const adj = issue2.inclusive ? "\u4EE5\u4E0B\u3067\u3042\u308B" : "\u3088\u308A\u5C0F\u3055\u3044";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `\u5927\u304D\u3059\u304E\u308B\u5024: ${issue2.origin ?? "\u5024"}\u306F${issue2.maximum.toString()}${sizing.unit ?? "\u8981\u7D20"}${adj}\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
        return `\u5927\u304D\u3059\u304E\u308B\u5024: ${issue2.origin ?? "\u5024"}\u306F${issue2.maximum.toString()}${adj}\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? "\u4EE5\u4E0A\u3067\u3042\u308B" : "\u3088\u308A\u5927\u304D\u3044";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `\u5C0F\u3055\u3059\u304E\u308B\u5024: ${issue2.origin}\u306F${issue2.minimum.toString()}${sizing.unit}${adj}\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
        return `\u5C0F\u3055\u3059\u304E\u308B\u5024: ${issue2.origin}\u306F${issue2.minimum.toString()}${adj}\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `\u7121\u52B9\u306A\u6587\u5B57\u5217: "${_issue.prefix}"\u3067\u59CB\u307E\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
        if (_issue.format === "ends_with")
          return `\u7121\u52B9\u306A\u6587\u5B57\u5217: "${_issue.suffix}"\u3067\u7D42\u308F\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
        if (_issue.format === "includes")
          return `\u7121\u52B9\u306A\u6587\u5B57\u5217: "${_issue.includes}"\u3092\u542B\u3080\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
        if (_issue.format === "regex")
          return `\u7121\u52B9\u306A\u6587\u5B57\u5217: \u30D1\u30BF\u30FC\u30F3${_issue.pattern}\u306B\u4E00\u81F4\u3059\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
        return `\u7121\u52B9\u306A${FormatDictionary[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `\u7121\u52B9\u306A\u6570\u5024: ${issue2.divisor}\u306E\u500D\u6570\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
      case "unrecognized_keys":
        return `\u8A8D\u8B58\u3055\u308C\u3066\u3044\u306A\u3044\u30AD\u30FC${issue2.keys.length > 1 ? "\u7FA4" : ""}: ${joinValues(issue2.keys, "\u3001")}`;
      case "invalid_key":
        return `${issue2.origin}\u5185\u306E\u7121\u52B9\u306A\u30AD\u30FC`;
      case "invalid_union":
        return "\u7121\u52B9\u306A\u5165\u529B";
      case "invalid_element":
        return `${issue2.origin}\u5185\u306E\u7121\u52B9\u306A\u5024`;
      default:
        return `\u7121\u52B9\u306A\u5165\u529B`;
    }
  };
};
function ja_default() {
  return {
    localeError: error22()
  };
}

// ../../node_modules/zod/v4/locales/ka.js
var error23 = () => {
  const Sizable = {
    string: { unit: "\u10E1\u10D8\u10DB\u10D1\u10DD\u10DA\u10DD", verb: "\u10E3\u10DC\u10D3\u10D0 \u10E8\u10D4\u10D8\u10EA\u10D0\u10D5\u10D3\u10D4\u10E1" },
    file: { unit: "\u10D1\u10D0\u10D8\u10E2\u10D8", verb: "\u10E3\u10DC\u10D3\u10D0 \u10E8\u10D4\u10D8\u10EA\u10D0\u10D5\u10D3\u10D4\u10E1" },
    array: { unit: "\u10D4\u10DA\u10D4\u10DB\u10D4\u10DC\u10E2\u10D8", verb: "\u10E3\u10DC\u10D3\u10D0 \u10E8\u10D4\u10D8\u10EA\u10D0\u10D5\u10D3\u10D4\u10E1" },
    set: { unit: "\u10D4\u10DA\u10D4\u10DB\u10D4\u10DC\u10E2\u10D8", verb: "\u10E3\u10DC\u10D3\u10D0 \u10E8\u10D4\u10D8\u10EA\u10D0\u10D5\u10D3\u10D4\u10E1" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "\u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0",
    email: "\u10D4\u10DA-\u10E4\u10DD\u10E1\u10E2\u10D8\u10E1 \u10DB\u10D8\u10E1\u10D0\u10DB\u10D0\u10E0\u10D7\u10D8",
    url: "URL",
    emoji: "\u10D4\u10DB\u10DD\u10EF\u10D8",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "\u10D7\u10D0\u10E0\u10D8\u10E6\u10D8-\u10D3\u10E0\u10DD",
    date: "\u10D7\u10D0\u10E0\u10D8\u10E6\u10D8",
    time: "\u10D3\u10E0\u10DD",
    duration: "\u10EE\u10D0\u10DC\u10D2\u10E0\u10EB\u10DA\u10D8\u10D5\u10DD\u10D1\u10D0",
    ipv4: "IPv4 \u10DB\u10D8\u10E1\u10D0\u10DB\u10D0\u10E0\u10D7\u10D8",
    ipv6: "IPv6 \u10DB\u10D8\u10E1\u10D0\u10DB\u10D0\u10E0\u10D7\u10D8",
    cidrv4: "IPv4 \u10D3\u10D8\u10D0\u10DE\u10D0\u10D6\u10DD\u10DC\u10D8",
    cidrv6: "IPv6 \u10D3\u10D8\u10D0\u10DE\u10D0\u10D6\u10DD\u10DC\u10D8",
    base64: "base64-\u10D9\u10DD\u10D3\u10D8\u10E0\u10D4\u10D1\u10E3\u10DA\u10D8 \u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8",
    base64url: "base64url-\u10D9\u10DD\u10D3\u10D8\u10E0\u10D4\u10D1\u10E3\u10DA\u10D8 \u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8",
    json_string: "JSON \u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8",
    e164: "E.164 \u10DC\u10DD\u10DB\u10D4\u10E0\u10D8",
    jwt: "JWT",
    template_literal: "\u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0"
  };
  const TypeDictionary = {
    nan: "NaN",
    number: "\u10E0\u10D8\u10EA\u10EE\u10D5\u10D8",
    string: "\u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8",
    boolean: "\u10D1\u10E3\u10DA\u10D4\u10D0\u10DC\u10D8",
    function: "\u10E4\u10E3\u10DC\u10E5\u10EA\u10D8\u10D0",
    array: "\u10DB\u10D0\u10E1\u10D8\u10D5\u10D8"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        if (/^[A-Z]/.test(issue2.expected)) {
          return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 instanceof ${issue2.expected}, \u10DB\u10D8\u10E6\u10D4\u10D1\u10E3\u10DA\u10D8 ${received}`;
        }
        return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${expected}, \u10DB\u10D8\u10E6\u10D4\u10D1\u10E3\u10DA\u10D8 ${received}`;
      }
      case "invalid_value":
        if (issue2.values.length === 1)
          return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${stringifyPrimitive(issue2.values[0])}`;
        return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10D5\u10D0\u10E0\u10D8\u10D0\u10DC\u10E2\u10D8: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8\u10D0 \u10D4\u10E0\u10D7-\u10D4\u10E0\u10D7\u10D8 ${joinValues(issue2.values, "|")}-\u10D3\u10D0\u10DC`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `\u10D6\u10D4\u10D3\u10DB\u10D4\u10E2\u10D0\u10D3 \u10D3\u10D8\u10D3\u10D8: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${issue2.origin ?? "\u10DB\u10DC\u10D8\u10E8\u10D5\u10DC\u10D4\u10DA\u10DD\u10D1\u10D0"} ${sizing.verb} ${adj}${issue2.maximum.toString()} ${sizing.unit}`;
        return `\u10D6\u10D4\u10D3\u10DB\u10D4\u10E2\u10D0\u10D3 \u10D3\u10D8\u10D3\u10D8: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${issue2.origin ?? "\u10DB\u10DC\u10D8\u10E8\u10D5\u10DC\u10D4\u10DA\u10DD\u10D1\u10D0"} \u10D8\u10E7\u10DD\u10E1 ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `\u10D6\u10D4\u10D3\u10DB\u10D4\u10E2\u10D0\u10D3 \u10DE\u10D0\u10E2\u10D0\u10E0\u10D0: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${issue2.origin} ${sizing.verb} ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `\u10D6\u10D4\u10D3\u10DB\u10D4\u10E2\u10D0\u10D3 \u10DE\u10D0\u10E2\u10D0\u10E0\u10D0: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${issue2.origin} \u10D8\u10E7\u10DD\u10E1 ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with") {
          return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8: \u10E3\u10DC\u10D3\u10D0 \u10D8\u10EC\u10E7\u10D4\u10D1\u10DD\u10D3\u10D4\u10E1 "${_issue.prefix}"-\u10D8\u10D7`;
        }
        if (_issue.format === "ends_with")
          return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8: \u10E3\u10DC\u10D3\u10D0 \u10DB\u10D7\u10D0\u10D5\u10E0\u10D3\u10D4\u10D1\u10DD\u10D3\u10D4\u10E1 "${_issue.suffix}"-\u10D8\u10D7`;
        if (_issue.format === "includes")
          return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8: \u10E3\u10DC\u10D3\u10D0 \u10E8\u10D4\u10D8\u10EA\u10D0\u10D5\u10D3\u10D4\u10E1 "${_issue.includes}"-\u10E1`;
        if (_issue.format === "regex")
          return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8: \u10E3\u10DC\u10D3\u10D0 \u10E8\u10D4\u10D4\u10E1\u10D0\u10D1\u10D0\u10DB\u10D4\u10D1\u10DD\u10D3\u10D4\u10E1 \u10E8\u10D0\u10D1\u10DA\u10DD\u10DC\u10E1 ${_issue.pattern}`;
        return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 ${FormatDictionary[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E0\u10D8\u10EA\u10EE\u10D5\u10D8: \u10E3\u10DC\u10D3\u10D0 \u10D8\u10E7\u10DD\u10E1 ${issue2.divisor}-\u10D8\u10E1 \u10EF\u10D4\u10E0\u10D0\u10D3\u10D8`;
      case "unrecognized_keys":
        return `\u10E3\u10EA\u10DC\u10DD\u10D1\u10D8 \u10D2\u10D0\u10E1\u10D0\u10E6\u10D4\u10D1${issue2.keys.length > 1 ? "\u10D4\u10D1\u10D8" : "\u10D8"}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10D2\u10D0\u10E1\u10D0\u10E6\u10D4\u10D1\u10D8 ${issue2.origin}-\u10E8\u10D8`;
      case "invalid_union":
        return "\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0";
      case "invalid_element":
        return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10DB\u10DC\u10D8\u10E8\u10D5\u10DC\u10D4\u10DA\u10DD\u10D1\u10D0 ${issue2.origin}-\u10E8\u10D8`;
      default:
        return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0`;
    }
  };
};
function ka_default() {
  return {
    localeError: error23()
  };
}

// ../../node_modules/zod/v4/locales/km.js
var error24 = () => {
  const Sizable = {
    string: { unit: "\u178F\u17BD\u17A2\u1780\u17D2\u179F\u179A", verb: "\u1782\u17BD\u179A\u1798\u17B6\u1793" },
    file: { unit: "\u1794\u17C3", verb: "\u1782\u17BD\u179A\u1798\u17B6\u1793" },
    array: { unit: "\u1792\u17B6\u178F\u17BB", verb: "\u1782\u17BD\u179A\u1798\u17B6\u1793" },
    set: { unit: "\u1792\u17B6\u178F\u17BB", verb: "\u1782\u17BD\u179A\u1798\u17B6\u1793" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1794\u1789\u17D2\u1785\u17BC\u179B",
    email: "\u17A2\u17B6\u179F\u1799\u178A\u17D2\u178B\u17B6\u1793\u17A2\u17CA\u17B8\u1798\u17C2\u179B",
    url: "URL",
    emoji: "\u179F\u1789\u17D2\u1789\u17B6\u17A2\u17B6\u179A\u1798\u17D2\u1798\u178E\u17CD",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "\u1780\u17B6\u179B\u1794\u179A\u17B7\u1785\u17D2\u1786\u17C1\u1791 \u1793\u17B7\u1784\u1798\u17C9\u17C4\u1784 ISO",
    date: "\u1780\u17B6\u179B\u1794\u179A\u17B7\u1785\u17D2\u1786\u17C1\u1791 ISO",
    time: "\u1798\u17C9\u17C4\u1784 ISO",
    duration: "\u179A\u1799\u17C8\u1796\u17C1\u179B ISO",
    ipv4: "\u17A2\u17B6\u179F\u1799\u178A\u17D2\u178B\u17B6\u1793 IPv4",
    ipv6: "\u17A2\u17B6\u179F\u1799\u178A\u17D2\u178B\u17B6\u1793 IPv6",
    cidrv4: "\u178A\u17C2\u1793\u17A2\u17B6\u179F\u1799\u178A\u17D2\u178B\u17B6\u1793 IPv4",
    cidrv6: "\u178A\u17C2\u1793\u17A2\u17B6\u179F\u1799\u178A\u17D2\u178B\u17B6\u1793 IPv6",
    base64: "\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u17A2\u17CA\u17B7\u1780\u17BC\u178A base64",
    base64url: "\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u17A2\u17CA\u17B7\u1780\u17BC\u178A base64url",
    json_string: "\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A JSON",
    e164: "\u179B\u17C1\u1781 E.164",
    jwt: "JWT",
    template_literal: "\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1794\u1789\u17D2\u1785\u17BC\u179B"
  };
  const TypeDictionary = {
    nan: "NaN",
    number: "\u179B\u17C1\u1781",
    array: "\u17A2\u17B6\u179A\u17C1 (Array)",
    null: "\u1782\u17D2\u1798\u17B6\u1793\u178F\u1798\u17D2\u179B\u17C3 (null)"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        if (/^[A-Z]/.test(issue2.expected)) {
          return `\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1794\u1789\u17D2\u1785\u17BC\u179B\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A instanceof ${issue2.expected} \u1794\u17C9\u17BB\u1793\u17D2\u178F\u17C2\u1791\u1791\u17BD\u179B\u1794\u17B6\u1793 ${received}`;
        }
        return `\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1794\u1789\u17D2\u1785\u17BC\u179B\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${expected} \u1794\u17C9\u17BB\u1793\u17D2\u178F\u17C2\u1791\u1791\u17BD\u179B\u1794\u17B6\u1793 ${received}`;
      }
      case "invalid_value":
        if (issue2.values.length === 1)
          return `\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1794\u1789\u17D2\u1785\u17BC\u179B\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${stringifyPrimitive(issue2.values[0])}`;
        return `\u1787\u1798\u17D2\u179A\u17BE\u179F\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1787\u17B6\u1798\u17BD\u1799\u1780\u17D2\u1793\u17BB\u1784\u1785\u17C6\u178E\u17C4\u1798 ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `\u1792\u17C6\u1796\u17C1\u1780\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${issue2.origin ?? "\u178F\u1798\u17D2\u179B\u17C3"} ${adj} ${issue2.maximum.toString()} ${sizing.unit ?? "\u1792\u17B6\u178F\u17BB"}`;
        return `\u1792\u17C6\u1796\u17C1\u1780\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${issue2.origin ?? "\u178F\u1798\u17D2\u179B\u17C3"} ${adj} ${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `\u178F\u17BC\u1785\u1796\u17C1\u1780\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${issue2.origin} ${adj} ${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `\u178F\u17BC\u1785\u1796\u17C1\u1780\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${issue2.origin} ${adj} ${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with") {
          return `\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1785\u17B6\u1794\u17CB\u1795\u17D2\u178F\u17BE\u1798\u178A\u17C4\u1799 "${_issue.prefix}"`;
        }
        if (_issue.format === "ends_with")
          return `\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1794\u1789\u17D2\u1785\u1794\u17CB\u178A\u17C4\u1799 "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1798\u17B6\u1793 "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u178F\u17C2\u1795\u17D2\u1782\u17BC\u1795\u17D2\u1782\u1784\u1793\u17B9\u1784\u1791\u1798\u17D2\u179A\u1784\u17CB\u178A\u17C2\u179B\u1794\u17B6\u1793\u1780\u17C6\u178E\u178F\u17CB ${_issue.pattern}`;
        return `\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 ${FormatDictionary[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `\u179B\u17C1\u1781\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u178F\u17C2\u1787\u17B6\u1796\u17A0\u17BB\u1782\u17BB\u178E\u1793\u17C3 ${issue2.divisor}`;
      case "unrecognized_keys":
        return `\u179A\u1780\u1783\u17BE\u1789\u179F\u17C4\u1798\u17B7\u1793\u179F\u17D2\u1782\u17B6\u179B\u17CB\u17D6 ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `\u179F\u17C4\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u1793\u17C5\u1780\u17D2\u1793\u17BB\u1784 ${issue2.origin}`;
      case "invalid_union":
        return `\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C`;
      case "invalid_element":
        return `\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u1793\u17C5\u1780\u17D2\u1793\u17BB\u1784 ${issue2.origin}`;
      default:
        return `\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C`;
    }
  };
};
function km_default() {
  return {
    localeError: error24()
  };
}

// ../../node_modules/zod/v4/locales/kh.js
function kh_default() {
  return km_default();
}

// ../../node_modules/zod/v4/locales/ko.js
var error25 = () => {
  const Sizable = {
    string: { unit: "\uBB38\uC790", verb: "to have" },
    file: { unit: "\uBC14\uC774\uD2B8", verb: "to have" },
    array: { unit: "\uAC1C", verb: "to have" },
    set: { unit: "\uAC1C", verb: "to have" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "\uC785\uB825",
    email: "\uC774\uBA54\uC77C \uC8FC\uC18C",
    url: "URL",
    emoji: "\uC774\uBAA8\uC9C0",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO \uB0A0\uC9DC\uC2DC\uAC04",
    date: "ISO \uB0A0\uC9DC",
    time: "ISO \uC2DC\uAC04",
    duration: "ISO \uAE30\uAC04",
    ipv4: "IPv4 \uC8FC\uC18C",
    ipv6: "IPv6 \uC8FC\uC18C",
    cidrv4: "IPv4 \uBC94\uC704",
    cidrv6: "IPv6 \uBC94\uC704",
    base64: "base64 \uC778\uCF54\uB529 \uBB38\uC790\uC5F4",
    base64url: "base64url \uC778\uCF54\uB529 \uBB38\uC790\uC5F4",
    json_string: "JSON \uBB38\uC790\uC5F4",
    e164: "E.164 \uBC88\uD638",
    jwt: "JWT",
    template_literal: "\uC785\uB825"
  };
  const TypeDictionary = {
    nan: "NaN"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        if (/^[A-Z]/.test(issue2.expected)) {
          return `\uC798\uBABB\uB41C \uC785\uB825: \uC608\uC0C1 \uD0C0\uC785\uC740 instanceof ${issue2.expected}, \uBC1B\uC740 \uD0C0\uC785\uC740 ${received}\uC785\uB2C8\uB2E4`;
        }
        return `\uC798\uBABB\uB41C \uC785\uB825: \uC608\uC0C1 \uD0C0\uC785\uC740 ${expected}, \uBC1B\uC740 \uD0C0\uC785\uC740 ${received}\uC785\uB2C8\uB2E4`;
      }
      case "invalid_value":
        if (issue2.values.length === 1)
          return `\uC798\uBABB\uB41C \uC785\uB825: \uAC12\uC740 ${stringifyPrimitive(issue2.values[0])} \uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4`;
        return `\uC798\uBABB\uB41C \uC635\uC158: ${joinValues(issue2.values, "\uB610\uB294 ")} \uC911 \uD558\uB098\uC5EC\uC57C \uD569\uB2C8\uB2E4`;
      case "too_big": {
        const adj = issue2.inclusive ? "\uC774\uD558" : "\uBBF8\uB9CC";
        const suffix = adj === "\uBBF8\uB9CC" ? "\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4" : "\uC5EC\uC57C \uD569\uB2C8\uB2E4";
        const sizing = getSizing(issue2.origin);
        const unit = sizing?.unit ?? "\uC694\uC18C";
        if (sizing)
          return `${issue2.origin ?? "\uAC12"}\uC774 \uB108\uBB34 \uD07D\uB2C8\uB2E4: ${issue2.maximum.toString()}${unit} ${adj}${suffix}`;
        return `${issue2.origin ?? "\uAC12"}\uC774 \uB108\uBB34 \uD07D\uB2C8\uB2E4: ${issue2.maximum.toString()} ${adj}${suffix}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? "\uC774\uC0C1" : "\uCD08\uACFC";
        const suffix = adj === "\uC774\uC0C1" ? "\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4" : "\uC5EC\uC57C \uD569\uB2C8\uB2E4";
        const sizing = getSizing(issue2.origin);
        const unit = sizing?.unit ?? "\uC694\uC18C";
        if (sizing) {
          return `${issue2.origin ?? "\uAC12"}\uC774 \uB108\uBB34 \uC791\uC2B5\uB2C8\uB2E4: ${issue2.minimum.toString()}${unit} ${adj}${suffix}`;
        }
        return `${issue2.origin ?? "\uAC12"}\uC774 \uB108\uBB34 \uC791\uC2B5\uB2C8\uB2E4: ${issue2.minimum.toString()} ${adj}${suffix}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with") {
          return `\uC798\uBABB\uB41C \uBB38\uC790\uC5F4: "${_issue.prefix}"(\uC73C)\uB85C \uC2DC\uC791\uD574\uC57C \uD569\uB2C8\uB2E4`;
        }
        if (_issue.format === "ends_with")
          return `\uC798\uBABB\uB41C \uBB38\uC790\uC5F4: "${_issue.suffix}"(\uC73C)\uB85C \uB05D\uB098\uC57C \uD569\uB2C8\uB2E4`;
        if (_issue.format === "includes")
          return `\uC798\uBABB\uB41C \uBB38\uC790\uC5F4: "${_issue.includes}"\uC744(\uB97C) \uD3EC\uD568\uD574\uC57C \uD569\uB2C8\uB2E4`;
        if (_issue.format === "regex")
          return `\uC798\uBABB\uB41C \uBB38\uC790\uC5F4: \uC815\uADDC\uC2DD ${_issue.pattern} \uD328\uD134\uACFC \uC77C\uCE58\uD574\uC57C \uD569\uB2C8\uB2E4`;
        return `\uC798\uBABB\uB41C ${FormatDictionary[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `\uC798\uBABB\uB41C \uC22B\uC790: ${issue2.divisor}\uC758 \uBC30\uC218\uC5EC\uC57C \uD569\uB2C8\uB2E4`;
      case "unrecognized_keys":
        return `\uC778\uC2DD\uD560 \uC218 \uC5C6\uB294 \uD0A4: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `\uC798\uBABB\uB41C \uD0A4: ${issue2.origin}`;
      case "invalid_union":
        return `\uC798\uBABB\uB41C \uC785\uB825`;
      case "invalid_element":
        return `\uC798\uBABB\uB41C \uAC12: ${issue2.origin}`;
      default:
        return `\uC798\uBABB\uB41C \uC785\uB825`;
    }
  };
};
function ko_default() {
  return {
    localeError: error25()
  };
}

// ../../node_modules/zod/v4/locales/lt.js
var capitalizeFirstCharacter = (text) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};
function getUnitTypeFromNumber(number4) {
  const abs = Math.abs(number4);
  const last = abs % 10;
  const last2 = abs % 100;
  if (last2 >= 11 && last2 <= 19 || last === 0)
    return "many";
  if (last === 1)
    return "one";
  return "few";
}
var error26 = () => {
  const Sizable = {
    string: {
      unit: {
        one: "simbolis",
        few: "simboliai",
        many: "simboli\u0173"
      },
      verb: {
        smaller: {
          inclusive: "turi b\u016Bti ne ilgesn\u0117 kaip",
          notInclusive: "turi b\u016Bti trumpesn\u0117 kaip"
        },
        bigger: {
          inclusive: "turi b\u016Bti ne trumpesn\u0117 kaip",
          notInclusive: "turi b\u016Bti ilgesn\u0117 kaip"
        }
      }
    },
    file: {
      unit: {
        one: "baitas",
        few: "baitai",
        many: "bait\u0173"
      },
      verb: {
        smaller: {
          inclusive: "turi b\u016Bti ne didesnis kaip",
          notInclusive: "turi b\u016Bti ma\u017Eesnis kaip"
        },
        bigger: {
          inclusive: "turi b\u016Bti ne ma\u017Eesnis kaip",
          notInclusive: "turi b\u016Bti didesnis kaip"
        }
      }
    },
    array: {
      unit: {
        one: "element\u0105",
        few: "elementus",
        many: "element\u0173"
      },
      verb: {
        smaller: {
          inclusive: "turi tur\u0117ti ne daugiau kaip",
          notInclusive: "turi tur\u0117ti ma\u017Eiau kaip"
        },
        bigger: {
          inclusive: "turi tur\u0117ti ne ma\u017Eiau kaip",
          notInclusive: "turi tur\u0117ti daugiau kaip"
        }
      }
    },
    set: {
      unit: {
        one: "element\u0105",
        few: "elementus",
        many: "element\u0173"
      },
      verb: {
        smaller: {
          inclusive: "turi tur\u0117ti ne daugiau kaip",
          notInclusive: "turi tur\u0117ti ma\u017Eiau kaip"
        },
        bigger: {
          inclusive: "turi tur\u0117ti ne ma\u017Eiau kaip",
          notInclusive: "turi tur\u0117ti daugiau kaip"
        }
      }
    }
  };
  function getSizing(origin, unitType, inclusive, targetShouldBe) {
    const result = Sizable[origin] ?? null;
    if (result === null)
      return result;
    return {
      unit: result.unit[unitType],
      verb: result.verb[targetShouldBe][inclusive ? "inclusive" : "notInclusive"]
    };
  }
  const FormatDictionary = {
    regex: "\u012Fvestis",
    email: "el. pa\u0161to adresas",
    url: "URL",
    emoji: "jaustukas",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO data ir laikas",
    date: "ISO data",
    time: "ISO laikas",
    duration: "ISO trukm\u0117",
    ipv4: "IPv4 adresas",
    ipv6: "IPv6 adresas",
    cidrv4: "IPv4 tinklo prefiksas (CIDR)",
    cidrv6: "IPv6 tinklo prefiksas (CIDR)",
    base64: "base64 u\u017Ekoduota eilut\u0117",
    base64url: "base64url u\u017Ekoduota eilut\u0117",
    json_string: "JSON eilut\u0117",
    e164: "E.164 numeris",
    jwt: "JWT",
    template_literal: "\u012Fvestis"
  };
  const TypeDictionary = {
    nan: "NaN",
    number: "skai\u010Dius",
    bigint: "sveikasis skai\u010Dius",
    string: "eilut\u0117",
    boolean: "login\u0117 reik\u0161m\u0117",
    undefined: "neapibr\u0117\u017Eta reik\u0161m\u0117",
    function: "funkcija",
    symbol: "simbolis",
    array: "masyvas",
    object: "objektas",
    null: "nulin\u0117 reik\u0161m\u0117"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        if (/^[A-Z]/.test(issue2.expected)) {
          return `Gautas tipas ${received}, o tik\u0117tasi - instanceof ${issue2.expected}`;
        }
        return `Gautas tipas ${received}, o tik\u0117tasi - ${expected}`;
      }
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Privalo b\u016Bti ${stringifyPrimitive(issue2.values[0])}`;
        return `Privalo b\u016Bti vienas i\u0161 ${joinValues(issue2.values, "|")} pasirinkim\u0173`;
      case "too_big": {
        const origin = TypeDictionary[issue2.origin] ?? issue2.origin;
        const sizing = getSizing(issue2.origin, getUnitTypeFromNumber(Number(issue2.maximum)), issue2.inclusive ?? false, "smaller");
        if (sizing?.verb)
          return `${capitalizeFirstCharacter(origin ?? issue2.origin ?? "reik\u0161m\u0117")} ${sizing.verb} ${issue2.maximum.toString()} ${sizing.unit ?? "element\u0173"}`;
        const adj = issue2.inclusive ? "ne didesnis kaip" : "ma\u017Eesnis kaip";
        return `${capitalizeFirstCharacter(origin ?? issue2.origin ?? "reik\u0161m\u0117")} turi b\u016Bti ${adj} ${issue2.maximum.toString()} ${sizing?.unit}`;
      }
      case "too_small": {
        const origin = TypeDictionary[issue2.origin] ?? issue2.origin;
        const sizing = getSizing(issue2.origin, getUnitTypeFromNumber(Number(issue2.minimum)), issue2.inclusive ?? false, "bigger");
        if (sizing?.verb)
          return `${capitalizeFirstCharacter(origin ?? issue2.origin ?? "reik\u0161m\u0117")} ${sizing.verb} ${issue2.minimum.toString()} ${sizing.unit ?? "element\u0173"}`;
        const adj = issue2.inclusive ? "ne ma\u017Eesnis kaip" : "didesnis kaip";
        return `${capitalizeFirstCharacter(origin ?? issue2.origin ?? "reik\u0161m\u0117")} turi b\u016Bti ${adj} ${issue2.minimum.toString()} ${sizing?.unit}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with") {
          return `Eilut\u0117 privalo prasid\u0117ti "${_issue.prefix}"`;
        }
        if (_issue.format === "ends_with")
          return `Eilut\u0117 privalo pasibaigti "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `Eilut\u0117 privalo \u012Ftraukti "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `Eilut\u0117 privalo atitikti ${_issue.pattern}`;
        return `Neteisingas ${FormatDictionary[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `Skai\u010Dius privalo b\u016Bti ${issue2.divisor} kartotinis.`;
      case "unrecognized_keys":
        return `Neatpa\u017Eint${issue2.keys.length > 1 ? "i" : "as"} rakt${issue2.keys.length > 1 ? "ai" : "as"}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return "Rastas klaidingas raktas";
      case "invalid_union":
        return "Klaidinga \u012Fvestis";
      case "invalid_element": {
        const origin = TypeDictionary[issue2.origin] ?? issue2.origin;
        return `${capitalizeFirstCharacter(origin ?? issue2.origin ?? "reik\u0161m\u0117")} turi klaiding\u0105 \u012Fvest\u012F`;
      }
      default:
        return "Klaidinga \u012Fvestis";
    }
  };
};
function lt_default() {
  return {
    localeError: error26()
  };
}

// ../../node_modules/zod/v4/locales/mk.js
var error27 = () => {
  const Sizable = {
    string: { unit: "\u0437\u043D\u0430\u0446\u0438", verb: "\u0434\u0430 \u0438\u043C\u0430\u0430\u0442" },
    file: { unit: "\u0431\u0430\u0458\u0442\u0438", verb: "\u0434\u0430 \u0438\u043C\u0430\u0430\u0442" },
    array: { unit: "\u0441\u0442\u0430\u0432\u043A\u0438", verb: "\u0434\u0430 \u0438\u043C\u0430\u0430\u0442" },
    set: { unit: "\u0441\u0442\u0430\u0432\u043A\u0438", verb: "\u0434\u0430 \u0438\u043C\u0430\u0430\u0442" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "\u0432\u043D\u0435\u0441",
    email: "\u0430\u0434\u0440\u0435\u0441\u0430 \u043D\u0430 \u0435-\u043F\u043E\u0448\u0442\u0430",
    url: "URL",
    emoji: "\u0435\u043C\u043E\u045F\u0438",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO \u0434\u0430\u0442\u0443\u043C \u0438 \u0432\u0440\u0435\u043C\u0435",
    date: "ISO \u0434\u0430\u0442\u0443\u043C",
    time: "ISO \u0432\u0440\u0435\u043C\u0435",
    duration: "ISO \u0432\u0440\u0435\u043C\u0435\u0442\u0440\u0430\u0435\u045A\u0435",
    ipv4: "IPv4 \u0430\u0434\u0440\u0435\u0441\u0430",
    ipv6: "IPv6 \u0430\u0434\u0440\u0435\u0441\u0430",
    cidrv4: "IPv4 \u043E\u043F\u0441\u0435\u0433",
    cidrv6: "IPv6 \u043E\u043F\u0441\u0435\u0433",
    base64: "base64-\u0435\u043D\u043A\u043E\u0434\u0438\u0440\u0430\u043D\u0430 \u043D\u0438\u0437\u0430",
    base64url: "base64url-\u0435\u043D\u043A\u043E\u0434\u0438\u0440\u0430\u043D\u0430 \u043D\u0438\u0437\u0430",
    json_string: "JSON \u043D\u0438\u0437\u0430",
    e164: "E.164 \u0431\u0440\u043E\u0458",
    jwt: "JWT",
    template_literal: "\u0432\u043D\u0435\u0441"
  };
  const TypeDictionary = {
    nan: "NaN",
    number: "\u0431\u0440\u043E\u0458",
    array: "\u043D\u0438\u0437\u0430"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        if (/^[A-Z]/.test(issue2.expected)) {
          return `\u0413\u0440\u0435\u0448\u0435\u043D \u0432\u043D\u0435\u0441: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 instanceof ${issue2.expected}, \u043F\u0440\u0438\u043C\u0435\u043D\u043E ${received}`;
        }
        return `\u0413\u0440\u0435\u0448\u0435\u043D \u0432\u043D\u0435\u0441: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 ${expected}, \u043F\u0440\u0438\u043C\u0435\u043D\u043E ${received}`;
      }
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Invalid input: expected ${stringifyPrimitive(issue2.values[0])}`;
        return `\u0413\u0440\u0435\u0448\u0430\u043D\u0430 \u043E\u043F\u0446\u0438\u0458\u0430: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 \u0435\u0434\u043D\u0430 ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `\u041F\u0440\u0435\u043C\u043D\u043E\u0433\u0443 \u0433\u043E\u043B\u0435\u043C: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 ${issue2.origin ?? "\u0432\u0440\u0435\u0434\u043D\u043E\u0441\u0442\u0430"} \u0434\u0430 \u0438\u043C\u0430 ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0438"}`;
        return `\u041F\u0440\u0435\u043C\u043D\u043E\u0433\u0443 \u0433\u043E\u043B\u0435\u043C: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 ${issue2.origin ?? "\u0432\u0440\u0435\u0434\u043D\u043E\u0441\u0442\u0430"} \u0434\u0430 \u0431\u0438\u0434\u0435 ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `\u041F\u0440\u0435\u043C\u043D\u043E\u0433\u0443 \u043C\u0430\u043B: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 ${issue2.origin} \u0434\u0430 \u0438\u043C\u0430 ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `\u041F\u0440\u0435\u043C\u043D\u043E\u0433\u0443 \u043C\u0430\u043B: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 ${issue2.origin} \u0434\u0430 \u0431\u0438\u0434\u0435 ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with") {
          return `\u041D\u0435\u0432\u0430\u0436\u0435\u0447\u043A\u0430 \u043D\u0438\u0437\u0430: \u043C\u043E\u0440\u0430 \u0434\u0430 \u0437\u0430\u043F\u043E\u0447\u043D\u0443\u0432\u0430 \u0441\u043E "${_issue.prefix}"`;
        }
        if (_issue.format === "ends_with")
          return `\u041D\u0435\u0432\u0430\u0436\u0435\u0447\u043A\u0430 \u043D\u0438\u0437\u0430: \u043C\u043E\u0440\u0430 \u0434\u0430 \u0437\u0430\u0432\u0440\u0448\u0443\u0432\u0430 \u0441\u043E "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `\u041D\u0435\u0432\u0430\u0436\u0435\u0447\u043A\u0430 \u043D\u0438\u0437\u0430: \u043C\u043E\u0440\u0430 \u0434\u0430 \u0432\u043A\u043B\u0443\u0447\u0443\u0432\u0430 "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `\u041D\u0435\u0432\u0430\u0436\u0435\u0447\u043A\u0430 \u043D\u0438\u0437\u0430: \u043C\u043E\u0440\u0430 \u0434\u0430 \u043E\u0434\u0433\u043E\u0430\u0440\u0430 \u043D\u0430 \u043F\u0430\u0442\u0435\u0440\u043D\u043E\u0442 ${_issue.pattern}`;
        return `Invalid ${FormatDictionary[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `\u0413\u0440\u0435\u0448\u0435\u043D \u0431\u0440\u043E\u0458: \u043C\u043E\u0440\u0430 \u0434\u0430 \u0431\u0438\u0434\u0435 \u0434\u0435\u043B\u0438\u0432 \u0441\u043E ${issue2.divisor}`;
      case "unrecognized_keys":
        return `${issue2.keys.length > 1 ? "\u041D\u0435\u043F\u0440\u0435\u043F\u043E\u0437\u043D\u0430\u0435\u043D\u0438 \u043A\u043B\u0443\u0447\u0435\u0432\u0438" : "\u041D\u0435\u043F\u0440\u0435\u043F\u043E\u0437\u043D\u0430\u0435\u043D \u043A\u043B\u0443\u0447"}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `\u0413\u0440\u0435\u0448\u0435\u043D \u043A\u043B\u0443\u0447 \u0432\u043E ${issue2.origin}`;
      case "invalid_union":
        return "\u0413\u0440\u0435\u0448\u0435\u043D \u0432\u043D\u0435\u0441";
      case "invalid_element":
        return `\u0413\u0440\u0435\u0448\u043D\u0430 \u0432\u0440\u0435\u0434\u043D\u043E\u0441\u0442 \u0432\u043E ${issue2.origin}`;
      default:
        return `\u0413\u0440\u0435\u0448\u0435\u043D \u0432\u043D\u0435\u0441`;
    }
  };
};
function mk_default() {
  return {
    localeError: error27()
  };
}

// ../../node_modules/zod/v4/locales/ms.js
var error28 = () => {
  const Sizable = {
    string: { unit: "aksara", verb: "mempunyai" },
    file: { unit: "bait", verb: "mempunyai" },
    array: { unit: "elemen", verb: "mempunyai" },
    set: { unit: "elemen", verb: "mempunyai" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "input",
    email: "alamat e-mel",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "tarikh masa ISO",
    date: "tarikh ISO",
    time: "masa ISO",
    duration: "tempoh ISO",
    ipv4: "alamat IPv4",
    ipv6: "alamat IPv6",
    cidrv4: "julat IPv4",
    cidrv6: "julat IPv6",
    base64: "string dikodkan base64",
    base64url: "string dikodkan base64url",
    json_string: "string JSON",
    e164: "nombor E.164",
    jwt: "JWT",
    template_literal: "input"
  };
  const TypeDictionary = {
    nan: "NaN",
    number: "nombor"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        if (/^[A-Z]/.test(issue2.expected)) {
          return `Input tidak sah: dijangka instanceof ${issue2.expected}, diterima ${received}`;
        }
        return `Input tidak sah: dijangka ${expected}, diterima ${received}`;
      }
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Input tidak sah: dijangka ${stringifyPrimitive(issue2.values[0])}`;
        return `Pilihan tidak sah: dijangka salah satu daripada ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `Terlalu besar: dijangka ${issue2.origin ?? "nilai"} ${sizing.verb} ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elemen"}`;
        return `Terlalu besar: dijangka ${issue2.origin ?? "nilai"} adalah ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `Terlalu kecil: dijangka ${issue2.origin} ${sizing.verb} ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `Terlalu kecil: dijangka ${issue2.origin} adalah ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `String tidak sah: mesti bermula dengan "${_issue.prefix}"`;
        if (_issue.format === "ends_with")
          return `String tidak sah: mesti berakhir dengan "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `String tidak sah: mesti mengandungi "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `String tidak sah: mesti sepadan dengan corak ${_issue.pattern}`;
        return `${FormatDictionary[_issue.format] ?? issue2.format} tidak sah`;
      }
      case "not_multiple_of":
        return `Nombor tidak sah: perlu gandaan ${issue2.divisor}`;
      case "unrecognized_keys":
        return `Kunci tidak dikenali: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `Kunci tidak sah dalam ${issue2.origin}`;
      case "invalid_union":
        return "Input tidak sah";
      case "invalid_element":
        return `Nilai tidak sah dalam ${issue2.origin}`;
      default:
        return `Input tidak sah`;
    }
  };
};
function ms_default() {
  return {
    localeError: error28()
  };
}

// ../../node_modules/zod/v4/locales/nl.js
var error29 = () => {
  const Sizable = {
    string: { unit: "tekens", verb: "heeft" },
    file: { unit: "bytes", verb: "heeft" },
    array: { unit: "elementen", verb: "heeft" },
    set: { unit: "elementen", verb: "heeft" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "invoer",
    email: "emailadres",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO datum en tijd",
    date: "ISO datum",
    time: "ISO tijd",
    duration: "ISO duur",
    ipv4: "IPv4-adres",
    ipv6: "IPv6-adres",
    cidrv4: "IPv4-bereik",
    cidrv6: "IPv6-bereik",
    base64: "base64-gecodeerde tekst",
    base64url: "base64 URL-gecodeerde tekst",
    json_string: "JSON string",
    e164: "E.164-nummer",
    jwt: "JWT",
    template_literal: "invoer"
  };
  const TypeDictionary = {
    nan: "NaN",
    number: "getal"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        if (/^[A-Z]/.test(issue2.expected)) {
          return `Ongeldige invoer: verwacht instanceof ${issue2.expected}, ontving ${received}`;
        }
        return `Ongeldige invoer: verwacht ${expected}, ontving ${received}`;
      }
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Ongeldige invoer: verwacht ${stringifyPrimitive(issue2.values[0])}`;
        return `Ongeldige optie: verwacht \xE9\xE9n van ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        const longName = issue2.origin === "date" ? "laat" : issue2.origin === "string" ? "lang" : "groot";
        if (sizing)
          return `Te ${longName}: verwacht dat ${issue2.origin ?? "waarde"} ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elementen"} ${sizing.verb}`;
        return `Te ${longName}: verwacht dat ${issue2.origin ?? "waarde"} ${adj}${issue2.maximum.toString()} is`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        const shortName = issue2.origin === "date" ? "vroeg" : issue2.origin === "string" ? "kort" : "klein";
        if (sizing) {
          return `Te ${shortName}: verwacht dat ${issue2.origin} ${adj}${issue2.minimum.toString()} ${sizing.unit} ${sizing.verb}`;
        }
        return `Te ${shortName}: verwacht dat ${issue2.origin} ${adj}${issue2.minimum.toString()} is`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with") {
          return `Ongeldige tekst: moet met "${_issue.prefix}" beginnen`;
        }
        if (_issue.format === "ends_with")
          return `Ongeldige tekst: moet op "${_issue.suffix}" eindigen`;
        if (_issue.format === "includes")
          return `Ongeldige tekst: moet "${_issue.includes}" bevatten`;
        if (_issue.format === "regex")
          return `Ongeldige tekst: moet overeenkomen met patroon ${_issue.pattern}`;
        return `Ongeldig: ${FormatDictionary[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `Ongeldig getal: moet een veelvoud van ${issue2.divisor} zijn`;
      case "unrecognized_keys":
        return `Onbekende key${issue2.keys.length > 1 ? "s" : ""}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `Ongeldige key in ${issue2.origin}`;
      case "invalid_union":
        return "Ongeldige invoer";
      case "invalid_element":
        return `Ongeldige waarde in ${issue2.origin}`;
      default:
        return `Ongeldige invoer`;
    }
  };
};
function nl_default() {
  return {
    localeError: error29()
  };
}

// ../../node_modules/zod/v4/locales/no.js
var error30 = () => {
  const Sizable = {
    string: { unit: "tegn", verb: "\xE5 ha" },
    file: { unit: "bytes", verb: "\xE5 ha" },
    array: { unit: "elementer", verb: "\xE5 inneholde" },
    set: { unit: "elementer", verb: "\xE5 inneholde" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "input",
    email: "e-postadresse",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO dato- og klokkeslett",
    date: "ISO-dato",
    time: "ISO-klokkeslett",
    duration: "ISO-varighet",
    ipv4: "IPv4-omr\xE5de",
    ipv6: "IPv6-omr\xE5de",
    cidrv4: "IPv4-spekter",
    cidrv6: "IPv6-spekter",
    base64: "base64-enkodet streng",
    base64url: "base64url-enkodet streng",
    json_string: "JSON-streng",
    e164: "E.164-nummer",
    jwt: "JWT",
    template_literal: "input"
  };
  const TypeDictionary = {
    nan: "NaN",
    number: "tall",
    array: "liste"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        if (/^[A-Z]/.test(issue2.expected)) {
          return `Ugyldig input: forventet instanceof ${issue2.expected}, fikk ${received}`;
        }
        return `Ugyldig input: forventet ${expected}, fikk ${received}`;
      }
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Ugyldig verdi: forventet ${stringifyPrimitive(issue2.values[0])}`;
        return `Ugyldig valg: forventet en av ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `For stor(t): forventet ${issue2.origin ?? "value"} til \xE5 ha ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elementer"}`;
        return `For stor(t): forventet ${issue2.origin ?? "value"} til \xE5 ha ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `For lite(n): forventet ${issue2.origin} til \xE5 ha ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `For lite(n): forventet ${issue2.origin} til \xE5 ha ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `Ugyldig streng: m\xE5 starte med "${_issue.prefix}"`;
        if (_issue.format === "ends_with")
          return `Ugyldig streng: m\xE5 ende med "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `Ugyldig streng: m\xE5 inneholde "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `Ugyldig streng: m\xE5 matche m\xF8nsteret ${_issue.pattern}`;
        return `Ugyldig ${FormatDictionary[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `Ugyldig tall: m\xE5 v\xE6re et multiplum av ${issue2.divisor}`;
      case "unrecognized_keys":
        return `${issue2.keys.length > 1 ? "Ukjente n\xF8kler" : "Ukjent n\xF8kkel"}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `Ugyldig n\xF8kkel i ${issue2.origin}`;
      case "invalid_union":
        return "Ugyldig input";
      case "invalid_element":
        return `Ugyldig verdi i ${issue2.origin}`;
      default:
        return `Ugyldig input`;
    }
  };
};
function no_default() {
  return {
    localeError: error30()
  };
}

// ../../node_modules/zod/v4/locales/ota.js
var error31 = () => {
  const Sizable = {
    string: { unit: "harf", verb: "olmal\u0131d\u0131r" },
    file: { unit: "bayt", verb: "olmal\u0131d\u0131r" },
    array: { unit: "unsur", verb: "olmal\u0131d\u0131r" },
    set: { unit: "unsur", verb: "olmal\u0131d\u0131r" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "giren",
    email: "epostag\xE2h",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO heng\xE2m\u0131",
    date: "ISO tarihi",
    time: "ISO zaman\u0131",
    duration: "ISO m\xFCddeti",
    ipv4: "IPv4 ni\u015F\xE2n\u0131",
    ipv6: "IPv6 ni\u015F\xE2n\u0131",
    cidrv4: "IPv4 menzili",
    cidrv6: "IPv6 menzili",
    base64: "base64-\u015Fifreli metin",
    base64url: "base64url-\u015Fifreli metin",
    json_string: "JSON metin",
    e164: "E.164 say\u0131s\u0131",
    jwt: "JWT",
    template_literal: "giren"
  };
  const TypeDictionary = {
    nan: "NaN",
    number: "numara",
    array: "saf",
    null: "gayb"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        if (/^[A-Z]/.test(issue2.expected)) {
          return `F\xE2sit giren: umulan instanceof ${issue2.expected}, al\u0131nan ${received}`;
        }
        return `F\xE2sit giren: umulan ${expected}, al\u0131nan ${received}`;
      }
      case "invalid_value":
        if (issue2.values.length === 1)
          return `F\xE2sit giren: umulan ${stringifyPrimitive(issue2.values[0])}`;
        return `F\xE2sit tercih: m\xFBteberler ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `Fazla b\xFCy\xFCk: ${issue2.origin ?? "value"}, ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elements"} sahip olmal\u0131yd\u0131.`;
        return `Fazla b\xFCy\xFCk: ${issue2.origin ?? "value"}, ${adj}${issue2.maximum.toString()} olmal\u0131yd\u0131.`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `Fazla k\xFC\xE7\xFCk: ${issue2.origin}, ${adj}${issue2.minimum.toString()} ${sizing.unit} sahip olmal\u0131yd\u0131.`;
        }
        return `Fazla k\xFC\xE7\xFCk: ${issue2.origin}, ${adj}${issue2.minimum.toString()} olmal\u0131yd\u0131.`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `F\xE2sit metin: "${_issue.prefix}" ile ba\u015Flamal\u0131.`;
        if (_issue.format === "ends_with")
          return `F\xE2sit metin: "${_issue.suffix}" ile bitmeli.`;
        if (_issue.format === "includes")
          return `F\xE2sit metin: "${_issue.includes}" ihtiv\xE2 etmeli.`;
        if (_issue.format === "regex")
          return `F\xE2sit metin: ${_issue.pattern} nak\u015F\u0131na uymal\u0131.`;
        return `F\xE2sit ${FormatDictionary[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `F\xE2sit say\u0131: ${issue2.divisor} kat\u0131 olmal\u0131yd\u0131.`;
      case "unrecognized_keys":
        return `Tan\u0131nmayan anahtar ${issue2.keys.length > 1 ? "s" : ""}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `${issue2.origin} i\xE7in tan\u0131nmayan anahtar var.`;
      case "invalid_union":
        return "Giren tan\u0131namad\u0131.";
      case "invalid_element":
        return `${issue2.origin} i\xE7in tan\u0131nmayan k\u0131ymet var.`;
      default:
        return `K\u0131ymet tan\u0131namad\u0131.`;
    }
  };
};
function ota_default() {
  return {
    localeError: error31()
  };
}

// ../../node_modules/zod/v4/locales/ps.js
var error32 = () => {
  const Sizable = {
    string: { unit: "\u062A\u0648\u06A9\u064A", verb: "\u0648\u0644\u0631\u064A" },
    file: { unit: "\u0628\u0627\u06CC\u067C\u0633", verb: "\u0648\u0644\u0631\u064A" },
    array: { unit: "\u062A\u0648\u06A9\u064A", verb: "\u0648\u0644\u0631\u064A" },
    set: { unit: "\u062A\u0648\u06A9\u064A", verb: "\u0648\u0644\u0631\u064A" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "\u0648\u0631\u0648\u062F\u064A",
    email: "\u0628\u0631\u06CC\u069A\u0646\u0627\u0644\u06CC\u06A9",
    url: "\u06CC\u0648 \u0622\u0631 \u0627\u0644",
    emoji: "\u0627\u06CC\u0645\u0648\u062C\u064A",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "\u0646\u06CC\u067C\u0647 \u0627\u0648 \u0648\u062E\u062A",
    date: "\u0646\u06D0\u067C\u0647",
    time: "\u0648\u062E\u062A",
    duration: "\u0645\u0648\u062F\u0647",
    ipv4: "\u062F IPv4 \u067E\u062A\u0647",
    ipv6: "\u062F IPv6 \u067E\u062A\u0647",
    cidrv4: "\u062F IPv4 \u0633\u0627\u062D\u0647",
    cidrv6: "\u062F IPv6 \u0633\u0627\u062D\u0647",
    base64: "base64-encoded \u0645\u062A\u0646",
    base64url: "base64url-encoded \u0645\u062A\u0646",
    json_string: "JSON \u0645\u062A\u0646",
    e164: "\u062F E.164 \u0634\u0645\u06D0\u0631\u0647",
    jwt: "JWT",
    template_literal: "\u0648\u0631\u0648\u062F\u064A"
  };
  const TypeDictionary = {
    nan: "NaN",
    number: "\u0639\u062F\u062F",
    array: "\u0627\u0631\u06D0"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        if (/^[A-Z]/.test(issue2.expected)) {
          return `\u0646\u0627\u0633\u0645 \u0648\u0631\u0648\u062F\u064A: \u0628\u0627\u06CC\u062F instanceof ${issue2.expected} \u0648\u0627\u06CC, \u0645\u06AB\u0631 ${received} \u062A\u0631\u0644\u0627\u0633\u0647 \u0634\u0648`;
        }
        return `\u0646\u0627\u0633\u0645 \u0648\u0631\u0648\u062F\u064A: \u0628\u0627\u06CC\u062F ${expected} \u0648\u0627\u06CC, \u0645\u06AB\u0631 ${received} \u062A\u0631\u0644\u0627\u0633\u0647 \u0634\u0648`;
      }
      case "invalid_value":
        if (issue2.values.length === 1) {
          return `\u0646\u0627\u0633\u0645 \u0648\u0631\u0648\u062F\u064A: \u0628\u0627\u06CC\u062F ${stringifyPrimitive(issue2.values[0])} \u0648\u0627\u06CC`;
        }
        return `\u0646\u0627\u0633\u0645 \u0627\u0646\u062A\u062E\u0627\u0628: \u0628\u0627\u06CC\u062F \u06CC\u0648 \u0644\u0647 ${joinValues(issue2.values, "|")} \u0685\u062E\u0647 \u0648\u0627\u06CC`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `\u0689\u06CC\u0631 \u0644\u0648\u06CC: ${issue2.origin ?? "\u0627\u0631\u0632\u069A\u062A"} \u0628\u0627\u06CC\u062F ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "\u0639\u0646\u0635\u0631\u0648\u0646\u0647"} \u0648\u0644\u0631\u064A`;
        }
        return `\u0689\u06CC\u0631 \u0644\u0648\u06CC: ${issue2.origin ?? "\u0627\u0631\u0632\u069A\u062A"} \u0628\u0627\u06CC\u062F ${adj}${issue2.maximum.toString()} \u0648\u064A`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `\u0689\u06CC\u0631 \u06A9\u0648\u0686\u0646\u06CC: ${issue2.origin} \u0628\u0627\u06CC\u062F ${adj}${issue2.minimum.toString()} ${sizing.unit} \u0648\u0644\u0631\u064A`;
        }
        return `\u0689\u06CC\u0631 \u06A9\u0648\u0686\u0646\u06CC: ${issue2.origin} \u0628\u0627\u06CC\u062F ${adj}${issue2.minimum.toString()} \u0648\u064A`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with") {
          return `\u0646\u0627\u0633\u0645 \u0645\u062A\u0646: \u0628\u0627\u06CC\u062F \u062F "${_issue.prefix}" \u0633\u0631\u0647 \u067E\u06CC\u0644 \u0634\u064A`;
        }
        if (_issue.format === "ends_with") {
          return `\u0646\u0627\u0633\u0645 \u0645\u062A\u0646: \u0628\u0627\u06CC\u062F \u062F "${_issue.suffix}" \u0633\u0631\u0647 \u067E\u0627\u06CC \u062A\u0647 \u0648\u0631\u0633\u064A\u0696\u064A`;
        }
        if (_issue.format === "includes") {
          return `\u0646\u0627\u0633\u0645 \u0645\u062A\u0646: \u0628\u0627\u06CC\u062F "${_issue.includes}" \u0648\u0644\u0631\u064A`;
        }
        if (_issue.format === "regex") {
          return `\u0646\u0627\u0633\u0645 \u0645\u062A\u0646: \u0628\u0627\u06CC\u062F \u062F ${_issue.pattern} \u0633\u0631\u0647 \u0645\u0637\u0627\u0628\u0642\u062A \u0648\u0644\u0631\u064A`;
        }
        return `${FormatDictionary[_issue.format] ?? issue2.format} \u0646\u0627\u0633\u0645 \u062F\u06CC`;
      }
      case "not_multiple_of":
        return `\u0646\u0627\u0633\u0645 \u0639\u062F\u062F: \u0628\u0627\u06CC\u062F \u062F ${issue2.divisor} \u0645\u0636\u0631\u0628 \u0648\u064A`;
      case "unrecognized_keys":
        return `\u0646\u0627\u0633\u0645 ${issue2.keys.length > 1 ? "\u06A9\u0644\u06CC\u0689\u0648\u0646\u0647" : "\u06A9\u0644\u06CC\u0689"}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `\u0646\u0627\u0633\u0645 \u06A9\u0644\u06CC\u0689 \u067E\u0647 ${issue2.origin} \u06A9\u06D0`;
      case "invalid_union":
        return `\u0646\u0627\u0633\u0645\u0647 \u0648\u0631\u0648\u062F\u064A`;
      case "invalid_element":
        return `\u0646\u0627\u0633\u0645 \u0639\u0646\u0635\u0631 \u067E\u0647 ${issue2.origin} \u06A9\u06D0`;
      default:
        return `\u0646\u0627\u0633\u0645\u0647 \u0648\u0631\u0648\u062F\u064A`;
    }
  };
};
function ps_default() {
  return {
    localeError: error32()
  };
}

// ../../node_modules/zod/v4/locales/pl.js
var error33 = () => {
  const Sizable = {
    string: { unit: "znak\xF3w", verb: "mie\u0107" },
    file: { unit: "bajt\xF3w", verb: "mie\u0107" },
    array: { unit: "element\xF3w", verb: "mie\u0107" },
    set: { unit: "element\xF3w", verb: "mie\u0107" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "wyra\u017Cenie",
    email: "adres email",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "data i godzina w formacie ISO",
    date: "data w formacie ISO",
    time: "godzina w formacie ISO",
    duration: "czas trwania ISO",
    ipv4: "adres IPv4",
    ipv6: "adres IPv6",
    cidrv4: "zakres IPv4",
    cidrv6: "zakres IPv6",
    base64: "ci\u0105g znak\xF3w zakodowany w formacie base64",
    base64url: "ci\u0105g znak\xF3w zakodowany w formacie base64url",
    json_string: "ci\u0105g znak\xF3w w formacie JSON",
    e164: "liczba E.164",
    jwt: "JWT",
    template_literal: "wej\u015Bcie"
  };
  const TypeDictionary = {
    nan: "NaN",
    number: "liczba",
    array: "tablica"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        if (/^[A-Z]/.test(issue2.expected)) {
          return `Nieprawid\u0142owe dane wej\u015Bciowe: oczekiwano instanceof ${issue2.expected}, otrzymano ${received}`;
        }
        return `Nieprawid\u0142owe dane wej\u015Bciowe: oczekiwano ${expected}, otrzymano ${received}`;
      }
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Nieprawid\u0142owe dane wej\u015Bciowe: oczekiwano ${stringifyPrimitive(issue2.values[0])}`;
        return `Nieprawid\u0142owa opcja: oczekiwano jednej z warto\u015Bci ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `Za du\u017Ca warto\u015B\u0107: oczekiwano, \u017Ce ${issue2.origin ?? "warto\u015B\u0107"} b\u0119dzie mie\u0107 ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "element\xF3w"}`;
        }
        return `Zbyt du\u017C(y/a/e): oczekiwano, \u017Ce ${issue2.origin ?? "warto\u015B\u0107"} b\u0119dzie wynosi\u0107 ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `Za ma\u0142a warto\u015B\u0107: oczekiwano, \u017Ce ${issue2.origin ?? "warto\u015B\u0107"} b\u0119dzie mie\u0107 ${adj}${issue2.minimum.toString()} ${sizing.unit ?? "element\xF3w"}`;
        }
        return `Zbyt ma\u0142(y/a/e): oczekiwano, \u017Ce ${issue2.origin ?? "warto\u015B\u0107"} b\u0119dzie wynosi\u0107 ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `Nieprawid\u0142owy ci\u0105g znak\xF3w: musi zaczyna\u0107 si\u0119 od "${_issue.prefix}"`;
        if (_issue.format === "ends_with")
          return `Nieprawid\u0142owy ci\u0105g znak\xF3w: musi ko\u0144czy\u0107 si\u0119 na "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `Nieprawid\u0142owy ci\u0105g znak\xF3w: musi zawiera\u0107 "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `Nieprawid\u0142owy ci\u0105g znak\xF3w: musi odpowiada\u0107 wzorcowi ${_issue.pattern}`;
        return `Nieprawid\u0142ow(y/a/e) ${FormatDictionary[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `Nieprawid\u0142owa liczba: musi by\u0107 wielokrotno\u015Bci\u0105 ${issue2.divisor}`;
      case "unrecognized_keys":
        return `Nierozpoznane klucze${issue2.keys.length > 1 ? "s" : ""}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `Nieprawid\u0142owy klucz w ${issue2.origin}`;
      case "invalid_union":
        return "Nieprawid\u0142owe dane wej\u015Bciowe";
      case "invalid_element":
        return `Nieprawid\u0142owa warto\u015B\u0107 w ${issue2.origin}`;
      default:
        return `Nieprawid\u0142owe dane wej\u015Bciowe`;
    }
  };
};
function pl_default() {
  return {
    localeError: error33()
  };
}

// ../../node_modules/zod/v4/locales/pt.js
var error34 = () => {
  const Sizable = {
    string: { unit: "caracteres", verb: "ter" },
    file: { unit: "bytes", verb: "ter" },
    array: { unit: "itens", verb: "ter" },
    set: { unit: "itens", verb: "ter" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "padr\xE3o",
    email: "endere\xE7o de e-mail",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "data e hora ISO",
    date: "data ISO",
    time: "hora ISO",
    duration: "dura\xE7\xE3o ISO",
    ipv4: "endere\xE7o IPv4",
    ipv6: "endere\xE7o IPv6",
    cidrv4: "faixa de IPv4",
    cidrv6: "faixa de IPv6",
    base64: "texto codificado em base64",
    base64url: "URL codificada em base64",
    json_string: "texto JSON",
    e164: "n\xFAmero E.164",
    jwt: "JWT",
    template_literal: "entrada"
  };
  const TypeDictionary = {
    nan: "NaN",
    number: "n\xFAmero",
    null: "nulo"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        if (/^[A-Z]/.test(issue2.expected)) {
          return `Tipo inv\xE1lido: esperado instanceof ${issue2.expected}, recebido ${received}`;
        }
        return `Tipo inv\xE1lido: esperado ${expected}, recebido ${received}`;
      }
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Entrada inv\xE1lida: esperado ${stringifyPrimitive(issue2.values[0])}`;
        return `Op\xE7\xE3o inv\xE1lida: esperada uma das ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `Muito grande: esperado que ${issue2.origin ?? "valor"} tivesse ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elementos"}`;
        return `Muito grande: esperado que ${issue2.origin ?? "valor"} fosse ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `Muito pequeno: esperado que ${issue2.origin} tivesse ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `Muito pequeno: esperado que ${issue2.origin} fosse ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `Texto inv\xE1lido: deve come\xE7ar com "${_issue.prefix}"`;
        if (_issue.format === "ends_with")
          return `Texto inv\xE1lido: deve terminar com "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `Texto inv\xE1lido: deve incluir "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `Texto inv\xE1lido: deve corresponder ao padr\xE3o ${_issue.pattern}`;
        return `${FormatDictionary[_issue.format] ?? issue2.format} inv\xE1lido`;
      }
      case "not_multiple_of":
        return `N\xFAmero inv\xE1lido: deve ser m\xFAltiplo de ${issue2.divisor}`;
      case "unrecognized_keys":
        return `Chave${issue2.keys.length > 1 ? "s" : ""} desconhecida${issue2.keys.length > 1 ? "s" : ""}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `Chave inv\xE1lida em ${issue2.origin}`;
      case "invalid_union":
        return "Entrada inv\xE1lida";
      case "invalid_element":
        return `Valor inv\xE1lido em ${issue2.origin}`;
      default:
        return `Campo inv\xE1lido`;
    }
  };
};
function pt_default() {
  return {
    localeError: error34()
  };
}

// ../../node_modules/zod/v4/locales/ru.js
function getRussianPlural(count, one, few, many) {
  const absCount = Math.abs(count);
  const lastDigit = absCount % 10;
  const lastTwoDigits = absCount % 100;
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return many;
  }
  if (lastDigit === 1) {
    return one;
  }
  if (lastDigit >= 2 && lastDigit <= 4) {
    return few;
  }
  return many;
}
var error35 = () => {
  const Sizable = {
    string: {
      unit: {
        one: "\u0441\u0438\u043C\u0432\u043E\u043B",
        few: "\u0441\u0438\u043C\u0432\u043E\u043B\u0430",
        many: "\u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432"
      },
      verb: "\u0438\u043C\u0435\u0442\u044C"
    },
    file: {
      unit: {
        one: "\u0431\u0430\u0439\u0442",
        few: "\u0431\u0430\u0439\u0442\u0430",
        many: "\u0431\u0430\u0439\u0442"
      },
      verb: "\u0438\u043C\u0435\u0442\u044C"
    },
    array: {
      unit: {
        one: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442",
        few: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u0430",
        many: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u043E\u0432"
      },
      verb: "\u0438\u043C\u0435\u0442\u044C"
    },
    set: {
      unit: {
        one: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442",
        few: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u0430",
        many: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u043E\u0432"
      },
      verb: "\u0438\u043C\u0435\u0442\u044C"
    }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "\u0432\u0432\u043E\u0434",
    email: "email \u0430\u0434\u0440\u0435\u0441",
    url: "URL",
    emoji: "\u044D\u043C\u043E\u0434\u0437\u0438",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO \u0434\u0430\u0442\u0430 \u0438 \u0432\u0440\u0435\u043C\u044F",
    date: "ISO \u0434\u0430\u0442\u0430",
    time: "ISO \u0432\u0440\u0435\u043C\u044F",
    duration: "ISO \u0434\u043B\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C",
    ipv4: "IPv4 \u0430\u0434\u0440\u0435\u0441",
    ipv6: "IPv6 \u0430\u0434\u0440\u0435\u0441",
    cidrv4: "IPv4 \u0434\u0438\u0430\u043F\u0430\u0437\u043E\u043D",
    cidrv6: "IPv6 \u0434\u0438\u0430\u043F\u0430\u0437\u043E\u043D",
    base64: "\u0441\u0442\u0440\u043E\u043A\u0430 \u0432 \u0444\u043E\u0440\u043C\u0430\u0442\u0435 base64",
    base64url: "\u0441\u0442\u0440\u043E\u043A\u0430 \u0432 \u0444\u043E\u0440\u043C\u0430\u0442\u0435 base64url",
    json_string: "JSON \u0441\u0442\u0440\u043E\u043A\u0430",
    e164: "\u043D\u043E\u043C\u0435\u0440 E.164",
    jwt: "JWT",
    template_literal: "\u0432\u0432\u043E\u0434"
  };
  const TypeDictionary = {
    nan: "NaN",
    number: "\u0447\u0438\u0441\u043B\u043E",
    array: "\u043C\u0430\u0441\u0441\u0438\u0432"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        if (/^[A-Z]/.test(issue2.expected)) {
          return `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u0432\u0432\u043E\u0434: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C instanceof ${issue2.expected}, \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u043E ${received}`;
        }
        return `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u0432\u0432\u043E\u0434: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C ${expected}, \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u043E ${received}`;
      }
      case "invalid_value":
        if (issue2.values.length === 1)
          return `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u0432\u0432\u043E\u0434: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C ${stringifyPrimitive(issue2.values[0])}`;
        return `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u0432\u0430\u0440\u0438\u0430\u043D\u0442: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C \u043E\u0434\u043D\u043E \u0438\u0437 ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          const maxValue = Number(issue2.maximum);
          const unit = getRussianPlural(maxValue, sizing.unit.one, sizing.unit.few, sizing.unit.many);
          return `\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u0431\u043E\u043B\u044C\u0448\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C, \u0447\u0442\u043E ${issue2.origin ?? "\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435"} \u0431\u0443\u0434\u0435\u0442 \u0438\u043C\u0435\u0442\u044C ${adj}${issue2.maximum.toString()} ${unit}`;
        }
        return `\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u0431\u043E\u043B\u044C\u0448\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C, \u0447\u0442\u043E ${issue2.origin ?? "\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435"} \u0431\u0443\u0434\u0435\u0442 ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          const minValue = Number(issue2.minimum);
          const unit = getRussianPlural(minValue, sizing.unit.one, sizing.unit.few, sizing.unit.many);
          return `\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u043C\u0430\u043B\u0435\u043D\u044C\u043A\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C, \u0447\u0442\u043E ${issue2.origin} \u0431\u0443\u0434\u0435\u0442 \u0438\u043C\u0435\u0442\u044C ${adj}${issue2.minimum.toString()} ${unit}`;
        }
        return `\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u043C\u0430\u043B\u0435\u043D\u044C\u043A\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C, \u0447\u0442\u043E ${issue2.origin} \u0431\u0443\u0434\u0435\u0442 ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `\u041D\u0435\u0432\u0435\u0440\u043D\u0430\u044F \u0441\u0442\u0440\u043E\u043A\u0430: \u0434\u043E\u043B\u0436\u043D\u0430 \u043D\u0430\u0447\u0438\u043D\u0430\u0442\u044C\u0441\u044F \u0441 "${_issue.prefix}"`;
        if (_issue.format === "ends_with")
          return `\u041D\u0435\u0432\u0435\u0440\u043D\u0430\u044F \u0441\u0442\u0440\u043E\u043A\u0430: \u0434\u043E\u043B\u0436\u043D\u0430 \u0437\u0430\u043A\u0430\u043D\u0447\u0438\u0432\u0430\u0442\u044C\u0441\u044F \u043D\u0430 "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `\u041D\u0435\u0432\u0435\u0440\u043D\u0430\u044F \u0441\u0442\u0440\u043E\u043A\u0430: \u0434\u043E\u043B\u0436\u043D\u0430 \u0441\u043E\u0434\u0435\u0440\u0436\u0430\u0442\u044C "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `\u041D\u0435\u0432\u0435\u0440\u043D\u0430\u044F \u0441\u0442\u0440\u043E\u043A\u0430: \u0434\u043E\u043B\u0436\u043D\u0430 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u043E\u0432\u0430\u0442\u044C \u0448\u0430\u0431\u043B\u043E\u043D\u0443 ${_issue.pattern}`;
        return `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 ${FormatDictionary[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `\u041D\u0435\u0432\u0435\u0440\u043D\u043E\u0435 \u0447\u0438\u0441\u043B\u043E: \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u043A\u0440\u0430\u0442\u043D\u044B\u043C ${issue2.divisor}`;
      case "unrecognized_keys":
        return `\u041D\u0435\u0440\u0430\u0441\u043F\u043E\u0437\u043D\u0430\u043D\u043D${issue2.keys.length > 1 ? "\u044B\u0435" : "\u044B\u0439"} \u043A\u043B\u044E\u0447${issue2.keys.length > 1 ? "\u0438" : ""}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u043A\u043B\u044E\u0447 \u0432 ${issue2.origin}`;
      case "invalid_union":
        return "\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0435 \u0432\u0445\u043E\u0434\u043D\u044B\u0435 \u0434\u0430\u043D\u043D\u044B\u0435";
      case "invalid_element":
        return `\u041D\u0435\u0432\u0435\u0440\u043D\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435 \u0432 ${issue2.origin}`;
      default:
        return `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0435 \u0432\u0445\u043E\u0434\u043D\u044B\u0435 \u0434\u0430\u043D\u043D\u044B\u0435`;
    }
  };
};
function ru_default() {
  return {
    localeError: error35()
  };
}

// ../../node_modules/zod/v4/locales/sl.js
var error36 = () => {
  const Sizable = {
    string: { unit: "znakov", verb: "imeti" },
    file: { unit: "bajtov", verb: "imeti" },
    array: { unit: "elementov", verb: "imeti" },
    set: { unit: "elementov", verb: "imeti" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "vnos",
    email: "e-po\u0161tni naslov",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO datum in \u010Das",
    date: "ISO datum",
    time: "ISO \u010Das",
    duration: "ISO trajanje",
    ipv4: "IPv4 naslov",
    ipv6: "IPv6 naslov",
    cidrv4: "obseg IPv4",
    cidrv6: "obseg IPv6",
    base64: "base64 kodiran niz",
    base64url: "base64url kodiran niz",
    json_string: "JSON niz",
    e164: "E.164 \u0161tevilka",
    jwt: "JWT",
    template_literal: "vnos"
  };
  const TypeDictionary = {
    nan: "NaN",
    number: "\u0161tevilo",
    array: "tabela"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        if (/^[A-Z]/.test(issue2.expected)) {
          return `Neveljaven vnos: pri\u010Dakovano instanceof ${issue2.expected}, prejeto ${received}`;
        }
        return `Neveljaven vnos: pri\u010Dakovano ${expected}, prejeto ${received}`;
      }
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Neveljaven vnos: pri\u010Dakovano ${stringifyPrimitive(issue2.values[0])}`;
        return `Neveljavna mo\u017Enost: pri\u010Dakovano eno izmed ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `Preveliko: pri\u010Dakovano, da bo ${issue2.origin ?? "vrednost"} imelo ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elementov"}`;
        return `Preveliko: pri\u010Dakovano, da bo ${issue2.origin ?? "vrednost"} ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `Premajhno: pri\u010Dakovano, da bo ${issue2.origin} imelo ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `Premajhno: pri\u010Dakovano, da bo ${issue2.origin} ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with") {
          return `Neveljaven niz: mora se za\u010Deti z "${_issue.prefix}"`;
        }
        if (_issue.format === "ends_with")
          return `Neveljaven niz: mora se kon\u010Dati z "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `Neveljaven niz: mora vsebovati "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `Neveljaven niz: mora ustrezati vzorcu ${_issue.pattern}`;
        return `Neveljaven ${FormatDictionary[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `Neveljavno \u0161tevilo: mora biti ve\u010Dkratnik ${issue2.divisor}`;
      case "unrecognized_keys":
        return `Neprepoznan${issue2.keys.length > 1 ? "i klju\u010Di" : " klju\u010D"}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `Neveljaven klju\u010D v ${issue2.origin}`;
      case "invalid_union":
        return "Neveljaven vnos";
      case "invalid_element":
        return `Neveljavna vrednost v ${issue2.origin}`;
      default:
        return "Neveljaven vnos";
    }
  };
};
function sl_default() {
  return {
    localeError: error36()
  };
}

// ../../node_modules/zod/v4/locales/sv.js
var error37 = () => {
  const Sizable = {
    string: { unit: "tecken", verb: "att ha" },
    file: { unit: "bytes", verb: "att ha" },
    array: { unit: "objekt", verb: "att inneh\xE5lla" },
    set: { unit: "objekt", verb: "att inneh\xE5lla" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "regulj\xE4rt uttryck",
    email: "e-postadress",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO-datum och tid",
    date: "ISO-datum",
    time: "ISO-tid",
    duration: "ISO-varaktighet",
    ipv4: "IPv4-intervall",
    ipv6: "IPv6-intervall",
    cidrv4: "IPv4-spektrum",
    cidrv6: "IPv6-spektrum",
    base64: "base64-kodad str\xE4ng",
    base64url: "base64url-kodad str\xE4ng",
    json_string: "JSON-str\xE4ng",
    e164: "E.164-nummer",
    jwt: "JWT",
    template_literal: "mall-literal"
  };
  const TypeDictionary = {
    nan: "NaN",
    number: "antal",
    array: "lista"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        if (/^[A-Z]/.test(issue2.expected)) {
          return `Ogiltig inmatning: f\xF6rv\xE4ntat instanceof ${issue2.expected}, fick ${received}`;
        }
        return `Ogiltig inmatning: f\xF6rv\xE4ntat ${expected}, fick ${received}`;
      }
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Ogiltig inmatning: f\xF6rv\xE4ntat ${stringifyPrimitive(issue2.values[0])}`;
        return `Ogiltigt val: f\xF6rv\xE4ntade en av ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `F\xF6r stor(t): f\xF6rv\xE4ntade ${issue2.origin ?? "v\xE4rdet"} att ha ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "element"}`;
        }
        return `F\xF6r stor(t): f\xF6rv\xE4ntat ${issue2.origin ?? "v\xE4rdet"} att ha ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `F\xF6r lite(t): f\xF6rv\xE4ntade ${issue2.origin ?? "v\xE4rdet"} att ha ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `F\xF6r lite(t): f\xF6rv\xE4ntade ${issue2.origin ?? "v\xE4rdet"} att ha ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with") {
          return `Ogiltig str\xE4ng: m\xE5ste b\xF6rja med "${_issue.prefix}"`;
        }
        if (_issue.format === "ends_with")
          return `Ogiltig str\xE4ng: m\xE5ste sluta med "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `Ogiltig str\xE4ng: m\xE5ste inneh\xE5lla "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `Ogiltig str\xE4ng: m\xE5ste matcha m\xF6nstret "${_issue.pattern}"`;
        return `Ogiltig(t) ${FormatDictionary[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `Ogiltigt tal: m\xE5ste vara en multipel av ${issue2.divisor}`;
      case "unrecognized_keys":
        return `${issue2.keys.length > 1 ? "Ok\xE4nda nycklar" : "Ok\xE4nd nyckel"}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `Ogiltig nyckel i ${issue2.origin ?? "v\xE4rdet"}`;
      case "invalid_union":
        return "Ogiltig input";
      case "invalid_element":
        return `Ogiltigt v\xE4rde i ${issue2.origin ?? "v\xE4rdet"}`;
      default:
        return `Ogiltig input`;
    }
  };
};
function sv_default() {
  return {
    localeError: error37()
  };
}

// ../../node_modules/zod/v4/locales/ta.js
var error38 = () => {
  const Sizable = {
    string: { unit: "\u0B8E\u0BB4\u0BC1\u0BA4\u0BCD\u0BA4\u0BC1\u0B95\u0BCD\u0B95\u0BB3\u0BCD", verb: "\u0B95\u0BCA\u0BA3\u0BCD\u0B9F\u0BBF\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD" },
    file: { unit: "\u0BAA\u0BC8\u0B9F\u0BCD\u0B9F\u0BC1\u0B95\u0BB3\u0BCD", verb: "\u0B95\u0BCA\u0BA3\u0BCD\u0B9F\u0BBF\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD" },
    array: { unit: "\u0B89\u0BB1\u0BC1\u0BAA\u0BCD\u0BAA\u0BC1\u0B95\u0BB3\u0BCD", verb: "\u0B95\u0BCA\u0BA3\u0BCD\u0B9F\u0BBF\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD" },
    set: { unit: "\u0B89\u0BB1\u0BC1\u0BAA\u0BCD\u0BAA\u0BC1\u0B95\u0BB3\u0BCD", verb: "\u0B95\u0BCA\u0BA3\u0BCD\u0B9F\u0BBF\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "\u0B89\u0BB3\u0BCD\u0BB3\u0BC0\u0B9F\u0BC1",
    email: "\u0BAE\u0BBF\u0BA9\u0BCD\u0BA9\u0B9E\u0BCD\u0B9A\u0BB2\u0BCD \u0BAE\u0BC1\u0B95\u0BB5\u0BB0\u0BBF",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO \u0BA4\u0BC7\u0BA4\u0BBF \u0BA8\u0BC7\u0BB0\u0BAE\u0BCD",
    date: "ISO \u0BA4\u0BC7\u0BA4\u0BBF",
    time: "ISO \u0BA8\u0BC7\u0BB0\u0BAE\u0BCD",
    duration: "ISO \u0B95\u0BBE\u0BB2 \u0B85\u0BB3\u0BB5\u0BC1",
    ipv4: "IPv4 \u0BAE\u0BC1\u0B95\u0BB5\u0BB0\u0BBF",
    ipv6: "IPv6 \u0BAE\u0BC1\u0B95\u0BB5\u0BB0\u0BBF",
    cidrv4: "IPv4 \u0BB5\u0BB0\u0BAE\u0BCD\u0BAA\u0BC1",
    cidrv6: "IPv6 \u0BB5\u0BB0\u0BAE\u0BCD\u0BAA\u0BC1",
    base64: "base64-encoded \u0B9A\u0BB0\u0BAE\u0BCD",
    base64url: "base64url-encoded \u0B9A\u0BB0\u0BAE\u0BCD",
    json_string: "JSON \u0B9A\u0BB0\u0BAE\u0BCD",
    e164: "E.164 \u0B8E\u0BA3\u0BCD",
    jwt: "JWT",
    template_literal: "input"
  };
  const TypeDictionary = {
    nan: "NaN",
    number: "\u0B8E\u0BA3\u0BCD",
    array: "\u0B85\u0BA3\u0BBF",
    null: "\u0BB5\u0BC6\u0BB1\u0BC1\u0BAE\u0BC8"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        if (/^[A-Z]/.test(issue2.expected)) {
          return `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B89\u0BB3\u0BCD\u0BB3\u0BC0\u0B9F\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 instanceof ${issue2.expected}, \u0BAA\u0BC6\u0BB1\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${received}`;
        }
        return `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B89\u0BB3\u0BCD\u0BB3\u0BC0\u0B9F\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${expected}, \u0BAA\u0BC6\u0BB1\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${received}`;
      }
      case "invalid_value":
        if (issue2.values.length === 1)
          return `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B89\u0BB3\u0BCD\u0BB3\u0BC0\u0B9F\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${stringifyPrimitive(issue2.values[0])}`;
        return `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0BB5\u0BBF\u0BB0\u0BC1\u0BAA\u0BCD\u0BAA\u0BAE\u0BCD: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${joinValues(issue2.values, "|")} \u0B87\u0BB2\u0BCD \u0B92\u0BA9\u0BCD\u0BB1\u0BC1`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `\u0BAE\u0BBF\u0B95 \u0BAA\u0BC6\u0BB0\u0BBF\u0BAF\u0BA4\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${issue2.origin ?? "\u0BAE\u0BA4\u0BBF\u0BAA\u0BCD\u0BAA\u0BC1"} ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "\u0B89\u0BB1\u0BC1\u0BAA\u0BCD\u0BAA\u0BC1\u0B95\u0BB3\u0BCD"} \u0B86\u0B95 \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`;
        }
        return `\u0BAE\u0BBF\u0B95 \u0BAA\u0BC6\u0BB0\u0BBF\u0BAF\u0BA4\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${issue2.origin ?? "\u0BAE\u0BA4\u0BBF\u0BAA\u0BCD\u0BAA\u0BC1"} ${adj}${issue2.maximum.toString()} \u0B86\u0B95 \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `\u0BAE\u0BBF\u0B95\u0B9A\u0BCD \u0B9A\u0BBF\u0BB1\u0BBF\u0BAF\u0BA4\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${issue2.origin} ${adj}${issue2.minimum.toString()} ${sizing.unit} \u0B86\u0B95 \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`;
        }
        return `\u0BAE\u0BBF\u0B95\u0B9A\u0BCD \u0B9A\u0BBF\u0BB1\u0BBF\u0BAF\u0BA4\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${issue2.origin} ${adj}${issue2.minimum.toString()} \u0B86\u0B95 \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B9A\u0BB0\u0BAE\u0BCD: "${_issue.prefix}" \u0B87\u0BB2\u0BCD \u0BA4\u0BCA\u0B9F\u0B99\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`;
        if (_issue.format === "ends_with")
          return `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B9A\u0BB0\u0BAE\u0BCD: "${_issue.suffix}" \u0B87\u0BB2\u0BCD \u0BAE\u0BC1\u0B9F\u0BBF\u0BB5\u0B9F\u0BC8\u0BAF \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`;
        if (_issue.format === "includes")
          return `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B9A\u0BB0\u0BAE\u0BCD: "${_issue.includes}" \u0B90 \u0B89\u0BB3\u0BCD\u0BB3\u0B9F\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`;
        if (_issue.format === "regex")
          return `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B9A\u0BB0\u0BAE\u0BCD: ${_issue.pattern} \u0BAE\u0BC1\u0BB1\u0BC8\u0BAA\u0BBE\u0B9F\u0BCD\u0B9F\u0BC1\u0B9F\u0BA9\u0BCD \u0BAA\u0BCA\u0BB0\u0BC1\u0BA8\u0BCD\u0BA4 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`;
        return `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 ${FormatDictionary[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B8E\u0BA3\u0BCD: ${issue2.divisor} \u0B87\u0BA9\u0BCD \u0BAA\u0BB2\u0BAE\u0BBE\u0B95 \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`;
      case "unrecognized_keys":
        return `\u0B85\u0B9F\u0BC8\u0BAF\u0BBE\u0BB3\u0BAE\u0BCD \u0BA4\u0BC6\u0BB0\u0BBF\u0BAF\u0BBE\u0BA4 \u0BB5\u0BBF\u0B9A\u0BC8${issue2.keys.length > 1 ? "\u0B95\u0BB3\u0BCD" : ""}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `${issue2.origin} \u0B87\u0BB2\u0BCD \u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0BB5\u0BBF\u0B9A\u0BC8`;
      case "invalid_union":
        return "\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B89\u0BB3\u0BCD\u0BB3\u0BC0\u0B9F\u0BC1";
      case "invalid_element":
        return `${issue2.origin} \u0B87\u0BB2\u0BCD \u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0BAE\u0BA4\u0BBF\u0BAA\u0BCD\u0BAA\u0BC1`;
      default:
        return `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B89\u0BB3\u0BCD\u0BB3\u0BC0\u0B9F\u0BC1`;
    }
  };
};
function ta_default() {
  return {
    localeError: error38()
  };
}

// ../../node_modules/zod/v4/locales/th.js
var error39 = () => {
  const Sizable = {
    string: { unit: "\u0E15\u0E31\u0E27\u0E2D\u0E31\u0E01\u0E29\u0E23", verb: "\u0E04\u0E27\u0E23\u0E21\u0E35" },
    file: { unit: "\u0E44\u0E1A\u0E15\u0E4C", verb: "\u0E04\u0E27\u0E23\u0E21\u0E35" },
    array: { unit: "\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23", verb: "\u0E04\u0E27\u0E23\u0E21\u0E35" },
    set: { unit: "\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23", verb: "\u0E04\u0E27\u0E23\u0E21\u0E35" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E17\u0E35\u0E48\u0E1B\u0E49\u0E2D\u0E19",
    email: "\u0E17\u0E35\u0E48\u0E2D\u0E22\u0E39\u0E48\u0E2D\u0E35\u0E40\u0E21\u0E25",
    url: "URL",
    emoji: "\u0E2D\u0E34\u0E42\u0E21\u0E08\u0E34",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48\u0E40\u0E27\u0E25\u0E32\u0E41\u0E1A\u0E1A ISO",
    date: "\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48\u0E41\u0E1A\u0E1A ISO",
    time: "\u0E40\u0E27\u0E25\u0E32\u0E41\u0E1A\u0E1A ISO",
    duration: "\u0E0A\u0E48\u0E27\u0E07\u0E40\u0E27\u0E25\u0E32\u0E41\u0E1A\u0E1A ISO",
    ipv4: "\u0E17\u0E35\u0E48\u0E2D\u0E22\u0E39\u0E48 IPv4",
    ipv6: "\u0E17\u0E35\u0E48\u0E2D\u0E22\u0E39\u0E48 IPv6",
    cidrv4: "\u0E0A\u0E48\u0E27\u0E07 IP \u0E41\u0E1A\u0E1A IPv4",
    cidrv6: "\u0E0A\u0E48\u0E27\u0E07 IP \u0E41\u0E1A\u0E1A IPv6",
    base64: "\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E41\u0E1A\u0E1A Base64",
    base64url: "\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E41\u0E1A\u0E1A Base64 \u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A URL",
    json_string: "\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E41\u0E1A\u0E1A JSON",
    e164: "\u0E40\u0E1A\u0E2D\u0E23\u0E4C\u0E42\u0E17\u0E23\u0E28\u0E31\u0E1E\u0E17\u0E4C\u0E23\u0E30\u0E2B\u0E27\u0E48\u0E32\u0E07\u0E1B\u0E23\u0E30\u0E40\u0E17\u0E28 (E.164)",
    jwt: "\u0E42\u0E17\u0E40\u0E04\u0E19 JWT",
    template_literal: "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E17\u0E35\u0E48\u0E1B\u0E49\u0E2D\u0E19"
  };
  const TypeDictionary = {
    nan: "NaN",
    number: "\u0E15\u0E31\u0E27\u0E40\u0E25\u0E02",
    array: "\u0E2D\u0E32\u0E23\u0E4C\u0E40\u0E23\u0E22\u0E4C (Array)",
    null: "\u0E44\u0E21\u0E48\u0E21\u0E35\u0E04\u0E48\u0E32 (null)"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        if (/^[A-Z]/.test(issue2.expected)) {
          return `\u0E1B\u0E23\u0E30\u0E40\u0E20\u0E17\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E04\u0E27\u0E23\u0E40\u0E1B\u0E47\u0E19 instanceof ${issue2.expected} \u0E41\u0E15\u0E48\u0E44\u0E14\u0E49\u0E23\u0E31\u0E1A ${received}`;
        }
        return `\u0E1B\u0E23\u0E30\u0E40\u0E20\u0E17\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E04\u0E27\u0E23\u0E40\u0E1B\u0E47\u0E19 ${expected} \u0E41\u0E15\u0E48\u0E44\u0E14\u0E49\u0E23\u0E31\u0E1A ${received}`;
      }
      case "invalid_value":
        if (issue2.values.length === 1)
          return `\u0E04\u0E48\u0E32\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E04\u0E27\u0E23\u0E40\u0E1B\u0E47\u0E19 ${stringifyPrimitive(issue2.values[0])}`;
        return `\u0E15\u0E31\u0E27\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E04\u0E27\u0E23\u0E40\u0E1B\u0E47\u0E19\u0E2B\u0E19\u0E36\u0E48\u0E07\u0E43\u0E19 ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "\u0E44\u0E21\u0E48\u0E40\u0E01\u0E34\u0E19" : "\u0E19\u0E49\u0E2D\u0E22\u0E01\u0E27\u0E48\u0E32";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `\u0E40\u0E01\u0E34\u0E19\u0E01\u0E33\u0E2B\u0E19\u0E14: ${issue2.origin ?? "\u0E04\u0E48\u0E32"} \u0E04\u0E27\u0E23\u0E21\u0E35${adj} ${issue2.maximum.toString()} ${sizing.unit ?? "\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23"}`;
        return `\u0E40\u0E01\u0E34\u0E19\u0E01\u0E33\u0E2B\u0E19\u0E14: ${issue2.origin ?? "\u0E04\u0E48\u0E32"} \u0E04\u0E27\u0E23\u0E21\u0E35${adj} ${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? "\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E19\u0E49\u0E2D\u0E22" : "\u0E21\u0E32\u0E01\u0E01\u0E27\u0E48\u0E32";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `\u0E19\u0E49\u0E2D\u0E22\u0E01\u0E27\u0E48\u0E32\u0E01\u0E33\u0E2B\u0E19\u0E14: ${issue2.origin} \u0E04\u0E27\u0E23\u0E21\u0E35${adj} ${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `\u0E19\u0E49\u0E2D\u0E22\u0E01\u0E27\u0E48\u0E32\u0E01\u0E33\u0E2B\u0E19\u0E14: ${issue2.origin} \u0E04\u0E27\u0E23\u0E21\u0E35${adj} ${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with") {
          return `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E15\u0E49\u0E2D\u0E07\u0E02\u0E36\u0E49\u0E19\u0E15\u0E49\u0E19\u0E14\u0E49\u0E27\u0E22 "${_issue.prefix}"`;
        }
        if (_issue.format === "ends_with")
          return `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E15\u0E49\u0E2D\u0E07\u0E25\u0E07\u0E17\u0E49\u0E32\u0E22\u0E14\u0E49\u0E27\u0E22 "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E15\u0E49\u0E2D\u0E07\u0E21\u0E35 "${_issue.includes}" \u0E2D\u0E22\u0E39\u0E48\u0E43\u0E19\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21`;
        if (_issue.format === "regex")
          return `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E15\u0E49\u0E2D\u0E07\u0E15\u0E23\u0E07\u0E01\u0E31\u0E1A\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E17\u0E35\u0E48\u0E01\u0E33\u0E2B\u0E19\u0E14 ${_issue.pattern}`;
        return `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: ${FormatDictionary[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `\u0E15\u0E31\u0E27\u0E40\u0E25\u0E02\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E15\u0E49\u0E2D\u0E07\u0E40\u0E1B\u0E47\u0E19\u0E08\u0E33\u0E19\u0E27\u0E19\u0E17\u0E35\u0E48\u0E2B\u0E32\u0E23\u0E14\u0E49\u0E27\u0E22 ${issue2.divisor} \u0E44\u0E14\u0E49\u0E25\u0E07\u0E15\u0E31\u0E27`;
      case "unrecognized_keys":
        return `\u0E1E\u0E1A\u0E04\u0E35\u0E22\u0E4C\u0E17\u0E35\u0E48\u0E44\u0E21\u0E48\u0E23\u0E39\u0E49\u0E08\u0E31\u0E01: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `\u0E04\u0E35\u0E22\u0E4C\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07\u0E43\u0E19 ${issue2.origin}`;
      case "invalid_union":
        return "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E44\u0E21\u0E48\u0E15\u0E23\u0E07\u0E01\u0E31\u0E1A\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E22\u0E39\u0E40\u0E19\u0E35\u0E22\u0E19\u0E17\u0E35\u0E48\u0E01\u0E33\u0E2B\u0E19\u0E14\u0E44\u0E27\u0E49";
      case "invalid_element":
        return `\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07\u0E43\u0E19 ${issue2.origin}`;
      default:
        return `\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07`;
    }
  };
};
function th_default() {
  return {
    localeError: error39()
  };
}

// ../../node_modules/zod/v4/locales/tr.js
var error40 = () => {
  const Sizable = {
    string: { unit: "karakter", verb: "olmal\u0131" },
    file: { unit: "bayt", verb: "olmal\u0131" },
    array: { unit: "\xF6\u011Fe", verb: "olmal\u0131" },
    set: { unit: "\xF6\u011Fe", verb: "olmal\u0131" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "girdi",
    email: "e-posta adresi",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO tarih ve saat",
    date: "ISO tarih",
    time: "ISO saat",
    duration: "ISO s\xFCre",
    ipv4: "IPv4 adresi",
    ipv6: "IPv6 adresi",
    cidrv4: "IPv4 aral\u0131\u011F\u0131",
    cidrv6: "IPv6 aral\u0131\u011F\u0131",
    base64: "base64 ile \u015Fifrelenmi\u015F metin",
    base64url: "base64url ile \u015Fifrelenmi\u015F metin",
    json_string: "JSON dizesi",
    e164: "E.164 say\u0131s\u0131",
    jwt: "JWT",
    template_literal: "\u015Eablon dizesi"
  };
  const TypeDictionary = {
    nan: "NaN"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        if (/^[A-Z]/.test(issue2.expected)) {
          return `Ge\xE7ersiz de\u011Fer: beklenen instanceof ${issue2.expected}, al\u0131nan ${received}`;
        }
        return `Ge\xE7ersiz de\u011Fer: beklenen ${expected}, al\u0131nan ${received}`;
      }
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Ge\xE7ersiz de\u011Fer: beklenen ${stringifyPrimitive(issue2.values[0])}`;
        return `Ge\xE7ersiz se\xE7enek: a\u015Fa\u011F\u0131dakilerden biri olmal\u0131: ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `\xC7ok b\xFCy\xFCk: beklenen ${issue2.origin ?? "de\u011Fer"} ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "\xF6\u011Fe"}`;
        return `\xC7ok b\xFCy\xFCk: beklenen ${issue2.origin ?? "de\u011Fer"} ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `\xC7ok k\xFC\xE7\xFCk: beklenen ${issue2.origin} ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        return `\xC7ok k\xFC\xE7\xFCk: beklenen ${issue2.origin} ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `Ge\xE7ersiz metin: "${_issue.prefix}" ile ba\u015Flamal\u0131`;
        if (_issue.format === "ends_with")
          return `Ge\xE7ersiz metin: "${_issue.suffix}" ile bitmeli`;
        if (_issue.format === "includes")
          return `Ge\xE7ersiz metin: "${_issue.includes}" i\xE7ermeli`;
        if (_issue.format === "regex")
          return `Ge\xE7ersiz metin: ${_issue.pattern} desenine uymal\u0131`;
        return `Ge\xE7ersiz ${FormatDictionary[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `Ge\xE7ersiz say\u0131: ${issue2.divisor} ile tam b\xF6l\xFCnebilmeli`;
      case "unrecognized_keys":
        return `Tan\u0131nmayan anahtar${issue2.keys.length > 1 ? "lar" : ""}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `${issue2.origin} i\xE7inde ge\xE7ersiz anahtar`;
      case "invalid_union":
        return "Ge\xE7ersiz de\u011Fer";
      case "invalid_element":
        return `${issue2.origin} i\xE7inde ge\xE7ersiz de\u011Fer`;
      default:
        return `Ge\xE7ersiz de\u011Fer`;
    }
  };
};
function tr_default() {
  return {
    localeError: error40()
  };
}

// ../../node_modules/zod/v4/locales/uk.js
var error41 = () => {
  const Sizable = {
    string: { unit: "\u0441\u0438\u043C\u0432\u043E\u043B\u0456\u0432", verb: "\u043C\u0430\u0442\u0438\u043C\u0435" },
    file: { unit: "\u0431\u0430\u0439\u0442\u0456\u0432", verb: "\u043C\u0430\u0442\u0438\u043C\u0435" },
    array: { unit: "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0456\u0432", verb: "\u043C\u0430\u0442\u0438\u043C\u0435" },
    set: { unit: "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0456\u0432", verb: "\u043C\u0430\u0442\u0438\u043C\u0435" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "\u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456",
    email: "\u0430\u0434\u0440\u0435\u0441\u0430 \u0435\u043B\u0435\u043A\u0442\u0440\u043E\u043D\u043D\u043E\u0457 \u043F\u043E\u0448\u0442\u0438",
    url: "URL",
    emoji: "\u0435\u043C\u043E\u0434\u0437\u0456",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "\u0434\u0430\u0442\u0430 \u0442\u0430 \u0447\u0430\u0441 ISO",
    date: "\u0434\u0430\u0442\u0430 ISO",
    time: "\u0447\u0430\u0441 ISO",
    duration: "\u0442\u0440\u0438\u0432\u0430\u043B\u0456\u0441\u0442\u044C ISO",
    ipv4: "\u0430\u0434\u0440\u0435\u0441\u0430 IPv4",
    ipv6: "\u0430\u0434\u0440\u0435\u0441\u0430 IPv6",
    cidrv4: "\u0434\u0456\u0430\u043F\u0430\u0437\u043E\u043D IPv4",
    cidrv6: "\u0434\u0456\u0430\u043F\u0430\u0437\u043E\u043D IPv6",
    base64: "\u0440\u044F\u0434\u043E\u043A \u0443 \u043A\u043E\u0434\u0443\u0432\u0430\u043D\u043D\u0456 base64",
    base64url: "\u0440\u044F\u0434\u043E\u043A \u0443 \u043A\u043E\u0434\u0443\u0432\u0430\u043D\u043D\u0456 base64url",
    json_string: "\u0440\u044F\u0434\u043E\u043A JSON",
    e164: "\u043D\u043E\u043C\u0435\u0440 E.164",
    jwt: "JWT",
    template_literal: "\u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456"
  };
  const TypeDictionary = {
    nan: "NaN",
    number: "\u0447\u0438\u0441\u043B\u043E",
    array: "\u043C\u0430\u0441\u0438\u0432"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        if (/^[A-Z]/.test(issue2.expected)) {
          return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0456 \u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F instanceof ${issue2.expected}, \u043E\u0442\u0440\u0438\u043C\u0430\u043D\u043E ${received}`;
        }
        return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0456 \u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F ${expected}, \u043E\u0442\u0440\u0438\u043C\u0430\u043D\u043E ${received}`;
      }
      case "invalid_value":
        if (issue2.values.length === 1)
          return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0456 \u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F ${stringifyPrimitive(issue2.values[0])}`;
        return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0430 \u043E\u043F\u0446\u0456\u044F: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F \u043E\u0434\u043D\u0435 \u0437 ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `\u0417\u0430\u043D\u0430\u0434\u0442\u043E \u0432\u0435\u043B\u0438\u043A\u0435: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F, \u0449\u043E ${issue2.origin ?? "\u0437\u043D\u0430\u0447\u0435\u043D\u043D\u044F"} ${sizing.verb} ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0456\u0432"}`;
        return `\u0417\u0430\u043D\u0430\u0434\u0442\u043E \u0432\u0435\u043B\u0438\u043A\u0435: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F, \u0449\u043E ${issue2.origin ?? "\u0437\u043D\u0430\u0447\u0435\u043D\u043D\u044F"} \u0431\u0443\u0434\u0435 ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `\u0417\u0430\u043D\u0430\u0434\u0442\u043E \u043C\u0430\u043B\u0435: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F, \u0449\u043E ${issue2.origin} ${sizing.verb} ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `\u0417\u0430\u043D\u0430\u0434\u0442\u043E \u043C\u0430\u043B\u0435: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F, \u0449\u043E ${issue2.origin} \u0431\u0443\u0434\u0435 ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 \u0440\u044F\u0434\u043E\u043A: \u043F\u043E\u0432\u0438\u043D\u0435\u043D \u043F\u043E\u0447\u0438\u043D\u0430\u0442\u0438\u0441\u044F \u0437 "${_issue.prefix}"`;
        if (_issue.format === "ends_with")
          return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 \u0440\u044F\u0434\u043E\u043A: \u043F\u043E\u0432\u0438\u043D\u0435\u043D \u0437\u0430\u043A\u0456\u043D\u0447\u0443\u0432\u0430\u0442\u0438\u0441\u044F \u043D\u0430 "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 \u0440\u044F\u0434\u043E\u043A: \u043F\u043E\u0432\u0438\u043D\u0435\u043D \u043C\u0456\u0441\u0442\u0438\u0442\u0438 "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 \u0440\u044F\u0434\u043E\u043A: \u043F\u043E\u0432\u0438\u043D\u0435\u043D \u0432\u0456\u0434\u043F\u043E\u0432\u0456\u0434\u0430\u0442\u0438 \u0448\u0430\u0431\u043B\u043E\u043D\u0443 ${_issue.pattern}`;
        return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 ${FormatDictionary[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0435 \u0447\u0438\u0441\u043B\u043E: \u043F\u043E\u0432\u0438\u043D\u043D\u043E \u0431\u0443\u0442\u0438 \u043A\u0440\u0430\u0442\u043D\u0438\u043C ${issue2.divisor}`;
      case "unrecognized_keys":
        return `\u041D\u0435\u0440\u043E\u0437\u043F\u0456\u0437\u043D\u0430\u043D\u0438\u0439 \u043A\u043B\u044E\u0447${issue2.keys.length > 1 ? "\u0456" : ""}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 \u043A\u043B\u044E\u0447 \u0443 ${issue2.origin}`;
      case "invalid_union":
        return "\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0456 \u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456";
      case "invalid_element":
        return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u043D\u044F \u0443 ${issue2.origin}`;
      default:
        return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0456 \u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456`;
    }
  };
};
function uk_default() {
  return {
    localeError: error41()
  };
}

// ../../node_modules/zod/v4/locales/ua.js
function ua_default() {
  return uk_default();
}

// ../../node_modules/zod/v4/locales/ur.js
var error42 = () => {
  const Sizable = {
    string: { unit: "\u062D\u0631\u0648\u0641", verb: "\u06C1\u0648\u0646\u0627" },
    file: { unit: "\u0628\u0627\u0626\u0679\u0633", verb: "\u06C1\u0648\u0646\u0627" },
    array: { unit: "\u0622\u0626\u0679\u0645\u0632", verb: "\u06C1\u0648\u0646\u0627" },
    set: { unit: "\u0622\u0626\u0679\u0645\u0632", verb: "\u06C1\u0648\u0646\u0627" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "\u0627\u0646 \u067E\u0679",
    email: "\u0627\u06CC \u0645\u06CC\u0644 \u0627\u06CC\u0688\u0631\u06CC\u0633",
    url: "\u06CC\u0648 \u0622\u0631 \u0627\u06CC\u0644",
    emoji: "\u0627\u06CC\u0645\u0648\u062C\u06CC",
    uuid: "\u06CC\u0648 \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC",
    uuidv4: "\u06CC\u0648 \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC \u0648\u06CC 4",
    uuidv6: "\u06CC\u0648 \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC \u0648\u06CC 6",
    nanoid: "\u0646\u06CC\u0646\u0648 \u0622\u0626\u06CC \u0688\u06CC",
    guid: "\u062C\u06CC \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC",
    cuid: "\u0633\u06CC \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC",
    cuid2: "\u0633\u06CC \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC 2",
    ulid: "\u06CC\u0648 \u0627\u06CC\u0644 \u0622\u0626\u06CC \u0688\u06CC",
    xid: "\u0627\u06CC\u06A9\u0633 \u0622\u0626\u06CC \u0688\u06CC",
    ksuid: "\u06A9\u06D2 \u0627\u06CC\u0633 \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC",
    datetime: "\u0622\u0626\u06CC \u0627\u06CC\u0633 \u0627\u0648 \u0688\u06CC\u0679 \u0679\u0627\u0626\u0645",
    date: "\u0622\u0626\u06CC \u0627\u06CC\u0633 \u0627\u0648 \u062A\u0627\u0631\u06CC\u062E",
    time: "\u0622\u0626\u06CC \u0627\u06CC\u0633 \u0627\u0648 \u0648\u0642\u062A",
    duration: "\u0622\u0626\u06CC \u0627\u06CC\u0633 \u0627\u0648 \u0645\u062F\u062A",
    ipv4: "\u0622\u0626\u06CC \u067E\u06CC \u0648\u06CC 4 \u0627\u06CC\u0688\u0631\u06CC\u0633",
    ipv6: "\u0622\u0626\u06CC \u067E\u06CC \u0648\u06CC 6 \u0627\u06CC\u0688\u0631\u06CC\u0633",
    cidrv4: "\u0622\u0626\u06CC \u067E\u06CC \u0648\u06CC 4 \u0631\u06CC\u0646\u062C",
    cidrv6: "\u0622\u0626\u06CC \u067E\u06CC \u0648\u06CC 6 \u0631\u06CC\u0646\u062C",
    base64: "\u0628\u06CC\u0633 64 \u0627\u0646 \u06A9\u0648\u0688\u0688 \u0633\u0679\u0631\u0646\u06AF",
    base64url: "\u0628\u06CC\u0633 64 \u06CC\u0648 \u0622\u0631 \u0627\u06CC\u0644 \u0627\u0646 \u06A9\u0648\u0688\u0688 \u0633\u0679\u0631\u0646\u06AF",
    json_string: "\u062C\u06D2 \u0627\u06CC\u0633 \u0627\u0648 \u0627\u06CC\u0646 \u0633\u0679\u0631\u0646\u06AF",
    e164: "\u0627\u06CC 164 \u0646\u0645\u0628\u0631",
    jwt: "\u062C\u06D2 \u0688\u0628\u0644\u06CC\u0648 \u0679\u06CC",
    template_literal: "\u0627\u0646 \u067E\u0679"
  };
  const TypeDictionary = {
    nan: "NaN",
    number: "\u0646\u0645\u0628\u0631",
    array: "\u0622\u0631\u06D2",
    null: "\u0646\u0644"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        if (/^[A-Z]/.test(issue2.expected)) {
          return `\u063A\u0644\u0637 \u0627\u0646 \u067E\u0679: instanceof ${issue2.expected} \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627\u060C ${received} \u0645\u0648\u0635\u0648\u0644 \u06C1\u0648\u0627`;
        }
        return `\u063A\u0644\u0637 \u0627\u0646 \u067E\u0679: ${expected} \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627\u060C ${received} \u0645\u0648\u0635\u0648\u0644 \u06C1\u0648\u0627`;
      }
      case "invalid_value":
        if (issue2.values.length === 1)
          return `\u063A\u0644\u0637 \u0627\u0646 \u067E\u0679: ${stringifyPrimitive(issue2.values[0])} \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627`;
        return `\u063A\u0644\u0637 \u0622\u067E\u0634\u0646: ${joinValues(issue2.values, "|")} \u0645\u06CC\u06BA \u0633\u06D2 \u0627\u06CC\u06A9 \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `\u0628\u06C1\u062A \u0628\u0691\u0627: ${issue2.origin ?? "\u0648\u06CC\u0644\u06CC\u0648"} \u06A9\u06D2 ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "\u0639\u0646\u0627\u0635\u0631"} \u06C1\u0648\u0646\u06D2 \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u06D2`;
        return `\u0628\u06C1\u062A \u0628\u0691\u0627: ${issue2.origin ?? "\u0648\u06CC\u0644\u06CC\u0648"} \u06A9\u0627 ${adj}${issue2.maximum.toString()} \u06C1\u0648\u0646\u0627 \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `\u0628\u06C1\u062A \u0686\u06BE\u0648\u0679\u0627: ${issue2.origin} \u06A9\u06D2 ${adj}${issue2.minimum.toString()} ${sizing.unit} \u06C1\u0648\u0646\u06D2 \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u06D2`;
        }
        return `\u0628\u06C1\u062A \u0686\u06BE\u0648\u0679\u0627: ${issue2.origin} \u06A9\u0627 ${adj}${issue2.minimum.toString()} \u06C1\u0648\u0646\u0627 \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with") {
          return `\u063A\u0644\u0637 \u0633\u0679\u0631\u0646\u06AF: "${_issue.prefix}" \u0633\u06D2 \u0634\u0631\u0648\u0639 \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2`;
        }
        if (_issue.format === "ends_with")
          return `\u063A\u0644\u0637 \u0633\u0679\u0631\u0646\u06AF: "${_issue.suffix}" \u067E\u0631 \u062E\u062A\u0645 \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2`;
        if (_issue.format === "includes")
          return `\u063A\u0644\u0637 \u0633\u0679\u0631\u0646\u06AF: "${_issue.includes}" \u0634\u0627\u0645\u0644 \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2`;
        if (_issue.format === "regex")
          return `\u063A\u0644\u0637 \u0633\u0679\u0631\u0646\u06AF: \u067E\u06CC\u0679\u0631\u0646 ${_issue.pattern} \u0633\u06D2 \u0645\u06CC\u0686 \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2`;
        return `\u063A\u0644\u0637 ${FormatDictionary[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `\u063A\u0644\u0637 \u0646\u0645\u0628\u0631: ${issue2.divisor} \u06A9\u0627 \u0645\u0636\u0627\u0639\u0641 \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2`;
      case "unrecognized_keys":
        return `\u063A\u06CC\u0631 \u062A\u0633\u0644\u06CC\u0645 \u0634\u062F\u06C1 \u06A9\u06CC${issue2.keys.length > 1 ? "\u0632" : ""}: ${joinValues(issue2.keys, "\u060C ")}`;
      case "invalid_key":
        return `${issue2.origin} \u0645\u06CC\u06BA \u063A\u0644\u0637 \u06A9\u06CC`;
      case "invalid_union":
        return "\u063A\u0644\u0637 \u0627\u0646 \u067E\u0679";
      case "invalid_element":
        return `${issue2.origin} \u0645\u06CC\u06BA \u063A\u0644\u0637 \u0648\u06CC\u0644\u06CC\u0648`;
      default:
        return `\u063A\u0644\u0637 \u0627\u0646 \u067E\u0679`;
    }
  };
};
function ur_default() {
  return {
    localeError: error42()
  };
}

// ../../node_modules/zod/v4/locales/uz.js
var error43 = () => {
  const Sizable = {
    string: { unit: "belgi", verb: "bo\u2018lishi kerak" },
    file: { unit: "bayt", verb: "bo\u2018lishi kerak" },
    array: { unit: "element", verb: "bo\u2018lishi kerak" },
    set: { unit: "element", verb: "bo\u2018lishi kerak" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "kirish",
    email: "elektron pochta manzili",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO sana va vaqti",
    date: "ISO sana",
    time: "ISO vaqt",
    duration: "ISO davomiylik",
    ipv4: "IPv4 manzil",
    ipv6: "IPv6 manzil",
    mac: "MAC manzil",
    cidrv4: "IPv4 diapazon",
    cidrv6: "IPv6 diapazon",
    base64: "base64 kodlangan satr",
    base64url: "base64url kodlangan satr",
    json_string: "JSON satr",
    e164: "E.164 raqam",
    jwt: "JWT",
    template_literal: "kirish"
  };
  const TypeDictionary = {
    nan: "NaN",
    number: "raqam",
    array: "massiv"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        if (/^[A-Z]/.test(issue2.expected)) {
          return `Noto\u2018g\u2018ri kirish: kutilgan instanceof ${issue2.expected}, qabul qilingan ${received}`;
        }
        return `Noto\u2018g\u2018ri kirish: kutilgan ${expected}, qabul qilingan ${received}`;
      }
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Noto\u2018g\u2018ri kirish: kutilgan ${stringifyPrimitive(issue2.values[0])}`;
        return `Noto\u2018g\u2018ri variant: quyidagilardan biri kutilgan ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `Juda katta: kutilgan ${issue2.origin ?? "qiymat"} ${adj}${issue2.maximum.toString()} ${sizing.unit} ${sizing.verb}`;
        return `Juda katta: kutilgan ${issue2.origin ?? "qiymat"} ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `Juda kichik: kutilgan ${issue2.origin} ${adj}${issue2.minimum.toString()} ${sizing.unit} ${sizing.verb}`;
        }
        return `Juda kichik: kutilgan ${issue2.origin} ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `Noto\u2018g\u2018ri satr: "${_issue.prefix}" bilan boshlanishi kerak`;
        if (_issue.format === "ends_with")
          return `Noto\u2018g\u2018ri satr: "${_issue.suffix}" bilan tugashi kerak`;
        if (_issue.format === "includes")
          return `Noto\u2018g\u2018ri satr: "${_issue.includes}" ni o\u2018z ichiga olishi kerak`;
        if (_issue.format === "regex")
          return `Noto\u2018g\u2018ri satr: ${_issue.pattern} shabloniga mos kelishi kerak`;
        return `Noto\u2018g\u2018ri ${FormatDictionary[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `Noto\u2018g\u2018ri raqam: ${issue2.divisor} ning karralisi bo\u2018lishi kerak`;
      case "unrecognized_keys":
        return `Noma\u2019lum kalit${issue2.keys.length > 1 ? "lar" : ""}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `${issue2.origin} dagi kalit noto\u2018g\u2018ri`;
      case "invalid_union":
        return "Noto\u2018g\u2018ri kirish";
      case "invalid_element":
        return `${issue2.origin} da noto\u2018g\u2018ri qiymat`;
      default:
        return `Noto\u2018g\u2018ri kirish`;
    }
  };
};
function uz_default() {
  return {
    localeError: error43()
  };
}

// ../../node_modules/zod/v4/locales/vi.js
var error44 = () => {
  const Sizable = {
    string: { unit: "k\xFD t\u1EF1", verb: "c\xF3" },
    file: { unit: "byte", verb: "c\xF3" },
    array: { unit: "ph\u1EA7n t\u1EED", verb: "c\xF3" },
    set: { unit: "ph\u1EA7n t\u1EED", verb: "c\xF3" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "\u0111\u1EA7u v\xE0o",
    email: "\u0111\u1ECBa ch\u1EC9 email",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ng\xE0y gi\u1EDD ISO",
    date: "ng\xE0y ISO",
    time: "gi\u1EDD ISO",
    duration: "kho\u1EA3ng th\u1EDDi gian ISO",
    ipv4: "\u0111\u1ECBa ch\u1EC9 IPv4",
    ipv6: "\u0111\u1ECBa ch\u1EC9 IPv6",
    cidrv4: "d\u1EA3i IPv4",
    cidrv6: "d\u1EA3i IPv6",
    base64: "chu\u1ED7i m\xE3 h\xF3a base64",
    base64url: "chu\u1ED7i m\xE3 h\xF3a base64url",
    json_string: "chu\u1ED7i JSON",
    e164: "s\u1ED1 E.164",
    jwt: "JWT",
    template_literal: "\u0111\u1EA7u v\xE0o"
  };
  const TypeDictionary = {
    nan: "NaN",
    number: "s\u1ED1",
    array: "m\u1EA3ng"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        if (/^[A-Z]/.test(issue2.expected)) {
          return `\u0110\u1EA7u v\xE0o kh\xF4ng h\u1EE3p l\u1EC7: mong \u0111\u1EE3i instanceof ${issue2.expected}, nh\u1EADn \u0111\u01B0\u1EE3c ${received}`;
        }
        return `\u0110\u1EA7u v\xE0o kh\xF4ng h\u1EE3p l\u1EC7: mong \u0111\u1EE3i ${expected}, nh\u1EADn \u0111\u01B0\u1EE3c ${received}`;
      }
      case "invalid_value":
        if (issue2.values.length === 1)
          return `\u0110\u1EA7u v\xE0o kh\xF4ng h\u1EE3p l\u1EC7: mong \u0111\u1EE3i ${stringifyPrimitive(issue2.values[0])}`;
        return `T\xF9y ch\u1ECDn kh\xF4ng h\u1EE3p l\u1EC7: mong \u0111\u1EE3i m\u1ED9t trong c\xE1c gi\xE1 tr\u1ECB ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `Qu\xE1 l\u1EDBn: mong \u0111\u1EE3i ${issue2.origin ?? "gi\xE1 tr\u1ECB"} ${sizing.verb} ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "ph\u1EA7n t\u1EED"}`;
        return `Qu\xE1 l\u1EDBn: mong \u0111\u1EE3i ${issue2.origin ?? "gi\xE1 tr\u1ECB"} ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `Qu\xE1 nh\u1ECF: mong \u0111\u1EE3i ${issue2.origin} ${sizing.verb} ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `Qu\xE1 nh\u1ECF: mong \u0111\u1EE3i ${issue2.origin} ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `Chu\u1ED7i kh\xF4ng h\u1EE3p l\u1EC7: ph\u1EA3i b\u1EAFt \u0111\u1EA7u b\u1EB1ng "${_issue.prefix}"`;
        if (_issue.format === "ends_with")
          return `Chu\u1ED7i kh\xF4ng h\u1EE3p l\u1EC7: ph\u1EA3i k\u1EBFt th\xFAc b\u1EB1ng "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `Chu\u1ED7i kh\xF4ng h\u1EE3p l\u1EC7: ph\u1EA3i bao g\u1ED3m "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `Chu\u1ED7i kh\xF4ng h\u1EE3p l\u1EC7: ph\u1EA3i kh\u1EDBp v\u1EDBi m\u1EABu ${_issue.pattern}`;
        return `${FormatDictionary[_issue.format] ?? issue2.format} kh\xF4ng h\u1EE3p l\u1EC7`;
      }
      case "not_multiple_of":
        return `S\u1ED1 kh\xF4ng h\u1EE3p l\u1EC7: ph\u1EA3i l\xE0 b\u1ED9i s\u1ED1 c\u1EE7a ${issue2.divisor}`;
      case "unrecognized_keys":
        return `Kh\xF3a kh\xF4ng \u0111\u01B0\u1EE3c nh\u1EADn d\u1EA1ng: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `Kh\xF3a kh\xF4ng h\u1EE3p l\u1EC7 trong ${issue2.origin}`;
      case "invalid_union":
        return "\u0110\u1EA7u v\xE0o kh\xF4ng h\u1EE3p l\u1EC7";
      case "invalid_element":
        return `Gi\xE1 tr\u1ECB kh\xF4ng h\u1EE3p l\u1EC7 trong ${issue2.origin}`;
      default:
        return `\u0110\u1EA7u v\xE0o kh\xF4ng h\u1EE3p l\u1EC7`;
    }
  };
};
function vi_default() {
  return {
    localeError: error44()
  };
}

// ../../node_modules/zod/v4/locales/zh-CN.js
var error45 = () => {
  const Sizable = {
    string: { unit: "\u5B57\u7B26", verb: "\u5305\u542B" },
    file: { unit: "\u5B57\u8282", verb: "\u5305\u542B" },
    array: { unit: "\u9879", verb: "\u5305\u542B" },
    set: { unit: "\u9879", verb: "\u5305\u542B" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "\u8F93\u5165",
    email: "\u7535\u5B50\u90AE\u4EF6",
    url: "URL",
    emoji: "\u8868\u60C5\u7B26\u53F7",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO\u65E5\u671F\u65F6\u95F4",
    date: "ISO\u65E5\u671F",
    time: "ISO\u65F6\u95F4",
    duration: "ISO\u65F6\u957F",
    ipv4: "IPv4\u5730\u5740",
    ipv6: "IPv6\u5730\u5740",
    cidrv4: "IPv4\u7F51\u6BB5",
    cidrv6: "IPv6\u7F51\u6BB5",
    base64: "base64\u7F16\u7801\u5B57\u7B26\u4E32",
    base64url: "base64url\u7F16\u7801\u5B57\u7B26\u4E32",
    json_string: "JSON\u5B57\u7B26\u4E32",
    e164: "E.164\u53F7\u7801",
    jwt: "JWT",
    template_literal: "\u8F93\u5165"
  };
  const TypeDictionary = {
    nan: "NaN",
    number: "\u6570\u5B57",
    array: "\u6570\u7EC4",
    null: "\u7A7A\u503C(null)"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        if (/^[A-Z]/.test(issue2.expected)) {
          return `\u65E0\u6548\u8F93\u5165\uFF1A\u671F\u671B instanceof ${issue2.expected}\uFF0C\u5B9E\u9645\u63A5\u6536 ${received}`;
        }
        return `\u65E0\u6548\u8F93\u5165\uFF1A\u671F\u671B ${expected}\uFF0C\u5B9E\u9645\u63A5\u6536 ${received}`;
      }
      case "invalid_value":
        if (issue2.values.length === 1)
          return `\u65E0\u6548\u8F93\u5165\uFF1A\u671F\u671B ${stringifyPrimitive(issue2.values[0])}`;
        return `\u65E0\u6548\u9009\u9879\uFF1A\u671F\u671B\u4EE5\u4E0B\u4E4B\u4E00 ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `\u6570\u503C\u8FC7\u5927\uFF1A\u671F\u671B ${issue2.origin ?? "\u503C"} ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "\u4E2A\u5143\u7D20"}`;
        return `\u6570\u503C\u8FC7\u5927\uFF1A\u671F\u671B ${issue2.origin ?? "\u503C"} ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `\u6570\u503C\u8FC7\u5C0F\uFF1A\u671F\u671B ${issue2.origin} ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `\u6570\u503C\u8FC7\u5C0F\uFF1A\u671F\u671B ${issue2.origin} ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `\u65E0\u6548\u5B57\u7B26\u4E32\uFF1A\u5FC5\u987B\u4EE5 "${_issue.prefix}" \u5F00\u5934`;
        if (_issue.format === "ends_with")
          return `\u65E0\u6548\u5B57\u7B26\u4E32\uFF1A\u5FC5\u987B\u4EE5 "${_issue.suffix}" \u7ED3\u5C3E`;
        if (_issue.format === "includes")
          return `\u65E0\u6548\u5B57\u7B26\u4E32\uFF1A\u5FC5\u987B\u5305\u542B "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `\u65E0\u6548\u5B57\u7B26\u4E32\uFF1A\u5FC5\u987B\u6EE1\u8DB3\u6B63\u5219\u8868\u8FBE\u5F0F ${_issue.pattern}`;
        return `\u65E0\u6548${FormatDictionary[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `\u65E0\u6548\u6570\u5B57\uFF1A\u5FC5\u987B\u662F ${issue2.divisor} \u7684\u500D\u6570`;
      case "unrecognized_keys":
        return `\u51FA\u73B0\u672A\u77E5\u7684\u952E(key): ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `${issue2.origin} \u4E2D\u7684\u952E(key)\u65E0\u6548`;
      case "invalid_union":
        return "\u65E0\u6548\u8F93\u5165";
      case "invalid_element":
        return `${issue2.origin} \u4E2D\u5305\u542B\u65E0\u6548\u503C(value)`;
      default:
        return `\u65E0\u6548\u8F93\u5165`;
    }
  };
};
function zh_CN_default() {
  return {
    localeError: error45()
  };
}

// ../../node_modules/zod/v4/locales/zh-TW.js
var error46 = () => {
  const Sizable = {
    string: { unit: "\u5B57\u5143", verb: "\u64C1\u6709" },
    file: { unit: "\u4F4D\u5143\u7D44", verb: "\u64C1\u6709" },
    array: { unit: "\u9805\u76EE", verb: "\u64C1\u6709" },
    set: { unit: "\u9805\u76EE", verb: "\u64C1\u6709" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "\u8F38\u5165",
    email: "\u90F5\u4EF6\u5730\u5740",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO \u65E5\u671F\u6642\u9593",
    date: "ISO \u65E5\u671F",
    time: "ISO \u6642\u9593",
    duration: "ISO \u671F\u9593",
    ipv4: "IPv4 \u4F4D\u5740",
    ipv6: "IPv6 \u4F4D\u5740",
    cidrv4: "IPv4 \u7BC4\u570D",
    cidrv6: "IPv6 \u7BC4\u570D",
    base64: "base64 \u7DE8\u78BC\u5B57\u4E32",
    base64url: "base64url \u7DE8\u78BC\u5B57\u4E32",
    json_string: "JSON \u5B57\u4E32",
    e164: "E.164 \u6578\u503C",
    jwt: "JWT",
    template_literal: "\u8F38\u5165"
  };
  const TypeDictionary = {
    nan: "NaN"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        if (/^[A-Z]/.test(issue2.expected)) {
          return `\u7121\u6548\u7684\u8F38\u5165\u503C\uFF1A\u9810\u671F\u70BA instanceof ${issue2.expected}\uFF0C\u4F46\u6536\u5230 ${received}`;
        }
        return `\u7121\u6548\u7684\u8F38\u5165\u503C\uFF1A\u9810\u671F\u70BA ${expected}\uFF0C\u4F46\u6536\u5230 ${received}`;
      }
      case "invalid_value":
        if (issue2.values.length === 1)
          return `\u7121\u6548\u7684\u8F38\u5165\u503C\uFF1A\u9810\u671F\u70BA ${stringifyPrimitive(issue2.values[0])}`;
        return `\u7121\u6548\u7684\u9078\u9805\uFF1A\u9810\u671F\u70BA\u4EE5\u4E0B\u5176\u4E2D\u4E4B\u4E00 ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `\u6578\u503C\u904E\u5927\uFF1A\u9810\u671F ${issue2.origin ?? "\u503C"} \u61C9\u70BA ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "\u500B\u5143\u7D20"}`;
        return `\u6578\u503C\u904E\u5927\uFF1A\u9810\u671F ${issue2.origin ?? "\u503C"} \u61C9\u70BA ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `\u6578\u503C\u904E\u5C0F\uFF1A\u9810\u671F ${issue2.origin} \u61C9\u70BA ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `\u6578\u503C\u904E\u5C0F\uFF1A\u9810\u671F ${issue2.origin} \u61C9\u70BA ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with") {
          return `\u7121\u6548\u7684\u5B57\u4E32\uFF1A\u5FC5\u9808\u4EE5 "${_issue.prefix}" \u958B\u982D`;
        }
        if (_issue.format === "ends_with")
          return `\u7121\u6548\u7684\u5B57\u4E32\uFF1A\u5FC5\u9808\u4EE5 "${_issue.suffix}" \u7D50\u5C3E`;
        if (_issue.format === "includes")
          return `\u7121\u6548\u7684\u5B57\u4E32\uFF1A\u5FC5\u9808\u5305\u542B "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `\u7121\u6548\u7684\u5B57\u4E32\uFF1A\u5FC5\u9808\u7B26\u5408\u683C\u5F0F ${_issue.pattern}`;
        return `\u7121\u6548\u7684 ${FormatDictionary[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `\u7121\u6548\u7684\u6578\u5B57\uFF1A\u5FC5\u9808\u70BA ${issue2.divisor} \u7684\u500D\u6578`;
      case "unrecognized_keys":
        return `\u7121\u6CD5\u8B58\u5225\u7684\u9375\u503C${issue2.keys.length > 1 ? "\u5011" : ""}\uFF1A${joinValues(issue2.keys, "\u3001")}`;
      case "invalid_key":
        return `${issue2.origin} \u4E2D\u6709\u7121\u6548\u7684\u9375\u503C`;
      case "invalid_union":
        return "\u7121\u6548\u7684\u8F38\u5165\u503C";
      case "invalid_element":
        return `${issue2.origin} \u4E2D\u6709\u7121\u6548\u7684\u503C`;
      default:
        return `\u7121\u6548\u7684\u8F38\u5165\u503C`;
    }
  };
};
function zh_TW_default() {
  return {
    localeError: error46()
  };
}

// ../../node_modules/zod/v4/locales/yo.js
var error47 = () => {
  const Sizable = {
    string: { unit: "\xE0mi", verb: "n\xED" },
    file: { unit: "bytes", verb: "n\xED" },
    array: { unit: "nkan", verb: "n\xED" },
    set: { unit: "nkan", verb: "n\xED" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "\u1EB9\u0300r\u1ECD \xECb\xE1w\u1ECDl\xE9",
    email: "\xE0d\xEDr\u1EB9\u0301s\xEC \xECm\u1EB9\u0301l\xEC",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "\xE0k\xF3k\xF2 ISO",
    date: "\u1ECDj\u1ECD\u0301 ISO",
    time: "\xE0k\xF3k\xF2 ISO",
    duration: "\xE0k\xF3k\xF2 t\xF3 p\xE9 ISO",
    ipv4: "\xE0d\xEDr\u1EB9\u0301s\xEC IPv4",
    ipv6: "\xE0d\xEDr\u1EB9\u0301s\xEC IPv6",
    cidrv4: "\xE0gb\xE8gb\xE8 IPv4",
    cidrv6: "\xE0gb\xE8gb\xE8 IPv6",
    base64: "\u1ECD\u0300r\u1ECD\u0300 t\xED a k\u1ECD\u0301 n\xED base64",
    base64url: "\u1ECD\u0300r\u1ECD\u0300 base64url",
    json_string: "\u1ECD\u0300r\u1ECD\u0300 JSON",
    e164: "n\u1ECD\u0301mb\xE0 E.164",
    jwt: "JWT",
    template_literal: "\u1EB9\u0300r\u1ECD \xECb\xE1w\u1ECDl\xE9"
  };
  const TypeDictionary = {
    nan: "NaN",
    number: "n\u1ECD\u0301mb\xE0",
    array: "akop\u1ECD"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = TypeDictionary[issue2.expected] ?? issue2.expected;
        const receivedType = parsedType(issue2.input);
        const received = TypeDictionary[receivedType] ?? receivedType;
        if (/^[A-Z]/.test(issue2.expected)) {
          return `\xCCb\xE1w\u1ECDl\xE9 a\u1E63\xEC\u1E63e: a n\xED l\xE1ti fi instanceof ${issue2.expected}, \xE0m\u1ECD\u0300 a r\xED ${received}`;
        }
        return `\xCCb\xE1w\u1ECDl\xE9 a\u1E63\xEC\u1E63e: a n\xED l\xE1ti fi ${expected}, \xE0m\u1ECD\u0300 a r\xED ${received}`;
      }
      case "invalid_value":
        if (issue2.values.length === 1)
          return `\xCCb\xE1w\u1ECDl\xE9 a\u1E63\xEC\u1E63e: a n\xED l\xE1ti fi ${stringifyPrimitive(issue2.values[0])}`;
        return `\xC0\u1E63\xE0y\xE0n a\u1E63\xEC\u1E63e: yan \u1ECD\u0300kan l\xE1ra ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `T\xF3 p\u1ECD\u0300 j\xF9: a n\xED l\xE1ti j\u1EB9\u0301 p\xE9 ${issue2.origin ?? "iye"} ${sizing.verb} ${adj}${issue2.maximum} ${sizing.unit}`;
        return `T\xF3 p\u1ECD\u0300 j\xF9: a n\xED l\xE1ti j\u1EB9\u0301 ${adj}${issue2.maximum}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `K\xE9r\xE9 ju: a n\xED l\xE1ti j\u1EB9\u0301 p\xE9 ${issue2.origin} ${sizing.verb} ${adj}${issue2.minimum} ${sizing.unit}`;
        return `K\xE9r\xE9 ju: a n\xED l\xE1ti j\u1EB9\u0301 ${adj}${issue2.minimum}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `\u1ECC\u0300r\u1ECD\u0300 a\u1E63\xEC\u1E63e: gb\u1ECD\u0301d\u1ECD\u0300 b\u1EB9\u0300r\u1EB9\u0300 p\u1EB9\u0300l\xFA "${_issue.prefix}"`;
        if (_issue.format === "ends_with")
          return `\u1ECC\u0300r\u1ECD\u0300 a\u1E63\xEC\u1E63e: gb\u1ECD\u0301d\u1ECD\u0300 par\xED p\u1EB9\u0300l\xFA "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `\u1ECC\u0300r\u1ECD\u0300 a\u1E63\xEC\u1E63e: gb\u1ECD\u0301d\u1ECD\u0300 n\xED "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `\u1ECC\u0300r\u1ECD\u0300 a\u1E63\xEC\u1E63e: gb\u1ECD\u0301d\u1ECD\u0300 b\xE1 \xE0p\u1EB9\u1EB9r\u1EB9 mu ${_issue.pattern}`;
        return `A\u1E63\xEC\u1E63e: ${FormatDictionary[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `N\u1ECD\u0301mb\xE0 a\u1E63\xEC\u1E63e: gb\u1ECD\u0301d\u1ECD\u0300 j\u1EB9\u0301 \xE8y\xE0 p\xEDp\xEDn ti ${issue2.divisor}`;
      case "unrecognized_keys":
        return `B\u1ECDt\xECn\xEC \xE0\xECm\u1ECD\u0300: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `B\u1ECDt\xECn\xEC a\u1E63\xEC\u1E63e n\xEDn\xFA ${issue2.origin}`;
      case "invalid_union":
        return "\xCCb\xE1w\u1ECDl\xE9 a\u1E63\xEC\u1E63e";
      case "invalid_element":
        return `Iye a\u1E63\xEC\u1E63e n\xEDn\xFA ${issue2.origin}`;
      default:
        return "\xCCb\xE1w\u1ECDl\xE9 a\u1E63\xEC\u1E63e";
    }
  };
};
function yo_default() {
  return {
    localeError: error47()
  };
}

// ../../node_modules/zod/v4/core/registries.js
var _a;
var $output = Symbol("ZodOutput");
var $input = Symbol("ZodInput");
var $ZodRegistry = class {
  constructor() {
    this._map = /* @__PURE__ */ new WeakMap();
    this._idmap = /* @__PURE__ */ new Map();
  }
  add(schema, ..._meta) {
    const meta3 = _meta[0];
    this._map.set(schema, meta3);
    if (meta3 && typeof meta3 === "object" && "id" in meta3) {
      this._idmap.set(meta3.id, schema);
    }
    return this;
  }
  clear() {
    this._map = /* @__PURE__ */ new WeakMap();
    this._idmap = /* @__PURE__ */ new Map();
    return this;
  }
  remove(schema) {
    const meta3 = this._map.get(schema);
    if (meta3 && typeof meta3 === "object" && "id" in meta3) {
      this._idmap.delete(meta3.id);
    }
    this._map.delete(schema);
    return this;
  }
  get(schema) {
    const p = schema._zod.parent;
    if (p) {
      const pm = { ...this.get(p) ?? {} };
      delete pm.id;
      const f = { ...pm, ...this._map.get(schema) };
      return Object.keys(f).length ? f : void 0;
    }
    return this._map.get(schema);
  }
  has(schema) {
    return this._map.has(schema);
  }
};
function registry() {
  return new $ZodRegistry();
}
(_a = globalThis).__zod_globalRegistry ?? (_a.__zod_globalRegistry = registry());
var globalRegistry = globalThis.__zod_globalRegistry;

// ../../node_modules/zod/v4/core/api.js
// @__NO_SIDE_EFFECTS__
function _string(Class2, params) {
  return new Class2({
    type: "string",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _coercedString(Class2, params) {
  return new Class2({
    type: "string",
    coerce: true,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _email(Class2, params) {
  return new Class2({
    type: "string",
    format: "email",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _guid(Class2, params) {
  return new Class2({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _uuid(Class2, params) {
  return new Class2({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _uuidv4(Class2, params) {
  return new Class2({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v4",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _uuidv6(Class2, params) {
  return new Class2({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v6",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _uuidv7(Class2, params) {
  return new Class2({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v7",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _url(Class2, params) {
  return new Class2({
    type: "string",
    format: "url",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _emoji2(Class2, params) {
  return new Class2({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _nanoid(Class2, params) {
  return new Class2({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _cuid(Class2, params) {
  return new Class2({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _cuid2(Class2, params) {
  return new Class2({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _ulid(Class2, params) {
  return new Class2({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _xid(Class2, params) {
  return new Class2({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _ksuid(Class2, params) {
  return new Class2({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _ipv4(Class2, params) {
  return new Class2({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _ipv6(Class2, params) {
  return new Class2({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _mac(Class2, params) {
  return new Class2({
    type: "string",
    format: "mac",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _cidrv4(Class2, params) {
  return new Class2({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _cidrv6(Class2, params) {
  return new Class2({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _base64(Class2, params) {
  return new Class2({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _base64url(Class2, params) {
  return new Class2({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _e164(Class2, params) {
  return new Class2({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _jwt(Class2, params) {
  return new Class2({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
var TimePrecision = {
  Any: null,
  Minute: -1,
  Second: 0,
  Millisecond: 3,
  Microsecond: 6
};
// @__NO_SIDE_EFFECTS__
function _isoDateTime(Class2, params) {
  return new Class2({
    type: "string",
    format: "datetime",
    check: "string_format",
    offset: false,
    local: false,
    precision: null,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _isoDate(Class2, params) {
  return new Class2({
    type: "string",
    format: "date",
    check: "string_format",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _isoTime(Class2, params) {
  return new Class2({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _isoDuration(Class2, params) {
  return new Class2({
    type: "string",
    format: "duration",
    check: "string_format",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _number(Class2, params) {
  return new Class2({
    type: "number",
    checks: [],
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _coercedNumber(Class2, params) {
  return new Class2({
    type: "number",
    coerce: true,
    checks: [],
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _int(Class2, params) {
  return new Class2({
    type: "number",
    check: "number_format",
    abort: false,
    format: "safeint",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _float32(Class2, params) {
  return new Class2({
    type: "number",
    check: "number_format",
    abort: false,
    format: "float32",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _float64(Class2, params) {
  return new Class2({
    type: "number",
    check: "number_format",
    abort: false,
    format: "float64",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _int32(Class2, params) {
  return new Class2({
    type: "number",
    check: "number_format",
    abort: false,
    format: "int32",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _uint32(Class2, params) {
  return new Class2({
    type: "number",
    check: "number_format",
    abort: false,
    format: "uint32",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _boolean(Class2, params) {
  return new Class2({
    type: "boolean",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _coercedBoolean(Class2, params) {
  return new Class2({
    type: "boolean",
    coerce: true,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _bigint(Class2, params) {
  return new Class2({
    type: "bigint",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _coercedBigint(Class2, params) {
  return new Class2({
    type: "bigint",
    coerce: true,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _int64(Class2, params) {
  return new Class2({
    type: "bigint",
    check: "bigint_format",
    abort: false,
    format: "int64",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _uint64(Class2, params) {
  return new Class2({
    type: "bigint",
    check: "bigint_format",
    abort: false,
    format: "uint64",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _symbol(Class2, params) {
  return new Class2({
    type: "symbol",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _undefined2(Class2, params) {
  return new Class2({
    type: "undefined",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _null2(Class2, params) {
  return new Class2({
    type: "null",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _any(Class2) {
  return new Class2({
    type: "any"
  });
}
// @__NO_SIDE_EFFECTS__
function _unknown(Class2) {
  return new Class2({
    type: "unknown"
  });
}
// @__NO_SIDE_EFFECTS__
function _never(Class2, params) {
  return new Class2({
    type: "never",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _void(Class2, params) {
  return new Class2({
    type: "void",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _date(Class2, params) {
  return new Class2({
    type: "date",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _coercedDate(Class2, params) {
  return new Class2({
    type: "date",
    coerce: true,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _nan(Class2, params) {
  return new Class2({
    type: "nan",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _lt(value, params) {
  return new $ZodCheckLessThan({
    check: "less_than",
    ...normalizeParams(params),
    value,
    inclusive: false
  });
}
// @__NO_SIDE_EFFECTS__
function _lte(value, params) {
  return new $ZodCheckLessThan({
    check: "less_than",
    ...normalizeParams(params),
    value,
    inclusive: true
  });
}
// @__NO_SIDE_EFFECTS__
function _gt(value, params) {
  return new $ZodCheckGreaterThan({
    check: "greater_than",
    ...normalizeParams(params),
    value,
    inclusive: false
  });
}
// @__NO_SIDE_EFFECTS__
function _gte(value, params) {
  return new $ZodCheckGreaterThan({
    check: "greater_than",
    ...normalizeParams(params),
    value,
    inclusive: true
  });
}
// @__NO_SIDE_EFFECTS__
function _positive(params) {
  return /* @__PURE__ */ _gt(0, params);
}
// @__NO_SIDE_EFFECTS__
function _negative(params) {
  return /* @__PURE__ */ _lt(0, params);
}
// @__NO_SIDE_EFFECTS__
function _nonpositive(params) {
  return /* @__PURE__ */ _lte(0, params);
}
// @__NO_SIDE_EFFECTS__
function _nonnegative(params) {
  return /* @__PURE__ */ _gte(0, params);
}
// @__NO_SIDE_EFFECTS__
function _multipleOf(value, params) {
  return new $ZodCheckMultipleOf({
    check: "multiple_of",
    ...normalizeParams(params),
    value
  });
}
// @__NO_SIDE_EFFECTS__
function _maxSize(maximum, params) {
  return new $ZodCheckMaxSize({
    check: "max_size",
    ...normalizeParams(params),
    maximum
  });
}
// @__NO_SIDE_EFFECTS__
function _minSize(minimum, params) {
  return new $ZodCheckMinSize({
    check: "min_size",
    ...normalizeParams(params),
    minimum
  });
}
// @__NO_SIDE_EFFECTS__
function _size(size, params) {
  return new $ZodCheckSizeEquals({
    check: "size_equals",
    ...normalizeParams(params),
    size
  });
}
// @__NO_SIDE_EFFECTS__
function _maxLength(maximum, params) {
  const ch = new $ZodCheckMaxLength({
    check: "max_length",
    ...normalizeParams(params),
    maximum
  });
  return ch;
}
// @__NO_SIDE_EFFECTS__
function _minLength(minimum, params) {
  return new $ZodCheckMinLength({
    check: "min_length",
    ...normalizeParams(params),
    minimum
  });
}
// @__NO_SIDE_EFFECTS__
function _length(length, params) {
  return new $ZodCheckLengthEquals({
    check: "length_equals",
    ...normalizeParams(params),
    length
  });
}
// @__NO_SIDE_EFFECTS__
function _regex(pattern, params) {
  return new $ZodCheckRegex({
    check: "string_format",
    format: "regex",
    ...normalizeParams(params),
    pattern
  });
}
// @__NO_SIDE_EFFECTS__
function _lowercase(params) {
  return new $ZodCheckLowerCase({
    check: "string_format",
    format: "lowercase",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _uppercase(params) {
  return new $ZodCheckUpperCase({
    check: "string_format",
    format: "uppercase",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _includes(includes, params) {
  return new $ZodCheckIncludes({
    check: "string_format",
    format: "includes",
    ...normalizeParams(params),
    includes
  });
}
// @__NO_SIDE_EFFECTS__
function _startsWith(prefix, params) {
  return new $ZodCheckStartsWith({
    check: "string_format",
    format: "starts_with",
    ...normalizeParams(params),
    prefix
  });
}
// @__NO_SIDE_EFFECTS__
function _endsWith(suffix, params) {
  return new $ZodCheckEndsWith({
    check: "string_format",
    format: "ends_with",
    ...normalizeParams(params),
    suffix
  });
}
// @__NO_SIDE_EFFECTS__
function _property(property, schema, params) {
  return new $ZodCheckProperty({
    check: "property",
    property,
    schema,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _mime(types, params) {
  return new $ZodCheckMimeType({
    check: "mime_type",
    mime: types,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _overwrite(tx) {
  return new $ZodCheckOverwrite({
    check: "overwrite",
    tx
  });
}
// @__NO_SIDE_EFFECTS__
function _normalize(form) {
  return /* @__PURE__ */ _overwrite((input) => input.normalize(form));
}
// @__NO_SIDE_EFFECTS__
function _trim() {
  return /* @__PURE__ */ _overwrite((input) => input.trim());
}
// @__NO_SIDE_EFFECTS__
function _toLowerCase() {
  return /* @__PURE__ */ _overwrite((input) => input.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function _toUpperCase() {
  return /* @__PURE__ */ _overwrite((input) => input.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function _slugify() {
  return /* @__PURE__ */ _overwrite((input) => slugify(input));
}
// @__NO_SIDE_EFFECTS__
function _array(Class2, element, params) {
  return new Class2({
    type: "array",
    element,
    // get element() {
    //   return element;
    // },
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _union(Class2, options, params) {
  return new Class2({
    type: "union",
    options,
    ...normalizeParams(params)
  });
}
function _xor(Class2, options, params) {
  return new Class2({
    type: "union",
    options,
    inclusive: false,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _discriminatedUnion(Class2, discriminator, options, params) {
  return new Class2({
    type: "union",
    options,
    discriminator,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _intersection(Class2, left, right) {
  return new Class2({
    type: "intersection",
    left,
    right
  });
}
// @__NO_SIDE_EFFECTS__
function _tuple(Class2, items, _paramsOrRest, _params) {
  const hasRest = _paramsOrRest instanceof $ZodType;
  const params = hasRest ? _params : _paramsOrRest;
  const rest = hasRest ? _paramsOrRest : null;
  return new Class2({
    type: "tuple",
    items,
    rest,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _record(Class2, keyType, valueType, params) {
  return new Class2({
    type: "record",
    keyType,
    valueType,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _map(Class2, keyType, valueType, params) {
  return new Class2({
    type: "map",
    keyType,
    valueType,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _set(Class2, valueType, params) {
  return new Class2({
    type: "set",
    valueType,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _enum(Class2, values, params) {
  const entries = Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values;
  return new Class2({
    type: "enum",
    entries,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _nativeEnum(Class2, entries, params) {
  return new Class2({
    type: "enum",
    entries,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _literal(Class2, value, params) {
  return new Class2({
    type: "literal",
    values: Array.isArray(value) ? value : [value],
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _file(Class2, params) {
  return new Class2({
    type: "file",
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _transform(Class2, fn) {
  return new Class2({
    type: "transform",
    transform: fn
  });
}
// @__NO_SIDE_EFFECTS__
function _optional(Class2, innerType) {
  return new Class2({
    type: "optional",
    innerType
  });
}
// @__NO_SIDE_EFFECTS__
function _nullable(Class2, innerType) {
  return new Class2({
    type: "nullable",
    innerType
  });
}
// @__NO_SIDE_EFFECTS__
function _default(Class2, innerType, defaultValue) {
  return new Class2({
    type: "default",
    innerType,
    get defaultValue() {
      return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
    }
  });
}
// @__NO_SIDE_EFFECTS__
function _nonoptional(Class2, innerType, params) {
  return new Class2({
    type: "nonoptional",
    innerType,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _success(Class2, innerType) {
  return new Class2({
    type: "success",
    innerType
  });
}
// @__NO_SIDE_EFFECTS__
function _catch(Class2, innerType, catchValue) {
  return new Class2({
    type: "catch",
    innerType,
    catchValue: typeof catchValue === "function" ? catchValue : () => catchValue
  });
}
// @__NO_SIDE_EFFECTS__
function _pipe(Class2, in_, out) {
  return new Class2({
    type: "pipe",
    in: in_,
    out
  });
}
// @__NO_SIDE_EFFECTS__
function _readonly(Class2, innerType) {
  return new Class2({
    type: "readonly",
    innerType
  });
}
// @__NO_SIDE_EFFECTS__
function _templateLiteral(Class2, parts, params) {
  return new Class2({
    type: "template_literal",
    parts,
    ...normalizeParams(params)
  });
}
// @__NO_SIDE_EFFECTS__
function _lazy(Class2, getter) {
  return new Class2({
    type: "lazy",
    getter
  });
}
// @__NO_SIDE_EFFECTS__
function _promise(Class2, innerType) {
  return new Class2({
    type: "promise",
    innerType
  });
}
// @__NO_SIDE_EFFECTS__
function _custom(Class2, fn, _params) {
  const norm = normalizeParams(_params);
  norm.abort ?? (norm.abort = true);
  const schema = new Class2({
    type: "custom",
    check: "custom",
    fn,
    ...norm
  });
  return schema;
}
// @__NO_SIDE_EFFECTS__
function _refine(Class2, fn, _params) {
  const schema = new Class2({
    type: "custom",
    check: "custom",
    fn,
    ...normalizeParams(_params)
  });
  return schema;
}
// @__NO_SIDE_EFFECTS__
function _superRefine(fn) {
  const ch = /* @__PURE__ */ _check((payload) => {
    payload.addIssue = (issue2) => {
      if (typeof issue2 === "string") {
        payload.issues.push(issue(issue2, payload.value, ch._zod.def));
      } else {
        const _issue = issue2;
        if (_issue.fatal)
          _issue.continue = false;
        _issue.code ?? (_issue.code = "custom");
        _issue.input ?? (_issue.input = payload.value);
        _issue.inst ?? (_issue.inst = ch);
        _issue.continue ?? (_issue.continue = !ch._zod.def.abort);
        payload.issues.push(issue(_issue));
      }
    };
    return fn(payload.value, payload);
  });
  return ch;
}
// @__NO_SIDE_EFFECTS__
function _check(fn, params) {
  const ch = new $ZodCheck({
    check: "custom",
    ...normalizeParams(params)
  });
  ch._zod.check = fn;
  return ch;
}
// @__NO_SIDE_EFFECTS__
function describe(description) {
  const ch = new $ZodCheck({ check: "describe" });
  ch._zod.onattach = [
    (inst) => {
      const existing = globalRegistry.get(inst) ?? {};
      globalRegistry.add(inst, { ...existing, description });
    }
  ];
  ch._zod.check = () => {
  };
  return ch;
}
// @__NO_SIDE_EFFECTS__
function meta(metadata) {
  const ch = new $ZodCheck({ check: "meta" });
  ch._zod.onattach = [
    (inst) => {
      const existing = globalRegistry.get(inst) ?? {};
      globalRegistry.add(inst, { ...existing, ...metadata });
    }
  ];
  ch._zod.check = () => {
  };
  return ch;
}
// @__NO_SIDE_EFFECTS__
function _stringbool(Classes, _params) {
  const params = normalizeParams(_params);
  let truthyArray = params.truthy ?? ["true", "1", "yes", "on", "y", "enabled"];
  let falsyArray = params.falsy ?? ["false", "0", "no", "off", "n", "disabled"];
  if (params.case !== "sensitive") {
    truthyArray = truthyArray.map((v) => typeof v === "string" ? v.toLowerCase() : v);
    falsyArray = falsyArray.map((v) => typeof v === "string" ? v.toLowerCase() : v);
  }
  const truthySet = new Set(truthyArray);
  const falsySet = new Set(falsyArray);
  const _Codec = Classes.Codec ?? $ZodCodec;
  const _Boolean = Classes.Boolean ?? $ZodBoolean;
  const _String = Classes.String ?? $ZodString;
  const stringSchema = new _String({ type: "string", error: params.error });
  const booleanSchema = new _Boolean({ type: "boolean", error: params.error });
  const codec2 = new _Codec({
    type: "pipe",
    in: stringSchema,
    out: booleanSchema,
    transform: ((input, payload) => {
      let data = input;
      if (params.case !== "sensitive")
        data = data.toLowerCase();
      if (truthySet.has(data)) {
        return true;
      } else if (falsySet.has(data)) {
        return false;
      } else {
        payload.issues.push({
          code: "invalid_value",
          expected: "stringbool",
          values: [...truthySet, ...falsySet],
          input: payload.value,
          inst: codec2,
          continue: false
        });
        return {};
      }
    }),
    reverseTransform: ((input, _payload) => {
      if (input === true) {
        return truthyArray[0] || "true";
      } else {
        return falsyArray[0] || "false";
      }
    }),
    error: params.error
  });
  return codec2;
}
// @__NO_SIDE_EFFECTS__
function _stringFormat(Class2, format, fnOrRegex, _params = {}) {
  const params = normalizeParams(_params);
  const def = {
    ...normalizeParams(_params),
    check: "string_format",
    type: "string",
    format,
    fn: typeof fnOrRegex === "function" ? fnOrRegex : (val) => fnOrRegex.test(val),
    ...params
  };
  if (fnOrRegex instanceof RegExp) {
    def.pattern = fnOrRegex;
  }
  const inst = new Class2(def);
  return inst;
}

// ../../node_modules/zod/v4/core/to-json-schema.js
function initializeContext(params) {
  let target = params?.target ?? "draft-2020-12";
  if (target === "draft-4")
    target = "draft-04";
  if (target === "draft-7")
    target = "draft-07";
  return {
    processors: params.processors ?? {},
    metadataRegistry: params?.metadata ?? globalRegistry,
    target,
    unrepresentable: params?.unrepresentable ?? "throw",
    override: params?.override ?? (() => {
    }),
    io: params?.io ?? "output",
    counter: 0,
    seen: /* @__PURE__ */ new Map(),
    cycles: params?.cycles ?? "ref",
    reused: params?.reused ?? "inline",
    external: params?.external ?? void 0
  };
}
function process(schema, ctx, _params = { path: [], schemaPath: [] }) {
  var _a2;
  const def = schema._zod.def;
  const seen = ctx.seen.get(schema);
  if (seen) {
    seen.count++;
    const isCycle = _params.schemaPath.includes(schema);
    if (isCycle) {
      seen.cycle = _params.path;
    }
    return seen.schema;
  }
  const result = { schema: {}, count: 1, cycle: void 0, path: _params.path };
  ctx.seen.set(schema, result);
  const overrideSchema = schema._zod.toJSONSchema?.();
  if (overrideSchema) {
    result.schema = overrideSchema;
  } else {
    const params = {
      ..._params,
      schemaPath: [..._params.schemaPath, schema],
      path: _params.path
    };
    if (schema._zod.processJSONSchema) {
      schema._zod.processJSONSchema(ctx, result.schema, params);
    } else {
      const _json = result.schema;
      const processor = ctx.processors[def.type];
      if (!processor) {
        throw new Error(`[toJSONSchema]: Non-representable type encountered: ${def.type}`);
      }
      processor(schema, ctx, _json, params);
    }
    const parent = schema._zod.parent;
    if (parent) {
      if (!result.ref)
        result.ref = parent;
      process(parent, ctx, params);
      ctx.seen.get(parent).isParent = true;
    }
  }
  const meta3 = ctx.metadataRegistry.get(schema);
  if (meta3)
    Object.assign(result.schema, meta3);
  if (ctx.io === "input" && isTransforming(schema)) {
    delete result.schema.examples;
    delete result.schema.default;
  }
  if (ctx.io === "input" && result.schema._prefault)
    (_a2 = result.schema).default ?? (_a2.default = result.schema._prefault);
  delete result.schema._prefault;
  const _result = ctx.seen.get(schema);
  return _result.schema;
}
function extractDefs(ctx, schema) {
  const root = ctx.seen.get(schema);
  if (!root)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const idToSchema = /* @__PURE__ */ new Map();
  for (const entry of ctx.seen.entries()) {
    const id = ctx.metadataRegistry.get(entry[0])?.id;
    if (id) {
      const existing = idToSchema.get(id);
      if (existing && existing !== entry[0]) {
        throw new Error(`Duplicate schema id "${id}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
      }
      idToSchema.set(id, entry[0]);
    }
  }
  const makeURI = (entry) => {
    const defsSegment = ctx.target === "draft-2020-12" ? "$defs" : "definitions";
    if (ctx.external) {
      const externalId = ctx.external.registry.get(entry[0])?.id;
      const uriGenerator = ctx.external.uri ?? ((id2) => id2);
      if (externalId) {
        return { ref: uriGenerator(externalId) };
      }
      const id = entry[1].defId ?? entry[1].schema.id ?? `schema${ctx.counter++}`;
      entry[1].defId = id;
      return { defId: id, ref: `${uriGenerator("__shared")}#/${defsSegment}/${id}` };
    }
    if (entry[1] === root) {
      return { ref: "#" };
    }
    const uriPrefix = `#`;
    const defUriPrefix = `${uriPrefix}/${defsSegment}/`;
    const defId = entry[1].schema.id ?? `__schema${ctx.counter++}`;
    return { defId, ref: defUriPrefix + defId };
  };
  const extractToDef = (entry) => {
    if (entry[1].schema.$ref) {
      return;
    }
    const seen = entry[1];
    const { ref, defId } = makeURI(entry);
    seen.def = { ...seen.schema };
    if (defId)
      seen.defId = defId;
    const schema2 = seen.schema;
    for (const key in schema2) {
      delete schema2[key];
    }
    schema2.$ref = ref;
  };
  if (ctx.cycles === "throw") {
    for (const entry of ctx.seen.entries()) {
      const seen = entry[1];
      if (seen.cycle) {
        throw new Error(`Cycle detected: #/${seen.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
      }
    }
  }
  for (const entry of ctx.seen.entries()) {
    const seen = entry[1];
    if (schema === entry[0]) {
      extractToDef(entry);
      continue;
    }
    if (ctx.external) {
      const ext = ctx.external.registry.get(entry[0])?.id;
      if (schema !== entry[0] && ext) {
        extractToDef(entry);
        continue;
      }
    }
    const id = ctx.metadataRegistry.get(entry[0])?.id;
    if (id) {
      extractToDef(entry);
      continue;
    }
    if (seen.cycle) {
      extractToDef(entry);
      continue;
    }
    if (seen.count > 1) {
      if (ctx.reused === "ref") {
        extractToDef(entry);
        continue;
      }
    }
  }
}
function finalize(ctx, schema) {
  const root = ctx.seen.get(schema);
  if (!root)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const flattenRef = (zodSchema) => {
    const seen = ctx.seen.get(zodSchema);
    if (seen.ref === null)
      return;
    const schema2 = seen.def ?? seen.schema;
    const _cached = { ...schema2 };
    const ref = seen.ref;
    seen.ref = null;
    if (ref) {
      flattenRef(ref);
      const refSeen = ctx.seen.get(ref);
      const refSchema = refSeen.schema;
      if (refSchema.$ref && (ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0")) {
        schema2.allOf = schema2.allOf ?? [];
        schema2.allOf.push(refSchema);
      } else {
        Object.assign(schema2, refSchema);
      }
      Object.assign(schema2, _cached);
      const isParentRef = zodSchema._zod.parent === ref;
      if (isParentRef) {
        for (const key in schema2) {
          if (key === "$ref" || key === "allOf")
            continue;
          if (!(key in _cached)) {
            delete schema2[key];
          }
        }
      }
      if (refSchema.$ref) {
        for (const key in schema2) {
          if (key === "$ref" || key === "allOf")
            continue;
          if (key in refSeen.def && JSON.stringify(schema2[key]) === JSON.stringify(refSeen.def[key])) {
            delete schema2[key];
          }
        }
      }
    }
    const parent = zodSchema._zod.parent;
    if (parent && parent !== ref) {
      flattenRef(parent);
      const parentSeen = ctx.seen.get(parent);
      if (parentSeen?.schema.$ref) {
        schema2.$ref = parentSeen.schema.$ref;
        if (parentSeen.def) {
          for (const key in schema2) {
            if (key === "$ref" || key === "allOf")
              continue;
            if (key in parentSeen.def && JSON.stringify(schema2[key]) === JSON.stringify(parentSeen.def[key])) {
              delete schema2[key];
            }
          }
        }
      }
    }
    ctx.override({
      zodSchema,
      jsonSchema: schema2,
      path: seen.path ?? []
    });
  };
  for (const entry of [...ctx.seen.entries()].reverse()) {
    flattenRef(entry[0]);
  }
  const result = {};
  if (ctx.target === "draft-2020-12") {
    result.$schema = "https://json-schema.org/draft/2020-12/schema";
  } else if (ctx.target === "draft-07") {
    result.$schema = "http://json-schema.org/draft-07/schema#";
  } else if (ctx.target === "draft-04") {
    result.$schema = "http://json-schema.org/draft-04/schema#";
  } else if (ctx.target === "openapi-3.0") {
  } else {
  }
  if (ctx.external?.uri) {
    const id = ctx.external.registry.get(schema)?.id;
    if (!id)
      throw new Error("Schema is missing an `id` property");
    result.$id = ctx.external.uri(id);
  }
  Object.assign(result, root.def ?? root.schema);
  const defs = ctx.external?.defs ?? {};
  for (const entry of ctx.seen.entries()) {
    const seen = entry[1];
    if (seen.def && seen.defId) {
      defs[seen.defId] = seen.def;
    }
  }
  if (ctx.external) {
  } else {
    if (Object.keys(defs).length > 0) {
      if (ctx.target === "draft-2020-12") {
        result.$defs = defs;
      } else {
        result.definitions = defs;
      }
    }
  }
  try {
    const finalized = JSON.parse(JSON.stringify(result));
    Object.defineProperty(finalized, "~standard", {
      value: {
        ...schema["~standard"],
        jsonSchema: {
          input: createStandardJSONSchemaMethod(schema, "input", ctx.processors),
          output: createStandardJSONSchemaMethod(schema, "output", ctx.processors)
        }
      },
      enumerable: false,
      writable: false
    });
    return finalized;
  } catch (_err) {
    throw new Error("Error converting schema to JSON.");
  }
}
function isTransforming(_schema, _ctx) {
  const ctx = _ctx ?? { seen: /* @__PURE__ */ new Set() };
  if (ctx.seen.has(_schema))
    return false;
  ctx.seen.add(_schema);
  const def = _schema._zod.def;
  if (def.type === "transform")
    return true;
  if (def.type === "array")
    return isTransforming(def.element, ctx);
  if (def.type === "set")
    return isTransforming(def.valueType, ctx);
  if (def.type === "lazy")
    return isTransforming(def.getter(), ctx);
  if (def.type === "promise" || def.type === "optional" || def.type === "nonoptional" || def.type === "nullable" || def.type === "readonly" || def.type === "default" || def.type === "prefault") {
    return isTransforming(def.innerType, ctx);
  }
  if (def.type === "intersection") {
    return isTransforming(def.left, ctx) || isTransforming(def.right, ctx);
  }
  if (def.type === "record" || def.type === "map") {
    return isTransforming(def.keyType, ctx) || isTransforming(def.valueType, ctx);
  }
  if (def.type === "pipe") {
    return isTransforming(def.in, ctx) || isTransforming(def.out, ctx);
  }
  if (def.type === "object") {
    for (const key in def.shape) {
      if (isTransforming(def.shape[key], ctx))
        return true;
    }
    return false;
  }
  if (def.type === "union") {
    for (const option of def.options) {
      if (isTransforming(option, ctx))
        return true;
    }
    return false;
  }
  if (def.type === "tuple") {
    for (const item of def.items) {
      if (isTransforming(item, ctx))
        return true;
    }
    if (def.rest && isTransforming(def.rest, ctx))
      return true;
    return false;
  }
  return false;
}
var createToJSONSchemaMethod = (schema, processors = {}) => (params) => {
  const ctx = initializeContext({ ...params, processors });
  process(schema, ctx);
  extractDefs(ctx, schema);
  return finalize(ctx, schema);
};
var createStandardJSONSchemaMethod = (schema, io, processors = {}) => (params) => {
  const { libraryOptions, target } = params ?? {};
  const ctx = initializeContext({ ...libraryOptions ?? {}, target, io, processors });
  process(schema, ctx);
  extractDefs(ctx, schema);
  return finalize(ctx, schema);
};

// ../../node_modules/zod/v4/core/json-schema-processors.js
var formatMap = {
  guid: "uuid",
  url: "uri",
  datetime: "date-time",
  json_string: "json-string",
  regex: ""
  // do not set
};
var stringProcessor = (schema, ctx, _json, _params) => {
  const json2 = _json;
  json2.type = "string";
  const { minimum, maximum, format, patterns, contentEncoding } = schema._zod.bag;
  if (typeof minimum === "number")
    json2.minLength = minimum;
  if (typeof maximum === "number")
    json2.maxLength = maximum;
  if (format) {
    json2.format = formatMap[format] ?? format;
    if (json2.format === "")
      delete json2.format;
    if (format === "time") {
      delete json2.format;
    }
  }
  if (contentEncoding)
    json2.contentEncoding = contentEncoding;
  if (patterns && patterns.size > 0) {
    const regexes = [...patterns];
    if (regexes.length === 1)
      json2.pattern = regexes[0].source;
    else if (regexes.length > 1) {
      json2.allOf = [
        ...regexes.map((regex) => ({
          ...ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0" ? { type: "string" } : {},
          pattern: regex.source
        }))
      ];
    }
  }
};
var numberProcessor = (schema, ctx, _json, _params) => {
  const json2 = _json;
  const { minimum, maximum, format, multipleOf, exclusiveMaximum, exclusiveMinimum } = schema._zod.bag;
  if (typeof format === "string" && format.includes("int"))
    json2.type = "integer";
  else
    json2.type = "number";
  if (typeof exclusiveMinimum === "number") {
    if (ctx.target === "draft-04" || ctx.target === "openapi-3.0") {
      json2.minimum = exclusiveMinimum;
      json2.exclusiveMinimum = true;
    } else {
      json2.exclusiveMinimum = exclusiveMinimum;
    }
  }
  if (typeof minimum === "number") {
    json2.minimum = minimum;
    if (typeof exclusiveMinimum === "number" && ctx.target !== "draft-04") {
      if (exclusiveMinimum >= minimum)
        delete json2.minimum;
      else
        delete json2.exclusiveMinimum;
    }
  }
  if (typeof exclusiveMaximum === "number") {
    if (ctx.target === "draft-04" || ctx.target === "openapi-3.0") {
      json2.maximum = exclusiveMaximum;
      json2.exclusiveMaximum = true;
    } else {
      json2.exclusiveMaximum = exclusiveMaximum;
    }
  }
  if (typeof maximum === "number") {
    json2.maximum = maximum;
    if (typeof exclusiveMaximum === "number" && ctx.target !== "draft-04") {
      if (exclusiveMaximum <= maximum)
        delete json2.maximum;
      else
        delete json2.exclusiveMaximum;
    }
  }
  if (typeof multipleOf === "number")
    json2.multipleOf = multipleOf;
};
var booleanProcessor = (_schema, _ctx, json2, _params) => {
  json2.type = "boolean";
};
var bigintProcessor = (_schema, ctx, _json, _params) => {
  if (ctx.unrepresentable === "throw") {
    throw new Error("BigInt cannot be represented in JSON Schema");
  }
};
var symbolProcessor = (_schema, ctx, _json, _params) => {
  if (ctx.unrepresentable === "throw") {
    throw new Error("Symbols cannot be represented in JSON Schema");
  }
};
var nullProcessor = (_schema, ctx, json2, _params) => {
  if (ctx.target === "openapi-3.0") {
    json2.type = "string";
    json2.nullable = true;
    json2.enum = [null];
  } else {
    json2.type = "null";
  }
};
var undefinedProcessor = (_schema, ctx, _json, _params) => {
  if (ctx.unrepresentable === "throw") {
    throw new Error("Undefined cannot be represented in JSON Schema");
  }
};
var voidProcessor = (_schema, ctx, _json, _params) => {
  if (ctx.unrepresentable === "throw") {
    throw new Error("Void cannot be represented in JSON Schema");
  }
};
var neverProcessor = (_schema, _ctx, json2, _params) => {
  json2.not = {};
};
var anyProcessor = (_schema, _ctx, _json, _params) => {
};
var unknownProcessor = (_schema, _ctx, _json, _params) => {
};
var dateProcessor = (_schema, ctx, _json, _params) => {
  if (ctx.unrepresentable === "throw") {
    throw new Error("Date cannot be represented in JSON Schema");
  }
};
var enumProcessor = (schema, _ctx, json2, _params) => {
  const def = schema._zod.def;
  const values = getEnumValues(def.entries);
  if (values.every((v) => typeof v === "number"))
    json2.type = "number";
  if (values.every((v) => typeof v === "string"))
    json2.type = "string";
  json2.enum = values;
};
var literalProcessor = (schema, ctx, json2, _params) => {
  const def = schema._zod.def;
  const vals = [];
  for (const val of def.values) {
    if (val === void 0) {
      if (ctx.unrepresentable === "throw") {
        throw new Error("Literal `undefined` cannot be represented in JSON Schema");
      } else {
      }
    } else if (typeof val === "bigint") {
      if (ctx.unrepresentable === "throw") {
        throw new Error("BigInt literals cannot be represented in JSON Schema");
      } else {
        vals.push(Number(val));
      }
    } else {
      vals.push(val);
    }
  }
  if (vals.length === 0) {
  } else if (vals.length === 1) {
    const val = vals[0];
    json2.type = val === null ? "null" : typeof val;
    if (ctx.target === "draft-04" || ctx.target === "openapi-3.0") {
      json2.enum = [val];
    } else {
      json2.const = val;
    }
  } else {
    if (vals.every((v) => typeof v === "number"))
      json2.type = "number";
    if (vals.every((v) => typeof v === "string"))
      json2.type = "string";
    if (vals.every((v) => typeof v === "boolean"))
      json2.type = "boolean";
    if (vals.every((v) => v === null))
      json2.type = "null";
    json2.enum = vals;
  }
};
var nanProcessor = (_schema, ctx, _json, _params) => {
  if (ctx.unrepresentable === "throw") {
    throw new Error("NaN cannot be represented in JSON Schema");
  }
};
var templateLiteralProcessor = (schema, _ctx, json2, _params) => {
  const _json = json2;
  const pattern = schema._zod.pattern;
  if (!pattern)
    throw new Error("Pattern not found in template literal");
  _json.type = "string";
  _json.pattern = pattern.source;
};
var fileProcessor = (schema, _ctx, json2, _params) => {
  const _json = json2;
  const file2 = {
    type: "string",
    format: "binary",
    contentEncoding: "binary"
  };
  const { minimum, maximum, mime } = schema._zod.bag;
  if (minimum !== void 0)
    file2.minLength = minimum;
  if (maximum !== void 0)
    file2.maxLength = maximum;
  if (mime) {
    if (mime.length === 1) {
      file2.contentMediaType = mime[0];
      Object.assign(_json, file2);
    } else {
      Object.assign(_json, file2);
      _json.anyOf = mime.map((m) => ({ contentMediaType: m }));
    }
  } else {
    Object.assign(_json, file2);
  }
};
var successProcessor = (_schema, _ctx, json2, _params) => {
  json2.type = "boolean";
};
var customProcessor = (_schema, ctx, _json, _params) => {
  if (ctx.unrepresentable === "throw") {
    throw new Error("Custom types cannot be represented in JSON Schema");
  }
};
var functionProcessor = (_schema, ctx, _json, _params) => {
  if (ctx.unrepresentable === "throw") {
    throw new Error("Function types cannot be represented in JSON Schema");
  }
};
var transformProcessor = (_schema, ctx, _json, _params) => {
  if (ctx.unrepresentable === "throw") {
    throw new Error("Transforms cannot be represented in JSON Schema");
  }
};
var mapProcessor = (_schema, ctx, _json, _params) => {
  if (ctx.unrepresentable === "throw") {
    throw new Error("Map cannot be represented in JSON Schema");
  }
};
var setProcessor = (_schema, ctx, _json, _params) => {
  if (ctx.unrepresentable === "throw") {
    throw new Error("Set cannot be represented in JSON Schema");
  }
};
var arrayProcessor = (schema, ctx, _json, params) => {
  const json2 = _json;
  const def = schema._zod.def;
  const { minimum, maximum } = schema._zod.bag;
  if (typeof minimum === "number")
    json2.minItems = minimum;
  if (typeof maximum === "number")
    json2.maxItems = maximum;
  json2.type = "array";
  json2.items = process(def.element, ctx, { ...params, path: [...params.path, "items"] });
};
var objectProcessor = (schema, ctx, _json, params) => {
  const json2 = _json;
  const def = schema._zod.def;
  json2.type = "object";
  json2.properties = {};
  const shape = def.shape;
  for (const key in shape) {
    json2.properties[key] = process(shape[key], ctx, {
      ...params,
      path: [...params.path, "properties", key]
    });
  }
  const allKeys = new Set(Object.keys(shape));
  const requiredKeys = new Set([...allKeys].filter((key) => {
    const v = def.shape[key]._zod;
    if (ctx.io === "input") {
      return v.optin === void 0;
    } else {
      return v.optout === void 0;
    }
  }));
  if (requiredKeys.size > 0) {
    json2.required = Array.from(requiredKeys);
  }
  if (def.catchall?._zod.def.type === "never") {
    json2.additionalProperties = false;
  } else if (!def.catchall) {
    if (ctx.io === "output")
      json2.additionalProperties = false;
  } else if (def.catchall) {
    json2.additionalProperties = process(def.catchall, ctx, {
      ...params,
      path: [...params.path, "additionalProperties"]
    });
  }
};
var unionProcessor = (schema, ctx, json2, params) => {
  const def = schema._zod.def;
  const isExclusive = def.inclusive === false;
  const options = def.options.map((x, i) => process(x, ctx, {
    ...params,
    path: [...params.path, isExclusive ? "oneOf" : "anyOf", i]
  }));
  if (isExclusive) {
    json2.oneOf = options;
  } else {
    json2.anyOf = options;
  }
};
var intersectionProcessor = (schema, ctx, json2, params) => {
  const def = schema._zod.def;
  const a = process(def.left, ctx, {
    ...params,
    path: [...params.path, "allOf", 0]
  });
  const b = process(def.right, ctx, {
    ...params,
    path: [...params.path, "allOf", 1]
  });
  const isSimpleIntersection = (val) => "allOf" in val && Object.keys(val).length === 1;
  const allOf = [
    ...isSimpleIntersection(a) ? a.allOf : [a],
    ...isSimpleIntersection(b) ? b.allOf : [b]
  ];
  json2.allOf = allOf;
};
var tupleProcessor = (schema, ctx, _json, params) => {
  const json2 = _json;
  const def = schema._zod.def;
  json2.type = "array";
  const prefixPath = ctx.target === "draft-2020-12" ? "prefixItems" : "items";
  const restPath = ctx.target === "draft-2020-12" ? "items" : ctx.target === "openapi-3.0" ? "items" : "additionalItems";
  const prefixItems = def.items.map((x, i) => process(x, ctx, {
    ...params,
    path: [...params.path, prefixPath, i]
  }));
  const rest = def.rest ? process(def.rest, ctx, {
    ...params,
    path: [...params.path, restPath, ...ctx.target === "openapi-3.0" ? [def.items.length] : []]
  }) : null;
  if (ctx.target === "draft-2020-12") {
    json2.prefixItems = prefixItems;
    if (rest) {
      json2.items = rest;
    }
  } else if (ctx.target === "openapi-3.0") {
    json2.items = {
      anyOf: prefixItems
    };
    if (rest) {
      json2.items.anyOf.push(rest);
    }
    json2.minItems = prefixItems.length;
    if (!rest) {
      json2.maxItems = prefixItems.length;
    }
  } else {
    json2.items = prefixItems;
    if (rest) {
      json2.additionalItems = rest;
    }
  }
  const { minimum, maximum } = schema._zod.bag;
  if (typeof minimum === "number")
    json2.minItems = minimum;
  if (typeof maximum === "number")
    json2.maxItems = maximum;
};
var recordProcessor = (schema, ctx, _json, params) => {
  const json2 = _json;
  const def = schema._zod.def;
  json2.type = "object";
  const keyType = def.keyType;
  const keyBag = keyType._zod.bag;
  const patterns = keyBag?.patterns;
  if (def.mode === "loose" && patterns && patterns.size > 0) {
    const valueSchema = process(def.valueType, ctx, {
      ...params,
      path: [...params.path, "patternProperties", "*"]
    });
    json2.patternProperties = {};
    for (const pattern of patterns) {
      json2.patternProperties[pattern.source] = valueSchema;
    }
  } else {
    if (ctx.target === "draft-07" || ctx.target === "draft-2020-12") {
      json2.propertyNames = process(def.keyType, ctx, {
        ...params,
        path: [...params.path, "propertyNames"]
      });
    }
    json2.additionalProperties = process(def.valueType, ctx, {
      ...params,
      path: [...params.path, "additionalProperties"]
    });
  }
  const keyValues = keyType._zod.values;
  if (keyValues) {
    const validKeyValues = [...keyValues].filter((v) => typeof v === "string" || typeof v === "number");
    if (validKeyValues.length > 0) {
      json2.required = validKeyValues;
    }
  }
};
var nullableProcessor = (schema, ctx, json2, params) => {
  const def = schema._zod.def;
  const inner = process(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  if (ctx.target === "openapi-3.0") {
    seen.ref = def.innerType;
    json2.nullable = true;
  } else {
    json2.anyOf = [inner, { type: "null" }];
  }
};
var nonoptionalProcessor = (schema, ctx, _json, params) => {
  const def = schema._zod.def;
  process(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
};
var defaultProcessor = (schema, ctx, json2, params) => {
  const def = schema._zod.def;
  process(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  json2.default = JSON.parse(JSON.stringify(def.defaultValue));
};
var prefaultProcessor = (schema, ctx, json2, params) => {
  const def = schema._zod.def;
  process(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  if (ctx.io === "input")
    json2._prefault = JSON.parse(JSON.stringify(def.defaultValue));
};
var catchProcessor = (schema, ctx, json2, params) => {
  const def = schema._zod.def;
  process(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  let catchValue;
  try {
    catchValue = def.catchValue(void 0);
  } catch {
    throw new Error("Dynamic catch values are not supported in JSON Schema");
  }
  json2.default = catchValue;
};
var pipeProcessor = (schema, ctx, _json, params) => {
  const def = schema._zod.def;
  const innerType = ctx.io === "input" ? def.in._zod.def.type === "transform" ? def.out : def.in : def.out;
  process(innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = innerType;
};
var readonlyProcessor = (schema, ctx, json2, params) => {
  const def = schema._zod.def;
  process(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  json2.readOnly = true;
};
var promiseProcessor = (schema, ctx, _json, params) => {
  const def = schema._zod.def;
  process(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
};
var optionalProcessor = (schema, ctx, _json, params) => {
  const def = schema._zod.def;
  process(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
};
var lazyProcessor = (schema, ctx, _json, params) => {
  const innerType = schema._zod.innerType;
  process(innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = innerType;
};
var allProcessors = {
  string: stringProcessor,
  number: numberProcessor,
  boolean: booleanProcessor,
  bigint: bigintProcessor,
  symbol: symbolProcessor,
  null: nullProcessor,
  undefined: undefinedProcessor,
  void: voidProcessor,
  never: neverProcessor,
  any: anyProcessor,
  unknown: unknownProcessor,
  date: dateProcessor,
  enum: enumProcessor,
  literal: literalProcessor,
  nan: nanProcessor,
  template_literal: templateLiteralProcessor,
  file: fileProcessor,
  success: successProcessor,
  custom: customProcessor,
  function: functionProcessor,
  transform: transformProcessor,
  map: mapProcessor,
  set: setProcessor,
  array: arrayProcessor,
  object: objectProcessor,
  union: unionProcessor,
  intersection: intersectionProcessor,
  tuple: tupleProcessor,
  record: recordProcessor,
  nullable: nullableProcessor,
  nonoptional: nonoptionalProcessor,
  default: defaultProcessor,
  prefault: prefaultProcessor,
  catch: catchProcessor,
  pipe: pipeProcessor,
  readonly: readonlyProcessor,
  promise: promiseProcessor,
  optional: optionalProcessor,
  lazy: lazyProcessor
};
function toJSONSchema(input, params) {
  if ("_idmap" in input) {
    const registry2 = input;
    const ctx2 = initializeContext({ ...params, processors: allProcessors });
    const defs = {};
    for (const entry of registry2._idmap.entries()) {
      const [_, schema] = entry;
      process(schema, ctx2);
    }
    const schemas = {};
    const external = {
      registry: registry2,
      uri: params?.uri,
      defs
    };
    ctx2.external = external;
    for (const entry of registry2._idmap.entries()) {
      const [key, schema] = entry;
      extractDefs(ctx2, schema);
      schemas[key] = finalize(ctx2, schema);
    }
    if (Object.keys(defs).length > 0) {
      const defsSegment = ctx2.target === "draft-2020-12" ? "$defs" : "definitions";
      schemas.__shared = {
        [defsSegment]: defs
      };
    }
    return { schemas };
  }
  const ctx = initializeContext({ ...params, processors: allProcessors });
  process(input, ctx);
  extractDefs(ctx, input);
  return finalize(ctx, input);
}

// ../../node_modules/zod/v4/core/json-schema-generator.js
var JSONSchemaGenerator = class {
  /** @deprecated Access via ctx instead */
  get metadataRegistry() {
    return this.ctx.metadataRegistry;
  }
  /** @deprecated Access via ctx instead */
  get target() {
    return this.ctx.target;
  }
  /** @deprecated Access via ctx instead */
  get unrepresentable() {
    return this.ctx.unrepresentable;
  }
  /** @deprecated Access via ctx instead */
  get override() {
    return this.ctx.override;
  }
  /** @deprecated Access via ctx instead */
  get io() {
    return this.ctx.io;
  }
  /** @deprecated Access via ctx instead */
  get counter() {
    return this.ctx.counter;
  }
  set counter(value) {
    this.ctx.counter = value;
  }
  /** @deprecated Access via ctx instead */
  get seen() {
    return this.ctx.seen;
  }
  constructor(params) {
    let normalizedTarget = params?.target ?? "draft-2020-12";
    if (normalizedTarget === "draft-4")
      normalizedTarget = "draft-04";
    if (normalizedTarget === "draft-7")
      normalizedTarget = "draft-07";
    this.ctx = initializeContext({
      processors: allProcessors,
      target: normalizedTarget,
      ...params?.metadata && { metadata: params.metadata },
      ...params?.unrepresentable && { unrepresentable: params.unrepresentable },
      ...params?.override && { override: params.override },
      ...params?.io && { io: params.io }
    });
  }
  /**
   * Process a schema to prepare it for JSON Schema generation.
   * This must be called before emit().
   */
  process(schema, _params = { path: [], schemaPath: [] }) {
    return process(schema, this.ctx, _params);
  }
  /**
   * Emit the final JSON Schema after processing.
   * Must call process() first.
   */
  emit(schema, _params) {
    if (_params) {
      if (_params.cycles)
        this.ctx.cycles = _params.cycles;
      if (_params.reused)
        this.ctx.reused = _params.reused;
      if (_params.external)
        this.ctx.external = _params.external;
    }
    extractDefs(this.ctx, schema);
    const result = finalize(this.ctx, schema);
    const { "~standard": _, ...plainResult } = result;
    return plainResult;
  }
};

// ../../node_modules/zod/v4/core/json-schema.js
var json_schema_exports = {};

// ../../node_modules/zod/v4/classic/schemas.js
var schemas_exports2 = {};
__export(schemas_exports2, {
  ZodAny: () => ZodAny,
  ZodArray: () => ZodArray,
  ZodBase64: () => ZodBase64,
  ZodBase64URL: () => ZodBase64URL,
  ZodBigInt: () => ZodBigInt,
  ZodBigIntFormat: () => ZodBigIntFormat,
  ZodBoolean: () => ZodBoolean,
  ZodCIDRv4: () => ZodCIDRv4,
  ZodCIDRv6: () => ZodCIDRv6,
  ZodCUID: () => ZodCUID,
  ZodCUID2: () => ZodCUID2,
  ZodCatch: () => ZodCatch,
  ZodCodec: () => ZodCodec,
  ZodCustom: () => ZodCustom,
  ZodCustomStringFormat: () => ZodCustomStringFormat,
  ZodDate: () => ZodDate,
  ZodDefault: () => ZodDefault,
  ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
  ZodE164: () => ZodE164,
  ZodEmail: () => ZodEmail,
  ZodEmoji: () => ZodEmoji,
  ZodEnum: () => ZodEnum,
  ZodExactOptional: () => ZodExactOptional,
  ZodFile: () => ZodFile,
  ZodFunction: () => ZodFunction,
  ZodGUID: () => ZodGUID,
  ZodIPv4: () => ZodIPv4,
  ZodIPv6: () => ZodIPv6,
  ZodIntersection: () => ZodIntersection,
  ZodJWT: () => ZodJWT,
  ZodKSUID: () => ZodKSUID,
  ZodLazy: () => ZodLazy,
  ZodLiteral: () => ZodLiteral,
  ZodMAC: () => ZodMAC,
  ZodMap: () => ZodMap,
  ZodNaN: () => ZodNaN,
  ZodNanoID: () => ZodNanoID,
  ZodNever: () => ZodNever,
  ZodNonOptional: () => ZodNonOptional,
  ZodNull: () => ZodNull,
  ZodNullable: () => ZodNullable,
  ZodNumber: () => ZodNumber,
  ZodNumberFormat: () => ZodNumberFormat,
  ZodObject: () => ZodObject,
  ZodOptional: () => ZodOptional,
  ZodPipe: () => ZodPipe,
  ZodPrefault: () => ZodPrefault,
  ZodPromise: () => ZodPromise,
  ZodReadonly: () => ZodReadonly,
  ZodRecord: () => ZodRecord,
  ZodSet: () => ZodSet,
  ZodString: () => ZodString,
  ZodStringFormat: () => ZodStringFormat,
  ZodSuccess: () => ZodSuccess,
  ZodSymbol: () => ZodSymbol,
  ZodTemplateLiteral: () => ZodTemplateLiteral,
  ZodTransform: () => ZodTransform,
  ZodTuple: () => ZodTuple,
  ZodType: () => ZodType,
  ZodULID: () => ZodULID,
  ZodURL: () => ZodURL,
  ZodUUID: () => ZodUUID,
  ZodUndefined: () => ZodUndefined,
  ZodUnion: () => ZodUnion,
  ZodUnknown: () => ZodUnknown,
  ZodVoid: () => ZodVoid,
  ZodXID: () => ZodXID,
  ZodXor: () => ZodXor,
  _ZodString: () => _ZodString,
  _default: () => _default2,
  _function: () => _function,
  any: () => any,
  array: () => array,
  base64: () => base642,
  base64url: () => base64url2,
  bigint: () => bigint2,
  boolean: () => boolean2,
  catch: () => _catch2,
  check: () => check,
  cidrv4: () => cidrv42,
  cidrv6: () => cidrv62,
  codec: () => codec,
  cuid: () => cuid3,
  cuid2: () => cuid22,
  custom: () => custom,
  date: () => date3,
  describe: () => describe2,
  discriminatedUnion: () => discriminatedUnion,
  e164: () => e1642,
  email: () => email2,
  emoji: () => emoji2,
  enum: () => _enum2,
  exactOptional: () => exactOptional,
  file: () => file,
  float32: () => float32,
  float64: () => float64,
  function: () => _function,
  guid: () => guid2,
  hash: () => hash,
  hex: () => hex2,
  hostname: () => hostname2,
  httpUrl: () => httpUrl,
  instanceof: () => _instanceof,
  int: () => int,
  int32: () => int32,
  int64: () => int64,
  intersection: () => intersection,
  ipv4: () => ipv42,
  ipv6: () => ipv62,
  json: () => json,
  jwt: () => jwt,
  keyof: () => keyof,
  ksuid: () => ksuid2,
  lazy: () => lazy,
  literal: () => literal,
  looseObject: () => looseObject,
  looseRecord: () => looseRecord,
  mac: () => mac2,
  map: () => map,
  meta: () => meta2,
  nan: () => nan,
  nanoid: () => nanoid2,
  nativeEnum: () => nativeEnum,
  never: () => never,
  nonoptional: () => nonoptional,
  null: () => _null3,
  nullable: () => nullable,
  nullish: () => nullish2,
  number: () => number2,
  object: () => object,
  optional: () => optional,
  partialRecord: () => partialRecord,
  pipe: () => pipe,
  prefault: () => prefault,
  preprocess: () => preprocess,
  promise: () => promise,
  readonly: () => readonly,
  record: () => record,
  refine: () => refine,
  set: () => set,
  strictObject: () => strictObject,
  string: () => string2,
  stringFormat: () => stringFormat,
  stringbool: () => stringbool,
  success: () => success,
  superRefine: () => superRefine,
  symbol: () => symbol,
  templateLiteral: () => templateLiteral,
  transform: () => transform,
  tuple: () => tuple,
  uint32: () => uint32,
  uint64: () => uint64,
  ulid: () => ulid2,
  undefined: () => _undefined3,
  union: () => union,
  unknown: () => unknown,
  url: () => url,
  uuid: () => uuid2,
  uuidv4: () => uuidv4,
  uuidv6: () => uuidv6,
  uuidv7: () => uuidv7,
  void: () => _void2,
  xid: () => xid2,
  xor: () => xor
});

// ../../node_modules/zod/v4/classic/checks.js
var checks_exports2 = {};
__export(checks_exports2, {
  endsWith: () => _endsWith,
  gt: () => _gt,
  gte: () => _gte,
  includes: () => _includes,
  length: () => _length,
  lowercase: () => _lowercase,
  lt: () => _lt,
  lte: () => _lte,
  maxLength: () => _maxLength,
  maxSize: () => _maxSize,
  mime: () => _mime,
  minLength: () => _minLength,
  minSize: () => _minSize,
  multipleOf: () => _multipleOf,
  negative: () => _negative,
  nonnegative: () => _nonnegative,
  nonpositive: () => _nonpositive,
  normalize: () => _normalize,
  overwrite: () => _overwrite,
  positive: () => _positive,
  property: () => _property,
  regex: () => _regex,
  size: () => _size,
  slugify: () => _slugify,
  startsWith: () => _startsWith,
  toLowerCase: () => _toLowerCase,
  toUpperCase: () => _toUpperCase,
  trim: () => _trim,
  uppercase: () => _uppercase
});

// ../../node_modules/zod/v4/classic/iso.js
var iso_exports = {};
__export(iso_exports, {
  ZodISODate: () => ZodISODate,
  ZodISODateTime: () => ZodISODateTime,
  ZodISODuration: () => ZodISODuration,
  ZodISOTime: () => ZodISOTime,
  date: () => date2,
  datetime: () => datetime2,
  duration: () => duration2,
  time: () => time2
});
var ZodISODateTime = /* @__PURE__ */ $constructor("ZodISODateTime", (inst, def) => {
  $ZodISODateTime.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function datetime2(params) {
  return _isoDateTime(ZodISODateTime, params);
}
var ZodISODate = /* @__PURE__ */ $constructor("ZodISODate", (inst, def) => {
  $ZodISODate.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function date2(params) {
  return _isoDate(ZodISODate, params);
}
var ZodISOTime = /* @__PURE__ */ $constructor("ZodISOTime", (inst, def) => {
  $ZodISOTime.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function time2(params) {
  return _isoTime(ZodISOTime, params);
}
var ZodISODuration = /* @__PURE__ */ $constructor("ZodISODuration", (inst, def) => {
  $ZodISODuration.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function duration2(params) {
  return _isoDuration(ZodISODuration, params);
}

// ../../node_modules/zod/v4/classic/errors.js
var initializer2 = (inst, issues) => {
  $ZodError.init(inst, issues);
  inst.name = "ZodError";
  Object.defineProperties(inst, {
    format: {
      value: (mapper) => formatError(inst, mapper)
      // enumerable: false,
    },
    flatten: {
      value: (mapper) => flattenError(inst, mapper)
      // enumerable: false,
    },
    addIssue: {
      value: (issue2) => {
        inst.issues.push(issue2);
        inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
      }
      // enumerable: false,
    },
    addIssues: {
      value: (issues2) => {
        inst.issues.push(...issues2);
        inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
      }
      // enumerable: false,
    },
    isEmpty: {
      get() {
        return inst.issues.length === 0;
      }
      // enumerable: false,
    }
  });
};
var ZodError = $constructor("ZodError", initializer2);
var ZodRealError = $constructor("ZodError", initializer2, {
  Parent: Error
});

// ../../node_modules/zod/v4/classic/parse.js
var parse2 = /* @__PURE__ */ _parse(ZodRealError);
var parseAsync2 = /* @__PURE__ */ _parseAsync(ZodRealError);
var safeParse2 = /* @__PURE__ */ _safeParse(ZodRealError);
var safeParseAsync2 = /* @__PURE__ */ _safeParseAsync(ZodRealError);
var encode2 = /* @__PURE__ */ _encode(ZodRealError);
var decode2 = /* @__PURE__ */ _decode(ZodRealError);
var encodeAsync2 = /* @__PURE__ */ _encodeAsync(ZodRealError);
var decodeAsync2 = /* @__PURE__ */ _decodeAsync(ZodRealError);
var safeEncode2 = /* @__PURE__ */ _safeEncode(ZodRealError);
var safeDecode2 = /* @__PURE__ */ _safeDecode(ZodRealError);
var safeEncodeAsync2 = /* @__PURE__ */ _safeEncodeAsync(ZodRealError);
var safeDecodeAsync2 = /* @__PURE__ */ _safeDecodeAsync(ZodRealError);

// ../../node_modules/zod/v4/classic/schemas.js
var ZodType = /* @__PURE__ */ $constructor("ZodType", (inst, def) => {
  $ZodType.init(inst, def);
  Object.assign(inst["~standard"], {
    jsonSchema: {
      input: createStandardJSONSchemaMethod(inst, "input"),
      output: createStandardJSONSchemaMethod(inst, "output")
    }
  });
  inst.toJSONSchema = createToJSONSchemaMethod(inst, {});
  inst.def = def;
  inst.type = def.type;
  Object.defineProperty(inst, "_def", { value: def });
  inst.check = (...checks) => {
    return inst.clone(util_exports.mergeDefs(def, {
      checks: [
        ...def.checks ?? [],
        ...checks.map((ch) => typeof ch === "function" ? { _zod: { check: ch, def: { check: "custom" }, onattach: [] } } : ch)
      ]
    }), {
      parent: true
    });
  };
  inst.with = inst.check;
  inst.clone = (def2, params) => clone(inst, def2, params);
  inst.brand = () => inst;
  inst.register = ((reg, meta3) => {
    reg.add(inst, meta3);
    return inst;
  });
  inst.parse = (data, params) => parse2(inst, data, params, { callee: inst.parse });
  inst.safeParse = (data, params) => safeParse2(inst, data, params);
  inst.parseAsync = async (data, params) => parseAsync2(inst, data, params, { callee: inst.parseAsync });
  inst.safeParseAsync = async (data, params) => safeParseAsync2(inst, data, params);
  inst.spa = inst.safeParseAsync;
  inst.encode = (data, params) => encode2(inst, data, params);
  inst.decode = (data, params) => decode2(inst, data, params);
  inst.encodeAsync = async (data, params) => encodeAsync2(inst, data, params);
  inst.decodeAsync = async (data, params) => decodeAsync2(inst, data, params);
  inst.safeEncode = (data, params) => safeEncode2(inst, data, params);
  inst.safeDecode = (data, params) => safeDecode2(inst, data, params);
  inst.safeEncodeAsync = async (data, params) => safeEncodeAsync2(inst, data, params);
  inst.safeDecodeAsync = async (data, params) => safeDecodeAsync2(inst, data, params);
  inst.refine = (check2, params) => inst.check(refine(check2, params));
  inst.superRefine = (refinement) => inst.check(superRefine(refinement));
  inst.overwrite = (fn) => inst.check(_overwrite(fn));
  inst.optional = () => optional(inst);
  inst.exactOptional = () => exactOptional(inst);
  inst.nullable = () => nullable(inst);
  inst.nullish = () => optional(nullable(inst));
  inst.nonoptional = (params) => nonoptional(inst, params);
  inst.array = () => array(inst);
  inst.or = (arg) => union([inst, arg]);
  inst.and = (arg) => intersection(inst, arg);
  inst.transform = (tx) => pipe(inst, transform(tx));
  inst.default = (def2) => _default2(inst, def2);
  inst.prefault = (def2) => prefault(inst, def2);
  inst.catch = (params) => _catch2(inst, params);
  inst.pipe = (target) => pipe(inst, target);
  inst.readonly = () => readonly(inst);
  inst.describe = (description) => {
    const cl = inst.clone();
    globalRegistry.add(cl, { description });
    return cl;
  };
  Object.defineProperty(inst, "description", {
    get() {
      return globalRegistry.get(inst)?.description;
    },
    configurable: true
  });
  inst.meta = (...args) => {
    if (args.length === 0) {
      return globalRegistry.get(inst);
    }
    const cl = inst.clone();
    globalRegistry.add(cl, args[0]);
    return cl;
  };
  inst.isOptional = () => inst.safeParse(void 0).success;
  inst.isNullable = () => inst.safeParse(null).success;
  inst.apply = (fn) => fn(inst);
  return inst;
});
var _ZodString = /* @__PURE__ */ $constructor("_ZodString", (inst, def) => {
  $ZodString.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json2, params) => stringProcessor(inst, ctx, json2, params);
  const bag = inst._zod.bag;
  inst.format = bag.format ?? null;
  inst.minLength = bag.minimum ?? null;
  inst.maxLength = bag.maximum ?? null;
  inst.regex = (...args) => inst.check(_regex(...args));
  inst.includes = (...args) => inst.check(_includes(...args));
  inst.startsWith = (...args) => inst.check(_startsWith(...args));
  inst.endsWith = (...args) => inst.check(_endsWith(...args));
  inst.min = (...args) => inst.check(_minLength(...args));
  inst.max = (...args) => inst.check(_maxLength(...args));
  inst.length = (...args) => inst.check(_length(...args));
  inst.nonempty = (...args) => inst.check(_minLength(1, ...args));
  inst.lowercase = (params) => inst.check(_lowercase(params));
  inst.uppercase = (params) => inst.check(_uppercase(params));
  inst.trim = () => inst.check(_trim());
  inst.normalize = (...args) => inst.check(_normalize(...args));
  inst.toLowerCase = () => inst.check(_toLowerCase());
  inst.toUpperCase = () => inst.check(_toUpperCase());
  inst.slugify = () => inst.check(_slugify());
});
var ZodString = /* @__PURE__ */ $constructor("ZodString", (inst, def) => {
  $ZodString.init(inst, def);
  _ZodString.init(inst, def);
  inst.email = (params) => inst.check(_email(ZodEmail, params));
  inst.url = (params) => inst.check(_url(ZodURL, params));
  inst.jwt = (params) => inst.check(_jwt(ZodJWT, params));
  inst.emoji = (params) => inst.check(_emoji2(ZodEmoji, params));
  inst.guid = (params) => inst.check(_guid(ZodGUID, params));
  inst.uuid = (params) => inst.check(_uuid(ZodUUID, params));
  inst.uuidv4 = (params) => inst.check(_uuidv4(ZodUUID, params));
  inst.uuidv6 = (params) => inst.check(_uuidv6(ZodUUID, params));
  inst.uuidv7 = (params) => inst.check(_uuidv7(ZodUUID, params));
  inst.nanoid = (params) => inst.check(_nanoid(ZodNanoID, params));
  inst.guid = (params) => inst.check(_guid(ZodGUID, params));
  inst.cuid = (params) => inst.check(_cuid(ZodCUID, params));
  inst.cuid2 = (params) => inst.check(_cuid2(ZodCUID2, params));
  inst.ulid = (params) => inst.check(_ulid(ZodULID, params));
  inst.base64 = (params) => inst.check(_base64(ZodBase64, params));
  inst.base64url = (params) => inst.check(_base64url(ZodBase64URL, params));
  inst.xid = (params) => inst.check(_xid(ZodXID, params));
  inst.ksuid = (params) => inst.check(_ksuid(ZodKSUID, params));
  inst.ipv4 = (params) => inst.check(_ipv4(ZodIPv4, params));
  inst.ipv6 = (params) => inst.check(_ipv6(ZodIPv6, params));
  inst.cidrv4 = (params) => inst.check(_cidrv4(ZodCIDRv4, params));
  inst.cidrv6 = (params) => inst.check(_cidrv6(ZodCIDRv6, params));
  inst.e164 = (params) => inst.check(_e164(ZodE164, params));
  inst.datetime = (params) => inst.check(datetime2(params));
  inst.date = (params) => inst.check(date2(params));
  inst.time = (params) => inst.check(time2(params));
  inst.duration = (params) => inst.check(duration2(params));
});
function string2(params) {
  return _string(ZodString, params);
}
var ZodStringFormat = /* @__PURE__ */ $constructor("ZodStringFormat", (inst, def) => {
  $ZodStringFormat.init(inst, def);
  _ZodString.init(inst, def);
});
var ZodEmail = /* @__PURE__ */ $constructor("ZodEmail", (inst, def) => {
  $ZodEmail.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function email2(params) {
  return _email(ZodEmail, params);
}
var ZodGUID = /* @__PURE__ */ $constructor("ZodGUID", (inst, def) => {
  $ZodGUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function guid2(params) {
  return _guid(ZodGUID, params);
}
var ZodUUID = /* @__PURE__ */ $constructor("ZodUUID", (inst, def) => {
  $ZodUUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function uuid2(params) {
  return _uuid(ZodUUID, params);
}
function uuidv4(params) {
  return _uuidv4(ZodUUID, params);
}
function uuidv6(params) {
  return _uuidv6(ZodUUID, params);
}
function uuidv7(params) {
  return _uuidv7(ZodUUID, params);
}
var ZodURL = /* @__PURE__ */ $constructor("ZodURL", (inst, def) => {
  $ZodURL.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function url(params) {
  return _url(ZodURL, params);
}
function httpUrl(params) {
  return _url(ZodURL, {
    protocol: /^https?$/,
    hostname: regexes_exports.domain,
    ...util_exports.normalizeParams(params)
  });
}
var ZodEmoji = /* @__PURE__ */ $constructor("ZodEmoji", (inst, def) => {
  $ZodEmoji.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function emoji2(params) {
  return _emoji2(ZodEmoji, params);
}
var ZodNanoID = /* @__PURE__ */ $constructor("ZodNanoID", (inst, def) => {
  $ZodNanoID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function nanoid2(params) {
  return _nanoid(ZodNanoID, params);
}
var ZodCUID = /* @__PURE__ */ $constructor("ZodCUID", (inst, def) => {
  $ZodCUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function cuid3(params) {
  return _cuid(ZodCUID, params);
}
var ZodCUID2 = /* @__PURE__ */ $constructor("ZodCUID2", (inst, def) => {
  $ZodCUID2.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function cuid22(params) {
  return _cuid2(ZodCUID2, params);
}
var ZodULID = /* @__PURE__ */ $constructor("ZodULID", (inst, def) => {
  $ZodULID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function ulid2(params) {
  return _ulid(ZodULID, params);
}
var ZodXID = /* @__PURE__ */ $constructor("ZodXID", (inst, def) => {
  $ZodXID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function xid2(params) {
  return _xid(ZodXID, params);
}
var ZodKSUID = /* @__PURE__ */ $constructor("ZodKSUID", (inst, def) => {
  $ZodKSUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function ksuid2(params) {
  return _ksuid(ZodKSUID, params);
}
var ZodIPv4 = /* @__PURE__ */ $constructor("ZodIPv4", (inst, def) => {
  $ZodIPv4.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function ipv42(params) {
  return _ipv4(ZodIPv4, params);
}
var ZodMAC = /* @__PURE__ */ $constructor("ZodMAC", (inst, def) => {
  $ZodMAC.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function mac2(params) {
  return _mac(ZodMAC, params);
}
var ZodIPv6 = /* @__PURE__ */ $constructor("ZodIPv6", (inst, def) => {
  $ZodIPv6.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function ipv62(params) {
  return _ipv6(ZodIPv6, params);
}
var ZodCIDRv4 = /* @__PURE__ */ $constructor("ZodCIDRv4", (inst, def) => {
  $ZodCIDRv4.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function cidrv42(params) {
  return _cidrv4(ZodCIDRv4, params);
}
var ZodCIDRv6 = /* @__PURE__ */ $constructor("ZodCIDRv6", (inst, def) => {
  $ZodCIDRv6.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function cidrv62(params) {
  return _cidrv6(ZodCIDRv6, params);
}
var ZodBase64 = /* @__PURE__ */ $constructor("ZodBase64", (inst, def) => {
  $ZodBase64.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function base642(params) {
  return _base64(ZodBase64, params);
}
var ZodBase64URL = /* @__PURE__ */ $constructor("ZodBase64URL", (inst, def) => {
  $ZodBase64URL.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function base64url2(params) {
  return _base64url(ZodBase64URL, params);
}
var ZodE164 = /* @__PURE__ */ $constructor("ZodE164", (inst, def) => {
  $ZodE164.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function e1642(params) {
  return _e164(ZodE164, params);
}
var ZodJWT = /* @__PURE__ */ $constructor("ZodJWT", (inst, def) => {
  $ZodJWT.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function jwt(params) {
  return _jwt(ZodJWT, params);
}
var ZodCustomStringFormat = /* @__PURE__ */ $constructor("ZodCustomStringFormat", (inst, def) => {
  $ZodCustomStringFormat.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function stringFormat(format, fnOrRegex, _params = {}) {
  return _stringFormat(ZodCustomStringFormat, format, fnOrRegex, _params);
}
function hostname2(_params) {
  return _stringFormat(ZodCustomStringFormat, "hostname", regexes_exports.hostname, _params);
}
function hex2(_params) {
  return _stringFormat(ZodCustomStringFormat, "hex", regexes_exports.hex, _params);
}
function hash(alg, params) {
  const enc = params?.enc ?? "hex";
  const format = `${alg}_${enc}`;
  const regex = regexes_exports[format];
  if (!regex)
    throw new Error(`Unrecognized hash format: ${format}`);
  return _stringFormat(ZodCustomStringFormat, format, regex, params);
}
var ZodNumber = /* @__PURE__ */ $constructor("ZodNumber", (inst, def) => {
  $ZodNumber.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json2, params) => numberProcessor(inst, ctx, json2, params);
  inst.gt = (value, params) => inst.check(_gt(value, params));
  inst.gte = (value, params) => inst.check(_gte(value, params));
  inst.min = (value, params) => inst.check(_gte(value, params));
  inst.lt = (value, params) => inst.check(_lt(value, params));
  inst.lte = (value, params) => inst.check(_lte(value, params));
  inst.max = (value, params) => inst.check(_lte(value, params));
  inst.int = (params) => inst.check(int(params));
  inst.safe = (params) => inst.check(int(params));
  inst.positive = (params) => inst.check(_gt(0, params));
  inst.nonnegative = (params) => inst.check(_gte(0, params));
  inst.negative = (params) => inst.check(_lt(0, params));
  inst.nonpositive = (params) => inst.check(_lte(0, params));
  inst.multipleOf = (value, params) => inst.check(_multipleOf(value, params));
  inst.step = (value, params) => inst.check(_multipleOf(value, params));
  inst.finite = () => inst;
  const bag = inst._zod.bag;
  inst.minValue = Math.max(bag.minimum ?? Number.NEGATIVE_INFINITY, bag.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null;
  inst.maxValue = Math.min(bag.maximum ?? Number.POSITIVE_INFINITY, bag.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null;
  inst.isInt = (bag.format ?? "").includes("int") || Number.isSafeInteger(bag.multipleOf ?? 0.5);
  inst.isFinite = true;
  inst.format = bag.format ?? null;
});
function number2(params) {
  return _number(ZodNumber, params);
}
var ZodNumberFormat = /* @__PURE__ */ $constructor("ZodNumberFormat", (inst, def) => {
  $ZodNumberFormat.init(inst, def);
  ZodNumber.init(inst, def);
});
function int(params) {
  return _int(ZodNumberFormat, params);
}
function float32(params) {
  return _float32(ZodNumberFormat, params);
}
function float64(params) {
  return _float64(ZodNumberFormat, params);
}
function int32(params) {
  return _int32(ZodNumberFormat, params);
}
function uint32(params) {
  return _uint32(ZodNumberFormat, params);
}
var ZodBoolean = /* @__PURE__ */ $constructor("ZodBoolean", (inst, def) => {
  $ZodBoolean.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json2, params) => booleanProcessor(inst, ctx, json2, params);
});
function boolean2(params) {
  return _boolean(ZodBoolean, params);
}
var ZodBigInt = /* @__PURE__ */ $constructor("ZodBigInt", (inst, def) => {
  $ZodBigInt.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json2, params) => bigintProcessor(inst, ctx, json2, params);
  inst.gte = (value, params) => inst.check(_gte(value, params));
  inst.min = (value, params) => inst.check(_gte(value, params));
  inst.gt = (value, params) => inst.check(_gt(value, params));
  inst.gte = (value, params) => inst.check(_gte(value, params));
  inst.min = (value, params) => inst.check(_gte(value, params));
  inst.lt = (value, params) => inst.check(_lt(value, params));
  inst.lte = (value, params) => inst.check(_lte(value, params));
  inst.max = (value, params) => inst.check(_lte(value, params));
  inst.positive = (params) => inst.check(_gt(BigInt(0), params));
  inst.negative = (params) => inst.check(_lt(BigInt(0), params));
  inst.nonpositive = (params) => inst.check(_lte(BigInt(0), params));
  inst.nonnegative = (params) => inst.check(_gte(BigInt(0), params));
  inst.multipleOf = (value, params) => inst.check(_multipleOf(value, params));
  const bag = inst._zod.bag;
  inst.minValue = bag.minimum ?? null;
  inst.maxValue = bag.maximum ?? null;
  inst.format = bag.format ?? null;
});
function bigint2(params) {
  return _bigint(ZodBigInt, params);
}
var ZodBigIntFormat = /* @__PURE__ */ $constructor("ZodBigIntFormat", (inst, def) => {
  $ZodBigIntFormat.init(inst, def);
  ZodBigInt.init(inst, def);
});
function int64(params) {
  return _int64(ZodBigIntFormat, params);
}
function uint64(params) {
  return _uint64(ZodBigIntFormat, params);
}
var ZodSymbol = /* @__PURE__ */ $constructor("ZodSymbol", (inst, def) => {
  $ZodSymbol.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json2, params) => symbolProcessor(inst, ctx, json2, params);
});
function symbol(params) {
  return _symbol(ZodSymbol, params);
}
var ZodUndefined = /* @__PURE__ */ $constructor("ZodUndefined", (inst, def) => {
  $ZodUndefined.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json2, params) => undefinedProcessor(inst, ctx, json2, params);
});
function _undefined3(params) {
  return _undefined2(ZodUndefined, params);
}
var ZodNull = /* @__PURE__ */ $constructor("ZodNull", (inst, def) => {
  $ZodNull.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json2, params) => nullProcessor(inst, ctx, json2, params);
});
function _null3(params) {
  return _null2(ZodNull, params);
}
var ZodAny = /* @__PURE__ */ $constructor("ZodAny", (inst, def) => {
  $ZodAny.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json2, params) => anyProcessor(inst, ctx, json2, params);
});
function any() {
  return _any(ZodAny);
}
var ZodUnknown = /* @__PURE__ */ $constructor("ZodUnknown", (inst, def) => {
  $ZodUnknown.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json2, params) => unknownProcessor(inst, ctx, json2, params);
});
function unknown() {
  return _unknown(ZodUnknown);
}
var ZodNever = /* @__PURE__ */ $constructor("ZodNever", (inst, def) => {
  $ZodNever.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json2, params) => neverProcessor(inst, ctx, json2, params);
});
function never(params) {
  return _never(ZodNever, params);
}
var ZodVoid = /* @__PURE__ */ $constructor("ZodVoid", (inst, def) => {
  $ZodVoid.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json2, params) => voidProcessor(inst, ctx, json2, params);
});
function _void2(params) {
  return _void(ZodVoid, params);
}
var ZodDate = /* @__PURE__ */ $constructor("ZodDate", (inst, def) => {
  $ZodDate.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json2, params) => dateProcessor(inst, ctx, json2, params);
  inst.min = (value, params) => inst.check(_gte(value, params));
  inst.max = (value, params) => inst.check(_lte(value, params));
  const c = inst._zod.bag;
  inst.minDate = c.minimum ? new Date(c.minimum) : null;
  inst.maxDate = c.maximum ? new Date(c.maximum) : null;
});
function date3(params) {
  return _date(ZodDate, params);
}
var ZodArray = /* @__PURE__ */ $constructor("ZodArray", (inst, def) => {
  $ZodArray.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json2, params) => arrayProcessor(inst, ctx, json2, params);
  inst.element = def.element;
  inst.min = (minLength, params) => inst.check(_minLength(minLength, params));
  inst.nonempty = (params) => inst.check(_minLength(1, params));
  inst.max = (maxLength, params) => inst.check(_maxLength(maxLength, params));
  inst.length = (len, params) => inst.check(_length(len, params));
  inst.unwrap = () => inst.element;
});
function array(element, params) {
  return _array(ZodArray, element, params);
}
function keyof(schema) {
  const shape = schema._zod.def.shape;
  return _enum2(Object.keys(shape));
}
var ZodObject = /* @__PURE__ */ $constructor("ZodObject", (inst, def) => {
  $ZodObjectJIT.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json2, params) => objectProcessor(inst, ctx, json2, params);
  util_exports.defineLazy(inst, "shape", () => {
    return def.shape;
  });
  inst.keyof = () => _enum2(Object.keys(inst._zod.def.shape));
  inst.catchall = (catchall) => inst.clone({ ...inst._zod.def, catchall });
  inst.passthrough = () => inst.clone({ ...inst._zod.def, catchall: unknown() });
  inst.loose = () => inst.clone({ ...inst._zod.def, catchall: unknown() });
  inst.strict = () => inst.clone({ ...inst._zod.def, catchall: never() });
  inst.strip = () => inst.clone({ ...inst._zod.def, catchall: void 0 });
  inst.extend = (incoming) => {
    return util_exports.extend(inst, incoming);
  };
  inst.safeExtend = (incoming) => {
    return util_exports.safeExtend(inst, incoming);
  };
  inst.merge = (other) => util_exports.merge(inst, other);
  inst.pick = (mask) => util_exports.pick(inst, mask);
  inst.omit = (mask) => util_exports.omit(inst, mask);
  inst.partial = (...args) => util_exports.partial(ZodOptional, inst, args[0]);
  inst.required = (...args) => util_exports.required(ZodNonOptional, inst, args[0]);
});
function object(shape, params) {
  const def = {
    type: "object",
    shape: shape ?? {},
    ...util_exports.normalizeParams(params)
  };
  return new ZodObject(def);
}
function strictObject(shape, params) {
  return new ZodObject({
    type: "object",
    shape,
    catchall: never(),
    ...util_exports.normalizeParams(params)
  });
}
function looseObject(shape, params) {
  return new ZodObject({
    type: "object",
    shape,
    catchall: unknown(),
    ...util_exports.normalizeParams(params)
  });
}
var ZodUnion = /* @__PURE__ */ $constructor("ZodUnion", (inst, def) => {
  $ZodUnion.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json2, params) => unionProcessor(inst, ctx, json2, params);
  inst.options = def.options;
});
function union(options, params) {
  return new ZodUnion({
    type: "union",
    options,
    ...util_exports.normalizeParams(params)
  });
}
var ZodXor = /* @__PURE__ */ $constructor("ZodXor", (inst, def) => {
  ZodUnion.init(inst, def);
  $ZodXor.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json2, params) => unionProcessor(inst, ctx, json2, params);
  inst.options = def.options;
});
function xor(options, params) {
  return new ZodXor({
    type: "union",
    options,
    inclusive: false,
    ...util_exports.normalizeParams(params)
  });
}
var ZodDiscriminatedUnion = /* @__PURE__ */ $constructor("ZodDiscriminatedUnion", (inst, def) => {
  ZodUnion.init(inst, def);
  $ZodDiscriminatedUnion.init(inst, def);
});
function discriminatedUnion(discriminator, options, params) {
  return new ZodDiscriminatedUnion({
    type: "union",
    options,
    discriminator,
    ...util_exports.normalizeParams(params)
  });
}
var ZodIntersection = /* @__PURE__ */ $constructor("ZodIntersection", (inst, def) => {
  $ZodIntersection.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json2, params) => intersectionProcessor(inst, ctx, json2, params);
});
function intersection(left, right) {
  return new ZodIntersection({
    type: "intersection",
    left,
    right
  });
}
var ZodTuple = /* @__PURE__ */ $constructor("ZodTuple", (inst, def) => {
  $ZodTuple.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json2, params) => tupleProcessor(inst, ctx, json2, params);
  inst.rest = (rest) => inst.clone({
    ...inst._zod.def,
    rest
  });
});
function tuple(items, _paramsOrRest, _params) {
  const hasRest = _paramsOrRest instanceof $ZodType;
  const params = hasRest ? _params : _paramsOrRest;
  const rest = hasRest ? _paramsOrRest : null;
  return new ZodTuple({
    type: "tuple",
    items,
    rest,
    ...util_exports.normalizeParams(params)
  });
}
var ZodRecord = /* @__PURE__ */ $constructor("ZodRecord", (inst, def) => {
  $ZodRecord.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json2, params) => recordProcessor(inst, ctx, json2, params);
  inst.keyType = def.keyType;
  inst.valueType = def.valueType;
});
function record(keyType, valueType, params) {
  return new ZodRecord({
    type: "record",
    keyType,
    valueType,
    ...util_exports.normalizeParams(params)
  });
}
function partialRecord(keyType, valueType, params) {
  const k = clone(keyType);
  k._zod.values = void 0;
  return new ZodRecord({
    type: "record",
    keyType: k,
    valueType,
    ...util_exports.normalizeParams(params)
  });
}
function looseRecord(keyType, valueType, params) {
  return new ZodRecord({
    type: "record",
    keyType,
    valueType,
    mode: "loose",
    ...util_exports.normalizeParams(params)
  });
}
var ZodMap = /* @__PURE__ */ $constructor("ZodMap", (inst, def) => {
  $ZodMap.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json2, params) => mapProcessor(inst, ctx, json2, params);
  inst.keyType = def.keyType;
  inst.valueType = def.valueType;
  inst.min = (...args) => inst.check(_minSize(...args));
  inst.nonempty = (params) => inst.check(_minSize(1, params));
  inst.max = (...args) => inst.check(_maxSize(...args));
  inst.size = (...args) => inst.check(_size(...args));
});
function map(keyType, valueType, params) {
  return new ZodMap({
    type: "map",
    keyType,
    valueType,
    ...util_exports.normalizeParams(params)
  });
}
var ZodSet = /* @__PURE__ */ $constructor("ZodSet", (inst, def) => {
  $ZodSet.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json2, params) => setProcessor(inst, ctx, json2, params);
  inst.min = (...args) => inst.check(_minSize(...args));
  inst.nonempty = (params) => inst.check(_minSize(1, params));
  inst.max = (...args) => inst.check(_maxSize(...args));
  inst.size = (...args) => inst.check(_size(...args));
});
function set(valueType, params) {
  return new ZodSet({
    type: "set",
    valueType,
    ...util_exports.normalizeParams(params)
  });
}
var ZodEnum = /* @__PURE__ */ $constructor("ZodEnum", (inst, def) => {
  $ZodEnum.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json2, params) => enumProcessor(inst, ctx, json2, params);
  inst.enum = def.entries;
  inst.options = Object.values(def.entries);
  const keys = new Set(Object.keys(def.entries));
  inst.extract = (values, params) => {
    const newEntries = {};
    for (const value of values) {
      if (keys.has(value)) {
        newEntries[value] = def.entries[value];
      } else
        throw new Error(`Key ${value} not found in enum`);
    }
    return new ZodEnum({
      ...def,
      checks: [],
      ...util_exports.normalizeParams(params),
      entries: newEntries
    });
  };
  inst.exclude = (values, params) => {
    const newEntries = { ...def.entries };
    for (const value of values) {
      if (keys.has(value)) {
        delete newEntries[value];
      } else
        throw new Error(`Key ${value} not found in enum`);
    }
    return new ZodEnum({
      ...def,
      checks: [],
      ...util_exports.normalizeParams(params),
      entries: newEntries
    });
  };
});
function _enum2(values, params) {
  const entries = Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values;
  return new ZodEnum({
    type: "enum",
    entries,
    ...util_exports.normalizeParams(params)
  });
}
function nativeEnum(entries, params) {
  return new ZodEnum({
    type: "enum",
    entries,
    ...util_exports.normalizeParams(params)
  });
}
var ZodLiteral = /* @__PURE__ */ $constructor("ZodLiteral", (inst, def) => {
  $ZodLiteral.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json2, params) => literalProcessor(inst, ctx, json2, params);
  inst.values = new Set(def.values);
  Object.defineProperty(inst, "value", {
    get() {
      if (def.values.length > 1) {
        throw new Error("This schema contains multiple valid literal values. Use `.values` instead.");
      }
      return def.values[0];
    }
  });
});
function literal(value, params) {
  return new ZodLiteral({
    type: "literal",
    values: Array.isArray(value) ? value : [value],
    ...util_exports.normalizeParams(params)
  });
}
var ZodFile = /* @__PURE__ */ $constructor("ZodFile", (inst, def) => {
  $ZodFile.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json2, params) => fileProcessor(inst, ctx, json2, params);
  inst.min = (size, params) => inst.check(_minSize(size, params));
  inst.max = (size, params) => inst.check(_maxSize(size, params));
  inst.mime = (types, params) => inst.check(_mime(Array.isArray(types) ? types : [types], params));
});
function file(params) {
  return _file(ZodFile, params);
}
var ZodTransform = /* @__PURE__ */ $constructor("ZodTransform", (inst, def) => {
  $ZodTransform.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json2, params) => transformProcessor(inst, ctx, json2, params);
  inst._zod.parse = (payload, _ctx) => {
    if (_ctx.direction === "backward") {
      throw new $ZodEncodeError(inst.constructor.name);
    }
    payload.addIssue = (issue2) => {
      if (typeof issue2 === "string") {
        payload.issues.push(util_exports.issue(issue2, payload.value, def));
      } else {
        const _issue = issue2;
        if (_issue.fatal)
          _issue.continue = false;
        _issue.code ?? (_issue.code = "custom");
        _issue.input ?? (_issue.input = payload.value);
        _issue.inst ?? (_issue.inst = inst);
        payload.issues.push(util_exports.issue(_issue));
      }
    };
    const output = def.transform(payload.value, payload);
    if (output instanceof Promise) {
      return output.then((output2) => {
        payload.value = output2;
        return payload;
      });
    }
    payload.value = output;
    return payload;
  };
});
function transform(fn) {
  return new ZodTransform({
    type: "transform",
    transform: fn
  });
}
var ZodOptional = /* @__PURE__ */ $constructor("ZodOptional", (inst, def) => {
  $ZodOptional.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json2, params) => optionalProcessor(inst, ctx, json2, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function optional(innerType) {
  return new ZodOptional({
    type: "optional",
    innerType
  });
}
var ZodExactOptional = /* @__PURE__ */ $constructor("ZodExactOptional", (inst, def) => {
  $ZodExactOptional.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json2, params) => optionalProcessor(inst, ctx, json2, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function exactOptional(innerType) {
  return new ZodExactOptional({
    type: "optional",
    innerType
  });
}
var ZodNullable = /* @__PURE__ */ $constructor("ZodNullable", (inst, def) => {
  $ZodNullable.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json2, params) => nullableProcessor(inst, ctx, json2, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function nullable(innerType) {
  return new ZodNullable({
    type: "nullable",
    innerType
  });
}
function nullish2(innerType) {
  return optional(nullable(innerType));
}
var ZodDefault = /* @__PURE__ */ $constructor("ZodDefault", (inst, def) => {
  $ZodDefault.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json2, params) => defaultProcessor(inst, ctx, json2, params);
  inst.unwrap = () => inst._zod.def.innerType;
  inst.removeDefault = inst.unwrap;
});
function _default2(innerType, defaultValue) {
  return new ZodDefault({
    type: "default",
    innerType,
    get defaultValue() {
      return typeof defaultValue === "function" ? defaultValue() : util_exports.shallowClone(defaultValue);
    }
  });
}
var ZodPrefault = /* @__PURE__ */ $constructor("ZodPrefault", (inst, def) => {
  $ZodPrefault.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json2, params) => prefaultProcessor(inst, ctx, json2, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function prefault(innerType, defaultValue) {
  return new ZodPrefault({
    type: "prefault",
    innerType,
    get defaultValue() {
      return typeof defaultValue === "function" ? defaultValue() : util_exports.shallowClone(defaultValue);
    }
  });
}
var ZodNonOptional = /* @__PURE__ */ $constructor("ZodNonOptional", (inst, def) => {
  $ZodNonOptional.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json2, params) => nonoptionalProcessor(inst, ctx, json2, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function nonoptional(innerType, params) {
  return new ZodNonOptional({
    type: "nonoptional",
    innerType,
    ...util_exports.normalizeParams(params)
  });
}
var ZodSuccess = /* @__PURE__ */ $constructor("ZodSuccess", (inst, def) => {
  $ZodSuccess.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json2, params) => successProcessor(inst, ctx, json2, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function success(innerType) {
  return new ZodSuccess({
    type: "success",
    innerType
  });
}
var ZodCatch = /* @__PURE__ */ $constructor("ZodCatch", (inst, def) => {
  $ZodCatch.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json2, params) => catchProcessor(inst, ctx, json2, params);
  inst.unwrap = () => inst._zod.def.innerType;
  inst.removeCatch = inst.unwrap;
});
function _catch2(innerType, catchValue) {
  return new ZodCatch({
    type: "catch",
    innerType,
    catchValue: typeof catchValue === "function" ? catchValue : () => catchValue
  });
}
var ZodNaN = /* @__PURE__ */ $constructor("ZodNaN", (inst, def) => {
  $ZodNaN.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json2, params) => nanProcessor(inst, ctx, json2, params);
});
function nan(params) {
  return _nan(ZodNaN, params);
}
var ZodPipe = /* @__PURE__ */ $constructor("ZodPipe", (inst, def) => {
  $ZodPipe.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json2, params) => pipeProcessor(inst, ctx, json2, params);
  inst.in = def.in;
  inst.out = def.out;
});
function pipe(in_, out) {
  return new ZodPipe({
    type: "pipe",
    in: in_,
    out
    // ...util.normalizeParams(params),
  });
}
var ZodCodec = /* @__PURE__ */ $constructor("ZodCodec", (inst, def) => {
  ZodPipe.init(inst, def);
  $ZodCodec.init(inst, def);
});
function codec(in_, out, params) {
  return new ZodCodec({
    type: "pipe",
    in: in_,
    out,
    transform: params.decode,
    reverseTransform: params.encode
  });
}
var ZodReadonly = /* @__PURE__ */ $constructor("ZodReadonly", (inst, def) => {
  $ZodReadonly.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json2, params) => readonlyProcessor(inst, ctx, json2, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function readonly(innerType) {
  return new ZodReadonly({
    type: "readonly",
    innerType
  });
}
var ZodTemplateLiteral = /* @__PURE__ */ $constructor("ZodTemplateLiteral", (inst, def) => {
  $ZodTemplateLiteral.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json2, params) => templateLiteralProcessor(inst, ctx, json2, params);
});
function templateLiteral(parts, params) {
  return new ZodTemplateLiteral({
    type: "template_literal",
    parts,
    ...util_exports.normalizeParams(params)
  });
}
var ZodLazy = /* @__PURE__ */ $constructor("ZodLazy", (inst, def) => {
  $ZodLazy.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json2, params) => lazyProcessor(inst, ctx, json2, params);
  inst.unwrap = () => inst._zod.def.getter();
});
function lazy(getter) {
  return new ZodLazy({
    type: "lazy",
    getter
  });
}
var ZodPromise = /* @__PURE__ */ $constructor("ZodPromise", (inst, def) => {
  $ZodPromise.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json2, params) => promiseProcessor(inst, ctx, json2, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function promise(innerType) {
  return new ZodPromise({
    type: "promise",
    innerType
  });
}
var ZodFunction = /* @__PURE__ */ $constructor("ZodFunction", (inst, def) => {
  $ZodFunction.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json2, params) => functionProcessor(inst, ctx, json2, params);
});
function _function(params) {
  return new ZodFunction({
    type: "function",
    input: Array.isArray(params?.input) ? tuple(params?.input) : params?.input ?? array(unknown()),
    output: params?.output ?? unknown()
  });
}
var ZodCustom = /* @__PURE__ */ $constructor("ZodCustom", (inst, def) => {
  $ZodCustom.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json2, params) => customProcessor(inst, ctx, json2, params);
});
function check(fn) {
  const ch = new $ZodCheck({
    check: "custom"
    // ...util.normalizeParams(params),
  });
  ch._zod.check = fn;
  return ch;
}
function custom(fn, _params) {
  return _custom(ZodCustom, fn ?? (() => true), _params);
}
function refine(fn, _params = {}) {
  return _refine(ZodCustom, fn, _params);
}
function superRefine(fn) {
  return _superRefine(fn);
}
var describe2 = describe;
var meta2 = meta;
function _instanceof(cls, params = {}) {
  const inst = new ZodCustom({
    type: "custom",
    check: "custom",
    fn: (data) => data instanceof cls,
    abort: true,
    ...util_exports.normalizeParams(params)
  });
  inst._zod.bag.Class = cls;
  inst._zod.check = (payload) => {
    if (!(payload.value instanceof cls)) {
      payload.issues.push({
        code: "invalid_type",
        expected: cls.name,
        input: payload.value,
        inst,
        path: [...inst._zod.def.path ?? []]
      });
    }
  };
  return inst;
}
var stringbool = (...args) => _stringbool({
  Codec: ZodCodec,
  Boolean: ZodBoolean,
  String: ZodString
}, ...args);
function json(params) {
  const jsonSchema = lazy(() => {
    return union([string2(params), number2(), boolean2(), _null3(), array(jsonSchema), record(string2(), jsonSchema)]);
  });
  return jsonSchema;
}
function preprocess(fn, schema) {
  return pipe(transform(fn), schema);
}

// ../../node_modules/zod/v4/classic/compat.js
var ZodIssueCode = {
  invalid_type: "invalid_type",
  too_big: "too_big",
  too_small: "too_small",
  invalid_format: "invalid_format",
  not_multiple_of: "not_multiple_of",
  unrecognized_keys: "unrecognized_keys",
  invalid_union: "invalid_union",
  invalid_key: "invalid_key",
  invalid_element: "invalid_element",
  invalid_value: "invalid_value",
  custom: "custom"
};
function setErrorMap(map2) {
  config({
    customError: map2
  });
}
function getErrorMap() {
  return config().customError;
}
var ZodFirstPartyTypeKind;
/* @__PURE__ */ (function(ZodFirstPartyTypeKind2) {
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));

// ../../node_modules/zod/v4/classic/from-json-schema.js
var z = {
  ...schemas_exports2,
  ...checks_exports2,
  iso: iso_exports
};
var RECOGNIZED_KEYS = /* @__PURE__ */ new Set([
  // Schema identification
  "$schema",
  "$ref",
  "$defs",
  "definitions",
  // Core schema keywords
  "$id",
  "id",
  "$comment",
  "$anchor",
  "$vocabulary",
  "$dynamicRef",
  "$dynamicAnchor",
  // Type
  "type",
  "enum",
  "const",
  // Composition
  "anyOf",
  "oneOf",
  "allOf",
  "not",
  // Object
  "properties",
  "required",
  "additionalProperties",
  "patternProperties",
  "propertyNames",
  "minProperties",
  "maxProperties",
  // Array
  "items",
  "prefixItems",
  "additionalItems",
  "minItems",
  "maxItems",
  "uniqueItems",
  "contains",
  "minContains",
  "maxContains",
  // String
  "minLength",
  "maxLength",
  "pattern",
  "format",
  // Number
  "minimum",
  "maximum",
  "exclusiveMinimum",
  "exclusiveMaximum",
  "multipleOf",
  // Already handled metadata
  "description",
  "default",
  // Content
  "contentEncoding",
  "contentMediaType",
  "contentSchema",
  // Unsupported (error-throwing)
  "unevaluatedItems",
  "unevaluatedProperties",
  "if",
  "then",
  "else",
  "dependentSchemas",
  "dependentRequired",
  // OpenAPI
  "nullable",
  "readOnly"
]);
function detectVersion(schema, defaultTarget) {
  const $schema = schema.$schema;
  if ($schema === "https://json-schema.org/draft/2020-12/schema") {
    return "draft-2020-12";
  }
  if ($schema === "http://json-schema.org/draft-07/schema#") {
    return "draft-7";
  }
  if ($schema === "http://json-schema.org/draft-04/schema#") {
    return "draft-4";
  }
  return defaultTarget ?? "draft-2020-12";
}
function resolveRef(ref, ctx) {
  if (!ref.startsWith("#")) {
    throw new Error("External $ref is not supported, only local refs (#/...) are allowed");
  }
  const path = ref.slice(1).split("/").filter(Boolean);
  if (path.length === 0) {
    return ctx.rootSchema;
  }
  const defsKey = ctx.version === "draft-2020-12" ? "$defs" : "definitions";
  if (path[0] === defsKey) {
    const key = path[1];
    if (!key || !ctx.defs[key]) {
      throw new Error(`Reference not found: ${ref}`);
    }
    return ctx.defs[key];
  }
  throw new Error(`Reference not found: ${ref}`);
}
function convertBaseSchema(schema, ctx) {
  if (schema.not !== void 0) {
    if (typeof schema.not === "object" && Object.keys(schema.not).length === 0) {
      return z.never();
    }
    throw new Error("not is not supported in Zod (except { not: {} } for never)");
  }
  if (schema.unevaluatedItems !== void 0) {
    throw new Error("unevaluatedItems is not supported");
  }
  if (schema.unevaluatedProperties !== void 0) {
    throw new Error("unevaluatedProperties is not supported");
  }
  if (schema.if !== void 0 || schema.then !== void 0 || schema.else !== void 0) {
    throw new Error("Conditional schemas (if/then/else) are not supported");
  }
  if (schema.dependentSchemas !== void 0 || schema.dependentRequired !== void 0) {
    throw new Error("dependentSchemas and dependentRequired are not supported");
  }
  if (schema.$ref) {
    const refPath = schema.$ref;
    if (ctx.refs.has(refPath)) {
      return ctx.refs.get(refPath);
    }
    if (ctx.processing.has(refPath)) {
      return z.lazy(() => {
        if (!ctx.refs.has(refPath)) {
          throw new Error(`Circular reference not resolved: ${refPath}`);
        }
        return ctx.refs.get(refPath);
      });
    }
    ctx.processing.add(refPath);
    const resolved = resolveRef(refPath, ctx);
    const zodSchema2 = convertSchema(resolved, ctx);
    ctx.refs.set(refPath, zodSchema2);
    ctx.processing.delete(refPath);
    return zodSchema2;
  }
  if (schema.enum !== void 0) {
    const enumValues = schema.enum;
    if (ctx.version === "openapi-3.0" && schema.nullable === true && enumValues.length === 1 && enumValues[0] === null) {
      return z.null();
    }
    if (enumValues.length === 0) {
      return z.never();
    }
    if (enumValues.length === 1) {
      return z.literal(enumValues[0]);
    }
    if (enumValues.every((v) => typeof v === "string")) {
      return z.enum(enumValues);
    }
    const literalSchemas = enumValues.map((v) => z.literal(v));
    if (literalSchemas.length < 2) {
      return literalSchemas[0];
    }
    return z.union([literalSchemas[0], literalSchemas[1], ...literalSchemas.slice(2)]);
  }
  if (schema.const !== void 0) {
    return z.literal(schema.const);
  }
  const type = schema.type;
  if (Array.isArray(type)) {
    const typeSchemas = type.map((t) => {
      const typeSchema = { ...schema, type: t };
      return convertBaseSchema(typeSchema, ctx);
    });
    if (typeSchemas.length === 0) {
      return z.never();
    }
    if (typeSchemas.length === 1) {
      return typeSchemas[0];
    }
    return z.union(typeSchemas);
  }
  if (!type) {
    return z.any();
  }
  let zodSchema;
  switch (type) {
    case "string": {
      let stringSchema = z.string();
      if (schema.format) {
        const format = schema.format;
        if (format === "email") {
          stringSchema = stringSchema.check(z.email());
        } else if (format === "uri" || format === "uri-reference") {
          stringSchema = stringSchema.check(z.url());
        } else if (format === "uuid" || format === "guid") {
          stringSchema = stringSchema.check(z.uuid());
        } else if (format === "date-time") {
          stringSchema = stringSchema.check(z.iso.datetime());
        } else if (format === "date") {
          stringSchema = stringSchema.check(z.iso.date());
        } else if (format === "time") {
          stringSchema = stringSchema.check(z.iso.time());
        } else if (format === "duration") {
          stringSchema = stringSchema.check(z.iso.duration());
        } else if (format === "ipv4") {
          stringSchema = stringSchema.check(z.ipv4());
        } else if (format === "ipv6") {
          stringSchema = stringSchema.check(z.ipv6());
        } else if (format === "mac") {
          stringSchema = stringSchema.check(z.mac());
        } else if (format === "cidr") {
          stringSchema = stringSchema.check(z.cidrv4());
        } else if (format === "cidr-v6") {
          stringSchema = stringSchema.check(z.cidrv6());
        } else if (format === "base64") {
          stringSchema = stringSchema.check(z.base64());
        } else if (format === "base64url") {
          stringSchema = stringSchema.check(z.base64url());
        } else if (format === "e164") {
          stringSchema = stringSchema.check(z.e164());
        } else if (format === "jwt") {
          stringSchema = stringSchema.check(z.jwt());
        } else if (format === "emoji") {
          stringSchema = stringSchema.check(z.emoji());
        } else if (format === "nanoid") {
          stringSchema = stringSchema.check(z.nanoid());
        } else if (format === "cuid") {
          stringSchema = stringSchema.check(z.cuid());
        } else if (format === "cuid2") {
          stringSchema = stringSchema.check(z.cuid2());
        } else if (format === "ulid") {
          stringSchema = stringSchema.check(z.ulid());
        } else if (format === "xid") {
          stringSchema = stringSchema.check(z.xid());
        } else if (format === "ksuid") {
          stringSchema = stringSchema.check(z.ksuid());
        }
      }
      if (typeof schema.minLength === "number") {
        stringSchema = stringSchema.min(schema.minLength);
      }
      if (typeof schema.maxLength === "number") {
        stringSchema = stringSchema.max(schema.maxLength);
      }
      if (schema.pattern) {
        stringSchema = stringSchema.regex(new RegExp(schema.pattern));
      }
      zodSchema = stringSchema;
      break;
    }
    case "number":
    case "integer": {
      let numberSchema = type === "integer" ? z.number().int() : z.number();
      if (typeof schema.minimum === "number") {
        numberSchema = numberSchema.min(schema.minimum);
      }
      if (typeof schema.maximum === "number") {
        numberSchema = numberSchema.max(schema.maximum);
      }
      if (typeof schema.exclusiveMinimum === "number") {
        numberSchema = numberSchema.gt(schema.exclusiveMinimum);
      } else if (schema.exclusiveMinimum === true && typeof schema.minimum === "number") {
        numberSchema = numberSchema.gt(schema.minimum);
      }
      if (typeof schema.exclusiveMaximum === "number") {
        numberSchema = numberSchema.lt(schema.exclusiveMaximum);
      } else if (schema.exclusiveMaximum === true && typeof schema.maximum === "number") {
        numberSchema = numberSchema.lt(schema.maximum);
      }
      if (typeof schema.multipleOf === "number") {
        numberSchema = numberSchema.multipleOf(schema.multipleOf);
      }
      zodSchema = numberSchema;
      break;
    }
    case "boolean": {
      zodSchema = z.boolean();
      break;
    }
    case "null": {
      zodSchema = z.null();
      break;
    }
    case "object": {
      const shape = {};
      const properties = schema.properties || {};
      const requiredSet = new Set(schema.required || []);
      for (const [key, propSchema] of Object.entries(properties)) {
        const propZodSchema = convertSchema(propSchema, ctx);
        shape[key] = requiredSet.has(key) ? propZodSchema : propZodSchema.optional();
      }
      if (schema.propertyNames) {
        const keySchema = convertSchema(schema.propertyNames, ctx);
        const valueSchema = schema.additionalProperties && typeof schema.additionalProperties === "object" ? convertSchema(schema.additionalProperties, ctx) : z.any();
        if (Object.keys(shape).length === 0) {
          zodSchema = z.record(keySchema, valueSchema);
          break;
        }
        const objectSchema2 = z.object(shape).passthrough();
        const recordSchema = z.looseRecord(keySchema, valueSchema);
        zodSchema = z.intersection(objectSchema2, recordSchema);
        break;
      }
      if (schema.patternProperties) {
        const patternProps = schema.patternProperties;
        const patternKeys = Object.keys(patternProps);
        const looseRecords = [];
        for (const pattern of patternKeys) {
          const patternValue = convertSchema(patternProps[pattern], ctx);
          const keySchema = z.string().regex(new RegExp(pattern));
          looseRecords.push(z.looseRecord(keySchema, patternValue));
        }
        const schemasToIntersect = [];
        if (Object.keys(shape).length > 0) {
          schemasToIntersect.push(z.object(shape).passthrough());
        }
        schemasToIntersect.push(...looseRecords);
        if (schemasToIntersect.length === 0) {
          zodSchema = z.object({}).passthrough();
        } else if (schemasToIntersect.length === 1) {
          zodSchema = schemasToIntersect[0];
        } else {
          let result = z.intersection(schemasToIntersect[0], schemasToIntersect[1]);
          for (let i = 2; i < schemasToIntersect.length; i++) {
            result = z.intersection(result, schemasToIntersect[i]);
          }
          zodSchema = result;
        }
        break;
      }
      const objectSchema = z.object(shape);
      if (schema.additionalProperties === false) {
        zodSchema = objectSchema.strict();
      } else if (typeof schema.additionalProperties === "object") {
        zodSchema = objectSchema.catchall(convertSchema(schema.additionalProperties, ctx));
      } else {
        zodSchema = objectSchema.passthrough();
      }
      break;
    }
    case "array": {
      const prefixItems = schema.prefixItems;
      const items = schema.items;
      if (prefixItems && Array.isArray(prefixItems)) {
        const tupleItems = prefixItems.map((item) => convertSchema(item, ctx));
        const rest = items && typeof items === "object" && !Array.isArray(items) ? convertSchema(items, ctx) : void 0;
        if (rest) {
          zodSchema = z.tuple(tupleItems).rest(rest);
        } else {
          zodSchema = z.tuple(tupleItems);
        }
        if (typeof schema.minItems === "number") {
          zodSchema = zodSchema.check(z.minLength(schema.minItems));
        }
        if (typeof schema.maxItems === "number") {
          zodSchema = zodSchema.check(z.maxLength(schema.maxItems));
        }
      } else if (Array.isArray(items)) {
        const tupleItems = items.map((item) => convertSchema(item, ctx));
        const rest = schema.additionalItems && typeof schema.additionalItems === "object" ? convertSchema(schema.additionalItems, ctx) : void 0;
        if (rest) {
          zodSchema = z.tuple(tupleItems).rest(rest);
        } else {
          zodSchema = z.tuple(tupleItems);
        }
        if (typeof schema.minItems === "number") {
          zodSchema = zodSchema.check(z.minLength(schema.minItems));
        }
        if (typeof schema.maxItems === "number") {
          zodSchema = zodSchema.check(z.maxLength(schema.maxItems));
        }
      } else if (items !== void 0) {
        const element = convertSchema(items, ctx);
        let arraySchema = z.array(element);
        if (typeof schema.minItems === "number") {
          arraySchema = arraySchema.min(schema.minItems);
        }
        if (typeof schema.maxItems === "number") {
          arraySchema = arraySchema.max(schema.maxItems);
        }
        zodSchema = arraySchema;
      } else {
        zodSchema = z.array(z.any());
      }
      break;
    }
    default:
      throw new Error(`Unsupported type: ${type}`);
  }
  if (schema.description) {
    zodSchema = zodSchema.describe(schema.description);
  }
  if (schema.default !== void 0) {
    zodSchema = zodSchema.default(schema.default);
  }
  return zodSchema;
}
function convertSchema(schema, ctx) {
  if (typeof schema === "boolean") {
    return schema ? z.any() : z.never();
  }
  let baseSchema = convertBaseSchema(schema, ctx);
  const hasExplicitType = schema.type || schema.enum !== void 0 || schema.const !== void 0;
  if (schema.anyOf && Array.isArray(schema.anyOf)) {
    const options = schema.anyOf.map((s) => convertSchema(s, ctx));
    const anyOfUnion = z.union(options);
    baseSchema = hasExplicitType ? z.intersection(baseSchema, anyOfUnion) : anyOfUnion;
  }
  if (schema.oneOf && Array.isArray(schema.oneOf)) {
    const options = schema.oneOf.map((s) => convertSchema(s, ctx));
    const oneOfUnion = z.xor(options);
    baseSchema = hasExplicitType ? z.intersection(baseSchema, oneOfUnion) : oneOfUnion;
  }
  if (schema.allOf && Array.isArray(schema.allOf)) {
    if (schema.allOf.length === 0) {
      baseSchema = hasExplicitType ? baseSchema : z.any();
    } else {
      let result = hasExplicitType ? baseSchema : convertSchema(schema.allOf[0], ctx);
      const startIdx = hasExplicitType ? 0 : 1;
      for (let i = startIdx; i < schema.allOf.length; i++) {
        result = z.intersection(result, convertSchema(schema.allOf[i], ctx));
      }
      baseSchema = result;
    }
  }
  if (schema.nullable === true && ctx.version === "openapi-3.0") {
    baseSchema = z.nullable(baseSchema);
  }
  if (schema.readOnly === true) {
    baseSchema = z.readonly(baseSchema);
  }
  const extraMeta = {};
  const coreMetadataKeys = ["$id", "id", "$comment", "$anchor", "$vocabulary", "$dynamicRef", "$dynamicAnchor"];
  for (const key of coreMetadataKeys) {
    if (key in schema) {
      extraMeta[key] = schema[key];
    }
  }
  const contentMetadataKeys = ["contentEncoding", "contentMediaType", "contentSchema"];
  for (const key of contentMetadataKeys) {
    if (key in schema) {
      extraMeta[key] = schema[key];
    }
  }
  for (const key of Object.keys(schema)) {
    if (!RECOGNIZED_KEYS.has(key)) {
      extraMeta[key] = schema[key];
    }
  }
  if (Object.keys(extraMeta).length > 0) {
    ctx.registry.add(baseSchema, extraMeta);
  }
  return baseSchema;
}
function fromJSONSchema(schema, params) {
  if (typeof schema === "boolean") {
    return schema ? z.any() : z.never();
  }
  const version2 = detectVersion(schema, params?.defaultTarget);
  const defs = schema.$defs || schema.definitions || {};
  const ctx = {
    version: version2,
    defs,
    refs: /* @__PURE__ */ new Map(),
    processing: /* @__PURE__ */ new Set(),
    rootSchema: schema,
    registry: params?.registry ?? globalRegistry
  };
  return convertSchema(schema, ctx);
}

// ../../node_modules/zod/v4/classic/coerce.js
var coerce_exports = {};
__export(coerce_exports, {
  bigint: () => bigint3,
  boolean: () => boolean3,
  date: () => date4,
  number: () => number3,
  string: () => string3
});
function string3(params) {
  return _coercedString(ZodString, params);
}
function number3(params) {
  return _coercedNumber(ZodNumber, params);
}
function boolean3(params) {
  return _coercedBoolean(ZodBoolean, params);
}
function bigint3(params) {
  return _coercedBigint(ZodBigInt, params);
}
function date4(params) {
  return _coercedDate(ZodDate, params);
}

// ../../node_modules/zod/v4/classic/external.js
config(en_default());

// src/shared/validation/task.validation.ts
var taskBaseSchema = external_exports.object({
  title: external_exports.string().min(TASK_LIMITS.TITLE_MIN_LENGTH, "Title is required").max(TASK_LIMITS.TITLE_MAX_LENGTH, `Title must be less than ${TASK_LIMITS.TITLE_MAX_LENGTH} characters`),
  description: external_exports.string().max(TASK_LIMITS.DESCRIPTION_MAX_LENGTH, `Description must be less than ${TASK_LIMITS.DESCRIPTION_MAX_LENGTH} characters`).optional(),
  priority: external_exports.enum(PRIORITY_VALUES),
  status: external_exports.enum(TASK_STATUS_VALUES).optional(),
  dueDate: external_exports.string().optional().nullable(),
  startDate: external_exports.string().optional().nullable(),
  scheduledDate: external_exports.string().optional().nullable(),
  scheduledTime: external_exports.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:mm format").optional().nullable(),
  isTimeBlocked: external_exports.boolean().optional(),
  estimatedMinutes: external_exports.union([
    external_exports.number().int().min(TASK_LIMITS.MIN_ESTIMATED_MINUTES).max(TASK_LIMITS.MAX_ESTIMATED_MINUTES),
    external_exports.nan()
  ]).optional().nullable().transform((val) => Number.isNaN(val) ? void 0 : val)
});
var taskDatesSchema = taskBaseSchema.refine(
  (data) => {
    if (data.startDate && data.dueDate) {
      return new Date(data.startDate) <= new Date(data.dueDate);
    }
    return true;
  },
  { message: "Start date must be before or equal to due date", path: ["startDate"] }
).refine(
  (data) => {
    if (data.scheduledDate && data.dueDate) {
      return new Date(data.scheduledDate) <= new Date(data.dueDate);
    }
    return true;
  },
  { message: "Scheduled date must be before or equal to due date", path: ["scheduledDate"] }
);
var createTaskSchema = taskBaseSchema.extend({
  projectId: external_exports.string().min(1, "Project is required"),
  parentTaskId: external_exports.string().optional().nullable(),
  assigneeId: external_exports.string().optional().nullable(),
  tagIds: external_exports.array(external_exports.string()).max(TASK_LIMITS.MAX_TAGS_PER_TASK).optional()
});
var updateTaskSchema = taskBaseSchema.partial().extend({
  assigneeId: external_exports.string().optional().nullable(),
  tagIds: external_exports.array(external_exports.string()).max(TASK_LIMITS.MAX_TAGS_PER_TASK).optional(),
  completedAt: external_exports.string().datetime().optional().nullable()
});
var taskFilterSchema = external_exports.object({
  projectId: external_exports.string().optional(),
  status: external_exports.enum(TASK_STATUS_VALUES).optional(),
  priority: external_exports.enum(PRIORITY_VALUES).optional(),
  assigneeId: external_exports.string().optional(),
  tagIds: external_exports.array(external_exports.string()).optional(),
  search: external_exports.string().optional(),
  dueDate: external_exports.object({
    from: external_exports.string().datetime().optional(),
    to: external_exports.string().datetime().optional()
  }).optional(),
  isOverdue: external_exports.boolean().optional()
});
var bulkUpdateTasksSchema = external_exports.object({
  taskIds: external_exports.array(external_exports.string()).min(1, "At least one task is required"),
  updates: external_exports.object({
    status: external_exports.enum(TASK_STATUS_VALUES).optional(),
    priority: external_exports.enum(PRIORITY_VALUES).optional(),
    assigneeId: external_exports.string().optional().nullable(),
    projectId: external_exports.string().optional()
  })
});
var reorderTasksSchema = external_exports.object({
  taskId: external_exports.string(),
  newOrder: external_exports.number().int().min(0),
  projectId: external_exports.string()
});

// src/shared/validation/project.validation.ts
var projectBaseSchema = external_exports.object({
  name: external_exports.string().min(PROJECT_LIMITS.NAME_MIN_LENGTH, "Project name is required").max(PROJECT_LIMITS.NAME_MAX_LENGTH, `Project name must be less than ${PROJECT_LIMITS.NAME_MAX_LENGTH} characters`),
  description: external_exports.string().max(PROJECT_LIMITS.DESCRIPTION_MAX_LENGTH, `Description must be less than ${PROJECT_LIMITS.DESCRIPTION_MAX_LENGTH} characters`).optional(),
  color: external_exports.string().optional(),
  icon: external_exports.string().optional()
});
var createProjectSchema = projectBaseSchema.extend({
  workspaceId: external_exports.string().min(1, "Workspace is required"),
  workflowId: external_exports.string().optional(),
  startDate: external_exports.string().datetime().optional().nullable(),
  endDate: external_exports.string().datetime().optional().nullable()
});
var updateProjectSchema = projectBaseSchema.partial().extend({
  startDate: external_exports.string().datetime().optional().nullable(),
  endDate: external_exports.string().datetime().optional().nullable(),
  isArchived: external_exports.boolean().optional()
});
var projectFilterSchema = external_exports.object({
  workspaceId: external_exports.string().optional(),
  search: external_exports.string().optional(),
  isArchived: external_exports.boolean().optional(),
  color: external_exports.string().optional()
});
var archiveProjectSchema = external_exports.object({
  isArchived: external_exports.boolean()
});
var duplicateProjectSchema = external_exports.object({
  name: external_exports.string().min(PROJECT_LIMITS.NAME_MIN_LENGTH),
  includeTasks: external_exports.boolean().default(false),
  includeMembers: external_exports.boolean().default(false)
});

// src/workspaces/model/member-role.enum.ts
var MemberRole = /* @__PURE__ */ ((MemberRole2) => {
  MemberRole2["OWNER"] = "OWNER";
  MemberRole2["ADMIN"] = "ADMIN";
  MemberRole2["MEMBER"] = "MEMBER";
  MemberRole2["VIEWER"] = "VIEWER";
  return MemberRole2;
})(MemberRole || {});

// src/shared/validation/workspace.validation.ts
var WORKSPACE_TYPES = ["PERSONAL", "WORK", "TEAM"];
var MEMBER_ROLES = ["OWNER" /* OWNER */, "ADMIN" /* ADMIN */, "MEMBER" /* MEMBER */, "VIEWER" /* VIEWER */];
var workspaceBaseSchema = external_exports.object({
  name: external_exports.string().min(WORKSPACE_LIMITS.NAME_MIN_LENGTH, "Workspace name is required").max(
    WORKSPACE_LIMITS.NAME_MAX_LENGTH,
    `Workspace name must be less than ${WORKSPACE_LIMITS.NAME_MAX_LENGTH} characters`
  ),
  slug: external_exports.string().min(1, "Slug must be at least 1 character").regex(
    /^[a-z0-9-]+$/,
    "Slug must only contain lowercase letters, numbers, and hyphens"
  ).optional(),
  description: external_exports.string().max(
    WORKSPACE_LIMITS.DESCRIPTION_MAX_LENGTH,
    `Description must be less than ${WORKSPACE_LIMITS.DESCRIPTION_MAX_LENGTH} characters`
  ).optional(),
  type: external_exports.enum(WORKSPACE_TYPES),
  color: external_exports.string().optional(),
  icon: external_exports.string().optional()
});
var createWorkspaceSchema = workspaceBaseSchema;
var updateWorkspaceSchema = workspaceBaseSchema.partial();
var workspaceSettingsSchema = external_exports.object({
  defaultTaskPriority: external_exports.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  defaultTaskStatus: external_exports.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"]).optional(),
  enableNotifications: external_exports.boolean().optional(),
  enableEmailDigest: external_exports.boolean().optional(),
  timezone: external_exports.string().optional()
});
var inviteMemberSchema = external_exports.object({
  email: external_exports.string().email("Invalid email address"),
  role: external_exports.enum(MEMBER_ROLES),
  message: external_exports.string().max(500).optional()
});
var updateMemberRoleSchema = external_exports.object({
  role: external_exports.enum(MEMBER_ROLES)
});
var acceptInvitationSchema = external_exports.object({
  token: external_exports.string().min(1, "Invitation token is required")
});
var transferOwnershipSchema = external_exports.object({
  newOwnerId: external_exports.string().min(1, "New owner is required")
});
var workspaceFilterSchema = external_exports.object({
  type: external_exports.enum(WORKSPACE_TYPES).optional(),
  search: external_exports.string().optional()
});

// src/shared/validation/tag.validation.ts
var tagBaseSchema = external_exports.object({
  name: external_exports.string().min(TAG_LIMITS.NAME_MIN_LENGTH, "Tag name is required").max(TAG_LIMITS.NAME_MAX_LENGTH, `Tag name must be less than ${TAG_LIMITS.NAME_MAX_LENGTH} characters`),
  color: external_exports.string().optional()
});
var createTagSchema = tagBaseSchema.extend({
  workspaceId: external_exports.string().min(1, "Workspace is required")
});
var updateTagSchema = tagBaseSchema.partial();
var tagFilterSchema = external_exports.object({
  workspaceId: external_exports.string().optional(),
  search: external_exports.string().optional()
});
var assignTagsSchema = external_exports.object({
  tagIds: external_exports.array(external_exports.string()).max(TAG_LIMITS.NAME_MAX_LENGTH)
});

// src/shared/validation/user.validation.ts
var registerUserSchema = external_exports.object({
  name: external_exports.string().min(USER_LIMITS.NAME_MIN_LENGTH, `Name must be at least ${USER_LIMITS.NAME_MIN_LENGTH} characters`).max(USER_LIMITS.NAME_MAX_LENGTH, `Name must be less than ${USER_LIMITS.NAME_MAX_LENGTH} characters`),
  username: external_exports.string().min(3, "Username must be at least 3 characters").max(20, "Username must be less than 20 characters").regex(/^[a-z0-9_-]+$/, "Username can only contain lowercase letters, numbers, hyphens, and underscores"),
  email: external_exports.string().email("Invalid email address"),
  password: external_exports.string().min(USER_LIMITS.PASSWORD_MIN_LENGTH, `Password must be at least ${USER_LIMITS.PASSWORD_MIN_LENGTH} characters`).max(USER_LIMITS.PASSWORD_MAX_LENGTH, `Password must be less than ${USER_LIMITS.PASSWORD_MAX_LENGTH} characters`)
});
var loginUserSchema = external_exports.object({
  email: external_exports.string().email("Invalid email address"),
  password: external_exports.string().min(1, "Password is required")
});
var updateUserProfileSchema = external_exports.object({
  name: external_exports.string().min(USER_LIMITS.NAME_MIN_LENGTH).max(USER_LIMITS.NAME_MAX_LENGTH).optional(),
  bio: external_exports.string().max(USER_LIMITS.BIO_MAX_LENGTH).optional(),
  avatar: external_exports.string().url().optional().nullable(),
  timezone: external_exports.string().optional(),
  language: external_exports.enum(["en", "es", "pt-BR"]).optional()
});
var changePasswordSchema = external_exports.object({
  currentPassword: external_exports.string().min(1, "Current password is required"),
  newPassword: external_exports.string().min(USER_LIMITS.PASSWORD_MIN_LENGTH, `Password must be at least ${USER_LIMITS.PASSWORD_MIN_LENGTH} characters`).max(USER_LIMITS.PASSWORD_MAX_LENGTH)
});
var resetPasswordRequestSchema = external_exports.object({
  email: external_exports.string().email("Invalid email address")
});
var resetPasswordSchema = external_exports.object({
  token: external_exports.string().min(1, "Reset token is required"),
  newPassword: external_exports.string().min(USER_LIMITS.PASSWORD_MIN_LENGTH, `Password must be at least ${USER_LIMITS.PASSWORD_MIN_LENGTH} characters`).max(USER_LIMITS.PASSWORD_MAX_LENGTH)
});
var userPreferencesSchema = external_exports.object({
  theme: external_exports.enum(["light", "dark", "system"]).optional(),
  language: external_exports.enum(["en", "es", "pt-BR"]).optional(),
  timezone: external_exports.string().optional(),
  notifications: external_exports.object({
    email: external_exports.boolean().optional(),
    push: external_exports.boolean().optional(),
    desktop: external_exports.boolean().optional()
  }).optional(),
  pomodoro: external_exports.object({
    workDuration: external_exports.number().int().min(1).max(120).optional(),
    shortBreakDuration: external_exports.number().int().min(1).max(30).optional(),
    longBreakDuration: external_exports.number().int().min(1).max(60).optional(),
    pomodorosUntilLongBreak: external_exports.number().int().min(2).max(10).optional(),
    autoStartBreaks: external_exports.boolean().optional(),
    autoStartPomodoros: external_exports.boolean().optional(),
    soundEnabled: external_exports.boolean().optional()
  }).optional()
});
var usernameValidationSchema = external_exports.object({
  username: external_exports.string().min(3, "Username must be at least 3 characters").max(20, "Username must be less than 20 characters").regex(/^[a-z0-9_-]+$/, "Username can only contain lowercase letters, numbers, hyphens, and underscores")
});

// src/shared/validation/comment.validation.ts
var commentBaseSchema = external_exports.object({
  content: external_exports.string().min(COMMENT_LIMITS.CONTENT_MIN_LENGTH, "Comment cannot be empty").max(COMMENT_LIMITS.CONTENT_MAX_LENGTH, `Comment must be less than ${COMMENT_LIMITS.CONTENT_MAX_LENGTH} characters`)
});
var createCommentSchema = commentBaseSchema.extend({
  taskId: external_exports.string().min(1, "Task is required"),
  parentCommentId: external_exports.string().optional().nullable(),
  // For threaded comments
  mentions: external_exports.array(external_exports.string()).optional()
  // User IDs mentioned in comment
});
var updateCommentSchema = commentBaseSchema;
var commentFilterSchema = external_exports.object({
  taskId: external_exports.string().optional(),
  userId: external_exports.string().optional(),
  parentCommentId: external_exports.string().optional().nullable()
});

// src/users/model/user.entity.ts
var User = class _User extends Entity {
  name;
  username;
  email;
  password;
  constructor(props, mode = "valid") {
    super(props);
    this.name = mode === "draft" ? props?.name ?? "" : PersonName.create(props?.name ?? "").value;
    this.username = props.username;
    this.email = mode === "draft" ? props?.email ?? "" : Email.create(props?.email ?? "").value;
    this.password = props?.password ? HashPassword.create(props.password).value : void 0;
  }
  withoutPassword() {
    return this.clone({ password: void 0 });
  }
  static draft(props = { username: "" }) {
    return new _User(props, "draft");
  }
  get $name() {
    return PersonName.create(this.name);
  }
  get $email() {
    return Email.create(this.email);
  }
  get $password() {
    return this.password ? HashPassword.create(this.password) : void 0;
  }
};

// src/users/usecase/change-user-name.usecase.ts
var ChangeUserName = class {
  constructor(repo) {
    this.repo = repo;
  }
  async execute(newName, loggedUser) {
    if (!loggedUser) {
      throw new Error("User is required");
    }
    const validName = PersonName.create(newName).value;
    const existingUser = await this.repo.findByEmail(loggedUser.email);
    if (!existingUser) {
      throw new Error("Usu\xE1rio n\xE3o encontrado");
    }
    await this.repo.updateProps(existingUser, { name: validName });
  }
};

// src/users/usecase/register-user.usecase.ts
var RegisterUser = class {
  constructor(repo, crypto2) {
    this.repo = repo;
    this.crypto = crypto2;
  }
  async execute(user) {
    const existingUser = await this.repo.findByEmail(user.email);
    if (existingUser) {
      throw new Error("Usu\xE1rio j\xE1 existe");
    }
    const existingUsername = await this.repo.findByUsername(user.username);
    if (existingUsername) {
      throw new Error("Nome de usu\xE1rio j\xE1 est\xE1 em uso");
    }
    if (!user.password) {
      throw new Error("Senha \xE9 obrigat\xF3ria");
    }
    if (!user.username || user.username.length < 3) {
      throw new Error("Nome de usu\xE1rio deve ter pelo menos 3 caracteres");
    }
    if (user.name?.length < 3) {
      throw new Error("Nome deve ter pelo menos 3 caracteres");
    }
    const hashedPassword = await this.crypto.encrypt(user.password);
    const newUser = new User({
      name: user.name,
      username: user.username,
      email: user.email,
      password: hashedPassword
    });
    await this.repo.save(newUser);
  }
};

// src/users/usecase/user-by-email.usecase.ts
var UserByEmail = class {
  constructor(repo) {
    this.repo = repo;
  }
  async execute(email3) {
    const user = await this.repo.findByEmail(email3?.toLowerCase?.());
    if (!user) throw new Error("Usu\xE1rio n\xE3o encontrado");
    return user.withoutPassword();
  }
};

// src/users/usecase/user-login.usecase.ts
var UserLogin = class {
  constructor(repo, crypto2) {
    this.repo = repo;
    this.crypto = crypto2;
  }
  async execute(input) {
    const { email: email3, password } = input;
    const withPassword = true;
    const user = await this.repo.findByEmail(email3, withPassword);
    if (!user) throw new Error("Usu\xE1rio n\xE3o encontrado");
    const samePassword = await this.crypto.compare(password, user.password);
    if (!samePassword) throw new Error("Senha incorreta");
    return user.withoutPassword();
  }
};

// src/tasks/model/task.entity.ts
var Task = class _Task extends Entity {
  constructor(props) {
    super({
      ...props,
      status: props.status ?? "TODO",
      priority: props.priority ?? "MEDIUM",
      subTasks: props.subTasks ?? [],
      isDeleted: props.isDeleted ?? false,
      createdAt: props.createdAt ?? /* @__PURE__ */ new Date(),
      updatedAt: props.updatedAt ?? /* @__PURE__ */ new Date()
    });
  }
  static create(props) {
    return new _Task({
      ...props,
      status: "TODO",
      priority: props.priority ?? "MEDIUM",
      isDeleted: false,
      deletedAt: void 0
    });
  }
  complete() {
    return this.clone({
      status: "COMPLETED",
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  updateStatus(status) {
    return this.clone({
      status,
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  update(props) {
    return this.clone({
      ...props,
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  softDelete() {
    return this.clone({
      isDeleted: true,
      deletedAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  restore() {
    return this.clone({
      isDeleted: false,
      deletedAt: void 0,
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
};

// src/tasks/usecase/create-task.usecase.ts
var CreateTaskUseCase = class {
  constructor(repository) {
    this.repository = repository;
  }
  async execute(input) {
    if (!input.title) {
      throw new Error("Title is required");
    }
    const task = Task.create({
      title: input.title,
      description: input.description,
      priority: input.priority ?? "MEDIUM",
      dueDate: input.dueDate,
      projectId: input.projectId,
      ownerId: input.ownerId,
      assigneeId: input.assigneeId,
      parentTaskId: input.parentTaskId,
      recurrence: input.recurrence
    });
    await this.repository.save(task);
    return task;
  }
};

// src/tasks/usecase/complete-task.usecase.ts
var CompleteTaskUseCase = class {
  constructor(repository) {
    this.repository = repository;
  }
  async execute(input) {
    const task = await this.repository.findById(input.taskId);
    if (!task) {
      throw new Error("Task not found");
    }
    if (task.props.ownerId !== input.ownerId) {
      throw new Error("Unauthorized");
    }
    const completedTask = task.complete();
    await this.repository.update(completedTask);
    return completedTask;
  }
};

// src/tasks/usecase/soft-delete-task.usecase.ts
var SoftDeleteTaskUseCase = class {
  constructor(taskRepository) {
    this.taskRepository = taskRepository;
  }
  async execute(id) {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new Error("Task not found");
    }
    await this.taskRepository.softDelete(id);
  }
};

// src/tasks/usecase/restore-task.usecase.ts
var RestoreTaskUseCase = class {
  constructor(taskRepository) {
    this.taskRepository = taskRepository;
  }
  async execute(id) {
    const task = await this.taskRepository.findByIdIncludeDeleted(id);
    if (!task) {
      throw new Error("Task not found");
    }
    if (!task.props.isDeleted) {
      throw new Error("Task is not deleted");
    }
    await this.taskRepository.restore(id);
  }
};

// src/tasks/usecase/permanent-delete-task.usecase.ts
var PermanentDeleteTaskUseCase = class {
  constructor(taskRepository) {
    this.taskRepository = taskRepository;
  }
  async execute(id) {
    const task = await this.taskRepository.findByIdIncludeDeleted(id);
    if (!task) {
      throw new Error("Task not found");
    }
    if (!task.props.isDeleted) {
      throw new Error("Task must be soft deleted first");
    }
    await this.taskRepository.permanentDelete(id);
  }
};

// src/tasks/usecase/get-deleted-tasks.usecase.ts
var GetDeletedTasksUseCase = class {
  constructor(taskRepository) {
    this.taskRepository = taskRepository;
  }
  async execute(projectId) {
    const tasks = await this.taskRepository.findDeleted(projectId);
    return tasks;
  }
};

// src/tasks/model/task-dependency.entity.ts
var TaskDependency = class extends Entity {
  constructor(props, mode = "valid") {
    super(props, mode);
    if (mode === "valid") {
      this.validate();
    }
  }
  /**
   * Validate task dependency properties
   */
  validate() {
    if (!this.props.blockingTaskId || this.props.blockingTaskId.trim() === "") {
      throw new Error("TaskDependency must have a valid blockingTaskId");
    }
    if (!this.props.blockedTaskId || this.props.blockedTaskId.trim() === "") {
      throw new Error("TaskDependency must have a valid blockedTaskId");
    }
    if (this.props.blockingTaskId === this.props.blockedTaskId) {
      throw new Error("Task cannot depend on itself");
    }
  }
  // ===== Getters =====
  get blockingTaskId() {
    return this.props.blockingTaskId;
  }
  get blockedTaskId() {
    return this.props.blockedTaskId;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  // ===== Business Methods =====
  /**
   * Check if a task is blocking another task
   */
  isBlocking(taskId) {
    return this.props.blockingTaskId === taskId;
  }
  /**
   * Check if a task is blocked by another task
   */
  isBlockedBy(taskId) {
    return this.props.blockedTaskId === taskId;
  }
  /**
   * Check if this dependency involves a specific task
   */
  involvesTask(taskId) {
    return this.props.blockingTaskId === taskId || this.props.blockedTaskId === taskId;
  }
  /**
   * Get the other task in the dependency
   */
  getOtherTask(taskId) {
    if (this.props.blockingTaskId === taskId) {
      return this.props.blockedTaskId;
    }
    if (this.props.blockedTaskId === taskId) {
      return this.props.blockingTaskId;
    }
    return null;
  }
};

// src/workspaces/model/workspace.entity.ts
var Workspace = class _Workspace extends Entity {
  constructor(props) {
    super({
      ...props,
      tier: props.tier ?? "FREE",
      isArchived: props.isArchived ?? false,
      isDeleted: props.isDeleted ?? false,
      color: props.color ?? "#2563EB",
      createdAt: props.createdAt ?? /* @__PURE__ */ new Date(),
      updatedAt: props.updatedAt ?? /* @__PURE__ */ new Date()
    });
  }
  static create(props) {
    return new _Workspace({
      ...props,
      tier: props.tier ?? "FREE",
      isArchived: false,
      isDeleted: false,
      color: props.color ?? "#2563EB"
    });
  }
  update(props) {
    return this.clone({
      ...props,
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  softDelete() {
    return this.clone({
      isDeleted: true,
      deletedAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  restore() {
    return this.clone({
      isDeleted: false,
      deletedAt: void 0,
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  archive() {
    return this.clone({
      isArchived: true,
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  unarchive() {
    return this.clone({
      isArchived: false,
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  setStats(stats) {
    return this.clone({
      stats
    });
  }
};

// src/workspaces/model/workspace-member.entity.ts
var WorkspaceMember = class _WorkspaceMember extends Entity {
  constructor(props) {
    super({
      ...props,
      joinedAt: props.joinedAt ?? /* @__PURE__ */ new Date()
    });
  }
  static create(props) {
    return new _WorkspaceMember({
      ...props,
      joinedAt: /* @__PURE__ */ new Date()
    });
  }
  // ===== Business Methods =====
  /**
   * Check if member is owner
   */
  isOwner() {
    return this.props.role === "OWNER" /* OWNER */;
  }
  /**
   * Check if member is admin
   */
  isAdmin() {
    return this.props.role === "ADMIN" /* ADMIN */;
  }
  /**
   * Check if member is regular member
   */
  isMember() {
    return this.props.role === "MEMBER" /* MEMBER */;
  }
  /**
   * Check if member is viewer (read-only)
   */
  isViewer() {
    return this.props.role === "VIEWER" /* VIEWER */;
  }
  /**
   * Check if member has admin-level permissions (OWNER or ADMIN)
   */
  hasAdminPermissions() {
    return ["OWNER" /* OWNER */, "ADMIN" /* ADMIN */].includes(this.props.role);
  }
  /**
   * Check if member can manage workspace settings
   */
  canManageWorkspace() {
    return this.hasAdminPermissions();
  }
  /**
   * Check if member can invite other members
   */
  canInviteMembers() {
    return this.hasAdminPermissions();
  }
  /**
   * Check if member can remove other members
   */
  canRemoveMembers() {
    return this.props.role === "OWNER" /* OWNER */;
  }
  /**
   * Check if member can change roles
   */
  canChangeRoles() {
    return this.props.role === "OWNER" /* OWNER */;
  }
  /**
   * Check if member can create/edit/delete tasks
   */
  canManageTasks() {
    return ["OWNER" /* OWNER */, "ADMIN" /* ADMIN */, "MEMBER" /* MEMBER */].includes(this.props.role);
  }
  /**
   * Check if member can only view (no edit permissions)
   */
  isReadOnly() {
    return this.props.role === "VIEWER" /* VIEWER */;
  }
  /**
   * Get role level for hierarchy comparison
   */
  getRoleLevel() {
    const roleHierarchy = {
      ["VIEWER" /* VIEWER */]: 0,
      ["MEMBER" /* MEMBER */]: 1,
      ["ADMIN" /* ADMIN */]: 2,
      ["OWNER" /* OWNER */]: 3
    };
    return roleHierarchy[this.props.role];
  }
  /**
   * Check if this member has higher role than another member
   */
  hasHigherRoleThan(otherMember) {
    return this.getRoleLevel() > otherMember.getRoleLevel();
  }
  /**
   * Check if this member can manage another member
   */
  canManageMember(otherMember) {
    if (this.props.role !== "OWNER" /* OWNER */ && otherMember.isAdmin()) {
      return false;
    }
    return this.hasHigherRoleThan(otherMember);
  }
};

// src/workspaces/model/workspace-settings.entity.ts
var WorkspaceSettings = class _WorkspaceSettings extends Entity {
  constructor(props) {
    super({
      ...props,
      defaultView: props.defaultView ?? "LIST",
      createdAt: props.createdAt ?? /* @__PURE__ */ new Date(),
      updatedAt: props.updatedAt ?? /* @__PURE__ */ new Date()
    });
  }
  static create(props) {
    return new _WorkspaceSettings({
      ...props,
      defaultView: props.defaultView ?? "LIST"
    });
  }
  update(props) {
    return this.clone({
      ...props,
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
};

// src/workspaces/model/workspace-audit-log.entity.ts
var WorkspaceAuditLog = class _WorkspaceAuditLog extends Entity {
  constructor(props) {
    super({
      ...props,
      createdAt: props.createdAt ?? /* @__PURE__ */ new Date()
    });
  }
  static create(props) {
    return new _WorkspaceAuditLog(props);
  }
};

// src/workspaces/usecase/create-workspace.usecase.ts
var CreateWorkspaceUseCase = class {
  constructor(workspaceRepository, ownerUsername) {
    this.workspaceRepository = workspaceRepository;
    this.ownerUsername = ownerUsername;
  }
  async execute(props, ownerUsername) {
    const username = ownerUsername || this.ownerUsername;
    const workspaceNameSlug = this.generateSlug(props.name);
    const slug = workspaceNameSlug;
    let finalSlug = slug;
    let counter = 1;
    if (props.ownerId) {
      while (await this.workspaceRepository.findBySlug(finalSlug, props.ownerId)) {
        if (username) {
          finalSlug = `${username}/${workspaceNameSlug}-${counter}`;
        } else {
          finalSlug = `${workspaceNameSlug}-${counter}`;
        }
        counter++;
      }
    }
    const workspace = Workspace.create({
      ...props,
      slug: finalSlug
    });
    return this.workspaceRepository.create(workspace);
  }
  generateSlug(name) {
    return name.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
  }
};

// src/workspaces/usecase/add-member-to-workspace.usecase.ts
var AddMemberToWorkspaceUseCase = class {
  constructor(workspaceRepository) {
    this.workspaceRepository = workspaceRepository;
  }
  async execute(workspaceId, userId, role = "MEMBER" /* MEMBER */) {
    const workspace = await this.workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new Error("Workspace not found");
    }
    const existingMember = await this.workspaceRepository.findMember(workspaceId, userId);
    if (existingMember) {
      return existingMember;
    }
    const member = WorkspaceMember.create({
      workspaceId,
      userId,
      role
    });
    return this.workspaceRepository.addMember(member);
  }
};

// src/workspaces/usecase/remove-member-from-workspace.usecase.ts
var RemoveMemberFromWorkspaceUseCase = class {
  constructor(workspaceRepository) {
    this.workspaceRepository = workspaceRepository;
  }
  async execute(workspaceId, userId) {
    const workspace = await this.workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new Error("Workspace not found");
    }
    const member = await this.workspaceRepository.findMember(workspaceId, userId);
    if (!member) {
      throw new Error("User is not a member of this workspace");
    }
    if (workspace.props.ownerId === userId) {
      throw new Error("Cannot remove the owner from the workspace");
    }
    await this.workspaceRepository.removeMember(workspaceId, userId);
  }
};

// src/workspaces/usecase/soft-delete-workspace.usecase.ts
var SoftDeleteWorkspaceUseCase = class {
  constructor(workspaceRepository) {
    this.workspaceRepository = workspaceRepository;
  }
  async execute(id, userId) {
    const workspace = await this.workspaceRepository.findById(id);
    if (!workspace) {
      throw new Error("Workspace not found");
    }
    if (workspace.props.ownerId !== userId) {
      throw new Error("Unauthorized");
    }
    await this.workspaceRepository.softDelete(id);
  }
};

// src/workspaces/usecase/restore-workspace.usecase.ts
var RestoreWorkspaceUseCase = class {
  constructor(workspaceRepository) {
    this.workspaceRepository = workspaceRepository;
  }
  async execute(id, userId) {
    const workspace = await this.workspaceRepository.findById(id);
    if (!workspace) {
      throw new Error("Workspace not found");
    }
    if (workspace.props.ownerId !== userId) {
      throw new Error("Unauthorized");
    }
    await this.workspaceRepository.restore(id);
  }
};

// src/workspaces/usecase/permanent-delete-workspace.usecase.ts
var PermanentDeleteWorkspaceUseCase = class {
  constructor(workspaceRepository) {
    this.workspaceRepository = workspaceRepository;
  }
  async execute(id, userId) {
    const workspace = await this.workspaceRepository.findById(id);
    if (!workspace) {
      throw new Error("Workspace not found");
    }
    if (workspace.props.ownerId !== userId) {
      throw new Error("Unauthorized");
    }
    if (!workspace.props.isDeleted) {
      throw new Error("Workspace must be soft deleted first");
    }
    await this.workspaceRepository.permanentDelete(id);
  }
};

// src/workspaces/usecase/get-deleted-workspaces.usecase.ts
var GetDeletedWorkspacesUseCase = class {
  constructor(workspaceRepository) {
    this.workspaceRepository = workspaceRepository;
  }
  async execute(userId) {
    return this.workspaceRepository.findDeleted(userId);
  }
};

// src/workspaces/usecase/archive-workspace.usecase.ts
var ArchiveWorkspaceUseCase = class {
  constructor(workspaceRepository) {
    this.workspaceRepository = workspaceRepository;
  }
  async execute(id, userId) {
    const workspace = await this.workspaceRepository.findById(id);
    if (!workspace) {
      throw new Error("Workspace not found");
    }
    if (workspace.props.ownerId !== userId) {
      throw new Error("Unauthorized");
    }
    const archivedWorkspace = workspace.archive();
    return this.workspaceRepository.update(archivedWorkspace);
  }
};

// src/workspaces/model/workspace-invitation.entity.ts
var WorkspaceInvitation = class _WorkspaceInvitation extends Entity {
  constructor(props) {
    super({
      ...props,
      status: props.status ?? "PENDING",
      role: props.role ?? "MEMBER" /* MEMBER */,
      createdAt: props.createdAt ?? /* @__PURE__ */ new Date(),
      updatedAt: props.updatedAt ?? /* @__PURE__ */ new Date()
    });
  }
  static create(props) {
    return new _WorkspaceInvitation({
      ...props,
      status: "PENDING"
    });
  }
  accept() {
    return this.clone({
      status: "ACCEPTED",
      acceptedAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  cancel() {
    return this.clone({
      status: "CANCELLED",
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  isExpired() {
    return this.props.expiresAt < /* @__PURE__ */ new Date();
  }
};

// src/workspaces/usecase/invite-member.usecase.ts
var InviteMemberUseCase = class {
  constructor(workspaceRepository, invitationRepository, hashService) {
    this.workspaceRepository = workspaceRepository;
    this.invitationRepository = invitationRepository;
    this.hashService = hashService;
  }
  async execute(workspaceId, email3, role, invitedById) {
    const workspace = await this.workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new Error("Workspace not found");
    }
    const token = generateUuid();
    const tokenHash = await this.hashService.hash(token);
    const expiresAt = /* @__PURE__ */ new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    const invitation = WorkspaceInvitation.create({
      workspaceId,
      email: email3,
      tokenHash,
      role,
      invitedById,
      expiresAt
    });
    const savedInvitation = await this.invitationRepository.create(invitation);
    return { invitation: savedInvitation, token };
  }
};

// src/workspaces/usecase/accept-invitation.usecase.ts
var AcceptInvitationUseCase = class {
  constructor(workspaceRepository, invitationRepository, hashService) {
    this.workspaceRepository = workspaceRepository;
    this.invitationRepository = invitationRepository;
    this.hashService = hashService;
  }
  async execute(token, userId) {
    const pendingInvitations = await this.invitationRepository.findPendingInvitations();
    if (pendingInvitations.length === 0) {
      throw new Error("Invalid invitation token");
    }
    let matchedInvitation = null;
    for (const invitation of pendingInvitations) {
      const isValid = await this.hashService.compare(token, invitation.props.tokenHash);
      if (isValid) {
        matchedInvitation = invitation;
        break;
      }
    }
    if (!matchedInvitation) {
      throw new Error("Invalid invitation token");
    }
    if (matchedInvitation.isExpired()) {
      throw new Error("Invitation expired");
    }
    const workspaceId = matchedInvitation.props.workspaceId;
    const existingMember = await this.workspaceRepository.findMember(workspaceId, userId);
    if (existingMember) {
      const acceptedInvitation2 = matchedInvitation.accept();
      await this.invitationRepository.update(acceptedInvitation2);
      return;
    }
    const member = WorkspaceMember.create({
      workspaceId,
      userId,
      role: matchedInvitation.props.role
    });
    await this.workspaceRepository.addMember(member);
    const acceptedInvitation = matchedInvitation.accept();
    await this.invitationRepository.update(acceptedInvitation);
  }
};

// src/workspaces/usecase/update-workspace-settings.usecase.ts
var UpdateWorkspaceSettingsUseCase = class {
  constructor(settingsRepository) {
    this.settingsRepository = settingsRepository;
  }
  async execute(input) {
    const existing = await this.settingsRepository.findByWorkspaceId(input.workspaceId);
    let settings;
    if (existing) {
      settings = existing.update({
        defaultView: input.defaultView,
        defaultDueTime: input.defaultDueTime,
        timezone: input.timezone,
        locale: input.locale
      });
    } else {
      settings = WorkspaceSettings.create({
        workspaceId: input.workspaceId,
        defaultView: input.defaultView,
        defaultDueTime: input.defaultDueTime,
        timezone: input.timezone,
        locale: input.locale
      });
    }
    return this.settingsRepository.upsert(settings);
  }
};

// src/workspaces/usecase/get-workspace-settings.usecase.ts
var GetWorkspaceSettingsUseCase = class {
  constructor(settingsRepository) {
    this.settingsRepository = settingsRepository;
  }
  async execute(input) {
    return this.settingsRepository.findByWorkspaceId(input.workspaceId);
  }
};

// src/workspaces/usecase/create-audit-log.usecase.ts
var CreateAuditLogUseCase = class {
  constructor(auditLogRepository) {
    this.auditLogRepository = auditLogRepository;
  }
  async execute(input) {
    const log = WorkspaceAuditLog.create({
      workspaceId: input.workspaceId,
      actorId: input.actorId,
      action: input.action,
      payload: input.payload
    });
    return this.auditLogRepository.create(log);
  }
};

// src/workspaces/usecase/get-workspace-audit-logs.usecase.ts
var GetWorkspaceAuditLogsUseCase = class {
  constructor(auditLogRepository) {
    this.auditLogRepository = auditLogRepository;
  }
  async execute(input) {
    const limit = input.limit ?? 50;
    const offset = input.offset ?? 0;
    const [logs, total] = await Promise.all([
      this.auditLogRepository.findByWorkspaceId(input.workspaceId, limit, offset),
      this.auditLogRepository.countByWorkspaceId(input.workspaceId)
    ]);
    return { logs, total };
  }
};

// src/projects/model/project.entity.ts
var Project = class _Project extends Entity {
  constructor(props) {
    super({
      ...props,
      color: props.color ?? "#6B7280",
      position: props.position ?? 0,
      archived: props.archived ?? false,
      completed: props.completed ?? false,
      isDeleted: props.isDeleted ?? false,
      createdAt: props.createdAt ?? /* @__PURE__ */ new Date(),
      updatedAt: props.updatedAt ?? /* @__PURE__ */ new Date()
    });
  }
  static create(props) {
    return new _Project({
      ...props,
      position: 0,
      archived: false,
      completed: false,
      isDeleted: false
    });
  }
  update(props) {
    return this.clone({
      ...props,
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  archive() {
    return this.clone({
      archived: true,
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  unarchive() {
    return this.clone({
      archived: false,
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  complete() {
    return this.clone({
      completed: true,
      completedAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  uncomplete() {
    return this.clone({
      completed: false,
      completedAt: void 0,
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  softDelete() {
    return this.clone({
      isDeleted: true,
      deletedAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  restore() {
    return this.clone({
      isDeleted: false,
      deletedAt: void 0,
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
};

// src/projects/usecase/create-project.usecase.ts
var CreateProjectUseCase = class {
  constructor(projectRepository) {
    this.projectRepository = projectRepository;
  }
  async execute(props) {
    const project = Project.create(props);
    return this.projectRepository.create(project);
  }
};

// src/projects/usecase/update-project.usecase.ts
var UpdateProjectUseCase = class {
  constructor(projectRepository) {
    this.projectRepository = projectRepository;
  }
  async execute(id, props) {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new Error("Project not found");
    }
    const updatedProject = project.update(props);
    return this.projectRepository.update(updatedProject);
  }
};

// src/projects/usecase/archive-project.usecase.ts
var ArchiveProjectUseCase = class {
  constructor(projectRepository) {
    this.projectRepository = projectRepository;
  }
  async execute(id) {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new Error("Project not found");
    }
    const updatedProject = project.props.archived ? project.unarchive() : project.archive();
    return this.projectRepository.update(updatedProject);
  }
};

// src/projects/usecase/delete-project.usecase.ts
var DeleteProjectUseCase = class {
  constructor(projectRepository) {
    this.projectRepository = projectRepository;
  }
  async execute(id) {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new Error("Project not found");
    }
    await this.projectRepository.delete(id);
  }
};

// src/projects/usecase/soft-delete-project.usecase.ts
var SoftDeleteProjectUseCase = class {
  constructor(projectRepository) {
    this.projectRepository = projectRepository;
  }
  async execute(id) {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new Error("Project not found");
    }
    await this.projectRepository.softDelete(id);
  }
};

// src/projects/usecase/restore-project.usecase.ts
var RestoreProjectUseCase = class {
  constructor(projectRepository) {
    this.projectRepository = projectRepository;
  }
  async execute(id) {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new Error("Project not found");
    }
    if (!project.props.isDeleted) {
      throw new Error("Project is not deleted");
    }
    await this.projectRepository.restore(id);
  }
};

// src/projects/usecase/permanent-delete-project.usecase.ts
var PermanentDeleteProjectUseCase = class {
  constructor(projectRepository) {
    this.projectRepository = projectRepository;
  }
  async execute(id) {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new Error("Project not found");
    }
    if (!project.props.isDeleted) {
      throw new Error("Project must be soft deleted first");
    }
    await this.projectRepository.permanentDelete(id);
  }
};

// src/projects/usecase/get-deleted-projects.usecase.ts
var GetDeletedProjectsUseCase = class {
  constructor(projectRepository) {
    this.projectRepository = projectRepository;
  }
  async execute(workspaceId) {
    const projects = await this.projectRepository.findDeleted(workspaceId);
    return projects;
  }
};

// src/workflows/model/workflow.entity.ts
var Workflow = class _Workflow extends Entity {
  constructor(props) {
    super({
      ...props,
      color: props.color ?? "#6B7280",
      position: props.position ?? 0,
      createdAt: props.createdAt ?? /* @__PURE__ */ new Date(),
      updatedAt: props.updatedAt ?? /* @__PURE__ */ new Date()
    });
  }
  static create(props) {
    return new _Workflow({
      ...props,
      position: 0
    });
  }
  update(props) {
    return this.clone({
      ...props,
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
};

// src/workflows/usecase/create-workflow.usecase.ts
var CreateWorkflowUseCase = class {
  constructor(workflowRepository) {
    this.workflowRepository = workflowRepository;
  }
  async execute(input) {
    const workflow = Workflow.create({
      name: input.name,
      description: input.description,
      color: input.color ?? "#6B7280",
      icon: input.icon,
      workspaceId: input.workspaceId
    });
    await this.workflowRepository.save(workflow);
    return workflow;
  }
};

// src/workflows/usecase/list-workflows.usecase.ts
var ListWorkflowsUseCase = class {
  constructor(workflowRepository) {
    this.workflowRepository = workflowRepository;
  }
  async execute(workspaceId) {
    return this.workflowRepository.findByWorkspaceId(workspaceId);
  }
};

// src/workflows/usecase/update-workflow.usecase.ts
var UpdateWorkflowUseCase = class {
  constructor(workflowRepository) {
    this.workflowRepository = workflowRepository;
  }
  async execute(input) {
    const workflow = await this.workflowRepository.findById(input.id);
    if (!workflow) {
      throw new Error("Workflow not found");
    }
    const updatedWorkflow = workflow.update({
      name: input.name,
      description: input.description,
      color: input.color,
      icon: input.icon,
      position: input.position
    });
    await this.workflowRepository.update(updatedWorkflow);
    return updatedWorkflow;
  }
};

// src/workflows/usecase/delete-workflow.usecase.ts
var DeleteWorkflowUseCase = class {
  constructor(workflowRepository) {
    this.workflowRepository = workflowRepository;
  }
  async execute(id) {
    await this.workflowRepository.delete(id);
  }
};

// src/tags/model/tag.entity.ts
var Tag = class _Tag extends Entity {
  constructor(props) {
    super({
      ...props,
      color: props.color ?? "#6B7280",
      createdAt: props.createdAt ?? /* @__PURE__ */ new Date()
    });
  }
  static create(props) {
    return new _Tag({
      ...props
    });
  }
  update(props) {
    return this.clone({
      ...props
    });
  }
};

// src/tags/usecase/create-tag.usecase.ts
var CreateTagUseCase = class {
  constructor(tagRepository) {
    this.tagRepository = tagRepository;
  }
  async execute(props) {
    const tag = Tag.create(props);
    return this.tagRepository.create(tag);
  }
};

// src/tags/usecase/assign-tag-to-task.usecase.ts
var AssignTagToTaskUseCase = class {
  constructor(tagRepository) {
    this.tagRepository = tagRepository;
  }
  async execute(tagId, taskId) {
    const tag = await this.tagRepository.findById(tagId);
    if (!tag) {
      throw new Error("Tag not found");
    }
    await this.tagRepository.assignToTask(tagId, taskId);
  }
};

// src/tags/usecase/remove-tag-from-task.usecase.ts
var RemoveTagFromTaskUseCase = class {
  constructor(tagRepository) {
    this.tagRepository = tagRepository;
  }
  async execute(tagId, taskId) {
    await this.tagRepository.removeFromTask(tagId, taskId);
  }
};

// src/tags/usecase/update-tag.usecase.ts
var UpdateTagUseCase = class {
  constructor(tagRepository) {
    this.tagRepository = tagRepository;
  }
  async execute(id, props) {
    const tag = await this.tagRepository.findById(id);
    if (!tag) {
      throw new Error("Tag not found");
    }
    const updatedTag = tag.update(props);
    return this.tagRepository.update(updatedTag);
  }
};

// src/timer/model/time-session.entity.ts
var TimeSession = class _TimeSession extends Entity {
  constructor(props) {
    super({
      ...props,
      type: props.type ?? "WORK",
      wasCompleted: props.wasCompleted ?? false,
      wasInterrupted: props.wasInterrupted ?? false,
      pauseCount: props.pauseCount ?? 0,
      totalPauseTime: props.totalPauseTime ?? 0,
      pauseData: props.pauseData ?? [],
      createdAt: props.createdAt ?? /* @__PURE__ */ new Date()
    });
  }
  static create(props) {
    return new _TimeSession({
      ...props,
      wasCompleted: false,
      wasInterrupted: false,
      pauseCount: 0,
      totalPauseTime: 0,
      pauseData: [],
      currentPauseStart: void 0
    });
  }
  pause(pauseStartedAt = /* @__PURE__ */ new Date()) {
    return this.clone({
      pauseCount: (this.props.pauseCount ?? 0) + 1,
      currentPauseStart: pauseStartedAt
    });
  }
  resume(pauseStartedAt, pauseEndedAt = /* @__PURE__ */ new Date()) {
    const actualPauseStart = this.props.currentPauseStart ?? pauseStartedAt;
    const pauseDuration = Math.floor((pauseEndedAt.getTime() - actualPauseStart.getTime()) / 1e3);
    const pauseRecord = {
      startedAt: actualPauseStart,
      endedAt: pauseEndedAt,
      duration: pauseDuration
    };
    return this.clone({
      totalPauseTime: (this.props.totalPauseTime ?? 0) + pauseDuration,
      pauseData: [...this.props.pauseData ?? [], pauseRecord],
      currentPauseStart: void 0
    });
  }
  stop(endedAt = /* @__PURE__ */ new Date(), wasCompleted = false, wasInterrupted = false) {
    let extraPauseTime = 0;
    if (this.props.currentPauseStart) {
      extraPauseTime = Math.floor((endedAt.getTime() - this.props.currentPauseStart.getTime()) / 1e3);
    }
    const totalMs = endedAt.getTime() - this.props.startedAt.getTime();
    const totalSeconds = Math.floor(totalMs / 1e3);
    const activeSeconds = totalSeconds - (this.props.totalPauseTime ?? 0) - extraPauseTime;
    const durationMinutes = Math.round(activeSeconds / 60);
    return this.clone({
      endedAt,
      duration: durationMinutes,
      wasCompleted,
      wasInterrupted,
      currentPauseStart: void 0,
      // Clear pause state
      totalPauseTime: (this.props.totalPauseTime ?? 0) + extraPauseTime
    });
  }
  split(endedAt = /* @__PURE__ */ new Date(), wasCompleted = true, splitReason = "TASK_SWITCH") {
    let extraPauseTime = 0;
    if (this.props.currentPauseStart) {
      extraPauseTime = Math.floor((endedAt.getTime() - this.props.currentPauseStart.getTime()) / 1e3);
    }
    const totalMs = endedAt.getTime() - this.props.startedAt.getTime();
    const totalSeconds = Math.floor(totalMs / 1e3);
    const activeSeconds = totalSeconds - (this.props.totalPauseTime ?? 0) - extraPauseTime;
    const durationMinutes = Math.round(activeSeconds / 60);
    return this.clone({
      endedAt,
      duration: durationMinutes,
      wasCompleted,
      wasInterrupted: false,
      splitReason,
      currentPauseStart: void 0,
      totalPauseTime: (this.props.totalPauseTime ?? 0) + extraPauseTime
    });
  }
  // Getters
  get startedAt() {
    return this.props.startedAt;
  }
  get finishedAt() {
    return this.props.endedAt;
  }
  get duration() {
    return this.props.duration ?? 0;
  }
  get type() {
    return this.props.type;
  }
  get wasCompleted() {
    return this.props.wasCompleted;
  }
  get userId() {
    return this.props.userId;
  }
  get taskId() {
    return this.props.taskId;
  }
};

// src/timer/usecase/start-timer.usecase.ts
var StartTimerUseCase = class {
  constructor(timerRepository, taskRepository) {
    this.timerRepository = timerRepository;
    this.taskRepository = taskRepository;
  }
  async execute(userId, taskId, type = "WORK") {
    const activeSession = await this.timerRepository.findActiveSession(userId);
    if (activeSession) {
      const stoppedSession = activeSession.stop(/* @__PURE__ */ new Date(), false, true);
      await this.timerRepository.update(stoppedSession);
    }
    const session = TimeSession.create({
      userId,
      taskId,
      startedAt: /* @__PURE__ */ new Date(),
      type
    });
    const createdSession = await this.timerRepository.create(session);
    if (type === "WORK" && taskId) {
      const task = await this.taskRepository.findById(taskId);
      if (task && task.props.status === "TODO") {
        const updatedTask = task.updateStatus("IN_PROGRESS");
        await this.taskRepository.update(updatedTask);
      }
    }
    return createdSession;
  }
};

// src/timer/usecase/stop-timer.usecase.ts
var StopTimerUseCase = class {
  constructor(timerRepository) {
    this.timerRepository = timerRepository;
  }
  async execute(userId, wasCompleted = false) {
    const activeSession = await this.timerRepository.findActiveSession(userId);
    if (!activeSession) {
      throw new Error("No active timer session found");
    }
    const stoppedSession = activeSession.stop(/* @__PURE__ */ new Date(), wasCompleted, !wasCompleted);
    return this.timerRepository.update(stoppedSession);
  }
};

// src/timer/usecase/pause-timer.usecase.ts
var PauseTimerUseCase = class {
  constructor(timerRepository) {
    this.timerRepository = timerRepository;
  }
  async execute(userId, pauseStartedAt = /* @__PURE__ */ new Date()) {
    const activeSession = await this.timerRepository.findActiveSession(userId);
    if (!activeSession) {
      throw new Error("No active timer session found");
    }
    const pausedSession = activeSession.pause(pauseStartedAt);
    return this.timerRepository.update(pausedSession);
  }
};

// src/timer/usecase/resume-timer.usecase.ts
var ResumeTimerUseCase = class {
  constructor(timerRepository) {
    this.timerRepository = timerRepository;
  }
  async execute(userId, pauseStartedAt, pauseEndedAt = /* @__PURE__ */ new Date()) {
    const activeSession = await this.timerRepository.findActiveSession(userId);
    if (!activeSession) {
      throw new Error("No active timer session found");
    }
    const resumedSession = activeSession.resume(pauseStartedAt, pauseEndedAt);
    return this.timerRepository.update(resumedSession);
  }
};

// src/timer/usecase/switch-task.usecase.ts
var SwitchTaskUseCase = class {
  constructor(timerRepository) {
    this.timerRepository = timerRepository;
  }
  async execute(userId, newTaskId, type = "WORK", splitReason = "TASK_SWITCH") {
    const activeSession = await this.timerRepository.findActiveSession(userId);
    if (!activeSession) {
      throw new Error("No active timer session found");
    }
    const stoppedSession = activeSession.split(/* @__PURE__ */ new Date(), true, splitReason);
    await this.timerRepository.update(stoppedSession);
    const newSession = TimeSession.create({
      userId,
      taskId: newTaskId,
      startedAt: /* @__PURE__ */ new Date(),
      type,
      parentSessionId: stoppedSession.id
    });
    const createdSession = await this.timerRepository.create(newSession);
    return {
      oldSession: stoppedSession,
      newSession: createdSession
    };
  }
};

// src/analytics/model/daily-metrics.entity.ts
var DailyMetrics = class _DailyMetrics extends Entity {
  constructor(props) {
    super({
      ...props,
      tasksCreated: props.tasksCreated ?? 0,
      tasksCompleted: props.tasksCompleted ?? 0,
      subtasksCompleted: props.subtasksCompleted ?? 0,
      minutesWorked: props.minutesWorked ?? 0,
      pomodorosCompleted: props.pomodorosCompleted ?? 0,
      shortBreaksCompleted: props.shortBreaksCompleted ?? 0,
      longBreaksCompleted: props.longBreaksCompleted ?? 0,
      breakMinutes: props.breakMinutes ?? 0,
      createdAt: props.createdAt ?? /* @__PURE__ */ new Date()
    });
  }
  static create(props) {
    return new _DailyMetrics({
      ...props,
      tasksCreated: 0,
      tasksCompleted: 0,
      subtasksCompleted: 0,
      minutesWorked: 0,
      pomodorosCompleted: 0,
      shortBreaksCompleted: 0,
      longBreaksCompleted: 0,
      breakMinutes: 0
    });
  }
  incrementTasksCreated() {
    return this.clone({ tasksCreated: this.props.tasksCreated + 1 });
  }
  incrementTasksCompleted() {
    return this.clone({ tasksCompleted: this.props.tasksCompleted + 1 });
  }
  decrementTasksCompleted() {
    return this.clone({ tasksCompleted: Math.max(0, this.props.tasksCompleted - 1) });
  }
  incrementSubtasksCompleted() {
    return this.clone({ subtasksCompleted: this.props.subtasksCompleted + 1 });
  }
  decrementSubtasksCompleted() {
    return this.clone({ subtasksCompleted: Math.max(0, this.props.subtasksCompleted - 1) });
  }
  addMinutesWorked(minutes) {
    return this.clone({ minutesWorked: this.props.minutesWorked + minutes });
  }
  incrementPomodoros() {
    return this.clone({ pomodorosCompleted: this.props.pomodorosCompleted + 1 });
  }
  updateFocusScore(score) {
    return this.clone({ focusScore: Math.max(0, Math.min(1, score)) });
  }
  incrementShortBreaks() {
    return this.clone({ shortBreaksCompleted: this.props.shortBreaksCompleted + 1 });
  }
  incrementLongBreaks() {
    return this.clone({ longBreaksCompleted: this.props.longBreaksCompleted + 1 });
  }
  addBreakMinutes(minutes) {
    return this.clone({ breakMinutes: this.props.breakMinutes + minutes });
  }
};

// src/analytics/usecase/get-daily-metrics.usecase.ts
var GetDailyMetricsUseCase = class {
  constructor(analyticsRepository) {
    this.analyticsRepository = analyticsRepository;
  }
  async execute(userId, date5 = /* @__PURE__ */ new Date()) {
    let metrics = await this.analyticsRepository.findByDate(userId, date5);
    if (!metrics) {
      metrics = DailyMetrics.create({
        userId,
        date: date5
      });
    }
    return metrics;
  }
};

// src/analytics/usecase/update-daily-metrics.usecase.ts
var UpdateDailyMetricsUseCase = class {
  constructor(analyticsRepository) {
    this.analyticsRepository = analyticsRepository;
  }
  async execute(input) {
    const normalizedDate = new Date(input.date);
    normalizedDate.setHours(0, 0, 0, 0);
    let metrics = await this.analyticsRepository.findByDate(input.userId, normalizedDate);
    if (!metrics) {
      metrics = DailyMetrics.create({
        userId: input.userId,
        date: normalizedDate
      });
    }
    if (input.tasksCreated) {
      for (let i = 0; i < input.tasksCreated; i++) {
        metrics = metrics.incrementTasksCreated();
      }
    }
    if (input.tasksCompleted) {
      for (let i = 0; i < Math.abs(input.tasksCompleted); i++) {
        if (input.tasksCompleted > 0) {
          metrics = metrics.incrementTasksCompleted();
        } else {
          metrics = metrics.decrementTasksCompleted();
        }
      }
    }
    if (input.subtasksCompleted) {
      for (let i = 0; i < Math.abs(input.subtasksCompleted); i++) {
        if (input.subtasksCompleted > 0) {
          metrics = metrics.incrementSubtasksCompleted();
        } else {
          metrics = metrics.decrementSubtasksCompleted();
        }
      }
    }
    if (input.minutesWorked) {
      metrics = metrics.addMinutesWorked(input.minutesWorked);
    }
    if (input.pomodorosCompleted) {
      for (let i = 0; i < input.pomodorosCompleted; i++) {
        metrics = metrics.incrementPomodoros();
      }
    }
    if (input.shortBreaksCompleted) {
      for (let i = 0; i < input.shortBreaksCompleted; i++) {
        metrics = metrics.incrementShortBreaks();
      }
    }
    if (input.longBreaksCompleted) {
      for (let i = 0; i < input.longBreaksCompleted; i++) {
        metrics = metrics.incrementLongBreaks();
      }
    }
    if (input.breakMinutes) {
      metrics = metrics.addBreakMinutes(input.breakMinutes);
    }
    if (input.focusScore !== void 0) {
      metrics = metrics.updateFocusScore(input.focusScore);
    }
    await this.analyticsRepository.save(metrics);
    return metrics;
  }
};

// src/analytics/usecase/calculate-focus-score.usecase.ts
var CalculateFocusScoreUseCase = class {
  execute(input) {
    const { totalWorkSeconds, totalPauseSeconds, pauseCount } = input;
    if (totalWorkSeconds <= 0) {
      return 0;
    }
    const totalTime = totalWorkSeconds + totalPauseSeconds;
    const workRatio = totalWorkSeconds / totalTime;
    const pausePenalty = Math.min(pauseCount * 0.02, 0.2);
    let focusScore = workRatio - pausePenalty;
    focusScore = Math.max(0, Math.min(1, focusScore));
    return focusScore;
  }
};

// src/ai/model/ai-profile.entity.ts
var AIProfile = class _AIProfile extends Entity {
  constructor(props) {
    super({
      ...props,
      peakHours: props.peakHours ?? {},
      peakDays: props.peakDays ?? {},
      avgTaskDuration: props.avgTaskDuration ?? 30,
      completionRate: props.completionRate ?? 0.7,
      categoryPreferences: props.categoryPreferences ?? {},
      updatedAt: props.updatedAt ?? /* @__PURE__ */ new Date()
    });
  }
  static create(userId) {
    return new _AIProfile({
      userId,
      peakHours: {},
      peakDays: {},
      avgTaskDuration: 30,
      completionRate: 0.7,
      categoryPreferences: {}
    });
  }
  /**
   * Update productivity score for a specific hour of the day (0-23)
   * Uses exponential moving average to smooth out variations
   */
  updatePeakHour(hour, score) {
    if (hour < 0 || hour > 23) {
      throw new Error("Hour must be between 0 and 23");
    }
    if (score < 0 || score > 1) {
      throw new Error("Score must be between 0 and 1");
    }
    const currentScore = this.props.peakHours[hour] ?? 0.5;
    const newScore = currentScore * 0.7 + score * 0.3;
    return this.clone({
      peakHours: {
        ...this.props.peakHours,
        [hour]: newScore
      },
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  /**
   * Update productivity score for a specific day of the week (0=Sunday, 6=Saturday)
   * Uses exponential moving average to smooth out variations
   */
  updatePeakDay(dayOfWeek, score) {
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      throw new Error("Day of week must be between 0 and 6");
    }
    if (score < 0 || score > 1) {
      throw new Error("Score must be between 0 and 1");
    }
    const currentScore = this.props.peakDays[dayOfWeek] ?? 0.5;
    const newScore = currentScore * 0.7 + score * 0.3;
    return this.clone({
      peakDays: {
        ...this.props.peakDays,
        [dayOfWeek]: newScore
      },
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  /**
   * Recalculate average task duration based on recent completed tasks
   * Uses exponential moving average to give more weight to recent data
   */
  recalculateAvgDuration(recentDurations) {
    if (recentDurations.length === 0) {
      return this;
    }
    const avgRecent = recentDurations.reduce((sum, d) => sum + d, 0) / recentDurations.length;
    const newAvg = this.props.avgTaskDuration * 0.6 + avgRecent * 0.4;
    return this.clone({
      avgTaskDuration: Math.round(newAvg),
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  /**
   * Update completion rate based on completed and total tasks
   * Uses exponential moving average
   */
  updateCompletionRate(completed, total) {
    if (total === 0) {
      return this;
    }
    if (completed > total) {
      throw new Error("Completed tasks cannot exceed total tasks");
    }
    const newRate = completed / total;
    const updatedRate = this.props.completionRate * 0.8 + newRate * 0.2;
    return this.clone({
      completionRate: Math.max(0, Math.min(1, updatedRate)),
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  /**
   * Update preference score for a category
   * Higher score means user works better/prefers this category
   */
  updateCategoryPreference(category, score) {
    if (score < 0 || score > 1) {
      throw new Error("Score must be between 0 and 1");
    }
    const currentScore = this.props.categoryPreferences[category] ?? 0.5;
    const newScore = currentScore * 0.7 + score * 0.3;
    return this.clone({
      categoryPreferences: {
        ...this.props.categoryPreferences,
        [category]: newScore
      },
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  /**
   * Get the top N most productive hours
   */
  getTopPeakHours(limit = 3) {
    return Object.entries(this.props.peakHours).sort(([, a], [, b]) => b - a).slice(0, limit).map(([hour]) => parseInt(hour));
  }
  /**
   * Get the top N most productive days
   */
  getTopPeakDays(limit = 3) {
    return Object.entries(this.props.peakDays).sort(([, a], [, b]) => b - a).slice(0, limit).map(([day]) => parseInt(day));
  }
  /**
   * Get the top N preferred categories
   */
  getTopCategories(limit = 5) {
    return Object.entries(this.props.categoryPreferences).sort(([, a], [, b]) => b - a).slice(0, limit).map(([category]) => category);
  }
  /**
   * Check if a specific hour is a peak productivity hour (score > 0.7)
   */
  isPeakHour(hour) {
    return (this.props.peakHours[hour] ?? 0) > 0.7;
  }
  /**
   * Check if a specific day is a peak productivity day (score > 0.7)
   */
  isPeakDay(dayOfWeek) {
    return (this.props.peakDays[dayOfWeek] ?? 0) > 0.7;
  }
};

// src/ai/model/productivity-report.entity.ts
var ProductivityReport = class _ProductivityReport extends Entity {
  constructor(props) {
    super({
      ...props,
      strengths: props.strengths ?? [],
      weaknesses: props.weaknesses ?? [],
      recommendations: props.recommendations ?? [],
      patterns: props.patterns ?? [],
      productivityScore: Math.min(100, Math.max(0, props.productivityScore ?? 0)),
      metricsSnapshot: props.metricsSnapshot ?? {},
      generatedAt: props.generatedAt ?? /* @__PURE__ */ new Date(),
      aiModel: props.aiModel ?? "gemini-2.0-flash-exp"
    });
    if (props.productivityScore < 0 || props.productivityScore > 100) {
      throw new Error("Productivity score must be between 0 and 100");
    }
    if (!props.summary || props.summary.trim().length === 0) {
      throw new Error("Summary cannot be empty");
    }
  }
  static create(props) {
    return new _ProductivityReport({
      ...props,
      generatedAt: /* @__PURE__ */ new Date(),
      aiModel: "gemini-2.0-flash-exp"
    });
  }
  /**
   * Get a human-readable label for the scope
   */
  getScopeLabel() {
    switch (this.props.scope) {
      case "TASK_COMPLETION":
        return "Task Completion Report";
      case "PROJECT_SUMMARY":
        return "Project Summary";
      case "PERSONAL_ANALYSIS":
        return "Personal Analysis";
      case "WEEKLY_SCHEDULED":
        return "Weekly Report";
      case "MONTHLY_SCHEDULED":
        return "Monthly Report";
      default:
        return "Report";
    }
  }
  /**
   * Get a color for the productivity score
   */
  getScoreColor() {
    if (this.props.productivityScore >= 80) return "green";
    if (this.props.productivityScore >= 60) return "yellow";
    return "red";
  }
  /**
   * Check if this is a good productivity score
   */
  isGoodScore() {
    return this.props.productivityScore >= 70;
  }
  /**
   * Get a summary of the metrics snapshot
   */
  getMetricsSummary() {
    const m = this.props.metricsSnapshot;
    const parts = [];
    if (m.tasksCompleted !== void 0) {
      parts.push(`${m.tasksCompleted} tasks completed`);
    }
    if (m.minutesWorked !== void 0) {
      const hours = Math.floor(m.minutesWorked / 60);
      const mins = m.minutesWorked % 60;
      if (hours > 0) {
        parts.push(`${hours}h ${mins}m worked`);
      } else {
        parts.push(`${mins}m worked`);
      }
    }
    if (m.pomodorosCompleted !== void 0 && m.pomodorosCompleted > 0) {
      parts.push(`${m.pomodorosCompleted} pomodoros`);
    }
    return parts.join(", ") || "No metrics available";
  }
  /**
   * Check if this report has actionable recommendations
   */
  hasRecommendations() {
    return this.props.recommendations.length > 0;
  }
  /**
   * Get the top N recommendations
   */
  getTopRecommendations(limit = 3) {
    return this.props.recommendations.slice(0, limit);
  }
};

// src/ai/usecase/learn-from-session.usecase.ts
var LearnFromSessionUseCase = class {
  constructor(aiProfileRepository) {
    this.aiProfileRepository = aiProfileRepository;
  }
  async execute(input) {
    const { session } = input;
    if (!session.props.wasCompleted) {
      throw new Error("Can only learn from completed sessions");
    }
    if (session.props.type !== "WORK" && session.props.type !== "CONTINUOUS") {
      throw new Error("Can only learn from WORK or CONTINUOUS sessions");
    }
    const profile = await this.aiProfileRepository.findOrCreate(session.props.userId);
    const startedAt = session.props.startedAt;
    const hour = startedAt.getHours();
    const dayOfWeek = startedAt.getDay();
    const productivityScore = this.calculateProductivityScore(session);
    let updatedProfile = profile.updatePeakHour(hour, productivityScore).updatePeakDay(dayOfWeek, productivityScore);
    if (session.props.taskId && session.props.duration) {
      updatedProfile = updatedProfile.recalculateAvgDuration([session.props.duration]);
    }
    return await this.aiProfileRepository.update(updatedProfile);
  }
  /**
   * Calculate productivity score based on session characteristics
   * Returns a value between 0 and 1
   */
  calculateProductivityScore(session) {
    const duration3 = session.props.duration ?? 0;
    const pauseCount = session.props.pauseCount ?? 0;
    const totalPauseTime = session.props.totalPauseTime ?? 0;
    const wasCompleted = session.props.wasCompleted;
    let score = 0.5;
    if (wasCompleted) {
      score += 0.2;
    }
    if (duration3 >= 25 && duration3 <= 50) {
      score += 0.2;
    } else if (duration3 >= 10 && duration3 < 25) {
      score += 0.1;
    } else if (duration3 > 50) {
      score += 0.1;
    }
    const pausePenalty = Math.min(pauseCount * 0.05, 0.3);
    score -= pausePenalty;
    if (duration3 > 0) {
      const totalSessionTime = duration3 * 60 + totalPauseTime;
      const workTimeRatio = duration3 * 60 / totalSessionTime;
      if (workTimeRatio >= 0.9) {
        score += 0.2;
      } else if (workTimeRatio >= 0.8) {
        score += 0.15;
      } else if (workTimeRatio >= 0.7) {
        score += 0.1;
      } else if (workTimeRatio < 0.5) {
        score -= 0.2;
      }
    }
    return Math.max(0, Math.min(1, score));
  }
};

// src/ai/usecase/get-optimal-schedule.usecase.ts
var DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var GetOptimalScheduleUseCase = class {
  constructor(aiProfileRepository) {
    this.aiProfileRepository = aiProfileRepository;
  }
  async execute(input) {
    const { userId, topN = 5 } = input;
    const profile = await this.aiProfileRepository.findByUserId(userId);
    if (!profile) {
      return {
        peakHours: [],
        peakDays: [],
        recommendation: "Start tracking your work sessions to get personalized productivity insights!"
      };
    }
    const topPeakHours = this.getTopPeakHours(profile, topN);
    const topPeakDays = this.getTopPeakDays(profile, 3);
    const recommendation = this.generateRecommendation(profile, topPeakHours, topPeakDays);
    return {
      peakHours: topPeakHours,
      peakDays: topPeakDays,
      recommendation
    };
  }
  getTopPeakHours(profile, limit) {
    const peakHours = profile.props.peakHours;
    return Object.entries(peakHours).map(([hour, score]) => ({
      hour: parseInt(hour),
      score,
      label: this.formatHour(parseInt(hour))
    })).sort((a, b) => b.score - a.score).slice(0, limit);
  }
  getTopPeakDays(profile, limit) {
    const peakDays = profile.props.peakDays;
    return Object.entries(peakDays).map(([day, score]) => {
      const dayNum = parseInt(day);
      return {
        day: dayNum,
        score,
        label: DAY_NAMES[dayNum] || "Unknown"
      };
    }).sort((a, b) => b.score - a.score).slice(0, limit);
  }
  formatHour(hour) {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  }
  generateRecommendation(profile, topHours, topDays) {
    if (topHours.length === 0 && topDays.length === 0) {
      return "Keep tracking your work sessions to discover your peak productivity times!";
    }
    const parts = [];
    if (topHours.length > 0) {
      const bestHour = topHours[0];
      if (bestHour && bestHour.score > 0.7) {
        const hourList = topHours.slice(0, 3).map((h) => h.label).join(", ");
        parts.push(`Your peak productivity hours are ${hourList}.`);
      } else if (bestHour && bestHour.score > 0.5) {
        parts.push(`You work well during ${bestHour.label}.`);
      }
    }
    if (topDays.length > 0) {
      const bestDay = topDays[0];
      if (bestDay && bestDay.score > 0.7) {
        const dayList = topDays.slice(0, 2).map((d) => d.label).join(" and ");
        parts.push(`You're most productive on ${dayList}.`);
      }
    }
    const avgDuration = profile.props.avgTaskDuration;
    if (avgDuration > 0) {
      parts.push(`Your average focused work session is ${avgDuration} minutes.`);
    }
    const completionRate = profile.props.completionRate;
    if (completionRate >= 0.8) {
      parts.push(`You have an excellent task completion rate of ${Math.round(completionRate * 100)}%!`);
    } else if (completionRate < 0.5) {
      parts.push(`Try breaking tasks into smaller chunks to improve your ${Math.round(completionRate * 100)}% completion rate.`);
    }
    return parts.join(" ") || "Keep working to build your productivity profile!";
  }
};

// src/ai/usecase/predict-task-duration.usecase.ts
var PredictTaskDurationUseCase = class {
  constructor(aiProfileRepository) {
    this.aiProfileRepository = aiProfileRepository;
  }
  async execute(input) {
    const { userId, taskTitle, taskDescription, category, priority } = input;
    const profile = await this.aiProfileRepository.findByUserId(userId);
    if (!profile) {
      return {
        estimatedMinutes: 30,
        confidence: "LOW",
        reasoning: "Using default estimate of 30 minutes. Complete more tasks to get personalized predictions!"
      };
    }
    let estimatedMinutes = profile.props.avgTaskDuration;
    let confidence = "MEDIUM";
    const reasoningParts = [];
    if (category && profile.props.categoryPreferences[category]) {
      const categoryScore = profile.props.categoryPreferences[category];
      if (categoryScore > 0.7) {
        estimatedMinutes *= 0.85;
        reasoningParts.push(`You're efficient with ${category} tasks (-15%)`);
        confidence = "HIGH";
      } else if (categoryScore < 0.4) {
        estimatedMinutes *= 1.2;
        reasoningParts.push(`${category} tasks typically take you longer (+20%)`);
        confidence = "MEDIUM";
      }
    }
    if (priority) {
      switch (priority) {
        case "URGENT":
          estimatedMinutes *= 0.9;
          reasoningParts.push("Urgent priority tends to increase focus (-10%)");
          break;
        case "HIGH":
          estimatedMinutes *= 1.1;
          reasoningParts.push("High priority suggests complexity (+10%)");
          break;
        case "LOW":
          estimatedMinutes *= 0.85;
          reasoningParts.push("Low priority typically means simpler tasks (-15%)");
          break;
      }
    }
    const text = `${taskTitle || ""} ${taskDescription || ""}`.toLowerCase();
    if (this.containsComplexityKeywords(text, ["refactor", "redesign", "architecture", "migration"])) {
      estimatedMinutes *= 1.5;
      reasoningParts.push("Complex task keywords detected (+50%)");
    } else if (this.containsComplexityKeywords(text, ["fix", "bug", "issue", "debug"])) {
      estimatedMinutes *= 1.2;
      reasoningParts.push("Debugging tasks can be unpredictable (+20%)");
    } else if (this.containsComplexityKeywords(text, ["simple", "quick", "minor", "small"])) {
      estimatedMinutes *= 0.75;
      reasoningParts.push("Simple task indicators found (-25%)");
    }
    estimatedMinutes = Math.round(estimatedMinutes / 5) * 5;
    estimatedMinutes = Math.max(10, estimatedMinutes);
    let reasoning = `Based on your average of ${profile.props.avgTaskDuration} minutes`;
    if (reasoningParts.length > 0) {
      reasoning += `. ${reasoningParts.join(". ")}.`;
    } else {
      reasoning += ".";
    }
    if (!category && !priority && !taskTitle && !taskDescription) {
      confidence = "LOW";
    }
    return {
      estimatedMinutes,
      confidence,
      reasoning
    };
  }
  containsComplexityKeywords(text, keywords) {
    return keywords.some((keyword) => text.includes(keyword));
  }
};

// src/ai/usecase/generate-weekly-report.usecase.ts
var GenerateWeeklyReportUseCase = class {
  constructor(reportRepository, analyticsRepository, timerRepository, aiProfileRepository, generateReportData) {
    this.reportRepository = reportRepository;
    this.analyticsRepository = analyticsRepository;
    this.timerRepository = timerRepository;
    this.aiProfileRepository = aiProfileRepository;
    this.generateReportData = generateReportData;
  }
  async execute(input) {
    const { userId, weekStart } = input;
    const startDate = weekStart || this.getWeekStart(/* @__PURE__ */ new Date());
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    const existing = await this.reportRepository.findLatestByScope(
      userId,
      "WEEKLY_SCHEDULED"
    );
    if (existing && this.isSameWeek(existing.props.generatedAt, startDate)) {
      return { report: existing, isNew: false };
    }
    const [dailyMetrics, sessions, profile] = await Promise.all([
      this.analyticsRepository.getRange(userId, startDate, endDate),
      this.timerRepository.findByUserIdAndDateRange(userId, startDate, endDate),
      this.aiProfileRepository.findByUserId(userId)
    ]);
    const metricsSnapshot = {
      tasksCreated: dailyMetrics.reduce(
        (sum, m) => sum + m.props.tasksCreated,
        0
      ),
      tasksCompleted: dailyMetrics.reduce(
        (sum, m) => sum + m.props.tasksCompleted,
        0
      ),
      minutesWorked: dailyMetrics.reduce(
        (sum, m) => sum + m.props.minutesWorked,
        0
      ),
      pomodorosCompleted: dailyMetrics.reduce(
        (sum, m) => sum + m.props.pomodorosCompleted,
        0
      ),
      focusScore: dailyMetrics.length > 0 ? dailyMetrics.reduce(
        (sum, m) => sum + (m.props.focusScore ?? 0),
        0
      ) / dailyMetrics.length : 0,
      sessionsCount: sessions.length
    };
    const reportData = await this.generateReportData({
      userId,
      scope: "WEEKLY_SCHEDULED",
      metricsSnapshot,
      sessions: sessions.map((s) => s.props),
      profile: profile?.props
    });
    const report = ProductivityReport.create({
      userId,
      scope: "WEEKLY_SCHEDULED",
      summary: reportData.summary,
      strengths: reportData.strengths,
      weaknesses: reportData.weaknesses,
      recommendations: reportData.recommendations,
      patterns: reportData.patterns,
      productivityScore: reportData.productivityScore,
      metricsSnapshot
    });
    const savedReport = await this.reportRepository.save(report);
    return { report: savedReport, isNew: true };
  }
  /**
   * Get the start of the week (Monday) for a given date
   */
  getWeekStart(date5) {
    const d = new Date(date5);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }
  /**
   * Check if two dates are in the same week
   */
  isSameWeek(date1, date22) {
    const start1 = this.getWeekStart(date1);
    const start2 = this.getWeekStart(date22);
    return start1.getTime() === start2.getTime();
  }
};

// src/ai/ai-service.ts
var MockAIService = class {
  async suggestTaskDetails(input) {
    await new Promise((resolve) => setTimeout(resolve, 1e3));
    const lowerInput = input.toLowerCase();
    let priority = "MEDIUM";
    if (lowerInput.includes("urgente") || lowerInput.includes("asap")) {
      priority = "URGENT";
    } else if (lowerInput.includes("importante")) {
      priority = "HIGH";
    }
    let dueDate = void 0;
    if (lowerInput.includes("ma\xF1ana")) {
      const tomorrow = /* @__PURE__ */ new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      dueDate = tomorrow;
    } else if (lowerInput.includes("hoy")) {
      dueDate = /* @__PURE__ */ new Date();
    }
    return {
      title: input,
      description: "Generated by Ordo AI based on your input.",
      priority,
      dueDate
    };
  }
  async chat(message, context) {
    await new Promise((resolve) => setTimeout(resolve, 1e3));
    return `I am Ordo AI. You said: "${message}". I am currently in development mode.`;
  }
};
var aiService = new MockAIService();

// src/habits/model/habit.entity.ts
var Habit = class _Habit extends Entity {
  constructor(props) {
    super({
      ...props,
      frequency: props.frequency ?? "DAILY",
      targetDaysOfWeek: props.targetDaysOfWeek ?? [0, 1, 2, 3, 4, 5, 6],
      targetCount: props.targetCount ?? 1,
      color: props.color ?? "#10B981",
      currentStreak: props.currentStreak ?? 0,
      longestStreak: props.longestStreak ?? 0,
      totalCompletions: props.totalCompletions ?? 0,
      isActive: props.isActive ?? true,
      isPaused: props.isPaused ?? false,
      completions: props.completions ?? [],
      createdAt: props.createdAt ?? /* @__PURE__ */ new Date(),
      updatedAt: props.updatedAt ?? /* @__PURE__ */ new Date()
    });
  }
  static create(props) {
    return new _Habit({
      ...props,
      currentStreak: 0,
      longestStreak: 0,
      totalCompletions: 0,
      isActive: true,
      isPaused: false
    });
  }
  /**
   * Check if habit is scheduled for a given day of week (0=Sunday, 6=Saturday)
   */
  isScheduledForDay(dayOfWeek) {
    if (this.props.frequency === "DAILY") {
      return true;
    }
    if (this.props.frequency === "SPECIFIC_DAYS") {
      return this.props.targetDaysOfWeek.includes(dayOfWeek);
    }
    return true;
  }
  /**
   * Mark habit as completed, updating streak
   */
  complete(isConsecutive = true) {
    const newTotal = (this.props.totalCompletions || 0) + 1;
    const newStreak = isConsecutive ? (this.props.currentStreak || 0) + 1 : 1;
    const newLongest = Math.max(this.props.longestStreak || 0, newStreak);
    return this.clone({
      totalCompletions: newTotal,
      currentStreak: newStreak,
      longestStreak: newLongest,
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  /**
   * Reset streak (when habit is missed)
   */
  resetStreak() {
    return this.clone({
      currentStreak: 0,
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  /**
   * Pause habit tracking (vacation, illness, etc.)
   */
  pause() {
    return this.clone({
      isPaused: true,
      pausedAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  /**
   * Resume habit tracking
   */
  resume() {
    return this.clone({
      isPaused: false,
      pausedAt: void 0,
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  /**
   * Archive habit (soft delete)
   */
  archive() {
    return this.clone({
      isActive: false,
      archivedAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  /**
   * Update habit properties
   */
  update(props) {
    return this.clone({
      ...props,
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
};

// src/notes/model/note.entity.ts
var Note = class _Note extends Entity {
  constructor(props) {
    super({
      ...props,
      x: props.x ?? 100,
      y: props.y ?? 100,
      width: props.width ?? 300,
      height: props.height ?? 300,
      color: props.color ?? "#feff9c"
    });
  }
  static create(props) {
    return new _Note({
      ...props,
      x: props.x ?? 100,
      y: props.y ?? 100,
      width: props.width ?? 300,
      height: props.height ?? 300,
      color: props.color ?? "#feff9c",
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  updateContent(content) {
    return this.clone({
      content,
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  updatePosition(x, y) {
    return this.clone({
      x,
      y,
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  updateSize(width, height) {
    return this.clone({
      width,
      height,
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  updateColor(color) {
    return this.clone({
      color,
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  update(props) {
    return this.clone({
      ...props,
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
};

// src/notes/usecase/create-note.usecase.ts
var CreateNoteUseCase = class {
  constructor(repository) {
    this.repository = repository;
  }
  async execute(input) {
    if (!input.content || input.content.trim().length === 0) {
      throw new Error("Note content is required");
    }
    if (!input.workspaceId) {
      throw new Error("Workspace ID is required");
    }
    const note = Note.create({
      content: input.content,
      workspaceId: input.workspaceId,
      authorId: input.authorId,
      x: input.x ?? 100,
      y: input.y ?? 100,
      width: input.width ?? 300,
      height: input.height ?? 300,
      color: input.color ?? "#feff9c"
    });
    await this.repository.save(note);
    return note;
  }
};

// src/notes/usecase/find-note.usecase.ts
var FindNoteUseCase = class {
  constructor(repository) {
    this.repository = repository;
  }
  async execute(input) {
    const note = await this.repository.findById(input.id);
    if (!note) {
      throw new Error("Note not found");
    }
    if (note.props.authorId !== input.userId) {
      const member = await this.repository.findWorkspaceMember(
        note.props.workspaceId,
        input.userId
      );
      if (!member) {
        throw new Error("You do not have permission to access this note");
      }
    }
    return note;
  }
};

// src/notes/usecase/update-note.usecase.ts
var UpdateNoteUseCase = class {
  constructor(repository) {
    this.repository = repository;
  }
  async execute(input) {
    const findNoteUseCase = new FindNoteUseCase(this.repository);
    const note = await findNoteUseCase.execute({
      id: input.id,
      userId: input.userId
    });
    if (note.props.authorId !== input.userId) {
      throw new Error("Only the note author can update it");
    }
    const updatedNote = note.update({
      content: input.content,
      x: input.x,
      y: input.y,
      width: input.width,
      height: input.height,
      color: input.color
    });
    await this.repository.update(updatedNote);
    return updatedNote;
  }
};

// src/notes/usecase/delete-note.usecase.ts
var DeleteNoteUseCase = class {
  constructor(repository) {
    this.repository = repository;
  }
  async execute(input) {
    const findNoteUseCase = new FindNoteUseCase(this.repository);
    const note = await findNoteUseCase.execute({
      id: input.id,
      userId: input.userId
    });
    if (note.props.authorId !== input.userId) {
      throw new Error("Only the note author can delete it");
    }
    await this.repository.delete(note.id);
    return note;
  }
};

// src/notes/usecase/find-all-notes.usecase.ts
var FindAllNotesUseCase = class {
  constructor(repository) {
    this.repository = repository;
  }
  async execute(input) {
    const member = await this.repository.findWorkspaceMember(
      input.workspaceId,
      input.userId
    );
    if (!member) {
      throw new Error("You are not a member of this workspace");
    }
    return await this.repository.findByWorkspaceId(input.workspaceId, {
      limit: input.limit,
      page: input.page,
      search: input.search,
      authorId: input.authorId,
      sortBy: input.sortBy,
      sortOrder: input.sortOrder
    });
  }
};

// src/comments/model/comment.entity.ts
var Comment = class _Comment extends Entity {
  constructor(props, mode = "valid") {
    super({
      ...props,
      mentions: props.mentions ?? [],
      isEdited: props.isEdited ?? false,
      createdAt: props.createdAt ?? /* @__PURE__ */ new Date(),
      updatedAt: props.updatedAt ?? /* @__PURE__ */ new Date()
    }, mode);
    if (this.mode === "valid") {
      this.validateContent(props.content);
      this.validateTaskId(props.taskId);
      this.validateUserId(props.userId);
      this.validateMentions(props.mentions);
    }
  }
  /**
   * Creates a new comment with defaults applied.
   *
   * Factory method for creating comments without manually
   * setting id, timestamps, and default values.
   *
   * @param props - Comment properties (id, timestamps auto-generated)
   * @returns A new Comment instance
   *
   * @example
   * ```typescript
   * const comment = Comment.create({
   *   taskId: 'task-123',
   *   userId: 'user-456',
   *   content: 'Great work!'
   * });
   * ```
   */
  static create(props) {
    return new _Comment({
      ...props,
      mentions: props.mentions ?? [],
      isEdited: false,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  // Getters for commonly accessed properties
  get taskId() {
    return this.props.taskId;
  }
  get userId() {
    return this.props.userId;
  }
  get content() {
    return this.props.content;
  }
  get mentions() {
    return this.props.mentions ?? [];
  }
  get parentCommentId() {
    return this.props.parentCommentId;
  }
  get isEdited() {
    return this.props.isEdited ?? false;
  }
  get editedAt() {
    return this.props.editedAt;
  }
  get createdAt() {
    return this.props.createdAt ?? /* @__PURE__ */ new Date();
  }
  get updatedAt() {
    return this.props.updatedAt ?? /* @__PURE__ */ new Date();
  }
  /**
   * Updates the comment content.
   *
   * Creates a new comment with updated content, marking it as edited.
   * The edit timestamp is automatically recorded.
   *
   * @param newContent - The new comment content (1-2000 characters)
   * @returns A new Comment instance with updated content
   * @throws {Error} If content is invalid
   *
   * @example
   * ```typescript
   * const comment = Comment.create({
   *   taskId: 'task-123',
   *   userId: 'user-456',
   *   content: 'Original text'
   * });
   *
   * const edited = comment.edit('Corrected text');
   * console.log(edited.isEdited); // true
   * console.log(edited.editedAt); // Date object
   * ```
   */
  edit(newContent) {
    const trimmed = newContent.trim();
    this.validateContent(trimmed);
    return this.clone({
      content: trimmed,
      isEdited: true,
      editedAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  /**
   * Adds a user mention to the comment.
   *
   * If the user is already mentioned, this returns the comment unchanged.
   * Mentions trigger notifications for the mentioned users.
   *
   * @param userId - The ID of the user to mention
   * @returns A new Comment instance with the mention added
   *
   * @example
   * ```typescript
   * const comment = Comment.create({
   *   taskId: 'task-123',
   *   userId: 'user-456',
   *   content: '@user-789 please review'
   * });
   *
   * const withMention = comment.addMention('user-789');
   * console.log(withMention.mentions); // ['user-789']
   * ```
   */
  addMention(userId) {
    if (!userId || userId.trim().length === 0) {
      throw new Error("User ID for mention cannot be empty");
    }
    const currentMentions = this.props.mentions ?? [];
    if (currentMentions.includes(userId)) {
      return this;
    }
    return this.clone({
      mentions: [...currentMentions, userId],
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  /**
   * Removes a user mention from the comment.
   *
   * If the user is not mentioned, this returns the comment unchanged.
   *
   * @param userId - The ID of the user to unmention
   * @returns A new Comment instance with the mention removed
   *
   * @example
   * ```typescript
   * const comment = Comment.create({
   *   taskId: 'task-123',
   *   userId: 'user-456',
   *   content: 'Review',
   *   mentions: ['user-789', 'user-abc']
   * });
   *
   * const withoutMention = comment.removeMention('user-789');
   * console.log(withoutMention.mentions); // ['user-abc']
   * ```
   */
  removeMention(userId) {
    const currentMentions = this.props.mentions ?? [];
    if (!currentMentions.includes(userId)) {
      return this;
    }
    return this.clone({
      mentions: currentMentions.filter((id) => id !== userId),
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  /**
   * Checks if a user is mentioned in this comment.
   *
   * Useful for determining if a notification should be sent.
   *
   * @param userId - The ID of the user to check
   * @returns true if the user is mentioned, false otherwise
   *
   * @example
   * ```typescript
   * const comment = Comment.create({
   *   taskId: 'task-123',
   *   userId: 'user-456',
   *   content: '@user-789 please review',
   *   mentions: ['user-789']
   * });
   *
   * if (comment.hasMention('user-789')) {
   *   sendNotification('user-789', 'You were mentioned');
   * }
   * ```
   */
  hasMention(userId) {
    return this.mentions.includes(userId);
  }
  /**
   * Checks if this comment is a reply to another comment.
   *
   * @returns true if this comment has a parent, false otherwise
   *
   * @example
   * ```typescript
   * const comment = Comment.create({
   *   taskId: 'task-123',
   *   userId: 'user-456',
   *   content: 'I agree',
   *   parentCommentId: 'comment-123'
   * });
   *
   * console.log(comment.isReply()); // true
   * ```
   */
  isReply() {
    return this.props.parentCommentId !== null && this.props.parentCommentId !== void 0 && this.props.parentCommentId.length > 0;
  }
  /**
   * Gets the number of users mentioned in this comment.
   *
   * @returns The count of unique mentioned users
   *
   * @example
   * ```typescript
   * const comment = Comment.create({
   *   taskId: 'task-123',
   *   userId: 'user-456',
   *   content: 'Team please review',
   *   mentions: ['user-789', 'user-abc', 'user-def']
   * });
   *
   * console.log(comment.mentionCount); // 3
   * ```
   */
  get mentionCount() {
    return this.mentions.length;
  }
  /**
   * Validates the comment content.
   *
   * @private
   * @param content - The content to validate
   * @throws {Error} If content is invalid
   */
  validateContent(content) {
    if (!content || typeof content !== "string") {
      throw new Error("Comment content is required");
    }
    const trimmed = content.trim();
    if (trimmed.length === 0) {
      throw new Error("Comment content cannot be empty");
    }
    if (trimmed.length < COMMENT_LIMITS.CONTENT_MIN_LENGTH) {
      throw new Error(
        `Comment content must be at least ${COMMENT_LIMITS.CONTENT_MIN_LENGTH} character(s)`
      );
    }
    if (trimmed.length > COMMENT_LIMITS.CONTENT_MAX_LENGTH) {
      throw new Error(
        `Comment content cannot exceed ${COMMENT_LIMITS.CONTENT_MAX_LENGTH} characters`
      );
    }
  }
  /**
   * Validates the task ID.
   *
   * @private
   * @param taskId - The task ID to validate
   * @throws {Error} If task ID is invalid
   */
  validateTaskId(taskId) {
    if (!taskId || typeof taskId !== "string" || taskId.trim().length === 0) {
      throw new Error("Task ID is required");
    }
  }
  /**
   * Validates the user ID.
   *
   * @private
   * @param userId - The user ID to validate
   * @throws {Error} If user ID is invalid
   */
  validateUserId(userId) {
    if (!userId || typeof userId !== "string" || userId.trim().length === 0) {
      throw new Error("User ID is required");
    }
  }
  /**
   * Validates the mentions array.
   *
   * @private
   * @param mentions - The mentions array to validate
   * @throws {Error} If mentions are invalid
   */
  validateMentions(mentions) {
    if (mentions === void 0 || mentions === null) {
      return;
    }
    if (!Array.isArray(mentions)) {
      throw new Error("Mentions must be an array");
    }
    for (const mention of mentions) {
      if (typeof mention !== "string" || mention.trim().length === 0) {
        throw new Error("Each mention must be a non-empty string");
      }
    }
  }
  /**
   * Creates a draft version of this comment.
   *
   * Draft mode skips validation, useful for forms before submission.
   *
   * @returns A new Comment instance in draft mode
   *
   * @example
   * ```typescript
   * const draft = comment.asDraft();
   * // Can now modify without validation
   * ```
   */
  asDraft() {
    return this.clone(this.props, "draft");
  }
  /**
   * Converts this comment to valid mode.
   *
   * Triggers validation of all properties.
   *
   * @returns A new Comment instance in valid mode
   * @throws {Error} If any validation fails
   *
   * @example
   * ```typescript
   * const draft = new Comment({ content: '' }, 'draft');
   * const valid = draft.asValid(); // Throws error if content is empty
   * ```
   */
  asValid() {
    return this.clone(this.props, "valid");
  }
};

// src/comments/usecase/create-comment.usecase.ts
var CreateCommentUseCase = class {
  constructor(commentRepository) {
    this.commentRepository = commentRepository;
  }
  /**
   * Executes the create comment use case.
   *
   * Creates a new comment on the specified task with the provided content.
   * The comment is validated before being persisted.
   *
   * @param input - The comment creation input data
   * @param _loggedUser - Optional logged user context (not used in this use case)
   * @returns Promise resolving to the created comment
   * @throws {Error} If validation fails or repository operation fails
   *
   * @example
   * ```typescript
   * const comment = await useCase.execute({
   *   taskId: 'task-123',
   *   userId: 'user-456',
   *   content: 'Great work on this task!'
   * });
   * ```
   */
  async execute(input, _loggedUser) {
    if (!input.taskId || input.taskId.trim().length === 0) {
      throw new Error("Task ID is required");
    }
    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error("User ID is required");
    }
    if (!input.content || input.content.trim().length === 0) {
      throw new Error("Comment content is required");
    }
    const comment = Comment.create({
      taskId: input.taskId,
      userId: input.userId,
      content: input.content.trim(),
      parentCommentId: input.parentCommentId ?? null,
      mentions: input.mentions ?? []
    });
    await this.commentRepository.create(comment);
    return comment;
  }
};

// src/comments/usecase/update-comment.usecase.ts
var UpdateCommentUseCase = class {
  constructor(commentRepository) {
    this.commentRepository = commentRepository;
  }
  /**
   * Executes the update comment use case.
   *
   * Updates the content of an existing comment if the user is the author.
   * The comment is marked as edited with a timestamp.
   *
   * @param input - The update input data
   * @param _loggedUser - Optional logged user context (not used in this use case)
   * @returns Promise resolving to the updated comment
   * @throws {Error} If validation fails or user is not the author
   *
   * @example
   * ```typescript
   * const updated = await useCase.execute({
   *   commentId: 'comment-123',
   *   userId: 'user-456',
   *   newContent: 'Corrected information'
   * });
   * ```
   */
  async execute(input, _loggedUser) {
    if (!input.commentId || input.commentId.trim().length === 0) {
      throw new Error("Comment ID is required");
    }
    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error("User ID is required");
    }
    if (!input.newContent || input.newContent.trim().length === 0) {
      throw new Error("New content is required");
    }
    const existingComment = await this.commentRepository.findById(
      input.commentId
    );
    if (!existingComment) {
      throw new Error("Comment not found");
    }
    if (existingComment.userId !== input.userId) {
      throw new Error("You can only edit your own comments");
    }
    const updatedComment = existingComment.edit(input.newContent.trim());
    await this.commentRepository.update(updatedComment);
    return updatedComment;
  }
};

// src/comments/usecase/delete-comment.usecase.ts
var DeleteCommentUseCase = class {
  constructor(commentRepository) {
    this.commentRepository = commentRepository;
  }
  /**
   * Executes the delete comment use case.
   *
   * Permanently deletes a comment if the user is the author.
   *
   * @param input - The delete input data
   * @param _loggedUser - Optional logged user context (not used in this use case)
   * @returns Promise that resolves when the comment is deleted
   * @throws {Error} If validation fails or user is not the author
   *
   * @example
   * ```typescript
   * await useCase.execute({
   *   commentId: 'comment-123',
   *   userId: 'user-456'
   * });
   * ```
   */
  async execute(input, _loggedUser) {
    if (!input.commentId || input.commentId.trim().length === 0) {
      throw new Error("Comment ID is required");
    }
    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error("User ID is required");
    }
    const existingComment = await this.commentRepository.findById(
      input.commentId
    );
    if (!existingComment) {
      throw new Error("Comment not found");
    }
    if (existingComment.userId !== input.userId) {
      throw new Error("You can only delete your own comments");
    }
    await this.commentRepository.delete(input.commentId);
  }
};

// src/comments/usecase/get-comments-by-task.usecase.ts
var GetCommentsByTaskUseCase = class {
  constructor(commentRepository) {
    this.commentRepository = commentRepository;
  }
  /**
    * Executes the get comments by task use case.
    *
    * Retrieves all comments for the specified task, ordered chronologically.
    *
    * @param input - The input containing the task ID
    * @param _loggedUser - Optional logged user context (not used in this use case)
    * @returns Promise resolving to an array of comments (empty if none found)
    * @throws {Error} If task ID is invalid or repository operation fails
    *
    * @example
    * ```typescript
    * const comments = await useCase.execute({
    *   taskId: 'task-123'
  * });
    *
    * // Display comments in UI
    * return (
    *   <CommentThread comments={comments} />
    * );
    * ```
    */
  async execute(input, _loggedUser) {
    if (!input.taskId || input.taskId.trim().length === 0) {
      throw new Error("Task ID is required");
    }
    const comments = await this.commentRepository.findByTaskId(
      input.taskId
    );
    return comments;
  }
};

// src/comments/usecase/get-comments-by-user.usecase.ts
var GetCommentsByUserUseCase = class {
  constructor(commentRepository) {
    this.commentRepository = commentRepository;
  }
  /**
   * Executes the get comments by user use case.
   *
   * Retrieves all comments created by the specified user.
   *
   * @param input - The input containing the user ID
   * @param _loggedUser - Optional logged user context (not used in this use case)
   * @returns Promise resolving to an array of comments (empty if none found)
   * @throws {Error} If user ID is invalid or repository operation fails
   *
   * @example
   * ```typescript
   * const comments = await useCase.execute({
   *   userId: 'user-456'
   * });
   *
   * // Display user's comment history
   * return (
   *   <UserCommentHistory comments={comments} />
   * );
   * ```
   */
  async execute(input, _loggedUser) {
    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error("User ID is required");
    }
    const comments = await this.commentRepository.findByUserId(
      input.userId
    );
    return comments;
  }
};

// src/comments/usecase/add-mention.usecase.ts
var AddMentionUseCase = class {
  constructor(commentRepository) {
    this.commentRepository = commentRepository;
  }
  /**
   * Executes the add mention use case.
   *
   * Adds a user mention to the specified comment. If the user is already
   * mentioned, the comment is returned unchanged.
   *
   * @param input - The input containing comment ID and user ID to mention
   * @param _loggedUser - Optional logged user context (not used in this use case)
   * @returns Promise resolving to the updated comment
   * @throws {Error} If validation fails or comment doesn't exist
   *
   * @example
   * ```typescript
   * const updated = await useCase.execute({
   *   commentId: 'comment-123',
   *   userIdToMention: 'user-789'
   * });
   *
   * // Trigger notification for mentioned user
   * if (updated.hasMention('user-789')) {
   *   await sendMentionNotification('user-789', updated.id);
   * }
   * ```
   */
  async execute(input, _loggedUser) {
    if (!input.commentId || input.commentId.trim().length === 0) {
      throw new Error("Comment ID is required");
    }
    if (!input.userIdToMention || input.userIdToMention.trim().length === 0) {
      throw new Error("User ID to mention is required");
    }
    const existingComment = await this.commentRepository.findById(
      input.commentId
    );
    if (!existingComment) {
      throw new Error("Comment not found");
    }
    const updatedComment = existingComment.addMention(input.userIdToMention);
    await this.commentRepository.update(updatedComment);
    return updatedComment;
  }
};

// src/comments/usecase/remove-mention.usecase.ts
var RemoveMentionUseCase = class {
  constructor(commentRepository) {
    this.commentRepository = commentRepository;
  }
  /**
   * Executes the remove mention use case.
   *
   * Removes a user mention from the specified comment. If the user is not
   * mentioned, the comment is returned unchanged.
   *
   * @param input - The input containing comment ID and user ID to unmention
   * @param _loggedUser - Optional logged user context (not used in this use case)
   * @returns Promise resolving to the updated comment
   * @throws {Error} If validation fails or comment doesn't exist
   *
   * @example
   * ```typescript
   * const updated = await useCase.execute({
   *   commentId: 'comment-123',
   *   userIdToUnmention: 'user-789'
   * });
   *
   * // Check if mention was removed
   * if (!updated.hasMention('user-789')) {
   *   console.log('User successfully unmentioned');
   * }
   * ```
   */
  async execute(input, _loggedUser) {
    if (!input.commentId || input.commentId.trim().length === 0) {
      throw new Error("Comment ID is required");
    }
    if (!input.userIdToUnmention || input.userIdToUnmention.trim().length === 0) {
      throw new Error("User ID to unmention is required");
    }
    const existingComment = await this.commentRepository.findById(
      input.commentId
    );
    if (!existingComment) {
      throw new Error("Comment not found");
    }
    const updatedComment = existingComment.removeMention(
      input.userIdToUnmention
    );
    await this.commentRepository.update(updatedComment);
    return updatedComment;
  }
};

// src/attachments/model/attachment.entity.ts
var Attachment = class _Attachment extends Entity {
  constructor(props, mode = "valid") {
    super({
      ...props,
      isUploaded: props.isUploaded ?? false,
      createdAt: props.createdAt ?? /* @__PURE__ */ new Date(),
      updatedAt: props.updatedAt ?? /* @__PURE__ */ new Date()
    }, mode);
    if (this.mode === "valid") {
      this.validateTaskId(props.taskId);
      this.validateUserId(props.userId);
      this.validateFileName(props.fileName);
      this.validateOriginalName(props.originalName);
      this.validateMimeType(props.mimeType);
      this.validateSize(props.size);
      this.validateStoragePath(props.storagePath);
    }
  }
  /**
   * Creates a new attachment with defaults applied.
   *
   * Factory method for creating attachments without manually
   * setting id, timestamps, and default values.
   *
   * @param props - Attachment properties (id, timestamps auto-generated)
   * @returns A new Attachment instance
   *
   * @example
   * ```typescript
   * const attachment = Attachment.create({
   *   taskId: 'task-123',
   *   userId: 'user-456',
   *   fileName: 'stored-name.pdf',
   *   originalName: 'document.pdf',
   *   mimeType: 'application/pdf',
   *   size: 1024000,
   *   storagePath: '/uploads/stored-name.pdf'
   * });
   * ```
   */
  static create(props) {
    return new _Attachment({
      ...props,
      isUploaded: false,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  // Getters for commonly accessed properties
  get taskId() {
    return this.props.taskId;
  }
  get userId() {
    return this.props.userId;
  }
  get fileName() {
    return this.props.fileName;
  }
  get originalName() {
    return this.props.originalName;
  }
  get mimeType() {
    return this.props.mimeType;
  }
  get size() {
    return this.props.size;
  }
  get storagePath() {
    return this.props.storagePath;
  }
  get isUploaded() {
    return this.props.isUploaded ?? false;
  }
  get uploadedAt() {
    return this.props.uploadedAt;
  }
  get createdAt() {
    return this.props.createdAt ?? /* @__PURE__ */ new Date();
  }
  get updatedAt() {
    return this.props.updatedAt ?? /* @__PURE__ */ new Date();
  }
  /**
   * Marks the attachment as successfully uploaded.
   *
   * Sets the isUploaded flag to true and records the upload timestamp.
   * Use this after the file has been successfully stored.
   *
   * @returns A new Attachment instance marked as uploaded
   *
   * @example
   * ```typescript
   * const attachment = Attachment.create({ ... });
   * // After successful file upload...
   * const uploaded = attachment.markAsUploaded();
   * console.log(uploaded.isUploaded); // true
   * console.log(uploaded.uploadedAt); // Date object
   * ```
   */
  markAsUploaded() {
    return this.clone({
      isUploaded: true,
      uploadedAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  /**
   * Gets the file size in megabytes.
   *
   * @returns The file size in MB (decimal)
   *
   * @example
   * ```typescript
   * const attachment = Attachment.create({
   *   ...
   *   size: 5242880 // 5 MB
   * });
   * console.log(attachment.getFileSizeInMB()); // 5.0
   * ```
   */
  getFileSizeInMB() {
    return this.props.size / (1024 * 1024);
  }
  /**
   * Gets the file size in kilobytes.
   *
   * @returns The file size in KB (decimal)
   *
   * @example
   * ```typescript
   * const attachment = Attachment.create({
   *   ...
   *   size: 102400 // ~100 KB
   * });
   * console.log(attachment.getFileSizeInKB()); // ~100.0
   * ```
   */
  getFileSizeInKB() {
    return this.props.size / 1024;
  }
  /**
   * Checks if the attachment is an image file.
   *
   * Determines file type by MIME type.
   *
   * @returns true if the file is an image, false otherwise
   *
   * @example
   * ```typescript
   * const attachment = Attachment.create({
   *   ...
   *   mimeType: 'image/jpeg'
   * });
   * if (attachment.isImage()) {
   *   console.log('This is an image file');
   * }
   * ```
   */
  isImage() {
    return this.props.mimeType.startsWith("image/");
  }
  /**
   * Checks if the attachment is a PDF file.
   *
   * @returns true if the file is a PDF, false otherwise
   *
   * @example
   * ```typescript
   * const attachment = Attachment.create({
   *   ...
   *   mimeType: 'application/pdf'
   * });
   * if (attachment.isPDF()) {
   *   console.log('This is a PDF document');
   * }
   * ```
   */
  isPDF() {
    return this.props.mimeType === "application/pdf";
  }
  /**
   * Checks if the attachment is a document file.
   *
   * Documents include PDF, Word, Excel, PowerPoint, and text files.
   *
   * @returns true if the file is a document, false otherwise
   *
   * @example
   * ```typescript
   * const attachment = Attachment.create({
   *   ...
   *   mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
   * });
   * if (attachment.isDocument()) {
   *   console.log('This is a document file');
   * }
   * ```
   */
  isDocument() {
    const documentTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
      "text/csv"
    ];
    return documentTypes.includes(this.props.mimeType);
  }
  /**
   * Gets the file extension from the original name.
   *
   * @returns The file extension including the dot (e.g., ".pdf"), or empty string if no extension
   *
   * @example
   * ```typescript
   * const attachment = Attachment.create({
   *   ...
   *   originalName: 'document.pdf'
   * });
   * console.log(attachment.getExtension()); // '.pdf'
   * ```
   */
  getExtension() {
    const parts = this.props.originalName.split(".");
    if (parts.length > 1) {
      const lastPart = parts[parts.length - 1];
      return "." + (lastPart?.toLowerCase() ?? "");
    }
    return "";
  }
  /**
   * Checks if the file size exceeds a given limit.
   *
   * @param maxSizeMB - Maximum size in megabytes
   * @returns true if the file is too large, false otherwise
   *
   * @example
   * ```typescript
   * const attachment = Attachment.create({
   *   ...
   *   size: 15 * 1024 * 1024 // 15 MB
   * });
   * if (attachment.isTooLarge(10)) {
   *   console.log('File exceeds 10 MB limit');
   * }
   * ```
   */
  isTooLarge(maxSizeMB) {
    return this.getFileSizeInMB() > maxSizeMB;
  }
  /**
   * Validates the task ID.
   *
   * @private
   * @param taskId - The task ID to validate
   * @throws {Error} If task ID is invalid
   */
  validateTaskId(taskId) {
    if (!taskId || typeof taskId !== "string" || taskId.trim().length === 0) {
      throw new Error("Task ID is required");
    }
  }
  /**
   * Validates the user ID.
   *
   * @private
   * @param userId - The user ID to validate
   * @throws {Error} If user ID is invalid
   */
  validateUserId(userId) {
    if (!userId || typeof userId !== "string" || userId.trim().length === 0) {
      throw new Error("User ID is required");
    }
  }
  /**
   * Validates the file name.
   *
   * @private
   * @param fileName - The file name to validate
   * @throws {Error} If file name is invalid
   */
  validateFileName(fileName) {
    if (!fileName || typeof fileName !== "string") {
      throw new Error("File name is required");
    }
    const trimmed = fileName.trim();
    if (trimmed.length === 0) {
      throw new Error("File name cannot be empty");
    }
    if (trimmed.length > 255) {
      throw new Error("File name cannot exceed 255 characters");
    }
  }
  /**
   * Validates the original file name.
   *
   * @private
   * @param originalName - The original file name to validate
   * @throws {Error} If original name is invalid
   */
  validateOriginalName(originalName) {
    if (!originalName || typeof originalName !== "string") {
      throw new Error("Original file name is required");
    }
    const trimmed = originalName.trim();
    if (trimmed.length === 0) {
      throw new Error("Original file name cannot be empty");
    }
    if (trimmed.length > 255) {
      throw new Error("Original file name cannot exceed 255 characters");
    }
  }
  /**
   * Validates the MIME type.
   *
   * @private
   * @param mimeType - The MIME type to validate
   * @throws {Error} If MIME type is invalid
   */
  validateMimeType(mimeType) {
    if (!mimeType || typeof mimeType !== "string") {
      throw new Error("MIME type is required");
    }
    const trimmed = mimeType.trim();
    if (trimmed.length === 0) {
      throw new Error("MIME type cannot be empty");
    }
    const mimeRegex = /^[a-z]+\/[a-z0-9]+[a-z0-9+.-]*$/i;
    if (!mimeRegex.test(trimmed)) {
      throw new Error("Invalid MIME type format");
    }
  }
  /**
   * Validates the file size.
   *
   * @private
   * @param size - The file size in bytes to validate
   * @throws {Error} If size is invalid
   */
  validateSize(size) {
    if (typeof size !== "number" || isNaN(size)) {
      throw new Error("File size must be a number");
    }
    if (size <= 0) {
      throw new Error("File size must be greater than 0");
    }
    const maxSizeBytes = FILE_LIMITS.MAX_FILE_SIZE;
    if (size > maxSizeBytes) {
      throw new Error(
        `File size cannot exceed ${maxSizeBytes / (1024 * 1024)} MB`
      );
    }
  }
  /**
   * Validates the storage path.
   *
   * @private
   * @param storagePath - The storage path to validate
   * @throws {Error} If storage path is invalid
   */
  validateStoragePath(storagePath) {
    if (!storagePath || typeof storagePath !== "string") {
      throw new Error("Storage path is required");
    }
    const trimmed = storagePath.trim();
    if (trimmed.length === 0) {
      throw new Error("Storage path cannot be empty");
    }
    if (trimmed.length > 2048) {
      throw new Error("Storage path cannot exceed 2048 characters");
    }
  }
  /**
   * Creates a draft version of this attachment.
   *
   * Draft mode skips validation, useful for forms before submission.
   *
   * @returns A new Attachment instance in draft mode
   *
   * @example
   * ```typescript
   * const draft = attachment.asDraft();
   * // Can now modify without validation
   * ```
   */
  asDraft() {
    return this.clone(this.props, "draft");
  }
  /**
   * Converts this attachment to valid mode.
   *
   * Triggers validation of all properties.
   *
   * @returns A new Attachment instance in valid mode
   * @throws {Error} If any validation fails
   *
   * @example
   * ```typescript
   * const draft = new Attachment({ fileName: '' }, 'draft');
   * const valid = draft.asValid(); // Throws error if fileName is empty
   * ```
   */
  asValid() {
    return this.clone(this.props, "valid");
  }
};

// src/attachments/usecase/create-attachment.usecase.ts
var CreateAttachmentUseCase = class {
  constructor(attachmentRepository) {
    this.attachmentRepository = attachmentRepository;
  }
  /**
   * Executes the create attachment use case.
   *
   * Creates a new attachment record on the specified task with the
   * provided file metadata. The attachment is validated before being persisted.
   *
   * @param input - The attachment creation input data
   * @param _loggedUser - Optional logged user context (not used in this use case)
   * @returns Promise resolving to the created attachment
   * @throws {Error} If validation fails or repository operation fails
   *
   * @example
   * ```typescript
   * const attachment = await useCase.execute({
   *   taskId: 'task-123',
   *   userId: 'user-456',
   *   fileName: 'unique-id-image.jpg',
   *   originalName: 'photo.jpg',
   *   mimeType: 'image/jpeg',
   *   size: 524288,
   *   storagePath: '/uploads/unique-id-image.jpg'
   * });
   * ```
   */
  async execute(input, _loggedUser) {
    if (!input.taskId || input.taskId.trim().length === 0) {
      throw new Error("Task ID is required");
    }
    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error("User ID is required");
    }
    if (!input.fileName || input.fileName.trim().length === 0) {
      throw new Error("File name is required");
    }
    if (!input.originalName || input.originalName.trim().length === 0) {
      throw new Error("Original file name is required");
    }
    if (!input.mimeType || input.mimeType.trim().length === 0) {
      throw new Error("MIME type is required");
    }
    if (typeof input.size !== "number" || input.size <= 0) {
      throw new Error("File size must be a positive number");
    }
    if (!input.storagePath || input.storagePath.trim().length === 0) {
      throw new Error("Storage path is required");
    }
    const attachment = Attachment.create({
      taskId: input.taskId.trim(),
      userId: input.userId.trim(),
      fileName: input.fileName.trim(),
      originalName: input.originalName.trim(),
      mimeType: input.mimeType.trim(),
      size: input.size,
      storagePath: input.storagePath.trim()
    });
    await this.attachmentRepository.create(attachment);
    return attachment;
  }
};

// src/attachments/usecase/mark-as-uploaded.usecase.ts
var MarkAsUploadedUseCase = class {
  constructor(attachmentRepository) {
    this.attachmentRepository = attachmentRepository;
  }
  /**
   * Executes the mark as uploaded use case.
   *
   * Marks an attachment as successfully uploaded by setting the
   * isUploaded flag to true and recording the upload timestamp.
   *
   * @param input - The input containing the attachment ID
   * @param _loggedUser - Optional logged user context (not used in this use case)
   * @returns Promise resolving to the updated attachment
   * @throws {Error} If attachment ID is invalid or attachment not found
   *
   * @example
   * ```typescript
   * // After successful upload
   * const attachment = await useCase.execute({
   *   attachmentId: 'attachment-123'
   * });
   * console.log(attachment.isUploaded); // true
   * console.log(attachment.uploadedAt); // Date object
   * ```
   */
  async execute(input, _loggedUser) {
    if (!input.attachmentId || input.attachmentId.trim().length === 0) {
      throw new Error("Attachment ID is required");
    }
    const existingAttachment = await this.attachmentRepository.findById(
      input.attachmentId
    );
    if (!existingAttachment) {
      throw new Error("Attachment not found");
    }
    const updatedAttachment = existingAttachment.markAsUploaded();
    await this.attachmentRepository.update(updatedAttachment);
    return updatedAttachment;
  }
};

// src/attachments/usecase/delete-attachment.usecase.ts
var DeleteAttachmentUseCase = class {
  constructor(attachmentRepository) {
    this.attachmentRepository = attachmentRepository;
  }
  /**
   * Executes the delete attachment use case.
   *
   * Permanently deletes the attachment record if the user is the uploader.
   * Physical file deletion should be handled separately.
   *
   * @param input - The delete input data
   * @param _loggedUser - Optional logged user context (not used in this use case)
   * @returns Promise that resolves when the attachment record is deleted
   * @throws {Error} If validation fails or user is not the uploader
   *
   * @example
   * ```typescript
   * await useCase.execute({
   *   attachmentId: 'attachment-123',
   *   userId: 'user-456'
   * });
   * // Note: Remember to delete the physical file separately
   * ```
   */
  async execute(input, _loggedUser) {
    if (!input.attachmentId || input.attachmentId.trim().length === 0) {
      throw new Error("Attachment ID is required");
    }
    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error("User ID is required");
    }
    const existingAttachment = await this.attachmentRepository.findById(
      input.attachmentId
    );
    if (!existingAttachment) {
      throw new Error("Attachment not found");
    }
    if (existingAttachment.userId !== input.userId) {
      throw new Error("You can only delete your own attachments");
    }
    await this.attachmentRepository.delete(input.attachmentId);
  }
};

// src/attachments/usecase/get-attachments-by-task.usecase.ts
var GetAttachmentsByTaskUseCase = class {
  constructor(attachmentRepository) {
    this.attachmentRepository = attachmentRepository;
  }
  /**
   * Executes the get attachments by task use case.
   *
   * Retrieves all attachments for the specified task, ordered by
   * upload date (newest first).
   *
   * @param input - The input containing the task ID
   * @param _loggedUser - Optional logged user context (not used in this use case)
   * @returns Promise resolving to an array of attachments (empty if none found)
   * @throws {Error} If task ID is invalid or repository operation fails
   *
   * @example
   * ```typescript
   * const attachments = await useCase.execute({
   *   taskId: 'task-123'
   * });
   *
   * // Display attachments in UI
   * return (
   *   <AttachmentList attachments={attachments} />
   * );
   * ```
   */
  async execute(input, _loggedUser) {
    if (!input.taskId || input.taskId.trim().length === 0) {
      throw new Error("Task ID is required");
    }
    const attachments = await this.attachmentRepository.findByTaskId(
      input.taskId
    );
    return attachments;
  }
};

// src/attachments/usecase/get-attachments-by-user.usecase.ts
var GetAttachmentsByUserUseCase = class {
  constructor(attachmentRepository) {
    this.attachmentRepository = attachmentRepository;
  }
  /**
   * Executes the get attachments by user use case.
   *
   * Retrieves all attachments uploaded by the specified user.
   *
   * @param input - The input containing the user ID
   * @param _loggedUser - Optional logged user context (not used in this use case)
   * @returns Promise resolving to an array of attachments (empty if none found)
   * @throws {Error} If user ID is invalid or repository operation fails
   *
   * @example
   * ```typescript
   * const attachments = await useCase.execute({
   *   userId: 'user-456'
   * });
   *
   * // Display in user profile
   * return (
   *   <UserUploads attachments={attachments} />
   * );
   * ```
   */
  async execute(input, _loggedUser) {
    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error("User ID is required");
    }
    const attachments = await this.attachmentRepository.findByUserId(
      input.userId
    );
    return attachments;
  }
};

// src/attachments/usecase/get-attachment-by-id.usecase.ts
var GetAttachmentByIdUseCase = class {
  constructor(attachmentRepository) {
    this.attachmentRepository = attachmentRepository;
  }
  /**
   * Executes the get attachment by ID use case.
   *
   * Retrieves a single attachment by its unique identifier.
   *
   * @param input - The input containing the attachment ID
   * @param _loggedUser - Optional logged user context (not used in this use case)
   * @returns Promise resolving to the attachment
   * @throws {Error} If attachment ID is invalid or attachment not found
   *
   * @example
   * ```typescript
   * const attachment = await useCase.execute({
   *   attachmentId: 'attachment-123'
   * });
   *
   * // Display attachment details
   * return (
   *   <AttachmentDetails attachment={attachment} />
   * );
   * ```
   */
  async execute(input, _loggedUser) {
    if (!input.attachmentId || input.attachmentId.trim().length === 0) {
      throw new Error("Attachment ID is required");
    }
    const attachment = await this.attachmentRepository.findById(
      input.attachmentId
    );
    if (!attachment) {
      throw new Error("Attachment not found");
    }
    return attachment;
  }
};

// src/notifications/model/notification.entity.ts
var NotificationType = /* @__PURE__ */ ((NotificationType3) => {
  NotificationType3["TASK_ASSIGNED"] = "TASK_ASSIGNED";
  NotificationType3["COMMENT_ADDED"] = "COMMENT_ADDED";
  NotificationType3["MENTIONED"] = "MENTIONED";
  NotificationType3["DUE_DATE_APPROACHING"] = "DUE_DATE_APPROACHING";
  NotificationType3["INVITATION_RECEIVED"] = "INVITATION_RECEIVED";
  NotificationType3["SYSTEM"] = "SYSTEM";
  NotificationType3["TASK_COMPLETED"] = "TASK_COMPLETED";
  NotificationType3["TASK_STATUS_CHANGED"] = "TASK_STATUS_CHANGED";
  NotificationType3["WORKSPACE_ADDED"] = "WORKSPACE_ADDED";
  NotificationType3["PROJECT_UPDATED"] = "PROJECT_UPDATED";
  return NotificationType3;
})(NotificationType || {});
var ResourceType = /* @__PURE__ */ ((ResourceType3) => {
  ResourceType3["TASK"] = "TASK";
  ResourceType3["PROJECT"] = "PROJECT";
  ResourceType3["WORKSPACE"] = "WORKSPACE";
  ResourceType3["COMMENT"] = "COMMENT";
  return ResourceType3;
})(ResourceType || {});
var Notification = class _Notification extends Entity {
  constructor(props, mode = "valid") {
    super({
      ...props,
      isRead: props.isRead ?? false,
      createdAt: props.createdAt ?? /* @__PURE__ */ new Date(),
      updatedAt: props.updatedAt ?? /* @__PURE__ */ new Date()
    }, mode);
    if (this.mode === "valid") {
      this.validateUserId(props.userId);
      this.validateType(props.type);
      this.validateTitle(props.title);
      this.validateMessage(props.message);
      this.validateResourceType(props.resourceType);
      this.validateMetadata(props.metadata);
      this.validateResourceId(props.resourceId);
    }
  }
  /**
   * Creates a new notification with defaults applied.
   *
   * Factory method for creating notifications without manually
   * setting id, timestamps, and default values.
   *
   * @param props - Notification properties (id, timestamps auto-generated)
   * @returns A new Notification instance
   *
   * @example
   * ```typescript
   * const notification = Notification.create({
   *   userId: 'user-123',
   *   type: NotificationType.TASK_ASSIGNED,
   *   title: 'New task assigned',
   *   message: 'You have been assigned to a new task'
   * });
   * ```
   */
  static create(props) {
    return new _Notification({
      ...props,
      isRead: false,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  // Getters for commonly accessed properties
  get userId() {
    return this.props.userId;
  }
  get type() {
    return this.props.type;
  }
  get title() {
    return this.props.title;
  }
  get message() {
    return this.props.message;
  }
  get resourceId() {
    return this.props.resourceId;
  }
  get resourceType() {
    return this.props.resourceType;
  }
  get metadata() {
    return this.props.metadata;
  }
  get isRead() {
    return this.props.isRead ?? false;
  }
  get readAt() {
    return this.props.readAt;
  }
  get createdAt() {
    return this.props.createdAt ?? /* @__PURE__ */ new Date();
  }
  get updatedAt() {
    return this.props.updatedAt ?? /* @__PURE__ */ new Date();
  }
  /**
   * Marks the notification as read.
   *
   * Sets the isRead flag to true and records the read timestamp.
   * If already read, returns the same notification (idempotent).
   *
   * @returns A new Notification instance marked as read
   *
   * @example
   * ```typescript
   * const notification = Notification.create({ ... });
   * const read = notification.markAsRead();
   * console.log(read.isRead); // true
   * console.log(read.readAt); // Date object
   * ```
   */
  markAsRead() {
    if (this.props.isRead === true) {
      return this;
    }
    return this.clone({
      isRead: true,
      readAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  /**
   * Marks the notification as unread.
   *
   * Sets the isRead flag to false and clears the read timestamp.
   * If already unread, returns the same notification (idempotent).
   *
   * @returns A new Notification instance marked as unread
   *
   * @example
   * ```typescript
   * const readNotification = notification.markAsRead();
   * const unread = readNotification.markAsUnread();
   * console.log(unread.isRead); // false
   * console.log(unread.readAt); // null
   * ```
   */
  markAsUnread() {
    if (this.props.isRead === false) {
      return this;
    }
    return this.clone({
      isRead: false,
      readAt: null,
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  /**
   * Checks if the notification is expired.
   *
   * Currently returns false as notifications don't have an expiration
   * timestamp in the base schema. This method is provided for future
   * extensibility.
   *
   * @returns true if the notification is expired, false otherwise
   *
   * @example
   * ```typescript
   * if (!notification.isExpired()) {
   *   // Display the notification
   * }
   * ```
   */
  isExpired() {
    return false;
  }
  /**
   * Checks if the notification is high priority.
   *
   * High priority notifications include task assignments, mentions,
   * and due date approaching. These should be displayed more prominently.
   *
   * @returns true if the notification is high priority, false otherwise
   *
   * @example
   * ```typescript
   * if (notification.isHighPriority()) {
   *   // Show with special styling or sound
   * }
   * ```
   */
  isHighPriority() {
    const highPriorityTypes = [
      "TASK_ASSIGNED" /* TASK_ASSIGNED */,
      "MENTIONED" /* MENTIONED */,
      "DUE_DATE_APPROACHING" /* DUE_DATE_APPROACHING */
    ];
    return highPriorityTypes.includes(this.props.type);
  }
  /**
   * Checks if the notification has an associated resource.
   *
   * Notifications with resources can provide deep links to the
   * relevant task, project, or other entity.
   *
   * @returns true if the notification has a resourceId, false otherwise
   *
   * @example
   * ```typescript
   * if (notification.isActionable()) {
   *   // Show "View" button that links to the resource
   * }
   * ```
   */
  isActionable() {
    return this.props.resourceId !== null && this.props.resourceId !== void 0 && this.props.resourceId.length > 0;
  }
  /**
   * Gets the age of the notification in milliseconds.
   *
   * @returns The age in milliseconds since creation
   *
   * @example
   * ```typescript
   * const ageInMinutes = notification.getAge() / 60000;
   * console.log(`Notification is ${ageInMinutes} minutes old`);
   * ```
   */
  getAge() {
    return Date.now() - this.props.createdAt.getTime();
  }
  /**
   * Checks if the notification is older than a specified time.
   *
   * Useful for filtering out stale notifications or applying
   * different display rules based on age.
   *
   * @param ms - The age threshold in milliseconds
   * @returns true if the notification is older than the threshold, false otherwise
   *
   * @example
   * ```typescript
   * // Check if notification is more than a day old
   * if (notification.isOlderThan(24 * 60 * 60 * 1000)) {
   *   console.log('This notification is old');
   * }
   * ```
   */
  isOlderThan(ms) {
    return this.getAge() > ms;
  }
  /**
   * Gets the metadata value for a specific key.
   *
   * @param key - The metadata key to retrieve
   * @param defaultValue - The default value if the key doesn't exist
   * @returns The metadata value or the default
   *
   * @example
   * ```typescript
   * const workspaceId = notification.getMetadata('workspaceId', '');
   * const projectId = notification.getMetadata<string>('projectId');
   * ```
   */
  getMetadata(key, defaultValue) {
    const metadata = this.props.metadata;
    if (metadata && typeof metadata === "object" && key in metadata) {
      return metadata[key];
    }
    return defaultValue;
  }
  /**
   * Checks if this is a task-related notification.
   *
   * @returns true if the notification refers to a task, false otherwise
   *
   * @example
   * ```typescript
   * if (notification.isTaskNotification()) {
   *   console.log('Navigate to task:', notification.resourceId);
   * }
   * ```
   */
  isTaskNotification() {
    return this.props.resourceType === "TASK" /* TASK */;
  }
  /**
   * Checks if this is a project-related notification.
   *
   * @returns true if the notification refers to a project, false otherwise
   *
   * @example
   * ```typescript
   * if (notification.isProjectNotification()) {
   *   console.log('Navigate to project:', notification.resourceId);
   * }
   * ```
   */
  isProjectNotification() {
    return this.props.resourceType === "PROJECT" /* PROJECT */;
  }
  /**
   * Checks if this is a workspace-related notification.
   *
   * @returns true if the notification refers to a workspace, false otherwise
   *
   * @example
   * ```typescript
   * if (notification.isWorkspaceNotification()) {
   *   console.log('Navigate to workspace:', notification.resourceId);
   * }
   * ```
   */
  isWorkspaceNotification() {
    return this.props.resourceType === "WORKSPACE" /* WORKSPACE */;
  }
  /**
   * Validates the user ID.
   *
   * @private
   * @param userId - The user ID to validate
   * @throws {Error} If user ID is invalid
   */
  validateUserId(userId) {
    if (!userId || typeof userId !== "string" || userId.trim().length === 0) {
      throw new Error("User ID is required");
    }
  }
  /**
   * Validates the notification type.
   *
   * @private
   * @param type - The notification type to validate
   * @throws {Error} If type is invalid
   */
  validateType(type) {
    if (!type || typeof type !== "string") {
      throw new Error("Notification type is required");
    }
    const validTypes = Object.values(NotificationType);
    if (!validTypes.includes(type)) {
      throw new Error(
        `Invalid notification type. Must be one of: ${validTypes.join(", ")}`
      );
    }
  }
  /**
   * Validates the notification title.
   *
   * @private
   * @param title - The title to validate
   * @throws {Error} If title is invalid
   */
  validateTitle(title) {
    if (!title || typeof title !== "string") {
      throw new Error("Notification title is required");
    }
    const trimmed = title.trim();
    if (trimmed.length === 0) {
      throw new Error("Notification title cannot be empty");
    }
    if (trimmed.length < NOTIFICATION_LIMITS.TITLE_MIN_LENGTH) {
      throw new Error(
        `Notification title must be at least ${NOTIFICATION_LIMITS.TITLE_MIN_LENGTH} character(s)`
      );
    }
    if (trimmed.length > NOTIFICATION_LIMITS.TITLE_MAX_LENGTH) {
      throw new Error(
        `Notification title cannot exceed ${NOTIFICATION_LIMITS.TITLE_MAX_LENGTH} characters`
      );
    }
  }
  /**
   * Validates the notification message.
   *
   * @private
   * @param message - The message to validate (optional)
   * @throws {Error} If message is invalid
   */
  validateMessage(message) {
    if (message === void 0 || message === null || message === "") {
      return;
    }
    if (typeof message !== "string") {
      throw new Error("Notification message must be a string");
    }
    const trimmed = message.trim();
    if (trimmed.length === 0) {
      return;
    }
    if (trimmed.length > NOTIFICATION_LIMITS.MESSAGE_MAX_LENGTH) {
      throw new Error(
        `Notification message cannot exceed ${NOTIFICATION_LIMITS.MESSAGE_MAX_LENGTH} characters`
      );
    }
  }
  /**
   * Validates the resource type.
   *
   * @private
   * @param resourceType - The resource type to validate (optional)
   * @throws {Error} If resource type is invalid
   */
  validateResourceType(resourceType) {
    if (resourceType === void 0 || resourceType === null) {
      return;
    }
    const validTypes = Object.values(ResourceType);
    if (!validTypes.includes(resourceType)) {
      throw new Error(
        `Invalid resource type. Must be one of: ${validTypes.join(", ")}`
      );
    }
  }
  /**
   * Validates the resource ID.
   *
   * @private
   * @param resourceId - The resource ID to validate (optional)
   * @throws {Error} If resource ID is invalid
   */
  validateResourceId(resourceId) {
    if (resourceId === void 0 || resourceId === null || resourceId === "") {
      return;
    }
    if (typeof resourceId !== "string") {
      throw new Error("Resource ID must be a string");
    }
    if (resourceId.trim().length === 0) {
      return;
    }
  }
  /**
   * Validates the metadata object.
   *
   * @private
   * @param metadata - The metadata to validate (optional)
   * @throws {Error} If metadata is invalid
   */
  validateMetadata(metadata) {
    if (metadata === void 0 || metadata === null) {
      return;
    }
    if (typeof metadata !== "object" || Array.isArray(metadata)) {
      throw new Error("Notification metadata must be an object");
    }
  }
  /**
   * Creates a draft version of this notification.
   *
   * Draft mode skips validation, useful for forms before submission.
   *
   * @returns A new Notification instance in draft mode
   *
   * @example
   * ```typescript
   * const draft = notification.asDraft();
   * // Can now modify without validation
   * ```
   */
  asDraft() {
    return this.clone(this.props, "draft");
  }
  /**
   * Converts this notification to valid mode.
   *
   * Triggers validation of all properties.
   *
   * @returns A new Notification instance in valid mode
   * @throws {Error} If any validation fails
   *
   * @example
   * ```typescript
   * const draft = new Notification({ title: '' }, 'draft');
   * const valid = draft.asValid(); // Throws error if title is empty
   * ```
   */
  asValid() {
    return this.clone(this.props, "valid");
  }
};

// src/notifications/usecase/create-notification.usecase.ts
var CreateNotificationUseCase = class {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }
  /**
   * Executes the create notification use case.
   *
   * Creates a new notification with the provided data.
   * The notification is validated before being persisted.
   *
   * @param input - The notification creation input data
   * @param _loggedUser - Optional logged user context (not used in this use case)
   * @returns Promise resolving to the created notification
   * @throws {Error} If validation fails or repository operation fails
   *
   * @example
   * ```typescript
   * const notification = await useCase.execute({
   *   userId: 'user-123',
   *   type: NotificationType.COMMENT_ADDED,
   *   title: 'New comment on your task',
   *   message: 'Someone commented on your task'
   * });
   * ```
   */
  async execute(input, _loggedUser) {
    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error("User ID is required");
    }
    if (!input.type) {
      throw new Error("Notification type is required");
    }
    if (!input.title || input.title.trim().length === 0) {
      throw new Error("Notification title is required");
    }
    const trimmedTitle = input.title.trim();
    const trimmedMessage = input.message ? input.message.trim() : void 0;
    const notification = Notification.create({
      userId: input.userId.trim(),
      type: input.type,
      title: trimmedTitle,
      message: trimmedMessage,
      resourceId: input.resourceId ?? null,
      resourceType: input.resourceType ?? null,
      metadata: input.metadata ?? null
    });
    await this.notificationRepository.create(notification);
    return notification;
  }
};

// src/notifications/usecase/mark-as-read.usecase.ts
var MarkAsReadUseCase = class {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }
  /**
   * Executes the mark as read use case.
   *
   * Finds the notification, verifies ownership, and marks it as read.
   *
   * @param input - The mark as read input data
   * @param _loggedUser - Optional logged user context (not used in this use case)
   * @returns Promise resolving to the updated notification
   * @throws {Error} If validation fails or repository operation fails
   *
   * @example
   * ```typescript
   * const notification = await useCase.execute({
   *   notificationId: 'notif-123',
   *   userId: 'user-456'
   * });
   * console.log(notification.isRead); // true
   * ```
   */
  async execute(input, _loggedUser) {
    if (!input.notificationId || input.notificationId.trim().length === 0) {
      throw new Error("Notification ID is required");
    }
    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error("User ID is required");
    }
    const notification = await this.notificationRepository.findById(
      input.notificationId.trim()
    );
    if (!notification) {
      throw new Error("Notification not found");
    }
    if (notification.userId !== input.userId.trim()) {
      throw new Error("You do not have permission to mark this notification as read");
    }
    const updated = notification.markAsRead();
    await this.notificationRepository.update(updated);
    return updated;
  }
};

// src/notifications/usecase/mark-all-as-read.usecase.ts
var MarkAllAsReadUseCase = class {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }
  /**
   * Executes the mark all as read use case.
   *
   * Marks all unread notifications for the user as read.
   *
   * @param input - The mark all as read input data
   * @param _loggedUser - Optional logged user context (not used in this use case)
   * @returns Promise resolving to the count of notifications marked as read
   * @throws {Error} If validation fails or repository operation fails
   *
   * @example
   * ```typescript
   * const result = await useCase.execute({ userId: 'user-123' });
   * console.log(`Marked ${result.count} notifications as read`);
   * ```
   */
  async execute(input, _loggedUser) {
    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error("User ID is required");
    }
    const unreadCount = await this.notificationRepository.countUnreadByUserId(
      input.userId.trim()
    );
    await this.notificationRepository.markAllAsRead(input.userId.trim());
    return {
      count: unreadCount
    };
  }
};

// src/notifications/usecase/mark-as-unread.usecase.ts
var MarkAsUnreadUseCase = class {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }
  /**
   * Executes the mark as unread use case.
   *
   * Finds the notification, verifies ownership, and marks it as unread.
   *
   * @param input - The mark as unread input data
   * @param _loggedUser - Optional logged user context (not used in this use case)
   * @returns Promise resolving to the updated notification
   * @throws {Error} If validation fails or repository operation fails
   *
   * @example
   * ```typescript
   * const notification = await useCase.execute({
   *   notificationId: 'notif-123',
   *   userId: 'user-456'
   * });
   * console.log(notification.isRead); // false
   * ```
   */
  async execute(input, _loggedUser) {
    if (!input.notificationId || input.notificationId.trim().length === 0) {
      throw new Error("Notification ID is required");
    }
    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error("User ID is required");
    }
    const notification = await this.notificationRepository.findById(
      input.notificationId.trim()
    );
    if (!notification) {
      throw new Error("Notification not found");
    }
    if (notification.userId !== input.userId.trim()) {
      throw new Error("You do not have permission to mark this notification as unread");
    }
    const updated = notification.markAsUnread();
    await this.notificationRepository.update(updated);
    return updated;
  }
};

// src/notifications/usecase/get-unread-notifications.usecase.ts
var GetUnreadNotificationsUseCase = class {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }
  /**
   * Executes the get unread notifications use case.
   *
   * Retrieves all unread notifications for the user, ordered by
   * priority and creation time.
   *
   * @param input - The get unread notifications input data
   * @param _loggedUser - Optional logged user context (not used in this use case)
   * @returns Promise resolving to an array of unread notifications
   * @throws {Error} If validation fails or repository operation fails
   *
   * @example
   * ```typescript
   * const notifications = await useCase.execute({
   *   userId: 'user-123'
   * });
   *
   * notifications.forEach(n => {
   *   console.log(`${n.type}: ${n.title}`);
   * });
   * ```
   */
  async execute(input, _loggedUser) {
    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error("User ID is required");
    }
    const userId = input.userId.trim();
    const unreadNotifications = await this.notificationRepository.findUnreadByUserId(userId);
    const sorted = unreadNotifications.sort((a, b) => {
      const aHighPriority = a.isHighPriority();
      const bHighPriority = b.isHighPriority();
      if (aHighPriority && !bHighPriority) return -1;
      if (!aHighPriority && bHighPriority) return 1;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
    if (input.limit !== void 0) {
      if (input.limit <= 0) {
        return [];
      }
      return sorted.slice(0, input.limit);
    }
    return sorted;
  }
};

// src/notifications/usecase/get-notification-by-id.usecase.ts
var GetNotificationByIdUseCase = class {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }
  /**
   * Executes the get notification by ID use case.
   *
   * Finds the notification and verifies ownership before returning it.
   *
   * @param input - The get notification by ID input data
   * @param _loggedUser - Optional logged user context (not used in this use case)
   * @returns Promise resolving to the notification if found and owned by user, null otherwise
   * @throws {Error} If validation fails or repository operation fails
   *
   * @example
   * ```typescript
   * const notification = await useCase.execute({
   *   notificationId: 'notif-123',
   *   userId: 'user-456'
   * });
   *
   * if (notification) {
   *   console.log(notification.title);
   * }
   * ```
   */
  async execute(input, _loggedUser) {
    if (!input.notificationId || input.notificationId.trim().length === 0) {
      throw new Error("Notification ID is required");
    }
    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error("User ID is required");
    }
    const notification = await this.notificationRepository.findById(
      input.notificationId.trim()
    );
    if (!notification || notification.userId !== input.userId.trim()) {
      return null;
    }
    return notification;
  }
};

// src/notifications/usecase/get-notifications-by-type.usecase.ts
var GetNotificationsByTypeUseCase = class {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }
  /**
   * Executes the get notifications by type use case.
   *
   * Retrieves all notifications of the specified type for the user.
   *
   * @param input - The get notifications by type input data
   * @param _loggedUser - Optional logged user context (not used in this use case)
   * @returns Promise resolving to an array of notifications of the specified type
   * @throws {Error} If validation fails or repository operation fails
   *
   * @example
   * ```typescript
   * const notifications = await useCase.execute({
   *   userId: 'user-123',
   *   type: NotificationType.COMMENT_ADDED
   * });
   *
   * notifications.forEach(n => {
   *   console.log(`${n.title}: ${n.message}`);
   * });
   * ```
   */
  async execute(input, _loggedUser) {
    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error("User ID is required");
    }
    if (!input.type) {
      throw new Error("Notification type is required");
    }
    const notifications = await this.notificationRepository.findByType(
      input.userId.trim(),
      input.type
    );
    return notifications;
  }
};

// src/notifications/usecase/delete-notification.usecase.ts
var DeleteNotificationUseCase = class {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }
  /**
   * Executes the delete notification use case.
   *
   * Finds the notification, verifies ownership, and deletes it permanently.
   *
   * @param input - The delete notification input data
   * @param _loggedUser - Optional logged user context (not used in this use case)
   * @returns Promise resolving when the deletion is complete
   * @throws {Error} If validation fails or repository operation fails
   *
   * @example
   * ```typescript
   * await useCase.execute({
   *   notificationId: 'notif-123',
   *   userId: 'user-456'
   * });
   * ```
   */
  async execute(input, _loggedUser) {
    if (!input.notificationId || input.notificationId.trim().length === 0) {
      throw new Error("Notification ID is required");
    }
    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error("User ID is required");
    }
    const notification = await this.notificationRepository.findById(
      input.notificationId.trim()
    );
    if (!notification) {
      throw new Error("Notification not found");
    }
    if (notification.userId !== input.userId.trim()) {
      throw new Error("You do not have permission to delete this notification");
    }
    await this.notificationRepository.delete(input.notificationId.trim());
  }
};

// src/notifications/usecase/count-unread-notifications.usecase.ts
var CountUnreadNotificationsUseCase = class {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }
  /**
   * Executes the count unread notifications use case.
   *
   * Counts all unread notifications for the user.
   *
   * @param input - The count unread notifications input data
   * @param _loggedUser - Optional logged user context (not used in this use case)
   * @returns Promise resolving to the count of unread notifications
   * @throws {Error} If validation fails or repository operation fails
   *
   * @example
   * ```typescript
   * const result = await useCase.execute({ userId: 'user-123' });
   * console.log(`Unread count: ${result.count}`);
   * ```
   */
  async execute(input, _loggedUser) {
    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error("User ID is required");
    }
    const count = await this.notificationRepository.countUnreadByUserId(
      input.userId.trim()
    );
    return {
      count
    };
  }
};

// src/changelog/model/changelog-entry.entity.ts
var ChangelogEntry = class _ChangelogEntry extends Entity {
  constructor(props) {
    super({
      ...props,
      type: props.type ?? "NEW",
      publishedAt: props.publishedAt ?? /* @__PURE__ */ new Date(),
      createdAt: props.createdAt ?? /* @__PURE__ */ new Date(),
      updatedAt: props.updatedAt ?? /* @__PURE__ */ new Date()
    });
  }
  /**
   * Create a new changelog entry
   */
  static create(props) {
    return new _ChangelogEntry({
      ...props,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  get version() {
    return this.props.version;
  }
  get title() {
    return this.props.title;
  }
  get content() {
    return this.props.content;
  }
  get type() {
    return this.props.type;
  }
  get publishedAt() {
    return this.props.publishedAt;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
  /**
   * Check if entry is published
   */
  isPublished() {
    return this.props.publishedAt <= /* @__PURE__ */ new Date();
  }
  /**
   * Check if entry is a new feature
   */
  isNewFeature() {
    return this.props.type === "NEW";
  }
  /**
   * Check if entry is a fix
   */
  isFix() {
    return this.props.type === "FIXED";
  }
  /**
   * Update changelog entry
   */
  update(props) {
    return this.clone({
      ...props,
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  /**
   * Publish the entry
   */
  publish() {
    return this.clone({
      publishedAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
};

// src/newsletter/model/newsletter-subscriber.entity.ts
var NewsletterSubscriber = class _NewsletterSubscriber extends Entity {
  constructor(props) {
    super({
      ...props,
      active: props.active ?? true,
      createdAt: props.createdAt ?? /* @__PURE__ */ new Date()
    });
  }
  /**
   * Create a new newsletter subscriber
   */
  static create(props) {
    return new _NewsletterSubscriber({
      ...props,
      active: true,
      createdAt: /* @__PURE__ */ new Date()
    });
  }
  get email() {
    return this.props.email;
  }
  get active() {
    return this.props.active;
  }
  get userId() {
    return this.props.userId;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  /**
   * Check if subscription is active
   */
  isActive() {
    return this.props.active;
  }
  /**
   * Subscribe (activate)
   */
  subscribe() {
    return this.clone({ active: true });
  }
  /**
   * Unsubscribe (deactivate)
   */
  unsubscribe() {
    return this.clone({ active: false });
  }
  /**
   * Link to user account
   */
  linkToUser(userId) {
    return this.clone({ userId });
  }
  /**
   * Update email
   */
  updateEmail(email3) {
    return this.clone({ email: email3 });
  }
};

// src/contact/model/contact-submission.entity.ts
var ContactSubmission = class _ContactSubmission extends Entity {
  constructor(props) {
    super({
      ...props,
      read: props.read ?? false,
      createdAt: props.createdAt ?? /* @__PURE__ */ new Date()
    });
  }
  /**
   * Create a new contact submission
   */
  static create(props) {
    return new _ContactSubmission({
      ...props,
      read: false,
      createdAt: /* @__PURE__ */ new Date()
    });
  }
  get name() {
    return this.props.name;
  }
  get email() {
    return this.props.email;
  }
  get subject() {
    return this.props.subject;
  }
  get message() {
    return this.props.message;
  }
  get read() {
    return this.props.read;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  /**
   * Check if submission has been read
   */
  isRead() {
    return this.props.read;
  }
  /**
   * Mark as read
   */
  markAsRead() {
    return this.clone({ read: true });
  }
  /**
   * Mark as unread
   */
  markAsUnread() {
    return this.clone({ read: false });
  }
};

// src/roadmap/model/roadmap-item.entity.ts
var RoadmapItem = class _RoadmapItem extends Entity {
  constructor(props) {
    super({
      ...props,
      status: props.status ?? "CONSIDERING",
      totalVotes: props.totalVotes ?? 0,
      createdAt: props.createdAt ?? /* @__PURE__ */ new Date(),
      updatedAt: props.updatedAt ?? /* @__PURE__ */ new Date()
    });
  }
  /**
   * Create a new roadmap item
   */
  static create(props) {
    return new _RoadmapItem({
      ...props,
      status: "CONSIDERING",
      totalVotes: 0,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  get title() {
    return this.props.title;
  }
  get description() {
    return this.props.description;
  }
  get status() {
    return this.props.status;
  }
  get totalVotes() {
    return this.props.totalVotes;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
  /**
   * Check if item is being considered
   */
  isConsidering() {
    return this.props.status === "CONSIDERING";
  }
  /**
   * Check if item is planned
   */
  isPlanned() {
    return this.props.status === "PLANNED";
  }
  /**
   * Check if item is in progress
   */
  isInProgress() {
    return this.props.status === "IN_PROGRESS";
  }
  /**
   * Check if item is completed
   */
  isCompleted() {
    return this.props.status === "COMPLETED";
  }
  /**
   * Update status
   */
  updateStatus(status) {
    return this.clone({
      status,
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  /**
   * Increment votes
   */
  incrementVotes(weight) {
    return this.clone({
      totalVotes: this.props.totalVotes + weight,
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  /**
   * Decrement votes
   */
  decrementVotes(weight) {
    return this.clone({
      totalVotes: Math.max(0, this.props.totalVotes - weight),
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
};

// src/roadmap/model/roadmap-vote.entity.ts
var RoadmapVote = class _RoadmapVote extends Entity {
  constructor(props) {
    super({
      ...props,
      weight: props.weight ?? 1,
      createdAt: props.createdAt ?? /* @__PURE__ */ new Date()
    });
  }
  /**
   * Create a new roadmap vote
   */
  static create(props) {
    return new _RoadmapVote({
      ...props,
      createdAt: /* @__PURE__ */ new Date()
    });
  }
  get itemId() {
    return this.props.itemId;
  }
  get userId() {
    return this.props.userId;
  }
  get weight() {
    return this.props.weight;
  }
  get createdAt() {
    return this.props.createdAt;
  }
};
function calculateVoteWeight(plan) {
  switch (plan) {
    case "PRO":
      return 3;
    case "TEAM":
      return 5;
    case "ENTERPRISE":
      return 10;
    default:
      return 1;
  }
}

// src/blog/model/blog-post.entity.ts
var BlogPost = class _BlogPost extends Entity {
  constructor(props) {
    super({
      ...props,
      published: props.published ?? false,
      tags: props.tags ?? [],
      createdAt: props.createdAt ?? /* @__PURE__ */ new Date(),
      updatedAt: props.updatedAt ?? /* @__PURE__ */ new Date()
    });
  }
  /**
   * Create a new blog post
   */
  static create(props) {
    return new _BlogPost({
      ...props,
      published: false,
      tags: props.tags ?? [],
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  get slug() {
    return this.props.slug;
  }
  get title() {
    return this.props.title;
  }
  get content() {
    return this.props.content;
  }
  get published() {
    return this.props.published;
  }
  /**
   * Publish the post
   */
  publish() {
    return this.clone({
      published: true,
      publishedAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  /**
   * Unpublish the post
   */
  unpublish() {
    return this.clone({
      published: false,
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
};

// src/blog/model/blog-comment.entity.ts
var BlogComment = class _BlogComment extends Entity {
  constructor(props) {
    super({
      ...props,
      createdAt: props.createdAt ?? /* @__PURE__ */ new Date()
    });
  }
  /**
   * Create a new blog comment
   */
  static create(props) {
    return new _BlogComment({
      ...props,
      createdAt: /* @__PURE__ */ new Date()
    });
  }
  get content() {
    return this.props.content;
  }
  get userId() {
    return this.props.userId;
  }
  get postId() {
    return this.props.postId;
  }
};

// src/gamification/model/achievement.entity.ts
var Achievement = class _Achievement extends Entity {
  constructor(props) {
    super({
      ...props,
      createdAt: props.createdAt ?? /* @__PURE__ */ new Date(),
      updatedAt: props.updatedAt ?? /* @__PURE__ */ new Date()
    });
  }
  /**
   * Create a new achievement
   */
  static create(props) {
    return new _Achievement({
      ...props,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  get code() {
    return this.props.code;
  }
  get name() {
    return this.props.name;
  }
  get description() {
    return this.props.description;
  }
  get icon() {
    return this.props.icon;
  }
  get xpReward() {
    return this.props.xpReward;
  }
};

// src/gamification/model/user-achievement.entity.ts
var UserAchievement = class _UserAchievement extends Entity {
  constructor(props) {
    super({
      ...props,
      unlockedAt: props.unlockedAt ?? /* @__PURE__ */ new Date()
    });
  }
  /**
   * Create/Unlock an achievement for a user
   */
  static create(props) {
    return new _UserAchievement({
      ...props,
      unlockedAt: /* @__PURE__ */ new Date()
    });
  }
  get userId() {
    return this.props.userId;
  }
  get achievementId() {
    return this.props.achievementId;
  }
  get unlockedAt() {
    return this.props.unlockedAt;
  }
};

// src/chat/model/chat-conversation.entity.ts
var ChatConversation = class _ChatConversation extends Entity {
  constructor(props) {
    super({
      ...props,
      isArchived: props.isArchived ?? false,
      createdAt: props.createdAt ?? /* @__PURE__ */ new Date(),
      updatedAt: props.updatedAt ?? /* @__PURE__ */ new Date()
    });
  }
  /**
   * Create a new chat conversation
   */
  static create(props) {
    return new _ChatConversation({
      ...props,
      isArchived: false,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  get userId() {
    return this.props.userId;
  }
  get title() {
    return this.props.title;
  }
  get isArchived() {
    return this.props.isArchived;
  }
  /**
   * Archive the conversation
   */
  archive() {
    return this.clone({
      isArchived: true,
      archivedAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  /**
   * Update title
   */
  updateTitle(title) {
    return this.clone({
      title,
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
};

// src/chat/model/chat-message.entity.ts
var ChatMessage = class _ChatMessage extends Entity {
  constructor(props) {
    super({
      ...props,
      createdAt: props.createdAt ?? /* @__PURE__ */ new Date()
    });
  }
  /**
   * Create a new chat message
   */
  static create(props) {
    return new _ChatMessage({
      ...props,
      createdAt: /* @__PURE__ */ new Date()
    });
  }
  get conversationId() {
    return this.props.conversationId;
  }
  get role() {
    return this.props.role;
  }
  get content() {
    return this.props.content;
  }
  get metadata() {
    return this.props.metadata;
  }
  get createdAt() {
    return this.props.createdAt;
  }
};

// src/templates/model/task-template.entity.ts
var TaskTemplate = class _TaskTemplate extends Entity {
  constructor(props) {
    super({
      ...props,
      isPublic: props.isPublic ?? true,
      createdAt: props.createdAt ?? /* @__PURE__ */ new Date(),
      updatedAt: props.updatedAt ?? /* @__PURE__ */ new Date()
    });
  }
  /**
   * Create a new task template
   */
  static create(props) {
    return new _TaskTemplate({
      ...props,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  get name() {
    return this.props.name;
  }
  get description() {
    return this.props.description;
  }
  get workspaceId() {
    return this.props.workspaceId;
  }
  get isPublic() {
    return this.props.isPublic;
  }
  /**
   * Update template details
   */
  update(props) {
    return this.clone({
      ...props,
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
};

// src/objectives/model/objective.entity.ts
var Objective = class _Objective extends Entity {
  constructor(props) {
    super({
      ...props,
      status: props.status ?? "ACTIVE",
      progress: props.progress ?? 0,
      color: props.color ?? "#3B82F6",
      startDate: props.startDate ?? /* @__PURE__ */ new Date(),
      createdAt: props.createdAt ?? /* @__PURE__ */ new Date(),
      updatedAt: props.updatedAt ?? /* @__PURE__ */ new Date(),
      keyResults: props.keyResults ?? []
    });
  }
  /**
   * Create a new objective
   */
  static create(props) {
    return new _Objective({
      ...props,
      status: "ACTIVE",
      progress: 0,
      keyResults: [],
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  get title() {
    return this.props.title;
  }
  get userId() {
    return this.props.userId;
  }
  get progress() {
    return this.props.progress;
  }
  /**
   * Calculate total progress based on Key Results
   */
  calculateProgress() {
    if (!this.props.keyResults || this.props.keyResults.length === 0) {
      return 0;
    }
    const totalProgress = this.props.keyResults.reduce((sum, kr) => sum + kr.progress, 0);
    return totalProgress / this.props.keyResults.length;
  }
  /**
   * Update progress
   */
  updateProgress() {
    const newProgress = this.calculateProgress();
    return this.clone({
      progress: newProgress,
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
};

// src/objectives/model/key-result.entity.ts
var KeyResult = class _KeyResult extends Entity {
  constructor(props) {
    super({
      ...props,
      progress: props.progress ?? 0,
      startValue: props.startValue ?? 0,
      currentValue: props.currentValue ?? props.startValue ?? 0,
      createdAt: props.createdAt ?? /* @__PURE__ */ new Date(),
      updatedAt: props.updatedAt ?? /* @__PURE__ */ new Date()
    });
  }
  /**
   * Create a new key result
   */
  static create(props) {
    const kr = new _KeyResult({
      ...props,
      progress: 0
    });
    return kr.updateProgress(props.currentValue);
  }
  get progress() {
    return this.props.progress;
  }
  /**
   * Update current value and recalculate progress
   */
  updateProgress(currentValue) {
    const { startValue, targetValue } = this.props;
    let progress = 0;
    if (targetValue !== startValue) {
      progress = Math.max(0, Math.min(100, (currentValue - startValue) / (targetValue - startValue) * 100));
    } else {
      progress = currentValue >= targetValue ? 100 : 0;
    }
    return this.clone({
      currentValue,
      progress,
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
};

// src/objectives/model/key-result-task.entity.ts
var KeyResultTask = class {
  constructor(props) {
    this.props = props;
  }
  get keyResultId() {
    return this.props.keyResultId;
  }
  get taskId() {
    return this.props.taskId;
  }
  get weight() {
    return this.props.weight;
  }
};

// src/faq/model/faq.entity.ts
var FAQ = class _FAQ extends Entity {
  constructor(props) {
    super({
      ...props,
      order: props.order ?? 0,
      published: props.published ?? true,
      createdAt: props.createdAt ?? /* @__PURE__ */ new Date(),
      updatedAt: props.updatedAt ?? /* @__PURE__ */ new Date()
    });
  }
  static create(props) {
    return new _FAQ({
      ...props,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  get question() {
    return this.props.question;
  }
  get answer() {
    return this.props.answer;
  }
  get category() {
    return this.props.category;
  }
  get order() {
    return this.props.order;
  }
  get published() {
    return this.props.published;
  }
  update(props) {
    return this.clone({
      ...props,
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
};

// src/knowledge-base/model/kb-category.entity.ts
var KBCategory = class _KBCategory extends Entity {
  constructor(props) {
    super({
      ...props,
      order: props.order ?? 0,
      articles: props.articles ?? [],
      createdAt: props.createdAt ?? /* @__PURE__ */ new Date(),
      updatedAt: props.updatedAt ?? /* @__PURE__ */ new Date()
    });
  }
  static create(props) {
    return new _KBCategory({
      ...props,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  get name() {
    return this.props.name;
  }
  get slug() {
    return this.props.slug;
  }
  get icon() {
    return this.props.icon;
  }
  get order() {
    return this.props.order;
  }
  get articles() {
    return this.props.articles || [];
  }
  update(props) {
    return this.clone({
      ...props,
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
};

// src/knowledge-base/model/kb-article.entity.ts
var KBArticle = class _KBArticle extends Entity {
  constructor(props) {
    super({
      ...props,
      helpfulYes: props.helpfulYes ?? 0,
      helpfulNo: props.helpfulNo ?? 0,
      published: props.published ?? false,
      createdAt: props.createdAt ?? /* @__PURE__ */ new Date(),
      updatedAt: props.updatedAt ?? /* @__PURE__ */ new Date()
    });
  }
  static create(props) {
    return new _KBArticle({
      ...props,
      helpfulYes: 0,
      helpfulNo: 0,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  get slug() {
    return this.props.slug;
  }
  get title() {
    return this.props.title;
  }
  get content() {
    return this.props.content;
  }
  get categoryId() {
    return this.props.categoryId;
  }
  get helpfulYes() {
    return this.props.helpfulYes;
  }
  get helpfulNo() {
    return this.props.helpfulNo;
  }
  get published() {
    return this.props.published;
  }
  update(props) {
    return this.clone({
      ...props,
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  voteHelpful(yes) {
    return this.clone({
      helpfulYes: yes ? this.helpfulYes + 1 : this.helpfulYes,
      helpfulNo: !yes ? this.helpfulNo + 1 : this.helpfulNo,
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
};

// src/custom-fields/model/custom-field.entity.ts
var CustomFieldType = /* @__PURE__ */ ((CustomFieldType2) => {
  CustomFieldType2["TEXT"] = "TEXT";
  CustomFieldType2["NUMBER"] = "NUMBER";
  CustomFieldType2["SELECT"] = "SELECT";
  CustomFieldType2["MULTI_SELECT"] = "MULTI_SELECT";
  CustomFieldType2["DATE"] = "DATE";
  CustomFieldType2["CHECKBOX"] = "CHECKBOX";
  CustomFieldType2["URL"] = "URL";
  CustomFieldType2["EMAIL"] = "EMAIL";
  return CustomFieldType2;
})(CustomFieldType || {});
var CustomField = class _CustomField {
  constructor(id, name, type, projectId, description, options, isRequired = false, position = 0, createdAt = /* @__PURE__ */ new Date(), updatedAt = /* @__PURE__ */ new Date()) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.projectId = projectId;
    this.description = description;
    this.options = options;
    this.isRequired = isRequired;
    this.position = position;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
  static create(props) {
    if (!props.name) throw new Error("Name is required");
    if (!props.type) throw new Error("Type is required");
    if (!props.projectId) throw new Error("ProjectId is required");
    if ((props.type === "SELECT" /* SELECT */ || props.type === "MULTI_SELECT" /* MULTI_SELECT */) && (!props.options || props.options.length === 0)) {
      throw new Error("Select fields require options");
    }
    return new _CustomField(
      "",
      // ID will be set by DB
      props.name,
      props.type,
      props.projectId,
      props.description,
      props.options,
      props.isRequired ?? false,
      props.position ?? 0
    );
  }
  update(props) {
    if (props.name !== void 0) this.name = props.name;
    if (props.description !== void 0) this.description = props.description;
    if (props.options !== void 0) this.options = props.options;
    if (props.isRequired !== void 0) this.isRequired = props.isRequired;
    if (props.position !== void 0) this.position = props.position;
    this.updatedAt = /* @__PURE__ */ new Date();
  }
};

// src/custom-fields/model/custom-field-value.entity.ts
var CustomFieldValue = class _CustomFieldValue {
  constructor(id, fieldId, taskId, value, createdAt = /* @__PURE__ */ new Date(), updatedAt = /* @__PURE__ */ new Date()) {
    this.id = id;
    this.fieldId = fieldId;
    this.taskId = taskId;
    this.value = value;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
  static create(props) {
    if (!props.fieldId) throw new Error("FieldId is required");
    if (!props.taskId) throw new Error("TaskId is required");
    return new _CustomFieldValue(
      "",
      // ID will be set by DB
      props.fieldId,
      props.taskId,
      props.value
    );
  }
  updateValue(value) {
    this.value = value;
    this.updatedAt = /* @__PURE__ */ new Date();
  }
};

// src/search/model/search-query.entity.ts
var SearchQuery = class _SearchQuery extends Entity {
  constructor(props, mode = "valid") {
    super(props, mode);
    if (mode === "valid") {
      this.validate();
    }
  }
  static create(userId, query, intent, keywords, filters) {
    return new _SearchQuery({
      id: "search-" + Date.now(),
      userId,
      query,
      intent,
      keywords,
      filters,
      createdAt: /* @__PURE__ */ new Date()
    });
  }
  validate() {
    if (!this.props.userId || this.props.userId.trim().length === 0) {
      throw new Error("SearchQuery userId is required");
    }
    if (!this.props.query || this.props.query.trim().length === 0) {
      throw new Error("SearchQuery query is required");
    }
    if (this.props.query.length > 500) {
      throw new Error("SearchQuery query must be 500 characters or less");
    }
    if (!this.props.keywords || this.props.keywords.length === 0) {
      throw new Error("SearchQuery must have at least one keyword");
    }
  }
  // Business logic
  isTypeSearch() {
    return this.props.intent === "find";
  }
  isFilterSearch() {
    return this.props.intent === "filter";
  }
  isAggregateSearch() {
    return this.props.intent === "aggregate";
  }
  isCompareSearch() {
    return this.props.intent === "compare";
  }
  hasTypeFilter() {
    return !!this.props.filters.types && this.props.filters.types.length > 0;
  }
  hasProjectFilter() {
    return !!this.props.filters.projectId;
  }
  hasDateRange() {
    return !!this.props.filters.dateRange && !!(this.props.filters.dateRange.from || this.props.filters.dateRange.to);
  }
  // Getters
  get userId() {
    return this.props.userId;
  }
  get query() {
    return this.props.query;
  }
  get intent() {
    return this.props.intent;
  }
  get keywords() {
    return [...this.props.keywords];
  }
  get filters() {
    return this.props.filters;
  }
  get createdAt() {
    return this.props.createdAt;
  }
};

// src/search/model/search-result.vo.ts
var SearchResult = class {
  constructor(props) {
    this.props = props;
    this.validate();
  }
  validate() {
    if (!this.props.id || this.props.id.trim().length === 0) {
      throw new Error("SearchResult id is required");
    }
    if (!this.props.type) {
      throw new Error("SearchResult type is required");
    }
    if (!this.props.title || this.props.title.trim().length === 0) {
      throw new Error("SearchResult title is required");
    }
    if (this.props.relevanceScore < 0 || this.props.relevanceScore > 1) {
      throw new Error("SearchResult relevanceScore must be between 0 and 1");
    }
  }
  // Business logic
  isTask() {
    return this.props.type === "task";
  }
  isProject() {
    return this.props.type === "project";
  }
  isNote() {
    return this.props.type === "note";
  }
  isComment() {
    return this.props.type === "comment";
  }
  isHabit() {
    return this.props.type === "habit";
  }
  isHighRelevance(threshold = 0.8) {
    return this.props.relevanceScore >= threshold;
  }
  hasHighlights() {
    return this.props.highlights.length > 0;
  }
  getHighlightCount() {
    return this.props.highlights.length;
  }
  // Getters
  get id() {
    return this.props.id;
  }
  get type() {
    return this.props.type;
  }
  get title() {
    return this.props.title;
  }
  get description() {
    return this.props.description;
  }
  get relevanceScore() {
    return this.props.relevanceScore;
  }
  get highlights() {
    return [...this.props.highlights];
  }
  get metadata() {
    return this.props.metadata;
  }
};
var SearchResults = class {
  constructor(props) {
    this.props = props;
    this.validate();
  }
  validate() {
    if (!this.props.query || this.props.query.trim().length === 0) {
      throw new Error("SearchResults query is required");
    }
    if (!Array.isArray(this.props.results)) {
      throw new Error("SearchResults results must be an array");
    }
    if (this.props.totalCount < 0) {
      throw new Error("SearchResults totalCount cannot be negative");
    }
    if (this.props.executionTime < 0) {
      throw new Error("SearchResults executionTime cannot be negative");
    }
  }
  // Business logic
  hasResults() {
    return this.props.results.length > 0;
  }
  getResultCount() {
    return this.props.results.length;
  }
  getTopResults(count = 5) {
    return this.props.results.slice(0, count);
  }
  getResultsByType(type) {
    return this.props.results.filter((r) => r.type === type);
  }
  getHighRelevanceResults(threshold = 0.8) {
    return this.props.results.filter((r) => r.isHighRelevance(threshold));
  }
  getTaskResults() {
    return this.getResultsByType("task");
  }
  getProjectResults() {
    return this.getResultsByType("project");
  }
  // Getters
  get query() {
    return this.props.query;
  }
  get results() {
    return this.props.results;
  }
  get interpretation() {
    return this.props.interpretation;
  }
  get totalCount() {
    return this.props.totalCount;
  }
  get executionTime() {
    return this.props.executionTime;
  }
};

// src/search/usecase/execute-search.usecase.ts
var ExecuteSearchUseCase = class {
  constructor(searchRepo) {
    this.searchRepo = searchRepo;
  }
  async execute(input) {
    return await this.searchRepo.search(
      SearchQuery.create(
        input.userId,
        input.query,
        "find",
        [input.query],
        {
          types: input.types,
          projectId: input.projectId,
          includeCompleted: input.includeCompleted
        }
      )
    );
  }
};

// src/search/usecase/get-suggestions.usecase.ts
var GetSuggestionsUseCase = class {
  constructor(searchRepo) {
    this.searchRepo = searchRepo;
  }
  async execute(input) {
    const suggestions = await this.searchRepo.getSuggestions(
      input.userId,
      input.partialQuery,
      input.limit || 5
    );
    return { suggestions };
  }
};

// src/search/usecase/ask-question.usecase.ts
var AskQuestionUseCase = class {
  constructor(searchRepo) {
    this.searchRepo = searchRepo;
  }
  async execute(input) {
    return await this.searchRepo.askQuestion(input.userId, input.question);
  }
};

// src/activities/model/activity-type.enum.ts
var ActivityType = /* @__PURE__ */ ((ActivityType2) => {
  ActivityType2["TASK_CREATED"] = "TASK_CREATED";
  ActivityType2["TASK_UPDATED"] = "TASK_UPDATED";
  ActivityType2["TASK_COMPLETED"] = "TASK_COMPLETED";
  ActivityType2["TASK_DELETED"] = "TASK_DELETED";
  ActivityType2["COMMENT_ADDED"] = "COMMENT_ADDED";
  ActivityType2["COMMENT_EDITED"] = "COMMENT_EDITED";
  ActivityType2["COMMENT_DELETED"] = "COMMENT_DELETED";
  ActivityType2["ATTACHMENT_ADDED"] = "ATTACHMENT_ADDED";
  ActivityType2["ATTACHMENT_DELETED"] = "ATTACHMENT_DELETED";
  ActivityType2["SUBTASK_ADDED"] = "SUBTASK_ADDED";
  ActivityType2["SUBTASK_COMPLETED"] = "SUBTASK_COMPLETED";
  ActivityType2["STATUS_CHANGED"] = "STATUS_CHANGED";
  ActivityType2["PRIORITY_CHANGED"] = "PRIORITY_CHANGED";
  ActivityType2["ASSIGNEE_CHANGED"] = "ASSIGNEE_CHANGED";
  ActivityType2["DUE_DATE_CHANGED"] = "DUE_DATE_CHANGED";
  return ActivityType2;
})(ActivityType || {});

// src/activities/model/activity.entity.ts
var Activity = class extends Entity {
  constructor(props, mode = "valid") {
    super(props, mode);
    if (mode === "valid") {
      this.validate();
    }
  }
  /**
   * Validate activity properties
   */
  validate() {
    if (!this.props.taskId || this.props.taskId.trim() === "") {
      throw new Error("Activity must have a valid taskId");
    }
    if (!this.props.userId || this.props.userId.trim() === "") {
      throw new Error("Activity must have a valid userId");
    }
    if (!this.props.type) {
      throw new Error("Activity must have a type");
    }
    if (!this.props.createdAt) {
      throw new Error("Activity must have a createdAt timestamp");
    }
  }
  // ===== Getters =====
  get taskId() {
    return this.props.taskId;
  }
  get userId() {
    return this.props.userId;
  }
  get type() {
    return this.props.type;
  }
  get metadata() {
    return this.props.metadata;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  // ===== Business Methods =====
  /**
   * Check if this is a task-related activity
   */
  isTaskActivity() {
    return [
      "TASK_CREATED" /* TASK_CREATED */,
      "TASK_UPDATED" /* TASK_UPDATED */,
      "TASK_COMPLETED" /* TASK_COMPLETED */,
      "TASK_DELETED" /* TASK_DELETED */
    ].includes(this.props.type);
  }
  /**
   * Check if this is a comment-related activity
   */
  isCommentActivity() {
    return [
      "COMMENT_ADDED" /* COMMENT_ADDED */,
      "COMMENT_EDITED" /* COMMENT_EDITED */,
      "COMMENT_DELETED" /* COMMENT_DELETED */
    ].includes(this.props.type);
  }
  /**
   * Check if this is an attachment-related activity
   */
  isAttachmentActivity() {
    return [
      "ATTACHMENT_ADDED" /* ATTACHMENT_ADDED */,
      "ATTACHMENT_DELETED" /* ATTACHMENT_DELETED */
    ].includes(this.props.type);
  }
  /**
   * Check if this is a subtask-related activity
   */
  isSubtaskActivity() {
    return [
      "SUBTASK_ADDED" /* SUBTASK_ADDED */,
      "SUBTASK_COMPLETED" /* SUBTASK_COMPLETED */
    ].includes(this.props.type);
  }
  /**
   * Check if this is a field change activity
   */
  isFieldChangeActivity() {
    return [
      "STATUS_CHANGED" /* STATUS_CHANGED */,
      "PRIORITY_CHANGED" /* PRIORITY_CHANGED */,
      "DUE_DATE_CHANGED" /* DUE_DATE_CHANGED */,
      "ASSIGNEE_CHANGED" /* ASSIGNEE_CHANGED */
    ].includes(this.props.type);
  }
  /**
   * Get the field name that changed (if applicable)
   */
  getChangedFieldName() {
    if (this.isFieldChangeActivity() && this.props.metadata) {
      return this.props.metadata.fieldName || null;
    }
    return null;
  }
  /**
   * Get human-readable description of the activity
   */
  getDescription() {
    const type = this.props.type;
    const metadata = this.props.metadata;
    switch (type) {
      case "TASK_CREATED" /* TASK_CREATED */:
        return "Task created";
      case "TASK_UPDATED" /* TASK_UPDATED */:
        return "Task updated";
      case "TASK_COMPLETED" /* TASK_COMPLETED */:
        return "Task completed";
      case "TASK_DELETED" /* TASK_DELETED */:
        return "Task deleted";
      case "COMMENT_ADDED" /* COMMENT_ADDED */:
        return "Comment added";
      case "COMMENT_EDITED" /* COMMENT_EDITED */:
        return "Comment edited";
      case "COMMENT_DELETED" /* COMMENT_DELETED */:
        return "Comment deleted";
      case "ATTACHMENT_ADDED" /* ATTACHMENT_ADDED */:
        return `Attachment added: ${metadata?.itemName || "file"}`;
      case "ATTACHMENT_DELETED" /* ATTACHMENT_DELETED */:
        return `Attachment deleted: ${metadata?.itemName || "file"}`;
      case "SUBTASK_ADDED" /* SUBTASK_ADDED */:
        return `Subtask added: ${metadata?.itemName || "subtask"}`;
      case "SUBTASK_COMPLETED" /* SUBTASK_COMPLETED */:
        return `Subtask completed: ${metadata?.itemName || "subtask"}`;
      case "STATUS_CHANGED" /* STATUS_CHANGED */:
        return `Status changed from ${metadata?.oldValue || "none"} to ${metadata?.newValue || "none"}`;
      case "PRIORITY_CHANGED" /* PRIORITY_CHANGED */:
        return `Priority changed from ${metadata?.oldValue || "none"} to ${metadata?.newValue || "none"}`;
      case "DUE_DATE_CHANGED" /* DUE_DATE_CHANGED */:
        return `Due date changed from ${metadata?.oldValue || "none"} to ${metadata?.newValue || "none"}`;
      case "ASSIGNEE_CHANGED" /* ASSIGNEE_CHANGED */:
        return `Assignee changed from ${metadata?.oldValue || "unassigned"} to ${metadata?.newValue || "unassigned"}`;
      default:
        return "Unknown activity";
    }
  }
};

// src/activities/usecase/log-activity.usecase.ts
var LogActivityUseCase = class {
  constructor(activityRepo) {
    this.activityRepo = activityRepo;
  }
  async execute(input) {
    const activity = new Activity({
      id: "",
      // Will be generated by repository
      taskId: input.taskId,
      userId: input.userId,
      type: input.type,
      metadata: input.metadata,
      createdAt: /* @__PURE__ */ new Date()
    });
    return await this.activityRepo.logActivity(input);
  }
};

// src/activities/usecase/get-task-activities.usecase.ts
var GetTaskActivitiesUseCase = class {
  constructor(activityRepo) {
    this.activityRepo = activityRepo;
  }
  async execute(input) {
    return await this.activityRepo.getTaskActivities(input.taskId, input.limit);
  }
};

// src/focus/model/ambient-track.entity.ts
var AmbientTrack = class extends Entity {
  constructor(props, mode = "valid") {
    super(props, mode);
    if (mode === "valid") {
      this.validate();
    }
  }
  validate() {
    if (!this.props.name || this.props.name.trim().length === 0) {
      throw new Error("AmbientTrack name is required");
    }
    if (this.props.name.length > 255) {
      throw new Error("AmbientTrack name must be 255 characters or less");
    }
    if (!this.props.description || this.props.description.trim().length === 0) {
      throw new Error("AmbientTrack description is required");
    }
    if (this.props.description.length > 1e3) {
      throw new Error("AmbientTrack description must be 1000 characters or less");
    }
    if (!this.props.url || this.props.url.trim().length === 0) {
      throw new Error("AmbientTrack URL is required");
    }
    if (this.props.duration < 0) {
      throw new Error("AmbientTrack duration cannot be negative");
    }
    if (!this.props.iconEmoji || this.props.iconEmoji.trim().length === 0) {
      throw new Error("AmbientTrack iconEmoji is required");
    }
  }
  // Business logic methods
  isLooping() {
    return this.props.duration === 0;
  }
  getDurationInMinutes() {
    return this.props.duration / 60;
  }
  isAccessibleToUser(hasPremium) {
    return !this.props.isPremium || hasPremium;
  }
  matchesCategory(category) {
    return this.props.category === category;
  }
  isNature() {
    return this.props.category === "nature";
  }
  isCafe() {
    return this.props.category === "cafe";
  }
  isMusic() {
    return this.props.category === "music";
  }
  isWhiteNoise() {
    return this.props.category === "white-noise";
  }
  isBinaural() {
    return this.props.category === "binaural";
  }
  // Getters
  get name() {
    return this.props.name;
  }
  get description() {
    return this.props.description;
  }
  get category() {
    return this.props.category;
  }
  get iconEmoji() {
    return this.props.iconEmoji;
  }
  get url() {
    return this.props.url;
  }
  get duration() {
    return this.props.duration;
  }
  get isPremium() {
    return this.props.isPremium;
  }
};

// src/focus/model/focus-mode.entity.ts
var FocusMode = class extends Entity {
  constructor(props, mode = "valid") {
    super(props, mode);
    if (mode === "valid") {
      this.validate();
    }
  }
  validate() {
    if (!this.props.name || this.props.name.trim().length === 0) {
      throw new Error("FocusMode name is required");
    }
    if (this.props.name.length > 100) {
      throw new Error("FocusMode name must be 100 characters or less");
    }
    if (!this.props.description || this.props.description.trim().length === 0) {
      throw new Error("FocusMode description is required");
    }
    if (this.props.description.length > 500) {
      throw new Error("FocusMode description must be 500 characters or less");
    }
    if (this.props.workDuration < 1 || this.props.workDuration > 180) {
      throw new Error("FocusMode workDuration must be between 1 and 180 minutes");
    }
    if (this.props.shortBreakDuration < 1 || this.props.shortBreakDuration > 60) {
      throw new Error("FocusMode shortBreakDuration must be between 1 and 60 minutes");
    }
    if (this.props.longBreakDuration < 1 || this.props.longBreakDuration > 120) {
      throw new Error("FocusMode longBreakDuration must be between 1 and 120 minutes");
    }
    if (this.props.sessionsBeforeLongBreak < 1 || this.props.sessionsBeforeLongBreak > 10) {
      throw new Error("FocusMode sessionsBeforeLongBreak must be between 1 and 10");
    }
  }
  // Business logic methods
  getTotalCycleTime() {
    return this.props.workDuration + this.props.shortBreakDuration;
  }
  getTotalCycleTimeWithLongBreak() {
    const shortBreaksTime = this.props.shortBreakDuration * (this.props.sessionsBeforeLongBreak - 1);
    const workTime = this.props.workDuration * this.props.sessionsBeforeLongBreak;
    return workTime + shortBreaksTime + this.props.longBreakDuration;
  }
  isLongBreakSession(sessionNumber) {
    return sessionNumber > 0 && sessionNumber % this.props.sessionsBeforeLongBreak === 0;
  }
  getExpectedSessionDuration(sessionNumber) {
    if (this.isLongBreakSession(sessionNumber)) {
      return this.props.longBreakDuration;
    }
    if (sessionNumber === 1) {
      return this.props.workDuration;
    }
    return sessionNumber % 2 !== 0 ? this.props.workDuration : this.props.shortBreakDuration;
  }
  hasRecommendedTrack(trackId) {
    return this.props.recommendedTrackIds.includes(trackId);
  }
  isIntensive() {
    return this.props.workDuration >= 50;
  }
  isLight() {
    return this.props.workDuration <= 25;
  }
  // Getters
  get name() {
    return this.props.name;
  }
  get description() {
    return this.props.description;
  }
  get workDuration() {
    return this.props.workDuration;
  }
  get shortBreakDuration() {
    return this.props.shortBreakDuration;
  }
  get longBreakDuration() {
    return this.props.longBreakDuration;
  }
  get sessionsBeforeLongBreak() {
    return this.props.sessionsBeforeLongBreak;
  }
  get recommendedTrackIds() {
    return [...this.props.recommendedTrackIds];
  }
};

// src/focus/model/focus-preferences.entity.ts
var FocusPreferences = class _FocusPreferences extends Entity {
  constructor(props, mode = "valid") {
    super(props, mode);
    if (mode === "valid") {
      this.validate();
    }
  }
  static create(userId) {
    return new _FocusPreferences({
      id: "prefs",
      // Not stored as separate entity
      userId,
      favoriteTrackIds: [],
      defaultVolume: 50,
      enableTransitions: true,
      preferredModeId: null
    });
  }
  validate() {
    if (!this.props.userId || this.props.userId.trim().length === 0) {
      throw new Error("FocusPreferences userId is required");
    }
    if (this.props.defaultVolume < 0 || this.props.defaultVolume > 100) {
      throw new Error("FocusPreferences defaultVolume must be between 0 and 100");
    }
    if (!Array.isArray(this.props.favoriteTrackIds)) {
      throw new Error("FocusPreferences favoriteTrackIds must be an array");
    }
  }
  // Business logic methods
  addFavorite(trackId) {
    if (this.props.favoriteTrackIds.includes(trackId)) {
      return this;
    }
    return this.clone({
      favoriteTrackIds: [...this.props.favoriteTrackIds, trackId]
    });
  }
  removeFavorite(trackId) {
    return this.clone({
      favoriteTrackIds: this.props.favoriteTrackIds.filter((id) => id !== trackId)
    });
  }
  toggleFavorite(trackId) {
    if (this.props.favoriteTrackIds.includes(trackId)) {
      return this.removeFavorite(trackId);
    }
    return this.addFavorite(trackId);
  }
  isFavorite(trackId) {
    return this.props.favoriteTrackIds.includes(trackId);
  }
  updateVolume(volume) {
    if (volume < 0 || volume > 100) {
      throw new Error("Volume must be between 0 and 100");
    }
    return this.clone({
      defaultVolume: volume
    });
  }
  setTransitionsEnabled(enabled) {
    return this.clone({
      enableTransitions: enabled
    });
  }
  setPreferredMode(modeId) {
    return this.clone({
      preferredModeId: modeId
    });
  }
  hasPreferredMode() {
    return this.props.preferredModeId !== null;
  }
  getFavoriteCount() {
    return this.props.favoriteTrackIds.length;
  }
  // Getters
  get userId() {
    return this.props.userId;
  }
  get favoriteTrackIds() {
    return [...this.props.favoriteTrackIds];
  }
  get defaultVolume() {
    return this.props.defaultVolume;
  }
  get enableTransitions() {
    return this.props.enableTransitions;
  }
  get preferredModeId() {
    return this.props.preferredModeId;
  }
};

// src/focus/model/focus-stats.vo.ts
var FocusStats = class {
  constructor(props) {
    this.props = props;
    this.validate();
  }
  validate() {
    if (this.props.totalSessions < 0) {
      throw new Error("Total sessions cannot be negative");
    }
    if (this.props.totalFocusMinutes < 0) {
      throw new Error("Total focus minutes cannot be negative");
    }
    if (this.props.avgSessionLength < 0) {
      throw new Error("Average session length cannot be negative");
    }
    if (this.props.streakDays < 0) {
      throw new Error("Streak days cannot be negative");
    }
  }
  // Business logic methods
  getTotalFocusHours() {
    return Math.round(this.props.totalFocusMinutes / 60 * 10) / 10;
  }
  hasData() {
    return this.props.totalSessions > 0;
  }
  hasStreak() {
    return this.props.streakDays > 0;
  }
  isProductive() {
    return this.props.avgSessionLength >= 20 && this.props.totalSessions >= 5;
  }
  getStreakLevel() {
    if (this.props.streakDays === 0) return "none";
    if (this.props.streakDays < 7) return "bronze";
    if (this.props.streakDays < 14) return "silver";
    if (this.props.streakDays < 30) return "gold";
    return "platinum";
  }
  // Getters
  get totalSessions() {
    return this.props.totalSessions;
  }
  get totalFocusMinutes() {
    return this.props.totalFocusMinutes;
  }
  get avgSessionLength() {
    return this.props.avgSessionLength;
  }
  get favoriteTrack() {
    return this.props.favoriteTrack;
  }
  get preferredMode() {
    return this.props.preferredMode;
  }
  get streakDays() {
    return this.props.streakDays;
  }
  toJSON() {
    return {
      totalSessions: this.props.totalSessions,
      totalFocusMinutes: this.props.totalFocusMinutes,
      totalFocusHours: this.getTotalFocusHours(),
      avgSessionLength: this.props.avgSessionLength,
      favoriteTrack: this.props.favoriteTrack,
      preferredMode: this.props.preferredMode,
      streakDays: this.props.streakDays,
      streakLevel: this.getStreakLevel(),
      hasData: this.hasData(),
      hasStreak: this.hasStreak(),
      isProductive: this.isProductive()
    };
  }
};

// src/focus/usecase/get-user-preferences.usecase.ts
var GetUserPreferencesUseCase = class {
  constructor(focusRepo) {
    this.focusRepo = focusRepo;
  }
  async execute(input) {
    const prefs = await this.focusRepo.getUserPreferences(input.userId);
    if (!prefs) {
      return FocusPreferences.create(input.userId);
    }
    return prefs;
  }
};

// src/focus/usecase/update-user-preferences.usecase.ts
var UpdateUserPreferencesUseCase = class {
  constructor(focusRepo) {
    this.focusRepo = focusRepo;
  }
  async execute(input) {
    const currentPrefs = await this.focusRepo.getUserPreferences(input.userId);
    if (!currentPrefs) {
      let newPrefs = FocusPreferences.create(input.userId);
      if (input.defaultVolume !== void 0) {
        newPrefs = newPrefs.updateVolume(input.defaultVolume);
      }
      if (input.enableTransitions !== void 0) {
        newPrefs = newPrefs.setTransitionsEnabled(input.enableTransitions);
      }
      if (input.preferredModeId !== void 0) {
        newPrefs = newPrefs.setPreferredMode(input.preferredModeId);
      }
      await this.focusRepo.saveUserPreferences(newPrefs);
      return newPrefs;
    }
    let updatedPrefs = currentPrefs;
    if (input.defaultVolume !== void 0) {
      updatedPrefs = updatedPrefs.updateVolume(input.defaultVolume);
    }
    if (input.enableTransitions !== void 0) {
      updatedPrefs = updatedPrefs.setTransitionsEnabled(input.enableTransitions);
    }
    if (input.preferredModeId !== void 0) {
      updatedPrefs = updatedPrefs.setPreferredMode(input.preferredModeId);
    }
    await this.focusRepo.saveUserPreferences(updatedPrefs);
    return updatedPrefs;
  }
};

// src/focus/usecase/toggle-favorite-track.usecase.ts
var ToggleFavoriteTrackUseCase = class {
  constructor(focusRepo) {
    this.focusRepo = focusRepo;
  }
  async execute(input) {
    const prefs = await this.focusRepo.getUserPreferences(input.userId);
    if (!prefs) {
      const newPrefs = FocusPreferences.create(input.userId).addFavorite(input.trackId);
      await this.focusRepo.saveUserPreferences(newPrefs);
      return { isFavorite: true, preferences: newPrefs };
    }
    const updatedPrefs = prefs.toggleFavorite(input.trackId);
    await this.focusRepo.saveUserPreferences(updatedPrefs);
    return {
      isFavorite: updatedPrefs.isFavorite(input.trackId),
      preferences: updatedPrefs
    };
  }
};

// src/focus/usecase/get-focus-stats.usecase.ts
var GetFocusStatsUseCase = class {
  constructor(focusRepo) {
    this.focusRepo = focusRepo;
  }
  async execute(input) {
    return await this.focusRepo.getFocusStats(input.userId);
  }
};

// src/focus/usecase/record-track-usage.usecase.ts
var RecordTrackUsageUseCase = class {
  constructor(focusRepo) {
    this.focusRepo = focusRepo;
  }
  async execute(input) {
    if (input.durationMinutes < 0) {
      throw new Error("Duration cannot be negative");
    }
    await this.focusRepo.recordTrackUsage({
      trackId: input.trackId,
      durationMinutes: input.durationMinutes,
      userId: input.userId,
      recordedAt: /* @__PURE__ */ new Date()
    });
  }
};

// src/focus/usecase/get-recommended-tracks.usecase.ts
var GetRecommendedTracksUseCase = class {
  constructor(focusRepo) {
    this.focusRepo = focusRepo;
  }
  async execute(input) {
    const hour = (/* @__PURE__ */ new Date()).getHours();
    const prefs = await this.focusRepo.getUserPreferences(input.userId);
    const userPrefs = prefs || FocusPreferences.create(input.userId);
    const accessibleTracks = input.allAvailableTracks.filter(
      (track) => track.isAccessibleToUser(input.hasPremium)
    );
    let recommended;
    if (hour >= 6 && hour < 12) {
      recommended = accessibleTracks.filter(
        (track) => track.isCafe() || track.id === "forest" || track.id === "focus-binaural"
      );
    } else if (hour >= 12 && hour < 17) {
      recommended = accessibleTracks.filter(
        (track) => track.isWhiteNoise() || track.id === "rain-soft" || track.isMusic()
      );
    } else if (hour >= 17 && hour < 22) {
      recommended = accessibleTracks.filter(
        (track) => track.id === "rain-soft" || track.id === "ocean-waves" || track.id === "river-stream"
      );
    } else {
      recommended = accessibleTracks.filter(
        (track) => track.isWhiteNoise() || track.id === "brown-noise" || track.isBinaural()
      );
    }
    const favorites = recommended.filter(
      (track) => userPrefs.isFavorite(track.id)
    );
    const nonFavorites = recommended.filter(
      (track) => !userPrefs.isFavorite(track.id)
    );
    return [...favorites, ...nonFavorites];
  }
};

// src/meetings/model/action-item.entity.ts
var ActionItem = class _ActionItem extends Entity {
  constructor(props, mode = "valid") {
    super(props, mode);
    if (mode === "valid") {
      this.validate();
    }
  }
  static create(props) {
    return new _ActionItem({
      id: Math.random().toString(36).substring(7),
      ...props
    });
  }
  validate() {
    if (!this.props.title || this.props.title.trim().length === 0) {
      throw new Error("ActionItem title is required");
    }
    if (this.props.title.length > 500) {
      throw new Error("ActionItem title must be 500 characters or less");
    }
    if (this.props.description && this.props.description.length > 2e3) {
      throw new Error("ActionItem description must be 2000 characters or less");
    }
    if (this.props.context && this.props.context.length > 1e3) {
      throw new Error("ActionItem context must be 1000 characters or less");
    }
    if (!["LOW", "MEDIUM", "HIGH", "URGENT"].includes(this.props.priority)) {
      throw new Error("Invalid priority value");
    }
  }
  // Business logic methods
  isAssigned() {
    return !!this.props.assignee && this.props.assignee.trim().length > 0;
  }
  hasDueDate() {
    return !!this.props.dueDate;
  }
  isOverdue() {
    if (!this.props.dueDate) return false;
    return /* @__PURE__ */ new Date() > this.props.dueDate;
  }
  isDueWithin(days) {
    if (!this.props.dueDate) return false;
    const now = /* @__PURE__ */ new Date();
    const future = /* @__PURE__ */ new Date();
    future.setDate(future.getDate() + days);
    return this.props.dueDate >= now && this.props.dueDate <= future;
  }
  markAsCompleted(taskId) {
    return this.clone({
      completed: true,
      taskId: taskId || this.props.taskId
    });
  }
  linkToTask(taskId) {
    return this.clone({
      taskId
    });
  }
  isUrgent() {
    return this.props.priority === "URGENT" || this.props.priority === "HIGH";
  }
  getPriorityLevel() {
    const levels = { LOW: 1, MEDIUM: 2, HIGH: 3, URGENT: 4 };
    return levels[this.props.priority];
  }
  isHigherPriorityThan(other) {
    return this.getPriorityLevel() > other.getPriorityLevel();
  }
  // Getters
  get title() {
    return this.props.title;
  }
  get description() {
    return this.props.description;
  }
  get assignee() {
    return this.props.assignee;
  }
  get dueDate() {
    return this.props.dueDate;
  }
  get priority() {
    return this.props.priority;
  }
  get context() {
    return this.props.context;
  }
  get completed() {
    return this.props.completed ?? false;
  }
  get taskId() {
    return this.props.taskId;
  }
};

// src/meetings/model/meeting-analysis.vo.ts
var KeyDecision = class {
  constructor(props) {
    this.props = props;
    this.validate();
  }
  validate() {
    if (!this.props.decision || this.props.decision.trim().length === 0) {
      throw new Error("KeyDecision decision is required");
    }
    if (this.props.decision.length > 500) {
      throw new Error("KeyDecision decision must be 500 characters or less");
    }
    if (this.props.context && this.props.context.length > 1e3) {
      throw new Error("KeyDecision context must be 1000 characters or less");
    }
  }
  get decision() {
    return this.props.decision;
  }
  get context() {
    return this.props.context;
  }
  get participants() {
    return this.props.participants || [];
  }
  hasParticipants() {
    return !!this.props.participants && this.props.participants.length > 0;
  }
};
var MeetingParticipant = class {
  constructor(props) {
    this.props = props;
    this.validate();
  }
  validate() {
    if (!this.props.name || this.props.name.trim().length === 0) {
      throw new Error("MeetingParticipant name is required");
    }
    if (this.props.name.length > 100) {
      throw new Error("MeetingParticipant name must be 100 characters or less");
    }
    if (this.props.role && this.props.role.length > 100) {
      throw new Error("MeetingParticipant role must be 100 characters or less");
    }
    if (this.props.speakingTime !== void 0 && (this.props.speakingTime < 0 || this.props.speakingTime > 100)) {
      throw new Error("MeetingParticipant speakingTime must be between 0 and 100");
    }
  }
  get name() {
    return this.props.name;
  }
  get role() {
    return this.props.role;
  }
  get speakingTime() {
    return this.props.speakingTime;
  }
  hasRole() {
    return !!this.props.role && this.props.role.trim().length > 0;
  }
  isActiveSpeaker() {
    return (this.props.speakingTime || 0) > 10;
  }
};
var MeetingTopic = class {
  constructor(props) {
    this.props = props;
    this.validate();
  }
  validate() {
    if (!this.props.topic || this.props.topic.trim().length === 0) {
      throw new Error("MeetingTopic topic is required");
    }
    if (this.props.topic.length > 200) {
      throw new Error("MeetingTopic topic must be 200 characters or less");
    }
    if (!this.props.summary || this.props.summary.trim().length === 0) {
      throw new Error("MeetingTopic summary is required");
    }
    if (this.props.summary.length > 500) {
      throw new Error("MeetingTopic summary must be 500 characters or less");
    }
    if (this.props.duration !== void 0 && this.props.duration < 0) {
      throw new Error("MeetingTopic duration cannot be negative");
    }
  }
  get topic() {
    return this.props.topic;
  }
  get duration() {
    return this.props.duration;
  }
  get summary() {
    return this.props.summary;
  }
  isMajorTopic() {
    return (this.props.duration || 0) > 15;
  }
};
var MeetingAnalysis = class {
  constructor(props) {
    this.props = props;
    this.validate();
  }
  validate() {
    if (!this.props.summary || this.props.summary.trim().length === 0) {
      throw new Error("MeetingAnalysis summary is required");
    }
    if (this.props.summary.length > 2e3) {
      throw new Error("MeetingAnalysis summary must be 2000 characters or less");
    }
    if (!Array.isArray(this.props.keyPoints)) {
      throw new Error("MeetingAnalysis keyPoints must be an array");
    }
    if (!["POSITIVE", "NEUTRAL", "NEGATIVE", "MIXED"].includes(this.props.sentiment)) {
      throw new Error("Invalid sentiment value");
    }
    if (this.props.suggestedFollowUpDate && this.props.suggestedFollowUpDate < /* @__PURE__ */ new Date()) {
      throw new Error("MeetingAnalysis suggestedFollowUpDate must be in the future");
    }
  }
  // Business logic methods
  hasActionItems() {
    return this.props.actionItems.length > 0;
  }
  hasDecisions() {
    return this.props.decisions.length > 0;
  }
  hasParticipants() {
    return this.props.participants.length > 0;
  }
  hasTopics() {
    return this.props.topics.length > 0;
  }
  isPositive() {
    return this.props.sentiment === "POSITIVE";
  }
  isNegative() {
    return this.props.sentiment === "NEGATIVE";
  }
  requiresFollowUp() {
    return this.props.followUpRequired;
  }
  getActionItemCount() {
    return this.props.actionItems.length;
  }
  getDecisionCount() {
    return this.props.decisions.length;
  }
  getParticipantCount() {
    return this.props.participants.length;
  }
  getTopicCount() {
    return this.props.topics.length;
  }
  wasProductive() {
    return this.hasDecisions() && this.hasActionItems() && !this.isNegative();
  }
  // Getters
  get summary() {
    return this.props.summary;
  }
  get keyPoints() {
    return [...this.props.keyPoints];
  }
  get actionItems() {
    return this.props.actionItems;
  }
  get decisions() {
    return this.props.decisions;
  }
  get participants() {
    return this.props.participants;
  }
  get topics() {
    return this.props.topics;
  }
  get sentiment() {
    return this.props.sentiment;
  }
  get followUpRequired() {
    return this.props.followUpRequired;
  }
  get suggestedFollowUpDate() {
    return this.props.suggestedFollowUpDate;
  }
};

// src/meetings/model/meeting.entity.ts
var Meeting = class _Meeting extends Entity {
  constructor(props, mode = "valid") {
    super(props, mode);
    if (mode === "valid") {
      this.validate();
    }
  }
  static create(props) {
    const now = /* @__PURE__ */ new Date();
    return new _Meeting({
      ...props,
      createdAt: now,
      updatedAt: now
    });
  }
  validate() {
    if (!this.props.userId || this.props.userId.trim().length === 0) {
      throw new Error("Meeting userId is required");
    }
    if (!this.props.title || this.props.title.trim().length === 0) {
      throw new Error("Meeting title is required");
    }
    if (this.props.title.length > 500) {
      throw new Error("Meeting title must be 500 characters or less");
    }
    if (!this.props.date) {
      throw new Error("Meeting date is required");
    }
    if (this.props.duration < 0) {
      throw new Error("Meeting duration cannot be negative");
    }
    if (this.props.duration > 480) {
      throw new Error("Meeting duration cannot exceed 8 hours (480 minutes)");
    }
    if (this.props.transcript && this.props.transcript.length > 1e5) {
      throw new Error("Meeting transcript must be 100,000 characters or less");
    }
    if (this.props.audioUrl && this.props.audioUrl.length > 1e3) {
      throw new Error("Meeting audioUrl must be 1000 characters or less");
    }
  }
  // Business logic methods
  hasTranscript() {
    return !!this.props.transcript && this.props.transcript.trim().length > 0;
  }
  hasAudio() {
    return !!this.props.audioUrl && this.props.audioUrl.trim().length > 0;
  }
  hasAnalysis() {
    return !!this.props.analysis;
  }
  isAssociatedWithProject() {
    return !!this.props.projectId;
  }
  isPast() {
    return this.props.date < /* @__PURE__ */ new Date();
  }
  isFuture() {
    return this.props.date > /* @__PURE__ */ new Date();
  }
  isToday() {
    const today = /* @__PURE__ */ new Date();
    return this.props.date.getDate() === today.getDate() && this.props.date.getMonth() === today.getMonth() && this.props.date.getFullYear() === today.getFullYear();
  }
  isUpcoming(days = 7) {
    const now = /* @__PURE__ */ new Date();
    const future = /* @__PURE__ */ new Date();
    future.setDate(future.getDate() + days);
    return this.props.date >= now && this.props.date <= future;
  }
  getDurationInHours() {
    return Math.round(this.props.duration / 60 * 10) / 10;
  }
  isLong() {
    return this.props.duration > 60;
  }
  isShort() {
    return this.props.duration <= 30;
  }
  updateAnalysis(analysis) {
    return this.clone({
      analysis,
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  addTranscript(transcript) {
    return this.clone({
      transcript,
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  linkToProject(projectId) {
    return this.clone({
      projectId,
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  // Getters
  get userId() {
    return this.props.userId;
  }
  get title() {
    return this.props.title;
  }
  get date() {
    return this.props.date;
  }
  get duration() {
    return this.props.duration;
  }
  get transcript() {
    return this.props.transcript;
  }
  get audioUrl() {
    return this.props.audioUrl;
  }
  get analysis() {
    return this.props.analysis;
  }
  get projectId() {
    return this.props.projectId;
  }
  get createdAt() {
    return this.props.createdAt || /* @__PURE__ */ new Date();
  }
  get updatedAt() {
    return this.props.updatedAt || /* @__PURE__ */ new Date();
  }
};

// src/meetings/usecase/create-meeting.usecase.ts
var CreateMeetingUseCase = class {
  constructor(meetingRepo) {
    this.meetingRepo = meetingRepo;
  }
  async execute(input) {
    const meeting = Meeting.create({
      userId: input.userId,
      title: input.title,
      date: input.date,
      duration: input.duration,
      transcript: input.transcript,
      audioUrl: input.audioUrl,
      projectId: input.projectId
    });
    return await this.meetingRepo.create(meeting);
  }
};

// src/meetings/usecase/get-meeting.usecase.ts
var GetMeetingUseCase = class {
  constructor(meetingRepo) {
    this.meetingRepo = meetingRepo;
  }
  async execute(input) {
    return await this.meetingRepo.findById(input.id);
  }
};

// src/meetings/usecase/list-meetings.usecase.ts
var ListMeetingsUseCase = class {
  constructor(meetingRepo) {
    this.meetingRepo = meetingRepo;
  }
  async execute(input) {
    if (input.projectId) {
      return await this.meetingRepo.findByProjectId(input.projectId);
    }
    if (input.upcoming) {
      return await this.meetingRepo.findUpcoming(input.userId, input.days);
    }
    if (input.past) {
      return await this.meetingRepo.findPast(input.userId);
    }
    return await this.meetingRepo.findByUserId(input.userId);
  }
};

// src/meetings/usecase/analyze-transcript.usecase.ts
var AnalyzeTranscriptUseCase = class {
  constructor(analysisService) {
    this.analysisService = analysisService;
  }
  async execute(input) {
    return await this.analysisService.analyzeTranscript(input.transcript, {
      meetingTitle: input.meetingTitle,
      participants: input.participants,
      duration: input.duration,
      projectContext: input.projectContext
    });
  }
};

// src/meetings/usecase/extract-action-items.usecase.ts
var ExtractActionItemsUseCase = class {
  constructor(analysisService) {
    this.analysisService = analysisService;
  }
  async execute(input) {
    return await this.analysisService.extractActionItems(
      input.transcript,
      input.projectContext
    );
  }
};

// src/meetings/usecase/generate-summary.usecase.ts
var GenerateSummaryUseCase = class {
  constructor(analysisService) {
    this.analysisService = analysisService;
  }
  async execute(input) {
    return await this.analysisService.generateSummary(
      input.transcript,
      input.style || "executive"
    );
  }
};

// src/meetings/usecase/update-meeting-analysis.usecase.ts
var UpdateMeetingAnalysisUseCase = class {
  constructor(meetingRepo) {
    this.meetingRepo = meetingRepo;
  }
  async execute(input) {
    const meeting = await this.meetingRepo.findById(input.meetingId);
    if (!meeting) {
      throw new Error("Meeting not found");
    }
    const updatedMeeting = meeting.updateAnalysis(input.analysis);
    return await this.meetingRepo.update(updatedMeeting);
  }
};

// src/images/model/image-specs.vo.ts
var ImageSpecs = class _ImageSpecs {
  maxFileSize;
  maxDimensions;
  targetSize;
  quality;
  format;
  constructor(props) {
    this.maxFileSize = props.maxFileSize;
    this.maxDimensions = props.maxDimensions;
    this.targetSize = props.targetSize;
    this.quality = props.quality;
    this.format = props.format;
    this.validate();
  }
  validate() {
    if (this.maxFileSize <= 0) {
      throw new Error("maxFileSize must be greater than 0");
    }
    if (this.maxDimensions <= 0) {
      throw new Error("maxDimensions must be greater than 0");
    }
    if (this.targetSize !== void 0 && this.targetSize <= 0) {
      throw new Error("targetSize must be greater than 0");
    }
    if (this.quality !== void 0 && (this.quality < 1 || this.quality > 100)) {
      throw new Error("quality must be between 1 and 100");
    }
  }
  /**
   * Get specifications for avatar processing
   */
  static forAvatar() {
    return new _ImageSpecs({
      maxFileSize: 5 * 1024 * 1024,
      // 5MB
      maxDimensions: 4e3,
      // 4000x4000px
      targetSize: 256,
      // 256x256px
      quality: 85,
      // JPEG quality
      format: "jpeg"
    });
  }
  /**
   * Get specifications for general image optimization
   */
  static forOptimization() {
    return new _ImageSpecs({
      maxFileSize: 10 * 1024 * 1024,
      // 10MB
      maxDimensions: 5e3,
      targetSize: 1920,
      // Full HD
      quality: 85,
      format: "jpeg"
    });
  }
  /**
   * Get specifications for thumbnail processing
   */
  static forThumbnail() {
    return new _ImageSpecs({
      maxFileSize: 2 * 1024 * 1024,
      // 2MB
      maxDimensions: 2e3,
      targetSize: 150,
      // 150x150px
      quality: 80,
      format: "jpeg"
    });
  }
  /**
   * Get max file size in MB
   */
  getMaxFileSizeInMB() {
    return this.maxFileSize / (1024 * 1024);
  }
  /**
   * Check if file size is within limits
   */
  isValidFileSize(sizeInBytes) {
    return sizeInBytes <= this.maxFileSize;
  }
  /**
   * Check if dimensions are within limits
   */
  isValidDimensions(width, height) {
    return width <= this.maxDimensions && height <= this.maxDimensions;
  }
  /**
   * Check if this is an avatar specification
   */
  isAvatarSpecs() {
    return this.targetSize === 256 && this.quality === 85 && this.format === "jpeg";
  }
};

// src/images/model/processed-image.vo.ts
var ProcessedImage = class {
  buffer;
  width;
  height;
  format;
  size;
  originalName;
  constructor(props) {
    this.buffer = props.buffer;
    this.width = props.width;
    this.height = props.height;
    this.format = props.format;
    this.size = props.size;
    this.originalName = props.originalName;
    this.validate();
  }
  validate() {
    if (!this.buffer || this.buffer.length === 0) {
      throw new Error("Processed image must have a valid buffer");
    }
    if (this.width <= 0 || this.height <= 0) {
      throw new Error("Processed image must have valid dimensions");
    }
    if (this.size <= 0) {
      throw new Error("Processed image must have a valid size");
    }
    if (!this.format || this.format.trim() === "") {
      throw new Error("Processed image must have a format");
    }
  }
  /**
   * Get size in bytes
   */
  getSizeInBytes() {
    return this.size;
  }
  /**
   * Get size in KB
   */
  getSizeInKB() {
    return this.size / 1024;
  }
  /**
   * Get size in MB
   */
  getSizeInMB() {
    return this.size / (1024 * 1024);
  }
  /**
   * Check if image is square
   */
  isSquare() {
    return this.width === this.height;
  }
  /**
   * Check if image is landscape
   */
  isLandscape() {
    return this.width > this.height;
  }
  /**
   * Check if image is portrait
   */
  isPortrait() {
    return this.height > this.width;
  }
  /**
   * Check if format is JPEG
   */
  isJPEG() {
    return this.format.toLowerCase() === "jpeg" || this.format.toLowerCase() === "jpg";
  }
  /**
   * Check if format is PNG
   */
  isPNG() {
    return this.format.toLowerCase() === "png";
  }
  /**
   * Check if format is WEBP
   */
  isWEBP() {
    return this.format.toLowerCase() === "webp";
  }
  /**
   * Get aspect ratio
   */
  getAspectRatio() {
    return this.width / this.height;
  }
  /**
   * Get megapixel count
   */
  getMegapixels() {
    return this.width * this.height / 1e6;
  }
  /**
   * Generate filename for storage
   */
  generateFilename(prefix = "img") {
    const timestamp = Date.now();
    const ext = this.getExtension();
    return `${prefix}-${timestamp}.${ext}`;
  }
  /**
   * Get file extension
   */
  getExtension() {
    const formatMap2 = {
      jpeg: "jpg",
      jpg: "jpg",
      png: "png",
      webp: "webp",
      gif: "gif"
    };
    return formatMap2[this.format.toLowerCase()] || this.format;
  }
  /**
   * Get MIME type
   */
  getMimeType() {
    const mimeMap = {
      jpeg: "image/jpeg",
      jpg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      gif: "image/gif"
    };
    return mimeMap[this.format.toLowerCase()] || "image/jpeg";
  }
  /**
   * Convert to DTO for API responses
   */
  toDTO() {
    return {
      size: this.size,
      width: this.width,
      height: this.height,
      format: this.format,
      sizeInKB: Math.round(this.getSizeInKB() * 100) / 100,
      sizeInMB: Math.round(this.getSizeInMB() * 100) / 100,
      aspectRatio: Math.round(this.getAspectRatio() * 100) / 100,
      megapixels: Math.round(this.getMegapixels() * 100) / 100,
      isSquare: this.isSquare(),
      mimeType: this.getMimeType()
    };
  }
};

// src/recurrence/model/recurrence-pattern.enum.ts
var RecurrencePattern = /* @__PURE__ */ ((RecurrencePattern2) => {
  RecurrencePattern2["DAILY"] = "DAILY";
  RecurrencePattern2["WEEKLY"] = "WEEKLY";
  RecurrencePattern2["MONTHLY"] = "MONTHLY";
  RecurrencePattern2["YEARLY"] = "YEARLY";
  RecurrencePattern2["CUSTOM"] = "CUSTOM";
  return RecurrencePattern2;
})(RecurrencePattern || {});

// src/recurrence/model/recurrence.entity.ts
var Recurrence = class extends Entity {
  constructor(props, mode = "valid") {
    super(props, mode);
    if (mode === "valid") {
      this.validate();
    }
  }
  /**
   * Validate recurrence properties
   */
  validate() {
    if (!this.props.taskId || this.props.taskId.trim() === "") {
      throw new Error("Recurrence must have a valid taskId");
    }
    if (!this.props.pattern) {
      throw new Error("Recurrence must have a pattern");
    }
    if (this.props.interval < 1) {
      throw new Error("Interval must be at least 1");
    }
    if (this.props.interval > 365) {
      throw new Error("Interval cannot exceed 365");
    }
    if (this.props.pattern === "WEEKLY" /* WEEKLY */) {
      if (!this.props.daysOfWeek || this.props.daysOfWeek.length === 0) {
        throw new Error("WEEKLY pattern must specify daysOfWeek");
      }
      if (this.props.daysOfWeek.some((d) => d < 0 || d > 6)) {
        throw new Error("daysOfWeek must be between 0 and 6");
      }
    }
    if (this.props.pattern === "MONTHLY" /* MONTHLY */) {
      if (!this.props.dayOfMonth) {
        throw new Error("MONTHLY pattern must specify dayOfMonth");
      }
      if (this.props.dayOfMonth < 1 || this.props.dayOfMonth > 31) {
        throw new Error("dayOfMonth must be between 1 and 31");
      }
    }
    if (this.props.endDate && this.props.endDate < /* @__PURE__ */ new Date()) {
      throw new Error("endDate must be in the future");
    }
  }
  // ===== Getters =====
  get taskId() {
    return this.props.taskId;
  }
  get pattern() {
    return this.props.pattern;
  }
  get interval() {
    return this.props.interval;
  }
  get daysOfWeek() {
    return this.props.daysOfWeek;
  }
  get dayOfMonth() {
    return this.props.dayOfMonth;
  }
  get endDate() {
    return this.props.endDate;
  }
  // ===== Business Methods =====
  /**
   * Check if recurrence is still active
   */
  isActive() {
    if (!this.props.endDate) {
      return true;
    }
    return /* @__PURE__ */ new Date() < this.props.endDate;
  }
  /**
   * Check if recurrence has ended
   */
  hasEnded() {
    return !this.isActive();
  }
  /**
   * Check if pattern is daily
   */
  isDaily() {
    return this.props.pattern === "DAILY" /* DAILY */;
  }
  /**
   * Check if pattern is weekly
   */
  isWeekly() {
    return this.props.pattern === "WEEKLY" /* WEEKLY */;
  }
  /**
   * Check if pattern is monthly
   */
  isMonthly() {
    return this.props.pattern === "MONTHLY" /* MONTHLY */;
  }
  /**
   * Check if pattern is yearly
   */
  isYearly() {
    return this.props.pattern === "YEARLY" /* YEARLY */;
  }
  /**
   * Calculate next occurrence from a given date
   */
  getNextOccurrence(fromDate = /* @__PURE__ */ new Date()) {
    if (this.hasEnded()) {
      return null;
    }
    let nextDate = new Date(fromDate);
    switch (this.props.pattern) {
      case "DAILY" /* DAILY */:
        nextDate.setDate(nextDate.getDate() + this.props.interval);
        break;
      case "WEEKLY" /* WEEKLY */:
        nextDate = this.getNextWeeklyOccurrence(nextDate);
        break;
      case "MONTHLY" /* MONTHLY */:
        nextDate = this.getNextMonthlyOccurrence(nextDate);
        break;
      case "YEARLY" /* YEARLY */:
        nextDate.setFullYear(nextDate.getFullYear() + this.props.interval);
        break;
      default:
        return null;
    }
    if (this.props.endDate && nextDate > this.props.endDate) {
      return null;
    }
    return nextDate;
  }
  /**
   * Get multiple next occurrences
   */
  getNextOccurrences(count, fromDate = /* @__PURE__ */ new Date()) {
    const occurrences = [];
    let currentDate = fromDate;
    for (let i = 0; i < count; i++) {
      const next = this.getNextOccurrence(currentDate);
      if (!next) break;
      occurrences.push(next);
      currentDate = next;
    }
    return occurrences;
  }
  /**
   * Calculate next weekly occurrence
   */
  getNextWeeklyOccurrence(fromDate) {
    if (!this.props.daysOfWeek || this.props.daysOfWeek.length === 0) {
      const next2 = new Date(fromDate);
      next2.setDate(next2.getDate() + 7 * this.props.interval);
      return next2;
    }
    const currentDay = fromDate.getDay();
    const days = this.props.daysOfWeek.sort((a, b) => a - b);
    for (const day of days) {
      const daysUntilDay = (day - currentDay + 7) % 7 || 7;
      const next2 = new Date(fromDate);
      next2.setDate(next2.getDate() + daysUntilDay);
      if (daysUntilDay > 0) {
        return next2;
      }
    }
    const next = new Date(fromDate);
    next.setDate(next.getDate() + 7 * this.props.interval);
    return this.getNextWeeklyOccurrence(next);
  }
  /**
   * Calculate next monthly occurrence
   */
  getNextMonthlyOccurrence(fromDate) {
    if (!this.props.dayOfMonth) {
      const next2 = new Date(fromDate);
      next2.setMonth(next2.getMonth() + this.props.interval);
      return next2;
    }
    const next = new Date(fromDate);
    next.setMonth(next.getMonth() + this.props.interval);
    next.setDate(Math.min(this.props.dayOfMonth, this.getDaysInMonth(next)));
    return next;
  }
  /**
   * Get number of days in a month
   */
  getDaysInMonth(date5) {
    return new Date(date5.getFullYear(), date5.getMonth() + 1, 0).getDate();
  }
  /**
   * Get human-readable description
   */
  getDescription() {
    const pattern = this.props.pattern.toLowerCase();
    const interval = this.props.interval > 1 ? `every ${this.props.interval} ` : "";
    switch (this.props.pattern) {
      case "DAILY" /* DAILY */:
        return `${interval}day${this.props.interval > 1 ? "s" : ""}`;
      case "WEEKLY" /* WEEKLY */:
        if (this.props.daysOfWeek && this.props.daysOfWeek.length > 0) {
          const days = this.props.daysOfWeek.map((d) => {
            const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            return dayNames[d];
          }).join(", ");
          return `${interval}week on ${days}`;
        }
        return `${interval}week${this.props.interval > 1 ? "s" : ""}`;
      case "MONTHLY" /* MONTHLY */:
        return `${interval}month on day ${this.props.dayOfMonth}`;
      case "YEARLY" /* YEARLY */:
        return `${interval}year${this.props.interval > 1 ? "s" : ""}`;
      default:
        return "Custom recurrence";
    }
  }
};

// src/recurrence/usecase/create-recurrence.usecase.ts
var CreateRecurrenceUseCase = class {
  constructor(recurrenceRepo) {
    this.recurrenceRepo = recurrenceRepo;
  }
  async execute(input) {
    return await this.recurrenceRepo.create(input);
  }
};

// src/recurrence/usecase/get-next-occurrence.usecase.ts
var GetNextOccurrenceUseCase = class {
  constructor(recurrenceRepo) {
    this.recurrenceRepo = recurrenceRepo;
  }
  async execute(input) {
    const recurrence = await this.recurrenceRepo.findByTaskId(input.taskId);
    if (!recurrence) {
      return null;
    }
    return recurrence.getNextOccurrence(input.fromDate);
  }
};

// src/billing/model/subscription-enums.ts
var SubscriptionPlan = /* @__PURE__ */ ((SubscriptionPlan2) => {
  SubscriptionPlan2["FREE"] = "FREE";
  SubscriptionPlan2["PRO"] = "PRO";
  SubscriptionPlan2["TEAM"] = "TEAM";
  SubscriptionPlan2["ENTERPRISE"] = "ENTERPRISE";
  return SubscriptionPlan2;
})(SubscriptionPlan || {});
var SubscriptionStatus = /* @__PURE__ */ ((SubscriptionStatus2) => {
  SubscriptionStatus2["ACTIVE"] = "ACTIVE";
  SubscriptionStatus2["CANCELED"] = "CANCELED";
  SubscriptionStatus2["INCOMPLETE"] = "INCOMPLETE";
  SubscriptionStatus2["INCOMPLETE_EXPIRED"] = "INCOMPLETE_EXPIRED";
  SubscriptionStatus2["PAST_DUE"] = "PAST_DUE";
  SubscriptionStatus2["TRIALING"] = "TRIALING";
  SubscriptionStatus2["UNPAID"] = "UNPAID";
  return SubscriptionStatus2;
})(SubscriptionStatus || {});

// src/billing/model/subscription.entity.ts
var Subscription = class extends Entity {
  constructor(props, mode = "valid") {
    super(props, mode);
    if (mode === "valid") {
      this.validate();
    }
  }
  /**
   * Validate subscription properties
   */
  validate() {
    if (!this.props.userId || this.props.userId.trim() === "") {
      throw new Error("Subscription must have a valid userId");
    }
    if (!this.props.plan) {
      throw new Error("Subscription must have a plan");
    }
    if (!this.props.status) {
      throw new Error("Subscription must have a status");
    }
    if (this.props.status === "ACTIVE" /* ACTIVE */) {
      if (!this.props.stripeSubscriptionId) {
        throw new Error("Active subscription must have stripeSubscriptionId");
      }
    }
  }
  // ===== Getters =====
  get userId() {
    return this.props.userId;
  }
  get plan() {
    return this.props.plan;
  }
  get status() {
    return this.props.status;
  }
  get stripeCustomerId() {
    return this.props.stripeCustomerId;
  }
  get stripeSubscriptionId() {
    return this.props.stripeSubscriptionId;
  }
  get stripePriceId() {
    return this.props.stripePriceId;
  }
  get stripeCurrentPeriodEnd() {
    return this.props.stripeCurrentPeriodEnd;
  }
  // ===== Business Methods =====
  /**
   * Check if subscription is active
   */
  isActive() {
    return this.props.status === "ACTIVE" /* ACTIVE */;
  }
  /**
   * Check if subscription is cancelled
   */
  isCancelled() {
    return this.props.status === "CANCELED" /* CANCELED */;
  }
  /**
   * Check if subscription is past due
   */
  isPastDue() {
    return this.props.status === "PAST_DUE" /* PAST_DUE */;
  }
  /**
   * Check if subscription is on trial
   */
  isTrial() {
    return this.props.status === "TRIALING" /* TRIALING */;
  }
  /**
   * Check if plan is free
   */
  isFree() {
    return this.props.plan === "FREE" /* FREE */;
  }
  /**
   * Check if plan is paid (PRO, TEAM, or ENTERPRISE)
   */
  isPaid() {
    return ["PRO" /* PRO */, "TEAM" /* TEAM */, "ENTERPRISE" /* ENTERPRISE */].includes(
      this.props.plan
    );
  }
  /**
   * Check if user can upgrade to a specific plan
   */
  canUpgradeTo(targetPlan) {
    const planHierarchy = {
      ["FREE" /* FREE */]: 0,
      ["PRO" /* PRO */]: 1,
      ["TEAM" /* TEAM */]: 2,
      ["ENTERPRISE" /* ENTERPRISE */]: 3
    };
    return planHierarchy[targetPlan] > planHierarchy[this.props.plan];
  }
  /**
   * Check if user can downgrade to a specific plan
   */
  canDowngradeTo(targetPlan) {
    const planHierarchy = {
      ["FREE" /* FREE */]: 0,
      ["PRO" /* PRO */]: 1,
      ["TEAM" /* TEAM */]: 2,
      ["ENTERPRISE" /* ENTERPRISE */]: 3
    };
    return planHierarchy[targetPlan] < planHierarchy[this.props.plan];
  }
  /**
   * Get plan level
   */
  getPlanLevel() {
    const planHierarchy = {
      ["FREE" /* FREE */]: 0,
      ["PRO" /* PRO */]: 1,
      ["TEAM" /* TEAM */]: 2,
      ["ENTERPRISE" /* ENTERPRISE */]: 3
    };
    return planHierarchy[this.props.plan];
  }
  /**
   * Check if subscription has access to team features
   */
  hasTeamFeatures() {
    return this.getPlanLevel() >= 2;
  }
  /**
   * Check if subscription has access to enterprise features
   */
  hasEnterpriseFeatures() {
    return this.getPlanLevel() >= 3;
  }
  /**
   * Get days remaining in current billing period
   */
  getDaysRemainingInPeriod() {
    if (!this.props.stripeCurrentPeriodEnd) {
      return null;
    }
    const now = /* @__PURE__ */ new Date();
    const periodEnd = new Date(this.props.stripeCurrentPeriodEnd);
    const diffMs = periodEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1e3 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }
  /**
   * Check if subscription is in trial period
   */
  isInTrialPeriod() {
    return this.isTrial() && this.getDaysRemainingInPeriod() !== null;
  }
};

// src/billing/usecase/get-user-subscription.usecase.ts
var GetUserSubscriptionUseCase = class {
  constructor(subscriptionRepo) {
    this.subscriptionRepo = subscriptionRepo;
  }
  async execute(input) {
    return await this.subscriptionRepo.findByUserId(input.userId);
  }
};

// src/billing/usecase/upgrade-plan.usecase.ts
var UpgradePlanUseCase = class {
  constructor(subscriptionRepo) {
    this.subscriptionRepo = subscriptionRepo;
  }
  async execute(input) {
    const subscription = await this.subscriptionRepo.findById(input.subscriptionId);
    if (!subscription) {
      throw new Error("Subscription not found");
    }
    if (!subscription.canUpgradeTo(input.newPlan)) {
      throw new Error(`Cannot upgrade from ${subscription.plan} to ${input.newPlan}`);
    }
    return await this.subscriptionRepo.update(input.subscriptionId, {
      plan: input.newPlan,
      stripePriceId: input.stripePriceId
    });
  }
};

// src/auth/model/session.entity.ts
var Session = class extends Entity {
  constructor(props, mode = "valid") {
    super(props, mode);
    if (mode === "valid") {
      this.validate();
    }
  }
  validate() {
    if (!this.props.sessionToken || this.props.sessionToken.trim() === "") {
      throw new Error("Session must have a valid sessionToken");
    }
    if (!this.props.userId || this.props.userId.trim() === "") {
      throw new Error("Session must have a valid userId");
    }
    if (!this.props.expires) {
      throw new Error("Session must have an expiry date");
    }
  }
  // ===== Getters =====
  get sessionToken() {
    return this.props.sessionToken;
  }
  get userId() {
    return this.props.userId;
  }
  get expires() {
    return this.props.expires;
  }
  // ===== Business Methods =====
  /**
   * Check if session is expired
   */
  isExpired() {
    return /* @__PURE__ */ new Date() > this.props.expires;
  }
  /**
   * Check if session is valid (not expired)
   */
  isValid() {
    return !this.isExpired();
  }
  /**
   * Get days until expiry
   */
  getDaysUntilExpiry() {
    const now = /* @__PURE__ */ new Date();
    const diffMs = this.props.expires.getTime() - now.getTime();
    return Math.ceil(diffMs / (1e3 * 60 * 60 * 24));
  }
};

// src/auth/model/account.entity.ts
var Account = class extends Entity {
  constructor(props, mode = "valid") {
    super(props, mode);
    if (mode === "valid") {
      this.validate();
    }
  }
  validate() {
    if (!this.props.userId || this.props.userId.trim() === "") {
      throw new Error("Account must have a valid userId");
    }
    if (!this.props.provider || this.props.provider.trim() === "") {
      throw new Error("Account must have a provider");
    }
    if (!this.props.providerAccountId || this.props.providerAccountId.trim() === "") {
      throw new Error("Account must have a providerAccountId");
    }
  }
  // ===== Getters =====
  get userId() {
    return this.props.userId;
  }
  get provider() {
    return this.props.provider;
  }
  get providerAccountId() {
    return this.props.providerAccountId;
  }
  get access_token() {
    return this.props.access_token;
  }
  get refresh_token() {
    return this.props.refresh_token;
  }
  get expires_at() {
    return this.props.expires_at;
  }
  // ===== Business Methods =====
  /**
   * Check if OAuth token is expired
   */
  isExpired() {
    if (!this.props.expires_at) {
      return false;
    }
    return Date.now() > this.props.expires_at * 1e3;
  }
  /**
   * Check if account has refresh token
   */
  hasRefreshToken() {
    return !!this.props.refresh_token;
  }
};

// src/admin/model/admin-user.entity.ts
var AdminUser = class extends Entity {
  constructor(props, mode = "valid") {
    super(props, mode);
    if (mode === "valid") {
      this.validate();
    }
  }
  validate() {
    if (!this.props.email || this.props.email.trim() === "") {
      throw new Error("AdminUser must have a valid email");
    }
    if (!this.props.hashedPassword || this.props.hashedPassword.trim() === "") {
      throw new Error("AdminUser must have a hashedPassword");
    }
    if (!this.props.name || this.props.name.trim() === "") {
      throw new Error("AdminUser must have a name");
    }
  }
  // ===== Getters =====
  get email() {
    return this.props.email;
  }
  get hashedPassword() {
    return this.props.hashedPassword;
  }
  get name() {
    return this.props.name;
  }
  get role() {
    return this.props.role;
  }
  // ===== Business Methods =====
  /**
   * Check if user is super admin
   */
  isSuperAdmin() {
    return this.props.role === "superadmin";
  }
  /**
   * Check if user has specific role
   */
  hasRole(role) {
    return this.props.role === role;
  }
};

// src/integrations/model/integration-provider.enum.ts
var IntegrationProvider = /* @__PURE__ */ ((IntegrationProvider2) => {
  IntegrationProvider2["GOOGLE_CALENDAR"] = "GOOGLE_CALENDAR";
  IntegrationProvider2["GOOGLE_TASKS"] = "GOOGLE_TASKS";
  IntegrationProvider2["SLACK"] = "SLACK";
  IntegrationProvider2["GITHUB"] = "GITHUB";
  IntegrationProvider2["MICROSOFT_TEAMS"] = "MICROSOFT_TEAMS";
  IntegrationProvider2["NOTION"] = "NOTION";
  IntegrationProvider2["ZAPIER"] = "ZAPIER";
  return IntegrationProvider2;
})(IntegrationProvider || {});

// src/integrations/model/user-integration.entity.ts
var UserIntegration = class extends Entity {
  constructor(props, mode = "valid") {
    super(props, mode);
    if (mode === "valid") {
      this.validate();
    }
  }
  validate() {
    if (!this.props.userId || this.props.userId.trim() === "") {
      throw new Error("UserIntegration must have a valid userId");
    }
    if (!this.props.provider) {
      throw new Error("UserIntegration must have a provider");
    }
  }
  // ===== Getters =====
  get userId() {
    return this.props.userId;
  }
  get provider() {
    return this.props.provider;
  }
  get accessToken() {
    return this.props.accessToken;
  }
  get refreshToken() {
    return this.props.refreshToken;
  }
  get expiresAt() {
    return this.props.expiresAt;
  }
  get isActive() {
    return this.props.isActive;
  }
  get lastSyncAt() {
    return this.props.lastSyncAt;
  }
  get settings() {
    return this.props.settings;
  }
  // ===== Business Methods =====
  /**
   * Check if integration is active and connected
   */
  isConnected() {
    return this.props.isActive && !!this.props.accessToken;
  }
  /**
   * Check if access token is expired
   */
  isExpired() {
    if (!this.props.expiresAt) {
      return false;
    }
    return /* @__PURE__ */ new Date() > this.props.expiresAt;
  }
  /**
   * Check if token will expire soon (within 1 hour)
   */
  willExpireSoon() {
    if (!this.props.expiresAt) {
      return false;
    }
    const oneHourFromNow = /* @__PURE__ */ new Date();
    oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);
    return this.props.expiresAt < oneHourFromNow;
  }
  /**
   * Check if integration needs sync (no sync in last hour)
   */
  needsSync() {
    if (!this.props.lastSyncAt) {
      return true;
    }
    const oneHourAgo = /* @__PURE__ */ new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    return this.props.lastSyncAt < oneHourAgo;
  }
  /**
   * Check if sync is recent (within last hour)
   */
  hasRecentSync() {
    return !this.needsSync();
  }
  /**
   * Get time since last sync in minutes
   */
  getMinutesSinceLastSync() {
    if (!this.props.lastSyncAt) {
      return null;
    }
    const now = /* @__PURE__ */ new Date();
    const diffMs = now.getTime() - this.props.lastSyncAt.getTime();
    return Math.floor(diffMs / (1e3 * 60));
  }
  /**
   * Update sync timestamp
   */
  markAsSynced() {
    return this.clone({
      lastSyncAt: /* @__PURE__ */ new Date()
    });
  }
  /**
   * Deactivate integration
   */
  deactivate() {
    return this.clone({
      isActive: false
    });
  }
  /**
   * Activate integration
   */
  activate() {
    return this.clone({
      isActive: true
    });
  }
  /**
   * Update settings
   */
  updateSettings(settings) {
    return this.clone({
      settings: { ...this.props.settings, ...settings }
    });
  }
  /**
   * Get a specific setting value
   */
  getSetting(key) {
    return this.props.settings?.[key];
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AIProfile,
  AcceptInvitationUseCase,
  Account,
  Achievement,
  ActionItem,
  Activity,
  ActivityType,
  AddMemberToWorkspaceUseCase,
  AddMentionUseCase,
  AdminUser,
  AmbientTrack,
  AnalyzeTranscriptUseCase,
  ArchiveProjectUseCase,
  ArchiveWorkspaceUseCase,
  AskQuestionUseCase,
  AssignTagToTaskUseCase,
  Attachment,
  BlogComment,
  BlogPost,
  COMMENT_LIMITS,
  CalculateFocusScoreUseCase,
  ChangeUserName,
  ChangelogEntry,
  ChatConversation,
  ChatMessage,
  Comment,
  CompleteTaskUseCase,
  ContactSubmission,
  CountUnreadNotificationsUseCase,
  CreateAttachmentUseCase,
  CreateAuditLogUseCase,
  CreateCommentUseCase,
  CreateMeetingUseCase,
  CreateNoteUseCase,
  CreateNotificationUseCase,
  CreateProjectUseCase,
  CreateRecurrenceUseCase,
  CreateTagUseCase,
  CreateTaskUseCase,
  CreateWorkflowUseCase,
  CreateWorkspaceUseCase,
  CustomField,
  CustomFieldType,
  CustomFieldValue,
  DEFAULT_POMODORO_SETTINGS,
  DailyMetrics,
  DeleteAttachmentUseCase,
  DeleteCommentUseCase,
  DeleteNoteUseCase,
  DeleteNotificationUseCase,
  DeleteProjectUseCase,
  DeleteWorkflowUseCase,
  Email,
  Entity,
  ExecuteSearchUseCase,
  ExtractActionItemsUseCase,
  FAQ,
  FILE_LIMITS,
  FindAllNotesUseCase,
  FindNoteUseCase,
  FocusMode,
  FocusPreferences,
  FocusStats,
  GenerateSummaryUseCase,
  GenerateWeeklyReportUseCase,
  GetAttachmentByIdUseCase,
  GetAttachmentsByTaskUseCase,
  GetAttachmentsByUserUseCase,
  GetCommentsByTaskUseCase,
  GetCommentsByUserUseCase,
  GetDailyMetricsUseCase,
  GetDeletedProjectsUseCase,
  GetDeletedTasksUseCase,
  GetDeletedWorkspacesUseCase,
  GetFocusStatsUseCase,
  GetMeetingUseCase,
  GetNextOccurrenceUseCase,
  GetNotificationByIdUseCase,
  GetNotificationsByTypeUseCase,
  GetOptimalScheduleUseCase,
  GetRecommendedTracksUseCase,
  GetSuggestionsUseCase,
  GetTaskActivitiesUseCase,
  GetUnreadNotificationsUseCase,
  GetUserPreferencesUseCase,
  GetUserSubscriptionUseCase,
  GetWorkspaceAuditLogsUseCase,
  GetWorkspaceSettingsUseCase,
  Habit,
  HashPassword,
  Id,
  ImageSpecs,
  IntegrationProvider,
  InviteMemberUseCase,
  KBArticle,
  KBCategory,
  KeyDecision,
  KeyResult,
  KeyResultTask,
  LearnFromSessionUseCase,
  ListMeetingsUseCase,
  ListWorkflowsUseCase,
  LogActivityUseCase,
  MEMBER_ROLES,
  MarkAllAsReadUseCase,
  MarkAsReadUseCase,
  MarkAsUnreadUseCase,
  MarkAsUploadedUseCase,
  Meeting,
  MeetingAnalysis,
  MeetingParticipant,
  MeetingTopic,
  MemberRole,
  MockAIService,
  NOTIFICATION_LIMITS,
  NewsletterSubscriber,
  Note,
  Notification,
  NotificationType,
  Objective,
  PAGINATION_LIMITS,
  PRIORITY_VALUES,
  PROJECT_COLORS,
  PROJECT_LIMITS,
  PROJECT_STATUS,
  PROJECT_STATUS_VALUES,
  PauseTimerUseCase,
  PermanentDeleteProjectUseCase,
  PermanentDeleteTaskUseCase,
  PermanentDeleteWorkspaceUseCase,
  PersonName,
  PredictTaskDurationUseCase,
  ProcessedImage,
  ProductivityReport,
  Project,
  RecordTrackUsageUseCase,
  Recurrence,
  RecurrencePattern,
  RegisterUser,
  RemoveMemberFromWorkspaceUseCase,
  RemoveMentionUseCase,
  RemoveTagFromTaskUseCase,
  RequiredString,
  ResourceType,
  RestoreProjectUseCase,
  RestoreTaskUseCase,
  RestoreWorkspaceUseCase,
  ResumeTimerUseCase,
  RoadmapItem,
  RoadmapVote,
  SearchQuery,
  SearchResult,
  SearchResults,
  Session,
  SoftDeleteProjectUseCase,
  SoftDeleteTaskUseCase,
  SoftDeleteWorkspaceUseCase,
  StartTimerUseCase,
  StopTimerUseCase,
  Subscription,
  SubscriptionPlan,
  SubscriptionStatus,
  SwitchTaskUseCase,
  TAG_COLORS,
  TAG_LIMITS,
  TASK_LIMITS,
  TASK_PRIORITIES,
  TASK_STATUS,
  TASK_STATUS_VALUES,
  TIMER_LIMITS,
  TIMER_MODES,
  TIMER_MODE_VALUES,
  Tag,
  Task,
  TaskDependency,
  TaskTemplate,
  TimeSession,
  ToggleFavoriteTrackUseCase,
  USER_LIMITS,
  UpdateCommentUseCase,
  UpdateDailyMetricsUseCase,
  UpdateMeetingAnalysisUseCase,
  UpdateNoteUseCase,
  UpdateProjectUseCase,
  UpdateTagUseCase,
  UpdateUserPreferencesUseCase,
  UpdateWorkflowUseCase,
  UpdateWorkspaceSettingsUseCase,
  UpgradePlanUseCase,
  User,
  UserAchievement,
  UserByEmail,
  UserIntegration,
  UserLogin,
  WORKSPACE_COLORS,
  WORKSPACE_LIMITS,
  WORKSPACE_TYPES,
  Workflow,
  Workspace,
  WorkspaceAuditLog,
  WorkspaceInvitation,
  WorkspaceMember,
  WorkspaceSettings,
  acceptInvitationSchema,
  addAlpha,
  addDays,
  addHours,
  addMinutes,
  aiService,
  archiveProjectSchema,
  assignTagsSchema,
  bulkUpdateTasksSchema,
  calculateAverageCompletionTime,
  calculateAverageTime,
  calculateBurndownRate,
  calculateCompletionRate,
  calculateEfficiency,
  calculateEstimatedCompletion,
  calculateFocusScore,
  calculatePercentile,
  calculateProductivityScore,
  calculateProgress,
  calculateProjectHealth,
  calculateStreak,
  calculateTimeUtilization,
  calculateTotalTimeWorked,
  calculateVelocity,
  calculateVoteWeight,
  calculateWeightedAverage,
  camelToTitle,
  capitalize,
  capitalizeWords,
  categorizeTasksByAvailability,
  changePasswordSchema,
  commentBaseSchema,
  commentFilterSchema,
  countWords,
  createCommentSchema,
  createProjectSchema,
  createTagSchema,
  createTaskSchema,
  createWorkspaceSchema,
  darkenColor,
  duplicateProjectSchema,
  endOfDay,
  endOfWeek,
  formatDate,
  formatDateShort,
  formatDuration,
  formatDurationFromSeconds,
  formatFileSize,
  formatNumber,
  formatRelativeTime,
  formatScheduledDateTime,
  formatTimeOfDay,
  formatTimerDisplay,
  formatTimerDisplayExtended,
  generateId,
  generatePalette,
  generateRandomString,
  generateSlug,
  generateUuid,
  getColorWithOpacity,
  getContrastColor,
  getCurrentTime,
  getDaysDiff,
  getInitials,
  getPriorityColor,
  getPriorityConfig,
  getPriorityLabel,
  getTaskStatusColor,
  getTaskStatusConfig,
  getTaskStatusLabel,
  getTimerModeColor,
  getTimerModeConfig,
  getTimerModeDefaultDuration,
  getTimerModeLabel,
  getWorkableTasks,
  hexToRgb,
  hexToRgba,
  highlightSearchTerms,
  hoursToMinutes,
  inviteMemberSchema,
  isAfter,
  isAllowedFileType,
  isAlphanumeric,
  isBefore,
  isDarkColor,
  isDueToday,
  isFuture,
  isImageFile,
  isLightColor,
  isOverdue,
  isPast,
  isScheduledForToday,
  isTaskAvailable,
  isTaskCompleted,
  isTaskInProgress,
  isToday,
  isValidEmail,
  isValidUrl,
  isValidUuid,
  isWorkingHours,
  lightenColor,
  loginUserSchema,
  minutesToHours,
  minutesToSeconds,
  mixColors,
  normalizeWhitespace,
  parseDuration,
  pluralize,
  projectBaseSchema,
  projectFilterSchema,
  randomColor,
  registerUserSchema,
  reorderTasksSchema,
  resetPasswordRequestSchema,
  resetPasswordSchema,
  rgbToHex,
  sanitizeHtml,
  secondsToMinutes,
  shouldTakeLongBreak,
  snakeToTitle,
  startOfDay,
  startOfToday,
  startOfWeek,
  stripHtmlTags,
  tagBaseSchema,
  tagFilterSchema,
  taskBaseSchema,
  taskDatesSchema,
  taskFilterSchema,
  transferOwnershipSchema,
  truncate,
  updateCommentSchema,
  updateMemberRoleSchema,
  updateProjectSchema,
  updateTagSchema,
  updateTaskSchema,
  updateUserProfileSchema,
  updateWorkspaceSchema,
  userPreferencesSchema,
  usernameValidationSchema,
  workspaceBaseSchema,
  workspaceFilterSchema,
  workspaceSettingsSchema
});
//# sourceMappingURL=index.js.map