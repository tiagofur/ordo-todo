import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsBoolean,
  IsArray,
  MinLength,
} from 'class-validator';
import { Priority } from '@prisma/client';

export class CreateTemplateDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  titlePattern?: string;

  @IsEnum(Priority)
  @IsOptional()
  defaultPriority?: Priority;

  @IsInt()
  @IsOptional()
  defaultEstimatedMinutes?: number;

  @IsString()
  @IsOptional()
  defaultDescription?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  defaultTags?: string[];

  @IsString()
  workspaceId: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

export class UpdateTemplateDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  titlePattern?: string;

  @IsEnum(Priority)
  @IsOptional()
  defaultPriority?: Priority;

  @IsInt()
  @IsOptional()
  defaultEstimatedMinutes?: number;

  @IsString()
  @IsOptional()
  defaultDescription?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  defaultTags?: string[];

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
