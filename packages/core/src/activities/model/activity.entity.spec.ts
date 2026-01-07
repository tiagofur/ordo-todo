import { Activity } from './activity.entity';
import { ActivityType } from '@prisma/client';

describe('Activity Entity', () => {
  const validProps = {
    id: 'act-123',
    taskId: 'task-456',
    userId: 'user-789',
    type: ActivityType.TASK_CREATED,
    createdAt: new Date(),
  };

  describe('Constructor', () => {
    it('should create a valid activity', () => {
      const activity = new Activity(validProps);
      expect(activity.id).toBe('act-123');
      expect(activity.taskId).toBe('task-456');
      expect(activity.userId).toBe('user-789');
      expect(activity.type).toBe(ActivityType.TASK_CREATED);
    });

    it('should create activity with metadata', () => {
      const props = {
        ...validProps,
        metadata: {
          oldValue: 'TODO',
          newValue: 'IN_PROGRESS',
          fieldName: 'status',
        },
      };
      const activity = new Activity(props);
      expect(activity.metadata).toEqual(props.metadata);
    });

    it('should create activity in draft mode without validation', () => {
      const activity = new Activity(
        {
          id: '',
          taskId: '',
          userId: '',
          type: ActivityType.TASK_CREATED,
          createdAt: new Date(),
        },
        'draft',
      );
      expect(activity).toBeDefined();
    });

    it('should throw error if taskId is empty', () => {
      expect(() => {
        new Activity({
          ...validProps,
          taskId: '',
        });
      }).toThrow('Activity must have a valid taskId');
    });

    it('should throw error if userId is empty', () => {
      expect(() => {
        new Activity({
          ...validProps,
          userId: '',
        });
      }).toThrow('Activity must have a valid userId');
    });

    it('should throw error if type is missing', () => {
      expect(() => {
        new Activity({
          ...validProps,
          type: undefined as any,
        });
      }).toThrow('Activity must have a type');
    });

    it('should throw error if createdAt is missing', () => {
      expect(() => {
        new Activity({
          ...validProps,
          createdAt: undefined as any,
        });
      }).toThrow('Activity must have a createdAt timestamp');
    });
  });

  describe('Business Methods', () => {
    it('should identify task activities correctly', () => {
      const taskCreated = new Activity({
        ...validProps,
        type: ActivityType.TASK_CREATED,
      });
      expect(taskCreated.isTaskActivity()).toBe(true);
      expect(taskCreated.isCommentActivity()).toBe(false);
    });

    it('should identify comment activities correctly', () => {
      const commentAdded = new Activity({
        ...validProps,
        type: ActivityType.COMMENT_ADDED,
      });
      expect(commentAdded.isCommentActivity()).toBe(true);
      expect(commentAdded.isTaskActivity()).toBe(false);
    });

    it('should identify attachment activities correctly', () => {
      const attachmentAdded = new Activity({
        ...validProps,
        type: ActivityType.ATTACHMENT_ADDED,
      });
      expect(attachmentAdded.isAttachmentActivity()).toBe(true);
    });

    it('should identify subtask activities correctly', () => {
      const subtaskAdded = new Activity({
        ...validProps,
        type: ActivityType.SUBTASK_ADDED,
      });
      expect(subtaskAdded.isSubtaskActivity()).toBe(true);
    });

    it('should identify field change activities correctly', () => {
      const statusChanged = new Activity({
        ...validProps,
        type: ActivityType.STATUS_CHANGED,
        metadata: { oldValue: 'TODO', newValue: 'DONE', fieldName: 'status' },
      });
      expect(statusChanged.isFieldChangeActivity()).toBe(true);
      expect(statusChanged.getChangedFieldName()).toBe('status');
    });

    it('should return null for changed field name when not a field change', () => {
      const taskCreated = new Activity({
        ...validProps,
        type: ActivityType.TASK_CREATED,
      });
      expect(taskCreated.getChangedFieldName()).toBeNull();
    });

    it('should generate human-readable descriptions', () => {
      const cases = [
        {
          type: ActivityType.TASK_CREATED,
          expected: 'Task created',
        },
        {
          type: ActivityType.COMMENT_ADDED,
          expected: 'Comment added',
        },
        {
          type: ActivityType.ATTACHMENT_ADDED,
          metadata: { itemName: 'file.pdf' },
          expected: 'Attachment added: file.pdf',
        },
        {
          type: ActivityType.STATUS_CHANGED,
          metadata: { oldValue: 'TODO', newValue: 'DONE' },
          expected: 'Status changed from TODO to DONE',
        },
      ];

      cases.forEach(({ type, expected, metadata }) => {
        const activity = new Activity({
          ...validProps,
          type,
          metadata,
        });
        expect(activity.getDescription()).toBe(expected);
      });
    });
  });
});
