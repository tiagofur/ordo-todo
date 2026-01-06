import { AddMentionUseCase, AddMentionInput } from "../usecase/add-mention.usecase";
import { CommentRepository } from "../provider/comment.repository";
import { Comment } from "../model/comment.entity";

describe("AddMentionUseCase", () => {
  let useCase: AddMentionUseCase;
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

    // Create a mock comment without existing mentions
    mockComment = Comment.create({
      taskId: "task-123",
      userId: "user-456",
      content: "Please review this",
    });

    useCase = new AddMentionUseCase(mockRepository);
  });

  const validInput: AddMentionInput = {
    commentId: "comment-123",
    userIdToMention: "user-789",
  };

  describe("execute()", () => {
    it("should add a mention to comment successfully", async () => {
      mockRepository.findById.mockResolvedValue(mockComment);
      mockRepository.update.mockResolvedValue(mockComment);

      const result = await useCase.execute(validInput);

      expect(result.hasMention("user-789")).toBe(true);
      expect(result.mentions).toContain("user-789");
      expect(mockRepository.findById).toHaveBeenCalledWith("comment-123");
      expect(mockRepository.update).toHaveBeenCalledWith(result);
    });

    it("should add mention to existing mentions", async () => {
      const commentWithExistingMentions = Comment.create({
        ...mockComment.props,
        mentions: ["user-abc"],
      });

      mockRepository.findById.mockResolvedValue(commentWithExistingMentions);
      mockRepository.update.mockResolvedValue(commentWithExistingMentions);

      const result = await useCase.execute(validInput);

      expect(result.mentions).toEqual(["user-abc", "user-789"]);
    });

    it("should be idempotent - adding same mention twice", async () => {
      const commentWithMention = Comment.create({
        ...mockComment.props,
        mentions: ["user-789"],
      });

      mockRepository.findById.mockResolvedValue(commentWithMention);
      mockRepository.update.mockResolvedValue(commentWithMention);

      const result = await useCase.execute(validInput);

      // Should still only have one mention
      expect(result.mentions).toEqual(["user-789"]);
      expect(result.mentionCount).toBe(1);
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

    it("should throw error if userIdToMention is missing", async () => {
      const invalidInput = { ...validInput, userIdToMention: "" };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "User ID to mention is required",
      );
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    it("should throw error if userIdToMention is only whitespace", async () => {
      const invalidInput = { ...validInput, userIdToMention: "   " };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "User ID to mention is required",
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
      const updatedComment = Comment.create({
        ...mockComment.props,
        mentions: ["user-789"],
      });

      mockRepository.findById.mockResolvedValue(mockComment);
      mockRepository.update.mockResolvedValue(updatedComment);

      const result = await useCase.execute(validInput);

      expect(result).toBeInstanceOf(Comment);
      expect(result.hasMention("user-789")).toBe(true);
    });

    it("should update timestamp when adding mention", async () => {
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
