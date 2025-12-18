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
    };
}
export declare function AttachmentList({ taskId, attachments, onDelete, resolveUrl, locale, labels, }: AttachmentListProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=attachment-list.d.ts.map