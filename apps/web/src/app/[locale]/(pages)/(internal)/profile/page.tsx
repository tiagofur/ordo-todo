"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ProfileTabs } from "@ordo-todo/ui";
import useSession from "@/data/hooks/use-session.hook";
import { useFullProfile, useUpdateProfile, useUpdatePreferences, useExportData, useDeleteAccount, queryKeys } from "@/lib/api-hooks";
import useMessages from "@/data/hooks/use-messages.hook";
import Title from "@/components/template/title.component";

export default function ProfilePage() {
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
    } catch (error: any) {
      addError(error.message || "Failed to delete account");
    }
  }

  // Show error state if profile failed to load
  if (error && !isLoading && !profile) {
    return (
      <div className="container max-w-4xl py-6">
        <Title title="Profile Settings" />
        <div className="mt-6 p-6 border rounded-lg bg-destructive/5 border-destructive/30">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
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
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-6">
      <Title title="Profile Settings" />

      <ProfileTabs
        profile={profile ?? null}
        sessionUser={sessionUser}
        isLoading={isLoading}
        onUpdateProfile={async (data: any) => {
          await updateProfile.mutateAsync(data);
        }}
        onUpdatePreferences={async (data: any) => {
          await updatePreferences.mutateAsync(data);
        }}
        onUpdateUsername={async (newUsername: string) => {
          await updateProfile.mutateAsync({ username: newUsername });
        }}
        onExportData={async () => {
          await exportData.mutateAsync();
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