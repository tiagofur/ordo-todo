import {
  IsString,
  MinLength,
  MaxLength,
  IsEnum,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateKeyResultDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  description?: string;

  @IsEnum(['PERCENTAGE', 'NUMBER', 'CURRENCY', 'BOOLEAN', 'TASK_COUNT'])
  @IsOptional()
  metricType?: 'PERCENTAGE' | 'NUMBER' | 'CURRENCY' | 'BOOLEAN' | 'TASK_COUNT';

  @IsNumber()
  @Min(0)
  @IsOptional()
  startValue?: number;

  @IsNumber()
  targetValue: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  currentValue?: number;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  unit?: string;
}
