/**
 * Tag-related types and DTOs
 */

export interface Tag {
  id: string;
  name: string;
  color: string;
  workspaceId?: string;
  createdAt: Date;
  updatedAt?: Date;
  taskCount?: number;
}

export interface CreateTagDto {
  name: string;
  color?: string;
  workspaceId: string;
}

export interface UpdateTagDto extends Partial<CreateTagDto> { }
