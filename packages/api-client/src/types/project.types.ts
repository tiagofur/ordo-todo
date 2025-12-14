/**
 * Project-related types and DTOs
 */

export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  icon: string | null;
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
  workspaceId: string;
  workflowId: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  workflowId?: string;
}
