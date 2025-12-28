/**
 * Project-related types and DTOs
 */
export type ProjectStatus = 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export interface ProjectOwner {
    id: string;
    name: string | null;
    email: string;
    image?: string | null;
}
export interface Project {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    status: ProjectStatus;
    priority: Priority;
    color: string;
    icon: string | null;
    startDate: Date | null;
    dueDate: Date | null;
    ownerId: string | null;
    owner?: ProjectOwner | null;
    workspaceId: string;
    workflowId: string;
    archived: boolean;
    archivedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateProjectDto {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    status?: ProjectStatus;
    priority?: Priority;
    startDate?: Date | string;
    dueDate?: Date | string;
    workspaceId: string;
    workflowId: string;
}
export interface UpdateProjectDto {
    name?: string;
    description?: string;
    color?: string;
    icon?: string;
    status?: ProjectStatus;
    priority?: Priority;
    startDate?: Date | string | null;
    dueDate?: Date | string | null;
    workflowId?: string;
}
//# sourceMappingURL=project.types.d.ts.map