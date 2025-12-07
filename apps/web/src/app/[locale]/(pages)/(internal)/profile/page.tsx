"use client";

import { useRouter } from "next/navigation";
import { ProfileTabs } from "@ordo-todo/ui";
import useSession from "@/data/hooks/use-session.hook";
import { useFullProfile, useUpdateProfile, useUpdatePreferences, useExportData, useDeleteAccount } from "@/lib/api-hooks";
import useMessages from "@/data/hooks/use-messages.hook";
import Title from "@/components/template/title.component";

export default function ProfilePage() {
  const router = useRouter();
  const { user: sessionUser, endSession } = useSession();
  const { data: profile, isLoading } = useFullProfile();
  const updateProfile = useUpdateProfile();
  const updatePreferences = useUpdatePreferences();
  const exportData = useExportData();
  const deleteAccount = useDeleteAccount();
  const { addSuccess, addError } = useMessages();

  async function handleDeleteAccount() {
    try {
      await deleteAccount.mutateAsync();
      endSession();
      router.push("/login");
    } catch (error: any) {
      addError(error.message || "Failed to delete account");
    }
  }

  return (
    <div className="container max-w-4xl py-6">
      <Title title="Profile Settings" />

      <ProfileTabs
        profile={profile}
        sessionUser={sessionUser}
        isLoading={isLoading}
        onUpdateProfile={async (data) => {
          await updateProfile.mutateAsync(data);
        }}
        onUpdatePreferences={async (data) => {
          await updatePreferences.mutateAsync(data);
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