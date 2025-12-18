'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { format } from 'date-fns';
import { FileIcon, Download } from 'lucide-react';
import { Button } from '../ui/button.js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '../ui/table.js';
import { Skeleton } from '../ui/skeleton.js';
function formatFileSize(bytes) {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
function FilesSkeleton() {
    return (_jsxs("div", { className: "space-y-4", children: [_jsx(Skeleton, { className: "h-10 w-full" }), _jsx(Skeleton, { className: "h-10 w-full" }), _jsx(Skeleton, { className: "h-10 w-full" })] }));
}
/**
 * ProjectFiles - Platform-agnostic project files/attachments list
 *
 * Data fetching handled externally.
 *
 * @example
 * const { data: attachments, isLoading } = useProjectAttachments(projectId);
 *
 * <ProjectFiles
 *   attachments={attachments || []}
 *   isLoading={isLoading}
 *   getFullUrl={(url) => url.startsWith('/') ? API_URL + url : url}
 *   labels={{ name: t('name'), empty: t('empty') }}
 * />
 */
export function ProjectFiles({ attachments = [], isLoading = false, getFullUrl = (url) => url, dateLocale, labels = {}, className = '', }) {
    const { empty = 'No files uploaded for this project', name = 'Name', task = 'Task', size = 'Size', uploadedBy = 'Uploaded By', date = 'Date', actions = 'Actions', unknownUser = 'Unknown', } = labels;
    if (isLoading) {
        return _jsx(FilesSkeleton, {});
    }
    if (attachments.length === 0) {
        return (_jsxs("div", { className: `flex flex-col items-center justify-center py-12 text-center text-muted-foreground ${className}`, children: [_jsx(FileIcon, { className: "h-12 w-12 mb-4 opacity-20" }), _jsx("p", { children: empty })] }));
    }
    return (_jsx("div", { className: `rounded-md border ${className}`, children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: name }), _jsx(TableHead, { children: task }), _jsx(TableHead, { children: size }), _jsx(TableHead, { children: uploadedBy }), _jsx(TableHead, { children: date }), _jsx(TableHead, { className: "text-right", children: actions })] }) }), _jsx(TableBody, { children: attachments.map((file) => {
                        const fullUrl = getFullUrl(file.url);
                        return (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(FileIcon, { className: "h-4 w-4 text-muted-foreground" }), _jsx("a", { href: fullUrl, target: "_blank", rel: "noopener noreferrer", className: "hover:underline", children: file.filename })] }) }), _jsx(TableCell, { children: file.task?.title }), _jsx(TableCell, { children: formatFileSize(file.filesize) }), _jsx(TableCell, { children: file.uploadedBy?.name || unknownUser }), _jsx(TableCell, { children: format(new Date(file.uploadedAt), 'PP', dateLocale ? { locale: dateLocale } : undefined) }), _jsx(TableCell, { className: "text-right", children: _jsx(Button, { variant: "ghost", size: "icon", asChild: true, children: _jsx("a", { href: fullUrl, download: true, target: "_blank", rel: "noopener noreferrer", children: _jsx(Download, { className: "h-4 w-4" }) }) }) })] }, file.id));
                    }) })] }) }));
}
