import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsDate,
  Matches,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  @IsOptional()
  status?: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  @IsOptional()
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dueDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  scheduledDate?: Date;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, {
    message: 'scheduledTime must be in HH:mm format',
  })
  @IsOptional()
  scheduledTime?: string | null;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, {
    message: 'scheduledEndTime must be in HH:mm format',
  })
  @IsOptional()
  scheduledEndTime?: string | null;

  @IsBoolean()
  @IsOptional()
  isTimeBlocked?: boolean;

  @IsNumber()
  @IsOptional()
  estimatedTime?: number;

  @IsString()
  @IsOptional()
  assigneeId?: string | null;
}
