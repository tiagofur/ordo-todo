"use client";

import { useProjectAttachments } from "@/lib/api-hooks";
import { Button, Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ordo-todo/ui";
import { format } from "date-fns";
import { FileIcon, Download, Trash2, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";

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

  const getFullUrl = (url: string) => {
    if (url.startsWith("/")) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3101/api/v1";
      const backendBaseUrl = apiUrl.replace("/api/v1", "");
      return backendBaseUrl + url;
    }
    return url;
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
          {attachments.map((file: any) => {
             const fullUrl = getFullUrl(file.url);
             return (
            <TableRow key={file.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <FileIcon className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={fullUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {file.filename}
                  </a>
                </div>
              </TableCell>
              <TableCell>{file.task?.title}</TableCell>
              <TableCell>{formatFileSize(file.filesize)}</TableCell>
              <TableCell>{file.uploadedBy?.name || 'Unknown'}</TableCell>
              <TableCell>{format(new Date(file.uploadedAt), 'PP')}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" asChild>
                  <a href={fullUrl} download target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4" />
                  </a>
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
