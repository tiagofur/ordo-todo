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
  estimatedTime: number | null;
  actualTime: number | null;
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
  updatedAt: Date;
  /** Public sharing token for task */
  publicToken?: string | null;
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
  estimatedTime?: number;
  assigneeId?: string;
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
  estimatedTime?: number;
  assigneeId?: string | null;
}

export interface CreateSubtaskDto {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: Date | string;
  estimatedTime?: number;
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
  estimatedTime: number | null;
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
  estimatedTime: number | null;
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
