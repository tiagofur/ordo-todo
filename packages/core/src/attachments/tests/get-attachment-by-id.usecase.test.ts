import { GetAttachmentByIdUseCase, GetAttachmentByIdInput } from "../usecase/get-attachment-by-id.usecase";
import { AttachmentRepository } from "../provider/attachment.repository";
import { Attachment } from "../model/attachment.entity";

describe("GetAttachmentByIdUseCase", () => {
  let useCase: GetAttachmentByIdUseCase;
  let mockRepository: jest.Mocked<AttachmentRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByTaskId: jest.fn(),
      findByUserId: jest.fn(),
      findByMimeType: jest.fn(),
      delete: jest.fn(),
      countByTaskId: jest.fn(),
      getTotalSizeByTaskId: jest.fn(),
    };
    useCase = new GetAttachmentByIdUseCase(mockRepository);
  });

  const validInput: GetAttachmentByIdInput = {
    attachmentId: "attachment-123",
  };

  describe("execute()", () => {
    it("should get attachment by id successfully", async () => {
      const attachment = Attachment.create({
        taskId: "task-123",
        userId: "user-456",
        fileName: "file.pdf",
        originalName: "document.pdf",
        mimeType: "application/pdf",
        size: 1024000,
        storagePath: "/uploads/file.pdf",
      });
      mockRepository.findById.mockResolvedValue(attachment);

      const result = await useCase.execute(validInput);

      expect(result).toBeInstanceOf(Attachment);
      expect(result.id).toBe(attachment.id);
      expect(result.originalName).toBe("document.pdf");
      expect(mockRepository.findById).toHaveBeenCalledWith(validInput.attachmentId);
    });

    it("should throw error if attachmentId is missing", async () => {
      const invalidInput = { ...validInput, attachmentId: "" };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "Attachment ID is required",
      );
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    it("should throw error if attachmentId is only whitespace", async () => {
      const invalidInput = { ...validInput, attachmentId: "   " };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "Attachment ID is required",
      );
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    it("should throw error if attachment not found", async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(validInput)).rejects.toThrow(
        "Attachment not found",
      );
      expect(mockRepository.findById).toHaveBeenCalledWith(validInput.attachmentId);
    });

    it("should pass repository errors through", async () => {
      const error = new Error("Database connection failed");
      mockRepository.findById.mockRejectedValue(error);

      await expect(useCase.execute(validInput)).rejects.toThrow(
        "Database connection failed",
      );
    });

    it("should return attachment with all properties", async () => {
      const attachment = Attachment.create({
        taskId: "task-123",
        userId: "user-456",
        fileName: "stored-name.pdf",
        originalName: "document.pdf",
        mimeType: "application/pdf",
        size: 1024000,
        storagePath: "/uploads/stored-name.pdf",
      });
      mockRepository.findById.mockResolvedValue(attachment);

      const result = await useCase.execute(validInput);

      expect(result.taskId).toBe("task-123");
      expect(result.userId).toBe("user-456");
      expect(result.fileName).toBe("stored-name.pdf");
      expect(result.originalName).toBe("document.pdf");
      expect(result.mimeType).toBe("application/pdf");
      expect(result.size).toBe(1024000);
      expect(result.storagePath).toBe("/uploads/stored-name.pdf");
    });

    it("should handle image attachments", async () => {
      const attachment = Attachment.create({
        taskId: "task-123",
        userId: "user-456",
        fileName: "photo.jpg",
        originalName: "photo.jpg",
        mimeType: "image/jpeg",
        size: 524288,
        storagePath: "/uploads/photo.jpg",
      });
      mockRepository.findById.mockResolvedValue(attachment);

      const result = await useCase.execute(validInput);

      expect(result.mimeType).toBe("image/jpeg");
      expect(result.isImage()).toBe(true);
    });

    it("should handle uploaded attachments", async () => {
      const attachment = Attachment.create({
        taskId: "task-123",
        userId: "user-456",
        fileName: "file.pdf",
        originalName: "document.pdf",
        mimeType: "application/pdf",
        size: 1024000,
        storagePath: "/uploads/file.pdf",
      }).markAsUploaded();
      mockRepository.findById.mockResolvedValue(attachment);

      const result = await useCase.execute(validInput);

      expect(result.isUploaded).toBe(true);
      expect(result.uploadedAt).toBeInstanceOf(Date);
    });
  });
});
