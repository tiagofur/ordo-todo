import { DeleteCommentUseCase, DeleteCommentInput } from "../usecase/delete-comment.usecase";
import { CommentRepository } from "../provider/comment.repository";
import { Comment } from "../model/comment.entity";

describe("DeleteCommentUseCase", () => {
  let useCase: DeleteCommentUseCase;
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
      content: "Content to delete",
    });

    useCase = new DeleteCommentUseCase(mockRepository);
  });

  const validInput: DeleteCommentInput = {
    commentId: "comment-123",
    userId: "user-456",
  };

  describe("execute()", () => {
    it("should delete comment successfully", async () => {
      mockRepository.findById.mockResolvedValue(mockComment);
      mockRepository.delete.mockResolvedValue(undefined);

      await expect(useCase.execute(validInput)).resolves.toBeUndefined();

      expect(mockRepository.findById).toHaveBeenCalledWith("comment-123");
      expect(mockRepository.delete).toHaveBeenCalledWith("comment-123");
    });

    it("should throw error if commentId is missing", async () => {
      const invalidInput = { ...validInput, commentId: "" };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "Comment ID is required",
      );
      expect(mockRepository.findById).not.toHaveBeenCalled();
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it("should throw error if commentId is only whitespace", async () => {
      const invalidInput = { ...validInput, commentId: "   " };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "Comment ID is required",
      );
    });

    it("should throw error if userId is missing", async () => {
      const invalidInput = { ...validInput, userId: "" };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "User ID is required",
      );
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    it("should throw error if userId is only whitespace", async () => {
      const invalidInput = { ...validInput, userId: "   " };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "User ID is required",
      );
    });

    it("should throw error if comment not found", async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(validInput)).rejects.toThrow(
        "Comment not found",
      );
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it("should throw error if user is not the comment author", async () => {
      const otherUserComment = Comment.create({
        taskId: "task-123",
        userId: "user-789", // Different user
        content: "Content",
      });

      mockRepository.findById.mockResolvedValue(otherUserComment);

      const input: DeleteCommentInput = {
        commentId: "comment-123",
        userId: "user-456", // Different from author
      };

      await expect(useCase.execute(input)).rejects.toThrow(
        "You can only delete your own comments",
      );
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it("should allow author to delete their own comment", async () => {
      const authorComment = Comment.create({
        taskId: "task-123",
        userId: "user-456",
        content: "My content",
      });

      mockRepository.findById.mockResolvedValue(authorComment);
      mockRepository.delete.mockResolvedValue(undefined);

      const input: DeleteCommentInput = {
        commentId: "comment-123",
        userId: "user-456", // Same as author
      };

      await expect(useCase.execute(input)).resolves.toBeUndefined();
      expect(mockRepository.delete).toHaveBeenCalledWith("comment-123");
    });

    it("should pass repository errors through", async () => {
      const dbError = new Error("Database connection failed");
      mockRepository.findById.mockRejectedValue(dbError);

      await expect(useCase.execute(validInput)).rejects.toThrow(
        "Database connection failed",
      );
    });

    it("should pass delete errors through", async () => {
      const deleteError = new Error("Foreign key constraint");
      mockRepository.findById.mockResolvedValue(mockComment);
      mockRepository.delete.mockRejectedValue(deleteError);

      await expect(useCase.execute(validInput)).rejects.toThrow(
        "Foreign key constraint",
      );
    });

    it("should return void (undefined) on success", async () => {
      mockRepository.findById.mockResolvedValue(mockComment);
      mockRepository.delete.mockResolvedValue(undefined);

      const result = await useCase.execute(validInput);

      expect(result).toBeUndefined();
    });
  });
});
