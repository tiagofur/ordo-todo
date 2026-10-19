"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ProfileTabs } from "@/components/shared/profile-tabs";
import useSession from "@/data/hooks/use-session.hook";
import { useFullProfile, useUpdateProfile, useUpdatePreferences, useExportData, useDeleteAccount, queryKeys } from "@/lib/api-hooks";
import useMessages from "@/data/hooks/use-messages.hook";
import { User as UserIcon } from "lucide-react";
import { useTranslations } from "next-intl";

export default function ProfilePage() {
  const t = useTranslations("Profile");
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: sessionUser, endSession } = useSession();
  const { data: profile, isLoading, error, refetch } = useFullProfile();
  const updateProfile = useUpdateProfile();
  const updatePreferences = useUpdatePreferences();
  const exportData = useExportData();
  const deleteAccount = useDeleteAccount();
  const { addSuccess, addError } = useMessages();

  // Handle profile loading error
  const handleRetryLoadProfile = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.userProfile });
    refetch();
  };

  async function handleDeleteAccount() {
    try {
      await deleteAccount.mutateAsync();
      endSession();
      router.push("/login");
    } catch (error: unknown) {
      addError(error instanceof Error ? error.message : "Failed to delete account");
    }
  }

  // Show error state if profile failed to load
  if (error && !isLoading && !profile) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-indigo-500 text-white shadow-sm shadow-indigo-500/25 shrink-0">
              <UserIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground m-0 leading-tight truncate">
                {t("title")}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 truncate">
                {t("subtitle")}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border rounded-2xl bg-destructive/10 border-destructive/20 text-center">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="text-destructive">
              <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Failed to load profile</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              There was a problem loading your profile data. Please check your connection and try again.
            </p>
            <button
              onClick={handleRetryLoadProfile}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Apple Style Unified Pattern */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
          <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-indigo-500 text-white shadow-sm shadow-indigo-500/25 shrink-0">
            <UserIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground m-0 leading-tight truncate">
              {t("title")}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 truncate">
              {t("subtitle")}
            </p>
          </div>
        </div>
      </div>

      <ProfileTabs
        profile={profile ?? null}
        sessionUser={sessionUser}
        isLoading={isLoading}
        onUpdateProfile={async (data: Record<string, unknown>) => {
          try {
            await updateProfile.mutateAsync(data);
          } catch (error: unknown) {
            addError(error instanceof Error ? error.message : "Failed to update profile");
          }
        }}
        onUpdatePreferences={async (data: Record<string, unknown>) => {
          try {
            await updatePreferences.mutateAsync(data);
          } catch (error: unknown) {
            addError(error instanceof Error ? error.message : "Failed to update preferences");
          }
        }}
        onUpdateUsername={async (newUsername: string) => {
          try {
            await updateProfile.mutateAsync({ username: newUsername });
          } catch (error: unknown) {
            addError(error instanceof Error ? error.message : "Failed to update username");
          }
        }}
        onExportData={async () => {
          try {
            await exportData.mutateAsync();
          } catch (error: unknown) {
            addError(error instanceof Error ? error.message : "Failed to export data");
          }
        }}
        onDeleteAccount={handleDeleteAccount}
        isUpdateProfilePending={updateProfile.isPending}
        isUpdatePreferencesPending={updatePreferences.isPending}
        isExportDataPending={exportData.isPending}
        isDeleteAccountPending={deleteAccount.isPending}
        addSuccess={addSuccess}
        addError={addError}
      />
    </div>
  );
}