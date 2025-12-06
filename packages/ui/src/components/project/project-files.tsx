'use client';

import { format } from 'date-fns';
import { FileIcon, Download } from 'lucide-react';
import { Button } from '../ui/button.js';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table.js';
import { Skeleton } from '../ui/skeleton.js';

export interface ProjectAttachment {
  id: string;
  filename: string;
  url: string;
  filesize: number;
  uploadedAt: string | Date;
  uploadedBy?: { name?: string };
  task?: { title?: string };
}

interface ProjectFilesProps {
  /** Attachments to display */
  attachments: ProjectAttachment[];
  /** Whether data is loading */
  isLoading?: boolean;
  /** Function to transform relative URLs to full URLs */
  getFullUrl?: (url: string) => string;
  /** Date locale for formatting */
  dateLocale?: Locale;
  /** Custom labels for i18n */
  labels?: {
    empty?: string;
    name?: string;
    task?: string;
    size?: string;
    uploadedBy?: string;
    date?: string;
    actions?: string;
    unknownUser?: string;
  };
  className?: string;
}

type Locale = Parameters<typeof format>[2] extends { locale?: infer L } ? L : never;

function formatFileSize(bytes: number): string {
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
export function ProjectFiles({
  attachments = [],
  isLoading = false,
  getFullUrl = (url) => url,
  dateLocale,
  labels = {},
  className = '',
}: ProjectFilesProps) {
  const {
    empty = 'No files uploaded for this project',
    name = 'Name',
    task = 'Task',
    size = 'Size',
    uploadedBy = 'Uploaded By',
    date = 'Date',
    actions = 'Actions',
    unknownUser = 'Unknown',
  } = labels;

  if (isLoading) {
    return <FilesSkeleton />;
  }

  if (attachments.length === 0) {
    return (
      <div
        className={`flex flex-col items-center justify-center py-12 text-center text-muted-foreground ${className}`}
      >
        <FileIcon className="h-12 w-12 mb-4 opacity-20" />
        <p>{empty}</p>
      </div>
    );
  }

  return (
    <div className={`rounded-md border ${className}`}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{name}</TableHead>
            <TableHead>{task}</TableHead>
            <TableHead>{size}</TableHead>
            <TableHead>{uploadedBy}</TableHead>
            <TableHead>{date}</TableHead>
            <TableHead className="text-right">{actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attachments.map((file) => {
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
                <TableCell>{file.uploadedBy?.name || unknownUser}</TableCell>
                <TableCell>
                  {format(
                    new Date(file.uploadedAt),
                    'PP',
                    dateLocale ? { locale: dateLocale } : undefined
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" asChild>
                    <a href={fullUrl} download target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
