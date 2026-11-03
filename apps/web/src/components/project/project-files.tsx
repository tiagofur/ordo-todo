"use client";

import { useProjectAttachments } from "@/lib/api-hooks";
import { Button, Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ordo-todo/ui";
import { format } from "date-fns";
import { FileIcon, Download, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { Attachment } from "@ordo-todo/api-client";
import {
  downloadAttachmentFile,
  openAttachmentFile,
} from "@/hooks/use-attachment-file";

interface AttachmentWithTask extends Attachment {
  task?: {
    id: string;
    title: string;
  } | null;
}

interface ProjectFilesProps {
  projectId: string;
}

export function ProjectFiles({ projectId }: ProjectFilesProps) {
  const t = useTranslations('ProjectFiles');
  const { data: attachments, isLoading } = useProjectAttachments(projectId);

  if (isLoading) {
    return <FilesSkeleton />;
  }

  if (!attachments || attachments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
        <FileIcon className="h-12 w-12 mb-4 opacity-20" />
        <p>{t('empty')}</p>
      </div>
    );
  }

  // File bytes always come from the backend download endpoint through
  // the credentialed client (never the legacy static path).
  const handleOpen = async (file: AttachmentWithTask) => {
    try {
      await openAttachmentFile(String(file.id));
    } catch {
      toast.error(t('downloadError'));
    }
  };

  const handleDownload = async (file: AttachmentWithTask) => {
    try {
      await downloadAttachmentFile(String(file.id), file.filename);
    } catch {
      toast.error(t('downloadError'));
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('name')}</TableHead>
            <TableHead>{t('task')}</TableHead>
            <TableHead>{t('size')}</TableHead>
            <TableHead>{t('uploadedBy')}</TableHead>
            <TableHead>{t('date')}</TableHead>
            <TableHead className="text-right">{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attachments.map((file: AttachmentWithTask) => {
             return (
            <TableRow key={file.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <FileIcon className="h-4 w-4 text-muted-foreground" />
                  <button
                    onClick={() => handleOpen(file)}
                    className="hover:underline text-left"
                  >
                    {file.filename}
                  </button>
                </div>
              </TableCell>
              <TableCell>{file.task?.title}</TableCell>
              <TableCell>{formatFileSize(file.filesize)}</TableCell>
              <TableCell>{file.uploadedBy?.name || 'Unknown'}</TableCell>
              <TableCell>{format(new Date(file.uploadedAt), 'PP')}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  title={t('download')}
                  onClick={() => handleDownload(file)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          )})}
        </TableBody>
      </Table>
    </div>
  );
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function FilesSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
