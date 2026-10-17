import React from "react";
import { Sun, Moon, Sunset, Calendar, MessageSquare, Github } from "lucide-react";

export const TIMEZONES = [
  { value: "America/Mexico_City", label: "Mexico City (GMT-6)" },
  { value: "America/New_York", label: "New York (GMT-5)" },
  { value: "America/Los_Angeles", label: "Los Angeles (GMT-8)" },
  { value: "America/Sao_Paulo", label: "São Paulo (GMT-3)" },
  { value: "Europe/London", label: "London (GMT+0)" },
  { value: "Europe/Paris", label: "Paris (GMT+1)" },
  { value: "Asia/Tokyo", label: "Tokyo (GMT+9)" },
];

export const ENERGY_LEVELS = [
  { value: "LOW", label: "Low", icon: Moon, color: "text-blue-500" },
  { value: "MEDIUM", label: "Medium", icon: Sunset, color: "text-yellow-500" },
  { value: "HIGH", label: "High", icon: Sun, color: "text-orange-500" },
];

export const INTEGRATIONS = [
  {
    id: "GOOGLE_CALENDAR",
    name: "Google Calendar",
    icon: Calendar,
    description: "Sync tasks with due dates to your calendar",
    available: true,
  },
  {
    id: "SLACK",
    name: "Slack",
    icon: MessageSquare,
    description: "Create tasks from Slack messages, get notifications",
    available: false,
  },
  {
    id: "GITHUB",
    name: "GitHub",
    icon: Github,
    description: "Sync issues and pull requests",
    available: false,
  },
];

export interface Profile {
  id: string;
  username: string | null;
  name: string | null;
  email: string;
  phone: string | null;
  jobTitle: string | null;
  department: string | null;
  bio: string | null;
  image: string | null;
  timezone: string | null;
  lastUsernameChangeAt?: Date | string | null;
  preferences?: {
    enableAI: boolean;
    aiAggressiveness: number;
    aiSuggestTaskDurations: boolean;
    aiSuggestPriorities: boolean;
    aiSuggestScheduling: boolean;
    aiWeeklyReports: boolean;
    morningEnergy: "LOW" | "MEDIUM" | "HIGH";
    afternoonEnergy: "LOW" | "MEDIUM" | "HIGH";
    eveningEnergy: "LOW" | "MEDIUM" | "HIGH";
    shareAnalytics: boolean;
    showActivityStatus: boolean;
    taskRemindersEmail: boolean;
    weeklyDigestEmail: boolean;
    marketingEmail: boolean;
  } | null;
  subscription?: {
    plan: "FREE" | "PRO" | "TEAM" | "ENTERPRISE";
    status?: string;
    expiresAt?: Date | null;
  } | null;
}

export interface ProfileTabsProps {
  profile: Profile | null;
  sessionUser?: { email: string } | null;
  isLoading?: boolean;
  onUpdateProfile: (data: Record<string, unknown>) => Promise<void>;
  onUpdatePreferences: (data: Record<string, unknown>) => Promise<void>;
  onUpdateUsername?: (newUsername: string) => Promise<void>;
  onExportData: () => Promise<void>;
  onDeleteAccount: () => Promise<void>;
  isUpdateProfilePending?: boolean;
  isUpdatePreferencesPending?: boolean;
  isExportDataPending?: boolean;
  isDeleteAccountPending?: boolean;
  addSuccess: (message: string) => void;
  addError: (message: string) => void;
  desktopOnlyContent?: React.ReactNode;
}
