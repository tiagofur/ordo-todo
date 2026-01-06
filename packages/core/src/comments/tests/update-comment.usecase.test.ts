import { UpdateCommentUseCase, UpdateCommentInput } from "../usecase/update-comment.usecase";
import { CommentRepository } from "../provider/comment.repository";
import { Comment } from "../model/comment.entity";

describe("UpdateCommentUseCase", () => {
  let useCase: UpdateCommentUseCase;
  let mockRepository: jest.Mocked<CommentRepository>;
  let mockComment: Comment;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByTaskId: jest.fn(),
      findByUserId: jest.fn(),
      findByParentCommentId: jest.fn(),
      findMentionsForUser: jest.fn(),
      delete: jest.fn(),
      countByTaskId: jest.fn(),
      findMentionsForUserInTask: jest.fn(),
    };

    // Create a mock comment
    mockComment = Comment.create({
      taskId: "task-123",
      userId: "user-456",
      content: "Original content",
    });

    useCase = new UpdateCommentUseCase(mockRepository);
  });

  const validInput: UpdateCommentInput = {
    commentId: "comment-123",
    userId: "user-456",
    newContent: "Updated content",
  };

  describe("execute()", () => {
    it("should update comment content successfully", async () => {
      mockRepository.findById.mockResolvedValue(mockComment);
      mockRepository.update.mockResolvedValue(mockComment);

      const result = await useCase.execute(validInput);

      expect(result.content).toBe("Updated content");
      expect(result.isEdited).toBe(true);
      expect(result.editedAt).toBeInstanceOf(Date);
      expect(mockRepository.findById).toHaveBeenCalledWith("comment-123");
      expect(mockRepository.update).toHaveBeenCalledWith(result);
    });

    it("should trim whitespace from new content", async () => {
      mockRepository.findById.mockResolvedValue(mockComment);
      mockRepository.update.mockResolvedValue(mockComment);

      const inputWithWhitespace: UpdateCommentInput = {
        ...validInput,
        newContent: "  Updated content  ",
      };

      const result = await useCase.execute(inputWithWhitespace);

      expect(result.content).toBe("Updated content");
    });

    it("should throw error if commentId is missing", async () => {
      const invalidInput = { ...validInput, commentId: "" };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "Comment ID is required",
      );
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    it("should throw error if userId is missing", async () => {
      const invalidInput = { ...validInput, userId: "" };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "User ID is required",
      );
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    it("should throw error if newContent is missing", async () => {
      const invalidInput = { ...validInput, newContent: "" };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "New content is required",
      );
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    it("should throw error if commentId is only whitespace", async () => {
      const invalidInput = { ...validInput, commentId: "   " };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "Comment ID is required",
      );
    });

    it("should throw error if userId is only whitespace", async () => {
      const invalidInput = { ...validInput, userId: "   " };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "User ID is required",
      );
    });

    it("should throw error if newContent is only whitespace", async () => {
      const invalidInput = { ...validInput, newContent: "   " };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "New content is required",
      );
    });

    it("should throw error if comment not found", async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(validInput)).rejects.toThrow(
        "Comment not found",
      );
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it("should throw error if user is not the comment author", async () => {
      const otherUserComment = Comment.create({
        taskId: "task-123",
        userId: "user-789", // Different user
        content: "Original content",
      });

      mockRepository.findById.mockResolvedValue(otherUserComment);

      const input: UpdateCommentInput = {
        commentId: "comment-123",
        userId: "user-456", // Different from author
        newContent: "Updated content",
      };

      await expect(useCase.execute(input)).rejects.toThrow(
        "You can only edit your own comments",
      );
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it("should throw error if new content is too long", async () => {
      mockRepository.findById.mockResolvedValue(mockComment);

      const input: UpdateCommentInput = {
        ...validInput,
        newContent: "a".repeat(2001), // Max is 2000
      };

      await expect(useCase.execute(input)).rejects.toThrow();
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it("should pass repository errors through", async () => {
      const dbError = new Error("Database connection failed");
      mockRepository.findById.mockRejectedValue(dbError);

      await expect(useCase.execute(validInput)).rejects.toThrow(
        "Database connection failed",
      );
    });

    it("should allow author to update their own comment", async () => {
      const authorComment = Comment.create({
        taskId: "task-123",
        userId: "user-456",
        content: "Original content",
      });

      mockRepository.findById.mockResolvedValue(authorComment);
      mockRepository.update.mockResolvedValue(authorComment);

      const input: UpdateCommentInput = {
        commentId: "comment-123",
        userId: "user-456", // Same as author
        newContent: "Updated content",
      };

      const result = await useCase.execute(input);

      expect(result.content).toBe("Updated content");
      expect(mockRepository.update).toHaveBeenCalled();
    });
  });
});
