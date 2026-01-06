import { Attachment, AttachmentProps } from "../model/attachment.entity";
import { FILE_LIMITS } from "../../shared/constants/limits.constants";

describe("Attachment Entity", () => {
  const validProps: Omit<AttachmentProps, "id" | "isUploaded" | "uploadedAt" | "createdAt" | "updatedAt"> = {
    taskId: "task-123",
    userId: "user-456",
    fileName: "stored-file-name.pdf",
    originalName: "document.pdf",
    mimeType: "application/pdf",
    size: 1024000,
    storagePath: "/uploads/stored-file-name.pdf",
  };

  describe("Constructor", () => {
    it("should create an attachment with valid properties", () => {
      const attachment = new Attachment(validProps);

      expect(attachment).toBeInstanceOf(Attachment);
      expect(attachment.id).toBeDefined();
      expect(attachment.taskId).toBe(validProps.taskId);
      expect(attachment.userId).toBe(validProps.userId);
      expect(attachment.fileName).toBe(validProps.fileName);
      expect(attachment.originalName).toBe(validProps.originalName);
      expect(attachment.mimeType).toBe(validProps.mimeType);
      expect(attachment.size).toBe(validProps.size);
      expect(attachment.storagePath).toBe(validProps.storagePath);
      expect(attachment.isUploaded).toBe(false);
      expect(attachment.createdAt).toBeInstanceOf(Date);
      expect(attachment.updatedAt).toBeInstanceOf(Date);
    });

    it("should create an attachment with provided id", () => {
      const propsWithId = { ...validProps, id: "attachment-123" };
      const attachment = new Attachment(propsWithId);

      expect(attachment.id).toBe("attachment-123");
    });

    it("should create an attachment with provided timestamps", () => {
      const now = new Date();
      const propsWithTimestamps = {
        ...validProps,
        createdAt: now,
        updatedAt: now,
      };
      const attachment = new Attachment(propsWithTimestamps);

      expect(attachment.createdAt).toBe(now);
      expect(attachment.updatedAt).toBe(now);
    });

    it("should create an attachment with isUploaded true", () => {
      const propsWithUploaded = {
        ...validProps,
        isUploaded: true,
        uploadedAt: new Date(),
      };
      const attachment = new Attachment(propsWithUploaded);

      expect(attachment.isUploaded).toBe(true);
      expect(attachment.uploadedAt).toBeInstanceOf(Date);
    });

    it("should default isUploaded to false", () => {
      const attachment = new Attachment(validProps);

      expect(attachment.isUploaded).toBe(false);
    });

    it("should create a draft attachment that skips validation", () => {
      const draftAttachment = new Attachment(
        { ...validProps, fileName: "" },
        "draft",
      );

      expect(draftAttachment.isDraft()).toBe(true);
      expect(draftAttachment.fileName).toBe("");
    });

    it("should create a valid attachment that validates", () => {
      const validAttachment = new Attachment(validProps, "valid");

      expect(validAttachment.isValid()).toBe(true);
      expect(validAttachment.fileName).toBe(validProps.fileName);
    });
  });

  describe("Static create() factory method", () => {
    it("should create an attachment with defaults", () => {
      const attachment = Attachment.create(validProps);

      expect(attachment.id).toBeDefined();
      expect(attachment.taskId).toBe(validProps.taskId);
      expect(attachment.userId).toBe(validProps.userId);
      expect(attachment.fileName).toBe(validProps.fileName);
      expect(attachment.originalName).toBe(validProps.originalName);
      expect(attachment.mimeType).toBe(validProps.mimeType);
      expect(attachment.size).toBe(validProps.size);
      expect(attachment.storagePath).toBe(validProps.storagePath);
      expect(attachment.isUploaded).toBe(false);
      expect(attachment.createdAt).toBeInstanceOf(Date);
      expect(attachment.updatedAt).toBeInstanceOf(Date);
    });

    it("should create an attachment with minimal required props", () => {
      const attachment = Attachment.create({
        taskId: "task-123",
        userId: "user-456",
        fileName: "file.jpg",
        originalName: "photo.jpg",
        mimeType: "image/jpeg",
        size: 524288,
        storagePath: "/uploads/file.jpg",
      });

      expect(attachment.id).toBeDefined();
      expect(attachment.isUploaded).toBe(false);
    });
  });

  describe("Validation", () => {
    it("should throw error if taskId is missing", () => {
      expect(() => {
        new Attachment({ ...validProps, taskId: "" });
      }).toThrow("Task ID is required");
    });

    it("should throw error if taskId is only whitespace", () => {
      expect(() => {
        new Attachment({ ...validProps, taskId: "   " });
      }).toThrow("Task ID is required");
    });

    it("should throw error if userId is missing", () => {
      expect(() => {
        new Attachment({ ...validProps, userId: "" });
      }).toThrow("User ID is required");
    });

    it("should throw error if userId is only whitespace", () => {
      expect(() => {
        new Attachment({ ...validProps, userId: "   " });
      }).toThrow("User ID is required");
    });

    it("should throw error if fileName is missing", () => {
      expect(() => {
        new Attachment({ ...validProps, fileName: "" as unknown as string });
      }).toThrow("File name is required");
    });

    it("should throw error if fileName exceeds max length", () => {
      const longFileName = "a".repeat(256);
      expect(() => {
        new Attachment({ ...validProps, fileName: longFileName });
      }).toThrow("File name cannot exceed 255 characters");
    });

    it("should accept fileName at max length", () => {
      const maxFileName = "a".repeat(255);
      expect(() => {
        new Attachment({ ...validProps, fileName: maxFileName });
      }).not.toThrow();
    });

    it("should throw error if originalName is missing", () => {
      expect(() => {
        new Attachment({ ...validProps, originalName: "" as unknown as string });
      }).toThrow("Original file name is required");
    });

    it("should throw error if originalName exceeds max length", () => {
      const longOriginalName = "a".repeat(256);
      expect(() => {
        new Attachment({ ...validProps, originalName: longOriginalName });
      }).toThrow("Original file name cannot exceed 255 characters");
    });

    it("should throw error if mimeType is missing", () => {
      expect(() => {
        new Attachment({ ...validProps, mimeType: "" });
      }).toThrow("MIME type is required");
    });

    it("should throw error if mimeType is invalid format", () => {
      expect(() => {
        new Attachment({ ...validProps, mimeType: "invalid-mime-type" });
      }).toThrow("Invalid MIME type format");
    });

    it("should accept valid MIME types", () => {
      expect(() => {
        new Attachment({ ...validProps, mimeType: "application/pdf" });
      }).not.toThrow();

      expect(() => {
        new Attachment({ ...validProps, mimeType: "image/jpeg" });
      }).not.toThrow();

      expect(() => {
        new Attachment({ ...validProps, mimeType: "text/plain" });
      }).not.toThrow();
    });

    it("should throw error if size is not a number", () => {
      expect(() => {
        new Attachment({ ...validProps, size: NaN });
      }).toThrow("File size must be a number");
    });

    it("should throw error if size is 0", () => {
      expect(() => {
        new Attachment({ ...validProps, size: 0 });
      }).toThrow("File size must be greater than 0");
    });

    it("should throw error if size is negative", () => {
      expect(() => {
        new Attachment({ ...validProps, size: -100 });
      }).toThrow("File size must be greater than 0");
    });

    it("should throw error if size exceeds max limit", () => {
      const maxSizeBytes = FILE_LIMITS.MAX_FILE_SIZE + 1;
      expect(() => {
        new Attachment({ ...validProps, size: maxSizeBytes });
      }).toThrow("File size cannot exceed");
    });

    it("should accept size at max limit", () => {
      const maxSizeBytes = FILE_LIMITS.MAX_FILE_SIZE;
      expect(() => {
        new Attachment({ ...validProps, size: maxSizeBytes });
      }).not.toThrow();
    });

    it("should throw error if storagePath is missing", () => {
      expect(() => {
        new Attachment({ ...validProps, storagePath: "" as unknown as string });
      }).toThrow("Storage path is required");
    });

    it("should throw error if storagePath exceeds max length", () => {
      const longPath = "a".repeat(2049);
      expect(() => {
        new Attachment({ ...validProps, storagePath: longPath });
      }).toThrow("Storage path cannot exceed 2048 characters");
    });

    it("should accept storagePath at max length", () => {
      const maxPath = "a".repeat(2048);
      expect(() => {
        new Attachment({ ...validProps, storagePath: maxPath });
      }).not.toThrow();
    });
  });

  describe("markAsUploaded() business method", () => {
    let attachment: Attachment;

    beforeEach(() => {
      attachment = Attachment.create(validProps);
    });

    it("should mark attachment as uploaded", () => {
      const uploaded = attachment.markAsUploaded();

      expect(uploaded.isUploaded).toBe(true);
    });

    it("should set uploadedAt timestamp", () => {
      const before = new Date();
      const uploaded = attachment.markAsUploaded();
      const after = new Date();

      expect(uploaded.uploadedAt).toBeInstanceOf(Date);
      expect(uploaded.uploadedAt!.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
      expect(uploaded.uploadedAt!.getTime()).toBeLessThanOrEqual(
        after.getTime(),
      );
    });

    it("should update updatedAt timestamp", () => {
      const originalUpdatedAt = attachment.updatedAt;
      const uploaded = attachment.markAsUploaded();

      expect(uploaded.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it("should create a new instance (immutability)", () => {
      const uploaded = attachment.markAsUploaded();

      expect(uploaded).not.toBe(attachment);
      expect(attachment.isUploaded).toBe(false);
      expect(attachment.uploadedAt).toBeNull();
    });
  });

  describe("getFileSizeInMB() business method", () => {
    it("should return size in megabytes", () => {
      const attachment = Attachment.create({
        ...validProps,
        size: 5242880, // 5 MB
      });

      expect(attachment.getFileSizeInMB()).toBe(5.0);
    });

    it("should return decimal values", () => {
      const attachment = Attachment.create({
        ...validProps,
        size: 1572864, // 1.5 MB
      });

      expect(attachment.getFileSizeInMB()).toBeCloseTo(1.5, 2);
    });

    it("should return 0 for small files", () => {
      const attachment = Attachment.create({
        ...validProps,
        size: 1024, // 1 KB
      });

      expect(attachment.getFileSizeInMB()).toBeCloseTo(0.0009765625, 10);
    });
  });

  describe("getFileSizeInKB() business method", () => {
    it("should return size in kilobytes", () => {
      const attachment = Attachment.create({
        ...validProps,
        size: 102400, // 100 KB
      });

      expect(attachment.getFileSizeInKB()).toBe(100);
    });

    it("should return decimal values", () => {
      const attachment = Attachment.create({
        ...validProps,
        size: 1536, // 1.5 KB
      });

      expect(attachment.getFileSizeInKB()).toBe(1.5);
    });
  });

  describe("isImage() business method", () => {
    it("should return true for JPEG images", () => {
      const attachment = Attachment.create({
        ...validProps,
        mimeType: "image/jpeg",
      });

      expect(attachment.isImage()).toBe(true);
    });

    it("should return true for PNG images", () => {
      const attachment = Attachment.create({
        ...validProps,
        mimeType: "image/png",
      });

      expect(attachment.isImage()).toBe(true);
    });

    it("should return true for GIF images", () => {
      const attachment = Attachment.create({
        ...validProps,
        mimeType: "image/gif",
      });

      expect(attachment.isImage()).toBe(true);
    });

    it("should return true for WEBP images", () => {
      const attachment = Attachment.create({
        ...validProps,
        mimeType: "image/webp",
      });

      expect(attachment.isImage()).toBe(true);
    });

    it("should return false for PDF documents", () => {
      const attachment = Attachment.create({
        ...validProps,
        mimeType: "application/pdf",
      });

      expect(attachment.isImage()).toBe(false);
    });

    it("should return false for text files", () => {
      const attachment = Attachment.create({
        ...validProps,
        mimeType: "text/plain",
      });

      expect(attachment.isImage()).toBe(false);
    });
  });

  describe("isPDF() business method", () => {
    it("should return true for PDF files", () => {
      const attachment = Attachment.create({
        ...validProps,
        mimeType: "application/pdf",
      });

      expect(attachment.isPDF()).toBe(true);
    });

    it("should return false for images", () => {
      const attachment = Attachment.create({
        ...validProps,
        mimeType: "image/jpeg",
      });

      expect(attachment.isPDF()).toBe(false);
    });

    it("should return false for text files", () => {
      const attachment = Attachment.create({
        ...validProps,
        mimeType: "text/plain",
      });

      expect(attachment.isPDF()).toBe(false);
    });
  });

  describe("isDocument() business method", () => {
    it("should return true for PDF files", () => {
      const attachment = Attachment.create({
        ...validProps,
        mimeType: "application/pdf",
      });

      expect(attachment.isDocument()).toBe(true);
    });

    it("should return true for Word documents", () => {
      const attachment = Attachment.create({
        ...validProps,
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      expect(attachment.isDocument()).toBe(true);
    });

    it("should return true for Excel spreadsheets", () => {
      const attachment = Attachment.create({
        ...validProps,
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      expect(attachment.isDocument()).toBe(true);
    });

    it("should return true for PowerPoint presentations", () => {
      const attachment = Attachment.create({
        ...validProps,
        mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      });

      expect(attachment.isDocument()).toBe(true);
    });

    it("should return true for text files", () => {
      const attachment = Attachment.create({
        ...validProps,
        mimeType: "text/plain",
      });

      expect(attachment.isDocument()).toBe(true);
    });

    it("should return true for CSV files", () => {
      const attachment = Attachment.create({
        ...validProps,
        mimeType: "text/csv",
      });

      expect(attachment.isDocument()).toBe(true);
    });

    it("should return false for images", () => {
      const attachment = Attachment.create({
        ...validProps,
        mimeType: "image/jpeg",
      });

      expect(attachment.isDocument()).toBe(false);
    });
  });

  describe("getExtension() business method", () => {
    it("should return extension with dot", () => {
      const attachment = Attachment.create({
        ...validProps,
        originalName: "document.pdf",
      });

      expect(attachment.getExtension()).toBe(".pdf");
    });

    it("should return lowercase extension", () => {
      const attachment = Attachment.create({
        ...validProps,
        originalName: "IMAGE.JPG",
      });

      expect(attachment.getExtension()).toBe(".jpg");
    });

    it("should return extension for files with multiple dots", () => {
      const attachment = Attachment.create({
        ...validProps,
        originalName: "file.name.with.dots.txt",
      });

      expect(attachment.getExtension()).toBe(".txt");
    });

    it("should return empty string for files without extension", () => {
      const attachment = Attachment.create({
        ...validProps,
        originalName: "README",
      });

      expect(attachment.getExtension()).toBe("");
    });

    it("should return empty string for file ending with dot", () => {
      const attachment = Attachment.create({
        ...validProps,
        originalName: "file.",
      });

      expect(attachment.getExtension()).toBe(".");
    });
  });

  describe("isTooLarge() business method", () => {
    it("should return true if file exceeds limit", () => {
      const attachment = Attachment.create({
        ...validProps,
        size: 15 * 1024 * 1024, // 15 MB
      });

      expect(attachment.isTooLarge(10)).toBe(true);
    });

    it("should return false if file is within limit", () => {
      const attachment = Attachment.create({
        ...validProps,
        size: 5 * 1024 * 1024, // 5 MB
      });

      expect(attachment.isTooLarge(10)).toBe(false);
    });

    it("should return false if file equals limit", () => {
      const attachment = Attachment.create({
        ...validProps,
        size: 10 * 1024 * 1024, // 10 MB
      });

      expect(attachment.isTooLarge(10)).toBe(false);
    });
  });

  describe("asDraft() method", () => {
    it("should convert attachment to draft mode", () => {
      const attachment = Attachment.create(validProps);
      const draft = attachment.asDraft();

      expect(draft.isDraft()).toBe(true);
      expect(draft.isValid()).toBe(false);
    });

    it("should preserve all properties", () => {
      const attachment = Attachment.create(validProps);
      const draft = attachment.asDraft();

      expect(draft.id).toBe(attachment.id);
      expect(draft.fileName).toBe(attachment.fileName);
      expect(draft.originalName).toBe(attachment.originalName);
      expect(draft.taskId).toBe(attachment.taskId);
      expect(draft.userId).toBe(attachment.userId);
    });

    it("should create a new instance", () => {
      const attachment = Attachment.create(validProps);
      const draft = attachment.asDraft();

      expect(draft).not.toBe(attachment);
    });
  });

  describe("asValid() method", () => {
    it("should convert attachment to valid mode", () => {
      const draft = new Attachment(validProps, "draft");
      const valid = draft.asValid();

      expect(valid.isValid()).toBe(true);
      expect(valid.isDraft()).toBe(false);
    });

    it("should preserve all properties", () => {
      const attachment = Attachment.create(validProps);
      const valid = attachment.asValid();

      expect(valid.id).toBe(attachment.id);
      expect(valid.fileName).toBe(attachment.fileName);
    });

    it("should create a new instance", () => {
      const attachment = Attachment.create(validProps);
      const valid = attachment.asValid();

      expect(valid).not.toBe(attachment);
    });
  });

  describe("clone() method (inherited from Entity)", () => {
    it("should create a copy with updated properties", () => {
      const attachment = Attachment.create(validProps);
      const cloned = attachment.clone({ fileName: "new-file-name.pdf" });

      expect(cloned.id).toBe(attachment.id);
      expect(cloned.fileName).toBe("new-file-name.pdf");
      expect(cloned).not.toBe(attachment);
    });

    it("should preserve non-updated properties", () => {
      const attachment = Attachment.create(validProps);
      const cloned = attachment.clone({ fileName: "new-file.pdf" });

      expect(cloned.taskId).toBe(attachment.taskId);
      expect(cloned.userId).toBe(attachment.userId);
      expect(cloned.originalName).toBe(attachment.originalName);
    });
  });

  describe("equals() method (inherited from Entity)", () => {
    it("should return true for same entity", () => {
      const attachment = Attachment.create(validProps);

      expect(attachment.equals(attachment)).toBe(true);
    });

    it("should return true for entities with same id", () => {
      const attachment1 = Attachment.create({ ...validProps, id: "attachment-123" });
      const attachment2 = Attachment.create({ ...validProps, id: "attachment-123" });

      expect(attachment1.equals(attachment2)).toBe(true);
    });

    it("should return false for entities with different ids", () => {
      const attachment1 = Attachment.create(validProps);
      const attachment2 = Attachment.create(validProps);

      expect(attachment1.equals(attachment2)).toBe(false);
    });

    it("should return false for non-entities", () => {
      const attachment = Attachment.create(validProps);

      expect(attachment.equals(null)).toBe(false);
      expect(attachment.equals(undefined)).toBe(false);
      expect(attachment.equals({})).toBe(false);
    });
  });
});
