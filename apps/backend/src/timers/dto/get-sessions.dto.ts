import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class GetSessionsDto {
  @IsOptional()
  @IsString()
  taskId?: string;

  @IsOptional()
  @IsEnum(['WORK', 'SHORT_BREAK', 'LONG_BREAK', 'CONTINUOUS'])
  type?: 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK' | 'CONTINUOUS';

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  completedOnly?: boolean;
}
