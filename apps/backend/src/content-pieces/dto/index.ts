import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ContentType, ContentPipelineStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContentPieceDto {
  @ApiProperty({
    description: 'Title of the content piece (max 300 characters)',
    example: 'Cómo crear un Content Pipeline efectivo',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  title: string;

  @ApiPropertyOptional({
    description: 'Description or summary of the content',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Type of content',
    enum: ContentType,
  })
  @IsEnum(ContentType)
  contentType: ContentType;

  @ApiPropertyOptional({
    description: 'Script or main text content',
  })
  @IsString()
  @IsOptional()
  script?: string;

  @ApiPropertyOptional({
    description: 'Production notes',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description: 'ID of the idea this content piece was promoted from',
  })
  @IsString()
  @IsOptional()
  ideaId?: string;

  @ApiPropertyOptional({
    description: 'ID of the series this content belongs to',
  })
  @IsString()
  @IsOptional()
  seriesId?: string;

  @ApiPropertyOptional({
    description: 'Episode number within the series',
  })
  @IsInt()
  @IsOptional()
  episodeNumber?: number;

  @ApiPropertyOptional({
    description: 'Thumbnail URL',
  })
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiPropertyOptional({
    description: 'Scheduled publish date/time',
  })
  @IsDateString()
  @IsOptional()
  scheduledAt?: string;
}

export class UpdateContentPieceDto {
  @ApiPropertyOptional({
    description: 'Title of the content piece',
  })
  @IsString()
  @IsOptional()
  @MaxLength(300)
  title?: string;

  @ApiPropertyOptional({
    description: 'Description or summary',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Type of content',
    enum: ContentType,
  })
  @IsEnum(ContentType)
  @IsOptional()
  contentType?: ContentType;

  @ApiPropertyOptional({
    description: 'Script or main text content',
  })
  @IsString()
  @IsOptional()
  script?: string;

  @ApiPropertyOptional({
    description: 'Production notes',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Series ID',
  })
  @IsString()
  @IsOptional()
  seriesId?: string;

  @ApiPropertyOptional({
    description: 'Episode number',
  })
  @IsInt()
  @IsOptional()
  episodeNumber?: number;

  @ApiPropertyOptional({
    description: 'Thumbnail URL',
  })
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiPropertyOptional({
    description: 'Scheduled publish date/time',
  })
  @IsDateString()
  @IsOptional()
  scheduledAt?: string;
}

export class UpdateContentStatusDto {
  @ApiProperty({
    description: 'New pipeline status',
    enum: ContentPipelineStatus,
  })
  @IsEnum(ContentPipelineStatus)
  status: ContentPipelineStatus;
}

export class ContentPieceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty({ enum: ContentPipelineStatus })
  status: ContentPipelineStatus;

  @ApiProperty()
  statusChangedAt: Date;

  @ApiProperty({ enum: ContentType })
  contentType: ContentType;

  @ApiPropertyOptional()
  script?: string;

  @ApiPropertyOptional()
  notes?: string;

  @ApiPropertyOptional()
  scheduledAt?: Date;

  @ApiPropertyOptional()
  publishedAt?: Date;

  @ApiPropertyOptional()
  thumbnailUrl?: string;

  @ApiPropertyOptional()
  ideaId?: string;

  @ApiPropertyOptional()
  seriesId?: string;

  @ApiPropertyOptional()
  episodeNumber?: number;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  workspaceId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ type: [Object] })
  socialPosts?: Array<{
    id: string;
    platform: string;
    status: string;
    scheduledAt?: Date;
    publishedAt?: Date;
  }>;

  @ApiPropertyOptional()
  series?: {
    id: string;
    name: string;
    color: string;
  };
}
