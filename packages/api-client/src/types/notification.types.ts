/**
 * Notification-related types and DTOs
 */

export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'COMMENT_ADDED'
  | 'MENTIONED'
  | 'DUE_DATE_APPROACHING'
  | 'INVITATION_RECEIVED'
  | 'SYSTEM';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string | null;
  resourceId?: string;
  resourceType?: string;
  metadata?: Record<string, unknown>;
  isRead: boolean;
  readAt?: Date | null;
  createdAt: Date;
  updatedAt?: Date;
}

export interface UnreadCountResponse {
  count: number;
}
