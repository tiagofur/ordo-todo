import { IsArray, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateCommentDto {
  @IsString()
  @MinLength(1)
  content: string;

  /** Same contract as CreateCommentDto. When omitted, names are re-parsed. */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mentionedUserIds?: string[];
}
