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
  AddMemberToWorkspaceUseCase: () => AddMemberToWorkspaceUseCase,
  ArchiveProjectUseCase: () => ArchiveProjectUseCase,
  ArchiveWorkspaceUseCase: () => ArchiveWorkspaceUseCase,
  AssignTagToTaskUseCase: () => AssignTagToTaskUseCase,
  COMMENT_LIMITS: () => COMMENT_LIMITS,
  CalculateFocusScoreUseCase: () => CalculateFocusScoreUseCase,
  ChangeUserName: () => ChangeUserName,
  CompleteTaskUseCase: () => CompleteTaskUseCase,
  CreateAuditLogUseCase: () => CreateAuditLogUseCase,
  CreateProjectUseCase: () => CreateProjectUseCase,
  CreateTagUseCase: () => CreateTagUseCase,
  CreateTaskUseCase: () => CreateTaskUseCase,
  CreateWorkflowUseCase: () => CreateWorkflowUseCase,
  CreateWorkspaceUseCase: () => CreateWorkspaceUseCase,
  DEFAULT_POMODORO_SETTINGS: () => DEFAULT_POMODORO_SETTINGS,
  DailyMetrics: () => DailyMetrics,
  DeleteProjectUseCase: () => DeleteProjectUseCase,
  DeleteWorkflowUseCase: () => DeleteWorkflowUseCase,
  Email: () => Email,
  Entity: () => Entity,
  FILE_LIMITS: () => FILE_LIMITS,
  GenerateWeeklyReportUseCase: () => GenerateWeeklyReportUseCase,
  GetDailyMetricsUseCase: () => GetDailyMetricsUseCase,
  GetDeletedProjectsUseCase: () => GetDeletedProjectsUseCase,
  GetDeletedTasksUseCase: () => GetDeletedTasksUseCase,
  GetDeletedWorkspacesUseCase: () => GetDeletedWorkspacesUseCase,
  GetOptimalScheduleUseCase: () => GetOptimalScheduleUseCase,
  GetWorkspaceAuditLogsUseCase: () => GetWorkspaceAuditLogsUseCase,
  GetWorkspaceSettingsUseCase: () => GetWorkspaceSettingsUseCase,
  Habit: () => Habit,
  HashPassword: () => HashPassword,
  Id: () => Id,
  InviteMemberUseCase: () => InviteMemberUseCase,
  LearnFromSessionUseCase: () => LearnFromSessionUseCase,
  ListWorkflowsUseCase: () => ListWorkflowsUseCase,
  MEMBER_ROLES: () => MEMBER_ROLES,
  MockAIService: () => MockAIService,
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
  ProductivityReport: () => ProductivityReport,
  Project: () => Project,
  RegisterUser: () => RegisterUser,
  RemoveMemberFromWorkspaceUseCase: () => RemoveMemberFromWorkspaceUseCase,
  RemoveTagFromTaskUseCase: () => RemoveTagFromTaskUseCase,
  RequiredString: () => RequiredString,
  RestoreProjectUseCase: () => RestoreProjectUseCase,
  RestoreTaskUseCase: () => RestoreTaskUseCase,
  RestoreWorkspaceUseCase: () => RestoreWorkspaceUseCase,
  ResumeTimerUseCase: () => ResumeTimerUseCase,
  SoftDeleteProjectUseCase: () => SoftDeleteProjectUseCase,
  SoftDeleteTaskUseCase: () => SoftDeleteTaskUseCase,
  SoftDeleteWorkspaceUseCase: () => SoftDeleteWorkspaceUseCase,
  StartTimerUseCase: () => StartTimerUseCase,
  StopTimerUseCase: () => StopTimerUseCase,
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
  TimeSession: () => TimeSession,
  USER_LIMITS: () => USER_LIMITS,
  UpdateDailyMetricsUseCase: () => UpdateDailyMetricsUseCase,
  UpdateProjectUseCase: () => UpdateProjectUseCase,
  UpdateTagUseCase: () => UpdateTagUseCase,
  UpdateWorkflowUseCase: () => UpdateWorkflowUseCase,
  UpdateWorkspaceSettingsUseCase: () => UpdateWorkspaceSettingsUseCase,
  User: () => User,
  UserByEmail: () => UserByEmail,
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
  static create(email) {
    const finalEmail = email?.trim?.().toLowerCase();
    this.validate(finalEmail);
    return new _Email(finalEmail);
  }
  static validate(email) {
    if (!email || typeof email !== "string") {
      throw new Error("O email n\xE3o pode estar vazio");
    }
    if (email.length > 254) {
      throw new Error("O email deve ter no m\xE1ximo 254 caracteres");
    }
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-\u00A0-\uFFFF]+@[a-zA-Z0-9\u00A0-\uFFFF](?:[a-zA-Z0-9\u00A0-\uFFFF-]{0,61}[a-zA-Z0-9\u00A0-\uFFFF])?(?:\.[a-zA-Z0-9\u00A0-\uFFFF](?:[a-zA-Z0-9\u00A0-\uFFFF-]{0,61}[a-zA-Z0-9\u00A0-\uFFFF])?)*$/;
    if (!emailRegex.test(email)) {
      throw new Error("O formato do email \xE9 inv\xE1lido");
    }
    const [localPart, domainPart] = email.split("@");
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

// src/shared/id.vo.ts
var import_uuid = require("uuid");
var Id = class _Id {
  _value;
  constructor(value) {
    this._value = value;
  }
  static create(id) {
    const value = id?.trim().toLowerCase() ?? (0, import_uuid.v4)();
    this.validate(value);
    return new _Id(value);
  }
  static validate(id) {
    if (!(0, import_uuid.validate)(id)) {
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
    if (props.props) {
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
    const id = this.id;
    return this.id === other.id;
  }
  asDraft() {
    return this.clone(this.props, "draft");
  }
  asValid() {
    return this.clone(this.props, "valid");
  }
  clone(newProps, newMode = this.mode) {
    return new this.constructor(
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
  PASSWORD_MIN_LENGTH: 6,
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
  return [
    ...FILE_LIMITS.ALLOWED_IMAGE_TYPES,
    ...FILE_LIMITS.ALLOWED_DOCUMENT_TYPES
  ].includes(mimeType);
}
function isImageFile(mimeType) {
  return FILE_LIMITS.ALLOWED_IMAGE_TYPES.includes(mimeType);
}

// src/shared/utils/date.utils.ts
function formatDate(date, locale = "en-US") {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}
function formatDateShort(date, locale = "en-US") {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
function formatRelativeTime(date, locale = "en-US") {
  const d = typeof date === "string" ? new Date(date) : date;
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
function isToday(date) {
  const d = typeof date === "string" ? new Date(date) : date;
  const today = /* @__PURE__ */ new Date();
  return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
}
function isPast(date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.getTime() < (/* @__PURE__ */ new Date()).getTime();
}
function isFuture(date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.getTime() > (/* @__PURE__ */ new Date()).getTime();
}
function isOverdue(dueDate) {
  if (!dueDate) return false;
  const d = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
  return isPast(d) && !isToday(d);
}
function getDaysDiff(date1, date2) {
  const d1 = typeof date1 === "string" ? new Date(date1) : date1;
  const d2 = typeof date2 === "string" ? new Date(date2) : date2;
  const diffMs = d2.getTime() - d1.getTime();
  return Math.floor(diffMs / (1e3 * 60 * 60 * 24));
}
function startOfDay(date) {
  const d = typeof date === "string" ? new Date(date) : new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfDay(date) {
  const d = typeof date === "string" ? new Date(date) : new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}
function startOfWeek(date) {
  const d = typeof date === "string" ? new Date(date) : new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const startDate = new Date(d.setDate(diff));
  startDate.setHours(0, 0, 0, 0);
  return startDate;
}
function endOfWeek(date) {
  const d = typeof date === "string" ? new Date(date) : new Date(date);
  const day = d.getDay();
  const diff = d.getDate() + (day === 0 ? 0 : 7 - day);
  const endDate = new Date(d.setDate(diff));
  endDate.setHours(23, 59, 59, 999);
  return endDate;
}
function addDays(date, days) {
  const d = typeof date === "string" ? new Date(date) : new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
function addHours(date, hours) {
  const d = typeof date === "string" ? new Date(date) : new Date(date);
  d.setHours(d.getHours() + hours);
  return d;
}
function addMinutes(date, minutes) {
  const d = typeof date === "string" ? new Date(date) : new Date(date);
  d.setMinutes(d.getMinutes() + minutes);
  return d;
}
function startOfToday() {
  return startOfDay(/* @__PURE__ */ new Date());
}
function isBefore(date1, date2) {
  const d1 = typeof date1 === "string" ? new Date(date1) : date1;
  const d2 = typeof date2 === "string" ? new Date(date2) : date2;
  return d1.getTime() < d2.getTime();
}
function isAfter(date1, date2) {
  const d1 = typeof date1 === "string" ? new Date(date1) : date1;
  const d2 = typeof date2 === "string" ? new Date(date2) : date2;
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
function parseDuration(duration) {
  const hourMatch = duration.match(/(\d+)h/);
  const minMatch = duration.match(/(\d+)m/);
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
function formatTimeOfDay(time, use24Hour = false) {
  const [hours, minutes] = time.split(":").map(Number);
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
function isWorkingHours(date = /* @__PURE__ */ new Date(), startHour = 9, endHour = 18) {
  const hour = date.getHours();
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
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
function sanitizeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;"
  };
  return text.replace(/[&<>"'/]/g, (char) => map[char] || char);
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
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}
function rgbToHex(r, g, b) {
  const toHex = (x) => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
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

// src/shared/validation/task.validation.ts
var import_zod = require("zod");
var taskBaseSchema = import_zod.z.object({
  title: import_zod.z.string().min(TASK_LIMITS.TITLE_MIN_LENGTH, "Title is required").max(TASK_LIMITS.TITLE_MAX_LENGTH, `Title must be less than ${TASK_LIMITS.TITLE_MAX_LENGTH} characters`),
  description: import_zod.z.string().max(TASK_LIMITS.DESCRIPTION_MAX_LENGTH, `Description must be less than ${TASK_LIMITS.DESCRIPTION_MAX_LENGTH} characters`).optional(),
  priority: import_zod.z.enum(PRIORITY_VALUES),
  status: import_zod.z.enum(TASK_STATUS_VALUES).optional(),
  dueDate: import_zod.z.string().optional().nullable(),
  startDate: import_zod.z.string().optional().nullable(),
  scheduledDate: import_zod.z.string().optional().nullable(),
  scheduledTime: import_zod.z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:mm format").optional().nullable(),
  isTimeBlocked: import_zod.z.boolean().optional(),
  estimatedMinutes: import_zod.z.union([
    import_zod.z.number().int().min(TASK_LIMITS.MIN_ESTIMATED_MINUTES).max(TASK_LIMITS.MAX_ESTIMATED_MINUTES),
    import_zod.z.nan()
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
  projectId: import_zod.z.string().min(1, "Project is required"),
  parentTaskId: import_zod.z.string().optional().nullable(),
  assigneeId: import_zod.z.string().optional().nullable(),
  tagIds: import_zod.z.array(import_zod.z.string()).max(TASK_LIMITS.MAX_TAGS_PER_TASK).optional()
});
var updateTaskSchema = taskBaseSchema.partial().extend({
  assigneeId: import_zod.z.string().optional().nullable(),
  tagIds: import_zod.z.array(import_zod.z.string()).max(TASK_LIMITS.MAX_TAGS_PER_TASK).optional(),
  completedAt: import_zod.z.string().datetime().optional().nullable()
});
var taskFilterSchema = import_zod.z.object({
  projectId: import_zod.z.string().optional(),
  status: import_zod.z.enum(TASK_STATUS_VALUES).optional(),
  priority: import_zod.z.enum(PRIORITY_VALUES).optional(),
  assigneeId: import_zod.z.string().optional(),
  tagIds: import_zod.z.array(import_zod.z.string()).optional(),
  search: import_zod.z.string().optional(),
  dueDate: import_zod.z.object({
    from: import_zod.z.string().datetime().optional(),
    to: import_zod.z.string().datetime().optional()
  }).optional(),
  isOverdue: import_zod.z.boolean().optional()
});
var bulkUpdateTasksSchema = import_zod.z.object({
  taskIds: import_zod.z.array(import_zod.z.string()).min(1, "At least one task is required"),
  updates: import_zod.z.object({
    status: import_zod.z.enum(TASK_STATUS_VALUES).optional(),
    priority: import_zod.z.enum(PRIORITY_VALUES).optional(),
    assigneeId: import_zod.z.string().optional().nullable(),
    projectId: import_zod.z.string().optional()
  })
});
var reorderTasksSchema = import_zod.z.object({
  taskId: import_zod.z.string(),
  newOrder: import_zod.z.number().int().min(0),
  projectId: import_zod.z.string()
});

// src/shared/validation/project.validation.ts
var import_zod2 = require("zod");
var projectBaseSchema = import_zod2.z.object({
  name: import_zod2.z.string().min(PROJECT_LIMITS.NAME_MIN_LENGTH, "Project name is required").max(PROJECT_LIMITS.NAME_MAX_LENGTH, `Project name must be less than ${PROJECT_LIMITS.NAME_MAX_LENGTH} characters`),
  description: import_zod2.z.string().max(PROJECT_LIMITS.DESCRIPTION_MAX_LENGTH, `Description must be less than ${PROJECT_LIMITS.DESCRIPTION_MAX_LENGTH} characters`).optional(),
  color: import_zod2.z.string().optional(),
  icon: import_zod2.z.string().optional()
});
var createProjectSchema = projectBaseSchema.extend({
  workspaceId: import_zod2.z.string().min(1, "Workspace is required"),
  workflowId: import_zod2.z.string().optional(),
  startDate: import_zod2.z.string().datetime().optional().nullable(),
  endDate: import_zod2.z.string().datetime().optional().nullable()
});
var updateProjectSchema = projectBaseSchema.partial().extend({
  startDate: import_zod2.z.string().datetime().optional().nullable(),
  endDate: import_zod2.z.string().datetime().optional().nullable(),
  isArchived: import_zod2.z.boolean().optional()
});
var projectFilterSchema = import_zod2.z.object({
  workspaceId: import_zod2.z.string().optional(),
  search: import_zod2.z.string().optional(),
  isArchived: import_zod2.z.boolean().optional(),
  color: import_zod2.z.string().optional()
});
var archiveProjectSchema = import_zod2.z.object({
  isArchived: import_zod2.z.boolean()
});
var duplicateProjectSchema = import_zod2.z.object({
  name: import_zod2.z.string().min(PROJECT_LIMITS.NAME_MIN_LENGTH),
  includeTasks: import_zod2.z.boolean().default(false),
  includeMembers: import_zod2.z.boolean().default(false)
});

// src/shared/validation/workspace.validation.ts
var import_zod3 = require("zod");
var WORKSPACE_TYPES = ["PERSONAL", "WORK", "TEAM"];
var MEMBER_ROLES = ["OWNER", "ADMIN", "MEMBER", "VIEWER"];
var workspaceBaseSchema = import_zod3.z.object({
  name: import_zod3.z.string().min(WORKSPACE_LIMITS.NAME_MIN_LENGTH, "Workspace name is required").max(
    WORKSPACE_LIMITS.NAME_MAX_LENGTH,
    `Workspace name must be less than ${WORKSPACE_LIMITS.NAME_MAX_LENGTH} characters`
  ),
  slug: import_zod3.z.string().min(1, "Slug must be at least 1 character").regex(
    /^[a-z0-9-]+$/,
    "Slug must only contain lowercase letters, numbers, and hyphens"
  ).optional(),
  description: import_zod3.z.string().max(
    WORKSPACE_LIMITS.DESCRIPTION_MAX_LENGTH,
    `Description must be less than ${WORKSPACE_LIMITS.DESCRIPTION_MAX_LENGTH} characters`
  ).optional(),
  type: import_zod3.z.enum(WORKSPACE_TYPES),
  color: import_zod3.z.string().optional(),
  icon: import_zod3.z.string().optional()
});
var createWorkspaceSchema = workspaceBaseSchema;
var updateWorkspaceSchema = workspaceBaseSchema.partial();
var workspaceSettingsSchema = import_zod3.z.object({
  defaultTaskPriority: import_zod3.z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  defaultTaskStatus: import_zod3.z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"]).optional(),
  enableNotifications: import_zod3.z.boolean().optional(),
  enableEmailDigest: import_zod3.z.boolean().optional(),
  timezone: import_zod3.z.string().optional()
});
var inviteMemberSchema = import_zod3.z.object({
  email: import_zod3.z.string().email("Invalid email address"),
  role: import_zod3.z.enum(MEMBER_ROLES),
  message: import_zod3.z.string().max(500).optional()
});
var updateMemberRoleSchema = import_zod3.z.object({
  role: import_zod3.z.enum(MEMBER_ROLES)
});
var acceptInvitationSchema = import_zod3.z.object({
  token: import_zod3.z.string().min(1, "Invitation token is required")
});
var transferOwnershipSchema = import_zod3.z.object({
  newOwnerId: import_zod3.z.string().min(1, "New owner is required")
});
var workspaceFilterSchema = import_zod3.z.object({
  type: import_zod3.z.enum(WORKSPACE_TYPES).optional(),
  search: import_zod3.z.string().optional()
});

// src/shared/validation/tag.validation.ts
var import_zod4 = require("zod");
var tagBaseSchema = import_zod4.z.object({
  name: import_zod4.z.string().min(TAG_LIMITS.NAME_MIN_LENGTH, "Tag name is required").max(TAG_LIMITS.NAME_MAX_LENGTH, `Tag name must be less than ${TAG_LIMITS.NAME_MAX_LENGTH} characters`),
  color: import_zod4.z.string().optional()
});
var createTagSchema = tagBaseSchema.extend({
  workspaceId: import_zod4.z.string().min(1, "Workspace is required")
});
var updateTagSchema = tagBaseSchema.partial();
var tagFilterSchema = import_zod4.z.object({
  workspaceId: import_zod4.z.string().optional(),
  search: import_zod4.z.string().optional()
});
var assignTagsSchema = import_zod4.z.object({
  tagIds: import_zod4.z.array(import_zod4.z.string()).max(TAG_LIMITS.NAME_MAX_LENGTH)
});

// src/shared/validation/user.validation.ts
var import_zod5 = require("zod");
var registerUserSchema = import_zod5.z.object({
  name: import_zod5.z.string().min(USER_LIMITS.NAME_MIN_LENGTH, `Name must be at least ${USER_LIMITS.NAME_MIN_LENGTH} characters`).max(USER_LIMITS.NAME_MAX_LENGTH, `Name must be less than ${USER_LIMITS.NAME_MAX_LENGTH} characters`),
  username: import_zod5.z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be less than 20 characters").regex(/^[a-z0-9_-]+$/, "Username can only contain lowercase letters, numbers, hyphens, and underscores"),
  email: import_zod5.z.string().email("Invalid email address"),
  password: import_zod5.z.string().min(USER_LIMITS.PASSWORD_MIN_LENGTH, `Password must be at least ${USER_LIMITS.PASSWORD_MIN_LENGTH} characters`).max(USER_LIMITS.PASSWORD_MAX_LENGTH, `Password must be less than ${USER_LIMITS.PASSWORD_MAX_LENGTH} characters`)
});
var loginUserSchema = import_zod5.z.object({
  email: import_zod5.z.string().email("Invalid email address"),
  password: import_zod5.z.string().min(1, "Password is required")
});
var updateUserProfileSchema = import_zod5.z.object({
  name: import_zod5.z.string().min(USER_LIMITS.NAME_MIN_LENGTH).max(USER_LIMITS.NAME_MAX_LENGTH).optional(),
  bio: import_zod5.z.string().max(USER_LIMITS.BIO_MAX_LENGTH).optional(),
  avatar: import_zod5.z.string().url().optional().nullable(),
  timezone: import_zod5.z.string().optional(),
  language: import_zod5.z.enum(["en", "es", "pt-BR"]).optional()
});
var changePasswordSchema = import_zod5.z.object({
  currentPassword: import_zod5.z.string().min(1, "Current password is required"),
  newPassword: import_zod5.z.string().min(USER_LIMITS.PASSWORD_MIN_LENGTH, `Password must be at least ${USER_LIMITS.PASSWORD_MIN_LENGTH} characters`).max(USER_LIMITS.PASSWORD_MAX_LENGTH)
});
var resetPasswordRequestSchema = import_zod5.z.object({
  email: import_zod5.z.string().email("Invalid email address")
});
var resetPasswordSchema = import_zod5.z.object({
  token: import_zod5.z.string().min(1, "Reset token is required"),
  newPassword: import_zod5.z.string().min(USER_LIMITS.PASSWORD_MIN_LENGTH, `Password must be at least ${USER_LIMITS.PASSWORD_MIN_LENGTH} characters`).max(USER_LIMITS.PASSWORD_MAX_LENGTH)
});
var userPreferencesSchema = import_zod5.z.object({
  theme: import_zod5.z.enum(["light", "dark", "system"]).optional(),
  language: import_zod5.z.enum(["en", "es", "pt-BR"]).optional(),
  timezone: import_zod5.z.string().optional(),
  notifications: import_zod5.z.object({
    email: import_zod5.z.boolean().optional(),
    push: import_zod5.z.boolean().optional(),
    desktop: import_zod5.z.boolean().optional()
  }).optional(),
  pomodoro: import_zod5.z.object({
    workDuration: import_zod5.z.number().int().min(1).max(120).optional(),
    shortBreakDuration: import_zod5.z.number().int().min(1).max(30).optional(),
    longBreakDuration: import_zod5.z.number().int().min(1).max(60).optional(),
    pomodorosUntilLongBreak: import_zod5.z.number().int().min(2).max(10).optional(),
    autoStartBreaks: import_zod5.z.boolean().optional(),
    autoStartPomodoros: import_zod5.z.boolean().optional(),
    soundEnabled: import_zod5.z.boolean().optional()
  }).optional()
});
var usernameValidationSchema = import_zod5.z.object({
  username: import_zod5.z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be less than 20 characters").regex(/^[a-z0-9_-]+$/, "Username can only contain lowercase letters, numbers, hyphens, and underscores")
});

// src/shared/validation/comment.validation.ts
var import_zod6 = require("zod");
var commentBaseSchema = import_zod6.z.object({
  content: import_zod6.z.string().min(COMMENT_LIMITS.CONTENT_MIN_LENGTH, "Comment cannot be empty").max(COMMENT_LIMITS.CONTENT_MAX_LENGTH, `Comment must be less than ${COMMENT_LIMITS.CONTENT_MAX_LENGTH} characters`)
});
var createCommentSchema = commentBaseSchema.extend({
  taskId: import_zod6.z.string().min(1, "Task is required"),
  parentCommentId: import_zod6.z.string().optional().nullable(),
  // For threaded comments
  mentions: import_zod6.z.array(import_zod6.z.string()).optional()
  // User IDs mentioned in comment
});
var updateCommentSchema = commentBaseSchema;
var commentFilterSchema = import_zod6.z.object({
  taskId: import_zod6.z.string().optional(),
  userId: import_zod6.z.string().optional(),
  parentCommentId: import_zod6.z.string().optional().nullable()
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
  constructor(repo, crypto) {
    this.repo = repo;
    this.crypto = crypto;
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
  async execute(email) {
    const user = await this.repo.findByEmail(email?.toLowerCase?.());
    if (!user) throw new Error("Usu\xE1rio n\xE3o encontrado");
    return user.withoutPassword();
  }
};

// src/users/usecase/user-login.usecase.ts
var UserLogin = class {
  constructor(repo, crypto) {
    this.repo = repo;
    this.crypto = crypto;
  }
  async execute(input) {
    const { email, password } = input;
    const withPassword = true;
    const user = await this.repo.findByEmail(email, withPassword);
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
      priority: props.priority ?? "MEDIUM"
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
    const task = await this.taskRepository.findById(id);
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
    const task = await this.taskRepository.findById(id);
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
    return tasks.map((t) => t.props);
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
    let slug;
    if (username) {
      slug = `${username}/${workspaceNameSlug}`;
    } else {
      slug = workspaceNameSlug;
    }
    let finalSlug = slug;
    let counter = 1;
    while (await this.workspaceRepository.findBySlug(finalSlug)) {
      if (username) {
        finalSlug = `${username}/${workspaceNameSlug}-${counter}`;
      } else {
        finalSlug = `${workspaceNameSlug}-${counter}`;
      }
      counter++;
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
  async execute(workspaceId, userId, role = "MEMBER") {
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
    const deletedWorkspace = workspace.softDelete();
    await this.workspaceRepository.update(deletedWorkspace);
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
    const restoredWorkspace = workspace.restore();
    await this.workspaceRepository.update(restoredWorkspace);
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
      role: props.role ?? "MEMBER",
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
var import_uuid2 = require("uuid");
var InviteMemberUseCase = class {
  constructor(workspaceRepository, invitationRepository, hashService) {
    this.workspaceRepository = workspaceRepository;
    this.invitationRepository = invitationRepository;
    this.hashService = hashService;
  }
  async execute(workspaceId, email, role, invitedById) {
    const workspace = await this.workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new Error("Workspace not found");
    }
    const token = (0, import_uuid2.v4)();
    const tokenHash = await this.hashService.hash(token);
    const expiresAt = /* @__PURE__ */ new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    const invitation = WorkspaceInvitation.create({
      workspaceId,
      email,
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
      completed: false
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
    return projects.map((p) => p.props);
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
  async execute(userId, date = /* @__PURE__ */ new Date()) {
    let metrics = await this.analyticsRepository.findByDate(userId, date);
    if (!metrics) {
      metrics = DailyMetrics.create({
        userId,
        date
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
    const duration = session.props.duration ?? 0;
    const pauseCount = session.props.pauseCount ?? 0;
    const totalPauseTime = session.props.totalPauseTime ?? 0;
    const wasCompleted = session.props.wasCompleted;
    let score = 0.5;
    if (wasCompleted) {
      score += 0.2;
    }
    if (duration >= 25 && duration <= 50) {
      score += 0.2;
    } else if (duration >= 10 && duration < 25) {
      score += 0.1;
    } else if (duration > 50) {
      score += 0.1;
    }
    const pausePenalty = Math.min(pauseCount * 0.05, 0.3);
    score -= pausePenalty;
    if (duration > 0) {
      const totalSessionTime = duration * 60 + totalPauseTime;
      const workTimeRatio = duration * 60 / totalSessionTime;
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
      tasksCreated: dailyMetrics.reduce((sum, m) => sum + m.props.tasksCreated, 0),
      tasksCompleted: dailyMetrics.reduce((sum, m) => sum + m.props.tasksCompleted, 0),
      minutesWorked: dailyMetrics.reduce((sum, m) => sum + m.props.minutesWorked, 0),
      pomodorosCompleted: dailyMetrics.reduce(
        (sum, m) => sum + m.props.pomodorosCompleted,
        0
      ),
      focusScore: dailyMetrics.length > 0 ? dailyMetrics.reduce((sum, m) => sum + (m.props.focusScore ?? 0), 0) / dailyMetrics.length : 0,
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
  getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }
  /**
   * Check if two dates are in the same week
   */
  isSameWeek(date1, date2) {
    const start1 = this.getWeekStart(date1);
    const start2 = this.getWeekStart(date2);
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
    const newTotal = this.props.totalCompletions + 1;
    const newStreak = isConsecutive ? this.props.currentStreak + 1 : 1;
    const newLongest = Math.max(this.props.longestStreak, newStreak);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AIProfile,
  AcceptInvitationUseCase,
  AddMemberToWorkspaceUseCase,
  ArchiveProjectUseCase,
  ArchiveWorkspaceUseCase,
  AssignTagToTaskUseCase,
  COMMENT_LIMITS,
  CalculateFocusScoreUseCase,
  ChangeUserName,
  CompleteTaskUseCase,
  CreateAuditLogUseCase,
  CreateProjectUseCase,
  CreateTagUseCase,
  CreateTaskUseCase,
  CreateWorkflowUseCase,
  CreateWorkspaceUseCase,
  DEFAULT_POMODORO_SETTINGS,
  DailyMetrics,
  DeleteProjectUseCase,
  DeleteWorkflowUseCase,
  Email,
  Entity,
  FILE_LIMITS,
  GenerateWeeklyReportUseCase,
  GetDailyMetricsUseCase,
  GetDeletedProjectsUseCase,
  GetDeletedTasksUseCase,
  GetDeletedWorkspacesUseCase,
  GetOptimalScheduleUseCase,
  GetWorkspaceAuditLogsUseCase,
  GetWorkspaceSettingsUseCase,
  Habit,
  HashPassword,
  Id,
  InviteMemberUseCase,
  LearnFromSessionUseCase,
  ListWorkflowsUseCase,
  MEMBER_ROLES,
  MockAIService,
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
  ProductivityReport,
  Project,
  RegisterUser,
  RemoveMemberFromWorkspaceUseCase,
  RemoveTagFromTaskUseCase,
  RequiredString,
  RestoreProjectUseCase,
  RestoreTaskUseCase,
  RestoreWorkspaceUseCase,
  ResumeTimerUseCase,
  SoftDeleteProjectUseCase,
  SoftDeleteTaskUseCase,
  SoftDeleteWorkspaceUseCase,
  StartTimerUseCase,
  StopTimerUseCase,
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
  TimeSession,
  USER_LIMITS,
  UpdateDailyMetricsUseCase,
  UpdateProjectUseCase,
  UpdateTagUseCase,
  UpdateWorkflowUseCase,
  UpdateWorkspaceSettingsUseCase,
  User,
  UserByEmail,
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
