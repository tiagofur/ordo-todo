import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  IsDateString,
} from 'class-validator';
import { ContentPlatform, SocialPostStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSocialPostDto {
  @ApiProperty({
    description: 'Content piece ID',
  })
  @IsString()
  @IsNotEmpty()
  contentPieceId: string;

  @ApiProperty({
    description: 'Target platform',
    enum: ContentPlatform,
  })
  @IsEnum(ContentPlatform)
  platform: ContentPlatform;

  @ApiPropertyOptional({
    description: 'Custom title for this platform',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'Custom description for this platform',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Hashtags for the post',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  hashtags?: string[];

  @ApiPropertyOptional({
    description: 'Scheduled publish time',
  })
  @IsDateString()
  @IsOptional()
  scheduledAt?: string;
}

export class UpdateSocialPostDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  hashtags?: string[];

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  scheduledAt?: string;
}

export class SchedulePostDto {
  @ApiProperty({
    description: 'Scheduled publish time',
  })
  @IsDateString()
  scheduledAt: string;
}

export class SocialPostResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  contentPieceId: string;

  @ApiProperty({ enum: ContentPlatform })
  platform: ContentPlatform;

  @ApiPropertyOptional()
  title?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty({ type: [String] })
  hashtags: string[];

  @ApiPropertyOptional()
  scheduledAt?: Date;

  @ApiPropertyOptional()
  publishedAt?: Date;

  @ApiProperty({ enum: SocialPostStatus })
  status: SocialPostStatus;

  @ApiPropertyOptional()
  platformPostId?: string;

  @ApiPropertyOptional()
  platformUrl?: string;

  @ApiPropertyOptional()
  errorMessage?: string;

  // Analytics
  @ApiPropertyOptional()
  views?: number;

  @ApiPropertyOptional()
  likes?: number;

  @ApiPropertyOptional()
  comments?: number;

  @ApiPropertyOptional()
  shares?: number;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  // Related content piece
  @ApiPropertyOptional()
  contentPiece?: {
    id: string;
    title: string;
    status: string;
  };
}

export class BulkScheduleDto {
  @ApiProperty({
    description: 'Content piece ID to schedule',
  })
  @IsString()
  @IsNotEmpty()
  contentPieceId: string;

  @ApiProperty({
    description: 'Platforms and their scheduled times',
    type: [Object],
  })
  @IsArray()
  platforms: Array<{
    platform: ContentPlatform;
    scheduledAt: string;
    title?: string;
    description?: string;
    hashtags?: string[];
  }>;
}
