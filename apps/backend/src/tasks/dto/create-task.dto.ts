import {
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
  IsDate,
  ValidateNested,
  IsInt,
  IsArray,
  Matches,
  IsBoolean,
  ValidateIf,
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

  @ValidateIf((_, val) => val !== null)
  @IsInt()
  @IsOptional()
  dayOfMonth?: number | null;

  @ValidateIf((_, val) => val !== null)
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date | null;
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

  @ValidateIf((_, val) => val !== null)
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dueDate?: Date | null;

  @ValidateIf((_, val) => val !== null)
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  doDate?: Date | null;

  @ValidateIf((_, val) => val !== null)
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date | null;

  @ValidateIf((_, val) => val !== null)
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  scheduledDate?: Date | null;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, {
    message: 'scheduledTime must be in HH:mm format',
  })
  @IsOptional()
  scheduledTime?: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, {
    message: 'scheduledEndTime must be in HH:mm format',
  })
  @IsOptional()
  scheduledEndTime?: string;

  @IsBoolean()
  @IsOptional()
  isTimeBlocked?: boolean;

  @IsString()
  @MinLength(1)
  projectId: string;

  @IsString()
  @IsOptional()
  assigneeId?: string;

  @IsInt()
  @IsOptional()
  estimatedMinutes?: number;

  @ValidateIf((_, val) => val !== null)
  @ValidateNested()
  @Type(() => CreateRecurrenceDto)
  @IsOptional()
  recurrence?: CreateRecurrenceDto | null;
}
