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
  author: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  parentCommentId?: string | null;
  /** Mentioned user IDs (ODD 018 S2) */
  mentions?: string[];
  isEdited?: boolean;
  editedAt?: string | null;
}

export interface CreateCommentDto {
  content: string;
  taskId: string;
  mentionedUserIds?: string[];
}

export interface UpdateCommentDto {
  content: string;
  mentionedUserIds?: string[];
}
