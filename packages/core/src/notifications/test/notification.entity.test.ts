import { Notification, NotificationType, ResourceType } from "../model/notification.entity";
import { NOTIFICATION_LIMITS } from "../../shared/constants/limits.constants";

describe("Notification Entity", () => {
  const validProps: Omit<
    Notification["props"],
    "id" | "isRead" | "readAt" | "createdAt" | "updatedAt"
  > = {
    userId: "user-123",
    type: NotificationType.TASK_ASSIGNED,
    title: "New task assigned",
    message: "You have been assigned to a new task",
  };

  describe("Constructor", () => {
    it("should create a notification with valid properties", () => {
      const notification = new Notification(validProps);

      expect(notification).toBeInstanceOf(Notification);
      expect(notification.id).toBeDefined();
      expect(notification.userId).toBe(validProps.userId);
      expect(notification.type).toBe(validProps.type);
      expect(notification.title).toBe(validProps.title);
      expect(notification.message).toBe(validProps.message);
      expect(notification.isRead).toBe(false);
      expect(notification.createdAt).toBeInstanceOf(Date);
      expect(notification.updatedAt).toBeInstanceOf(Date);
    });

    it("should create a notification with provided id", () => {
      const propsWithId = { ...validProps, id: "notif-123" };
      const notification = new Notification(propsWithId);

      expect(notification.id).toBe("notif-123");
    });

    it("should create a notification with provided timestamps", () => {
      const now = new Date();
      const propsWithTimestamps = {
        ...validProps,
        createdAt: now,
        updatedAt: now,
      };
      const notification = new Notification(propsWithTimestamps);

      expect(notification.createdAt).toBe(now);
      expect(notification.updatedAt).toBe(now);
    });

    it("should create a notification with message", () => {
      const propsWithMessage = {
        ...validProps,
        message: "This is a test notification message",
      };
      const notification = new Notification(propsWithMessage);

      expect(notification.message).toBe("This is a test notification message");
    });

    it("should create a notification with resourceId and resourceType", () => {
      const propsWithResource = {
        ...validProps,
        resourceId: "task-456",
        resourceType: ResourceType.TASK,
      };
      const notification = new Notification(propsWithResource);

      expect(notification.resourceId).toBe("task-456");
      expect(notification.resourceType).toBe(ResourceType.TASK);
    });

    it("should create a notification with metadata", () => {
      const metadata = { workspaceId: "ws-789", projectId: "proj-123" };
      const propsWithMetadata = { ...validProps, metadata };
      const notification = new Notification(propsWithMetadata);

      expect(notification.metadata).toEqual(metadata);
    });

    it("should default isRead to false", () => {
      const notification = new Notification(validProps);

      expect(notification.isRead).toBe(false);
    });

    it("should create a draft notification that skips validation", () => {
      const draftNotification = new Notification(
        { ...validProps, title: "" },
        "draft",
      );

      expect(draftNotification.isDraft()).toBe(true);
      expect(draftNotification.title).toBe("");
    });

    it("should create a valid notification that validates", () => {
      const validNotification = new Notification(validProps, "valid");

      expect(validNotification.isValid()).toBe(true);
      expect(validNotification.title).toBe(validProps.title);
    });
  });

  describe("Static create() factory method", () => {
    it("should create a notification with defaults", () => {
      const notification = Notification.create(validProps);

      expect(notification.id).toBeDefined();
      expect(notification.userId).toBe(validProps.userId);
      expect(notification.type).toBe(validProps.type);
      expect(notification.title).toBe(validProps.title);
      expect(notification.isRead).toBe(false);
      expect(notification.createdAt).toBeInstanceOf(Date);
      expect(notification.updatedAt).toBeInstanceOf(Date);
    });

    it("should create a notification with message", () => {
      const notification = Notification.create({
        ...validProps,
        message: "Test message",
      });

      expect(notification.message).toBe("Test message");
    });

    it("should create a notification with resourceId", () => {
      const notification = Notification.create({
        ...validProps,
        resourceId: "task-456",
        resourceType: ResourceType.TASK,
      });

      expect(notification.resourceId).toBe("task-456");
      expect(notification.resourceType).toBe(ResourceType.TASK);
    });

    it("should create a notification with metadata", () => {
      const metadata = { workspaceId: "ws-789" };
      const notification = Notification.create({
        ...validProps,
        metadata,
      });

      expect(notification.metadata).toEqual(metadata);
    });
  });

  describe("Validation", () => {
    it("should throw error if userId is missing", () => {
      expect(() => {
        new Notification({ ...validProps, userId: "" });
      }).toThrow("User ID is required");
    });

    it("should throw error if userId is only whitespace", () => {
      expect(() => {
        new Notification({ ...validProps, userId: "   " });
      }).toThrow("User ID is required");
    });

    it("should throw error if type is missing", () => {
      expect(() => {
        new Notification({
          ...validProps,
          type: undefined as unknown as NotificationType,
        });
      }).toThrow("Notification type is required");
    });

    it("should throw error if type is invalid", () => {
      expect(() => {
        new Notification({
          ...validProps,
          type: "INVALID_TYPE" as NotificationType,
        });
      }).toThrow("Invalid notification type");
    });

    it("should throw error if title is missing", () => {
      expect(() => {
        new Notification({ ...validProps, title: "" });
      }).toThrow("Notification title is required");
    });

    it("should throw error if title is only whitespace", () => {
      expect(() => {
        new Notification({ ...validProps, title: "   " });
      }).toThrow("Notification title cannot be empty");
    });

    it("should throw error if title is too short", () => {
      expect(() => {
        new Notification({ ...validProps, title: "" });
      }).toThrow("Notification title is required");
    });

    it("should throw error if title exceeds max length", () => {
      const longTitle = "a".repeat(NOTIFICATION_LIMITS.TITLE_MAX_LENGTH + 1);
      expect(() => {
        new Notification({ ...validProps, title: longTitle });
      }).toThrow("Notification title cannot exceed");
    });

    it("should accept title at max length", () => {
      const maxTitle = "a".repeat(NOTIFICATION_LIMITS.TITLE_MAX_LENGTH);
      expect(() => {
        new Notification({ ...validProps, title: maxTitle });
      }).not.toThrow();
    });

    it("should throw error if message exceeds max length", () => {
      const longMessage = "a".repeat(NOTIFICATION_LIMITS.MESSAGE_MAX_LENGTH + 1);
      expect(() => {
        new Notification({ ...validProps, message: longMessage });
      }).toThrow("Notification message cannot exceed");
    });

    it("should accept message at max length", () => {
      const maxMessage = "a".repeat(NOTIFICATION_LIMITS.MESSAGE_MAX_LENGTH);
      expect(() => {
        new Notification({ ...validProps, message: maxMessage });
      }).not.toThrow();
    });

    it("should accept empty message", () => {
      expect(() => {
        new Notification({ ...validProps, message: "" });
      }).not.toThrow();
    });

    it("should accept undefined message", () => {
      expect(() => {
        new Notification({ ...validProps, message: undefined });
      }).not.toThrow();
    });

    it("should accept null message", () => {
      expect(() => {
        new Notification({ ...validProps, message: null });
      }).not.toThrow();
    });

    it("should throw error if resourceType is invalid", () => {
      expect(() => {
        new Notification({
          ...validProps,
          resourceType: "INVALID" as ResourceType,
        });
      }).toThrow("Invalid resource type");
    });

    it("should throw error if metadata is not an object", () => {
      expect(() => {
        new Notification({
          ...validProps,
          metadata: "not-an-object" as unknown as Record<string, unknown>,
        });
      }).toThrow("Notification metadata must be an object");
    });

    it("should throw error if metadata is an array", () => {
      expect(() => {
        new Notification({
          ...validProps,
          metadata: [] as unknown as Record<string, unknown>,
        });
      }).toThrow("Notification metadata must be an object");
    });

    it("should accept valid metadata object", () => {
      expect(() => {
        new Notification({
          ...validProps,
          metadata: { key: "value" },
        });
      }).not.toThrow();
    });

    it("should accept null metadata", () => {
      expect(() => {
        new Notification({ ...validProps, metadata: null });
      }).not.toThrow();
    });

    it("should accept undefined metadata", () => {
      expect(() => {
        new Notification({ ...validProps, metadata: undefined });
      }).not.toThrow();
    });
  });

  describe("markAsRead() business method", () => {
    let notification: Notification;

    beforeEach(() => {
      notification = Notification.create(validProps);
    });

    it("should mark notification as read", () => {
      const read = notification.markAsRead();

      expect(read.isRead).toBe(true);
      expect(read.readAt).toBeInstanceOf(Date);
    });

    it("should update updatedAt timestamp", () => {
      const originalUpdatedAt = notification.updatedAt;
      const read = notification.markAsRead();

      expect(read.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it("should create a new instance (immutability)", () => {
      const read = notification.markAsRead();

      expect(read).not.toBe(notification);
      expect(notification.isRead).toBe(false);
      // readAt is undefined for new notifications (not yet read)
      expect(notification.readAt).toBeUndefined();
    });

    it("should be idempotent - return same instance if already read", () => {
      const readOnce = notification.markAsRead();
      const readTwice = readOnce.markAsRead();

      expect(readTwice).toBe(readOnce);
    });
  });

  describe("markAsUnread() business method", () => {
    it("should mark notification as unread", () => {
      const notification = Notification.create(validProps).markAsRead();
      const unread = notification.markAsUnread();

      expect(unread.isRead).toBe(false);
      expect(unread.readAt).toBeNull();
    });

    it("should update updatedAt timestamp", () => {
      const notification = Notification.create(validProps).markAsRead();
      const originalUpdatedAt = notification.updatedAt;
      const unread = notification.markAsUnread();

      expect(unread.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it("should create a new instance (immutability)", () => {
      const notification = Notification.create(validProps).markAsRead();
      const unread = notification.markAsUnread();

      expect(unread).not.toBe(notification);
      expect(notification.isRead).toBe(true);
    });

    it("should be idempotent - return same instance if already unread", () => {
      const notification = Notification.create(validProps);
      const unreadOnce = notification.markAsUnread();
      const unreadTwice = unreadOnce.markAsUnread();

      expect(unreadTwice).toBe(unreadOnce);
    });
  });

  describe("isExpired() business method", () => {
    it("should always return false (no expiration)", () => {
      const notification = Notification.create(validProps);

      expect(notification.isExpired()).toBe(false);
    });
  });

  describe("isHighPriority() business method", () => {
    it("should return true for TASK_ASSIGNED", () => {
      const notification = Notification.create({
        ...validProps,
        type: NotificationType.TASK_ASSIGNED,
      });

      expect(notification.isHighPriority()).toBe(true);
    });

    it("should return true for MENTIONED", () => {
      const notification = Notification.create({
        ...validProps,
        type: NotificationType.MENTIONED,
      });

      expect(notification.isHighPriority()).toBe(true);
    });

    it("should return true for DUE_DATE_APPROACHING", () => {
      const notification = Notification.create({
        ...validProps,
        type: NotificationType.DUE_DATE_APPROACHING,
      });

      expect(notification.isHighPriority()).toBe(true);
    });

    it("should return false for other types", () => {
      const notification = Notification.create({
        ...validProps,
        type: NotificationType.COMMENT_ADDED,
      });

      expect(notification.isHighPriority()).toBe(false);
    });

    it("should return false for SYSTEM type", () => {
      const notification = Notification.create({
        ...validProps,
        type: NotificationType.SYSTEM,
      });

      expect(notification.isHighPriority()).toBe(false);
    });
  });

  describe("isActionable() business method", () => {
    it("should return true if notification has resourceId", () => {
      const notification = Notification.create({
        ...validProps,
        resourceId: "task-456",
        resourceType: ResourceType.TASK,
      });

      expect(notification.isActionable()).toBe(true);
    });

    it("should return false if notification has no resourceId", () => {
      const notification = Notification.create(validProps);

      expect(notification.isActionable()).toBe(false);
    });

    it("should return false if resourceId is empty string", () => {
      const notification = new Notification({
        ...validProps,
        resourceId: "",
      });

      expect(notification.isActionable()).toBe(false);
    });
  });

  describe("getAge() business method", () => {
    it("should return the age in milliseconds", () => {
      const before = Date.now();
      const notification = Notification.create(validProps);
      const after = Date.now();

      const age = notification.getAge();

      expect(age).toBeGreaterThanOrEqual(0);
      expect(age).toBeLessThanOrEqual(after - before);
    });

    it("should return positive age for old notification", () => {
      const pastDate = new Date(Date.now() - 1000);
      const notification = new Notification({
        ...validProps,
        createdAt: pastDate,
      });

      expect(notification.getAge()).toBeGreaterThanOrEqual(1000);
    });
  });

  describe("isOlderThan() business method", () => {
    it("should return true if notification is older than threshold", () => {
      const pastDate = new Date(Date.now() - 2000);
      const notification = new Notification({
        ...validProps,
        createdAt: pastDate,
      });

      expect(notification.isOlderThan(1000)).toBe(true);
    });

    it("should return false if notification is newer than threshold", () => {
      const notification = Notification.create(validProps);

      expect(notification.isOlderThan(10000)).toBe(false);
    });

    it("should return false if notification age equals threshold", () => {
      const pastDate = new Date(Date.now() - 1000);
      const notification = new Notification({
        ...validProps,
        createdAt: pastDate,
      });

      expect(notification.isOlderThan(1000)).toBe(false);
    });
  });

  describe("getMetadata() business method", () => {
    it("should return the metadata value for a key", () => {
      const notification = Notification.create({
        ...validProps,
        metadata: { workspaceId: "ws-789", projectId: "proj-123" },
      });

      expect(notification.getMetadata("workspaceId")).toBe("ws-789");
      expect(notification.getMetadata("projectId")).toBe("proj-123");
    });

    it("should return undefined for non-existent key", () => {
      const notification = Notification.create({
        ...validProps,
        metadata: { workspaceId: "ws-789" },
      });

      expect(notification.getMetadata("nonExistent")).toBeUndefined();
    });

    it("should return default value for non-existent key", () => {
      const notification = Notification.create({
        ...validProps,
        metadata: { workspaceId: "ws-789" },
      });

      expect(notification.getMetadata("nonExistent", "default")).toBe("default");
    });

    it("should return undefined if metadata is null", () => {
      const notification = Notification.create({
        ...validProps,
        metadata: null,
      });

      expect(notification.getMetadata("workspaceId")).toBeUndefined();
    });

    it("should return default value if metadata is null", () => {
      const notification = Notification.create({
        ...validProps,
        metadata: null,
      });

      expect(notification.getMetadata("workspaceId", "default")).toBe("default");
    });
  });

  describe("isTaskNotification() business method", () => {
    it("should return true if resourceType is TASK", () => {
      const notification = Notification.create({
        ...validProps,
        resourceType: ResourceType.TASK,
      });

      expect(notification.isTaskNotification()).toBe(true);
    });

    it("should return false if resourceType is not TASK", () => {
      const notification = Notification.create({
        ...validProps,
        resourceType: ResourceType.PROJECT,
      });

      expect(notification.isTaskNotification()).toBe(false);
    });

    it("should return false if resourceType is null", () => {
      const notification = Notification.create({
        ...validProps,
        resourceType: null,
      });

      expect(notification.isTaskNotification()).toBe(false);
    });
  });

  describe("isProjectNotification() business method", () => {
    it("should return true if resourceType is PROJECT", () => {
      const notification = Notification.create({
        ...validProps,
        resourceType: ResourceType.PROJECT,
      });

      expect(notification.isProjectNotification()).toBe(true);
    });

    it("should return false if resourceType is not PROJECT", () => {
      const notification = Notification.create({
        ...validProps,
        resourceType: ResourceType.TASK,
      });

      expect(notification.isProjectNotification()).toBe(false);
    });
  });

  describe("isWorkspaceNotification() business method", () => {
    it("should return true if resourceType is WORKSPACE", () => {
      const notification = Notification.create({
        ...validProps,
        resourceType: ResourceType.WORKSPACE,
      });

      expect(notification.isWorkspaceNotification()).toBe(true);
    });

    it("should return false if resourceType is not WORKSPACE", () => {
      const notification = Notification.create({
        ...validProps,
        resourceType: ResourceType.TASK,
      });

      expect(notification.isWorkspaceNotification()).toBe(false);
    });
  });

  describe("asDraft() method", () => {
    it("should convert notification to draft mode", () => {
      const notification = Notification.create(validProps);
      const draft = notification.asDraft();

      expect(draft.isDraft()).toBe(true);
      expect(draft.isValid()).toBe(false);
    });

    it("should preserve all properties", () => {
      const notification = Notification.create(validProps);
      const draft = notification.asDraft();

      expect(draft.id).toBe(notification.id);
      expect(draft.title).toBe(notification.title);
      expect(draft.userId).toBe(notification.userId);
    });

    it("should create a new instance", () => {
      const notification = Notification.create(validProps);
      const draft = notification.asDraft();

      expect(draft).not.toBe(notification);
    });
  });

  describe("asValid() method", () => {
    it("should convert notification to valid mode", () => {
      const draft = new Notification(validProps, "draft");
      const valid = draft.asValid();

      expect(valid.isValid()).toBe(true);
      expect(valid.isDraft()).toBe(false);
    });

    it("should preserve all properties", () => {
      const notification = Notification.create(validProps);
      const valid = notification.asValid();

      expect(valid.id).toBe(notification.id);
      expect(valid.title).toBe(notification.title);
    });

    it("should create a new instance", () => {
      const notification = Notification.create(validProps);
      const valid = notification.asValid();

      expect(valid).not.toBe(notification);
    });
  });

  describe("clone() method (inherited from Entity)", () => {
    it("should create a copy with updated properties", () => {
      const notification = Notification.create(validProps);
      const cloned = notification.clone({ title: "Updated title" });

      expect(cloned.id).toBe(notification.id);
      expect(cloned.title).toBe("Updated title");
      expect(cloned).not.toBe(notification);
    });

    it("should preserve non-updated properties", () => {
      const notification = Notification.create(validProps);
      const cloned = notification.clone({ title: "New title" });

      expect(cloned.userId).toBe(notification.userId);
      expect(cloned.type).toBe(notification.type);
    });
  });

  describe("equals() method (inherited from Entity)", () => {
    it("should return true for same entity", () => {
      const notification = Notification.create(validProps);

      expect(notification.equals(notification)).toBe(true);
    });

    it("should return true for entities with same id", () => {
      const notification1 = Notification.create({
        ...validProps,
        id: "notif-123",
      });
      const notification2 = Notification.create({
        ...validProps,
        id: "notif-123",
      });

      expect(notification1.equals(notification2)).toBe(true);
    });

    it("should return false for entities with different ids", () => {
      const notification1 = Notification.create(validProps);
      const notification2 = Notification.create(validProps);

      expect(notification1.equals(notification2)).toBe(false);
    });

    it("should return false for non-entities", () => {
      const notification = Notification.create(validProps);

      expect(notification.equals(null)).toBe(false);
      expect(notification.equals(undefined)).toBe(false);
      expect(notification.equals({})).toBe(false);
    });
  });

  describe("Getters", () => {
    let notification: Notification;

    beforeEach(() => {
      notification = Notification.create({
        ...validProps,
        message: "Test message",
        resourceId: "task-456",
        resourceType: ResourceType.TASK,
        metadata: { workspaceId: "ws-789" },
      });
    });

    it("should return userId", () => {
      expect(notification.userId).toBe("user-123");
    });

    it("should return type", () => {
      expect(notification.type).toBe(NotificationType.TASK_ASSIGNED);
    });

    it("should return title", () => {
      expect(notification.title).toBe("New task assigned");
    });

    it("should return message", () => {
      expect(notification.message).toBe("Test message");
    });

    it("should return resourceId", () => {
      expect(notification.resourceId).toBe("task-456");
    });

    it("should return resourceType", () => {
      expect(notification.resourceType).toBe(ResourceType.TASK);
    });

    it("should return metadata", () => {
      expect(notification.metadata).toEqual({ workspaceId: "ws-789" });
    });

    it("should return isRead", () => {
      expect(notification.isRead).toBe(false);
    });

    it("should return readAt", () => {
      expect(notification.readAt).toBeUndefined();
    });

    it("should return createdAt", () => {
      expect(notification.createdAt).toBeInstanceOf(Date);
    });

    it("should return updatedAt", () => {
      expect(notification.updatedAt).toBeInstanceOf(Date);
    });
  });
});
