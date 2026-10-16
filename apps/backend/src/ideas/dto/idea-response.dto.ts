import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IdeaSource, IdeaStatus } from '@prisma/client';

export class IdeaResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty({ enum: IdeaSource })
  source: IdeaSource;

  @ApiPropertyOptional()
  voiceNoteUrl?: string;

  @ApiPropertyOptional()
  screenshot?: string;

  @ApiPropertyOptional()
  sourceUrl?: string;

  @ApiProperty({ enum: IdeaStatus })
  status: IdeaStatus;

  @ApiPropertyOptional()
  archivedAt?: Date;

  @ApiPropertyOptional()
  promotedAt?: Date;

  @ApiPropertyOptional()
  contentPieceId?: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  workspaceId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ type: [Object] })
  tags?: Array<{ id: string; name: string; color: string }>;
}
