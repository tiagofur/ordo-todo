/**
 * User-related types and DTOs
 */

export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  image: string | null;
  emailVerified: Date | null;
  phone: string | null;
  jobTitle: string | null;
  department: string | null;
  bio: string | null;
  timezone: string | null;
  locale: string | null;
  lastUsernameChangeAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileDto {
  name?: string;
  username?: string;
  image?: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  bio?: string;
  timezone?: string;
  locale?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  name: string;
  image: string | null;
}

// Extended profile response with subscription, integrations, and preferences
export interface UserProfileResponse extends User {
  subscription: {
    plan: 'FREE' | 'PRO' | 'TEAM' | 'ENTERPRISE';
    status: string;
    expiresAt: Date | null;
  } | null;
  integrations: UserIntegration[];
  preferences: UserPreferences | null;
}

export interface UserIntegration {
  id?: string;
  provider: IntegrationProvider;
  isActive: boolean;
  providerEmail: string | null;
  lastSyncAt: Date | null;
  createdAt?: Date;
}

export type IntegrationProvider =
  | 'GOOGLE_CALENDAR'
  | 'GOOGLE_TASKS'
  | 'SLACK'
  | 'GITHUB'
  | 'MICROSOFT_TEAMS'
  | 'MICROSOFT_CALENDAR'
  | 'NOTION'
  | 'ZAPIER';

export type CalendarSyncStatus =
  | 'ok'
  | 'error'
  | 're-auth-required'
  | 'never-synced';

export interface CalendarAccountStatus {
  provider: string;
  status: CalendarSyncStatus;
  email: string | null;
  lastSyncAt: Date | null;
  conflicts: unknown[];
}

export type EnergyLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface FocusAudioPreferences {
  auto?: boolean;
  volume?: number;
  trackId?: string;
}

export interface UserPreferences {
  // UI Settings
  theme?: 'LIGHT' | 'DARK' | 'AUTO';
  defaultView?: 'LIST' | 'KANBAN' | 'CALENDAR' | 'TIMELINE' | 'FOCUS';
  startOfWeek?: number;
  focusAudio?: FocusAudioPreferences | null;

  // Timer Settings
  timerMode?: 'POMODORO' | 'CONTINUOUS' | 'HYBRID';
  pomodoroDuration?: number;
  shortBreakDuration?: number;
  longBreakDuration?: number;
  pomodorosUntilLongBreak?: number;

  // Notifications & Sound
  enableSounds?: boolean;
  enableNotifications?: boolean;

  // AI General
  enableAI: boolean;
  aiAggressiveness: number;

  // AI Granular Settings
  aiSuggestTaskDurations: boolean;
  aiSuggestPriorities: boolean;
  aiSuggestScheduling: boolean;
  aiWeeklyReports: boolean;

  // Energy Profile
  morningEnergy: EnergyLevel;
  afternoonEnergy: EnergyLevel;
  eveningEnergy: EnergyLevel;

  // Privacy Settings
  shareAnalytics: boolean;
  showActivityStatus: boolean;

  // Email Notifications
  taskRemindersEmail: boolean;
  weeklyDigestEmail: boolean;
  marketingEmail: boolean;

  // Data Retention
  completedTasksRetention: number | null;
  timeSessionsRetention: number | null;
}

export interface UpdatePreferencesDto {
  theme?: 'LIGHT' | 'DARK' | 'AUTO';
  defaultView?: 'LIST' | 'KANBAN' | 'CALENDAR' | 'TIMELINE' | 'FOCUS';
  startOfWeek?: number;
  focusAudio?: FocusAudioPreferences | null;
  timerMode?: 'POMODORO' | 'CONTINUOUS' | 'HYBRID';
  pomodoroDuration?: number;
  shortBreakDuration?: number;
  longBreakDuration?: number;
  pomodorosUntilLongBreak?: number;
  enableSounds?: boolean;
  enableNotifications?: boolean;
  enableAI?: boolean;
  aiAggressiveness?: number;
  aiSuggestTaskDurations?: boolean;
  aiSuggestPriorities?: boolean;
  aiSuggestScheduling?: boolean;
  aiWeeklyReports?: boolean;
  morningEnergy?: EnergyLevel;
  afternoonEnergy?: EnergyLevel;
  eveningEnergy?: EnergyLevel;
  shareAnalytics?: boolean;
  showActivityStatus?: boolean;
  taskRemindersEmail?: boolean;
  weeklyDigestEmail?: boolean;
  marketingEmail?: boolean;
  completedTasksRetention?: number | null;
  timeSessionsRetention?: number | null;
}
