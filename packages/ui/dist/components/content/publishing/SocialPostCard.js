'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../../../utils/index.js';
import { Card } from '../../ui/card.js';
import { Youtube, Instagram, Twitter, Linkedin, Globe, Mic, Video, Clock, CheckCircle2, AlertCircle, Eye, Heart, MessageSquare, Share2, MoreVertical, Edit, Calendar, Trash } from 'lucide-react';
import { Button } from '../../ui/button.js';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/dropdown-menu.js';
const platformConfig = {
    YOUTUBE: { icon: _jsx(Youtube, { className: "size-4" }), color: '#FF0000' },
    TIKTOK: { icon: _jsx(Video, { className: "size-4" }), color: '#00F2EA' },
    INSTAGRAM: { icon: _jsx(Instagram, { className: "size-4" }), color: '#E4405F' },
    LINKEDIN: { icon: _jsx(Linkedin, { className: "size-4" }), color: '#0A66C2' },
    TWITTER: { icon: _jsx(Twitter, { className: "size-4" }), color: '#1DA1F2' },
    BLOG: { icon: _jsx(Globe, { className: "size-4" }), color: '#6366F1' },
    PODCAST: { icon: _jsx(Mic, { className: "size-4" }), color: '#9333EA' },
};
const statusConfig = {
    DRAFT: { label: 'Draft', color: 'text-gray-400', icon: null },
    SCHEDULED: { label: 'Scheduled', color: 'text-cyan-400', icon: _jsx(Clock, { className: "size-3" }) },
    PUBLISHING: { label: 'Publishing...', color: 'text-yellow-400', icon: _jsx(Clock, { className: "size-3 animate-spin" }) },
    PUBLISHED: { label: 'Published', color: 'text-green-400', icon: _jsx(CheckCircle2, { className: "size-3" }) },
    FAILED: { label: 'Failed', color: 'text-red-400', icon: _jsx(AlertCircle, { className: "size-3" }) },
};
const defaultPlatform = platformConfig.BLOG;
const defaultStatus = statusConfig.DRAFT;
function getPlatformConfig(platform) {
    return platformConfig[platform] ?? defaultPlatform;
}
function getStatusConfig(status) {
    return statusConfig[status] ?? defaultStatus;
}
/**
 * SocialPostCard component for displaying scheduled/published social posts
 */
export function SocialPostCard({ post, onClick, onPress, onEdit, onReschedule, className, testID, }) {
    const handleClick = onClick ?? onPress;
    const platform = getPlatformConfig(post.platform);
    const status = getStatusConfig(post.status);
    return (_jsxs(Card, { "data-testid": testID, className: cn('group relative transition-all p-4', 'hover:border-gray-600 hover:shadow-lg hover:shadow-black/20', onClick || onPress ? 'cursor-pointer' : '', className), onClick: handleClick, children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "size-8 rounded-lg flex items-center justify-center text-white", style: { backgroundColor: platform.color }, children: platform.icon }), _jsxs("div", { className: cn('flex items-center gap-1 text-sm', status.color), children: [status.icon, status.label] })] }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", size: "icon", className: "size-7 opacity-0 group-hover:opacity-100 transition-opacity", onClick: (e) => e.stopPropagation(), children: _jsx(MoreVertical, { className: "size-4" }) }) }), _jsxs(DropdownMenuContent, { align: "end", children: [onEdit && post.status !== 'PUBLISHED' && (_jsxs(DropdownMenuItem, { onClick: onEdit, children: [_jsx(Edit, { className: "size-4 mr-2" }), "Edit"] })), onReschedule && post.status === 'SCHEDULED' && (_jsxs(DropdownMenuItem, { onClick: onReschedule, children: [_jsx(Calendar, { className: "size-4 mr-2" }), "Reschedule"] })), post.platformUrl && (_jsx(DropdownMenuItem, { asChild: true, children: _jsxs("a", { href: post.platformUrl, target: "_blank", rel: "noopener noreferrer", children: [_jsx(Globe, { className: "size-4 mr-2" }), "View on ", post.platform.toLowerCase()] }) })), post.status !== 'PUBLISHED' && (_jsxs(DropdownMenuItem, { className: "text-red-400", children: [_jsx(Trash, { className: "size-4 mr-2" }), "Delete"] }))] })] })] }), post.title && (_jsx("h3", { className: "font-medium text-gray-100 line-clamp-2 mb-2", children: post.title })), post.description && (_jsx("p", { className: "text-sm text-gray-400 line-clamp-2 mb-3", children: post.description })), post.status === 'FAILED' && post.errorMessage && (_jsx("div", { className: "bg-red-500/10 border border-red-500/20 rounded-lg p-2 mb-3", children: _jsx("p", { className: "text-xs text-red-400", children: post.errorMessage }) })), post.scheduledAt && (_jsxs("div", { className: "flex items-center gap-1 text-xs text-gray-500 mb-3", children: [_jsx(Clock, { className: "size-3" }), new Date(post.scheduledAt).toLocaleString()] })), post.status === 'PUBLISHED' && (_jsxs("div", { className: "flex items-center gap-4 pt-3 border-t border-gray-800", children: [post.views !== undefined && (_jsxs("div", { className: "flex items-center gap-1 text-xs text-gray-400", children: [_jsx(Eye, { className: "size-3" }), formatNumber(post.views)] })), post.likes !== undefined && (_jsxs("div", { className: "flex items-center gap-1 text-xs text-gray-400", children: [_jsx(Heart, { className: "size-3" }), formatNumber(post.likes)] })), post.comments !== undefined && (_jsxs("div", { className: "flex items-center gap-1 text-xs text-gray-400", children: [_jsx(MessageSquare, { className: "size-3" }), formatNumber(post.comments)] })), post.shares !== undefined && (_jsxs("div", { className: "flex items-center gap-1 text-xs text-gray-400", children: [_jsx(Share2, { className: "size-3" }), formatNumber(post.shares)] }))] }))] }));
}
function formatNumber(num) {
    if (num >= 1000000)
        return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000)
        return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
}
export default SocialPostCard;
