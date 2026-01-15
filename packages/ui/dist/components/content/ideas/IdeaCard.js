'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../../../utils/index.js';
import { Badge } from '../../ui/badge.js';
import { Card } from '../../ui/card.js';
import { Button } from '../../ui/button.js';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/dropdown-menu.js';
import { MoreVertical, Lightbulb, Mic, MessageSquare, Mail, Globe, Upload, ArrowRight, Archive } from 'lucide-react';
const sourceIcons = {
    MANUAL: _jsx(Lightbulb, { className: "size-4" }),
    VOICE: _jsx(Mic, { className: "size-4" }),
    WHATSAPP: _jsx(MessageSquare, { className: "size-4 text-green-500" }),
    TELEGRAM: _jsx(MessageSquare, { className: "size-4 text-blue-500" }),
    EMAIL: _jsx(Mail, { className: "size-4" }),
    BROWSER: _jsx(Globe, { className: "size-4" }),
    IMPORT: _jsx(Upload, { className: "size-4" }),
};
const statusColors = {
    ACTIVE: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    PROMOTED: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    ARCHIVED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    GRAVEYARDED: 'bg-red-500/20 text-red-400 border-red-500/30',
};
/**
 * IdeaCard component for displaying ideas in the Ideas Bank
 * Supports compact and full modes, with actions for promote, archive, edit
 */
export function IdeaCard({ idea, onClick, onPress, onPromote, onArchive, onEdit, selected = false, compact = false, className, testID, }) {
    const handleClick = onClick ?? onPress;
    return (_jsxs(Card, { "data-testid": testID, className: cn('group relative transition-all cursor-pointer', 'hover:border-gray-600 hover:shadow-lg hover:shadow-black/20', selected && 'border-cyan-500 ring-2 ring-cyan-500/20', compact ? 'p-3' : 'p-4', className), onClick: handleClick, children: [_jsxs("div", { className: "flex items-start justify-between gap-2 mb-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [sourceIcons[idea.source] || _jsx(Lightbulb, { className: "size-4" }), _jsx(Badge, { variant: "outline", className: cn('text-xs', statusColors[idea.status]), children: idea.status.toLowerCase() })] }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", size: "icon", className: "size-7 opacity-0 group-hover:opacity-100 transition-opacity", onClick: (e) => e.stopPropagation(), children: _jsx(MoreVertical, { className: "size-4" }) }) }), _jsxs(DropdownMenuContent, { align: "end", children: [onPromote && idea.status === 'ACTIVE' && (_jsxs(DropdownMenuItem, { onClick: onPromote, children: [_jsx(ArrowRight, { className: "size-4 mr-2" }), "Promote to Content"] })), onEdit && (_jsx(DropdownMenuItem, { onClick: onEdit, children: "Edit" })), onArchive && idea.status === 'ACTIVE' && (_jsxs(DropdownMenuItem, { onClick: onArchive, children: [_jsx(Archive, { className: "size-4 mr-2" }), "Archive"] }))] })] })] }), _jsx("h3", { className: cn('font-medium text-gray-100 mb-1 line-clamp-2', compact ? 'text-sm' : 'text-base'), children: idea.title }), !compact && idea.description && (_jsx("p", { className: "text-sm text-gray-400 line-clamp-2 mb-3", children: idea.description })), idea.tags && idea.tags.length > 0 && (_jsxs("div", { className: "flex flex-wrap gap-1 mt-2", children: [idea.tags.slice(0, compact ? 2 : 5).map((tag) => (_jsx(Badge, { variant: "secondary", className: "text-xs", style: { backgroundColor: `${tag.color}20`, color: tag.color }, children: tag.name }, tag.id))), idea.tags.length > (compact ? 2 : 5) && (_jsxs(Badge, { variant: "secondary", className: "text-xs", children: ["+", idea.tags.length - (compact ? 2 : 5)] }))] })), !compact && (_jsx("p", { className: "text-xs text-gray-500 mt-3", children: new Date(idea.createdAt).toLocaleDateString() }))] }));
}
export default IdeaCard;
