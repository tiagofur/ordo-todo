import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  MaxLength,
} from 'class-validator';

export class CompleteHabitDto {
  @IsString()
  @MaxLength(500)
  @IsOptional()
  note?: string;

  @IsNumber()
  @IsOptional()
  value?: number;

  @IsDateString()
  @IsOptional()
  completedAt?: string;
}
