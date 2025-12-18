/**
 * Notification-related types and DTOs
 */
export type NotificationType = 'TASK_ASSIGNED' | 'TASK_MENTIONED' | 'TASK_COMPLETED' | 'TASK_DUE_SOON' | 'TASK_OVERDUE' | 'COMMENT_ADDED' | 'WORKSPACE_INVITATION' | 'PROJECT_SHARED' | 'REPORT_READY';
export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, unknown>;
    read: boolean;
    readAt?: Date;
    createdAt: Date;
}
export interface UnreadCountResponse {
    count: number;
}
//# sourceMappingURL=notification.types.d.ts.map