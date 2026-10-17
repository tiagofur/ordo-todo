"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  Lock,
  CreditCard,
  Settings2,
  Save,
  Download,
  Trash2,
  AlertTriangle,
  Trophy,
  Loader2,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import {
  cn,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Switch,
  Button,
  Badge,
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
import type { Profile } from "./profile-types";

export function ProfileSecurityTab({
  sessionUser,
  onOpenChangePassword,
}: {
  sessionUser?: { email: string } | null;
  onOpenChangePassword: () => void;
}) {
  return (
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
          <Button variant="outline" onClick={onOpenChangePassword}>
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
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
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
                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <span className="text-green-500 text-xl">💻</span>
                </div>
                <div>
                  <p className="font-medium">Current Session</p>
                  <p className="text-xs text-muted-foreground">This device</p>
                </div>
              </div>
              <Badge variant="outline" className="text-green-500 border-green-500">
                Active
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProfilePrivacyTab({
  profile,
  onUpdatePreferences,
  isUpdatePreferencesPending = false,
  addSuccess,
  addError,
}: {
  profile: Profile | null;
  onUpdatePreferences: (data: Record<string, unknown>) => Promise<void>;
  isUpdatePreferencesPending?: boolean;
  addSuccess: (message: string) => void;
  addError: (message: string) => void;
}) {
  const [privacyPreferences, setPrivacyPreferences] = useState({
    shareAnalytics: true,
    showActivityStatus: true,
    taskRemindersEmail: false,
    weeklyDigestEmail: true,
    marketingEmail: false,
  });

  useEffect(() => {
    if (profile?.preferences) {
      setPrivacyPreferences({
        shareAnalytics: profile.preferences.shareAnalytics,
        showActivityStatus: profile.preferences.showActivityStatus,
        taskRemindersEmail: profile.preferences.taskRemindersEmail,
        weeklyDigestEmail: profile.preferences.weeklyDigestEmail,
        marketingEmail: profile.preferences.marketingEmail,
      });
    }
  }, [profile]);

  async function handleSavePrivacyPreferences() {
    try {
      await onUpdatePreferences(privacyPreferences);
      addSuccess?.("Privacy preferences updated successfully!");
    } catch (error: unknown) {
      addError?.((error as Error).message || "Failed to update privacy preferences");
    }
  }

  return (
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
  );
}

export function ProfileSubscriptionTab({ profile }: { profile: Profile | null }) {
  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case "PRO":
        return "bg-purple-600 text-white";
      case "TEAM":
        return "bg-blue-600 text-white";
      case "ENTERPRISE":
        return "bg-amber-600 text-white";
      default:
        return "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300";
    }
  };

  const plan = profile?.subscription?.plan || "FREE";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Subscription & Billing
        </CardTitle>
        <CardDescription>Manage your subscription and billing details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-6 border rounded-lg bg-muted">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Current Plan</h3>
              <Badge className={getPlanBadgeColor(plan)}>{plan}</Badge>
            </div>
            {plan === "FREE" && (
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
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
            {plan === "FREE" && (
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

        <div className="space-y-4">
          <h4 className="font-medium">Billing History</h4>
          <p className="text-sm text-muted-foreground">No billing history available</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProfileAccountTab({
  onExportData,
  onDeleteAccount,
  isExportDataPending = false,
  isDeleteAccountPending = false,
  addSuccess,
  addError,
  desktopOnlyContent,
}: {
  onExportData: () => Promise<void>;
  onDeleteAccount: () => Promise<void>;
  isExportDataPending?: boolean;
  isDeleteAccountPending?: boolean;
  addSuccess: (message: string) => void;
  addError: (message: string) => void;
  desktopOnlyContent?: React.ReactNode;
}) {
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

  return (
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
                Download all your data including tasks, projects, time sessions, and settings in
                JSON format
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
        <div className="p-4 border border-destructive rounded-lg bg-red-100 dark:bg-red-900">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-4 w-4" />
                <Label className="text-base text-destructive">Delete Account</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data. This action cannot be
                undone.
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
                    This action cannot be undone. This will permanently delete your account and
                    remove all your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive hover:bg-destructive"
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
  );
}

export function ProfileGamificationTab() {
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
      .catch(() => {})
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
          Earn experience points (XP) and unlock achievements by completing tasks, habits, and focus
          sessions.
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
                {gamification?.achievements?.map((ach: any) => (
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
                        "p-2.5 rounded-xl border flex items-center justify-center flex-shrink-0",
                        ach.isUnlocked
                          ? "bg-amber-500/15 border-amber-500/30 text-amber-500"
                          : "bg-muted border-border text-muted-foreground"
                      )}
                    >
                      <Trophy className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold leading-snug">{ach.name}</p>
                        <Badge
                          variant={ach.isUnlocked ? "default" : "outline"}
                          className={cn(
                            "text-[10px] font-semibold px-1.5 py-0",
                            ach.isUnlocked && "bg-amber-500 hover:bg-amber-600 text-white"
                          )}
                        >
                          +{ach.xpReward} XP
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-normal">
                        {ach.description}
                      </p>
                      {ach.isUnlocked && ach.unlockedAt && (
                        <p className="text-[10px] text-amber-600/80 dark:text-amber-400/80 mt-2">
                          Unlocked {new Date(ach.unlockedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
