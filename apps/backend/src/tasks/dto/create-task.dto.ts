import {
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
  IsDate,
  ValidateNested,
  IsInt,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRecurrenceDto {
  @IsEnum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM'])
  pattern: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM';

  @IsInt()
  @IsOptional()
  interval?: number;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  daysOfWeek?: number[];

  @IsInt()
  @IsOptional()
  dayOfMonth?: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;
}

export class CreateTaskDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  @IsOptional()
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dueDate?: Date;

  @IsString()
  @MinLength(1)
  projectId: string;

  @IsString()
  @IsOptional()
  assigneeId?: string;

  @IsInt()
  @IsOptional()
  estimatedTime?: number;

  @ValidateNested()
  @Type(() => CreateRecurrenceDto)
  @IsOptional()
  recurrence?: CreateRecurrenceDto;
}
