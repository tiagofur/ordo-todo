"use client";

import { Download, Trash2, File, Image as ImageIcon, FileText, Film, Music, Eye } from "lucide-react";
import { useDeleteAttachment } from "@/lib/api-hooks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

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
}

const FILE_ICONS = {
  image: ImageIcon,
  video: Film,
  audio: Music,
  document: FileText,
  default: File,
};

export function AttachmentList({ taskId, attachments = [] }: AttachmentListProps) {
  const deleteAttachment = useDeleteAttachment();

  const getFileType = (mimeType: string): keyof typeof FILE_ICONS => {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("audio/")) return "audio";
    if (
      mimeType.includes("pdf") ||
      mimeType.includes("document") ||
      mimeType.includes("word") ||
      mimeType.includes("excel") ||
      mimeType.includes("text")
    ) {
      return "document";
    }
    return "default";
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const getFullUrl = (url: string) => {
    // If URL is relative, prepend backend URL
    if (url.startsWith("/")) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3101/api/v1";
      return apiUrl.replace("/api/v1", "") + url;
    }
    return url;
  };

  const handleDownload = (attachment: Attachment) => {
    // Create a temporary link and trigger download
    const link = document.createElement("a");
    link.href = getFullUrl(attachment.url);
    link.download = attachment.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Descargando ${attachment.filename}`);
  };

  const handleDelete = (attachment: Attachment) => {
    if (confirm(`¿Estás seguro de eliminar ${attachment.filename}?`)) {
      deleteAttachment.mutate(String(attachment.id), {
        onSuccess: () => {
          toast.success("Archivo eliminado");
        },
        onError: (error: any) => {
          toast.error(error.message || "Error al eliminar archivo");
        }
      });
    }
  };

  const handlePreview = (attachment: Attachment) => {
    // Open in new tab for preview
    window.open(getFullUrl(attachment.url), "_blank");
  };

  const isImage = (type: string) => type.startsWith("image/");
  const isPDF = (type: string) => type.includes("pdf");

  if (attachments.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground border border-dashed rounded-lg">
        No hay archivos adjuntos aún.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">
          Archivos ({attachments.length})
        </p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(attachments.reduce((acc, att) => acc + att.filesize, 0))} total
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
                "group relative rounded-lg border p-3 transition-all",
                "hover:bg-accent/50 hover:shadow-md"
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
                        typeof attachment.uploadedAt === "string"
                          ? new Date(attachment.uploadedAt)
                          : attachment.uploadedAt,
                        { addSuffix: true, locale: es }
                      )}
                    </span>
                  </div>
                  {attachment.uploadedBy && (
                    <p className="text-xs text-muted-foreground">
                      por {attachment.uploadedBy.name}
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
                      title="Vista previa"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleDownload(attachment)}
                    title="Descargar"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => handleDelete(attachment)}
                    title="Eliminar"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
