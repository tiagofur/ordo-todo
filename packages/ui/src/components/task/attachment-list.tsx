'use client';

import { useState } from 'react';
import {
  Download,
  Trash2,
  File,
  Image as ImageIcon,
  FileText,
  Film,
  Music,
  Eye,
  X,
} from 'lucide-react';
import { cn } from '../../utils/index.js';
import { Button } from '../ui/button.js';
import { formatDistanceToNow } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog.js';

interface Attachment {
  id: string | number;
  filename: string;
  url: string;
  mimeType: string;
  filesize: number;
  uploadedAt: Date | string;
  uploadedBy?: {
    id: string;
    name: string | null;
  };
}

interface AttachmentListProps {
  taskId: string;
  attachments?: Attachment[];
  onDelete?: (attachmentId: string) => void | Promise<void>;
  resolveUrl?: (url: string) => string;
  locale?: string;
  labels?: {
    title?: string;
    empty?: string;
    total?: string;
    by?: string;
    tooltips?: {
      preview?: string;
      download?: string;
      delete?: string;
    };
    confirmDelete?: (filename: string) => string;
    // Toast messages are handled by consumer usually, but if we wanted to show text here:
    // toastDownloading?: (filename: string) => string;
  };
}

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
  confirmDelete: (filename: string) => `Are you sure you want to delete ${filename}?`,
};

export function AttachmentList({
  taskId: _taskId,
  attachments = [],
  onDelete,
  resolveUrl,
  locale = 'en',
  labels = {},
}: AttachmentListProps) {
  const t = {
    ...DEFAULT_LABELS,
    ...labels,
    tooltips: { ...DEFAULT_LABELS.tooltips, ...labels.tooltips },
  };

  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);

  const getFileType = (mimeType: string): keyof typeof FILE_ICONS => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (
      mimeType.includes('pdf') ||
      mimeType.includes('document') ||
      mimeType.includes('word') ||
      mimeType.includes('excel') ||
      mimeType.includes('text')
    ) {
      return 'document';
    }
    return 'default';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFullUrl = (url: string) => {
    if (resolveUrl) return resolveUrl(url);
    return url;
  };

  const handleDownload = (attachment: Attachment) => {
    const link = document.createElement('a');
    link.href = getFullUrl(attachment.url);
    link.download = attachment.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (attachment: Attachment) => {
    const confirmMsg = t.confirmDelete ? t.confirmDelete(attachment.filename) : `Delete ${attachment.filename}?`;
    if (window.confirm(confirmMsg)) {
      if (onDelete) {
         try {
            await onDelete(String(attachment.id));
         } catch (err) {
            console.error(err);
         }
      }
    }
  };

  const isImage = (type: string) => type.startsWith('image/');
  const isPDF = (type: string) => type.includes('pdf');

  const handlePreview = (attachment: Attachment) => {
    if (isImage(attachment.mimeType)) {
      setPreviewAttachment(attachment);
    } else {
      window.open(getFullUrl(attachment.url), '_blank');
    }
  };

  if (attachments.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground border border-dashed rounded-lg">
        {t.empty}
      </div>
    );
  }

  const dateLocale = locale === 'es' ? es : enUS;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">
          {t.title} ({attachments.length})
        </p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(attachments.reduce((acc, att) => acc + att.filesize, 0))}{' '}
          {t.total}
        </p>
      </div>

      {/* Attachments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {attachments.map((attachment) => {
          const fileType = getFileType(attachment.mimeType);
          const FileIcon = FILE_ICONS[fileType];
          const canPreview = isImage(attachment.mimeType) || isPDF(attachment.mimeType);

          return (
            <div
              key={attachment.id}
              className={cn(
                'group relative rounded-lg border p-3 transition-all',
                'hover:bg-accent/50 hover:shadow-md'
              )}
            >
              {/* Image Preview */}
              {isImage(attachment.mimeType) && (
                <div className="mb-3 relative aspect-video rounded-md overflow-hidden bg-muted">
                  <img
                    src={getFullUrl(attachment.url)}
                    alt={attachment.filename}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handlePreview(attachment)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* File Info */}
              <div className="flex items-start gap-3">
                {/* Icon (only for non-images) */}
                {!isImage(attachment.mimeType) && (
                  <div className="shrink-0 rounded-lg bg-muted p-2">
                    <FileIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-sm font-medium truncate" title={attachment.filename}>
                    {attachment.filename}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatFileSize(attachment.filesize)}</span>
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(
                        typeof attachment.uploadedAt === 'string'
                          ? new Date(attachment.uploadedAt)
                          : attachment.uploadedAt,
                        { addSuffix: true, locale: dateLocale }
                      )}
                    </span>
                  </div>
                  {attachment.uploadedBy && (
                    <p className="text-xs text-muted-foreground">
                      {t.by} {attachment.uploadedBy.name}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  {canPreview && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handlePreview(attachment)}
                      title={t.tooltips?.preview}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleDownload(attachment)}
                    title={t.tooltips?.download}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => handleDelete(attachment)}
                    title={t.tooltips?.delete}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog
        open={!!previewAttachment}
        onOpenChange={(open) => !open && setPreviewAttachment(null)}
      >
        <DialogContent className="!max-w-none w-screen h-screen p-0 overflow-hidden bg-background/95 backdrop-blur-sm border-none shadow-none">
          <DialogTitle className="sr-only">
            {previewAttachment?.filename}
          </DialogTitle>
          {previewAttachment && (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Close button */}
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-4 right-4 rounded-full z-10 shadow-lg"
                onClick={() => setPreviewAttachment(null)}
              >
                <X className="h-5 w-5" />
              </Button>

              {/* Image - Fill viewport */}
              <img
                src={getFullUrl(previewAttachment.url)}
                alt={previewAttachment.filename}
                className="absolute inset-0 w-full h-full object-contain"
              />

              {/* Filename overlay */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-background/80 backdrop-blur-sm px-6 py-3 rounded-full border shadow-lg z-10">
                <p className="text-sm font-medium">{previewAttachment.filename}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
