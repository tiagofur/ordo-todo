import {
  IsString,
  MinLength,
  MaxLength,
  IsEnum,
  IsOptional,
  IsInt,
  IsArray,
  Matches,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';

export class CreateHabitDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'color must be a valid hex color' })
  @IsOptional()
  color?: string;

  @IsEnum(['DAILY', 'WEEKLY', 'SPECIFIC_DAYS', 'MONTHLY'])
  @IsOptional()
  frequency?: 'DAILY' | 'WEEKLY' | 'SPECIFIC_DAYS' | 'MONTHLY';

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  targetDaysOfWeek?: number[];

  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  targetCount?: number;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, {
    message: 'preferredTime must be in HH:mm format',
  })
  @IsOptional()
  preferredTime?: string;

  @IsEnum(['MORNING', 'AFTERNOON', 'EVENING', 'ANYTIME'])
  @IsOptional()
  timeOfDay?: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'ANYTIME';

  @IsString()
  @IsOptional()
  workspaceId?: string;
}
