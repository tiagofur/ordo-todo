import React from "react";
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
    sessionUser?: {
        email: string;
    } | null;
    isLoading?: boolean;
    onUpdateProfile: (data: any) => Promise<void>;
    onUpdatePreferences: (data: any) => Promise<void>;
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
export declare function ProfileTabs({ profile, sessionUser, isLoading, onUpdateProfile, onUpdatePreferences, onUpdateUsername, onExportData, onDeleteAccount, isUpdateProfilePending, isUpdatePreferencesPending, isExportDataPending, isDeleteAccountPending, addSuccess, addError, desktopOnlyContent }: ProfileTabsProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=profile-tabs.d.ts.map