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
  completedAt: Date | null;
  estimatedTime: number | null;
  actualTime: number | null;
  projectId: string;
  creatorId: string;
  parentTaskId: string | null;
  position: number;
  createdAt: Date;
  updatedAt: Date;
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
  projectId: string;
  estimatedTime?: number;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date | string | null;
  estimatedTime?: number;
}

export interface CreateSubtaskDto {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: Date | string;
  estimatedTime?: number;
}
