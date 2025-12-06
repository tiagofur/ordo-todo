export class UserResponseDto {
  id: string;
  email: string;
  name: string | null;
  emailVerified: Date | null;
  image: string | null;

  // Extended Profile
  phone: string | null;
  jobTitle: string | null;
  department: string | null;
  bio: string | null;
  timezone: string | null;
  locale: string | null;

  // Dates
  createdAt: Date;
  updatedAt: Date;
}

export class UserProfileResponseDto extends UserResponseDto {
  // Subscription info
  subscription: {
    plan: 'FREE' | 'PRO' | 'TEAM' | 'ENTERPRISE';
    status: string;
    expiresAt: Date | null;
  } | null;

  // Connected integrations
  integrations: {
    provider: string;
    isActive: boolean;
    providerEmail: string | null;
    lastSyncAt: Date | null;
  }[];

  // Preferences summary
  preferences: {
    enableAI: boolean;
    aiAggressiveness: number;
    aiSuggestTaskDurations: boolean;
    aiSuggestPriorities: boolean;
    aiSuggestScheduling: boolean;
    aiWeeklyReports: boolean;
    morningEnergy: string;
    afternoonEnergy: string;
    eveningEnergy: string;
    shareAnalytics: boolean;
    showActivityStatus: boolean;
    taskRemindersEmail: boolean;
    weeklyDigestEmail: boolean;
    marketingEmail: boolean;
    completedTasksRetention: number | null;
    timeSessionsRetention: number | null;
  } | null;
}
