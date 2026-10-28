import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsDate,
  Matches,
  IsBoolean,
  ValidateIf,
  ValidateNested,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateRecurrenceDto } from './create-task.dto';

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
  estimatedMinutes?: number;

  @IsString()
  @IsOptional()
  assigneeId?: string | null;

  // ODD 021 S9: mover la tarea de proyecto (string) o quitarla a express
  // (null). Ausente = sin cambio. La validación de destino vive en el servicio.
  @ValidateIf((_, val) => val !== null)
  @IsString()
  @MinLength(1)
  @IsOptional()
  projectId?: string | null;

  @ValidateIf((_, val) => val !== null)
  @ValidateNested()
  @Type(() => CreateRecurrenceDto)
  @IsOptional()
  recurrence?: CreateRecurrenceDto | null;
}
