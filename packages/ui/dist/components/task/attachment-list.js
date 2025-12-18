'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Download, Trash2, File, Image as ImageIcon, FileText, Film, Music, Eye, X, } from 'lucide-react';
import { cn } from '../../utils/index.js';
import { Button } from '../ui/button.js';
import { formatDistanceToNow } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog.js';
const FILE_ICONS = {
    image: ImageIcon,
    video: Film,
    audio: Music,
    document: FileText,
    default: File,
};
const DEFAULT_LABELS = {
    title: 'Attachments',
    empty: 'No attachments found',
    total: 'Total',
    by: 'by',
    tooltips: {
        preview: 'Preview',
        download: 'Download',
        delete: 'Delete',
    },
    confirmDelete: (filename) => `Are you sure you want to delete ${filename}?`,
};
export function AttachmentList({ taskId, attachments = [], onDelete, resolveUrl, locale = 'en', labels = {}, }) {
    const t = {
        ...DEFAULT_LABELS,
        ...labels,
        tooltips: { ...DEFAULT_LABELS.tooltips, ...labels.tooltips },
    };
    const [previewAttachment, setPreviewAttachment] = useState(null);
    const getFileType = (mimeType) => {
        if (mimeType.startsWith('image/'))
            return 'image';
        if (mimeType.startsWith('video/'))
            return 'video';
        if (mimeType.startsWith('audio/'))
            return 'audio';
        if (mimeType.includes('pdf') ||
            mimeType.includes('document') ||
            mimeType.includes('word') ||
            mimeType.includes('excel') ||
            mimeType.includes('text')) {
            return 'document';
        }
        return 'default';
    };
    const formatFileSize = (bytes) => {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };
    const getFullUrl = (url) => {
        if (resolveUrl)
            return resolveUrl(url);
        return url;
    };
    const handleDownload = (attachment) => {
        const link = document.createElement('a');
        link.href = getFullUrl(attachment.url);
        link.download = attachment.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    const handleDelete = async (attachment) => {
        const confirmMsg = t.confirmDelete ? t.confirmDelete(attachment.filename) : `Delete ${attachment.filename}?`;
        if (window.confirm(confirmMsg)) {
            if (onDelete) {
                try {
                    await onDelete(String(attachment.id));
                }
                catch (err) {
                    console.error(err);
                }
            }
        }
    };
    const isImage = (type) => type.startsWith('image/');
    const isPDF = (type) => type.includes('pdf');
    const handlePreview = (attachment) => {
        if (isImage(attachment.mimeType)) {
            setPreviewAttachment(attachment);
        }
        else {
            window.open(getFullUrl(attachment.url), '_blank');
        }
    };
    if (attachments.length === 0) {
        return (_jsx("div", { className: "text-center py-8 text-sm text-muted-foreground border border-dashed rounded-lg", children: t.empty }));
    }
    const dateLocale = locale === 'es' ? es : enUS;
    return (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("p", { className: "text-sm font-semibold", children: [t.title, " (", attachments.length, ")"] }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [formatFileSize(attachments.reduce((acc, att) => acc + att.filesize, 0)), ' ', t.total] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: attachments.map((attachment) => {
                    const fileType = getFileType(attachment.mimeType);
                    const FileIcon = FILE_ICONS[fileType];
                    const canPreview = isImage(attachment.mimeType) || isPDF(attachment.mimeType);
                    return (_jsxs("div", { className: cn('group relative rounded-lg border p-3 transition-all', 'hover:bg-accent/50 hover:shadow-md'), children: [isImage(attachment.mimeType) && (_jsxs("div", { className: "mb-3 relative aspect-video rounded-md overflow-hidden bg-muted", children: [_jsx("img", { src: getFullUrl(attachment.url), alt: attachment.filename, className: "object-cover w-full h-full" }), _jsx("div", { className: "absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2", children: _jsx(Button, { variant: "secondary", size: "sm", onClick: () => handlePreview(attachment), children: _jsx(Eye, { className: "h-4 w-4" }) }) })] })), _jsxs("div", { className: "flex items-start gap-3", children: [!isImage(attachment.mimeType) && (_jsx("div", { className: "shrink-0 rounded-lg bg-muted p-2", children: _jsx(FileIcon, { className: "h-5 w-5 text-muted-foreground" }) })), _jsxs("div", { className: "flex-1 min-w-0 space-y-1", children: [_jsx("p", { className: "text-sm font-medium truncate", title: attachment.filename, children: attachment.filename }), _jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [_jsx("span", { children: formatFileSize(attachment.filesize) }), _jsx("span", { children: "\u2022" }), _jsx("span", { children: formatDistanceToNow(typeof attachment.uploadedAt === 'string'
                                                            ? new Date(attachment.uploadedAt)
                                                            : attachment.uploadedAt, { addSuffix: true, locale: dateLocale }) })] }), attachment.uploadedBy && (_jsxs("p", { className: "text-xs text-muted-foreground", children: [t.by, " ", attachment.uploadedBy.name] }))] }), _jsxs("div", { className: "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0", children: [canPreview && (_jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => handlePreview(attachment), title: t.tooltips?.preview, children: _jsx(Eye, { className: "h-3 w-3" }) })), _jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => handleDownload(attachment), title: t.tooltips?.download, children: _jsx(Download, { className: "h-3 w-3" }) }), _jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-destructive", onClick: () => handleDelete(attachment), title: t.tooltips?.delete, children: _jsx(Trash2, { className: "h-3 w-3" }) })] })] })] }, attachment.id));
                }) }), _jsx(Dialog, { open: !!previewAttachment, onOpenChange: (open) => !open && setPreviewAttachment(null), children: _jsxs(DialogContent, { className: "!max-w-none w-screen h-screen p-0 overflow-hidden bg-background/95 backdrop-blur-sm border-none shadow-none", children: [_jsx(DialogTitle, { className: "sr-only", children: previewAttachment?.filename }), previewAttachment && (_jsxs("div", { className: "relative w-full h-full flex items-center justify-center", children: [_jsx(Button, { variant: "secondary", size: "icon", className: "absolute top-4 right-4 rounded-full z-10 shadow-lg", onClick: () => setPreviewAttachment(null), children: _jsx(X, { className: "h-5 w-5" }) }), _jsx("img", { src: getFullUrl(previewAttachment.url), alt: previewAttachment.filename, className: "absolute inset-0 w-full h-full object-contain" }), _jsx("div", { className: "absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-background/80 backdrop-blur-sm px-6 py-3 rounded-full border shadow-lg z-10", children: _jsx("p", { className: "text-sm font-medium", children: previewAttachment.filename }) })] }))] }) })] }));
}
