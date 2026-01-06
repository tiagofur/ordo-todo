import { RemoveMentionUseCase, RemoveMentionInput } from "../usecase/remove-mention.usecase";
import { CommentRepository } from "../provider/comment.repository";
import { Comment } from "../model/comment.entity";

describe("RemoveMentionUseCase", () => {
  let useCase: RemoveMentionUseCase;
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

    // Create a mock comment with existing mentions
    mockComment = Comment.create({
      taskId: "task-123",
      userId: "user-456",
      content: "Please review this",
      mentions: ["user-789", "user-abc"],
    });

    useCase = new RemoveMentionUseCase(mockRepository);
  });

  const validInput: RemoveMentionInput = {
    commentId: "comment-123",
    userIdToUnmention: "user-789",
  };

  describe("execute()", () => {
    it("should remove a mention from comment successfully", async () => {
      mockRepository.findById.mockResolvedValue(mockComment);
      mockRepository.update.mockResolvedValue(mockComment);

      const result = await useCase.execute(validInput);

      expect(result.hasMention("user-789")).toBe(false);
      expect(result.mentions).not.toContain("user-789");
      expect(result.mentions).toEqual(["user-abc"]);
      expect(mockRepository.findById).toHaveBeenCalledWith("comment-123");
      expect(mockRepository.update).toHaveBeenCalledWith(result);
    });

    it("should keep other mentions intact", async () => {
      mockRepository.findById.mockResolvedValue(mockComment);
      mockRepository.update.mockResolvedValue(mockComment);

      const result = await useCase.execute(validInput);

      expect(result.hasMention("user-abc")).toBe(true);
      expect(result.mentionCount).toBe(1);
    });

    it("should be idempotent - removing non-existent mention", async () => {
      mockRepository.findById.mockResolvedValue(mockComment);
      mockRepository.update.mockResolvedValue(mockComment);

      const input: RemoveMentionInput = {
        commentId: "comment-123",
        userIdToUnmention: "user-not-in-list",
      };

      const result = await useCase.execute(input);

      // Mentions should remain unchanged
      expect(result.mentions).toEqual(["user-789", "user-abc"]);
      expect(result.mentionCount).toBe(2);
    });

    it("should handle removing last mention", async () => {
      const singleMentionComment = Comment.create({
        taskId: "task-123",
        userId: "user-456",
        content: "Comment",
        mentions: ["user-789"],
      });

      mockRepository.findById.mockResolvedValue(singleMentionComment);
      mockRepository.update.mockResolvedValue(singleMentionComment);

      const result = await useCase.execute(validInput);

      expect(result.mentions).toEqual([]);
      expect(result.mentionCount).toBe(0);
    });

    it("should throw error if commentId is missing", async () => {
      const invalidInput = { ...validInput, commentId: "" };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "Comment ID is required",
      );
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    it("should throw error if commentId is only whitespace", async () => {
      const invalidInput = { ...validInput, commentId: "   " };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "Comment ID is required",
      );
    });

    it("should throw error if userIdToUnmention is missing", async () => {
      const invalidInput = { ...validInput, userIdToUnmention: "" };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "User ID to unmention is required",
      );
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    it("should throw error if userIdToUnmention is only whitespace", async () => {
      const invalidInput = { ...validInput, userIdToUnmention: "   " };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "User ID to unmention is required",
      );
    });

    it("should throw error if comment not found", async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(validInput)).rejects.toThrow(
        "Comment not found",
      );
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it("should pass repository errors through", async () => {
      const dbError = new Error("Database connection failed");
      mockRepository.findById.mockRejectedValue(dbError);

      await expect(useCase.execute(validInput)).rejects.toThrow(
        "Database connection failed",
      );
    });

    it("should pass update errors through", async () => {
      const updateError = new Error("Update failed");
      mockRepository.findById.mockResolvedValue(mockComment);
      mockRepository.update.mockRejectedValue(updateError);

      await expect(useCase.execute(validInput)).rejects.toThrow("Update failed");
    });

    it("should return the updated comment", async () => {
      mockRepository.findById.mockResolvedValue(mockComment);
      mockRepository.update.mockResolvedValue(mockComment);

      const result = await useCase.execute(validInput);

      expect(result).toBeInstanceOf(Comment);
      expect(result.hasMention("user-789")).toBe(false);
    });

    it("should update timestamp when removing mention", async () => {
      const originalUpdatedAt = mockComment.updatedAt;
      mockRepository.findById.mockResolvedValue(mockComment);
      mockRepository.update.mockResolvedValue(mockComment);

      const result = await useCase.execute(validInput);

      expect(result.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });
  });
});
