/**
 * Comment-related types and DTOs
 */

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export interface CreateCommentDto {
  content: string;
  taskId: string;
}

export interface UpdateCommentDto {
  content: string;
}
