'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../../../utils/index.js';
import { Badge } from '../../ui/badge.js';
import { Card } from '../../ui/card.js';
import { Button } from '../../ui/button.js';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/dropdown-menu.js';
import { MoreVertical, FileText, Video, Calendar, CheckCircle2, GripVertical, Edit, Trash, ArrowRight } from 'lucide-react';
const statusConfig = {
    SCRIPTING: {
        label: 'Scripting',
        color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        icon: _jsx(FileText, { className: "size-3" })
    },
    FILMING: {
        label: 'Filming',
        color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        icon: _jsx(Video, { className: "size-3" })
    },
    EDITING: {
        label: 'Editing',
        color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        icon: _jsx(Video, { className: "size-3" })
    },
    SCHEDULED: {
        label: 'Scheduled',
        color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
        icon: _jsx(Calendar, { className: "size-3" })
    },
    PUBLISHED: {
        label: 'Published',
        color: 'bg-green-500/20 text-green-400 border-green-500/30',
        icon: _jsx(CheckCircle2, { className: "size-3" })
    },
    ARCHIVED: {
        label: 'Archived',
        color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        icon: null
    },
};
const defaultStatus = statusConfig.SCRIPTING;
function getStatusConfig(status) {
    return statusConfig[status] ?? defaultStatus;
}
/**
 * ContentCard component for displaying content pieces in the Pipeline
 * Supports drag & drop with visual feedback
 */
export function ContentCard({ content, onClick, onPress, draggable = false, isDragging = false, compact = false, className, testID, }) {
    const handleClick = onClick ?? onPress;
    const status = getStatusConfig(content.status);
    return (_jsxs(Card, { "data-testid": testID, className: cn('group relative transition-all', 'hover:border-gray-600 hover:shadow-lg hover:shadow-black/20', isDragging && 'opacity-50 shadow-xl rotate-2', compact ? 'p-3' : 'p-4', onClick || onPress ? 'cursor-pointer' : '', className), onClick: handleClick, children: [draggable && (_jsx("div", { className: "absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing", children: _jsx(GripVertical, { className: "size-4 text-gray-500" }) })), _jsxs("div", { className: cn(draggable && 'pl-4'), children: [_jsxs("div", { className: "flex items-start gap-3 mb-2", children: [content.thumbnailUrl ? (_jsx("div", { className: "size-12 rounded-lg bg-gray-800 overflow-hidden flex-shrink-0", children: _jsx("img", { src: content.thumbnailUrl, alt: "", className: "size-full object-cover" }) })) : (_jsx("div", { className: "size-12 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0", children: _jsx(Video, { className: "size-6 text-gray-600" }) })), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h3", { className: cn('font-medium text-gray-100 line-clamp-2', compact ? 'text-sm' : 'text-base'), children: content.title }), content.series && (_jsxs("div", { className: "flex items-center gap-1 mt-1", children: [_jsx("div", { className: "size-2 rounded-full", style: { backgroundColor: content.series.color } }), _jsxs("span", { className: "text-xs text-gray-400 truncate", children: [content.series.name, content.episodeNumber && ` • Ep ${content.episodeNumber}`] })] }))] }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", size: "icon", className: "size-7 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0", onClick: (e) => e.stopPropagation(), children: _jsx(MoreVertical, { className: "size-4" }) }) }), _jsxs(DropdownMenuContent, { align: "end", children: [_jsxs(DropdownMenuItem, { children: [_jsx(Edit, { className: "size-4 mr-2" }), "Edit"] }), _jsxs(DropdownMenuItem, { children: [_jsx(ArrowRight, { className: "size-4 mr-2" }), "Move to..."] }), _jsxs(DropdownMenuItem, { className: "text-red-400", children: [_jsx(Trash, { className: "size-4 mr-2" }), "Delete"] })] })] })] }), !compact && content.description && (_jsx("p", { className: "text-sm text-gray-400 line-clamp-2 mb-3", children: content.description })), _jsxs("div", { className: "flex items-center justify-between mt-3", children: [_jsxs(Badge, { variant: "outline", className: cn('text-xs gap-1', status.color), children: [status.icon, status.label] }), content.scheduledAt && (_jsxs("span", { className: "text-xs text-gray-500 flex items-center gap-1", children: [_jsx(Calendar, { className: "size-3" }), new Date(content.scheduledAt).toLocaleDateString()] }))] })] })] }));
}
export default ContentCard;
