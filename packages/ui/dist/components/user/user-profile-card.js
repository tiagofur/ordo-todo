"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from '../ui/alert-dialog';
import { User, Calendar, MapPin, Globe, Edit, X, AlertTriangle, Info, Clock, Zap, AlertCircle, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { UsernameInput } from '../auth/username-input';
export function UserProfileCard({ user, onUpdateUsername, onUpdateProfile, showEditButton = true, className, variant = 'default', }) {
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
    const [updateError, setUpdateError] = useState(null);
    // Mock API client for UsernameInput - replace with actual implementation
    const mockApiClient = {};
    const handleUsernameUpdate = async () => {
        if (!onUpdateUsername || username === user.username)
            return;
        setIsUpdating(true);
        setUpdateError(null);
        try {
            await onUpdateUsername(username);
            setIsEditingUsername(false);
        }
        catch (error) {
            setUpdateError(error instanceof Error ? error.message : 'Failed to update username');
        }
        finally {
            setIsUpdating(false);
        }
    };
    const handleProfileUpdate = async () => {
        if (!onUpdateProfile)
            return;
        setIsUpdating(true);
        setUpdateError(null);
        try {
            await onUpdateProfile(profileData);
            setIsEditingProfile(false);
        }
        catch (error) {
            setUpdateError(error instanceof Error ? error.message : 'Failed to update profile');
        }
        finally {
            setIsUpdating(false);
        }
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };
    const getInitials = (name, username) => {
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
        if (user.image)
            return user.image;
        // Generate avatar URL based on username for consistent avatars
        return `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}&backgroundColor=6366f1`;
    };
    if (variant === 'minimal') {
        return (_jsxs("div", { className: cn('flex items-center gap-3', className), children: [_jsxs(Avatar, { className: "h-10 w-10", children: [_jsx(AvatarImage, { src: getAvatarUrl(), alt: user.name || user.username }), _jsx(AvatarFallback, { children: getInitials(user.name, user.username) })] }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-sm", children: user.name || user.username }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["@", user.username] })] })] }));
    }
    if (variant === 'compact') {
        return (_jsx(Card, { className: cn('', className), children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs(Avatar, { className: "h-12 w-12", children: [_jsx(AvatarImage, { src: getAvatarUrl(), alt: user.name || user.username }), _jsx(AvatarFallback, { children: getInitials(user.name, user.username) })] }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "font-semibold", children: user.name || user.username }), _jsxs("p", { className: "text-sm text-muted-foreground", children: ["@", user.username] }), _jsx("p", { className: "text-xs text-muted-foreground", children: user.email })] }), showEditButton && (_jsx(Button, { variant: "ghost", size: "sm", children: _jsx(Edit, { className: "h-4 w-4" }) }))] }) }) }));
    }
    return (_jsxs(Card, { className: cn('', className), children: [_jsx(CardHeader, { className: "pb-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { className: "text-lg", children: "Profile" }), showEditButton && (_jsxs(Dialog, { open: isEditingProfile, onOpenChange: setIsEditingProfile, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Edit, { className: "h-4 w-4 mr-2" }), "Edit Profile"] }) }), _jsxs(DialogContent, { className: "sm:max-w-[425px]", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Edit Profile" }), _jsx(DialogDescription, { children: "Update your profile information." })] }), _jsxs("div", { className: "space-y-4 py-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "name", children: "Display Name" }), _jsx(Input, { id: "name", value: profileData.name, onChange: (e) => setProfileData(prev => ({ ...prev, name: e.target.value })), placeholder: "Enter your name" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "bio", children: "Bio" }), _jsx("textarea", { id: "bio", className: "w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", value: profileData.bio, onChange: (e) => setProfileData(prev => ({ ...prev, bio: e.target.value })), placeholder: "Tell us about yourself" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "location", children: "Location" }), _jsx(Input, { id: "location", value: profileData.location, onChange: (e) => setProfileData(prev => ({ ...prev, location: e.target.value })), placeholder: "City, Country" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "website", children: "Website" }), _jsx(Input, { id: "website", type: "url", value: profileData.website, onChange: (e) => setProfileData(prev => ({ ...prev, website: e.target.value })), placeholder: "https://yourwebsite.com" })] })] }), updateError && (_jsxs("div", { className: "flex items-center gap-2 text-sm text-destructive", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), updateError] })), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx(Button, { variant: "outline", onClick: () => setIsEditingProfile(false), disabled: isUpdating, children: "Cancel" }), _jsxs(Button, { onClick: handleProfileUpdate, disabled: isUpdating, children: [isUpdating && _jsx(Clock, { className: "h-4 w-4 mr-2 animate-spin" }), "Save Changes"] })] })] })] }))] }) }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "flex items-start gap-4", children: [_jsxs(Avatar, { className: "h-16 w-16", children: [_jsx(AvatarImage, { src: getAvatarUrl(), alt: user.name || user.username }), _jsx(AvatarFallback, { className: "text-lg", children: getInitials(user.name, user.username) })] }), _jsxs("div", { className: "flex-1", children: [_jsx("h2", { className: "text-2xl font-bold", children: user.name || 'User' }), _jsxs("div", { className: "flex items-center gap-2 text-muted-foreground", children: [user.username ? (_jsxs("span", { children: ["@", user.username] })) : (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(AlertCircle, { className: "h-4 w-4 text-yellow-500" }), _jsx("span", { className: "text-yellow-600 dark:text-yellow-400", children: "No username set" })] })), _jsxs(Badge, { variant: "secondary", className: "text-xs", children: ["ID: ", user.id.slice(-8)] })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: user.email }), user.bio && (_jsx("p", { className: "mt-2 text-sm", children: user.bio })), !user.username && (_jsxs("div", { className: "mt-2 flex items-center gap-2 text-sm text-muted-foreground", children: [_jsx(Info, { className: "h-3 w-3" }), _jsx("span", { children: "Username is required for profile URL and sharing" })] }))] })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(User, { className: "h-4 w-4" }), _jsx(Label, { className: "text-sm font-medium", children: "Username" }), _jsxs("div", { className: "flex items-center gap-1 text-xs text-muted-foreground", children: [_jsx(Info, { className: "h-3 w-3" }), _jsx("span", { children: "Part of your profile URL" })] })] }), user.username ? (onUpdateUsername && (_jsxs(Dialog, { open: isEditingUsername, onOpenChange: setIsEditingUsername, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { variant: "ghost", size: "sm", children: [_jsx(Edit, { className: "h-4 w-4 mr-2" }), "Change"] }) }), _jsxs(DialogContent, { className: "sm:max-w-[425px]", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Change Username" }), _jsx(DialogDescription, { children: "Enter your new username. This will change your profile URL." })] }), _jsx("div", { className: "space-y-4 py-4", children: _jsx(UsernameInput, { value: username, onChange: setUsername, apiClient: mockApiClient, label: "New Username", helperText: "This will be your new profile identifier" }) }), updateError && (_jsxs("div", { className: "flex items-center gap-2 text-sm text-destructive", children: [_jsx(X, { className: "h-4 w-4" }), updateError] })), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx(Button, { variant: "outline", onClick: () => {
                                                                    setIsEditingUsername(false);
                                                                    setUsername(user.username);
                                                                    setUpdateError(null);
                                                                }, disabled: isUpdating, children: "Cancel" }), _jsxs(AlertDialog, { children: [_jsx(AlertDialogTrigger, { asChild: true, children: _jsx(Button, { disabled: isUpdating || username === user.username || username.length < 3, children: isUpdating ? (_jsxs(_Fragment, { children: [_jsx(Clock, { className: "h-4 w-4 mr-2 animate-spin" }), "Updating..."] })) : (_jsxs(_Fragment, { children: [_jsx(Zap, { className: "h-4 w-4 mr-2" }), "Change Username"] })) }) }), _jsxs(AlertDialogContent, { children: [_jsxs(AlertDialogHeader, { children: [_jsx(AlertDialogTitle, { children: "Change Username" }), _jsxs(AlertDialogDescription, { children: ["Are you sure you want to change your username from", ' ', _jsxs("span", { className: "font-medium", children: ["@", user.username] }), " to", ' ', _jsxs("span", { className: "font-medium", children: ["@", username] }), "?", _jsx("br", {}), _jsx("br", {}), "This will change your profile URL and may affect bookmarks."] })] }), _jsxs(AlertDialogFooter, { children: [_jsx(AlertDialogCancel, { children: "Cancel" }), _jsx(AlertDialogAction, { onClick: handleUsernameUpdate, children: "Yes, Change Username" })] })] })] })] })] })] }))) : (onUpdateUsername && (_jsxs(Dialog, { open: isEditingUsername, onOpenChange: setIsEditingUsername, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Add Username"] }) }), _jsxs(DialogContent, { className: "sm:max-w-[425px]", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Add Username" }), _jsx(DialogDescription, { children: "Choose a username for your profile. This will be part of your profile URL and must be unique." })] }), _jsx("div", { className: "space-y-4 py-4", children: _jsx(UsernameInput, { value: username, onChange: setUsername, apiClient: mockApiClient, label: "Username", helperText: "This will be your unique profile identifier" }) }), updateError && (_jsxs("div", { className: "flex items-center gap-2 text-sm text-destructive", children: [_jsx(X, { className: "h-4 w-4" }), updateError] })), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx(Button, { variant: "outline", onClick: () => {
                                                                    setIsEditingUsername(false);
                                                                    setUsername('');
                                                                    setUpdateError(null);
                                                                }, disabled: isUpdating, children: "Cancel" }), _jsxs(AlertDialog, { children: [_jsx(AlertDialogTrigger, { asChild: true, children: _jsx(Button, { disabled: isUpdating || username.length < 3, children: isUpdating ? (_jsxs(_Fragment, { children: [_jsx(Clock, { className: "h-4 w-4 mr-2 animate-spin" }), "Adding..."] })) : (_jsxs(_Fragment, { children: [_jsx(Zap, { className: "h-4 w-4 mr-2" }), "Add Username"] })) }) }), _jsxs(AlertDialogContent, { children: [_jsxs(AlertDialogHeader, { children: [_jsx(AlertDialogTitle, { children: "Add Username" }), _jsxs(AlertDialogDescription, { children: ["Are you sure you want to add the username", ' ', _jsxs("span", { className: "font-medium", children: [" @", username] }), "?", _jsx("br", {}), _jsx("br", {}), "This will be your permanent profile identifier."] })] }), _jsxs(AlertDialogFooter, { children: [_jsx(AlertDialogCancel, { children: "Cancel" }), _jsx(AlertDialogAction, { onClick: handleUsernameUpdate, children: "Yes, Add Username" })] })] })] })] })] })] })))] }), _jsx("div", { className: "bg-muted/50 rounded-lg p-3", children: _jsxs("code", { className: "text-sm", children: ["ordo-todo.com/", username || 'username', "/workspace-name"] }) })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [_jsx(Calendar, { className: "h-4 w-4" }), _jsxs("span", { children: ["Joined ", formatDate(user.createdAt)] })] }), user.location && (_jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [_jsx(MapPin, { className: "h-4 w-4" }), _jsx("span", { children: user.location })] })), user.website && (_jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx(Globe, { className: "h-4 w-4" }), _jsx("a", { href: user.website, target: "_blank", rel: "noopener noreferrer", className: "text-primary hover:underline", children: user.website.replace(/^https?:\/\//, '') })] }))] })] })] }));
}
