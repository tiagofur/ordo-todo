/**
 * User-related types and DTOs
 */

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  emailVerified: Date | null;
  phone: string | null;
  jobTitle: string | null;
  department: string | null;
  bio: string | null;
  timezone: string | null;
  locale: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileDto {
  name?: string;
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
  name: string | null;
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
  | 'NOTION'
  | 'ZAPIER';

export type EnergyLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface UserPreferences {
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
