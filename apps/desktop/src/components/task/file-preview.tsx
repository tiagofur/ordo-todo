import { useState, useCallback } from "react";
import {
  Download,
  X,
  Eye,
  File,
  Image as ImageIcon,
  FileText,
  Film,
  Music,
  Archive,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

interface Attachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: Date;
}

interface FilePreviewProps {
  attachments: Attachment[];
  taskId: string;
  onRemove?: (attachmentId: string) => void;
  canRemove?: boolean;
}

const FILE_ICONS = {
  image: ImageIcon,
  video: Film,
  audio: Music,
  document: FileText,
  archive: Archive,
  default: File,
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const getFileType = (mimeType: string): keyof typeof FILE_ICONS => {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("text")) {
    return "document";
  }
  if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("tar")) {
    return "archive";
  }
  return "default";
};

export function FilePreview({
  attachments,
  taskId,
  onRemove,
  canRemove = false,
}: FilePreviewProps) {
  const [previewFile, setPreviewFile] = useState<Attachment | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const handleDownload = async (attachment: Attachment) => {
    setIsDownloading(attachment.id);
    try {
      // Create download link using the URL from the attachment
      const response = await fetch(attachment.url);
      if (!response.ok) {
        throw new Error("No se pudo descargar el archivo");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = attachment.originalName || attachment.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success(`Descargado: ${attachment.originalName}`);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Error al descargar el archivo");
    } finally {
      setIsDownloading(null);
    }
  };

  const handleRemove = async (attachmentId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este archivo?")) {
      return;
    }

    try {
      await apiClient.deleteAttachment(attachmentId);
      onRemove?.(attachmentId);
      toast.success("Archivo eliminado correctamente");
    } catch (error) {
      console.error("Error removing attachment:", error);
      toast.error("Error al eliminar el archivo");
    }
  };

  const handlePreview = (attachment: Attachment) => {
    setPreviewFile(attachment);
  };

  const isImage = (mimeType: string) => mimeType.startsWith("image/");

  return (
    <>
      {attachments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <File className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-sm">No hay archivos adjuntos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {attachments.map((attachment) => {
            const FileIcon = FILE_ICONS[getFileType(attachment.mimeType)];
            const isPreviewable = isImage(attachment.mimeType);

            return (
              <div
                key={attachment.id}
                className="group relative border rounded-lg p-3 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* File Icon or Thumbnail */}
                  <div className="shrink-0">
                    {isPreviewable ? (
                      <div className="relative">
                        <img
                          src={attachment.url}
                          alt={attachment.originalName}
                          className="h-12 w-12 object-cover rounded"
                          onError={(e) => {
                            // Fallback to icon if image fails to load
                            e.currentTarget.style.display = "none";
                            e.currentTarget.parentElement!.innerHTML = `<div class="h-12 w-12 bg-muted rounded flex items-center justify-center">${FileIcon.toString().replace("function", "").includes("ImageIcon") ? "📷" : "📄"}</div>`;
                          }}
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 bg-muted rounded flex items-center justify-center">
                        <FileIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-primary">
                          {attachment.originalName}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(attachment.size)}
                          </span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(attachment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isPreviewable && (
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
                          disabled={isDownloading === attachment.id}
                          title="Descargar"
                        >
                          {isDownloading === attachment.id ? (
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          ) : (
                            <Download className="h-3 w-3" />
                          )}
                        </Button>

                        {canRemove && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:text-destructive"
                            onClick={() => handleRemove(attachment.id)}
                            title="Eliminar"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* File Type Badge */}
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        {attachment.mimeType.split("/")[0]?.toUpperCase() ||
                          attachment.mimeType}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog
        open={!!previewFile}
        onOpenChange={(open) => !open && setPreviewFile(null)}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Vista previa
            </DialogTitle>
          </DialogHeader>

          {previewFile && (
            <div className="space-y-4">
              {/* File Info */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{previewFile.originalName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(previewFile.size)} • {previewFile.mimeType}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(previewFile)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </Button>
                </div>
              </div>

              {/* Preview Content */}
              <div className="flex justify-center">
                {isImage(previewFile.mimeType) ? (
                  <img
                    src={previewFile.url}
                    alt={previewFile.originalName}
                    className="max-w-full max-h-[600px] rounded-lg border"
                  />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Vista previa no disponible para este tipo de archivo</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => handleDownload(previewFile)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Descargar para ver
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}