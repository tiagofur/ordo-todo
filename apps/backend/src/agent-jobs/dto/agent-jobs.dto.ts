import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAgentJobDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name: string;

  @IsString()
  @MinLength(3)
  @MaxLength(300)
  scheduleText: string;

  @IsString()
  @MinLength(3)
  @MaxLength(2000)
  taskPrompt: string;

  @IsOptional()
  @IsString()
  timezone?: string;
}

export class UpdateAgentJobDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(2000)
  taskPrompt?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
