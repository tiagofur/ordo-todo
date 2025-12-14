"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
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
} from '../ui/alert-dialog';
import {
  User,
  Mail,
  Calendar,
  MapPin,
  Globe,
  Edit,
  Check,
  X,
  AlertTriangle,
  Info,
  Clock,
  Zap
} from 'lucide-react';
import { cn } from '../../lib/utils';
// import { UsernameInput } from '../auth/username-input'; // Temporarily disabled

interface UserProfileCardProps {
  user: {
    id: string;
    username: string;
    name: string | null;
    email: string;
    image?: string | null;
    createdAt: string;
    bio?: string | null;
    location?: string | null;
    website?: string | null;
    timezone?: string;
    locale?: string;
  };
  onUpdateUsername?: (newUsername: string) => Promise<void>;
  onUpdateProfile?: (data: Partial<UserProfileCardProps['user']>) => Promise<void>;
  showEditButton?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'minimal';
}

export function UserProfileCard({
  user,
  onUpdateUsername,
  onUpdateProfile,
  showEditButton = true,
  className,
  variant = 'default',
}: UserProfileCardProps) {
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [username, setUsername] = useState(user.username);
  const [profileData, setProfileData] = useState({
    name: user.name || '',
    bio: user.bio || '',
    location: user.location || '',
    website: user.website || '',
    timezone: user.timezone || '',
    locale: user.locale || '',
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Mock API client for UsernameInput - replace with actual implementation
  // const mockApiClient = {} as any;

  const handleUsernameUpdate = async () => {
    if (!onUpdateUsername || username === user.username) return;

    setIsUpdating(true);
    setUpdateError(null);

    try {
      await onUpdateUsername(username);
      setIsEditingUsername(false);
    } catch (error) {
      setUpdateError(error instanceof Error ? error.message : 'Failed to update username');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleProfileUpdate = async () => {
    if (!onUpdateProfile) return;

    setIsUpdating(true);
    setUpdateError(null);

    try {
      await onUpdateProfile(profileData);
      setIsEditingProfile(false);
    } catch (error) {
      setUpdateError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getInitials = (name: string | null, username: string) => {
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return username.slice(0, 2).toUpperCase();
  };

  const getAvatarUrl = () => {
    if (user.image) return user.image;
    // Generate avatar URL based on username for consistent avatars
    return `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}&backgroundColor=6366f1`;
  };

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <Avatar className="h-10 w-10">
          <AvatarImage src={getAvatarUrl()} alt={user.name || user.username} />
          <AvatarFallback>{getInitials(user.name, user.username)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-sm">{user.name || user.username}</p>
          <p className="text-xs text-muted-foreground">@{user.username}</p>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className={cn('', className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={getAvatarUrl()} alt={user.name || user.username} />
              <AvatarFallback>{getInitials(user.name, user.username)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold">{user.name || user.username}</h3>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            {showEditButton && (
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Profile</CardTitle>
          {showEditButton && (
            <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                  <DialogDescription>
                    Update your profile information.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                      id="bio"
                      className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us about yourself"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profileData.location}
                      onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="City, Country"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={profileData.website}
                      onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>
                {updateError && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    {updateError}
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditingProfile(false)}
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleProfileUpdate} disabled={isUpdating}>
                    {isUpdating && <Clock className="h-4 w-4 mr-2 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* User Info */}
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={getAvatarUrl()} alt={user.name || user.username} />
            <AvatarFallback className="text-lg">
              {getInitials(user.name, user.username)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{user.name || user.username}</h2>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>@{user.username}</span>
              <Badge variant="secondary" className="text-xs">
                ID: {user.id.slice(-8)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            {user.bio && (
              <p className="mt-2 text-sm">{user.bio}</p>
            )}
          </div>
        </div>

        {/* Username Management */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <Label className="text-sm font-medium">Username</Label>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Info className="h-3 w-3" />
                <span>Part of your profile URL</span>
              </div>
            </div>
            {onUpdateUsername && (
              <Dialog open={isEditingUsername} onOpenChange={setIsEditingUsername}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Change
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Username</DialogTitle>
                    <DialogDescription>
                      Your username is part of your profile URL and must be unique.
                      This change will update all your profile URLs.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {/* Temporarily disabled UsernameInput
                    <UsernameInput
                      value={username}
                      onChange={setUsername}
                      apiClient={mockApiClient}
                      label="New Username"
                      helperText="This will be your new unique identifier"
                    />
                    */}
                    <div className="text-center text-muted-foreground">
                      Username input temporarily disabled
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                      <div className="flex items-start gap-2 text-sm">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-800 dark:text-yellow-200">
                            Important: URL Change
                          </p>
                          <p className="text-yellow-700 dark:text-yellow-300">
                            Changing your username will update your profile URLs.
                            Old links will no longer work.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {updateError && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <X className="h-4 w-4" />
                      {updateError}
                    </div>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditingUsername(false);
                        setUsername(user.username);
                        setUpdateError(null);
                      }}
                      disabled={isUpdating}
                    >
                      Cancel
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          disabled={isUpdating || username === user.username || username.length < 3}
                        >
                          {isUpdating ? (
                            <>
                              <Clock className="h-4 w-4 mr-2 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Zap className="h-4 w-4 mr-2" />
                              Change Username
                            </>
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirm Username Change</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to change your username from{' '}
                            <span className="font-medium">@{user.username}</span> to{' '}
                            <span className="font-medium">@{username}</span>?
                            <br />
                            <br />
                            This action cannot be undone and will update all your profile URLs.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleUsernameUpdate}>
                            Yes, Change Username
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <code className="text-sm">
              ordo-todo.com/{username}/workspace-name
            </code>
          </div>
        </div>

        {/* Additional Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Joined {formatDate(user.createdAt)}</span>
          </div>
          {user.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{user.location}</span>
            </div>
          )}
          {user.website && (
            <div className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4" />
              <a
                href={user.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {user.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}