import { IsArray, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @MinLength(1)
  taskId: string;

  @IsString()
  @MinLength(1)
  content: string;

  /**
   * User IDs picked from the workspace member list. Non-members are dropped
   * server-side (ODD 018 S2 / W2). When omitted, the backend falls back to
   * exact "@Full Name" matching against the member list.
   */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mentionedUserIds?: string[];
}
