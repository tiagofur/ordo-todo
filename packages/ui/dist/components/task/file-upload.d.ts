interface FileUploadProps {
    taskId: string;
    onUpload?: (file: File, onProgress: (progress: number) => void) => Promise<void>;
    onUploadComplete?: () => void;
    maxFileSize?: number;
    acceptedFileTypes?: string[];
    filesToUpload?: File[];
    onFilesHandled?: () => void;
    labels?: {
        uploading?: string;
        dropzone?: {
            dragging?: string;
            idle?: string;
            maxSize?: (size: number) => string;
        };
        errors?: {
            tooLarge?: (max: number) => string;
            invalidType?: string;
            uploadError?: (msg: string) => string;
        };
        success?: {
            uploaded?: (name: string) => string;
        };
        info?: {
            cancelled?: (name: string) => string;
        };
    };
}
export declare function FileUpload({ taskId, onUpload, onUploadComplete, maxFileSize, acceptedFileTypes, filesToUpload, onFilesHandled, labels, }: FileUploadProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=file-upload.d.ts.map