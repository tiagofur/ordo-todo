import { Comment, CommentProps } from "../model/comment.entity";
import { COMMENT_LIMITS } from "../../shared/constants/limits.constants";

describe("Comment Entity", () => {
  const validProps: Omit<CommentProps, "id" | "mentions" | "isEdited" | "editedAt" | "createdAt" | "updatedAt"> = {
    taskId: "task-123",
    userId: "user-456",
    content: "This is a valid comment",
  };

  describe("Constructor", () => {
    it("should create a comment with valid properties", () => {
      const comment = new Comment(validProps);

      expect(comment).toBeInstanceOf(Comment);
      expect(comment.id).toBeDefined();
      expect(comment.taskId).toBe(validProps.taskId);
      expect(comment.userId).toBe(validProps.userId);
      expect(comment.content).toBe(validProps.content);
      expect(comment.mentions).toEqual([]);
      expect(comment.isEdited).toBe(false);
      expect(comment.createdAt).toBeInstanceOf(Date);
      expect(comment.updatedAt).toBeInstanceOf(Date);
    });

    it("should create a comment with provided id", () => {
      const propsWithId = { ...validProps, id: "comment-123" };
      const comment = new Comment(propsWithId);

      expect(comment.id).toBe("comment-123");
    });

    it("should create a comment with provided timestamps", () => {
      const now = new Date();
      const propsWithTimestamps = {
        ...validProps,
        createdAt: now,
        updatedAt: now,
      };
      const comment = new Comment(propsWithTimestamps);

      expect(comment.createdAt).toBe(now);
      expect(comment.updatedAt).toBe(now);
    });

    it("should create a comment with mentions", () => {
      const propsWithMentions = {
        ...validProps,
        mentions: ["user-789", "user-abc"],
      };
      const comment = new Comment(propsWithMentions);

      expect(comment.mentions).toEqual(["user-789", "user-abc"]);
    });

    it("should create a comment with parentCommentId", () => {
      const propsWithParent = {
        ...validProps,
        parentCommentId: "comment-123",
      };
      const comment = new Comment(propsWithParent);

      expect(comment.parentCommentId).toBe("comment-123");
      expect(comment.isReply()).toBe(true);
    });

    it("should default mentions to empty array", () => {
      const comment = new Comment(validProps);

      expect(comment.mentions).toEqual([]);
    });

    it("should default isEdited to false", () => {
      const comment = new Comment(validProps);

      expect(comment.isEdited).toBe(false);
    });

    it("should create a draft comment that skips validation", () => {
      const draftComment = new Comment(
        { ...validProps, content: "" },
        "draft",
      );

      expect(draftComment.isDraft()).toBe(true);
      expect(draftComment.content).toBe("");
    });

    it("should create a valid comment that validates", () => {
      const validComment = new Comment(validProps, "valid");

      expect(validComment.isValid()).toBe(true);
      expect(validComment.content).toBe(validProps.content);
    });
  });

  describe("Static create() factory method", () => {
    it("should create a comment with defaults", () => {
      const comment = Comment.create(validProps);

      expect(comment.id).toBeDefined();
      expect(comment.taskId).toBe(validProps.taskId);
      expect(comment.userId).toBe(validProps.userId);
      expect(comment.content).toBe(validProps.content);
      expect(comment.mentions).toEqual([]);
      expect(comment.isEdited).toBe(false);
      expect(comment.createdAt).toBeInstanceOf(Date);
      expect(comment.updatedAt).toBeInstanceOf(Date);
    });

    it("should create a comment with mentions", () => {
      const comment = Comment.create({
        ...validProps,
        mentions: ["user-789"],
      });

      expect(comment.mentions).toEqual(["user-789"]);
    });

    it("should create a comment with parentCommentId", () => {
      const comment = Comment.create({
        ...validProps,
        parentCommentId: "comment-123",
      });

      expect(comment.parentCommentId).toBe("comment-123");
    });
  });

  describe("Validation", () => {
    it("should throw error if content is missing", () => {
      expect(() => {
        new Comment({ ...validProps, content: "" as unknown as string });
      }).toThrow("Comment content is required");
    });

    it("should throw error if content is only whitespace", () => {
      expect(() => {
        new Comment({ ...validProps, content: "   " });
      }).toThrow("Comment content cannot be empty");
    });

    it("should throw error if content is too short", () => {
      expect(() => {
        new Comment({ ...validProps, content: "" });
      }).toThrow("Comment content is required");
    });

    it("should throw error if content exceeds max length", () => {
      const longContent = "a".repeat(COMMENT_LIMITS.CONTENT_MAX_LENGTH + 1);
      expect(() => {
        new Comment({ ...validProps, content: longContent });
      }).toThrow("Comment content cannot exceed");
    });

    it("should accept content at max length", () => {
      const maxContent = "a".repeat(COMMENT_LIMITS.CONTENT_MAX_LENGTH);
      expect(() => {
        new Comment({ ...validProps, content: maxContent });
      }).not.toThrow();
    });

    it("should throw error if taskId is missing", () => {
      expect(() => {
        new Comment({ ...validProps, taskId: "" });
      }).toThrow("Task ID is required");
    });

    it("should throw error if taskId is only whitespace", () => {
      expect(() => {
        new Comment({ ...validProps, taskId: "   " });
      }).toThrow("Task ID is required");
    });

    it("should throw error if userId is missing", () => {
      expect(() => {
        new Comment({ ...validProps, userId: "" });
      }).toThrow("User ID is required");
    });

    it("should throw error if userId is only whitespace", () => {
      expect(() => {
        new Comment({ ...validProps, userId: "   " });
      }).toThrow("User ID is required");
    });

    it("should throw error if mentions is not an array", () => {
      expect(() => {
        new Comment({ ...validProps, mentions: "not-an-array" as unknown as string[] });
      }).toThrow("Mentions must be an array");
    });

    it("should throw error if mentions contain empty string", () => {
      expect(() => {
        new Comment({ ...validProps, mentions: ["user-123", ""] });
      }).toThrow("Each mention must be a non-empty string");
    });

    it("should throw error if mentions contain whitespace only", () => {
      expect(() => {
        new Comment({ ...validProps, mentions: ["user-123", "   "] });
      }).toThrow("Each mention must be a non-empty string");
    });

    it("should accept valid mentions array", () => {
      expect(() => {
        new Comment({ ...validProps, mentions: ["user-123", "user-456"] });
      }).not.toThrow();
    });

    it("should accept undefined mentions", () => {
      expect(() => {
        new Comment({ ...validProps, mentions: undefined });
      }).not.toThrow();
    });

    it("should accept null mentions", () => {
      expect(() => {
        new Comment({ ...validProps, mentions: null });
      }).not.toThrow();
    });
  });

  describe("edit() business method", () => {
    let comment: Comment;

    beforeEach(() => {
      comment = Comment.create(validProps);
    });

    it("should update content", () => {
      const edited = comment.edit("Updated content");

      expect(edited.content).toBe("Updated content");
    });

    it("should mark comment as edited", () => {
      const edited = comment.edit("Updated content");

      expect(edited.isEdited).toBe(true);
    });

    it("should set editedAt timestamp", () => {
      const before = new Date();
      const edited = comment.edit("Updated content");
      const after = new Date();

      expect(edited.editedAt).toBeInstanceOf(Date);
      expect(edited.editedAt!.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
      expect(edited.editedAt!.getTime()).toBeLessThanOrEqual(
        after.getTime(),
      );
    });

    it("should update updatedAt timestamp", () => {
      const originalUpdatedAt = comment.updatedAt;
      // Wait a bit to ensure timestamp difference
      const edited = comment.edit("Updated content");

      expect(edited.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it("should create a new instance (immutability)", () => {
      const edited = comment.edit("Updated content");

      expect(edited).not.toBe(comment);
      expect(comment.content).toBe(validProps.content);
      expect(comment.isEdited).toBe(false);
    });

    it("should throw error if new content is empty", () => {
      expect(() => {
        comment.edit("");
      }).toThrow("Comment content is required");
    });

    it("should throw error if new content is too long", () => {
      const longContent = "a".repeat(COMMENT_LIMITS.CONTENT_MAX_LENGTH + 1);
      expect(() => {
        comment.edit(longContent);
      }).toThrow("Comment content cannot exceed");
    });

    it("should trim whitespace from content", () => {
      const edited = comment.edit("  Updated content  ");

      expect(edited.content).toBe("Updated content");
    });
  });

  describe("addMention() business method", () => {
    let comment: Comment;

    beforeEach(() => {
      comment = Comment.create(validProps);
    });

    it("should add a mention to the comment", () => {
      const withMention = comment.addMention("user-789");

      expect(withMention.mentions).toContain("user-789");
      expect(withMention.mentions.length).toBe(1);
    });

    it("should create a new instance (immutability)", () => {
      const withMention = comment.addMention("user-789");

      expect(withMention).not.toBe(comment);
      expect(comment.mentions).toEqual([]);
    });

    it("should update updatedAt timestamp", () => {
      const originalUpdatedAt = comment.updatedAt;
      const withMention = comment.addMention("user-789");

      expect(withMention.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it("should not add duplicate mentions (idempotent)", () => {
      const withMention1 = comment.addMention("user-789");
      const withMention2 = withMention1.addMention("user-789");

      expect(withMention2.mentions).toEqual(["user-789"]);
      expect(withMention2.mentions.length).toBe(1);
    });

    it("should add multiple different mentions", () => {
      const withMention1 = comment.addMention("user-789");
      const withMention2 = withMention1.addMention("user-abc");

      expect(withMention2.mentions).toEqual(["user-789", "user-abc"]);
    });

    it("should return same instance if already mentioned (idempotent)", () => {
      const withMention1 = comment.addMention("user-789");
      const withMention2 = withMention1.addMention("user-789");

      expect(withMention2).toBe(withMention1);
    });

    it("should throw error if userId is empty", () => {
      expect(() => {
        comment.addMention("");
      }).toThrow("User ID for mention cannot be empty");
    });

    it("should throw error if userId is only whitespace", () => {
      expect(() => {
        comment.addMention("   ");
      }).toThrow("User ID for mention cannot be empty");
    });
  });

  describe("removeMention() business method", () => {
    let comment: Comment;

    beforeEach(() => {
      comment = Comment.create({
        ...validProps,
        mentions: ["user-789", "user-abc", "user-def"],
      });
    });

    it("should remove a mention from the comment", () => {
      const withoutMention = comment.removeMention("user-789");

      expect(withoutMention.mentions).not.toContain("user-789");
      expect(withoutMention.mentions).toEqual(["user-abc", "user-def"]);
    });

    it("should create a new instance (immutability)", () => {
      const withoutMention = comment.removeMention("user-789");

      expect(withoutMention).not.toBe(comment);
      expect(comment.mentions).toEqual(["user-789", "user-abc", "user-def"]);
    });

    it("should update updatedAt timestamp", () => {
      const originalUpdatedAt = comment.updatedAt;
      const withoutMention = comment.removeMention("user-789");

      expect(withoutMention.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it("should return same instance if mention not found (idempotent)", () => {
      const withoutMention = comment.removeMention("user-not-in-list");

      expect(withoutMention).toBe(comment);
    });

    it("should handle removing from single mention", () => {
      const singleMention = Comment.create({
        ...validProps,
        mentions: ["user-789"],
      });
      const withoutMention = singleMention.removeMention("user-789");

      expect(withoutMention.mentions).toEqual([]);
    });

    it("should handle removing from empty mentions", () => {
      const emptyComment = Comment.create(validProps);
      const withoutMention = emptyComment.removeMention("user-789");

      expect(withoutMention).toBe(emptyComment);
      expect(withoutMention.mentions).toEqual([]);
    });
  });

  describe("hasMention() business method", () => {
    it("should return true if user is mentioned", () => {
      const comment = Comment.create({
        ...validProps,
        mentions: ["user-789", "user-abc"],
      });

      expect(comment.hasMention("user-789")).toBe(true);
    });

    it("should return false if user is not mentioned", () => {
      const comment = Comment.create({
        ...validProps,
        mentions: ["user-789"],
      });

      expect(comment.hasMention("user-abc")).toBe(false);
    });

    it("should return false for comment with no mentions", () => {
      const comment = Comment.create(validProps);

      expect(comment.hasMention("user-789")).toBe(false);
    });

    it("should be case sensitive", () => {
      const comment = Comment.create({
        ...validProps,
        mentions: ["user-789"],
      });

      expect(comment.hasMention("USER-789")).toBe(false);
      expect(comment.hasMention("user-789")).toBe(true);
    });
  });

  describe("isReply() business method", () => {
    it("should return true if comment has parentCommentId", () => {
      const comment = Comment.create({
        ...validProps,
        parentCommentId: "comment-123",
      });

      expect(comment.isReply()).toBe(true);
    });

    it("should return false if comment has no parent", () => {
      const comment = Comment.create(validProps);

      expect(comment.isReply()).toBe(false);
    });

    it("should return false if parentCommentId is null", () => {
      const comment = Comment.create({
        ...validProps,
        parentCommentId: null,
      });

      expect(comment.isReply()).toBe(false);
    });

    it("should return false if parentCommentId is empty string", () => {
      const comment = new Comment({
        ...validProps,
        parentCommentId: "",
      });

      expect(comment.isReply()).toBe(false);
    });
  });

  describe("mentionCount getter", () => {
    it("should return 0 for comment with no mentions", () => {
      const comment = Comment.create(validProps);

      expect(comment.mentionCount).toBe(0);
    });

    it("should return correct count for mentions", () => {
      const comment = Comment.create({
        ...validProps,
        mentions: ["user-1", "user-2", "user-3"],
      });

      expect(comment.mentionCount).toBe(3);
    });

    it("should return correct count after adding mentions", () => {
      const comment = Comment.create(validProps);
      const withMention = comment.addMention("user-1");

      expect(withMention.mentionCount).toBe(1);
    });

    it("should return correct count after removing mentions", () => {
      const comment = Comment.create({
        ...validProps,
        mentions: ["user-1", "user-2"],
      });
      const withoutMention = comment.removeMention("user-1");

      expect(withoutMention.mentionCount).toBe(1);
    });
  });

  describe("asDraft() method", () => {
    it("should convert comment to draft mode", () => {
      const comment = Comment.create(validProps);
      const draft = comment.asDraft();

      expect(draft.isDraft()).toBe(true);
      expect(draft.isValid()).toBe(false);
    });

    it("should preserve all properties", () => {
      const comment = Comment.create(validProps);
      const draft = comment.asDraft();

      expect(draft.id).toBe(comment.id);
      expect(draft.content).toBe(comment.content);
      expect(draft.taskId).toBe(comment.taskId);
      expect(draft.userId).toBe(comment.userId);
    });

    it("should create a new instance", () => {
      const comment = Comment.create(validProps);
      const draft = comment.asDraft();

      expect(draft).not.toBe(comment);
    });
  });

  describe("asValid() method", () => {
    it("should convert comment to valid mode", () => {
      const draft = new Comment(validProps, "draft");
      const valid = draft.asValid();

      expect(valid.isValid()).toBe(true);
      expect(valid.isDraft()).toBe(false);
    });

    it("should preserve all properties", () => {
      const comment = Comment.create(validProps);
      const valid = comment.asValid();

      expect(valid.id).toBe(comment.id);
      expect(valid.content).toBe(comment.content);
    });

    it("should create a new instance", () => {
      const comment = Comment.create(validProps);
      const valid = comment.asValid();

      expect(valid).not.toBe(comment);
    });
  });

  describe("clone() method (inherited from Entity)", () => {
    it("should create a copy with updated properties", () => {
      const comment = Comment.create(validProps);
      const cloned = comment.clone({ content: "Cloned content" });

      expect(cloned.id).toBe(comment.id);
      expect(cloned.content).toBe("Cloned content");
      expect(cloned).not.toBe(comment);
    });

    it("should preserve non-updated properties", () => {
      const comment = Comment.create(validProps);
      const cloned = comment.clone({ content: "New content" });

      expect(cloned.taskId).toBe(comment.taskId);
      expect(cloned.userId).toBe(comment.userId);
    });
  });

  describe("equals() method (inherited from Entity)", () => {
    it("should return true for same entity", () => {
      const comment = Comment.create(validProps);

      expect(comment.equals(comment)).toBe(true);
    });

    it("should return true for entities with same id", () => {
      const comment1 = Comment.create({ ...validProps, id: "comment-123" });
      const comment2 = Comment.create({ ...validProps, id: "comment-123" });

      expect(comment1.equals(comment2)).toBe(true);
    });

    it("should return false for entities with different ids", () => {
      const comment1 = Comment.create(validProps);
      const comment2 = Comment.create(validProps);

      expect(comment1.equals(comment2)).toBe(false);
    });

    it("should return false for non-entities", () => {
      const comment = Comment.create(validProps);

      expect(comment.equals(null)).toBe(false);
      expect(comment.equals(undefined)).toBe(false);
      expect(comment.equals({})).toBe(false);
    });
  });
});
