/**
 * Attachment-related types and DTOs
 */
export interface Attachment {
    id: string;
    filename: string;
    url: string;
    mimeType: string;
    filesize: number;
    taskId: string;
    uploadedById: string | null;
    uploadedAt: Date;
    uploadedBy?: {
        id: string;
        name: string | null;
        email?: string;
        image?: string | null;
    };
}
export interface CreateAttachmentDto {
    filename: string;
    url: string;
    mimeType: string;
    filesize: number;
    taskId: string;
}
//# sourceMappingURL=attachment.types.d.ts.map