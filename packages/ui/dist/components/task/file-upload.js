'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback, useEffect } from 'react';
import { Upload, File, X, Image as ImageIcon, FileText, Film, Music } from 'lucide-react';
import { cn } from '../../utils/index.js';
import { Button } from '../ui/button.js';
import { Progress } from '../ui/progress.js';
const DEFAULT_MAX_SIZE = 10; // 10MB
const DEFAULT_ACCEPTED_TYPES = [
    'image/*',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/*',
];
const FILE_ICONS = {
    image: ImageIcon,
    video: Film,
    audio: Music,
    document: FileText,
    default: File,
};
const DEFAULT_LABELS = {
    uploading: 'Uploading...',
    dropzone: {
        dragging: 'Drop files here',
        idle: 'Drag & drop files here, or click to select',
        maxSize: (size) => `Max file size: ${size}MB`,
    },
    errors: {
        tooLarge: (max) => `File exceeds maximum size of ${max}MB`,
        invalidType: 'File type not accepted',
        uploadError: (msg) => `Upload failed: ${msg}`,
    },
    success: {
        uploaded: (name) => `Uploaded ${name}`,
    },
    info: {
        cancelled: (name) => `Cancelled upload of ${name}`,
    },
};
export function FileUpload({ taskId, onUpload, onUploadComplete, maxFileSize = DEFAULT_MAX_SIZE, acceptedFileTypes = DEFAULT_ACCEPTED_TYPES, filesToUpload = [], onFilesHandled, labels = {}, }) {
    const t = {
        ...DEFAULT_LABELS,
        ...labels,
        dropzone: { ...DEFAULT_LABELS.dropzone, ...labels.dropzone },
        errors: { ...DEFAULT_LABELS.errors, ...labels.errors },
        success: { ...DEFAULT_LABELS.success, ...labels.success },
        info: { ...DEFAULT_LABELS.info, ...labels.info },
    };
    const [isDragging, setIsDragging] = useState(false);
    const [uploadingFiles, setUploadingFiles] = useState([]);
    const getFileType = (file) => {
        if (file.type.startsWith('image/'))
            return 'image';
        if (file.type.startsWith('video/'))
            return 'video';
        if (file.type.startsWith('audio/'))
            return 'audio';
        if (file.type.includes('pdf') ||
            file.type.includes('document') ||
            file.type.includes('word') ||
            file.type.includes('excel') ||
            file.type.includes('text')) {
            return 'document';
        }
        return 'default';
    };
    const validateFile = (file) => {
        // Check file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxFileSize) {
            return t.errors.tooLarge(maxFileSize);
        }
        // Check file type
        const isAccepted = acceptedFileTypes.some((type) => {
            if (type.endsWith('/*')) {
                const category = type.split('/')[0];
                return file.type.startsWith(category + '/');
            }
            return file.type === type;
        });
        if (!isAccepted) {
            return t.errors.invalidType;
        }
        return null;
    };
    const uploadFile = async (file) => {
        const error = validateFile(file);
        if (error) {
            console.error(error); // Parent should handle toast if needed or we could expose onError
            return;
        }
        if (!onUpload)
            return;
        // Generate unique ID for this upload
        const uploadId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        // Add to uploading files with unique ID
        setUploadingFiles((prev) => [
            ...prev,
            { id: uploadId, name: file.name, progress: 0 },
        ]);
        try {
            await onUpload(file, (progress) => {
                setUploadingFiles((prev) => prev.map((f) => (f.id === uploadId ? { ...f, progress } : f)));
            });
            // Scan complete
            setUploadingFiles((prev) => prev.filter((f) => f.id !== uploadId));
            onUploadComplete?.();
        }
        catch (err) {
            console.error('Upload error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setUploadingFiles((prev) => prev.map((f) => f.id === uploadId ? { ...f, error: errorMessage } : f));
        }
    };
    const handleFiles = (files) => {
        if (!files)
            return;
        Array.from(files).forEach((file) => {
            uploadFile(file);
        });
    };
    // Handle initial files passed from parent (e.g. via drag & drop on the panel)
    useEffect(() => {
        if (filesToUpload.length > 0) {
            // Create a dummy FileList-like object or just iterate array
            // handleFiles expects FileList, but we iterate array inside
            filesToUpload.forEach(f => uploadFile(f));
            onFilesHandled?.();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filesToUpload]);
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);
    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    }, []);
    const handleFileInput = (e) => {
        handleFiles(e.target.files);
        e.target.value = ''; // Reset input
    };
    const cancelUpload = (uploadId) => {
        setUploadingFiles((prev) => prev.filter((f) => f.id !== uploadId));
        // Implementation of real cancellation would require AbortController support in onUpload
    };
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: cn('relative rounded-lg border-2 border-dashed transition-all', 'hover:border-primary/50 hover:bg-accent/50', isDragging && 'border-primary bg-accent/50 scale-[1.02]', 'p-8 text-center cursor-pointer'), onClick: () => document.getElementById('file-input')?.click(), onDragOver: handleDragOver, onDragLeave: handleDragLeave, onDrop: handleDrop, children: [_jsx("input", { id: "file-input", type: "file", multiple: true, accept: acceptedFileTypes.join(','), onChange: handleFileInput, className: "hidden" }), _jsxs("div", { className: "flex flex-col items-center gap-3", children: [_jsx("div", { className: cn('rounded-full p-4 transition-colors', isDragging ? 'bg-primary/20' : 'bg-muted'), children: _jsx(Upload, { className: cn('h-8 w-8 transition-colors', isDragging ? 'text-primary' : 'text-muted-foreground') }) }), _jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "text-sm font-medium", children: isDragging ? t.dropzone.dragging : t.dropzone.idle }), _jsx("p", { className: "text-xs text-muted-foreground", children: t.dropzone.maxSize(maxFileSize) })] })] })] }), uploadingFiles.length > 0 && (_jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "text-sm font-semibold", children: t.uploading }), uploadingFiles.map((file) => {
                        const FileIcon = FILE_ICONS[getFileType({ type: 'application/octet-stream', name: file.name })] || File;
                        return (_jsxs("div", { className: "flex items-center gap-3 rounded-lg border p-3", children: [_jsx("div", { className: "h-5 w-5 shrink-0 text-muted-foreground", children: _jsx(FileIcon, { className: "h-5 w-5" }) }), _jsxs("div", { className: "flex-1 min-w-0 space-y-1", children: [_jsxs("div", { className: "flex items-center justify-between gap-2", children: [_jsx("p", { className: "text-sm font-medium truncate", children: file.name }), !file.error && (_jsxs("span", { className: "text-xs text-muted-foreground shrink-0", children: [file.progress, "%"] }))] }), file.error ? (_jsx("p", { className: "text-xs text-destructive", children: file.error })) : (_jsx(Progress, { value: file.progress, className: "h-1" }))] }), _jsx(Button, { variant: "ghost", size: "icon", className: "h-6 w-6 shrink-0", onClick: () => cancelUpload(file.id), children: _jsx(X, { className: "h-3 w-3" }) })] }, file.id));
                    })] }))] }));
}
