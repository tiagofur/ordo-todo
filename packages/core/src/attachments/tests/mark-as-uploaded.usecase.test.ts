import { MarkAsUploadedUseCase, MarkAsUploadedInput } from "../usecase/mark-as-uploaded.usecase";
import { AttachmentRepository } from "../provider/attachment.repository";
import { Attachment } from "../model/attachment.entity";

describe("MarkAsUploadedUseCase", () => {
  let useCase: MarkAsUploadedUseCase;
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
    useCase = new MarkAsUploadedUseCase(mockRepository);
  });

  const validInput: MarkAsUploadedInput = {
    attachmentId: "attachment-123",
  };

  describe("execute()", () => {
    it("should mark attachment as uploaded successfully", async () => {
      const existingAttachment = Attachment.create({
        taskId: "task-123",
        userId: "user-456",
        fileName: "file.pdf",
        originalName: "document.pdf",
        mimeType: "application/pdf",
        size: 1024000,
        storagePath: "/uploads/file.pdf",
      });
      mockRepository.findById.mockResolvedValue(existingAttachment);
      mockRepository.update.mockResolvedValue(existingAttachment);

      const result = await useCase.execute(validInput);

      expect(result.isUploaded).toBe(true);
      expect(result.uploadedAt).toBeInstanceOf(Date);
      expect(mockRepository.findById).toHaveBeenCalledWith(validInput.attachmentId);
      expect(mockRepository.update).toHaveBeenCalled();
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
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it("should pass repository errors through", async () => {
      const error = new Error("Database connection failed");
      mockRepository.findById.mockRejectedValue(error);

      await expect(useCase.execute(validInput)).rejects.toThrow(
        "Database connection failed",
      );
    });

    it("should set uploadedAt to current time", async () => {
      const existingAttachment = Attachment.create({
        taskId: "task-123",
        userId: "user-456",
        fileName: "file.pdf",
        originalName: "document.pdf",
        mimeType: "application/pdf",
        size: 1024000,
        storagePath: "/uploads/file.pdf",
      });
      mockRepository.findById.mockResolvedValue(existingAttachment);
      mockRepository.update.mockResolvedValue(existingAttachment);

      const before = new Date();
      const result = await useCase.execute(validInput);
      const after = new Date();

      expect(result.uploadedAt).toBeInstanceOf(Date);
      expect(result.uploadedAt!.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
      expect(result.uploadedAt!.getTime()).toBeLessThanOrEqual(
        after.getTime(),
      );
    });

    it("should update updatedAt timestamp", async () => {
      const existingAttachment = Attachment.create({
        taskId: "task-123",
        userId: "user-456",
        fileName: "file.pdf",
        originalName: "document.pdf",
        mimeType: "application/pdf",
        size: 1024000,
        storagePath: "/uploads/file.pdf",
      });
      mockRepository.findById.mockResolvedValue(existingAttachment);
      mockRepository.update.mockResolvedValue(existingAttachment);

      const originalUpdatedAt = existingAttachment.updatedAt;
      const result = await useCase.execute(validInput);

      expect(result.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });
  });
});
