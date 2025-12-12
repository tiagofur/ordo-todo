import { useState, useCallback, useEffect } from "react";
import { Upload, File, X, Image as ImageIcon, FileText, Film, Music, AlertTriangle } from "lucide-react";
import { ElectronStoreTokenStorage } from "@/lib/storage";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { cn, Button, Progress, Alert, AlertDescription } from "@ordo-todo/ui";
import { useTranslation } from "react-i18next";

interface FileUploadProps {
  taskId: string;
  onUploadComplete?: () => void;
  maxFileSize?: number; // in MB
  acceptedFileTypes?: string[];
  filesToUpload?: File[];
  onFilesHandled?: () => void;
}

const DEFAULT_MAX_SIZE = 10; // 10MB
const DEFAULT_ACCEPTED_TYPES = [
  "image/*",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/*",
];

const FILE_ICONS = {
  image: ImageIcon,
  video: Film,
  audio: Music,
  document: FileText,
  default: File,
};

export function FileUpload({
  taskId,
  onUploadComplete,
  maxFileSize = DEFAULT_MAX_SIZE,
  acceptedFileTypes = DEFAULT_ACCEPTED_TYPES,
  filesToUpload = [],
  onFilesHandled,
}: FileUploadProps) {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<
    Array<{ id: string; name: string; progress: number; error?: string }>
  >([]);

  const getFileType = (file: File): keyof typeof FILE_ICONS => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    if (file.type.startsWith("audio/")) return "audio";
    if (
      file.type.includes("pdf") ||
      file.type.includes("document") ||
      file.type.includes("word") ||
      file.type.includes("excel") ||
      file.type.includes("text")
    ) {
      return "document";
    }
    return "default";
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSize) {
      return t('FileUpload.errors.tooLarge', { maxFileSize });
    }

    // Check file type
    const isAccepted = acceptedFileTypes.some((type) => {
      if (type.endsWith("/*")) {
        const category = type.split("/")[0];
        return file.type.startsWith(category + "/");
      }
      return file.type === type;
    });

    if (!isAccepted) {
      return t('FileUpload.errors.invalidType');
    }

    // Check filename for security
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (dangerousExtensions.includes(fileExtension)) {
      return t('FileUpload.errors.dangerousType');
    }

    // Check for potentially dangerous filenames
    const dangerousNames = ['..', 'CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
    const fileNameWithoutExt = file.name.toLowerCase().substring(0, file.name.lastIndexOf('.'));
    if (dangerousNames.includes(fileNameWithoutExt)) {
      return t('FileUpload.errors.invalidName');
    }

    return null;
  };

  const uploadFile = async (file: File) => {
    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    // Generate unique ID for this upload
    const uploadId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Add to uploading files with unique ID
    setUploadingFiles((prev) => [...prev, { id: uploadId, name: file.name, progress: 0 }]);

    try {
      // Use API client for better error handling
      const response = await apiClient.uploadFile(taskId, file, (progress) => {
        setUploadingFiles((prev) =>
          prev.map((f) => (f.id === uploadId ? { ...f, progress } : f))
        );
      });

      toast.success(t('FileUpload.success.uploaded', { fileName: file.name }));
      setUploadingFiles((prev) => prev.filter((f) => f.id !== uploadId));
      onUploadComplete?.();
    } catch (err) {
      console.error("Upload error:", err);
      const errorMessage = err instanceof Error ? err.message : t('FileUpload.errors.unknown');
      toast.error(t('FileUpload.errors.uploadError', { errorMessage }));
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
      filesToUpload.forEach((file) => uploadFile(file));
      onFilesHandled?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    e.target.value = ""; // Reset input
  };

  const cancelUpload = (uploadId: string) => {
    const fileName = uploadingFiles.find(f => f.id === uploadId)?.name || 'file';
    setUploadingFiles((prev) => prev.filter((f) => f.id !== uploadId));
    toast.info(t('FileUpload.info.cancelled', { fileName }));
  };

  return (
    <div className="space-y-4">
      {/* Security Warning */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Seguridad:</strong> Solo se permiten archivos seguros. Se bloquearán automáticamente ejecutables y archivos potencialmente peligrosos.
        </AlertDescription>
      </Alert>

      {/* Drop Zone */}
      <div
        className={cn(
          "relative rounded-lg border-2 border-dashed transition-all",
          "hover:border-primary/50 hover:bg-accent/50",
          isDragging && "border-primary bg-accent/50 scale-[1.02]",
          "p-8 text-center cursor-pointer"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <input
          id="file-input"
          type="file"
          multiple
          accept={acceptedFileTypes.join(",")}
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3">
          <div
            className={cn(
              "rounded-full p-4 transition-colors",
              isDragging ? "bg-primary/20" : "bg-muted"
            )}
          >
            <Upload
              className={cn(
                "h-8 w-8 transition-colors",
                isDragging ? "text-primary" : "text-muted-foreground"
              )}
            />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">
              {isDragging
                ? t('FileUpload.dropzone.dragging')
                : t('FileUpload.dropzone.idle')}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('FileUpload.dropzone.maxSize', { maxFileSize })}
            </p>
            <div className="flex flex-wrap justify-center gap-1 mt-2">
              <span className="text-xs bg-muted px-2 py-1 rounded">Imágenes</span>
              <span className="text-xs bg-muted px-2 py-1 rounded">PDF</span>
              <span className="text-xs bg-muted px-2 py-1 rounded">Word</span>
              <span className="text-xs bg-muted px-2 py-1 rounded">Excel</span>
              <span className="text-xs bg-muted px-2 py-1 rounded">Texto</span>
            </div>
          </div>
        </div>
      </div>

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold">{t('FileUpload.uploading')}</p>
          {uploadingFiles.map((file) => {
            const FileIcon = FILE_ICONS[getFileType({ type: file.name } as File)];

            return (
              <div
                key={file.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <FileIcon className="h-5 w-5 shrink-0 text-muted-foreground" />

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
