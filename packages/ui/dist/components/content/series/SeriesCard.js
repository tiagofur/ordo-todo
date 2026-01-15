'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../../../utils/index.js';
import { Badge } from '../../ui/badge.js';
import { Card } from '../../ui/card.js';
import { Button } from '../../ui/button.js';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/dropdown-menu.js';
import { MoreVertical, Folder, Edit, Archive, Trash } from 'lucide-react';
const seriesTypeConfig = {
    EPISODIC: { label: 'Episodic', color: 'bg-blue-500/20 text-blue-400' },
    THEMATIC: { label: 'Thematic', color: 'bg-purple-500/20 text-purple-400' },
    CHALLENGE: { label: 'Challenge', color: 'bg-orange-500/20 text-orange-400' },
    EVERGREEN: { label: 'Evergreen', color: 'bg-green-500/20 text-green-400' },
};
const defaultSeriesType = seriesTypeConfig.EPISODIC;
function getSeriesTypeConfig(type) {
    return seriesTypeConfig[type] ?? defaultSeriesType;
}
/**
 * SeriesCard component for displaying content series
 */
export function SeriesCard({ series, onClick, onPress, onEdit, compact = false, className, testID, }) {
    const handleClick = onClick ?? onPress;
    const typeConfig = getSeriesTypeConfig(series.seriesType);
    return (_jsxs(Card, { "data-testid": testID, className: cn('group relative transition-all cursor-pointer overflow-hidden', 'hover:border-gray-600 hover:shadow-lg hover:shadow-black/20', !series.isActive && 'opacity-60', className), onClick: handleClick, children: [series.coverImage ? (_jsx("div", { className: "h-24 w-full overflow-hidden", children: _jsx("img", { src: series.coverImage, alt: "", className: "size-full object-cover" }) })) : (_jsx("div", { className: "h-3 w-full", style: { backgroundColor: series.color } })), _jsxs("div", { className: cn(compact ? 'p-3' : 'p-4'), children: [_jsxs("div", { className: "flex items-start justify-between gap-2 mb-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "size-8 rounded-lg flex items-center justify-center", style: { backgroundColor: `${series.color}30` }, children: _jsx(Folder, { className: "size-4", style: { color: series.color } }) }), _jsxs("div", { children: [_jsx("h3", { className: cn('font-medium text-gray-100 line-clamp-1', compact ? 'text-sm' : 'text-base'), children: series.name }), series.contentCount !== undefined && (_jsxs("span", { className: "text-xs text-gray-500", children: [series.contentCount, " ", series.contentCount === 1 ? 'piece' : 'pieces'] }))] })] }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", size: "icon", className: "size-7 opacity-0 group-hover:opacity-100 transition-opacity", onClick: (e) => e.stopPropagation(), children: _jsx(MoreVertical, { className: "size-4" }) }) }), _jsxs(DropdownMenuContent, { align: "end", children: [onEdit && (_jsxs(DropdownMenuItem, { onClick: onEdit, children: [_jsx(Edit, { className: "size-4 mr-2" }), "Edit"] })), _jsxs(DropdownMenuItem, { children: [_jsx(Archive, { className: "size-4 mr-2" }), series.isActive ? 'Deactivate' : 'Activate'] }), _jsxs(DropdownMenuItem, { className: "text-red-400", children: [_jsx(Trash, { className: "size-4 mr-2" }), "Delete"] })] })] })] }), !compact && series.description && (_jsx("p", { className: "text-sm text-gray-400 line-clamp-2 mb-3", children: series.description })), _jsxs("div", { className: "flex items-center justify-between mt-2", children: [_jsx(Badge, { variant: "secondary", className: cn('text-xs', typeConfig.color), children: typeConfig.label }), !series.isActive && (_jsx(Badge, { variant: "secondary", className: "text-xs bg-gray-700 text-gray-400", children: "Inactive" }))] })] })] }));
}
export default SeriesCard;
