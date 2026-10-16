import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { IdeaSource } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateIdeaDto {
  @ApiProperty({
    description: 'The title of the idea (max 200 characters)',
    example: 'Tutorial sobre Next.js 15',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({
    description: 'Optional detailed description of the idea',
    example: 'Un video explicando las nuevas features de Next.js 15...',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'The source of the idea',
    enum: IdeaSource,
    default: 'MANUAL',
  })
  @IsEnum(IdeaSource)
  @IsOptional()
  source?: IdeaSource;

  @ApiPropertyOptional({
    description: 'URL to voice note (if captured via voice)',
  })
  @IsString()
  @IsOptional()
  voiceNoteUrl?: string;

  @ApiPropertyOptional({
    description: 'URL to screenshot or image',
  })
  @IsString()
  @IsOptional()
  screenshot?: string;

  @ApiPropertyOptional({
    description: 'Source URL (if captured via browser extension)',
  })
  @IsString()
  @IsOptional()
  sourceUrl?: string;

  @ApiPropertyOptional({
    description: 'Tag IDs to associate with this idea',
    type: [String],
  })
  @IsString({ each: true })
  @IsOptional()
  tagIds?: string[];
}
