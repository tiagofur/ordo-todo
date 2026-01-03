import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChangelogType } from '@prisma/client';

export class CreateChangelogDto {
  @ApiProperty({
    example: 'Added new dark mode',
    description: 'Title of the changelog entry',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'We have implemented a new dark mode feature...',
    description: 'Content of the changelog entry',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    example: 'v1.2.0',
    description: 'Version number associated with this change',
  })
  @IsOptional()
  @IsString()
  version?: string;

  @ApiPropertyOptional({
    enum: ChangelogType,
    example: ChangelogType.NEW,
    description: 'Type of change (NEW, IMPROVED, FIXED, REMOVED)',
  })
  @IsOptional()
  @IsEnum(ChangelogType)
  type?: ChangelogType;

  @ApiPropertyOptional({
    example: '2023-01-01T00:00:00Z',
    description: 'Date when valid to publish',
  })
  @IsOptional()
  @IsDateString()
  publishedAt?: string;
}
