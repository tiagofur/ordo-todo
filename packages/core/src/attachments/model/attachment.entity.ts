import { Entity, EntityProps, EntityMode } from "../../shared/entity";
import { FILE_LIMITS } from "../../shared/constants/limits.constants";

/**
 * Properties for creating an Attachment entity.
 *
 * Attachments represent files uploaded to tasks, such as images,
 * documents, and other resources that provide context or reference
 * material for task completion.
 *
 * @example
 * ```typescript
 * const attachment = new Attachment({
 *   taskId: 'task-123',
 *   userId: 'user-456',
 *   fileName: 'document-v2.pdf',
 *   originalName: 'document.pdf',
 *   mimeType: 'application/pdf',
 *   size: 1024000,
 *   storagePath: '/uploads/abc123.pdf'
 * });
 * ```
 */
export interface AttachmentProps extends EntityProps {
  /**
   * The ID of the task this attachment belongs to.
   * Required - every attachment must be associated with a task.
   */
  taskId: string;

  /**
   * The ID of the user who uploaded this attachment.
   * Required - every attachment must have an uploader.
   */
  userId: string;

  /**
   * The stored file name (may include UUID or timestamp prefix).
   * Required - must be between 1 and 255 characters.
   */
  fileName: string;

  /**
   * The original file name as provided by the user.
   * Required - must be between 1 and 255 characters.
   */
  originalName: string;

  /**
   * The MIME type of the file.
   * Required - must be a valid MIME type string.
   */
  mimeType: string;

  /**
   * The file size in bytes.
   * Required - must be greater than 0 and within size limits.
   */
  size: number;

  /**
   * The storage path or URL where the file is stored.
   * Required - must be a non-empty string.
   */
  storagePath: string;

  /**
   * Whether the file has been successfully uploaded.
   * Defaults to false for new attachments before upload completes.
   */
  isUploaded?: boolean;

  /**
   * Timestamp when the file upload completed.
   * Null if upload has not completed yet.
   */
  uploadedAt?: Date | null;

  /**
   * Timestamp when the attachment record was created.
   * Defaults to current time if not provided.
   */
  createdAt?: Date;

  /**
   * Timestamp when the attachment record was last updated.
   * Defaults to current time if not provided.
   */
  updatedAt?: Date;
}

/**
 * Represents a file attachment on a task.
 *
 * Attachments enable users to associate files with tasks for reference,
 * documentation, or collaboration. Files are stored externally (S3, R2, local)
 * while this entity tracks metadata and ownership.
 *
 * ## Business Rules
 *
 * - File name (both stored and original) must be 1-255 characters
 * - Every attachment must belong to a task
 * - Every attachment must have an uploader
 * - File size must be greater than 0 and within limits (default 10MB max)
 * - MIME type must be a valid string
 * - Attachments are immutable - use business methods to create updated versions
 *
 * ## Immutability
 *
 * All update methods return a new Attachment instance.
 * Never modify properties directly.
 *
 * @example
 * ```typescript
 * // Create a new attachment (before upload)
 * const attachment = Attachment.create({
 *   taskId: 'task-123',
 *   userId: 'user-456',
 *   fileName: 'unique-id-document.pdf',
 *   originalName: 'document.pdf',
 *   mimeType: 'application/pdf',
 *   size: 1024000,
 *   storagePath: '/uploads/unique-id-document.pdf'
 * });
 *
 * // Mark as uploaded after successful upload
 * const uploaded = attachment.markAsUploaded();
 *
 * // Check file type
 * if (uploaded.isPDF()) {
 *   console.log('This is a PDF document');
 * }
 *
 * // Get human-readable size
 * console.log(`File size: ${uploaded.getFileSizeInMB().toFixed(2)} MB`);
 * ```
 *
 * @see {@link ../../shared/constants/limits.constants.ts | FILE_LIMITS}
 */
export class Attachment extends Entity<AttachmentProps> {
  constructor(props: AttachmentProps, mode: EntityMode = "valid") {
    super({
      ...props,
      isUploaded: props.isUploaded ?? false,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    }, mode);

    // Validate all properties if not in draft mode
    if (this.mode === "valid") {
      this.validateTaskId(props.taskId);
      this.validateUserId(props.userId);
      this.validateFileName(props.fileName);
      this.validateOriginalName(props.originalName);
      this.validateMimeType(props.mimeType);
      this.validateSize(props.size);
      this.validateStoragePath(props.storagePath);
    }
  }

  /**
   * Creates a new attachment with defaults applied.
   *
   * Factory method for creating attachments without manually
   * setting id, timestamps, and default values.
   *
   * @param props - Attachment properties (id, timestamps auto-generated)
   * @returns A new Attachment instance
   *
   * @example
   * ```typescript
   * const attachment = Attachment.create({
   *   taskId: 'task-123',
   *   userId: 'user-456',
   *   fileName: 'stored-name.pdf',
   *   originalName: 'document.pdf',
   *   mimeType: 'application/pdf',
   *   size: 1024000,
   *   storagePath: '/uploads/stored-name.pdf'
   * });
   * ```
   */
  static create(
    props: Omit<AttachmentProps, "id" | "isUploaded" | "uploadedAt" | "createdAt" | "updatedAt">
  ): Attachment {
    return new Attachment({
      ...props,
      isUploaded: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Getters for commonly accessed properties
  get taskId(): string {
    return this.props.taskId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get fileName(): string {
    return this.props.fileName;
  }

  get originalName(): string {
    return this.props.originalName;
  }

  get mimeType(): string {
    return this.props.mimeType;
  }

  get size(): number {
    return this.props.size;
  }

  get storagePath(): string {
    return this.props.storagePath;
  }

  get isUploaded(): boolean {
    return this.props.isUploaded ?? false;
  }

  get uploadedAt(): Date | null | undefined {
    return this.props.uploadedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt ?? new Date();
  }

  get updatedAt(): Date {
    return this.props.updatedAt ?? new Date();
  }

  /**
   * Marks the attachment as successfully uploaded.
   *
   * Sets the isUploaded flag to true and records the upload timestamp.
   * Use this after the file has been successfully stored.
   *
   * @returns A new Attachment instance marked as uploaded
   *
   * @example
   * ```typescript
   * const attachment = Attachment.create({ ... });
   * // After successful file upload...
   * const uploaded = attachment.markAsUploaded();
   * console.log(uploaded.isUploaded); // true
   * console.log(uploaded.uploadedAt); // Date object
   * ```
   */
  markAsUploaded(): Attachment {
    return this.clone({
      isUploaded: true,
      uploadedAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Gets the file size in megabytes.
   *
   * @returns The file size in MB (decimal)
   *
   * @example
   * ```typescript
   * const attachment = Attachment.create({
   *   ...
   *   size: 5242880 // 5 MB
   * });
   * console.log(attachment.getFileSizeInMB()); // 5.0
   * ```
   */
  getFileSizeInMB(): number {
    return this.props.size / (1024 * 1024);
  }

  /**
   * Gets the file size in kilobytes.
   *
   * @returns The file size in KB (decimal)
   *
   * @example
   * ```typescript
   * const attachment = Attachment.create({
   *   ...
   *   size: 102400 // ~100 KB
   * });
   * console.log(attachment.getFileSizeInKB()); // ~100.0
   * ```
   */
  getFileSizeInKB(): number {
    return this.props.size / 1024;
  }

  /**
   * Checks if the attachment is an image file.
   *
   * Determines file type by MIME type.
   *
   * @returns true if the file is an image, false otherwise
   *
   * @example
   * ```typescript
   * const attachment = Attachment.create({
   *   ...
   *   mimeType: 'image/jpeg'
   * });
   * if (attachment.isImage()) {
   *   console.log('This is an image file');
   * }
   * ```
   */
  isImage(): boolean {
    return this.props.mimeType.startsWith("image/");
  }

  /**
   * Checks if the attachment is a PDF file.
   *
   * @returns true if the file is a PDF, false otherwise
   *
   * @example
   * ```typescript
   * const attachment = Attachment.create({
   *   ...
   *   mimeType: 'application/pdf'
   * });
   * if (attachment.isPDF()) {
   *   console.log('This is a PDF document');
   * }
   * ```
   */
  isPDF(): boolean {
    return this.props.mimeType === "application/pdf";
  }

  /**
   * Checks if the attachment is a document file.
   *
   * Documents include PDF, Word, Excel, PowerPoint, and text files.
   *
   * @returns true if the file is a document, false otherwise
   *
   * @example
   * ```typescript
   * const attachment = Attachment.create({
   *   ...
   *   mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
   * });
   * if (attachment.isDocument()) {
   *   console.log('This is a document file');
   * }
   * ```
   */
  isDocument(): boolean {
    const documentTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
      "text/csv",
    ];
    return documentTypes.includes(this.props.mimeType);
  }

  /**
   * Gets the file extension from the original name.
   *
   * @returns The file extension including the dot (e.g., ".pdf"), or empty string if no extension
   *
   * @example
   * ```typescript
   * const attachment = Attachment.create({
   *   ...
   *   originalName: 'document.pdf'
   * });
   * console.log(attachment.getExtension()); // '.pdf'
   * ```
   */
  getExtension(): string {
    const parts = this.props.originalName.split(".");
    if (parts.length > 1) {
      const lastPart = parts[parts.length - 1];
      return "." + (lastPart?.toLowerCase() ?? "");
    }
    return "";
  }

  /**
   * Checks if the file size exceeds a given limit.
   *
   * @param maxSizeMB - Maximum size in megabytes
   * @returns true if the file is too large, false otherwise
   *
   * @example
   * ```typescript
   * const attachment = Attachment.create({
   *   ...
   *   size: 15 * 1024 * 1024 // 15 MB
   * });
   * if (attachment.isTooLarge(10)) {
   *   console.log('File exceeds 10 MB limit');
   * }
   * ```
   */
  isTooLarge(maxSizeMB: number): boolean {
    return this.getFileSizeInMB() > maxSizeMB;
  }

  /**
   * Validates the task ID.
   *
   * @private
   * @param taskId - The task ID to validate
   * @throws {Error} If task ID is invalid
   */
  private validateTaskId(taskId: string): void {
    if (!taskId || typeof taskId !== "string" || taskId.trim().length === 0) {
      throw new Error("Task ID is required");
    }
  }

  /**
   * Validates the user ID.
   *
   * @private
   * @param userId - The user ID to validate
   * @throws {Error} If user ID is invalid
   */
  private validateUserId(userId: string): void {
    if (!userId || typeof userId !== "string" || userId.trim().length === 0) {
      throw new Error("User ID is required");
    }
  }

  /**
   * Validates the file name.
   *
   * @private
   * @param fileName - The file name to validate
   * @throws {Error} If file name is invalid
   */
  private validateFileName(fileName: string): void {
    if (!fileName || typeof fileName !== "string") {
      throw new Error("File name is required");
    }

    const trimmed = fileName.trim();
    if (trimmed.length === 0) {
      throw new Error("File name cannot be empty");
    }

    if (trimmed.length > 255) {
      throw new Error("File name cannot exceed 255 characters");
    }
  }

  /**
   * Validates the original file name.
   *
   * @private
   * @param originalName - The original file name to validate
   * @throws {Error} If original name is invalid
   */
  private validateOriginalName(originalName: string): void {
    if (!originalName || typeof originalName !== "string") {
      throw new Error("Original file name is required");
    }

    const trimmed = originalName.trim();
    if (trimmed.length === 0) {
      throw new Error("Original file name cannot be empty");
    }

    if (trimmed.length > 255) {
      throw new Error("Original file name cannot exceed 255 characters");
    }
  }

  /**
   * Validates the MIME type.
   *
   * @private
   * @param mimeType - The MIME type to validate
   * @throws {Error} If MIME type is invalid
   */
  private validateMimeType(mimeType: string): void {
    if (!mimeType || typeof mimeType !== "string") {
      throw new Error("MIME type is required");
    }

    const trimmed = mimeType.trim();
    if (trimmed.length === 0) {
      throw new Error("MIME type cannot be empty");
    }

    // Basic MIME type format validation (type/subtype)
    const mimeRegex = /^[a-z]+\/[a-z0-9]+[a-z0-9+.-]*$/i;
    if (!mimeRegex.test(trimmed)) {
      throw new Error("Invalid MIME type format");
    }
  }

  /**
   * Validates the file size.
   *
   * @private
   * @param size - The file size in bytes to validate
   * @throws {Error} If size is invalid
   */
  private validateSize(size: number): void {
    if (typeof size !== "number" || isNaN(size)) {
      throw new Error("File size must be a number");
    }

    if (size <= 0) {
      throw new Error("File size must be greater than 0");
    }

    const maxSizeBytes = FILE_LIMITS.MAX_FILE_SIZE;
    if (size > maxSizeBytes) {
      throw new Error(
        `File size cannot exceed ${maxSizeBytes / (1024 * 1024)} MB`
      );
    }
  }

  /**
   * Validates the storage path.
   *
   * @private
   * @param storagePath - The storage path to validate
   * @throws {Error} If storage path is invalid
   */
  private validateStoragePath(storagePath: string): void {
    if (!storagePath || typeof storagePath !== "string") {
      throw new Error("Storage path is required");
    }

    const trimmed = storagePath.trim();
    if (trimmed.length === 0) {
      throw new Error("Storage path cannot be empty");
    }

    if (trimmed.length > 2048) {
      throw new Error("Storage path cannot exceed 2048 characters");
    }
  }

  /**
   * Creates a draft version of this attachment.
   *
   * Draft mode skips validation, useful for forms before submission.
   *
   * @returns A new Attachment instance in draft mode
   *
   * @example
   * ```typescript
   * const draft = attachment.asDraft();
   * // Can now modify without validation
   * ```
   */
  asDraft(): this {
    return this.clone(this.props, "draft");
  }

  /**
   * Converts this attachment to valid mode.
   *
   * Triggers validation of all properties.
   *
   * @returns A new Attachment instance in valid mode
   * @throws {Error} If any validation fails
   *
   * @example
   * ```typescript
   * const draft = new Attachment({ fileName: '' }, 'draft');
   * const valid = draft.asValid(); // Throws error if fileName is empty
   * ```
   */
  asValid(): this {
    return this.clone(this.props, "valid");
  }
}
