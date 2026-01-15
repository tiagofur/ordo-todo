'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../../../utils/index.js';
import { ContentCard } from './ContentCard.js';
import { Plus } from 'lucide-react';
import { Button } from '../../ui/button.js';
const columnConfig = {
    SCRIPTING: { title: 'Scripting', color: '#EAB308', bgColor: 'bg-yellow-500/10' },
    FILMING: { title: 'Filming', color: '#3B82F6', bgColor: 'bg-blue-500/10' },
    EDITING: { title: 'Editing', color: '#A855F7', bgColor: 'bg-purple-500/10' },
    SCHEDULED: { title: 'Scheduled', color: '#06B6D4', bgColor: 'bg-cyan-500/10' },
    PUBLISHED: { title: 'Published', color: '#22C55E', bgColor: 'bg-green-500/10' },
};
/**
 * PipelineColumn component for a single pipeline stage
 */
export function PipelineColumn({ status, title, color, children, count = 0, onDrop, isDropTarget = false, className, }) {
    return (_jsxs("div", { className: cn('flex flex-col w-72 min-w-72 rounded-xl p-3', 'bg-gray-900/50 border border-gray-800', isDropTarget && 'border-cyan-500 ring-2 ring-cyan-500/20', className), children: [_jsxs("div", { className: "flex items-center justify-between mb-3 px-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "size-3 rounded-full", style: { backgroundColor: color } }), _jsx("h3", { className: "font-medium text-gray-200", children: title }), _jsx("span", { className: "text-xs text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded", children: count })] }), _jsx(Button, { variant: "ghost", size: "icon", className: "size-6", children: _jsx(Plus, { className: "size-4" }) })] }), _jsx("div", { className: "flex-1 space-y-2 overflow-y-auto min-h-[200px] max-h-[calc(100vh-300px)]", children: children })] }));
}
/**
 * ContentPipeline (Kanban board) for content workflow management
 */
export function ContentPipeline({ pipeline, onContentClick, onStatusChange, loading = false, className, }) {
    const columns = [
        { status: 'SCRIPTING', items: pipeline.scripting },
        { status: 'FILMING', items: pipeline.filming },
        { status: 'EDITING', items: pipeline.editing },
        { status: 'SCHEDULED', items: pipeline.scheduled },
        { status: 'PUBLISHED', items: pipeline.published },
    ];
    if (loading) {
        return (_jsx("div", { className: cn('flex gap-4 overflow-x-auto pb-4', className), children: columns.map(({ status }) => (_jsxs("div", { className: "w-72 min-w-72 rounded-xl p-3 bg-gray-900/50 border border-gray-800 animate-pulse", children: [_jsx("div", { className: "h-6 bg-gray-800 rounded mb-4 w-24" }), _jsx("div", { className: "space-y-2", children: [1, 2, 3].map((i) => (_jsx("div", { className: "h-24 bg-gray-800 rounded-lg" }, i))) })] }, status))) }));
    }
    return (_jsx("div", { className: cn('flex gap-4 overflow-x-auto pb-4', className), children: columns.map(({ status, items }) => {
            const config = columnConfig[status];
            return (_jsx(PipelineColumn, { status: status, title: config.title, color: config.color, count: items.length, children: items.length === 0 ? (_jsx("div", { className: "flex-1 flex items-center justify-center text-gray-500 text-sm py-8", children: "Drop content here" })) : (items.map((content) => (_jsx(ContentCard, { content: content, onClick: () => onContentClick?.(content.id), draggable: true, compact: true }, content.id)))) }, status));
        }) }));
}
export default ContentPipeline;
