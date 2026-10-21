/**
 * Task-related types and DTOs
 */

import type { Comment } from './comment.types';
import type { Attachment } from './attachment.types';
import type { Tag } from './tag.types';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  startDate: Date | null;
  scheduledDate: Date | null;
  scheduledTime: string | null;
  scheduledEndTime: string | null;
  isTimeBlocked: boolean;
  completedAt: Date | null;
  estimatedMinutes: number | null;
  actualMinutes: number | null;
  projectId: string;
  ownerId: string;
  assigneeId: string | null;
  assignee?: {
    id: string;
    name: string;
    image?: string;
  } | null;
  owner?: {
    id: string;
    name: string;
    image?: string;
  } | null;
  parentTaskId: string | null;
  position: number;
  createdAt: Date;
  updatedAt?: Date | null;
  /** Public sharing token for task */
  publicToken?: string | null;
  /** Recurrence rule if task repeats */
  recurrence?: TaskRecurrence | null;
}

export interface TaskRecurrence {
  id?: string;
  pattern: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM';
  interval?: number;
  daysOfWeek?: number[];
  dayOfMonth?: number | null;
  endDate?: Date | string | null;
}

export interface CreateRecurrenceDto {
  pattern: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM';
  interval?: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  endDate?: Date | string | null;
}

export interface TaskWithRelations extends Task {
  subTasks?: Task[];
  tags?: Tag[];
  comments?: Comment[];
  attachments?: Attachment[];
  dependencies?: TaskDependency[];
  dependents?: TaskDependency[];
}

export interface TaskDetails extends Task {
  subTasks: Task[];
  comments: Comment[];
  attachments: Attachment[];
  tags: Tag[];
  project: {
    id: string;
    name: string;
    workspaceId: string;
  };
}

export interface TaskDependency {
  id: string;
  taskId: string;
  dependsOnId: string;
  type: 'BLOCKING' | 'RELATED';
  createdAt: Date;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: Date | string;
  startDate?: Date | string;
  scheduledDate?: Date | string;
  scheduledTime?: string;
  scheduledEndTime?: string;
  isTimeBlocked?: boolean;
  projectId: string;
  estimatedMinutes?: number;
  assigneeId?: string;
  recurrence?: CreateRecurrenceDto | null;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date | string | null;
  startDate?: Date | string | null;
  scheduledDate?: Date | string | null;
  scheduledTime?: string | null;
  scheduledEndTime?: string | null;
  isTimeBlocked?: boolean;
  estimatedMinutes?: number;
  assigneeId?: string | null;
  recurrence?: CreateRecurrenceDto | null;
}

export interface CreateSubtaskDto {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: Date | string;
  estimatedMinutes?: number;
}

/**
 * Task sharing response
 */
export interface TaskShareResponse {
  publicToken: string;
  shareUrl: string;
  expiresAt?: Date;
}

export interface PublicTaskResponse {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  estimatedMinutes: number | null;
  project?: {
    id: string;
    name: string;
    color?: string;
  } | null;
  assignee?: {
    id: string;
    name: string | null;
    image?: string;
  } | null;
  creator?: {
    id: string;
    name: string | null;
    image?: string;
  } | null;
  subTasks?: Array<{
    id: string;
    title: string;
    status: TaskStatus;
  }>;
}

/**
 * Response from GET /tasks/today - categorized tasks for today view
 */
export interface TodayTasksResponse {
  overdue: Task[];
  dueToday: Task[];
  scheduledToday: Task[];
  available: Task[];
  notYetAvailable: Task[];
}

/**
 * Time block for calendar view - represents a scheduled time slot
 */
export interface TimeBlock {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  scheduledDate: Date | null;
  scheduledTime: string | null;
  scheduledEndTime: string | null;
  estimatedMinutes: number | null;
  project: {
    id: string;
    name: string;
    color: string;
  } | null;
  tags: Array<{
    id: string;
    name: string;
    color: string;
  }>;
}

/**
 * Query parameters for GET /tasks endpoint
 */
export interface GetTasksParams {
  projectId?: string;
  tags?: string[];
  assignedToMe?: boolean;
}

/**
 * Query parameters for GET /tasks/scheduled endpoint
 */
export interface GetScheduledTasksParams {
  date?: string;
}

/**
 * Query parameters for GET /tasks/available endpoint
 */
export interface GetAvailableTasksParams {
  projectId?: string;
}

/**
 * Query parameters for GET /tasks/time-blocks endpoint
 */
export interface GetTimeBlocksParams {
  start?: string;
  end?: string;
}

// ODD 005 S6 (T5): "Mi plan de hoy" — mirrors backend DayPlanView
// (DayPlanService) + T4b risks shape (endpoint lands with T4b).

export interface DayPlanBlock {
  taskId: string;
  start: string;
  end: string;
  reason: string;
}

export type DayPlanChangeType = 'moved' | 'added' | 'removed' | 'resized';

export interface DayPlanChange {
  taskId: string;
  type: DayPlanChangeType;
  from?: { start: string; end: string };
  to?: { start: string; end: string };
  reason: string;
}

export type DayPlanStatus = 'PROPOSED' | 'APPLIED' | 'DISMISSED';

export interface DayPlanView {
  proposalId: string;
  status: DayPlanStatus;
  blocks: DayPlanBlock[];
  frozenTaskIds: string[];
  changes: DayPlanChange[];
}

// TODO(ODD 005 T4b rebase): confirm against RiskAlertService wire shape
// when GET tasks/day-plan/risks lands; graceful-degrades to null until then.
export interface DayPlanRiskOption {
  id: string;
  label: string;
}

export interface DayPlanRisk {
  id: string;
  taskId?: string;
  title: string;
  detail: string;
  options: DayPlanRiskOption[];
}

