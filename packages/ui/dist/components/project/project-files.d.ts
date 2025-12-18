import { format } from 'date-fns';
export interface ProjectAttachment {
    id: string;
    filename: string;
    url: string;
    filesize: number;
    uploadedAt: string | Date;
    uploadedBy?: {
        name?: string;
    };
    task?: {
        title?: string;
    };
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
type Locale = Parameters<typeof format>[2] extends {
    locale?: infer L;
} ? L : never;
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
export declare function ProjectFiles({ attachments, isLoading, getFullUrl, dateLocale, labels, className, }: ProjectFilesProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=project-files.d.ts.map