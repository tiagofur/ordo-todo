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
  AlertTriangle
} from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import { cn } from "../../utils/index.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card.js";
import { Label } from "../ui/label.js";
import { Input } from "../ui/input.js";
import { Switch } from "../ui/switch.js";
import { Button } from "../ui/button.js";
import { Slider } from "../ui/slider.js";
import { Badge } from "../ui/badge.js";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select.js";
import { Textarea } from "../ui/textarea.js";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog.js";

const TIMEZONES = [
  { value: "America/Mexico_City", label: "Mexico City (GMT-6)" },
  { value: "America/New_York", label: "New York (GMT-5)" },
  { value: "America/Los_Angeles", label: "Los Angeles (GMT-8)" },
  { value: "America/Sao_Paulo", label: "São Paulo (GMT-3)" },
  { value: "Europe/London", label: "London (GMT+0)" },
  { value: "Europe/Paris", label: "Paris (GMT+1)" },
  { value: "Asia/Tokyo", label: "Tokyo (GMT+9)" },
];

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
  name: string | null;
  email: string;
  phone: string | null;
  jobTitle: string | null;
  department: string | null;
  bio: string | null;
  image: string | null;
  timezone: string | null;
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
  onUpdateProfile: (data: any) => Promise<void>;
  onUpdatePreferences: (data: any) => Promise<void>;
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

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
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

  async function handleSaveProfile() {
    try {
      await onUpdateProfile(profileForm);
      addSuccess("Profile updated successfully!");
    } catch (error: any) {
      addError(error.message || "Failed to update profile");
    }
  }

  async function handleSaveAiPreferences() {
    try {
      await onUpdatePreferences(aiPreferences);
      addSuccess("AI preferences updated successfully!");
    } catch (error: any) {
      addError(error.message || "Failed to update AI preferences");
    }
  }

  async function handleSavePrivacyPreferences() {
    try {
      await onUpdatePreferences(privacyPreferences);
      addSuccess("Privacy preferences updated successfully!");
    } catch (error: any) {
      addError(error.message || "Failed to update privacy preferences");
    }
  }

  async function handleExportData() {
    try {
      await onExportData();
      addSuccess("Data export started! The download will begin shortly.");
    } catch (error: any) {
      addError(error.message || "Failed to export data");
    }
  }

  async function handleDeleteAccount() {
    try {
      await onDeleteAccount();
    } catch (error: any) {
      addError(error.message || "Failed to delete account");
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <Tabs.Root defaultValue="profile" className="mt-6">
      <Tabs.List className="grid w-full grid-cols-4 lg:grid-cols-7 mb-6 h-auto p-1">
        <Tabs.Trigger
          value="profile"
          className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-2 text-sm font-medium ring-offset-background transition-all",
            "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:pointer-events-none disabled:opacity-50",
            "flex items-center gap-2"
          )}
        >
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">Profile</span>
        </Tabs.Trigger>
        <Tabs.Trigger
          value="ai"
          className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-2 text-sm font-medium ring-offset-background transition-all",
            "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:pointer-events-none disabled:opacity-50",
            "flex items-center gap-2"
          )}
        >
          <Brain className="h-4 w-4" />
          <span className="hidden sm:inline">AI</span>
        </Tabs.Trigger>
        <Tabs.Trigger
          value="security"
          className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-2 text-sm font-medium ring-offset-background transition-all",
            "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:pointer-events-none disabled:opacity-50",
            "flex items-center gap-2"
          )}
        >
          <Shield className="h-4 w-4" />
          <span className="hidden sm:inline">Security</span>
        </Tabs.Trigger>
        <Tabs.Trigger
          value="privacy"
          className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-2 text-sm font-medium ring-offset-background transition-all",
            "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:pointer-events-none disabled:opacity-50",
            "flex items-center gap-2"
          )}
        >
          <Lock className="h-4 w-4" />
          <span className="hidden sm:inline">Privacy</span>
        </Tabs.Trigger>
        <Tabs.Trigger
          value="integrations"
          className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-2 text-sm font-medium ring-offset-background transition-all",
            "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:pointer-events-none disabled:opacity-50",
            "flex items-center gap-2"
          )}
        >
          <Link2 className="h-4 w-4" />
          <span className="hidden sm:inline">Integrations</span>
        </Tabs.Trigger>
        <Tabs.Trigger
          value="subscription"
          className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-2 text-sm font-medium ring-offset-background transition-all",
            "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:pointer-events-none disabled:opacity-50",
            "flex items-center gap-2"
          )}
        >
          <CreditCard className="h-4 w-4" />
          <span className="hidden sm:inline">Subscription</span>
        </Tabs.Trigger>
        <Tabs.Trigger
          value="account"
          className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-2 text-sm font-medium ring-offset-background transition-all",
            "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:pointer-events-none disabled:opacity-50",
            "flex items-center gap-2"
          )}
        >
          <Settings2 className="h-4 w-4" />
          <span className="hidden sm:inline">Account</span>
        </Tabs.Trigger>
      </Tabs.List>

      {/* Profile Tab */}
      <Tabs.Content value="profile" className="mt-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal information and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile?.image || undefined} />
                <AvatarFallback className="text-lg">{getInitials(profile?.name)}</AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" size="sm">Change Avatar</Button>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max 2MB.</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={sessionUser?.email || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="+1 555 0123"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  value={profileForm.jobTitle}
                  onChange={(e) => setProfileForm({ ...profileForm, jobTitle: e.target.value })}
                  placeholder="Product Manager"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={profileForm.department}
                  onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                  placeholder="Engineering"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={profileForm.timezone}
                  onValueChange={(value) => setProfileForm({ ...profileForm, timezone: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                placeholder="Tell us a bit about yourself..."
                rows={3}
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveProfile} disabled={isUpdateProfilePending}>
                <Save className="h-4 w-4 mr-2" />
                {isUpdateProfilePending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </Tabs.Content>

      {/* AI & Productivity Tab */}
      <Tabs.Content value="ai" className="mt-2">
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
      </Tabs.Content>

      {/* Security Tab */}
      <Tabs.Content value="security" className="mt-2">
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
                <p className="text-sm text-muted-foreground">Last changed: 3 months ago</p>
              </div>
              <Button variant="outline">Change Password</Button>
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

            {/* Active Sessions */}
            <div className="space-y-4">
              <h4 className="font-medium">Active Sessions</h4>
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                      <span className="text-green-500 text-xl">💻</span>
                    </div>
                    <div>
                      <p className="font-medium">Current Session</p>
                      <p className="text-xs text-muted-foreground">This device</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-500 border-green-500">Active</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Tabs.Content>

      {/* Privacy Tab */}
      <Tabs.Content value="privacy" className="mt-2">
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
      </Tabs.Content>

      {/* Integrations Tab */}
      <Tabs.Content value="integrations" className="mt-2">
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
      </Tabs.Content>

      {/* Subscription Tab */}
      <Tabs.Content value="subscription" className="mt-2">
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
      </Tabs.Content>

      {/* Account Tab */}
      <Tabs.Content value="account" className="mt-2">
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
      </Tabs.Content>
    </Tabs.Root>
  );
}