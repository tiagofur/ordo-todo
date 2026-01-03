'use client';

import { useState, useCallback, useEffect } from 'react';
import { Upload, File, X, Image as ImageIcon, FileText, Film, Music } from 'lucide-react';
import { cn } from '../../utils/index.js';
import { Button } from '../ui/button.js';
import { Progress } from '../ui/progress.js';

interface FileUploadProps {
  taskId: string;
  onUpload?: (
    file: File,
    onProgress: (progress: number) => void
  ) => Promise<void>;
  onUploadComplete?: () => void;
  maxFileSize?: number; // in MB
  acceptedFileTypes?: string[];
  filesToUpload?: File[];
  onFilesHandled?: () => void;
  labels?: {
    uploading?: string;
    dropzone?: {
      dragging?: string;
      idle?: string;
      maxSize?: (size: number) => string;
    };
    errors?: {
      tooLarge?: (max: number) => string;
      invalidType?: string;
      uploadError?: (msg: string) => string;
    };
    success?: {
        uploaded?: (name: string) => string;
    };
    info?: {
        cancelled?: (name: string) => string;
    };
  };
}

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
    maxSize: (size: number) => `Max file size: ${size}MB`,
  },
  errors: {
    tooLarge: (max: number) => `File exceeds maximum size of ${max}MB`,
    invalidType: 'File type not accepted',
    uploadError: (msg: string) => `Upload failed: ${msg}`,
  },
  success: {
    uploaded: (name: string) => `Uploaded ${name}`,
  },
  info: {
    cancelled: (name: string) => `Cancelled upload of ${name}`,
  },
};

export function FileUpload({
  taskId: _taskId,
  onUpload,
  onUploadComplete,
  maxFileSize = DEFAULT_MAX_SIZE,
  acceptedFileTypes = DEFAULT_ACCEPTED_TYPES,
  filesToUpload = [],
  onFilesHandled,
  labels = {},
}: FileUploadProps) {
  const t = {
    ...DEFAULT_LABELS,
    ...labels,
    dropzone: { ...DEFAULT_LABELS.dropzone, ...labels.dropzone },
    errors: { ...DEFAULT_LABELS.errors, ...labels.errors },
    success: { ...DEFAULT_LABELS.success, ...labels.success },
    info: { ...DEFAULT_LABELS.info, ...labels.info },
  };

  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<
    Array<{ id: string; name: string; progress: number; error?: string }>
  >([]);

  const getFileType = (file: File): keyof typeof FILE_ICONS => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    if (
      file.type.includes('pdf') ||
      file.type.includes('document') ||
      file.type.includes('word') ||
      file.type.includes('excel') ||
      file.type.includes('text')
    ) {
      return 'document';
    }
    return 'default';
  };

  const validateFile = (file: File): string | null => {
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

  const uploadFile = async (file: File) => {
    const error = validateFile(file);
    if (error) {
      console.error(error); // Parent should handle toast if needed or we could expose onError
      return;
    }

    if (!onUpload) return;

    // Generate unique ID for this upload
    const uploadId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Add to uploading files with unique ID
    setUploadingFiles((prev) => [
      ...prev,
      { id: uploadId, name: file.name, progress: 0 },
    ]);

    try {
      await onUpload(file, (progress) => {
        setUploadingFiles((prev) =>
          prev.map((f) => (f.id === uploadId ? { ...f, progress } : f))
        );
      });

      // Scan complete
      setUploadingFiles((prev) => prev.filter((f) => f.id !== uploadId));
      onUploadComplete?.();
    } catch (err: unknown) {
      console.error('Upload error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setUploadingFiles((prev) =>
        prev.map((f) =>
          f.id === uploadId ? { ...f, error: errorMessage } : f
        )
      );
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

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
     
  }, [filesToUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = ''; // Reset input
  };

  const cancelUpload = (uploadId: string) => {
    setUploadingFiles((prev) => prev.filter((f) => f.id !== uploadId));
    // Implementation of real cancellation would require AbortController support in onUpload
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        className={cn(
          'relative rounded-lg border-2 border-dashed transition-all',
          'hover:border-primary/50 hover:bg-accent/50',
          isDragging && 'border-primary bg-accent/50 scale-[1.02]',
          'p-8 text-center cursor-pointer'
        )}
        onClick={() => document.getElementById('file-input')?.click()}
        onDragOver={handleDragOver} // Added
        onDragLeave={handleDragLeave} // Added
        onDrop={handleDrop} // Added
      >
        <input
          id="file-input"
          type="file"
          multiple
          accept={acceptedFileTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3">
          <div
            className={cn(
              'rounded-full p-4 transition-colors',
              isDragging ? 'bg-primary/20' : 'bg-muted'
            )}
          >
            <Upload
              className={cn(
                'h-8 w-8 transition-colors',
                isDragging ? 'text-primary' : 'text-muted-foreground'
              )}
            />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">
              {isDragging ? t.dropzone.dragging : t.dropzone.idle}
            </p>
            <p className="text-xs text-muted-foreground">
              {t.dropzone.maxSize(maxFileSize)}
            </p>
          </div>
        </div>
      </div>

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold">{t.uploading}</p>
          {uploadingFiles.map((file) => {
            const FileIcon = FILE_ICONS[getFileType({ type: 'application/octet-stream', name: file.name } as File)] || File;

            return (
              <div
                key={file.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <div className="h-5 w-5 shrink-0 text-muted-foreground">
                    <FileIcon className="h-5 w-5" />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    {!file.error && (
                      <span className="text-xs text-muted-foreground shrink-0">
                        {file.progress}%
                      </span>
                    )}
                  </div>

                  {file.error ? (
                    <p className="text-xs text-destructive">{file.error}</p>
                  ) : (
                    <Progress value={file.progress} className="h-1" />
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={() => cancelUpload(file.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
