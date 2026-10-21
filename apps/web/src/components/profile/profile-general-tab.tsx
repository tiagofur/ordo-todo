"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Save,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  AtSign,
  Clock,
  Lock,
  Camera,
  Check,
  Copy,
  Mail,
  Phone,
  Briefcase,
  Building2,
  ShieldCheck,
} from "lucide-react";
import { useUsernameValidation } from "@ordo-todo/hooks";
import {
  cn,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Input,
  Button,
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
} from "@ordo-todo/ui";
import { TIMEZONES, type Profile } from "./profile-types";

interface ProfileGeneralTabProps {
  profile: Profile | null;
  sessionUser?: { email: string } | null;
  onUpdateProfile: (data: Record<string, unknown>) => Promise<void>;
  onUpdateUsername?: (newUsername: string) => Promise<void>;
  isUpdateProfilePending?: boolean;
  addSuccess: (message: string) => void;
  addError: (message: string) => void;
}

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

export function ProfileGeneralTab({
  profile,
  sessionUser,
  onUpdateProfile,
  onUpdateUsername,
  isUpdateProfilePending = false,
  addSuccess,
  addError,
}: ProfileGeneralTabProps) {
  const [username, setUsername] = useState("");
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
  const [hasCopiedUrl, setHasCopiedUrl] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    jobTitle: "",
    department: "",
    bio: "",
    timezone: "America/Mexico_City",
  });

  const { validationResult, validateUsername, resetValidation } = useUsernameValidation({
    apiClient: {} as unknown as Parameters<typeof useUsernameValidation>[0]["apiClient"],
    minLength: 3,
    maxLength: 20,
    debounceMs: 500,
    currentUsername: profile?.username || undefined,
  });

  useEffect(() => {
    if (isEditingUsername && username && username.length >= 1) {
      validateUsername(username);
    } else if (!isEditingUsername) {
      resetValidation();
    }
  }, [username, isEditingUsername]);

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
    }
  }, [profile]);

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

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleCopyProfileUrl = () => {
    const handle = profile?.username || "user";
    // No verified production domain yet (ODD 013 S10): copy the local
    // handle instead of a fake URL. When business provides the domain,
    // restore `https://${domain}/@${handle}` here and below.
    navigator.clipboard?.writeText(`@${handle}`);
    setHasCopiedUrl(true);
    setTimeout(() => setHasCopiedUrl(false), 2000);
  };

  const localTime = getLocalTimeInTimezone(profileForm.timezone);
  const plan = profile?.subscription?.plan || "FREE";

  return (
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
              @{username || "username"}
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
  );
}

