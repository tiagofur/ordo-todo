"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Brain,
  Shield,
  Lock,
  Link2,
  CreditCard,
  Settings2,
  Save,
  Zap,
  Sun,
  Moon,
  Sunset,
  Download,
  Trash2,
  Calendar,
  Github,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Trophy,
  AtSign,
  Clock,
  Camera,
  Check,
  Copy,
  ShieldCheck,
  Building2,
  Briefcase,
  Phone,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { ChangePasswordDialog } from "./change-password-dialog";
import { SessionsManager } from "../settings/SessionsManager";
import { useUsernameValidation } from "@ordo-todo/hooks";
import {
  cn,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Input,
  Switch,
  Button,
  Slider,
  Badge,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@ordo-todo/ui";


const TIMEZONES = [
  { value: "America/Mexico_City", label: "Mexico City (GMT-6)" },
  { value: "America/New_York", label: "New York (GMT-5)" },
  { value: "America/Los_Angeles", label: "Los Angeles (GMT-8)" },
  { value: "America/Sao_Paulo", label: "São Paulo (GMT-3)" },
  { value: "Europe/London", label: "London (GMT+0)" },
  { value: "Europe/Paris", label: "Paris (GMT+1)" },
  { value: "Asia/Tokyo", label: "Tokyo (GMT+9)" },
];

function getPlanBadgeClasses(plan?: string) {
  switch (plan) {
    case "PRO":
      return "bg-purple-600 text-white border-purple-500/30";
    case "TEAM":
      return "bg-blue-600 text-white border-blue-500/30";
    case "ENTERPRISE":
      return "bg-amber-600 text-white border-amber-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function getLocalTimeInTimezone(timezone: string) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      timeZoneName: "short",
    }).format(new Date());
  } catch {
    return null;
  }
}

const ENERGY_LEVELS = [
  { value: "LOW", label: "Low", icon: Moon, color: "text-blue-500" },
  { value: "MEDIUM", label: "Medium", icon: Sunset, color: "text-yellow-500" },
  { value: "HIGH", label: "High", icon: Sun, color: "text-orange-500" },
];

const INTEGRATIONS = [
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

interface Profile {
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

interface ProfileTabsProps {
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

export function ProfileTabs({
  profile,
  sessionUser,
  isLoading = false,
  onUpdateProfile,
  onUpdatePreferences,
  onUpdateUsername,
  onExportData,
  onDeleteAccount,
  isUpdateProfilePending = false,
  isUpdatePreferencesPending = false,
  isExportDataPending = false,
  isDeleteAccountPending = false,
  addSuccess,
  addError,
  desktopOnlyContent
}: ProfileTabsProps) {
  // Username state
  const [username, setUsername] = useState("");
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [hasCopiedUrl, setHasCopiedUrl] = useState(false);
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    jobTitle: "",
    department: "",
    bio: "",
    timezone: "America/Mexico_City",
  });

  // AI preferences state
  const [aiPreferences, setAiPreferences] = useState<{
    enableAI: boolean;
    aiAggressiveness: number;
    aiSuggestTaskDurations: boolean;
    aiSuggestPriorities: boolean;
    aiSuggestScheduling: boolean;
    aiWeeklyReports: boolean;
    morningEnergy: "LOW" | "MEDIUM" | "HIGH";
    afternoonEnergy: "LOW" | "MEDIUM" | "HIGH";
    eveningEnergy: "LOW" | "MEDIUM" | "HIGH";
  }>({
    enableAI: true,
    aiAggressiveness: 5,
    aiSuggestTaskDurations: true,
    aiSuggestPriorities: true,
    aiSuggestScheduling: true,
    aiWeeklyReports: true,
    morningEnergy: "MEDIUM",
    afternoonEnergy: "MEDIUM",
    eveningEnergy: "LOW",
  });

  // Privacy preferences state
  const [privacyPreferences, setPrivacyPreferences] = useState({
    shareAnalytics: true,
    showActivityStatus: true,
    taskRemindersEmail: false,
    weeklyDigestEmail: true,
    marketingEmail: false,
  });

  // Username validation hook
  const { validationResult, validateUsername, resetValidation } = useUsernameValidation({
    apiClient: {} as unknown as Parameters<typeof useUsernameValidation>[0]['apiClient'], // API client not needed - uses fetch directly
    minLength: 3,
    maxLength: 20,
    debounceMs: 500,
    currentUsername: profile?.username || undefined,
  });

  // Validate username when it changes (only when editing)
  useEffect(() => {
    if (isEditingUsername && username && username.length >= 1) {
      validateUsername(username);
    } else if (!isEditingUsername) {
      resetValidation();
    }
     
  }, [username, isEditingUsername]);

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      setProfileForm({
        name: profile.name || "",
        phone: profile.phone || "",
        jobTitle: profile.jobTitle || "",
        department: profile.department || "",
        bio: profile.bio || "",
        timezone: profile.timezone || "America/Mexico_City",
      });
      if (profile.preferences) {
        setAiPreferences({
          enableAI: profile.preferences.enableAI,
          aiAggressiveness: profile.preferences.aiAggressiveness ?? 5,
          aiSuggestTaskDurations: profile.preferences.aiSuggestTaskDurations,
          aiSuggestPriorities: profile.preferences.aiSuggestPriorities,
          aiSuggestScheduling: profile.preferences.aiSuggestScheduling,
          aiWeeklyReports: profile.preferences.aiWeeklyReports,
          morningEnergy: profile.preferences.morningEnergy ?? "MEDIUM",
          afternoonEnergy: profile.preferences.afternoonEnergy ?? "MEDIUM",
          eveningEnergy: profile.preferences.eveningEnergy ?? "LOW",
        });
        setPrivacyPreferences({
          shareAnalytics: profile.preferences.shareAnalytics,
          showActivityStatus: profile.preferences.showActivityStatus,
          taskRemindersEmail: profile.preferences.taskRemindersEmail,
          weeklyDigestEmail: profile.preferences.weeklyDigestEmail,
          marketingEmail: profile.preferences.marketingEmail,
        });
      }
    }
  }, [profile]);

  // Calculate days until username can be changed again
  const getDaysUntilUsernameChange = () => {
    if (!profile?.lastUsernameChangeAt) return 0;
    const lastChange = new Date(profile.lastUsernameChangeAt);
    const daysSinceChange = Math.floor((Date.now() - lastChange.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, 30 - daysSinceChange);
  };

  const canChangeUsername = getDaysUntilUsernameChange() === 0;

  async function handleUpdateUsername() {
    if (!onUpdateUsername) return;
    if (!username || username.length < 3) {
      addError?.("Username must be at least 3 characters");
      return;
    }
    if (username === profile?.username) {
      setIsEditingUsername(false);
      return;
    }

    setIsUpdatingUsername(true);
    try {
      await onUpdateUsername(username);
      addSuccess?.("Username updated successfully!");
      setIsEditingUsername(false);
    } catch (error: unknown) {
      addError?.((error as Error).message || "Failed to update username");
    } finally {
      setIsUpdatingUsername(false);
    }
  }

  async function handleSaveProfile() {
    try {
      await onUpdateProfile(profileForm);
      addSuccess?.("Profile updated successfully!");
    } catch (error: unknown) {
      addError?.((error as Error).message || "Failed to update profile");
    }
  }

  async function handleSaveAiPreferences() {
    try {
      await onUpdatePreferences(aiPreferences);
      addSuccess?.("AI preferences updated successfully!");
    } catch (error: unknown) {
      addError?.((error as Error).message || "Failed to update AI preferences");
    }
  }

  async function handleSavePrivacyPreferences() {
    try {
      await onUpdatePreferences(privacyPreferences);
      addSuccess?.("Privacy preferences updated successfully!");
    } catch (error: unknown) {
      addError?.((error as Error).message || "Failed to update privacy preferences");
    }
  }

  async function handleExportData() {
    try {
      await onExportData();
      addSuccess?.("Data export started! The download will begin shortly.");
    } catch (error: unknown) {
      addError?.((error as Error).message || "Failed to export data");
    }
  }

  async function handleDeleteAccount() {
    try {
      await onDeleteAccount();
    } catch (error: unknown) {
      addError?.((error as Error).message || "Failed to delete account");
    }
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case "PRO": return "bg-gradient-to-r from-purple-500 to-pink-500 text-white";
      case "TEAM": return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white";
      case "ENTERPRISE": return "bg-gradient-to-r from-amber-500 to-orange-500 text-white";
      default: return "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300";
    }
  };

  const handleCopyProfileUrl = () => {
    const handle = profile?.username || "user";
    const url = `https://ordotodo.app/@${handle}`;
    navigator.clipboard?.writeText(url);
    setHasCopiedUrl(true);
    setTimeout(() => setHasCopiedUrl(false), 2000);
  };

  const localTime = getLocalTimeInTimezone(profileForm.timezone);
  const plan = profile?.subscription?.plan || "FREE";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="profile" className="mt-4">
      <div className="overflow-x-auto no-scrollbar mb-6 pb-1">
        <TabsList className="inline-flex items-center gap-1.5 p-1.5 bg-muted/60 dark:bg-zinc-900/80 border border-border/80 rounded-2xl shadow-xs min-w-full sm:min-w-0">
          <TabsTrigger
            value="profile"
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium transition-all cursor-pointer shrink-0 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs data-[state=active]:font-semibold text-muted-foreground hover:text-foreground hover:bg-background/40"
          >
            <User className="h-4 w-4 shrink-0" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger
            value="ai"
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium transition-all cursor-pointer shrink-0 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs data-[state=active]:font-semibold text-muted-foreground hover:text-foreground hover:bg-background/40"
          >
            <Brain className="h-4 w-4 shrink-0" />
            <span>AI</span>
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium transition-all cursor-pointer shrink-0 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs data-[state=active]:font-semibold text-muted-foreground hover:text-foreground hover:bg-background/40"
          >
            <Shield className="h-4 w-4 shrink-0" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger
            value="privacy"
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium transition-all cursor-pointer shrink-0 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs data-[state=active]:font-semibold text-muted-foreground hover:text-foreground hover:bg-background/40"
          >
            <Lock className="h-4 w-4 shrink-0" />
            <span>Privacy</span>
          </TabsTrigger>
          <TabsTrigger
            value="integrations"
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium transition-all cursor-pointer shrink-0 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs data-[state=active]:font-semibold text-muted-foreground hover:text-foreground hover:bg-background/40"
          >
            <Link2 className="h-4 w-4 shrink-0" />
            <span>Integrations</span>
          </TabsTrigger>
          <TabsTrigger
            value="subscription"
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium transition-all cursor-pointer shrink-0 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs data-[state=active]:font-semibold text-muted-foreground hover:text-foreground hover:bg-background/40"
          >
            <CreditCard className="h-4 w-4 shrink-0" />
            <span>Subscription</span>
          </TabsTrigger>
          <TabsTrigger
            value="gamification"
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium transition-all cursor-pointer shrink-0 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs data-[state=active]:font-semibold text-muted-foreground hover:text-foreground hover:bg-background/40"
          >
            <Trophy className="h-4 w-4 shrink-0 text-amber-500" />
            <span>Level & XP</span>
          </TabsTrigger>
          <TabsTrigger
            value="account"
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium transition-all cursor-pointer shrink-0 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs data-[state=active]:font-semibold text-muted-foreground hover:text-foreground hover:bg-background/40"
          >
            <Settings2 className="h-4 w-4 shrink-0" />
            <span>Account</span>
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Profile Tab */}
      <TabsContent value="profile" className="mt-2">
        <div className="space-y-6">
          {/* Identity Hero Card */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs relative overflow-hidden transition-all">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                {/* Avatar with hover state */}
                <div className="relative group shrink-0">
                  <Avatar className="h-20 w-20 sm:h-22 sm:w-22 rounded-2xl border-2 border-border shadow-xs">
                    <AvatarImage src={profile?.image || undefined} className="object-cover" />
                    <AvatarFallback className="text-xl font-bold bg-muted text-foreground rounded-2xl">
                      {getInitials(profile?.name || sessionUser?.email)}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    className="absolute inset-0 bg-black/50 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[10px] font-medium cursor-pointer"
                    title="Change Avatar"
                  >
                    <Camera className="h-5 w-5 mb-0.5" />
                    Change
                  </button>
                </div>

                {/* Profile Identity Details */}
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
                      {profileForm.name || profile?.name || "Your Profile"}
                    </h2>
                    <Badge
                      className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                        getPlanBadgeClasses(plan)
                      )}
                    >
                      {plan}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="font-mono text-foreground font-semibold flex items-center gap-1">
                      <AtSign className="h-3 w-3 text-muted-foreground" />
                      {profile?.username || "no-username"}
                    </span>
                    <span>•</span>
                    <span className="truncate max-w-[200px] sm:max-w-none">{sessionUser?.email}</span>
                    {(profileForm.jobTitle || profileForm.department) && (
                      <>
                        <span>•</span>
                        <span className="text-muted-foreground">
                          {[profileForm.jobTitle, profileForm.department].filter(Boolean).join(" in ")}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Profile Actions */}
              <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end shrink-0">
                {profile?.username && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs gap-1.5 h-9"
                    onClick={handleCopyProfileUrl}
                    title="Copy public profile URL"
                  >
                    {hasCopiedUrl ? (
                      <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    <span>{hasCopiedUrl ? "Copied" : "Share URL"}</span>
                  </Button>
                )}
                {onUpdateUsername && !isEditingUsername && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs gap-1.5 h-9"
                    onClick={() => setIsEditingUsername(true)}
                    disabled={!canChangeUsername && !!profile?.username}
                  >
                    <AtSign className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{profile?.username ? "Change Handle" : "Set Handle"}</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Username Editor Panel */}
          {isEditingUsername && (
            <div className="rounded-2xl border border-primary/30 bg-primary/5 dark:bg-primary/10 p-5 space-y-4 animate-in fade-in-50 duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AtSign className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Change Public Username</span>
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  ordotodo.app/@{username || "username"}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <div className="relative flex-1 max-w-sm">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm">
                    @
                  </span>
                  <Input
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))
                    }
                    placeholder="your-username"
                    className={cn(
                      "pl-8 pr-10 font-mono text-sm rounded-xl",
                      validationResult.isLoading && "border-muted",
                      validationResult.isAvailable === true &&
                        username.length >= 3 &&
                        "border-green-500 focus:border-green-500",
                      validationResult.isAvailable === false &&
                        username.length >= 3 &&
                        "border-destructive focus:border-destructive"
                    )}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {validationResult.isLoading && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    {!validationResult.isLoading &&
                      validationResult.isAvailable === true &&
                      username.length >= 3 && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {!validationResult.isLoading &&
                      validationResult.isAvailable === false &&
                      username.length >= 3 && <XCircle className="h-4 w-4 text-destructive" />}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleUpdateUsername}
                    disabled={
                      isUpdatingUsername ||
                      username.length < 3 ||
                      validationResult.isLoading ||
                      validationResult.isAvailable === false ||
                      username === profile?.username
                    }
                    size="sm"
                    className="rounded-xl h-9"
                  >
                    {isUpdatingUsername ? "Saving..." : "Save Handle"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-xl h-9"
                    onClick={() => {
                      setIsEditingUsername(false);
                      setUsername(profile?.username || "");
                      resetValidation();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>

              {username.length > 0 && validationResult.message && (
                <p
                  className={cn(
                    "text-xs flex items-center gap-1.5",
                    validationResult.isAvailable === true && "text-green-600 dark:text-green-400 font-medium",
                    validationResult.isAvailable === false && "text-destructive font-medium",
                    validationResult.isLoading && "text-muted-foreground"
                  )}
                >
                  {validationResult.message}
                </p>
              )}

              {username.length > 0 && username.length < 3 && (
                <p className="text-xs text-muted-foreground">
                  Username must be at least 3 characters ({username.length}/3)
                </p>
              )}

              {profile?.username && (
                <div className="flex items-start gap-2.5 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-900/60">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <div>
                    <p className="font-semibold">Important note regarding handle changes:</p>
                    <p className="text-muted-foreground mt-0.5">
                      Updating your handle changes your public link and cannot be changed again for 30 days.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Main Settings Card */}
          <Card className="rounded-2xl border border-border/80 shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold">Personal Information</CardTitle>
              <CardDescription>
                Manage your personal profile details, timezone, and professional information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Section 1: Contact Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-primary" />
                  Identity & Contact
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs font-medium">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      placeholder="e.g. Alex Morgan"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email" className="text-xs font-medium flex items-center gap-1">
                        Email Address
                        <Lock className="h-3 w-3 text-muted-foreground" />
                      </Label>
                      <span className="text-[10px] text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        Verified
                      </span>
                    </div>
                    <Input
                      id="email"
                      value={sessionUser?.email || ""}
                      disabled
                      className="bg-muted/50 rounded-xl cursor-not-allowed opacity-80"
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="phone" className="text-xs font-medium flex items-center gap-1.5">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="+1 (555) 012-3456"
                      className="rounded-xl max-w-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="h-px bg-border/60" />

              {/* Section 2: Professional Role */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-primary" />
                  Organization & Role
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle" className="text-xs font-medium">
                      Job Title
                    </Label>
                    <Input
                      id="jobTitle"
                      value={profileForm.jobTitle}
                      onChange={(e) => setProfileForm({ ...profileForm, jobTitle: e.target.value })}
                      placeholder="e.g. Senior Product Architect"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-xs font-medium flex items-center gap-1.5">
                      <Building2 className="h-3 w-3 text-muted-foreground" />
                      Department
                    </Label>
                    <Input
                      id="department"
                      value={profileForm.department}
                      onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                      placeholder="e.g. Engineering & Design"
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="h-px bg-border/60" />

              {/* Section 3: Timezone & Regional */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    Timezone & Regional
                  </h3>
                  {localTime && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                      <span>Current time: <strong className="text-foreground">{localTime}</strong></span>
                    </span>
                  )}
                </div>
                <div className="max-w-md space-y-2">
                  <Label htmlFor="timezone" className="text-xs font-medium">
                    Primary Working Timezone
                  </Label>
                  <Select
                    value={profileForm.timezone}
                    onValueChange={(value) => setProfileForm({ ...profileForm, timezone: value })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    AI scheduling and task reminders automatically adapt to your chosen timezone.
                  </p>
                </div>
              </div>

              <div className="h-px bg-border/60" />

              {/* Section 4: Bio */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="bio" className="text-xs font-medium">
                    About You (Bio)
                  </Label>
                  <span className="text-[11px] text-muted-foreground">
                    {profileForm.bio?.length || 0}/250
                  </span>
                </div>
                <Textarea
                  id="bio"
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  placeholder="Write a brief overview of what you focus on and what your superpowers are..."
                  rows={3}
                  maxLength={250}
                  className="rounded-xl resize-none"
                />
              </div>

              {/* Save Action Bar */}
              <div className="flex items-center justify-end pt-4 border-t border-border/60">
                <Button
                  onClick={handleSaveProfile}
                  disabled={isUpdateProfilePending}
                  className="rounded-xl px-5 py-2.5 font-medium shadow-xs gap-2"
                >
                  {isUpdateProfilePending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isUpdateProfilePending ? "Saving changes..." : "Save Profile"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* AI & Productivity Tab */}
      <TabsContent value="ai" className="mt-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI & Productivity
            </CardTitle>
            <CardDescription>Configure how AI helps you be more productive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main AI Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-base">Enable AI Features</Label>
                <p className="text-sm text-muted-foreground">
                  Allow AI to analyze your tasks and provide suggestions
                </p>
              </div>
              <Switch
                checked={aiPreferences.enableAI}
                onCheckedChange={(checked) => setAiPreferences({ ...aiPreferences, enableAI: checked })}
              />
            </div>

            {aiPreferences.enableAI && (
              <>
                {/* AI Suggestions */}
                <div className="space-y-4">
                  <h4 className="font-medium">AI Suggestions</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Suggest task durations</Label>
                      <Switch
                        checked={aiPreferences.aiSuggestTaskDurations}
                        onCheckedChange={(checked) =>
                          setAiPreferences({ ...aiPreferences, aiSuggestTaskDurations: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Suggest priorities</Label>
                      <Switch
                        checked={aiPreferences.aiSuggestPriorities}
                        onCheckedChange={(checked) =>
                          setAiPreferences({ ...aiPreferences, aiSuggestPriorities: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Suggest optimal scheduling</Label>
                      <Switch
                        checked={aiPreferences.aiSuggestScheduling}
                        onCheckedChange={(checked) =>
                          setAiPreferences({ ...aiPreferences, aiSuggestScheduling: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Weekly AI productivity reports</Label>
                      <Switch
                        checked={aiPreferences.aiWeeklyReports}
                        onCheckedChange={(checked) =>
                          setAiPreferences({ ...aiPreferences, aiWeeklyReports: checked })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* AI Aggressiveness */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>AI Aggressiveness</Label>
                      <p className="text-sm text-muted-foreground">
                        How often AI should suggest changes
                      </p>
                    </div>
                    <span className="text-sm font-medium">{aiPreferences.aiAggressiveness}/10</span>
                  </div>
                  <Slider
                    value={[aiPreferences.aiAggressiveness]}
                    onValueChange={([value]) =>
                      setAiPreferences({ ...aiPreferences, aiAggressiveness: value ?? 5 })
                    }
                    min={1}
                    max={10}
                    step={1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Conservative</span>
                    <span>Proactive</span>
                  </div>
                </div>

                {/* Energy Profile */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Energy Profile
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      AI uses this to schedule demanding tasks during your peak hours
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {(["morningEnergy", "afternoonEnergy", "eveningEnergy"] as const).map((period) => (
                      <div key={period} className="space-y-2">
                        <Label className="capitalize">{period.replace("Energy", "")} Energy</Label>
                        <Select
                          value={aiPreferences[period]}
                          onValueChange={(value: "LOW" | "MEDIUM" | "HIGH") =>
                            setAiPreferences({ ...aiPreferences, [period]: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ENERGY_LEVELS.map((level) => (
                              <SelectItem key={level.value} value={level.value}>
                                <div className="flex items-center gap-2">
                                  <level.icon className={`h-4 w-4 ${level.color}`} />
                                  {level.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end">
              <Button onClick={handleSaveAiPreferences} disabled={isUpdatePreferencesPending}>
                <Save className="h-4 w-4 mr-2" />
                {isUpdatePreferencesPending ? "Saving..." : "Save AI Preferences"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Security Tab */}
      <TabsContent value="security" className="mt-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>Manage your account security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Password */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-base">Password</Label>
                <p className="text-sm text-muted-foreground">Update your account password securely</p>
              </div>
              <Button variant="outline" onClick={() => setIsChangePasswordOpen(true)}>
                Change Password
              </Button>
            </div>

            {/* 2FA */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-base">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Badge variant="outline">Coming Soon</Badge>
            </div>

            {/* Connected Accounts */}
            <div className="space-y-4">
              <h4 className="font-medium">Connected Accounts</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <span className="text-blue-500 text-lg">G</span>
                    </div>
                    <div>
                      <p className="font-medium">Google</p>
                      <p className="text-xs text-muted-foreground">{sessionUser?.email}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Connected</Badge>
                </div>
              </div>
            </div>

            {/* Active Sessions Manager */}
            <div className="pt-2">
              <SessionsManager />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Privacy Tab */}
      <TabsContent value="privacy" className="mt-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Privacy & Data
            </CardTitle>
            <CardDescription>Control how your data is used and shared</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Data Sharing */}
            <div className="space-y-4">
              <h4 className="font-medium">Data Sharing</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Share usage analytics</Label>
                    <p className="text-xs text-muted-foreground">
                      Help improve Ordo-Todo with anonymous usage data
                    </p>
                  </div>
                  <Switch
                    checked={privacyPreferences.shareAnalytics}
                    onCheckedChange={(checked) =>
                      setPrivacyPreferences({ ...privacyPreferences, shareAnalytics: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show activity status</Label>
                    <p className="text-xs text-muted-foreground">
                      Let teammates see when you are working on tasks
                    </p>
                  </div>
                  <Switch
                    checked={privacyPreferences.showActivityStatus}
                    onCheckedChange={(checked) =>
                      setPrivacyPreferences({ ...privacyPreferences, showActivityStatus: checked })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Email Notifications */}
            <div className="space-y-4">
              <h4 className="font-medium">Email Notifications</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Task reminder emails</Label>
                  <Switch
                    checked={privacyPreferences.taskRemindersEmail}
                    onCheckedChange={(checked) =>
                      setPrivacyPreferences({ ...privacyPreferences, taskRemindersEmail: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Weekly productivity digest</Label>
                  <Switch
                    checked={privacyPreferences.weeklyDigestEmail}
                    onCheckedChange={(checked) =>
                      setPrivacyPreferences({ ...privacyPreferences, weeklyDigestEmail: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Marketing and product updates</Label>
                  <Switch
                    checked={privacyPreferences.marketingEmail}
                    onCheckedChange={(checked) =>
                      setPrivacyPreferences({ ...privacyPreferences, marketingEmail: checked })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSavePrivacyPreferences} disabled={isUpdatePreferencesPending}>
                <Save className="h-4 w-4 mr-2" />
                {isUpdatePreferencesPending ? "Saving..." : "Save Privacy Settings"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Integrations Tab */}
      <TabsContent value="integrations" className="mt-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Integrations
            </CardTitle>
            <CardDescription>Connect with third-party services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {INTEGRATIONS.map((integration) => (
              <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <integration.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{integration.name}</p>
                    <p className="text-sm text-muted-foreground">{integration.description}</p>
                  </div>
                </div>
                {integration.available ? (
                  <Button variant="outline">Connect</Button>
                ) : (
                  <Badge variant="outline">Coming Soon</Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Subscription Tab */}
      <TabsContent value="subscription" className="mt-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Subscription & Billing
            </CardTitle>
            <CardDescription>Manage your subscription and billing details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Plan */}
            <div className="p-6 border rounded-lg bg-gradient-to-br from-background to-muted">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Current Plan</h3>
                  <Badge className={getPlanBadgeColor(profile?.subscription?.plan || "FREE")}>
                    {profile?.subscription?.plan || "FREE"}
                  </Badge>
                </div>
                {profile?.subscription?.plan === "FREE" && (
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    Upgrade to Pro
                  </Button>
                )}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Unlimited tasks</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>3 workspaces</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Basic AI suggestions</span>
                </div>
                {profile?.subscription?.plan === "FREE" && (
                  <>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>✗</span>
                      <span>Advanced analytics</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>✗</span>
                      <span>Team collaboration</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Billing History placeholder */}
            <div className="space-y-4">
              <h4 className="font-medium">Billing History</h4>
              <p className="text-sm text-muted-foreground">No billing history available</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Gamification (Level & XP) Tab */}
      <TabsContent value="gamification" className="mt-2">
        <ProfileGamificationSection />
      </TabsContent>

      {/* Account Tab */}
      <TabsContent value="account" className="mt-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Account Settings
            </CardTitle>
            <CardDescription>Manage your account data and settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Export Data */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    <Label className="text-base">Export Your Data</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Download all your data including tasks, projects, time sessions, and settings in JSON format
                  </p>
                </div>
                <Button variant="outline" onClick={handleExportData} disabled={isExportDataPending}>
                  {isExportDataPending ? "Exporting..." : "Request Export"}
                </Button>
              </div>
            </div>

            {/* Desktop-specific content */}
            {desktopOnlyContent}

            {/* Danger Zone */}
            <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/5">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-destructive">
                    <Trash2 className="h-4 w-4" />
                    <Label className="text-base text-destructive">Delete Account</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete Account</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Delete Account
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        {isDeleteAccountPending ? "Deleting..." : "Delete Account"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <ChangePasswordDialog
        open={isChangePasswordOpen}
        onOpenChange={setIsChangePasswordOpen}
      />
    </Tabs>
  );
}

function ProfileGamificationSection() {
  const [gamification, setGamification] = useState<any>(null);
  const [isLoadingGamification, setIsLoadingGamification] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingGamification(true);
    apiClient
      .getGamificationProfile()
      .then((data) => {
        if (isMounted) setGamification(data);
      })
      .catch((err) => {
        console.error("Failed to load gamification profile in desktop", err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingGamification(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          <CardTitle>Level & Achievements</CardTitle>
        </div>
        <CardDescription>
          Earn experience points (XP) and unlock achievements by completing tasks, habits, and focus sessions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoadingGamification ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl border border-border bg-card">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Current Level
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-foreground">
                    Level {gamification?.level || 1}
                  </span>
                </div>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <div className="flex justify-between text-xs text-muted-foreground font-medium">
                  <span>Total XP: {gamification?.xp || 0}</span>
                  <span>Next Level: {gamification?.currentLevelProgress || 0} / 1,000 XP</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden border border-border">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-violet-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        ((gamification?.currentLevelProgress || 0) / 1000) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Unlocked Achievements ({gamification?.achievementsUnlocked || 0} /{" "}
                  {gamification?.achievementsTotal || 0})
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {gamification?.achievements && gamification.achievements.length > 0 ? (
                  gamification.achievements.map((ach: any) => (
                    <div
                      key={ach.id}
                      className={cn(
                        "flex items-start gap-3.5 p-4 rounded-xl border transition-colors",
                        ach.isUnlocked
                          ? "border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/10"
                          : "border-border/60 bg-muted/20 opacity-60"
                      )}
                    >
                      <div
                        className={cn(
                          "p-2.5 rounded-xl border flex items-center justify-center flex-shrink-0 text-lg",
                          ach.isUnlocked
                            ? "bg-amber-500/15 border-amber-500/30 text-amber-500"
                            : "bg-muted border-border text-muted-foreground"
                        )}
                      >
                        {ach.icon || "🏆"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {ach.name}
                          </p>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-[10px] font-bold shrink-0",
                              ach.isUnlocked && "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30"
                            )}
                          >
                            +{ach.xpReward} XP
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {ach.description}
                        </p>
                        {ach.isUnlocked && ach.unlockedAt && (
                          <p className="text-[10px] text-amber-600/80 dark:text-amber-400/80 mt-1 font-medium">
                            Desbloqueado
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground col-span-2 py-4 text-center">
                    Completa tareas y pomodoros para desbloquear logros.
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
