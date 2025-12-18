"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { User, Brain, Shield, Lock, Link2, CreditCard, Settings2, Save, Zap, Sun, Moon, Sunset, Download, Trash2, Calendar, Github, MessageSquare, AlertTriangle, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useUsernameValidation } from "@ordo-todo/hooks";
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from "../ui/alert-dialog.js";
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
export function ProfileTabs({ profile, sessionUser, isLoading = false, onUpdateProfile, onUpdatePreferences, onUpdateUsername, onExportData, onDeleteAccount, isUpdateProfilePending = false, isUpdatePreferencesPending = false, isExportDataPending = false, isDeleteAccountPending = false, addSuccess, addError, desktopOnlyContent }) {
    // Username state
    const [username, setUsername] = useState("");
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
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
    const [aiPreferences, setAiPreferences] = useState({
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
        apiClient: {}, // API client not needed - uses fetch directly
        minLength: 3,
        maxLength: 20,
        debounceMs: 500,
        currentUsername: profile?.username || undefined,
    });
    // Validate username when it changes (only when editing)
    useEffect(() => {
        if (isEditingUsername && username && username.length >= 1) {
            validateUsername(username);
        }
        else if (!isEditingUsername) {
            resetValidation();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        if (!profile?.lastUsernameChangeAt)
            return 0;
        const lastChange = new Date(profile.lastUsernameChangeAt);
        const daysSinceChange = Math.floor((Date.now() - lastChange.getTime()) / (1000 * 60 * 60 * 24));
        return Math.max(0, 30 - daysSinceChange);
    };
    const canChangeUsername = getDaysUntilUsernameChange() === 0;
    async function handleUpdateUsername() {
        if (!onUpdateUsername)
            return;
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
        }
        catch (error) {
            addError?.(error.message || "Failed to update username");
        }
        finally {
            setIsUpdatingUsername(false);
        }
    }
    async function handleSaveProfile() {
        try {
            await onUpdateProfile(profileForm);
            addSuccess?.("Profile updated successfully!");
        }
        catch (error) {
            addError?.(error.message || "Failed to update profile");
        }
    }
    async function handleSaveAiPreferences() {
        try {
            await onUpdatePreferences(aiPreferences);
            addSuccess?.("AI preferences updated successfully!");
        }
        catch (error) {
            addError?.(error.message || "Failed to update AI preferences");
        }
    }
    async function handleSavePrivacyPreferences() {
        try {
            await onUpdatePreferences(privacyPreferences);
            addSuccess?.("Privacy preferences updated successfully!");
        }
        catch (error) {
            addError?.(error.message || "Failed to update privacy preferences");
        }
    }
    async function handleExportData() {
        try {
            await onExportData();
            addSuccess?.("Data export started! The download will begin shortly.");
        }
        catch (error) {
            addError?.(error.message || "Failed to export data");
        }
    }
    async function handleDeleteAccount() {
        try {
            await onDeleteAccount();
        }
        catch (error) {
            addError?.(error.message || "Failed to delete account");
        }
    }
    const getInitials = (name) => {
        if (!name)
            return "U";
        return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    };
    const getPlanBadgeColor = (plan) => {
        switch (plan) {
            case "PRO": return "bg-gradient-to-r from-purple-500 to-pink-500 text-white";
            case "TEAM": return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white";
            case "ENTERPRISE": return "bg-gradient-to-r from-amber-500 to-orange-500 text-white";
            default: return "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300";
        }
    };
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center h-full", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary" }) }));
    }
    return (_jsxs(Tabs.Root, { defaultValue: "profile", className: "mt-6", children: [_jsxs(Tabs.List, { className: "grid w-full grid-cols-4 lg:grid-cols-7 mb-6 h-auto p-1", children: [_jsxs(Tabs.Trigger, { value: "profile", className: cn("inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-2 text-sm font-medium ring-offset-background transition-all", "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", "disabled:pointer-events-none disabled:opacity-50", "flex items-center gap-2"), children: [_jsx(User, { className: "h-4 w-4" }), _jsx("span", { className: "hidden sm:inline", children: "Profile" })] }), _jsxs(Tabs.Trigger, { value: "ai", className: cn("inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-2 text-sm font-medium ring-offset-background transition-all", "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", "disabled:pointer-events-none disabled:opacity-50", "flex items-center gap-2"), children: [_jsx(Brain, { className: "h-4 w-4" }), _jsx("span", { className: "hidden sm:inline", children: "AI" })] }), _jsxs(Tabs.Trigger, { value: "security", className: cn("inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-2 text-sm font-medium ring-offset-background transition-all", "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", "disabled:pointer-events-none disabled:opacity-50", "flex items-center gap-2"), children: [_jsx(Shield, { className: "h-4 w-4" }), _jsx("span", { className: "hidden sm:inline", children: "Security" })] }), _jsxs(Tabs.Trigger, { value: "privacy", className: cn("inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-2 text-sm font-medium ring-offset-background transition-all", "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", "disabled:pointer-events-none disabled:opacity-50", "flex items-center gap-2"), children: [_jsx(Lock, { className: "h-4 w-4" }), _jsx("span", { className: "hidden sm:inline", children: "Privacy" })] }), _jsxs(Tabs.Trigger, { value: "integrations", className: cn("inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-2 text-sm font-medium ring-offset-background transition-all", "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", "disabled:pointer-events-none disabled:opacity-50", "flex items-center gap-2"), children: [_jsx(Link2, { className: "h-4 w-4" }), _jsx("span", { className: "hidden sm:inline", children: "Integrations" })] }), _jsxs(Tabs.Trigger, { value: "subscription", className: cn("inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-2 text-sm font-medium ring-offset-background transition-all", "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", "disabled:pointer-events-none disabled:opacity-50", "flex items-center gap-2"), children: [_jsx(CreditCard, { className: "h-4 w-4" }), _jsx("span", { className: "hidden sm:inline", children: "Subscription" })] }), _jsxs(Tabs.Trigger, { value: "account", className: cn("inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-2 text-sm font-medium ring-offset-background transition-all", "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", "disabled:pointer-events-none disabled:opacity-50", "flex items-center gap-2"), children: [_jsx(Settings2, { className: "h-4 w-4" }), _jsx("span", { className: "hidden sm:inline", children: "Account" })] })] }), _jsx(Tabs.Content, { value: "profile", className: "mt-2", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Profile Information" }), _jsx(CardDescription, { children: "Update your personal information and preferences" })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs(Avatar, { className: "h-20 w-20", children: [_jsx(AvatarImage, { src: profile?.image || undefined }), _jsx(AvatarFallback, { className: "text-lg", children: getInitials(profile?.name) })] }), _jsxs("div", { children: [_jsx(Button, { variant: "outline", size: "sm", children: "Change Avatar" }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "JPG, PNG or GIF. Max 2MB." })] })] }), _jsxs("div", { className: "rounded-lg border p-4 space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(User, { className: "h-4 w-4 text-muted-foreground" }), _jsx(Label, { className: "text-base font-medium", children: "Username" })] }), onUpdateUsername && !isEditingUsername && (_jsx(Button, { variant: "ghost", size: "sm", onClick: () => setIsEditingUsername(true), disabled: !canChangeUsername && !!profile?.username, children: profile?.username ? "Change" : "Add Username" }))] }), isEditingUsername ? (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex gap-2 items-center", children: [_jsxs("div", { className: "relative flex-1 max-w-xs", children: [_jsx(Input, { value: username, onChange: (e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "")), placeholder: "your-username", className: cn("pr-10", validationResult.isLoading && "border-muted", validationResult.isAvailable === true && username.length >= 3 && "border-green-500 focus:border-green-500", validationResult.isAvailable === false && username.length >= 3 && "border-destructive focus:border-destructive") }), _jsxs("div", { className: "absolute right-3 top-1/2 transform -translate-y-1/2", children: [validationResult.isLoading && (_jsx(Loader2, { className: "h-4 w-4 animate-spin text-muted-foreground" })), !validationResult.isLoading && validationResult.isAvailable === true && username.length >= 3 && (_jsx(CheckCircle, { className: "h-4 w-4 text-green-500" })), !validationResult.isLoading && validationResult.isAvailable === false && username.length >= 3 && (_jsx(XCircle, { className: "h-4 w-4 text-destructive" }))] })] }), _jsx(Button, { onClick: handleUpdateUsername, disabled: isUpdatingUsername ||
                                                                username.length < 3 ||
                                                                validationResult.isLoading ||
                                                                validationResult.isAvailable === false ||
                                                                username === profile?.username, size: "sm", children: isUpdatingUsername ? "Saving..." : "Save" }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => {
                                                                setIsEditingUsername(false);
                                                                setUsername(profile?.username || "");
                                                                resetValidation();
                                                            }, children: "Cancel" })] }), username.length > 0 && validationResult.message && (_jsx("p", { className: cn("text-xs flex items-center gap-1", validationResult.isAvailable === true && "text-green-600 dark:text-green-400", validationResult.isAvailable === false && "text-destructive", validationResult.isLoading && "text-muted-foreground"), children: validationResult.message })), username.length > 0 && username.length < 3 && (_jsxs("p", { className: "text-xs text-muted-foreground", children: ["Username must be at least 3 characters (", username.length, "/3)"] })), profile?.username && (_jsxs("div", { className: "flex items-start gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md", children: [_jsx(AlertTriangle, { className: "h-4 w-4 mt-0.5 flex-shrink-0" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Warning: Changing your username will:" }), _jsxs("ul", { className: "list-disc list-inside mt-1 text-xs", children: [_jsx("li", { children: "Change your profile URL" }), _jsx("li", { children: "Break existing bookmarks and shared links" }), _jsx("li", { children: "You can only change it again after 30 days" })] })] })] }))] })) : (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-lg font-medium", children: profile?.username ? `@${profile.username}` : "No username set" }), !profile?.username && (_jsx(Badge, { variant: "outline", className: "text-amber-600 border-amber-300", children: "Required" }))] }), _jsxs("p", { className: "text-sm text-muted-foreground", children: ["Your profile URL: ordotodo.app/", profile?.username || "username", "/workspace"] }), !canChangeUsername && profile?.username && (_jsxs("p", { className: "text-xs text-muted-foreground", children: ["You can change your username again in ", getDaysUntilUsernameChange(), " days"] }))] }))] }), _jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "name", children: "Full Name" }), _jsx(Input, { id: "name", value: profileForm.name, onChange: (e) => setProfileForm({ ...profileForm, name: e.target.value }), placeholder: "John Doe" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", children: "Email" }), _jsx(Input, { id: "email", value: sessionUser?.email || "", disabled: true, className: "bg-muted" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Email cannot be changed" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "phone", children: "Phone" }), _jsx(Input, { id: "phone", value: profileForm.phone, onChange: (e) => setProfileForm({ ...profileForm, phone: e.target.value }), placeholder: "+1 555 0123" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "jobTitle", children: "Job Title" }), _jsx(Input, { id: "jobTitle", value: profileForm.jobTitle, onChange: (e) => setProfileForm({ ...profileForm, jobTitle: e.target.value }), placeholder: "Product Manager" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "department", children: "Department" }), _jsx(Input, { id: "department", value: profileForm.department, onChange: (e) => setProfileForm({ ...profileForm, department: e.target.value }), placeholder: "Engineering" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "timezone", children: "Timezone" }), _jsxs(Select, { value: profileForm.timezone, onValueChange: (value) => setProfileForm({ ...profileForm, timezone: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select timezone" }) }), _jsx(SelectContent, { children: TIMEZONES.map((tz) => (_jsx(SelectItem, { value: tz.value, children: tz.label }, tz.value))) })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "bio", children: "Bio" }), _jsx(Textarea, { id: "bio", value: profileForm.bio, onChange: (e) => setProfileForm({ ...profileForm, bio: e.target.value }), placeholder: "Tell us a bit about yourself...", rows: 3 })] }), _jsx("div", { className: "flex justify-end", children: _jsxs(Button, { onClick: handleSaveProfile, disabled: isUpdateProfilePending, children: [_jsx(Save, { className: "h-4 w-4 mr-2" }), isUpdateProfilePending ? "Saving..." : "Save Changes"] }) })] })] }) }), _jsx(Tabs.Content, { value: "ai", className: "mt-2", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Brain, { className: "h-5 w-5" }), "AI & Productivity"] }), _jsx(CardDescription, { children: "Configure how AI helps you be more productive" })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg", children: [_jsxs("div", { className: "space-y-0.5", children: [_jsx(Label, { className: "text-base", children: "Enable AI Features" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Allow AI to analyze your tasks and provide suggestions" })] }), _jsx(Switch, { checked: aiPreferences.enableAI, onCheckedChange: (checked) => setAiPreferences({ ...aiPreferences, enableAI: checked }) })] }), aiPreferences.enableAI && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium", children: "AI Suggestions" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Label, { children: "Suggest task durations" }), _jsx(Switch, { checked: aiPreferences.aiSuggestTaskDurations, onCheckedChange: (checked) => setAiPreferences({ ...aiPreferences, aiSuggestTaskDurations: checked }) })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Label, { children: "Suggest priorities" }), _jsx(Switch, { checked: aiPreferences.aiSuggestPriorities, onCheckedChange: (checked) => setAiPreferences({ ...aiPreferences, aiSuggestPriorities: checked }) })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Label, { children: "Suggest optimal scheduling" }), _jsx(Switch, { checked: aiPreferences.aiSuggestScheduling, onCheckedChange: (checked) => setAiPreferences({ ...aiPreferences, aiSuggestScheduling: checked }) })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Label, { children: "Weekly AI productivity reports" }), _jsx(Switch, { checked: aiPreferences.aiWeeklyReports, onCheckedChange: (checked) => setAiPreferences({ ...aiPreferences, aiWeeklyReports: checked }) })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(Label, { children: "AI Aggressiveness" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "How often AI should suggest changes" })] }), _jsxs("span", { className: "text-sm font-medium", children: [aiPreferences.aiAggressiveness, "/10"] })] }), _jsx(Slider, { value: [aiPreferences.aiAggressiveness], onValueChange: ([value]) => setAiPreferences({ ...aiPreferences, aiAggressiveness: value ?? 5 }), min: 1, max: 10, step: 1 }), _jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [_jsx("span", { children: "Conservative" }), _jsx("span", { children: "Proactive" })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsxs("h4", { className: "font-medium flex items-center gap-2", children: [_jsx(Zap, { className: "h-4 w-4" }), "Energy Profile"] }), _jsx("p", { className: "text-sm text-muted-foreground", children: "AI uses this to schedule demanding tasks during your peak hours" })] }), _jsx("div", { className: "grid gap-4 sm:grid-cols-3", children: ["morningEnergy", "afternoonEnergy", "eveningEnergy"].map((period) => (_jsxs("div", { className: "space-y-2", children: [_jsxs(Label, { className: "capitalize", children: [period.replace("Energy", ""), " Energy"] }), _jsxs(Select, { value: aiPreferences[period], onValueChange: (value) => setAiPreferences({ ...aiPreferences, [period]: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: ENERGY_LEVELS.map((level) => (_jsx(SelectItem, { value: level.value, children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(level.icon, { className: `h-4 w-4 ${level.color}` }), level.label] }) }, level.value))) })] })] }, period))) })] })] })), _jsx("div", { className: "flex justify-end", children: _jsxs(Button, { onClick: handleSaveAiPreferences, disabled: isUpdatePreferencesPending, children: [_jsx(Save, { className: "h-4 w-4 mr-2" }), isUpdatePreferencesPending ? "Saving..." : "Save AI Preferences"] }) })] })] }) }), _jsx(Tabs.Content, { value: "security", className: "mt-2", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Shield, { className: "h-5 w-5" }), "Security"] }), _jsx(CardDescription, { children: "Manage your account security settings" })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg", children: [_jsxs("div", { className: "space-y-0.5", children: [_jsx(Label, { className: "text-base", children: "Password" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Last changed: 3 months ago" })] }), _jsx(Button, { variant: "outline", children: "Change Password" })] }), _jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg", children: [_jsxs("div", { className: "space-y-0.5", children: [_jsx(Label, { className: "text-base", children: "Two-Factor Authentication" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Add an extra layer of security to your account" })] }), _jsx(Badge, { variant: "outline", children: "Coming Soon" })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium", children: "Connected Accounts" }), _jsx("div", { className: "space-y-2", children: _jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center", children: _jsx("span", { className: "text-blue-500 text-lg", children: "G" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Google" }), _jsx("p", { className: "text-xs text-muted-foreground", children: sessionUser?.email })] })] }), _jsx(Badge, { variant: "secondary", children: "Connected" })] }) })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium", children: "Active Sessions" }), _jsx("div", { className: "p-3 border rounded-lg", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center", children: _jsx("span", { className: "text-green-500 text-xl", children: "\uD83D\uDCBB" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Current Session" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "This device" })] })] }), _jsx(Badge, { variant: "outline", className: "text-green-500 border-green-500", children: "Active" })] }) })] })] })] }) }), _jsx(Tabs.Content, { value: "privacy", className: "mt-2", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Lock, { className: "h-5 w-5" }), "Privacy & Data"] }), _jsx(CardDescription, { children: "Control how your data is used and shared" })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium", children: "Data Sharing" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "space-y-0.5", children: [_jsx(Label, { children: "Share usage analytics" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Help improve Ordo-Todo with anonymous usage data" })] }), _jsx(Switch, { checked: privacyPreferences.shareAnalytics, onCheckedChange: (checked) => setPrivacyPreferences({ ...privacyPreferences, shareAnalytics: checked }) })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "space-y-0.5", children: [_jsx(Label, { children: "Show activity status" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Let teammates see when you are working on tasks" })] }), _jsx(Switch, { checked: privacyPreferences.showActivityStatus, onCheckedChange: (checked) => setPrivacyPreferences({ ...privacyPreferences, showActivityStatus: checked }) })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium", children: "Email Notifications" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Label, { children: "Task reminder emails" }), _jsx(Switch, { checked: privacyPreferences.taskRemindersEmail, onCheckedChange: (checked) => setPrivacyPreferences({ ...privacyPreferences, taskRemindersEmail: checked }) })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Label, { children: "Weekly productivity digest" }), _jsx(Switch, { checked: privacyPreferences.weeklyDigestEmail, onCheckedChange: (checked) => setPrivacyPreferences({ ...privacyPreferences, weeklyDigestEmail: checked }) })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Label, { children: "Marketing and product updates" }), _jsx(Switch, { checked: privacyPreferences.marketingEmail, onCheckedChange: (checked) => setPrivacyPreferences({ ...privacyPreferences, marketingEmail: checked }) })] })] })] }), _jsx("div", { className: "flex justify-end", children: _jsxs(Button, { onClick: handleSavePrivacyPreferences, disabled: isUpdatePreferencesPending, children: [_jsx(Save, { className: "h-4 w-4 mr-2" }), isUpdatePreferencesPending ? "Saving..." : "Save Privacy Settings"] }) })] })] }) }), _jsx(Tabs.Content, { value: "integrations", className: "mt-2", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Link2, { className: "h-5 w-5" }), "Integrations"] }), _jsx(CardDescription, { children: "Connect with third-party services" })] }), _jsx(CardContent, { className: "space-y-4", children: INTEGRATIONS.map((integration) => (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "h-10 w-10 rounded-lg bg-muted flex items-center justify-center", children: _jsx(integration.icon, { className: "h-5 w-5" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: integration.name }), _jsx("p", { className: "text-sm text-muted-foreground", children: integration.description })] })] }), integration.available ? (_jsx(Button, { variant: "outline", children: "Connect" })) : (_jsx(Badge, { variant: "outline", children: "Coming Soon" }))] }, integration.id))) })] }) }), _jsx(Tabs.Content, { value: "subscription", className: "mt-2", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(CreditCard, { className: "h-5 w-5" }), "Subscription & Billing"] }), _jsx(CardDescription, { children: "Manage your subscription and billing details" })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "p-6 border rounded-lg bg-gradient-to-br from-background to-muted", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold", children: "Current Plan" }), _jsx(Badge, { className: getPlanBadgeColor(profile?.subscription?.plan || "FREE"), children: profile?.subscription?.plan || "FREE" })] }), profile?.subscription?.plan === "FREE" && (_jsx(Button, { className: "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600", children: "Upgrade to Pro" }))] }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-green-500", children: "\u2713" }), _jsx("span", { children: "Unlimited tasks" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-green-500", children: "\u2713" }), _jsx("span", { children: "3 workspaces" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-green-500", children: "\u2713" }), _jsx("span", { children: "Basic AI suggestions" })] }), profile?.subscription?.plan === "FREE" && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex items-center gap-2 text-muted-foreground", children: [_jsx("span", { children: "\u2717" }), _jsx("span", { children: "Advanced analytics" })] }), _jsxs("div", { className: "flex items-center gap-2 text-muted-foreground", children: [_jsx("span", { children: "\u2717" }), _jsx("span", { children: "Team collaboration" })] })] }))] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium", children: "Billing History" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "No billing history available" })] })] })] }) }), _jsx(Tabs.Content, { value: "account", className: "mt-2", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Settings2, { className: "h-5 w-5" }), "Account Settings"] }), _jsx(CardDescription, { children: "Manage your account data and settings" })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsx("div", { className: "p-4 border rounded-lg", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "space-y-0.5", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Download, { className: "h-4 w-4" }), _jsx(Label, { className: "text-base", children: "Export Your Data" })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Download all your data including tasks, projects, time sessions, and settings in JSON format" })] }), _jsx(Button, { variant: "outline", onClick: handleExportData, disabled: isExportDataPending, children: isExportDataPending ? "Exporting..." : "Request Export" })] }) }), desktopOnlyContent, _jsx("div", { className: "p-4 border border-destructive/50 rounded-lg bg-destructive/5", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "space-y-0.5", children: [_jsxs("div", { className: "flex items-center gap-2 text-destructive", children: [_jsx(Trash2, { className: "h-4 w-4" }), _jsx(Label, { className: "text-base text-destructive", children: "Delete Account" })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Permanently delete your account and all associated data. This action cannot be undone." })] }), _jsxs(AlertDialog, { children: [_jsx(AlertDialogTrigger, { asChild: true, children: _jsx(Button, { variant: "destructive", children: "Delete Account" }) }), _jsxs(AlertDialogContent, { children: [_jsxs(AlertDialogHeader, { children: [_jsxs(AlertDialogTitle, { className: "flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "h-5 w-5 text-destructive" }), "Delete Account"] }), _jsx(AlertDialogDescription, { children: "This action cannot be undone. This will permanently delete your account and remove all your data from our servers." })] }), _jsxs(AlertDialogFooter, { children: [_jsx(AlertDialogCancel, { children: "Cancel" }), _jsx(AlertDialogAction, { onClick: handleDeleteAccount, className: "bg-destructive hover:bg-destructive/90", children: isDeleteAccountPending ? "Deleting..." : "Delete Account" })] })] })] })] }) })] })] }) })] }));
}
