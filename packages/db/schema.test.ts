/**
 * Schema Validation Tests
 *
 * These tests validate the Prisma schema structure without requiring a database connection.
 * Tests include:
 * - Model existence and required fields
 * - Relationship definitions
 * - Index coverage
 * - Enum definitions
 * - Field constraints
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

const schemaPath = join(__dirname, 'prisma/schema.prisma');
const schemaContent = readFileSync(schemaPath, 'utf-8');

describe('Schema Structure', () => {
  describe('Required Models', () => {
    it('should have User model with required fields', () => {
      expect(schemaContent).toMatch(/model User\s*\{/);
      expect(schemaContent).toMatch(/id\s+String\s+@id/);
      expect(schemaContent).toMatch(/email\s+String\s+@unique/);
      expect(schemaContent).toMatch(/username\s+String\s+@unique/);
      expect(schemaContent).toMatch(/name\s+String/);
      expect(schemaContent).toMatch(/hashedPassword\s+String\?/);
    });

    it('should have Task model with required fields', () => {
      expect(schemaContent).toMatch(/model Task\s*\{/);
      expect(schemaContent).toMatch(/id\s+String\s+@id/);
      expect(schemaContent).toMatch(/title\s+String/);
      expect(schemaContent).toMatch(/status\s+TaskStatus/);
      expect(schemaContent).toMatch(/priority\s+Priority/);
      expect(schemaContent).toMatch(/projectId\s+String/);
      expect(schemaContent).toMatch(/ownerId\s+String/);
    });

    it('should have Project model with required fields', () => {
      expect(schemaContent).toMatch(/model Project\s*\{/);
      expect(schemaContent).toMatch(/id\s+String\s+@id/);
      expect(schemaContent).toMatch(/name\s+String/);
      expect(schemaContent).toMatch(/slug\s+String/);
      expect(schemaContent).toMatch(/workspaceId\s+String/);
      expect(schemaContent).toMatch(/workflowId\s+String/);
    });

    it('should have Workspace model with required fields', () => {
      expect(schemaContent).toMatch(/model Workspace\s*\{/);
      expect(schemaContent).toMatch(/id\s+String\s+@id/);
      expect(schemaContent).toMatch(/name\s+String/);
      expect(schemaContent).toMatch(/slug\s+String/);
      expect(schemaContent).toMatch(/type\s+WorkspaceType/);
    });

    it('should have TimeSession model with required fields', () => {
      expect(schemaContent).toMatch(/model TimeSession\s*\{/);
      expect(schemaContent).toMatch(/id\s+String\s+@id/);
      expect(schemaContent).toMatch(/userId\s+String/);
      expect(schemaContent).toMatch(/startedAt\s+DateTime/);
      expect(schemaContent).toMatch(/type\s+SessionType/);
    });

    it('should have Workflow model', () => {
      expect(schemaContent).toMatch(/model Workflow\s*\{/);
      expect(schemaContent).toMatch(/workspaceId\s+String/);
    });

    it('should have Tag model', () => {
      expect(schemaContent).toMatch(/model Tag\s*\{/);
      expect(schemaContent).toMatch(/name\s+String/);
      expect(schemaContent).toMatch(/color\s+String/);
    });

    it('should have Comment model', () => {
      expect(schemaContent).toMatch(/model Comment\s*\{/);
      expect(schemaContent).toMatch(/taskId\s+String/);
      expect(schemaContent).toMatch(/authorId\s+String/);
      expect(schemaContent).toMatch(/content\s+String/);
    });

    it('should have Attachment model', () => {
      expect(schemaContent).toMatch(/model Attachment\s*\{/);
      expect(schemaContent).toMatch(/taskId\s+String/);
      expect(schemaContent).toMatch(/filename\s+String/);
      expect(schemaContent).toMatch(/filesize\s+Int/);
    });
  });

  describe('Relationships', () => {
    it('should define Task-Project relationship', () => {
      expect(schemaContent).toMatch(/project\s+Project\s+@relation\(fields:\s*\[projectId\]/);
    });

    it('should define Task-User owner relationship', () => {
      expect(schemaContent).toMatch(/owner\s+User\s+@relation\("CreatedTasks"/);
    });

    it('should define Task-User assignee relationship', () => {
      expect(schemaContent).toMatch(/assignee\s+User\?\s+@relation\("AssignedTasks"/);
    });

    it('should define Task-Project parent relationship', () => {
      expect(schemaContent).toMatch(/project\s+Project\s+@relation/);
    });

    it('should define Workspace-Workflow relationship', () => {
      expect(schemaContent).toMatch(/workflows\s+Workflow\[\]/);
    });

    it('should define Workspace-Project relationship', () => {
      expect(schemaContent).toMatch(/projects\s+Project\[\]/);
    });

    it('should define Workspace-Tag relationship', () => {
      expect(schemaContent).toMatch(/tags\s+Tag\[\]/);
    });

    it('should define Task-TimeSession relationship', () => {
      expect(schemaContent).toMatch(/timeSessions\s+TimeSession\[\]/);
    });

    it('should define Task-Tag many-to-many relationship', () => {
      expect(schemaContent).toMatch(/tags\s+TaskTag\[\]/);
      expect(schemaContent).toMatch(/model TaskTag/);
    });

    it('should define Task-SubTask self-referencing relationship', () => {
      expect(schemaContent).toMatch(/parentTask\s+Task\?\s+@relation\("SubTasks"/);
      expect(schemaContent).toMatch(/subTasks\s+Task\[\]\s+@relation\("SubTasks"/);
    });

    it('should define TaskDependency relationships', () => {
      expect(schemaContent).toMatch(/blockedBy\s+TaskDependency\[\]\s+@relation\("BlockedTask"/);
      expect(schemaContent).toMatch(/blocking\s+TaskDependency\[\]\s+@relation\("BlockingTask"/);
      expect(schemaContent).toMatch(/model TaskDependency/);
    });
  });

  describe('Enums', () => {
    it('should define TaskStatus enum', () => {
      expect(schemaContent).toMatch(/enum TaskStatus\s*\{/);
      expect(schemaContent).toMatch(/TODO/);
      expect(schemaContent).toMatch(/IN_PROGRESS/);
      expect(schemaContent).toMatch(/COMPLETED/);
      expect(schemaContent).toMatch(/CANCELLED/);
    });

    it('should define Priority enum', () => {
      expect(schemaContent).toMatch(/enum Priority\s*\{/);
      expect(schemaContent).toMatch(/LOW/);
      expect(schemaContent).toMatch(/MEDIUM/);
      expect(schemaContent).toMatch(/HIGH/);
      expect(schemaContent).toMatch(/URGENT/);
    });

    it('should define WorkspaceType enum', () => {
      expect(schemaContent).toMatch(/enum WorkspaceType\s*\{/);
      expect(schemaContent).toMatch(/PERSONAL/);
      expect(schemaContent).toMatch(/WORK/);
      expect(schemaContent).toMatch(/TEAM/);
    });

    it('should define SessionType enum', () => {
      expect(schemaContent).toMatch(/enum SessionType\s*\{/);
      expect(schemaContent).toMatch(/WORK/);
      expect(schemaContent).toMatch(/SHORT_BREAK/);
      expect(schemaContent).toMatch(/LONG_BREAK/);
      expect(schemaContent).toMatch(/CONTINUOUS/);
    });

    it('should define Theme enum', () => {
      expect(schemaContent).toMatch(/enum Theme\s*\{/);
      expect(schemaContent).toMatch(/LIGHT/);
      expect(schemaContent).toMatch(/DARK/);
      expect(schemaContent).toMatch(/AUTO/);
    });

    it('should define ViewType enum', () => {
      expect(schemaContent).toMatch(/enum ViewType\s*\{/);
      expect(schemaContent).toMatch(/LIST/);
      expect(schemaContent).toMatch(/KANBAN/);
      expect(schemaContent).toMatch(/CALENDAR/);
      expect(schemaContent).toMatch(/TIMELINE/);
      expect(schemaContent).toMatch(/FOCUS/);
    });
  });

  describe('Indexes', () => {
    it('should have indexes on Task model for common queries', () => {
      expect(schemaContent).toMatch(/@@index\(\[projectId\]\)/);
      expect(schemaContent).toMatch(/@@index\(\[ownerId\]\)/);
      expect(schemaContent).toMatch(/@@index\(\[assigneeId\]\)/);
      expect(schemaContent).toMatch(/@@index\(\[status\]\)/);
      expect(schemaContent).toMatch(/@@index\(\[dueDate\]\)/);
      expect(schemaContent).toMatch(/@@index\(\[priority\]\)/);
      expect(schemaContent).toMatch(/@@index\(\[scheduledDate\]\)/);
    });

    it('should have composite indexes on Task model', () => {
      expect(schemaContent).toMatch(/@@index\(\[ownerId,\s*projectId\]\)/);
      expect(schemaContent).toMatch(/@@index\(\[ownerId,\s*status\]\)/);
      expect(schemaContent).toMatch(/@@index\(\[projectId,\s*status,\s*dueDate\]\)/);
      expect(schemaContent).toMatch(/@@index\(\[assigneeId,\s*status,\s*priority\]\)/);
    });

    it('should have indexes on Workspace model', () => {
      expect(schemaContent).toMatch(/@@index\(\[ownerId\]\)/);
      expect(schemaContent).toMatch(/@@index\(\[slug\]\)/);
      expect(schemaContent).toMatch(/@@index\(\[deletedAt\]\)/);
      expect(schemaContent).toMatch(/@@index\(\[isDeleted\]\)/);
    });

    it('should have indexes on TimeSession model', () => {
      expect(schemaContent).toMatch(/@@index\(\[taskId\]\)/);
      expect(schemaContent).toMatch(/@@index\(\[userId\]\)/);
      expect(schemaContent).toMatch(/@@index\(\[startedAt\]\)/);
      expect(schemaContent).toMatch(/@@index\(\[userId,\s*endedAt\]\)/);
    });

    it('should have indexes on Notification model', () => {
      expect(schemaContent).toMatch(/@@index\(\[userId\]\)/);
      expect(schemaContent).toMatch(/@@index\(\[isRead\]\)/);
      expect(schemaContent).toMatch(/@@index\(\[createdAt\]\)/);
    });

    it('should have unique constraint on Workspace', () => {
      expect(schemaContent).toMatch(/@@unique\(\[ownerId,\s*slug\]\)/);
    });

    it('should have unique constraint on Project', () => {
      expect(schemaContent).toMatch(/@@unique\(\[workspaceId,\s*slug\]\)/);
    });

    it('should have unique constraint on WorkspaceMember', () => {
      expect(schemaContent).toMatch(/@@unique\(\[workspaceId,\s*userId\]\)/);
    });
  });

  describe('Unique Constraints', () => {
    it('should have unique email on User', () => {
      const userMatch = schemaContent.match(/model User\s*([\s\S]*?)\nmodel/);
      expect(userMatch?.[1]).toMatch(/email\s+String\s+@unique/);
    });

    it('should have unique username on User', () => {
      const userMatch = schemaContent.match(/model User\s*([\s\S]*?)\nmodel/);
      expect(userMatch?.[1]).toMatch(/username\s+String\s+@unique/);
    });

    it('should have unique sessionToken on Session', () => {
      expect(schemaContent).toMatch(/sessionToken\s+String\s+@unique/);
    });
  });

  describe('Timestamps', () => {
    it('should have createdAt and updatedAt on User', () => {
      const userMatch = schemaContent.match(/model User\s*([\s\S]*?)\nmodel/);
      expect(userMatch?.[1]).toMatch(/createdAt\s+DateTime\s+@default\(now\(\)\)/);
      expect(userMatch?.[1]).toMatch(/updatedAt\s+DateTime\s+@updatedAt/);
    });

    it('should have createdAt and updatedAt on Task', () => {
      const taskMatch = schemaContent.match(/model Task\s*([\s\S]*?)\n(?:model|enum)/);
      expect(taskMatch?.[1]).toMatch(/createdAt\s+DateTime\s+@default\(now\(\)\)/);
      expect(taskMatch?.[1]).toMatch(/updatedAt\s+DateTime\s+@updatedAt/);
    });

    it('should have createdAt and updatedAt on Project', () => {
      const projectMatch = schemaContent.match(/model Project\s*([\s\S]*?)\n(?:model|enum)/);
      expect(projectMatch?.[1]).toMatch(/createdAt\s+DateTime\s+@default\(now\(\)\)/);
      expect(projectMatch?.[1]).toMatch(/updatedAt\s+DateTime\s+@updatedAt/);
    });

    it('should have createdAt and updatedAt on Workspace', () => {
      const workspaceMatch = schemaContent.match(/model Workspace\s*([\s\S]*?)\n(?:model|enum)/);
      expect(workspaceMatch?.[1]).toMatch(/createdAt\s+DateTime\s+@default\(now\(\)\)/);
      expect(workspaceMatch?.[1]).toMatch(/updatedAt\s+DateTime\s+@updatedAt/);
    });
  });

  describe('Soft Delete Support', () => {
    it('should have isDeleted and deletedAt on Task', () => {
      const taskMatch = schemaContent.match(/model Task\s*([\s\S]*?)\n(?:model|enum)/);
      expect(taskMatch?.[1]).toMatch(/isDeleted\s+Boolean\s+@default\(false\)/);
      expect(taskMatch?.[1]).toMatch(/deletedAt\s+DateTime\?/);
    });

    it('should have isDeleted and deletedAt on Project', () => {
      const projectMatch = schemaContent.match(/model Project\s*([\s\S]*?)\n(?:model|enum)/);
      expect(projectMatch?.[1]).toMatch(/isDeleted\s+Boolean\s+@default\(false\)/);
      expect(projectMatch?.[1]).toMatch(/deletedAt\s+DateTime\?/);
    });

    it('should have isDeleted and deletedAt on Workspace', () => {
      const workspaceMatch = schemaContent.match(/model Workspace\s*([\s\S]*?)\n(?:model|enum)/);
      expect(workspaceMatch?.[1]).toMatch(/isArchived\s+Boolean\s+@default\(false\)/);
      expect(workspaceMatch?.[1]).toMatch(/isDeleted\s+Boolean\s+@default\(false\)/);
      expect(workspaceMatch?.[1]).toMatch(/deletedAt\s+DateTime\?/);
    });
  });

  describe('Cascade Delete Rules', () => {
    it('should cascade delete from Task to Comment', () => {
      expect(schemaContent).toMatch(/task\s+Task\s+@relation\(fields:\s*\[taskId\],\s*references:\s*\[id\],\s*onDelete:\s*Cascade/);
    });

    it('should cascade delete from Task to Attachment', () => {
      expect(schemaContent).toMatch(/onDelete:\s*Cascade/);
    });

    it('should cascade delete from Workspace to Project', () => {
      expect(schemaContent).toMatch(/workspace\s+Workspace\s+@relation\(fields:\s*\[workspaceId\],\s*references:\s*\[id\],\s*onDelete:\s*Cascade/);
    });
  });

  describe('Required Fields Validation', () => {
    it('should require title on Task (no default, no optional)', () => {
      const taskMatch = schemaContent.match(/model Task\s*([\s\S]*?)\n(?:model|enum)/);
      const titleMatch = taskMatch?.[1].match(/title\s+String(\?|\s)/);
      expect(titleMatch?.[1]).not.toContain('?');
    });

    it('should require projectId on Task', () => {
      const taskMatch = schemaContent.match(/model Task\s*([\s\S]*?)\n(?:model|enum)/);
      expect(taskMatch?.[1]).toMatch(/projectId\s+String(?!\?)/);
    });

    it('should require ownerId on Task', () => {
      const taskMatch = schemaContent.match(/model Task\s*([\s\S]*?)\n(?:model|enum)/);
      expect(taskMatch?.[1]).toMatch(/ownerId\s+String(?!\?)/);
    });

    it('should require name on Workspace', () => {
      const workspaceMatch = schemaContent.match(/model Workspace\s*([\s\S]*?)\n(?:model|enum)/);
      const nameMatch = workspaceMatch?.[1].match(/name\s+String(\?|\s)/);
      expect(nameMatch?.[1]).not.toContain('?');
    });
  });

  describe('Default Values', () => {
    it('should have default status on Task', () => {
      expect(schemaContent).toMatch(/status\s+TaskStatus\s+@default\(TODO\)/);
    });

    it('should have default priority on Task', () => {
      expect(schemaContent).toMatch(/priority\s+Priority\s+@default\(MEDIUM\)/);
    });

    it('should have default position on Task', () => {
      expect(schemaContent).toMatch(/position\s+Int\s+@default\(0\)/);
    });

    it('should have default workspaceId on Tag (optional)', () => {
      expect(schemaContent).toMatch(/workspaceId\s+String\?/);
    });

    it('should have default color on Tag', () => {
      expect(schemaContent).toMatch(/color\s+String\s+@default\("#6B7280"\)/);
    });
  });

  describe('Field Types', () => {
    it('should use correct type for estimatedMinutes', () => {
      expect(schemaContent).toMatch(/estimatedMinutes\s+Int\?/);
    });

    it('should use correct type for actualMinutes', () => {
      expect(schemaContent).toMatch(/actualMinutes\s+Int\?\s+@default\(0\)/);
    });

    it('should use DateTime for date fields', () => {
      expect(schemaContent).toMatch(/dueDate\s+DateTime\?/);
      expect(schemaContent).toMatch(/startDate\s+DateTime\?/);
      expect(schemaContent).toMatch(/completedAt\s+DateTime\?/);
    });

    it('should use Text for long content fields', () => {
      expect(schemaContent).toMatch(/description\s+String\?\s+@db\.Text/);
      expect(schemaContent).toMatch(/content\s+String\s+@db\.Text/);
    });

    it('should use Json for metadata fields', () => {
      expect(schemaContent).toMatch(/aiSuggestions\s+Json\?/);
      expect(schemaContent).toMatch(/metadata\s+Json\?/);
      expect(schemaContent).toMatch(/settings\s+Json\?/);
    });
  });
});

describe('Schema Validation - Advanced Models', () => {
  describe('Auth Models', () => {
    it('should have Account model with OAuth fields', () => {
      expect(schemaContent).toMatch(/model Account\s*\{/);
      expect(schemaContent).toMatch(/provider\s+String/);
      expect(schemaContent).toMatch(/providerAccountId\s+String/);
      expect(schemaContent).toMatch(/access_token\s+String\?\s+@db\.Text/);
      expect(schemaContent).toMatch(/refresh_token\s+String\?\s+@db\.Text/);
    });

    it('should have Session model', () => {
      expect(schemaContent).toMatch(/model Session\s*\{/);
      expect(schemaContent).toMatch(/expires\s+DateTime/);
    });

    it('should have unique constraint on Account provider', () => {
      expect(schemaContent).toMatch(/@@unique\(\[provider,\s*providerAccountId\]\)/);
    });
  });

  describe('User Preferences', () => {
    it('should have UserPreferences model', () => {
      expect(schemaContent).toMatch(/model UserPreferences\s*\{/);
      expect(schemaContent).toMatch(/timerMode\s+TimerMode/);
      expect(schemaContent).toMatch(/pomodoroDuration\s+Int/);
      expect(schemaContent).toMatch(/shortBreakDuration\s+Int/);
      expect(schemaContent).toMatch(/longBreakDuration\s+Int/);
      expect(schemaContent).toMatch(/theme\s+Theme/);
      expect(schemaContent).toMatch(/enableAI\s+Boolean/);
    });

    it('should have one-to-one relationship with User', () => {
      expect(schemaContent).toMatch(/preferences\s+UserPreferences\?/);
      expect(schemaContent).toMatch(/user\s+User\s+@relation\(fields:\s*\[userId\],\s*references:\s*\[id\],\s*onDelete:\s*Cascade/);
      expect(schemaContent).toMatch(/userId\s+String\s+@unique/);
    });
  });

  describe('AI & Analytics Models', () => {
    it('should have AIProfile model', () => {
      expect(schemaContent).toMatch(/model AIProfile\s*\{/);
      expect(schemaContent).toMatch(/peakHours\s+Json/);
      expect(schemaContent).toMatch(/peakDays\s+Json/);
      expect(schemaContent).toMatch(/avgTaskDuration\s+Int/);
      expect(schemaContent).toMatch(/completionRate\s+Float/);
    });

    it('should have DailyMetrics model', () => {
      expect(schemaContent).toMatch(/model DailyMetrics\s*\{/);
      expect(schemaContent).toMatch(/userId\s+String/);
      expect(schemaContent).toMatch(/date\s+DateTime\s+@db\.Date/);
      expect(schemaContent).toMatch(/tasksCompleted\s+Int/);
      expect(schemaContent).toMatch(/minutesWorked\s+Int/);
      expect(schemaContent).toMatch(/pomodorosCompleted\s+Int/);
      expect(schemaContent).toMatch(/focusScore\s+Float\?/);
    });

    it('should have unique constraint on DailyMetrics', () => {
      expect(schemaContent).toMatch(/@@unique\(\[userId,\s*date\]\)/);
    });
  });

  describe('Gamification Models', () => {
    it('should have Achievement model', () => {
      expect(schemaContent).toMatch(/model Achievement\s*\{/);
      expect(schemaContent).toMatch(/code\s+String\s+@unique/);
      expect(schemaContent).toMatch(/name\s+String/);
      expect(schemaContent).toMatch(/xpReward\s+Int/);
    });

    it('should have UserAchievement model', () => {
      expect(schemaContent).toMatch(/model UserAchievement\s*\{/);
      expect(schemaContent).toMatch(/@@unique\(\[userId,\s*achievementId\]\)/);
    });

    it('should have xp and level on User', () => {
      const userMatch = schemaContent.match(/model User\s*([\s\S]*?)\nmodel/);
      expect(userMatch?.[1]).toMatch(/xp\s+Int\s+@default\(0\)/);
      expect(userMatch?.[1]).toMatch(/level\s+Int\s+@default\(1\)/);
    });
  });

  describe('Habit Tracking Models', () => {
    it('should have Habit model', () => {
      expect(schemaContent).toMatch(/model Habit\s*\{/);
      expect(schemaContent).toMatch(/name\s+String/);
      expect(schemaContent).toMatch(/frequency\s+HabitFrequency/);
      expect(schemaContent).toMatch(/currentStreak\s+Int/);
      expect(schemaContent).toMatch(/longestStreak\s+Int/);
    });

    it('should have HabitCompletion model', () => {
      expect(schemaContent).toMatch(/model HabitCompletion\s*\{/);
      expect(schemaContent).toMatch(/completedAt\s+DateTime/);
      expect(schemaContent).toMatch(/completedDate\s+DateTime\s+@db\.Date/);
    });
  });

  describe('OKR Models', () => {
    it('should have Objective model', () => {
      expect(schemaContent).toMatch(/model Objective\s*\{/);
      expect(schemaContent).toMatch(/title\s+String/);
      expect(schemaContent).toMatch(/progress\s+Float/);
      expect(schemaContent).toMatch(/period\s+OKRPeriod/);
      expect(schemaContent).toMatch(/status\s+ObjectiveStatus/);
    });

    it('should have KeyResult model', () => {
      expect(schemaContent).toMatch(/model KeyResult\s*\{/);
      expect(schemaContent).toMatch(/metricType\s+MetricType/);
      expect(schemaContent).toMatch(/targetValue\s+Float/);
      expect(schemaContent).toMatch(/currentValue\s+Float/);
      expect(schemaContent).toMatch(/progress\s+Float/);
    });

    it('should have KeyResultTask join table', () => {
      expect(schemaContent).toMatch(/model KeyResultTask\s*\{/);
      expect(schemaContent).toMatch(/weight\s+Float/);
    });
  });

  describe('Custom Fields', () => {
    it('should have CustomField model', () => {
      expect(schemaContent).toMatch(/model CustomField\s*\{/);
      expect(schemaContent).toMatch(/name\s+String/);
      expect(schemaContent).toMatch(/type\s+CustomFieldType/);
      expect(schemaContent).toMatch(/isRequired\s+Boolean/);
    });

    it('should have CustomFieldValue model', () => {
      expect(schemaContent).toMatch(/model CustomFieldValue\s*\{/);
      expect(schemaContent).toMatch(/value\s+String\s+@db\.Text/);
      expect(schemaContent).toMatch(/@@unique\(\[fieldId,\s*taskId\]\)/);
    });

    it('should define CustomFieldType enum', () => {
      expect(schemaContent).toMatch(/enum CustomFieldType/);
      expect(schemaContent).toMatch(/TEXT/);
      expect(schemaContent).toMatch(/NUMBER/);
      expect(schemaContent).toMatch(/SELECT/);
      expect(schemaContent).toMatch(/DATE/);
    });
  });

  describe('Task Recurrence', () => {
    it('should have Recurrence model', () => {
      expect(schemaContent).toMatch(/model Recurrence\s*\{/);
      expect(schemaContent).toMatch(/pattern\s+RecurrencePattern/);
      expect(schemaContent).toMatch(/interval\s+Int/);
      expect(schemaContent).toMatch(/daysOfWeek\s+Int\[\]/);
    });

    it('should define RecurrencePattern enum', () => {
      expect(schemaContent).toMatch(/enum RecurrencePattern/);
      expect(schemaContent).toMatch(/DAILY/);
      expect(schemaContent).toMatch(/WEEKLY/);
      expect(schemaContent).toMatch(/MONTHLY/);
    });
  });

  describe('Activity Tracking', () => {
    it('should have Activity model', () => {
      expect(schemaContent).toMatch(/model Activity\s*\{/);
      expect(schemaContent).toMatch(/type\s+ActivityType/);
      expect(schemaContent).toMatch(/metadata\s+Json\?/);
    });

    it('should define ActivityType enum with all types', () => {
      expect(schemaContent).toMatch(/enum ActivityType/);
      expect(schemaContent).toMatch(/TASK_CREATED/);
      expect(schemaContent).toMatch(/TASK_UPDATED/);
      expect(schemaContent).toMatch(/TASK_COMPLETED/);
      expect(schemaContent).toMatch(/COMMENT_ADDED/);
      expect(schemaContent).toMatch(/STATUS_CHANGED/);
    });
  });
});

describe('Schema Validation - Marketing Models', () => {
  describe('Blog Models', () => {
    it('should have BlogPost model', () => {
      expect(schemaContent).toMatch(/model BlogPost\s*\{/);
      expect(schemaContent).toMatch(/slug\s+String\s+@unique/);
      expect(schemaContent).toMatch(/title\s+String/);
      expect(schemaContent).toMatch(/content\s+String\s+@db\.Text/);
      expect(schemaContent).toMatch(/published\s+Boolean/);
    });

    it('should have BlogComment model', () => {
      expect(schemaContent).toMatch(/model BlogComment\s*\{/);
      expect(schemaContent).toMatch(/postId\s+String/);
      expect(schemaContent).toMatch(/userId\s+String/);
    });
  });

  describe('Roadmap Models', () => {
    it('should have RoadmapItem model', () => {
      expect(schemaContent).toMatch(/model RoadmapItem\s*\{/);
      expect(schemaContent).toMatch(/title\s+String/);
      expect(schemaContent).toMatch(/status\s+RoadmapStatus/);
      expect(schemaContent).toMatch(/totalVotes\s+Int/);
    });

    it('should have RoadmapVote model', () => {
      expect(schemaContent).toMatch(/model RoadmapVote\s*\{/);
      expect(schemaContent).toMatch(/itemId\s+String/);
      expect(schemaContent).toMatch(/userId\s+String/);
      expect(schemaContent).toMatch(/weight\s+Int/);
    });

    it('should define RoadmapStatus enum', () => {
      expect(schemaContent).toMatch(/enum RoadmapStatus/);
      expect(schemaContent).toMatch(/CONSIDERING/);
      expect(schemaContent).toMatch(/PLANNED/);
      expect(schemaContent).toMatch(/IN_PROGRESS/);
      expect(schemaContent).toMatch(/COMPLETED/);
    });
  });

  describe('Changelog & FAQ', () => {
    it('should have ChangelogEntry model', () => {
      expect(schemaContent).toMatch(/model ChangelogEntry\s*\{/);
      expect(schemaContent).toMatch(/version\s+String\?/);
      expect(schemaContent).toMatch(/title\s+String/);
      expect(schemaContent).toMatch(/type\s+ChangelogType/);
    });

    it('should define ChangelogType enum', () => {
      expect(schemaContent).toMatch(/enum ChangelogType/);
      expect(schemaContent).toMatch(/NEW/);
      expect(schemaContent).toMatch(/IMPROVED/);
      expect(schemaContent).toMatch(/FIXED/);
    });

    it('should have FAQ model', () => {
      expect(schemaContent).toMatch(/model FAQ\s*\{/);
      expect(schemaContent).toMatch(/question\s+String/);
      expect(schemaContent).toMatch(/answer\s+String\s+@db\.Text/);
      expect(schemaContent).toMatch(/category\s+String/);
    });
  });
});

describe('Schema File Structure', () => {
  it('should have valid Prisma schema header', () => {
    expect(schemaContent).toMatch(/generator client\s*\{/);
    expect(schemaContent).toMatch(/provider\s+=\s*"prisma-client-js"/);
    expect(schemaContent).toMatch(/engineType\s+=\s*"library"/);
  });

  it('should have datasource configuration', () => {
    expect(schemaContent).toMatch(/datasource db\s*\{/);
    expect(schemaContent).toMatch(/provider\s+=\s*"postgresql"/);
  });

  it('should use cuid for id defaults', () => {
    const idMatches = schemaContent.matchAll(/id\s+String\s+@id\s+@default\(cuid\(\)\)/g);
    const count = Array.from(idMatches).length;
    expect(count).toBeGreaterThan(10); // Most models should use cuid
  });

  it('should use proper comments for organization', () => {
    expect(schemaContent).toMatch(/\/\/ ============ USER & AUTH ============/);
    expect(schemaContent).toMatch(/\/\/ ============ WORKSPACES ============/);
    expect(schemaContent).toMatch(/\/\/ ============ PROJECTS & TASKS ============/);
  });
});
