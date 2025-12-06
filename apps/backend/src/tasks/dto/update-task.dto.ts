import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsDate,
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

  @IsNumber()
  @IsOptional()
  estimatedTime?: number;

  @IsString()
  @IsOptional()
  assigneeId?: string | null;
}
