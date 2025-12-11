import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { CreateObjectiveDto } from './create-objective.dto';

export class UpdateObjectiveDto extends PartialType(CreateObjectiveDto) {
  @IsEnum(['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'AT_RISK'])
  @IsOptional()
  status?: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'AT_RISK';

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  progress?: number;
}
