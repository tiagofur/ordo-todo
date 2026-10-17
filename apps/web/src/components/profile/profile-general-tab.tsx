"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Save,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
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

  return (
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
            <Button variant="outline" size="sm">
              Change Avatar
            </Button>
            <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max 2MB.</p>
          </div>
        </div>

        {/* Username Section */}
        <div className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <Label className="text-base font-medium">Username</Label>
            </div>
            {onUpdateUsername && !isEditingUsername && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingUsername(true)}
                disabled={!canChangeUsername && !!profile?.username}
              >
                {profile?.username ? "Change" : "Add Username"}
              </Button>
            )}
          </div>

          {isEditingUsername ? (
            <div className="space-y-3">
              <div className="flex gap-2 items-center">
                <div className="relative flex-1 max-w-xs">
                  <Input
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))
                    }
                    placeholder="your-username"
                    className={cn(
                      "pr-10",
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
                >
                  {isUpdatingUsername ? "Saving..." : "Save"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditingUsername(false);
                    setUsername(profile?.username || "");
                    resetValidation();
                  }}
                >
                  Cancel
                </Button>
              </div>

              {username.length > 0 && validationResult.message && (
                <p
                  className={cn(
                    "text-xs flex items-center gap-1",
                    validationResult.isAvailable === true && "text-green-600 dark:text-green-400",
                    validationResult.isAvailable === false && "text-destructive",
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
                <div className="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900 p-3 rounded-md">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Warning: Changing your username will:</p>
                    <ul className="list-disc list-inside mt-1 text-xs">
                      <li>Change your profile URL</li>
                      <li>Break existing bookmarks and shared links</li>
                      <li>You can only change it again after 30 days</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-lg font-medium">
                  {profile?.username ? `@${profile.username}` : "No username set"}
                </span>
                {!profile?.username && (
                  <Badge variant="outline" className="text-amber-600 border-amber-300">
                    Required
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Your profile URL: ordotodo.app/{profile?.username || "username"}/workspace
              </p>
              {!canChangeUsername && profile?.username && (
                <p className="text-xs text-muted-foreground">
                  You can change your username again in {getDaysUntilUsernameChange()} days
                </p>
              )}
            </div>
          )}
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
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
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
  );
}
