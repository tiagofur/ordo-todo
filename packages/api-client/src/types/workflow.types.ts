/**
 * Workflow-related types and DTOs
 */

export interface Workflow {
  id: string;
  name: string;
  description: string | null;
  workspaceId: string;
  color: string;
  icon: string | null;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWorkflowDto {
  name: string;
  description?: string;
  workspaceId: string;
  color?: string;
  icon?: string;
  position?: number;
}

export interface UpdateWorkflowDto {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  position?: number;
}
