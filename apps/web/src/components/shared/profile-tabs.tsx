"use client";

import React, { useState } from "react";
import {
  User,
  Brain,
  Shield,
  Lock,
  Link2,
  CreditCard,
  Settings2,
  Trophy,
} from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import { cn } from "@ordo-todo/ui";
import { ChangePasswordDialog } from "./change-password-dialog";
import { ProfileGeneralTab } from "@/components/profile/profile-general-tab";
import { ProfileAiTab } from "@/components/profile/profile-ai-tab";
import { ProfileIntegrationsTab } from "@/components/profile/profile-integrations-tab";
import {
  ProfileSecurityTab,
  ProfilePrivacyTab,
  ProfileSubscriptionTab,
  ProfileAccountTab,
  ProfileGamificationTab,
} from "@/components/profile/profile-security-privacy-tabs";
import type { ProfileTabsProps } from "@/components/profile/profile-types";

export type { Profile, ProfileTabsProps } from "@/components/profile/profile-types";

const TAB_ITEMS = [
  { value: "profile", label: "Profile", icon: User, iconClassName: "" },
  { value: "ai", label: "AI", icon: Brain, iconClassName: "" },
  { value: "security", label: "Security", icon: Shield, iconClassName: "" },
  { value: "privacy", label: "Privacy", icon: Lock, iconClassName: "" },
  { value: "integrations", label: "Integrations", icon: Link2, iconClassName: "" },
  { value: "subscription", label: "Subscription", icon: CreditCard, iconClassName: "" },
  { value: "gamification", label: "Level & XP", icon: Trophy, iconClassName: "text-amber-500" },
  { value: "account", label: "Account", icon: Settings2, iconClassName: "" },
] as const;

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
  desktopOnlyContent,
}: ProfileTabsProps) {
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <Tabs.Root defaultValue="profile" className="mt-6">
      <Tabs.List className="grid w-full grid-cols-4 lg:grid-cols-8 mb-6 h-auto p-1">
        {TAB_ITEMS.map(({ value, label, icon: Icon, iconClassName }) => (
          <Tabs.Trigger
            key={value}
            value={value}
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-2 text-sm font-medium ring-offset-background transition-all",
              "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:pointer-events-none disabled:opacity-50",
              "flex items-center gap-2"
            )}
          >
            <Icon className={cn("h-4 w-4", iconClassName)} />
            <span className="hidden sm:inline">{label}</span>
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      <Tabs.Content value="profile" className="mt-2">
        <ProfileGeneralTab
          profile={profile}
          sessionUser={sessionUser}
          onUpdateProfile={onUpdateProfile}
          onUpdateUsername={onUpdateUsername}
          isUpdateProfilePending={isUpdateProfilePending}
          addSuccess={addSuccess}
          addError={addError}
        />
      </Tabs.Content>

      <Tabs.Content value="ai" className="mt-2">
        <ProfileAiTab
          profile={profile}
          onUpdatePreferences={onUpdatePreferences}
          isUpdatePreferencesPending={isUpdatePreferencesPending}
          addSuccess={addSuccess}
          addError={addError}
        />
      </Tabs.Content>

      <Tabs.Content value="security" className="mt-2">
        <ProfileSecurityTab
          sessionUser={sessionUser}
          onOpenChangePassword={() => setIsChangePasswordOpen(true)}
        />
      </Tabs.Content>

      <Tabs.Content value="privacy" className="mt-2">
        <ProfilePrivacyTab
          profile={profile}
          onUpdatePreferences={onUpdatePreferences}
          isUpdatePreferencesPending={isUpdatePreferencesPending}
          addSuccess={addSuccess}
          addError={addError}
        />
      </Tabs.Content>

      <Tabs.Content value="integrations" className="mt-2">
        <ProfileIntegrationsTab addSuccess={addSuccess} addError={addError} />
      </Tabs.Content>

      <Tabs.Content value="subscription" className="mt-2">
        <ProfileSubscriptionTab profile={profile} />
      </Tabs.Content>

      <Tabs.Content value="gamification" className="mt-2">
        <ProfileGamificationTab />
      </Tabs.Content>

      <Tabs.Content value="account" className="mt-2">
        <ProfileAccountTab
          onExportData={onExportData}
          onDeleteAccount={onDeleteAccount}
          isExportDataPending={isExportDataPending}
          isDeleteAccountPending={isDeleteAccountPending}
          addSuccess={addSuccess}
          addError={addError}
          desktopOnlyContent={desktopOnlyContent}
        />
      </Tabs.Content>

      <ChangePasswordDialog
        open={isChangePasswordOpen}
        onOpenChange={setIsChangePasswordOpen}
      />
    </Tabs.Root>
  );
}