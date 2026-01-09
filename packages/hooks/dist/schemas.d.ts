import { z } from "zod";
/**
 * Task limits
 */
export declare const TASK_LIMITS: {
    readonly TITLE_MIN_LENGTH: 1;
    readonly TITLE_MAX_LENGTH: 200;
    readonly DESCRIPTION_MAX_LENGTH: 5000;
    readonly MIN_ESTIMATED_MINUTES: 1;
    readonly MAX_ESTIMATED_MINUTES: 480;
    readonly MAX_TAGS_PER_TASK: 10;
};
/**
 * Project limits
 */
export declare const PROJECT_LIMITS: {
    readonly NAME_MIN_LENGTH: 1;
    readonly NAME_MAX_LENGTH: 100;
    readonly DESCRIPTION_MAX_LENGTH: 2000;
};
/**
 * Priority values
 */
export declare const PRIORITY_VALUES: readonly ["LOW", "MEDIUM", "HIGH", "URGENT"];
/**
 * Task status values
 */
export declare const TASK_STATUS_VALUES: readonly ["TODO", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
/**
 * Color constants
 */
export declare const PROJECT_COLORS: readonly ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899", "#6B7280"];
/**
 * Workspace limits
 */
export declare const WORKSPACE_LIMITS: {
    readonly NAME_MIN_LENGTH: 1;
    readonly NAME_MAX_LENGTH: 100;
    readonly DESCRIPTION_MAX_LENGTH: 500;
};
/**
 * Member roles
 */
export declare const MEMBER_ROLES: readonly ["OWNER", "ADMIN", "MEMBER", "VIEWER"];
/**
 * Schemas inlined from @ordo-todo/core to avoid client-side bundling issues
 */
export declare const taskBaseSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    priority: z.ZodEnum<{
        LOW: "LOW";
        MEDIUM: "MEDIUM";
        HIGH: "HIGH";
        URGENT: "URGENT";
    }>;
    status: z.ZodOptional<z.ZodEnum<{
        TODO: "TODO";
        IN_PROGRESS: "IN_PROGRESS";
        COMPLETED: "COMPLETED";
        CANCELLED: "CANCELLED";
    }>>;
    dueDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    startDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    scheduledDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    scheduledTime: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    isTimeBlocked: z.ZodOptional<z.ZodBoolean>;
    estimatedMinutes: z.ZodPipe<z.ZodNullable<z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodNaN]>>>, z.ZodTransform<number | null | undefined, number | null | undefined>>;
}, z.core.$strip>;
export declare const createTaskSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    priority: z.ZodEnum<{
        LOW: "LOW";
        MEDIUM: "MEDIUM";
        HIGH: "HIGH";
        URGENT: "URGENT";
    }>;
    status: z.ZodOptional<z.ZodEnum<{
        TODO: "TODO";
        IN_PROGRESS: "IN_PROGRESS";
        COMPLETED: "COMPLETED";
        CANCELLED: "CANCELLED";
    }>>;
    dueDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    startDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    scheduledDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    scheduledTime: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    isTimeBlocked: z.ZodOptional<z.ZodBoolean>;
    estimatedMinutes: z.ZodPipe<z.ZodNullable<z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodNaN]>>>, z.ZodTransform<number | null | undefined, number | null | undefined>>;
    projectId: z.ZodString;
    parentTaskId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    assigneeId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    tagIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export declare const projectBaseSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const createProjectSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
    workspaceId: z.ZodString;
    workflowId: z.ZodOptional<z.ZodString>;
    startDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    endDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const inviteMemberSchema: z.ZodObject<{
    email: z.ZodString;
    role: z.ZodEnum<{
        OWNER: "OWNER";
        ADMIN: "ADMIN";
        MEMBER: "MEMBER";
        VIEWER: "VIEWER";
    }>;
    message: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=schemas.d.ts.map