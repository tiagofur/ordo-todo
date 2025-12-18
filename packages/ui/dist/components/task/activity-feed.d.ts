export interface Activity {
    id: string | number;
    type: 'TASK_CREATED' | 'TASK_UPDATED' | 'TASK_COMPLETED' | 'TASK_DELETED' | 'COMMENT_ADDED' | 'COMMENT_EDITED' | 'COMMENT_DELETED' | 'ATTACHMENT_ADDED' | 'ATTACHMENT_DELETED' | 'SUBTASK_ADDED' | 'SUBTASK_COMPLETED' | 'STATUS_CHANGED' | 'PRIORITY_CHANGED' | 'ASSIGNEE_CHANGED' | 'DUE_DATE_CHANGED';
    createdAt: Date | string;
    user: {
        id: string;
        name: string;
        image?: string;
    };
    metadata?: {
        oldValue?: string | null;
        newValue?: string | null;
        fieldName?: string | null;
        itemName?: string | null;
    };
}
interface ActivityFeedProps {
    taskId: string;
    activities?: Activity[];
    maxItems?: number;
    locale?: string;
    labels?: {
        title?: string;
        today?: string;
        yesterday?: string;
        empty?: string;
        showing?: (current: number, total: number) => string;
        showMore?: (count: number) => string;
        actions?: Record<string, string>;
        details?: {
            fromTo?: (oldVal: string, newVal: string) => string;
            to?: (newVal: string) => string;
            removed?: string;
            item?: (name: string) => string;
            mentioned?: (users: string) => string;
        };
    };
}
export declare function ActivityFeed({ taskId, activities, maxItems, locale, labels, }: ActivityFeedProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=activity-feed.d.ts.map